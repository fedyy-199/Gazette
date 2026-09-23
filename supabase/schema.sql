-- Gazette Supabase Database Schema
-- Version 1.0 (Initial schema without pgvector embedding column)
-- Refer to AGENTS.md Sections 7, 9, 10, 13, 18, 19, 20

-- Enable standard UUID and pgvector extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ==========================================
-- 1. SOURCES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  listing_url TEXT NOT NULL,
  parser_strategy TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for sources
CREATE INDEX IF NOT EXISTS idx_sources_is_active ON sources(is_active);
CREATE INDEX IF NOT EXISTS idx_sources_name ON sources(name);

-- ==========================================
-- 2. ARTICLES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL UNIQUE,
  canonical_url TEXT,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  raw_text TEXT NOT NULL,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for articles (covering foreign keys and frequent queries)
CREATE INDEX IF NOT EXISTS idx_articles_source_id ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_analyzed_at ON articles(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_articles_canonical_url ON articles(canonical_url);
CREATE INDEX IF NOT EXISTS idx_articles_scraped_at ON articles(scraped_at DESC);

-- ==========================================
-- 3. ARTICLE_ANALYSES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS article_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
  summary TEXT NOT NULL,
  sentiment_score NUMERIC NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_label TEXT NOT NULL CHECK (sentiment_label IN ('positive', 'neutral', 'negative')),
  bias_label TEXT NOT NULL CHECK (bias_label IN ('left', 'center', 'right', 'mixed', 'unclear')),
  left_percentage NUMERIC NOT NULL CHECK (left_percentage >= 0 AND left_percentage <= 100),
  center_percentage NUMERIC NOT NULL CHECK (center_percentage >= 0 AND center_percentage <= 100),
  right_percentage NUMERIC NOT NULL CHECK (right_percentage >= 0 AND right_percentage <= 100),
  bias_score NUMERIC NOT NULL CHECK (bias_score >= -1 AND bias_score <= 1),
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  framing_notes TEXT,
  loaded_terms TEXT[] DEFAULT '{}',
  disclaimer TEXT,
  model TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for article_analyses
CREATE INDEX IF NOT EXISTS idx_article_analyses_article_id ON article_analyses(article_id);
CREATE INDEX IF NOT EXISTS idx_article_analyses_bias_label ON article_analyses(bias_label);
CREATE INDEX IF NOT EXISTS idx_article_analyses_sentiment_label ON article_analyses(sentiment_label);
CREATE INDEX IF NOT EXISTS idx_article_analyses_embedding ON article_analyses USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ==========================================
-- 4. LOGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error')),
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for logs
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);

-- ==========================================
-- 5. OXYLABS_SCHEDULES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS oxylabs_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  oxylabs_schedule_id TEXT NOT NULL UNIQUE,
  cron TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for oxylabs_schedules
CREATE INDEX IF NOT EXISTS idx_oxylabs_schedules_source_id ON oxylabs_schedules(source_id);
CREATE INDEX IF NOT EXISTS idx_oxylabs_schedules_oxylabs_id ON oxylabs_schedules(oxylabs_schedule_id);

-- ==========================================
-- 6. OXYLABS_SCHEDULE_RUNS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS oxylabs_schedule_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES oxylabs_schedules(id) ON DELETE CASCADE,
  oxylabs_job_id TEXT,
  status TEXT,
  result_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Indexes for oxylabs_schedule_runs
CREATE INDEX IF NOT EXISTS idx_oxylabs_schedule_runs_schedule_id ON oxylabs_schedule_runs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_oxylabs_schedule_runs_result_status ON oxylabs_schedule_runs(result_status);

-- ==========================================
-- AUTO-UPDATE TRIGGER FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trg_sources_updated_at ON sources;
CREATE TRIGGER trg_sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_articles_updated_at ON articles;
CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_article_analyses_updated_at ON article_analyses;
CREATE TRIGGER trg_article_analyses_updated_at
  BEFORE UPDATE ON article_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_oxylabs_schedules_updated_at ON oxylabs_schedules;
CREATE TRIGGER trg_oxylabs_schedules_updated_at
  BEFORE UPDATE ON oxylabs_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oxylabs_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE oxylabs_schedule_runs ENABLE ROW LEVEL SECURITY;

-- Public read access policies for consumer applications
-- (Sources, Articles, and Analyses are publicly readable)
CREATE POLICY "Public sources are viewable by everyone"
  ON sources FOR SELECT
  USING (true);

CREATE POLICY "Public articles are viewable by everyone"
  ON articles FOR SELECT
  USING (true);

CREATE POLICY "Public analyses are viewable by everyone"
  ON article_analyses FOR SELECT
  USING (true);

-- Logs and Schedules are protected: only service_role (which bypasses RLS)
-- has write and read access unless explicit authenticated admin policies are added.

-- ==========================================
-- 7. VECTOR SIMILARITY SEARCH (RPC)
-- ==========================================
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
