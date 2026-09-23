import "server-only";

import { getPendingArticles, updateArticleAnalyzedAt } from "../supabase/queries/articles";
import { getAnalysisByArticleId, upsertAnalysis } from "../supabase/queries/analyses";
import { createLog } from "../supabase/queries/logs";
import { analyzeArticleWithAi, generateArticleEmbedding } from "./analyzer";
import type { AnalyzeRunOptions, AnalysisSummary } from "./types";
import type { ArticleAnalysisInsert } from "../supabase/types";

/**
 * Runs the AI Article Analysis pipeline.
 * Adheres strictly to AGENTS.md Section 19.
 */
export async function runAnalysisPipeline(options: AnalyzeRunOptions = {}): Promise<AnalysisSummary> {
  const startTime = Date.now();
  const envBatchSize = parseInt(process.env.ANALYSIS_BATCH_SIZE || "5", 10);
  const batchSize = options.batchSize && options.batchSize > 0 ? options.batchSize : envBatchSize;

  console.log("=================================================");
  console.log(`[AI Pipeline] Starting article analysis run at ${new Date().toISOString()}`);
  console.log(`[AI Pipeline] Batch size: ${batchSize}`);
  if (options.limit) {
    console.log(`[AI Pipeline] Max articles limit: ${options.limit}`);
  }
  if (options.articleIds && options.articleIds.length > 0) {
    console.log(`[AI Pipeline] Targeted article IDs (${options.articleIds.length}): ${options.articleIds.join(", ")}`);
  }

  const summary: AnalysisSummary = {
    status: "completed",
    totalPending: 0,
    analyzedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    batchesProcessed: 0,
    totalDurationMs: 0,
    failures: [],
  };

  // 1. Fetch pending articles via LEFT JOIN check (Section 19 rule 1)
  let pendingArticles;
  try {
    pendingArticles = await getPendingArticles({
      limit: options.limit,
      articleIds: options.articleIds,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[AI Pipeline] Fatal: Failed to fetch pending articles: ${msg}`);
    summary.status = "failed";
    summary.totalDurationMs = Date.now() - startTime;
    await createLog("error", "AI Analysis pipeline failed to query pending articles", { error: msg });
    return summary;
  }

  summary.totalPending = pendingArticles.length;
  console.log(`[AI Pipeline] Pending articles identified: ${summary.totalPending}`);

  if (summary.totalPending === 0) {
    console.log("[AI Pipeline] No pending articles require analysis. Exiting cleanly.");
    summary.totalDurationMs = Date.now() - startTime;
    return summary;
  }

  // 2. Process in batches (Section 19 rule 2 & 3)
  const totalToProcess = options.limit && options.limit > 0
    ? Math.min(options.limit, pendingArticles.length)
    : pendingArticles.length;

  const articlesSlice = pendingArticles.slice(0, totalToProcess);

  for (let i = 0; i < articlesSlice.length; i += batchSize) {
    const batch = articlesSlice.slice(i, i + batchSize);
    summary.batchesProcessed++;
    console.log(`\n--- [AI Pipeline] Processing batch ${summary.batchesProcessed} (${batch.length} articles) ---`);

    for (const article of batch) {
      console.log(`[AI Pipeline] Analyzing article: "${article.title}" (${article.id})`);

      try {
        // Check if an analysis row already exists (embedding backfill case per AGENTS.md Section 20)
        const existingAnalysis = await getAnalysisByArticleId(article.id);

        if (existingAnalysis && existingAnalysis.summary && !existingAnalysis.embedding) {
          console.log(`[AI Pipeline] Article already analyzed, backfilling embedding: "${article.title}"`);
          const embeddingVector = await generateArticleEmbedding(article.title, article.raw_text);

          await upsertAnalysis({
            ...existingAnalysis,
            embedding: embeddingVector,
          });

          await updateArticleAnalyzedAt(article.id);
          summary.analyzedCount++;
          console.log(`[AI Pipeline] Successfully backfilled embedding for "${article.title}"`);
          continue;
        }

        // Full analysis flow: AI framing & sentiment analysis + pgvector embedding
        const analysisOutput = await analyzeArticleWithAi(article.title, article.raw_text);
        const embeddingVector = await generateArticleEmbedding(article.title, article.raw_text);

        // Prepare database insert payload (Section 19 & 20)
        const analysisInsert: ArticleAnalysisInsert = {
          article_id: article.id,
          summary: analysisOutput.summary,
          sentiment_score: analysisOutput.sentimentScore,
          sentiment_label: analysisOutput.sentimentLabel,
          bias_label: analysisOutput.politicalFramingLabel,
          left_percentage: analysisOutput.leftPercentage,
          center_percentage: analysisOutput.centerPercentage,
          right_percentage: analysisOutput.rightPercentage,
          bias_score: analysisOutput.biasScore,
          confidence: analysisOutput.confidence,
          framing_notes: analysisOutput.framingNotes,
          loaded_terms: analysisOutput.loadedTerms,
          disclaimer: analysisOutput.disclaimer,
          model: analysisOutput.model,
          embedding: embeddingVector,
        };

        // 4. Save analysis and embedding together
        await upsertAnalysis(analysisInsert);

        // 5. Mark analyzed_at ONLY after both analysis and embedding are saved (Section 20)
        await updateArticleAnalyzedAt(article.id);

        summary.analyzedCount++;
        console.log(
          `[AI Pipeline] Successfully analyzed, embedded & persisted for "${article.title}": sentiment=${analysisOutput.sentimentLabel} (${analysisOutput.sentimentScore}), framing=${analysisOutput.politicalFramingLabel} [L:${analysisOutput.leftPercentage}% C:${analysisOutput.centerPercentage}% R:${analysisOutput.rightPercentage}%], embedding=[${embeddingVector.length} dims]`
        );
      } catch (err: unknown) {
        summary.failedCount++;
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`[AI Pipeline] Failed to analyze/embed article ${article.id}: ${errMsg}`);
        summary.failures.push({
          articleId: article.id,
          title: article.title,
          error: errMsg,
        });
      }
    }

    console.log(
      `--- [AI Pipeline] Batch ${summary.batchesProcessed} finished: ${summary.analyzedCount} analyzed, ${summary.failedCount} failed so far ---`
    );
  }

  summary.totalDurationMs = Date.now() - startTime;
  if (summary.failedCount > 0 && summary.analyzedCount > 0) {
    summary.status = "partial";
  } else if (summary.failedCount > 0 && summary.analyzedCount === 0) {
    summary.status = "failed";
  } else {
    summary.status = "completed";
  }

  console.log("\n=================================================");
  console.log(`[AI Pipeline] Analysis pipeline finished in ${summary.totalDurationMs}ms`);
  console.log(`[AI Pipeline] Final Summary:`, JSON.stringify(summary, null, 2));
  console.log("=================================================\n");

  // 6. Record run log to Supabase logs table (Section 19 rule 7 & 9)
  await createLog(
    summary.failedCount === 0 ? "info" : "warn",
    `AI analysis run completed with ${summary.analyzedCount} articles analyzed and ${summary.failedCount} failed`,
    {
      totalPending: summary.totalPending,
      analyzedCount: summary.analyzedCount,
      failedCount: summary.failedCount,
      batchesProcessed: summary.batchesProcessed,
      durationMs: summary.totalDurationMs,
      failures: summary.failures,
    }
  );

  return summary;
}
