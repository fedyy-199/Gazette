import "server-only";

import {
  getSchedulesWithSources,
  getProcessedJobIds,
  recordScheduleRun,
  type ScheduleWithSource,
} from "../supabase/queries/schedules";
import { checkExistingUrls, insertArticles } from "../supabase/queries/articles";
import { createLog } from "../supabase/queries/logs";
import {
  getOxylabsScheduleRuns,
  getOxylabsJobResult,
  type OxylabsScheduledJob,
} from "../oxylabs/scheduler";
import { scrapeUrlViaOxylabs } from "../oxylabs/client";
import { extractHomepageArticleLinks } from "./parsers";
import { validateAndCleanArticle } from "./cleaner";
import type { ExtractedArticleData, ScrapeSummary } from "./types";
import type { ArticleInsert } from "../supabase/types";

export interface ScheduledProcessingOptions {
  limit?: number;
  scheduleIds?: string[];
}

export interface ScheduledProcessingSummary extends ScrapeSummary {
  schedulesChecked: number;
  runsInspected: number;
  jobsProcessed: number;
}

/**
 * Processes completed Oxylabs Scheduler job results.
 * Executes the canonical scrape-to-insert pipeline (AGENTS.md Section 9 & Section 18):
 * - Uses /runs, filtering to result_status === 'done'
 * - Skips already processed jobs
 * - Fetches homepage HTML from job results
 * - Extracts candidate links from visible story cards
 * - Filters URLs, dedupes, checks DB existence in chunks <= 15
 * - Scrapes detail pages with Oxylabs Realtime
 * - Validates via Article Content Gate
 * - Inserts valid articles append-only into Supabase
 * - Records job runs in oxylabs_schedule_runs
 */
