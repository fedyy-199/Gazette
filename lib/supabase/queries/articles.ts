import { supabaseAdmin } from "../admin";
import type {
  Article,
  ArticleInsert,
  ArticleWithAnalysis,
  ArticleWithSimilarity,
} from "../types";

/**
 * URL existence check (AGENTS.md Section 9 & 16):
 * Queries Supabase in chunks of at most 15 URLs to prevent query overflow,
 * returning a set of URLs that already exist in the database for deduplication.
 */
export async function checkExistingUrls(urls: string[]): Promise<Set<string>> {
  if (!urls || urls.length === 0) {
    return new Set();
  }

  const existingUrls = new Set<string>();
  const CHUNK_SIZE = 15; // Strict rule: never pass more than 15 URLs to a single .in() filter

  for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
    const chunk = urls.slice(i, i + CHUNK_SIZE);
    const { data, error } = await supabaseAdmin
      .from("articles")
      .select("original_url")
      .in("original_url", chunk);

    if (error) {
      console.error("[Supabase:checkExistingUrls] Error checking URLs chunk:", error);
      throw new Error(`Failed to check existing URLs: ${error.message}`);
    }

    if (data) {
      data.forEach((row) => existingUrls.add(row.original_url));
    }
  }

  return existingUrls;
}

export interface PendingArticlesOptions {
  limit?: number;
  articleIds?: string[];
}

/**
 * Pending-analysis check (AGENTS.md Section 19 & 20):
 * Detects pending articles by LEFT JOINing articles to article_analyses.
 * An article is pending when:
 * 1. No article_analyses row exists for it, OR
 * 2. An article_analyses row exists but has embedding IS NULL (for embedding backfill per Section 20)
 * Never relies on analyzed_at IS NULL alone.
 */
export async function getPendingArticles(
  optionsOrLimit?: PendingArticlesOptions | number
): Promise<Article[]> {
  const options: PendingArticlesOptions =
    typeof optionsOrLimit === "number"
      ? { limit: optionsOrLimit }
      : optionsOrLimit || {};

  const { limit, articleIds } = options;

  let query = supabaseAdmin
    .from("articles")
    .select("*, article_analyses(id, embedding)")
    .order("published_at", { ascending: false });

  if (articleIds && articleIds.length > 0) {
    query = query.in("id", articleIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Supabase:getPendingArticles] Error fetching pending articles:", error);
    throw new Error(`Failed to fetch pending articles: ${error.message}`);
  }

  if (!data) return [];

  // Filter in JavaScript: article is pending if article_analyses relation is null or empty
  // OR if embedding is null (Section 20 backfill rule)
  const pending = data
    .filter((row) => {
      const analyses = row.article_analyses;
      if (!analyses || (Array.isArray(analyses) && analyses.length === 0)) {
        return true;
      }
      const singleAnalysis = Array.isArray(analyses) ? analyses[0] : analyses;
      return !singleAnalysis || singleAnalysis.embedding === null;
    })
    .map((row) => {
      const { article_analyses: _unusedAnalyses, ...article } = row;
      void _unusedAnalyses;
      return article as Article;
    });

  return limit && limit > 0 ? pending.slice(0, limit) : pending;
}

/**
 * Fetch analyzed articles for the homepage feed (AGENTS.md Section 7 & 18).
 * Articles only appear on the homepage once analyzed.
 */
export async function getHomepageArticles(limit = 20): Promise<ArticleWithAnalysis[]> {
  // 1. Query analyzed articles first (AGENTS.md Section 7 & 18)
  const { data: analyzedData, error: analyzedError } = await supabaseAdmin
    .from("articles")
    .select(`
      *,
      sources (*),
      article_analyses (*)
    `)
    .not("analyzed_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (analyzedError) {
    console.error("[Supabase:getHomepageArticles] Error fetching analyzed articles:", analyzedError);
    throw new Error(`Failed to fetch homepage articles: ${analyzedError.message}`);
  }

  if (analyzedData && analyzedData.length > 0) {
    const valid = analyzedData.filter((row) => row.article_analyses !== null);
    if (valid.length > 0) {
      return valid as unknown as ArticleWithAnalysis[];
    }
  }

  // 2. Graceful fallback: if no analyzed articles exist yet, display the latest scraped articles
  const { data: allData, error: allError } = await supabaseAdmin
    .from("articles")
    .select(`
      *,
      sources (*),
      article_analyses (*)
    `)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (allError) {
    console.error("[Supabase:getHomepageArticles] Error fetching fallback articles:", allError);
    throw new Error(`Failed to fetch fallback articles: ${allError.message}`);
  }

  return (allData || []) as unknown as ArticleWithAnalysis[];
}

/**
 * Fetch a single article by ID with full analysis and source information.
 */
