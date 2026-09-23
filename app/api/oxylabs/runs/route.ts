import { NextRequest, NextResponse } from "next/server";
import { getScheduleRuns } from "@/lib/supabase/queries/schedules";
import { getOxylabsScheduleRuns } from "@/lib/oxylabs/scheduler";

/**
 * GET /api/oxylabs/runs
 * Read-only status route returning schedule run records.
 * Supports:
 * - Default: returns recent runs from Supabase oxylabs_schedule_runs table.
 * - ?schedule_id=<id>&live=true: queries live runs directly from Oxylabs API.
 * Adheres to AGENTS.md Section 14.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scheduleId = searchParams.get("schedule_id");
  const live = searchParams.get("live") === "true";

  try {
    if (scheduleId && live) {
      const runs = await getOxylabsScheduleRuns(scheduleId);
      return NextResponse.json({
        status: "success",
        source: "oxylabs_live",
        scheduleId,
        count: runs.length,
        runs,
      });
    }

    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const runs = await getScheduleRuns(limit);

    return NextResponse.json({
      status: "success",
      source: "database",
      count: runs.length,
      runs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[API:GET /api/oxylabs/runs] Error:", msg);
    return NextResponse.json(
      { error: `Failed to fetch runs: ${msg}` },
      { status: 500 }
    );
  }
}
