import { z } from "zod";

/**
 * Zod schema for structured output generation via Vercel AI SDK.
 * Strictly adheres to AGENTS.md Section 19 database check constraints.
 */
export const aiAnalysisRawOutputSchema = z.object({
  summary: z
    .string()
    .min(30)
    .describe("A concise, strictly neutral, objective 2-4 sentence summary of the article's facts, events, or arguments."),
  sentimentScore: z
    .number()
    .min(-1)
    .max(1)
    .describe("Overall emotional tone/sentiment score from -1.0 (very negative) to 1.0 (very positive), where 0.0 is completely neutral."),
  sentimentLabel: z
    .enum(["positive", "neutral", "negative"])
    .describe("Sentiment category corresponding to the sentiment score."),
  leftPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe("Estimated percentage (0-100) reflecting progressive/left-leaning framing, emphasis, or sourcing."),
  centerPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe("Estimated percentage (0-100) reflecting balanced, non-partisan, consensus, or institutional framing."),
  rightPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe("Estimated percentage (0-100) reflecting conservative/right-leaning framing, emphasis, or sourcing."),
  politicalFramingLabel: z
    .enum(["left", "center", "right", "mixed", "unclear"])
    .describe("AI-estimated dominant political framing label matching the highest percentage, or 'mixed' if split, or 'unclear' if weak evidence."),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Model confidence in this framing estimation from 0.0 (uncertain) to 1.0 (highly confident)."),
  framingNotes: z
    .string()
    .min(20)
    .describe("Detailed explanation of how the story is framed, what perspectives are centered or omitted, and how language shapes perception."),
  loadedTerms: z
    .array(z.string())
    .describe("List of emotionally loaded, polarizing, judgmental, or rhetoric-heavy words/phrases extracted directly from the article."),
  disclaimer: z
    .string()
    .describe("Standard disclaimer stating that political framing and sentiment scores are AI-estimated assessments based on text content."),
});

export type AiAnalysisRawOutput = z.infer<typeof aiAnalysisRawOutputSchema>;

/**
 * Schema for validating incoming POST /api/analyze requests.
 */
export const analyzeRequestSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  articleIds: z.array(z.string().uuid()).optional(),
  batchSize: z.number().int().positive().max(20).optional(),
});
