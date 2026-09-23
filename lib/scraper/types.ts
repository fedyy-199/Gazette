export interface ScrapeRunOptions {
  /**
   * Names or IDs of sources to scrape. Defaults to all active sources.
   */
  sources?: string[];
  /**
   * Maximum valid articles to collect and insert per source. Defaults to 5.
   */
  limit?: number;
  /**
   * Optional JavaScript rendering via Oxylabs.
   */
  render?: "html";
}

export interface CandidateLink {
  url: string;
  sourceId: string;
  sourceName: string;
  strategy?: string | null;
}

export interface ExtractedArticleData {
  sourceId: string;
  originalUrl: string;
  canonicalUrl: string | null;
  title: string;
  imageUrl: string;
  publishedAt: string;
  rawText: string;
}

export interface ArticleValidationResult {
  isValid: boolean;
  rejectionReason?: string;
  data?: ExtractedArticleData;
}

export interface ScrapeSummary {
  status: "completed" | "failed" | "partial";
  sourcesChecked: number;
  candidatesFound: number;
  candidatesRejected: number;
  duplicatesSkipped: number;
  detailPagesScraped: number;
  articlesInserted: number;
  articlesRejected: number;
  articlesFailed: number;
  totalDurationMs: number;
  rejectionReasons: Record<string, number>;
}
