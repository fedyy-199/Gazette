-- =========================================================
-- Migration: Add pgvector and Related Articles Support
-- Adheres strictly to AGENTS.md Section 20
-- =========================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to article_analyses (1536 dimensions for OpenAI text-embedding-3-small)
ALTER TABLE article_analyses
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Create IVFFlat cosine similarity index (AGENTS.md Section 20)
CREATE INDEX IF NOT EXISTS idx_article_analyses_embedding
ON article_analyses
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. Create match_related_articles RPC function for vector similarity search
CREATE OR REPLACE FUNCTION match_related_articles (
  target_article_id UUID,
  target_embedding vector(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  source_id UUID,
  original_url TEXT,
  canonical_url TEXT,
  title TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  raw_text TEXT,
  scraped_at TIMESTAMPTZ,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity FLOAT,
  sources JSONB,
  article_analyses JSONB
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.source_id,
    a.original_url,
    a.canonical_url,
    a.title,
    a.image_url,
    a.published_at,
    a.raw_text,
    a.scraped_at,
    a.analyzed_at,
    a.created_at,
    a.updated_at,
    (1 - (an.embedding <=> target_embedding))::FLOAT AS similarity,
    to_jsonb(s.*) AS sources,
    to_jsonb(an.*) AS article_analyses
  FROM articles a
  JOIN article_analyses an ON a.id = an.article_id
  JOIN sources s ON a.source_id = s.id
  WHERE an.embedding IS NOT NULL
    AND a.analyzed_at IS NOT NULL
    AND a.id != target_article_id
  ORDER BY an.embedding <=> target_embedding ASC
  LIMIT match_count;
END;
$$;
