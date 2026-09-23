export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SentimentLabel = "positive" | "neutral" | "negative";
export type BiasLabel = "left" | "center" | "right" | "mixed" | "unclear";
export type LogLevel = "info" | "warn" | "error";

export interface Database {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string;
          name: string;
          listing_url: string;
          parser_strategy: string | null;
          is_active: boolean;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          listing_url: string;
          parser_strategy?: string | null;
          is_active?: boolean;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          listing_url?: string;
          parser_strategy?: string | null;
          is_active?: boolean;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          source_id: string;
          original_url: string;
          canonical_url: string | null;
          title: string;
          image_url: string;
          published_at: string;
          raw_text: string;
          scraped_at: string;
          analyzed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          original_url: string;
          canonical_url?: string | null;
          title: string;
          image_url: string;
          published_at: string;
          raw_text: string;
          scraped_at?: string;
          analyzed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          original_url?: string;
          canonical_url?: string | null;
          title?: string;
          image_url?: string;
          published_at?: string;
          raw_text?: string;
          scraped_at?: string;
          analyzed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "articles_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          }
        ];
      };
      article_analyses: {
        Row: {
          id: string;
          article_id: string;
          summary: string;
          sentiment_score: number;
          sentiment_label: SentimentLabel;
          bias_label: BiasLabel;
          left_percentage: number;
          center_percentage: number;
          right_percentage: number;
          bias_score: number;
          confidence: number;
          framing_notes: string | null;
          loaded_terms: string[] | null;
          disclaimer: string | null;
          model: string;
          embedding: number[] | string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          summary: string;
          sentiment_score: number;
          sentiment_label: SentimentLabel;
          bias_label: BiasLabel;
          left_percentage: number;
          center_percentage: number;
          right_percentage: number;
          bias_score: number;
          confidence: number;
          framing_notes?: string | null;
          loaded_terms?: string[] | null;
          disclaimer?: string | null;
          model: string;
          embedding?: number[] | string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          summary?: string;
          sentiment_score?: number;
          sentiment_label?: SentimentLabel;
          bias_label?: BiasLabel;
          left_percentage?: number;
          center_percentage?: number;
          right_percentage?: number;
          bias_score?: number;
          confidence?: number;
          framing_notes?: string | null;
          loaded_terms?: string[] | null;
          disclaimer?: string | null;
          model?: string;
          embedding?: number[] | string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "article_analyses_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: true;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          }
        ];
      };
      logs: {
        Row: {
          id: string;
          level: LogLevel;
          message: string;
          context: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          level?: LogLevel;
          message: string;
          context?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          level?: LogLevel;
          message?: string;
          context?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      oxylabs_schedules: {
        Row: {
          id: string;
          source_id: string;
          oxylabs_schedule_id: string;
          cron: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          oxylabs_schedule_id: string;
          cron?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          oxylabs_schedule_id?: string;
          cron?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oxylabs_schedules_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          }
        ];
      };
      oxylabs_schedule_runs: {
        Row: {
          id: string;
          schedule_id: string;
          oxylabs_job_id: string | null;
          status: string | null;
          result_status: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          oxylabs_job_id?: string | null;
          status?: string | null;
          result_status?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          oxylabs_job_id?: string | null;
          status?: string | null;
          result_status?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "oxylabs_schedule_runs_schedule_id_fkey";
            columns: ["schedule_id"];
            isOneToOne: false;
            referencedRelation: "oxylabs_schedules";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_related_articles: {
        Args: {
          target_article_id: string;
          target_embedding: string;
          match_count?: number;
        };
        Returns: {
          id: string;
          source_id: string;
          original_url: string;
          canonical_url: string | null;
          title: string;
          image_url: string;
          published_at: string;
          raw_text: string;
          scraped_at: string;
          analyzed_at: string | null;
          created_at: string;
          updated_at: string;
          similarity: number;
          sources: Source | null;
          article_analyses: ArticleAnalysis | null;
        }[];
      };
    };
    Enums: Record<string, never>;
  };
}

// Convenience Type Aliases
export type Source = Database["public"]["Tables"]["sources"]["Row"];
export type SourceInsert = Database["public"]["Tables"]["sources"]["Insert"];
export type SourceUpdate = Database["public"]["Tables"]["sources"]["Update"];

export type Article = Database["public"]["Tables"]["articles"]["Row"];
export type ArticleInsert = Database["public"]["Tables"]["articles"]["Insert"];
export type ArticleUpdate = Database["public"]["Tables"]["articles"]["Update"];

export type ArticleAnalysis = Database["public"]["Tables"]["article_analyses"]["Row"];
export type ArticleAnalysisInsert = Database["public"]["Tables"]["article_analyses"]["Insert"];
export type ArticleAnalysisUpdate = Database["public"]["Tables"]["article_analyses"]["Update"];

export type Log = Database["public"]["Tables"]["logs"]["Row"];
export type LogInsert = Database["public"]["Tables"]["logs"]["Insert"];

export type OxylabsSchedule = Database["public"]["Tables"]["oxylabs_schedules"]["Row"];
export type OxylabsScheduleInsert = Database["public"]["Tables"]["oxylabs_schedules"]["Insert"];

export type OxylabsScheduleRun = Database["public"]["Tables"]["oxylabs_schedule_runs"]["Row"];
export type OxylabsScheduleRunInsert = Database["public"]["Tables"]["oxylabs_schedule_runs"]["Insert"];

// Composite / Domain Types
export interface ArticleWithAnalysis extends Article {
  sources: Source | null;
  article_analyses: ArticleAnalysis | null;
}

export interface ArticleWithSimilarity extends ArticleWithAnalysis {
  similarity?: number;
}