export async function processScheduledResults(
  options: ScheduledProcessingOptions = {}
): Promise<ScheduledProcessingSummary> {
  const startTime = Date.now();
  const perSourceLimit = options.limit && options.limit > 0 ? options.limit : 5;

  console.log("=================================================");
  console.log(`[Scheduler Processor] Starting scheduled results run at ${new Date().toISOString()}`);
  console.log(`[Scheduler Processor] Per-source article limit = ${perSourceLimit}`);

  const summary: ScheduledProcessingSummary = {
    status: "completed",
    schedulesChecked: 0,
    runsInspected: 0,
    jobsProcessed: 0,
    sourcesChecked: 0,
    candidatesFound: 0,
    candidatesRejected: 0,
    duplicatesSkipped: 0,
    detailPagesScraped: 0,
    articlesInserted: 0,
    articlesRejected: 0,
    articlesFailed: 0,
    totalDurationMs: 0,
    rejectionReasons: {},
  };

  const recordRejection = (reason: string) => {
    summary.rejectionReasons[reason] = (summary.rejectionReasons[reason] || 0) + 1;
  };

  // 1. Fetch active schedules from Supabase
  let activeSchedules: ScheduleWithSource[] = [];
  try {
    const allSchedules = await getSchedulesWithSources();
    activeSchedules = allSchedules.filter((s) => s.status === "active");

    if (options.scheduleIds && options.scheduleIds.length > 0) {
      activeSchedules = activeSchedules.filter(
        (s) =>
          options.scheduleIds?.includes(s.id) ||
          options.scheduleIds?.includes(s.oxylabs_schedule_id)
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Scheduler Processor] Fatal: Failed to load schedules from Supabase: ${msg}`);
    summary.status = "failed";
    summary.totalDurationMs = Date.now() - startTime;
    await createLog("error", "Scheduler processor failed to load schedules", { error: msg });
    return summary;
  }

  if (activeSchedules.length === 0) {
    console.log("[Scheduler Processor] No active Oxylabs schedules found in Supabase.");
    summary.totalDurationMs = Date.now() - startTime;
    return summary;
  }

  console.log(
    `[Scheduler Processor] Active schedules loaded (${activeSchedules.length}): ${activeSchedules
      .map((s) => s.sources?.name || s.oxylabs_schedule_id)
      .join(", ")}`
  );

  // 2. Load already processed job IDs to prevent duplicate processing
  let processedJobIds = new Set<string>();
  try {
    processedJobIds = await getProcessedJobIds();
    console.log(`[Scheduler Processor] Known processed jobs count: ${processedJobIds.size}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Scheduler Processor] Could not load processed job IDs, continuing: ${msg}`);
  }

  // 3. Process each schedule sequentially
  for (const schedule of activeSchedules) {
    summary.schedulesChecked++;
    summary.sourcesChecked++;
    const sourceName = schedule.sources?.name || `Source(${schedule.source_id})`;
    const sourceListingUrl = schedule.sources?.listing_url || "";

    console.log(
      `\n--- [Scheduler Processor: ${sourceName}] Checking runs for schedule ${schedule.oxylabs_schedule_id} ---`
    );

    // Fetch schedule runs
    let runs;
    try {
      runs = await getOxylabsScheduleRuns(schedule.oxylabs_schedule_id);
      summary.runsInspected += runs.length;
      console.log(`[Scheduler Processor: ${sourceName}] Retrieved ${runs.length} runs.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `[Scheduler Processor: ${sourceName}] Error fetching runs for schedule ${schedule.oxylabs_schedule_id}: ${msg}`
      );
      recordRejection(`schedule_runs_fetch_error: ${sourceName}`);
      continue;
    }

    // Filter to jobs where result_status === 'done' and not yet processed (AGENTS.md Section 18)
    const newDoneJobs: OxylabsScheduledJob[] = [];
    for (const run of runs) {
      for (const job of run.jobs) {
        if (job.result_status === "done" && !processedJobIds.has(job.id)) {
          newDoneJobs.push(job);
        }
      }
    }

    if (newDoneJobs.length === 0) {
      console.log(`[Scheduler Processor: ${sourceName}] No new completed jobs to process.`);
      continue;
    }

    console.log(
      `[Scheduler Processor: ${sourceName}] Found ${newDoneJobs.length} new completed job(s) to process.`
    );

    // Process new completed jobs (taking the most recent ones if multiple)
    for (const job of newDoneJobs) {
      console.log(`[Scheduler Processor: ${sourceName}] Fetching results for job ${job.id}...`);

      let homepageHtml = "";
      try {
        const jobResult = await getOxylabsJobResult(job.id);
        homepageHtml = jobResult.content;
        summary.jobsProcessed++;
        console.log(
          `[Scheduler Processor: ${sourceName}] Fetched job result HTML (${homepageHtml.length} bytes).`
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
          `[Scheduler Processor: ${sourceName}] Failed to fetch result for job ${job.id}: ${msg}`
        );
        recordRejection(`job_result_fetch_error: ${job.id}`);
        continue;
      }

      // Step A: Extract candidate article card links from homepage HTML
      const candidateUrls = extractHomepageArticleLinks(
        homepageHtml,
        sourceListingUrl,
        null
      );

      summary.candidatesFound += candidateUrls.length;
      console.log(
        `[Scheduler Processor: ${sourceName}] Extracted ${candidateUrls.length} candidate card links.`
      );

      if (candidateUrls.length === 0) {
        console.warn(`[Scheduler Processor: ${sourceName}] No candidate links found in job HTML.`);
        // Mark job as recorded so we don't spin on it repeatedly
        await recordScheduleRun({
          schedule_id: schedule.id,
          oxylabs_job_id: job.id,
          status: "completed",
          result_status: "done",
          completed_at: new Date().toISOString(),
        }).catch((e) => console.warn("Failed recording schedule run:", e));
        processedJobIds.add(job.id);
        continue;
      }

      // Step B: Deduplicate in-memory
      const uniqueCandidates = Array.from(new Set(candidateUrls));
      const inMemoryDups = candidateUrls.length - uniqueCandidates.length;
      if (inMemoryDups > 0) {
        summary.duplicatesSkipped += inMemoryDups;
      }

      // Step C: Supabase URL existence check in chunks <= 15 (AGENTS.md Section 9)
      let existingUrls: Set<string>;
      try {
        existingUrls = await checkExistingUrls(uniqueCandidates);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[Scheduler Processor: ${sourceName}] URL check error: ${msg}`);
        continue;
      }

      const freshCandidateUrls = uniqueCandidates.filter((url) => !existingUrls.has(url));
      const dbDuplicates = uniqueCandidates.length - freshCandidateUrls.length;
      summary.duplicatesSkipped += dbDuplicates;

      console.log(
        `[Scheduler Processor: ${sourceName}] URL check: ${dbDuplicates} existing skipped, ${freshCandidateUrls.length} fresh.`
      );

      // Select candidate URLs up to perSourceLimit
      const urlsToScrape = freshCandidateUrls.slice(0, perSourceLimit);
      const validArticlesForSource: ExtractedArticleData[] = [];

      // Step D: Scrape detail pages and validate through Article Content Gate
      for (const url of urlsToScrape) {
        summary.detailPagesScraped++;
        console.log(`[Scheduler Processor: ${sourceName}] Scraping detail page: ${url}`);

        try {
          const detailResult = await scrapeUrlViaOxylabs(url);
          const validation = validateAndCleanArticle(detailResult.content, url, schedule.source_id);

          if (!validation.isValid || !validation.data) {
            const reason = validation.rejectionReason || "validation_failed";
            summary.articlesRejected++;
            recordRejection(reason);
            console.warn(`[Scheduler Processor: ${sourceName}] Article rejected: ${reason} (${url})`);
            continue;
          }

          validArticlesForSource.push(validation.data);
          console.log(
            `[Scheduler Processor: ${sourceName}] Valid article accepted: "${validation.data.title}"`
          );
        } catch (err: unknown) {
          summary.articlesFailed++;
          const msg = err instanceof Error ? err.message : String(err);
          recordRejection(`detail_scrape_error: ${msg}`);
          console.error(`[Scheduler Processor: ${sourceName}] Error scraping article ${url}: ${msg}`);
        }
      }

      // Step E: Append-only insertion into Supabase articles table
      if (validArticlesForSource.length > 0) {
        try {
          const insertPayload: ArticleInsert[] = validArticlesForSource.map((a) => ({
            source_id: a.sourceId,
            original_url: a.originalUrl,
            canonical_url: a.canonicalUrl,
            title: a.title,
            image_url: a.imageUrl,
            published_at: a.publishedAt,
            raw_text: a.rawText,
          }));

          const inserted = await insertArticles(insertPayload);
          summary.articlesInserted += inserted.length;
          console.log(
            `[Scheduler Processor: ${sourceName}] Successfully inserted ${inserted.length} new articles.`
          );
        } catch (err: unknown) {
          summary.articlesFailed += validArticlesForSource.length;
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[Scheduler Processor: ${sourceName}] Failed inserting articles: ${msg}`);
          recordRejection(`db_insert_error: ${msg}`);
        }
      }

      // Step F: Record job as processed in oxylabs_schedule_runs
      try {
        await recordScheduleRun({
          schedule_id: schedule.id,
          oxylabs_job_id: job.id,
          status: "completed",
          result_status: "done",
          completed_at: new Date().toISOString(),
        });
        processedJobIds.add(job.id);
        console.log(`[Scheduler Processor: ${sourceName}] Recorded job ${job.id} run in Supabase.`);
      } catch (err: unknown) {
        console.warn(`[Scheduler Processor: ${sourceName}] Could not record run in DB:`, err);
      }
    }
  }

  summary.totalDurationMs = Date.now() - startTime;

  console.log("\n=================================================");
  console.log(`[Scheduler Processor] Run finished in ${summary.totalDurationMs}ms`);
  console.log(`[Scheduler Processor] Summary:`, JSON.stringify(summary, null, 2));
  console.log("=================================================\n");

  // Log final summary to Supabase logs table (AGENTS.md Section 9)
  await createLog(
    summary.articlesInserted > 0 ? "info" : "warn",
    `Oxylabs scheduler run processed with ${summary.articlesInserted} articles inserted`,
    {
      schedulesChecked: summary.schedulesChecked,
      jobsProcessed: summary.jobsProcessed,
      duplicatesSkipped: summary.duplicatesSkipped,
      detailPagesScraped: summary.detailPagesScraped,
      articlesInserted: summary.articlesInserted,
      articlesRejected: summary.articlesRejected,
      articlesFailed: summary.articlesFailed,
      durationMs: summary.totalDurationMs,
      rejectionReasons: summary.rejectionReasons,
    }
  );

  return summary;
}
