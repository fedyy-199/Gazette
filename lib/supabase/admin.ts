import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-only Supabase admin client.
 * Uses the service role key to bypass Row Level Security (RLS) for scraping,
 * pipeline orchestration, AI analysis, logging, and scheduled task management.
 * 
 * NEVER import this file in client components.
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseServiceRoleKey || "placeholder-service-role-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      "[Supabase Admin] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in environment."
    );
  }
  return supabaseAdmin;
}
