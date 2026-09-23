import { supabaseAdmin } from "../admin";
import type { Source, SourceInsert, SourceUpdate } from "../types";

/**
 * Fetch all active news sources stored in Supabase.
 * Per AGENTS.md Section 7 & 8: Scraping and scheduler must load active sources from this table.
 */
export async function getActiveSources(): Promise<Source[]> {
  const { data, error } = await supabaseAdmin
    .from("sources")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("[Supabase:getActiveSources] Error fetching active sources:", error);
    throw new Error(`Failed to fetch active sources: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch all sources regardless of status.
 */
export async function getAllSources(): Promise<Source[]> {
  const { data, error } = await supabaseAdmin
    .from("sources")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[Supabase:getAllSources] Error fetching sources:", error);
    throw new Error(`Failed to fetch sources: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single source by its ID.
 */
export async function getSourceById(id: string): Promise<Source | null> {
  const { data, error } = await supabaseAdmin
    .from("sources")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error(`[Supabase:getSourceById] Error fetching source ${id}:`, error);
    throw new Error(`Failed to fetch source: ${error.message}`);
  }

  return data;
}

/**
 * Fetch a single source by name (case-insensitive).
 */
export async function getSourceByName(name: string): Promise<Source | null> {
  const { data, error } = await supabaseAdmin
    .from("sources")
    .select("*")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`[Supabase:getSourceByName] Error fetching source ${name}:`, error);
    throw new Error(`Failed to fetch source: ${error.message}`);
  }

  return data;
}

/**
 * Insert or upsert a new source.
 */
export async function insertSource(source: SourceInsert): Promise<Source> {
  const { data, error } = await supabaseAdmin
    .from("sources")
    .insert(source)
    .select()
    .single();

  if (error) {
    console.error("[Supabase:insertSource] Error inserting source:", error);
    throw new Error(`Failed to insert source: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing source.
 */
export async function updateSource(id: string, updates: SourceUpdate): Promise<Source> {
  const { data, error } = await supabaseAdmin
    .from("sources")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`[Supabase:updateSource] Error updating source ${id}:`, error);
    throw new Error(`Failed to update source: ${error.message}`);
  }

  return data;
}
