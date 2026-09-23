import { NextRequest, NextResponse } from "next/server";
import { processScheduledResults } from "@/lib/scraper/scheduler-processor";

/**
 * POST /api/oxylabs/scheduled-results/process
 * On-demand processing of completed Oxylabs Scheduler job results.
 * Adheres to AGENTS.md Section 14, 15, 18.
 * Requires x-gazette-admin-secret header.
 */
export async function POST(request: NextRequest) {
  const adminSecret = process.env.GAZETTE_ADMIN_SECRET;
  const authHeader = request.headers.get("x-gazette-admin-secret");

  if (!adminSecret || authHeader !== adminSecret) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid x-gazette-admin-secret header" },
      { status: 401 }
    );
  }

  let body: { limit?: number; scheduleIds?: string[] } = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch {
    // Empty or non-JSON body is acceptable; defaults will apply
  }

  try {
    const summary = await processScheduledResults({
      limit: body.limit,
      scheduleIds: body.scheduleIds,
    });

    return NextResponse.json(summary, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[API:POST /api/oxylabs/scheduled-results/process] Error:", msg);
    return NextResponse.json(
      { error: `Processing scheduled results failed: ${msg}` },
      { status: 500 }
    );
  }
}
