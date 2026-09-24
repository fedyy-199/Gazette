import { NextRequest, NextResponse } from "next/server";
import { getActiveSources } from "@/lib/supabase/queries/sources";
import {
  getSchedulesWithSources,
  upsertSchedule,
  getAllRegisteredScheduleIds,
} from "@/lib/supabase/queries/schedules";
import { createLog } from "@/lib/supabase/queries/logs";
import {
  createOxylabsSchedule,
  getAllOxylabsScheduleIds,
  setOxylabsScheduleState,
} from "@/lib/oxylabs/scheduler";

/**
 * GET /api/oxylabs/schedules
 * Read-only status route returning all registered Oxylabs schedules with source metadata.
 * Adheres to AGENTS.md Section 14.
 */
export async function GET() {
  try {
    const schedules = await getSchedulesWithSources();
    return NextResponse.json({
      status: "success",
      count: schedules.length,
      schedules,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[API:GET /api/oxylabs/schedules] Error:", msg);
    return NextResponse.json(
      { error: `Failed to fetch schedules: ${msg}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/oxylabs/schedules
 * Syncs active sources to Oxylabs daily schedules and cleans up orphan schedules.
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

  console.log("=================================================");
  console.log(`[API:POST /api/oxylabs/schedules] Syncing schedules at ${new Date().toISOString()}`);

  const DAILY_CRON = "0 0 * * *";

  try {
    // 1. Fetch active sources from Supabase
    const activeSources = await getActiveSources();
    const existingSchedules = await getSchedulesWithSources();
    const activeSchedulesBySourceId = new Map(
      existingSchedules
        .filter((s) => s.status === "active")
        .map((s) => [s.source_id, s])
    );

    const createdSchedules: Array<{
      sourceName: string;
      sourceId: string;
      oxylabsScheduleId: string;
    }> = [];

    const existingValid: Array<{
      sourceName: string;
      sourceId: string;
      oxylabsScheduleId: string;
    }> = [];

    // 2. Create or update daily schedule for active sources
    for (const source of activeSources) {
      const existing = activeSchedulesBySourceId.get(source.id);
      if (existing && existing.cron === DAILY_CRON) {
        existingValid.push({
          sourceName: source.name,
          sourceId: source.id,
          oxylabsScheduleId: existing.oxylabs_schedule_id,
        });
        continue;
      }

      // If existing schedule has an outdated cron (e.g. legacy hourly), deactivate it on Oxylabs
      if (existing && existing.cron !== DAILY_CRON) {
        console.log(
          `[API:Sync Schedules] Updating schedule for ${source.name} from "${existing.cron}" to "${DAILY_CRON}"...`
        );
        try {
          await setOxylabsScheduleState(existing.oxylabs_schedule_id, false);
        } catch (deactivateErr) {
          console.warn(
            `[API:Sync Schedules] Could not deactivate outdated schedule ${existing.oxylabs_schedule_id}:`,
            deactivateErr
          );
        }
      } else {
        console.log(`[API:Sync Schedules] Creating daily schedule for ${source.name} (${source.listing_url})...`);
      }

      try {
        const created = await createOxylabsSchedule(source.listing_url, DAILY_CRON);
        await upsertSchedule({
          source_id: source.id,
          oxylabs_schedule_id: created.schedule_id,
          cron: DAILY_CRON,
          status: "active",
        });

        createdSchedules.push({
          sourceName: source.name,
          sourceId: source.id,
          oxylabsScheduleId: created.schedule_id,
        });
        console.log(`[API:Sync Schedules] Registered daily schedule ID ${created.schedule_id} for ${source.name}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[API:Sync Schedules] Failed to create schedule for ${source.name}: ${msg}`);
      }
    }

    // 3. Orphan schedule deactivation (AGENTS.md Section 18)
    // List all Oxylabs schedules, compare against DB, deactivate any not in DB
    const allDbScheduleIds = new Set(await getAllRegisteredScheduleIds());
    let deactivatedOrphansCount = 0;
    const deactivatedOrphanIds: string[] = [];

    try {
      const allOxylabsIds = await getAllOxylabsScheduleIds();
      console.log(`[API:Sync Schedules] Oxylabs total schedules found: ${allOxylabsIds.length}`);

      for (const oxylabsId of allOxylabsIds) {
        if (!allDbScheduleIds.has(oxylabsId)) {
          console.log(`[API:Sync Schedules] Deactivating orphan schedule on Oxylabs: ${oxylabsId}`);
          try {
            await setOxylabsScheduleState(oxylabsId, false);
            deactivatedOrphansCount++;
            deactivatedOrphanIds.push(oxylabsId);
          } catch (deactivateErr) {
            console.warn(`[API:Sync Schedules] Could not deactivate orphan ${oxylabsId}:`, deactivateErr);
          }
        }
      }
    } catch (orphanErr) {
      console.error("[API:Sync Schedules] Error during orphan schedule check:", orphanErr);
    }

    await createLog("info", "Synced Oxylabs schedules", {
      activeSourcesCount: activeSources.length,
      createdCount: createdSchedules.length,
      existingCount: existingValid.length,
      deactivatedOrphansCount,
    });

    console.log("=================================================\n");

    return NextResponse.json({
      status: "completed",
      activeSourcesCount: activeSources.length,
      createdSchedules,
      existingSchedules: existingValid,
      deactivatedOrphansCount,
      deactivatedOrphanIds,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[API:POST /api/oxylabs/schedules] Fatal error:", msg);
    return NextResponse.json(
      { error: `Schedule sync failed: ${msg}` },
      { status: 500 }
    );
  }
}
