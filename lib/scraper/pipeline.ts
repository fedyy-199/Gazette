import "server-only";

import { getActiveSources } from "../supabase/queries/sources";
import { checkExistingUrls, insertArticles } from "../supabase/queries/articles";
import { createLog } from "../supabase/queries/logs";
import { scrapeUrlViaOxylabs } from "../oxylabs/client";
import { extractHomepageArticleLinks } from "./parsers";
import { validateAndCleanArticle } from "./cleaner";
import type { ScrapeRunOptions, ScrapeSummary, ExtractedArticleData } from "./types";
import type { ArticleInsert, Source } from "../supabase/types";

/**
 * Runs the Gazette Oxylabs Web Scraping pipeline.
 * Canonical scrape-to-insert pipeline adhering to AGENTS.md Sections 8, 9, 10, 11, 12, 13, 16.
 */
export async function runScrapePipeline(options: ScrapeRunOptions = {}): Promise<ScrapeSummary> {
  const startTime = Date.now();
  const perSourceLimit = options.limit && options.limit > 0 ? options.limit : 5;

  console.log("=================================================");
  console.log(`[Scraper] Starting scrape run at ${new Date().toISOString()}`);
  console.log(`[Scraper] Config: per-source limit = ${perSourceLimit}`);
  if (options.sources && options.sources.length > 0) {
    console.log(`[Scraper] Targeted sources: ${options.sources.join(", ")}`);
  }

  // Summary accumulator
  const summary: ScrapeSummary = {
    status: "completed",
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

  // 1. Load active sources from Supabase
  let activeSources: Source[] = [];
  try {
    const allActive = await getActiveSources();
    if (options.sources && options.sources.length > 0) {
      const lowerNames = options.sources.map((s) => s.toLowerCase());
      activeSources = allActive.filter(
        (src) =>
          lowerNames.includes(src.name.toLowerCase()) ||
          lowerNames.includes(src.id.toLowerCase())
      );
    } else {
      activeSources = allActive;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Scraper] Fatal: Failed to load sources from Supabase: ${msg}`);
    summary.status = "failed";
    summary.totalDurationMs = Date.now() - startTime;
    await createLog("error", "Scraper failed to load active sources", { error: msg });
    return summary;
  }

  if (activeSources.length === 0) {
    console.warn("[Scraper] No active sources found matching criteria.");
    summary.status = "completed";
    summary.totalDurationMs = Date.now() - startTime;
    return summary;
  }

  console.log(`[Scraper] Active sources loaded (${activeSources.length}): ${activeSources.map((s) => s.name).join(", ")}`);

  // Process sources sequentially to respect rate limits and keep logging clear
  for (const source of activeSources) {
    summary.sourcesChecked++;
    console.log(`\n--- [Scraper: ${source.name}] Starting homepage scrape: ${source.listing_url} ---`);

    let homepageHtml = "";
    try {
      const result = await scrapeUrlViaOxylabs(source.listing_url, {
        render: options.render,
      });
      homepageHtml = result.content;
      console.log(`[Scraper: ${source.name}] Homepage fetched successfully (${homepageHtml.length} bytes)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Scraper: ${source.name}] Error fetching homepage: ${msg}`);
      recordRejection(`homepage_fetch_error: ${source.name}`);
      continue;
    }

    // 2. Extract candidate article card links
    const candidateUrls = extractHomepageArticleLinks(
      homepageHtml,
      source.listing_url,
      source.parser_strategy
    );

    summary.candidatesFound += candidateUrls.length;
    console.log(`[Scraper: ${source.name}] Candidate article links extracted: ${candidateUrls.length}`);

    if (candidateUrls.length === 0) {
      console.warn(`[Scraper: ${source.name}] No valid candidate links found on homepage.`);
      continue;
    }

    // 3. Deduplication: in-memory and database existence check
    const uniqueCandidates = Array.from(new Set(candidateUrls));
    const inMemoryDuplicates = candidateUrls.length - uniqueCandidates.length;
    if (inMemoryDuplicates > 0) {
      summary.duplicatesSkipped += inMemoryDuplicates;
      console.log(`[Scraper: ${source.name}] In-memory duplicates skipped: ${inMemoryDuplicates}`);
    }

    // URL existence check in chunks of <= 15 URLs (AGENTS.md Section 9)
    let existingUrls: Set<string>;
    try {
      existingUrls = await checkExistingUrls(uniqueCandidates);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Scraper: ${source.name}] Failed checking URL existence: ${msg}`);
      continue;
    }

    const freshCandidateUrls = uniqueCandidates.filter((url) => !existingUrls.has(url));
    const dbDuplicates = uniqueCandidates.length - freshCandidateUrls.length;
    summary.duplicatesSkipped += dbDuplicates;

    console.log(
      `[Scraper: ${source.name}] Database check: ${dbDuplicates} already exist in Supabase, ${freshCandidateUrls.length} new candidates.`
    );

    // Select candidate URLs up to perSourceLimit
    const urlsToScrape = freshCandidateUrls.slice(0, perSourceLimit);
    console.log(
      `[Scraper: ${source.name}] Selected ${urlsToScrape.length} candidate URLs for detail scraping.`
    );

    const validArticlesForSource: ExtractedArticleData[] = [];

    // 4. Detail scraping and article validation
    for (const url of urlsToScrape) {
      summary.detailPagesScraped++;
      console.log(`[Scraper: ${source.name}] Scraping detail page: ${url}`);

      try {
        const detailResult = await scrapeUrlViaOxylabs(url, {
          render: options.render,
        });

        // Validate and clean article (passes through Article Content Gate)
        const validation = validateAndCleanArticle(detailResult.content, url, source.id);

        if (!validation.isValid || !validation.data) {
          const reason = validation.rejectionReason || "validation_failed";
          summary.articlesRejected++;
          recordRejection(reason);
          console.warn(`[Scraper: ${source.name}] Article rejected: ${reason} (${url})`);
          continue;
        }

        validArticlesForSource.push(validation.data);
        console.log(`[Scraper: ${source.name}] Article validated successfully: "${validation.data.title}"`);
      } catch (err: unknown) {
        summary.articlesFailed++;
        const msg = err instanceof Error ? err.message : String(err);
        recordRejection(`detail_scrape_error: ${msg}`);
        console.error(`[Scraper: ${source.name}] Error scraping article ${url}: ${msg}`);
      }
    }

    // 5. Append-only insertion into Supabase (AGENTS.md Section 10)
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
          `[Scraper: ${source.name}] Successfully inserted ${inserted.length} articles into Supabase.`
        );
      } catch (err: unknown) {
        summary.articlesFailed += validArticlesForSource.length;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[Scraper: ${source.name}] Database insertion failed: ${msg}`);
        recordRejection(`db_insert_error: ${msg}`);
      }
    } else {
      console.log(`[Scraper: ${source.name}] No valid articles to insert for this source.`);
    }
  }

  summary.totalDurationMs = Date.now() - startTime;

  console.log("\n=================================================");
  console.log(`[Scraper] Scrape pipeline finished in ${summary.totalDurationMs}ms`);
  console.log(`[Scraper] Summary:`, JSON.stringify(summary, null, 2));
  console.log("=================================================\n");

  // Log final summary to Supabase logs table (AGENTS.md Section 9)
  await createLog(
    summary.articlesInserted > 0 ? "info" : "warn",
    `Oxylabs scrape run completed with ${summary.articlesInserted} articles inserted`,
    {
      sourcesChecked: summary.sourcesChecked,
      candidatesFound: summary.candidatesFound,
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
