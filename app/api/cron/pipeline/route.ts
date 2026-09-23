import { NextRequest, NextResponse } from "next/server";
import { processScheduledResults } from "@/lib/scraper/scheduler-processor";
import { runAnalysisPipeline } from "@/lib/ai/pipeline";

/**
 * GET /api/cron/pipeline
 * Automatic hourly pipeline route chaining Oxylabs scheduled results processing
 * and AI analysis.
 * Adheres strictly to AGENTS.md Section 14 & 18.
 * 
 * - Internal only: called by Vercel Cron.
 * - In production: protected by CRON_SECRET header (Bearer auth).
 * - In local development: skips secret check for direct browser/curl testing.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  // Check CRON_SECRET if configured and in production (AGENTS.md Section 18)
  if (!isDev && cronSecret) {
    const authHeader = request.headers.get("authorization");
    const expectedBearer = `Bearer ${cronSecret}`;

    if (authHeader !== expectedBearer) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing CRON_SECRET" },
        { status: 401 }
      );
    }
  }

  console.log("=================================================");
  console.log(`[Cron Pipeline] Starting automatic hourly pipeline at ${new Date().toISOString()}`);
  console.log("=================================================");

  // Step 1: Process completed Oxylabs scheduled results (Section 18 rule 4)
  let schedulerSummary;
  try {
    console.log("[Cron Pipeline] Step 1: Processing Oxylabs scheduled results...");
    schedulerSummary = await processScheduledResults();
    console.log(
      `[Cron Pipeline] Step 1 complete: ${schedulerSummary.articlesInserted} new articles inserted.`
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Cron Pipeline] Step 1 (Scheduled Results) encountered an error:", msg);
    schedulerSummary = { status: "failed", error: msg };
  }

  // Step 2: Immediately run AI analysis on pending articles (Section 18 rule 5 & 6)
  // Runs even if Step 1 failed or yielded 0 articles.
  let analysisSummary;
  try {
    console.log("[Cron Pipeline] Step 2: Running AI analysis on pending articles...");
    analysisSummary = await runAnalysisPipeline();
    console.log(
      `[Cron Pipeline] Step 2 complete: ${analysisSummary.analyzedCount} articles analyzed.`
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Cron Pipeline] Step 2 (Analysis) encountered an error:", msg);
    analysisSummary = { status: "failed", error: msg };
  }

  const responsePayload = {
    status: "completed",
    timestamp: new Date().toISOString(),
    scheduledResults: schedulerSummary,
    analysis: analysisSummary,
  };

  return NextResponse.json(responsePayload, { status: 200 });
}
