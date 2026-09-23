import { supabaseAdmin } from "../admin";
import type { Json, Log, LogInsert, LogLevel } from "../types";

/**
 * Record a pipeline or scraping log into the Supabase database.
 */
export async function createLog(
  level: LogLevel,
  message: string,
  context?: Record<string, Json>
): Promise<Log | null> {
  try {
    const logEntry: LogInsert = {
      level,
      message,
      context: context ?? null,
    };

    const { data, error } = await supabaseAdmin
      .from("logs")
      .insert(logEntry)
      .select()
      .single();

    if (error) {
      // Non-blocking fallback to standard console error to avoid stopping core pipelines on log failures
      console.error("[Supabase:createLog] Failed to persist log entry:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[Supabase:createLog] Unexpected error logging to database:", err);
    return null;
  }
}

/**
 * Fetch recent logs ordered by timestamp.
 */
export async function getRecentLogs(limit = 50, level?: LogLevel): Promise<Log[]> {
  let query = supabaseAdmin
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (level) {
    query = query.eq("level", level);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Supabase:getRecentLogs] Error fetching logs:", error);
    throw new Error(`Failed to fetch logs: ${error.message}`);
  }

  return data || [];
}