export async function getArticleById(id: string): Promise<ArticleWithAnalysis | null> {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select(`
      *,
      sources (*),
      article_analyses (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error(`[Supabase:getArticleById] Error fetching article ${id}:`, error);
    throw new Error(`Failed to fetch article: ${error.message}`);
  }

  return data as unknown as ArticleWithAnalysis;
}

/**
 * Insert new articles into Supabase (append-only, AGENTS.md Section 10).
 */
export async function insertArticles(articles: ArticleInsert[]): Promise<Article[]> {
  if (!articles || articles.length === 0) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("articles")
    .insert(articles)
    .select();

  if (error) {
    console.error("[Supabase:insertArticles] Error inserting articles:", error);
    throw new Error(`Failed to insert articles: ${error.message}`);
  }

  return data || [];
}

/**
 * Mark article as analyzed by setting analyzed_at timestamp (AGENTS.md Section 19).
 * Only call this after article analysis is successfully saved.
 */
export async function updateArticleAnalyzedAt(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("articles")
    .update({ analyzed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error(`[Supabase:updateArticleAnalyzedAt] Error updating analyzed_at for ${id}:`, error);
    throw new Error(`Failed to update article analyzed_at: ${error.message}`);
  }
}

/**
 * Vector similarity search (AGENTS.md Section 20):
 * Queries article_analyses joined to articles and sources, filters to rows where
 * the embedding is not null, the article is analyzed and is not the current article,
 * then orders by cosine distance (<=>) to the current article's embedding and limits to 5 results.
 */
export async function getRelatedArticles(
  articleId: string,
  embedding?: number[] | string | null,
  limit = 5
): Promise<ArticleWithSimilarity[]> {
  let targetEmbedding = embedding;

  // If no embedding was passed, fetch the current article's analysis first
  if (!targetEmbedding) {
    const { data: currentAnalysis } = await supabaseAdmin
      .from("article_analyses")
      .select("embedding")
      .eq("article_id", articleId)
      .maybeSingle();

    if (!currentAnalysis || !currentAnalysis.embedding) {
      return [];
    }
    targetEmbedding = currentAnalysis.embedding;
  }

  const embeddingStr = Array.isArray(targetEmbedding)
    ? JSON.stringify(targetEmbedding)
    : targetEmbedding;

  // 1. Try invoking PostgreSQL RPC function (pgvector cosine distance <=> index)
  try {
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
      "match_related_articles",
      {
        target_article_id: articleId,
        target_embedding: embeddingStr,
        match_count: limit,
      }
    );

    if (!rpcError && rpcData && rpcData.length > 0) {
      return rpcData.map((row) => ({
        id: row.id,
        source_id: row.source_id,
        original_url: row.original_url,
        canonical_url: row.canonical_url,
        title: row.title,
        image_url: row.image_url,
        published_at: row.published_at,
        raw_text: row.raw_text,
        scraped_at: row.scraped_at,
        analyzed_at: row.analyzed_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        sources: row.sources,
        article_analyses: row.article_analyses,
        similarity: row.similarity,
      })) as ArticleWithSimilarity[];
    }
  } catch (err) {
    console.warn("[getRelatedArticles] RPC query error, using client-side fallback:", err);
  }

  // 2. Client-side fallback: query analyzed articles joined to sources and analyses
  try {
    const targetVec: number[] = Array.isArray(targetEmbedding)
      ? targetEmbedding
      : typeof targetEmbedding === "string"
      ? JSON.parse(targetEmbedding)
      : [];

    if (targetVec.length === 0) return [];

    const { data: allAnalyzed, error: queryError } = await supabaseAdmin
      .from("articles")
      .select(`
        *,
        sources (*),
        article_analyses (*)
      `)
      .not("analyzed_at", "is", null)
      .neq("id", articleId)
      .limit(60);

    if (queryError || !allAnalyzed) {
      console.error("[getRelatedArticles] Error in fallback query:", queryError);
      return [];
    }

    // Calculate cosine similarity in TypeScript
    const scored = allAnalyzed
      .filter((a) => a.article_analyses && a.article_analyses.embedding)
      .map((a) => {
        const rawEmb = a.article_analyses!.embedding;
        const emb: number[] = Array.isArray(rawEmb)
          ? rawEmb
          : typeof rawEmb === "string"
          ? JSON.parse(rawEmb)
          : [];

        if (emb.length !== targetVec.length) {
          return { article: a, similarity: 0 };
        }

        let dot = 0;
        let magA = 0;
        let magB = 0;
        for (let i = 0; i < emb.length; i++) {
          dot += targetVec[i] * emb[i];
          magA += targetVec[i] * targetVec[i];
          magB += emb[i] * emb[i];
        }
        const similarity =
          magA > 0 && magB > 0 ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
        return { article: a, similarity };
      })
      .filter((s) => s.similarity > 0)
      .sort((x, y) => y.similarity - x.similarity)
      .slice(0, limit);

    return scored.map((s) => ({
      ...(s.article as unknown as ArticleWithAnalysis),
      similarity: Number(s.similarity.toFixed(4)),
    }));
  } catch (fallbackErr) {
    console.error("[getRelatedArticles] Fatal fallback error:", fallbackErr);
    return [];
  }
}

export interface ArticleCluster {
  primary: ArticleWithAnalysis;
  related: ArticleWithSimilarity[];
}

/**
 * Fetches analyzed articles grouped with their top pgvector-related articles for the For You discovery page.
 */
export async function getArticlesWithRelatedClusters(
  limit = 8
): Promise<ArticleCluster[]> {
  const articles = await getHomepageArticles(limit);
  const clusters: ArticleCluster[] = [];

  for (const article of articles) {
    if (article.article_analyses?.embedding) {
      const related = await getRelatedArticles(
        article.id,
        article.article_analyses.embedding,
        3
      );
      clusters.push({ primary: article, related });
    } else {
      clusters.push({ primary: article, related: [] });
    }
  }

  return clusters;
}
