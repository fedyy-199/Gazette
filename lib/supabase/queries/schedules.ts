import { supabaseAdmin } from "../admin";
import type {
  OxylabsSchedule,
  OxylabsScheduleInsert,
  OxylabsScheduleRun,
  OxylabsScheduleRunInsert,
} from "../types";

export interface ScheduleWithSource extends OxylabsSchedule {
  sources?: {
    id: string;
    name: string;
    listing_url: string;
  } | null;
}

/**
 * Fetch all registered Oxylabs schedules.
 */
export async function getSchedules(): Promise<OxylabsSchedule[]> {
  const { data, error } = await supabaseAdmin
    .from("oxylabs_schedules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase:getSchedules] Error fetching schedules:", error);
    throw new Error(`Failed to fetch schedules: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch all schedules joined with source metadata.
 */
export async function getSchedulesWithSources(): Promise<ScheduleWithSource[]> {
  const { data, error } = await supabaseAdmin
    .from("oxylabs_schedules")
    .select("*, sources(id, name, listing_url)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase:getSchedulesWithSources] Error fetching schedules with sources:", error);
    throw new Error(`Failed to fetch schedules with sources: ${error.message}`);
  }

  return (data as unknown as ScheduleWithSource[]) || [];
}

/**
 * Fetch schedule for a specific source.
 */
export async function getScheduleBySourceId(sourceId: string): Promise<OxylabsSchedule | null> {
  const { data, error } = await supabaseAdmin
    .from("oxylabs_schedules")
    .select("*")
    .eq("source_id", sourceId)
    .maybeSingle();

  if (error) {
    console.error(`[Supabase:getScheduleBySourceId] Error fetching schedule for source ${sourceId}:`, error);
    throw new Error(`Failed to fetch schedule: ${error.message}`);
  }

  return data;
}

/**
 * Upsert an Oxylabs schedule.
 */
export async function upsertSchedule(schedule: OxylabsScheduleInsert): Promise<OxylabsSchedule> {
  const { data, error } = await supabaseAdmin
    .from("oxylabs_schedules")
    .upsert(schedule, { onConflict: "oxylabs_schedule_id" })
    .select()
    .single();

  if (error) {
    console.error("[Supabase:upsertSchedule] Error upserting schedule:", error);
    throw new Error(`Failed to upsert schedule: ${error.message}`);
  }

  return data;
}

/**
 * Fetch set of all processed Oxylabs job IDs to avoid duplicate processing.
 */
export async function getProcessedJobIds(scheduleDbId?: string): Promise<Set<string>> {
  let query = supabaseAdmin
    .from("oxylabs_schedule_runs")
    .select("oxylabs_job_id")
    .not("oxylabs_job_id", "is", null);

  if (scheduleDbId) {
    query = query.eq("schedule_id", scheduleDbId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[Supabase:getProcessedJobIds] Error fetching processed job IDs:", error);
    return new Set<string>();
  }

  const ids = new Set<string>();
  for (const row of data || []) {
    if (row.oxylabs_job_id) {
      ids.add(row.oxylabs_job_id);
    }
  }

  return ids;
}

/**
 * Fetch all oxylabs_schedule_id strings currently stored in Supabase.
 */
export async function getAllRegisteredScheduleIds(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("oxylabs_schedules")
    .select("oxylabs_schedule_id");

  if (error) {
    console.error("[Supabase:getAllRegisteredScheduleIds] Error:", error);
    throw new Error(`Failed to fetch registered schedule IDs: ${error.message}`);
  }

  return (data || []).map((row) => row.oxylabs_schedule_id);
}

/**
 * Record the start or completion of a schedule run.
 */
export async function recordScheduleRun(run: OxylabsScheduleRunInsert): Promise<OxylabsScheduleRun> {
  const { data, error } = await supabaseAdmin
    .from("oxylabs_schedule_runs")
    .insert(run)
    .select()
    .single();

  if (error) {
    console.error("[Supabase:recordScheduleRun] Error recording schedule run:", error);
    throw new Error(`Failed to record schedule run: ${error.message}`);
  }

  return data;
}

/**
 * Update the status of a schedule run when completed.
 */
export async function updateScheduleRun(
  id: string,
  updates: Partial<OxylabsScheduleRun>
): Promise<OxylabsScheduleRun> {
  const { data, error } = await supabaseAdmin
    .from("oxylabs_schedule_runs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`[Supabase:updateScheduleRun] Error updating schedule run ${id}:`, error);
    throw new Error(`Failed to update schedule run: ${error.message}`);
  }

  return data;
}

/**
 * Fetch recorded runs, optionally ordered and limited.
 */
export async function getScheduleRuns(limit = 50): Promise<OxylabsScheduleRun[]> {
  const { data, error } = await supabaseAdmin
    .from("oxylabs_schedule_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Supabase:getScheduleRuns] Error fetching schedule runs:", error);
    throw new Error(`Failed to fetch schedule runs: ${error.message}`);
  }

  return data || [];
}
