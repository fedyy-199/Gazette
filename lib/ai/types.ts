import type { BiasLabel, SentimentLabel } from "../supabase/types";

export interface AnalyzeRunOptions {
  /**
   * Maximum articles to analyze during this run.
   */
  limit?: number;
  /**
   * Specific article IDs to analyze.
   */
  articleIds?: string[];
  /**
   * Batch size for processing (defaults to process.env.ANALYSIS_BATCH_SIZE or 5).
   */
  batchSize?: number;
}

export interface AiArticleAnalysisOutput {
  summary: string;
  sentimentScore: number;
  sentimentLabel: SentimentLabel;
  politicalFramingLabel: BiasLabel;
  leftPercentage: number;
  centerPercentage: number;
  rightPercentage: number;
  biasScore: number;
  confidence: number;
  framingNotes: string;
  loadedTerms: string[];
  disclaimer: string;
  model: string;
}

export interface AnalysisSummary {
  status: "completed" | "failed" | "partial";
  totalPending: number;
  analyzedCount: number;
  skippedCount: number;
  failedCount: number;
  batchesProcessed: number;
  totalDurationMs: number;
  failures: Array<{
    articleId: string;
    title: string;
    error: string;
  }>;
}
