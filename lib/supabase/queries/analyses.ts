import { supabaseAdmin } from "../admin";
import type { ArticleAnalysis, ArticleAnalysisInsert } from "../types";

/**
 * Fetch analysis by article ID.
 */
export async function getAnalysisByArticleId(articleId: string): Promise<ArticleAnalysis | null> {
  const { data, error } = await supabaseAdmin
    .from("article_analyses")
    .select("*")
    .eq("article_id", articleId)
    .maybeSingle();

  if (error) {
    console.error(`[Supabase:getAnalysisByArticleId] Error fetching analysis for article ${articleId}:`, error);
    throw new Error(`Failed to fetch article analysis: ${error.message}`);
  }

  return data;
}

/**
 * Insert new article analysis.
 */
export async function insertAnalysis(analysis: ArticleAnalysisInsert): Promise<ArticleAnalysis> {
  const { data, error } = await supabaseAdmin
    .from("article_analyses")
    .insert(analysis)
    .select()
    .single();

  if (error) {
    console.error("[Supabase:insertAnalysis] Error inserting analysis:", error);
    throw new Error(`Failed to insert article analysis: ${error.message}`);
  }

  return data;
}

/**
 * Upsert an article analysis (insert or update on conflict on article_id).
 */
export async function upsertAnalysis(analysis: ArticleAnalysisInsert): Promise<ArticleAnalysis> {
  const { data, error } = await supabaseAdmin
    .from("article_analyses")
    .upsert(analysis, { onConflict: "article_id" })
    .select()
    .single();

  if (error) {
    console.error("[Supabase:upsertAnalysis] Error upserting analysis:", error);
    throw new Error(`Failed to upsert article analysis: ${error.message}`);
  }

  return data;
}
