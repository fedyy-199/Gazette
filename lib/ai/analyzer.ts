import "server-only";

import { generateObject, embed } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { aiAnalysisRawOutputSchema, type AiAnalysisRawOutput } from "./schema";
import type { AiArticleAnalysisOutput } from "./types";
import type { BiasLabel, SentimentLabel } from "../supabase/types";

const DEFAULT_GOOGLE_MODEL = "gemini-3.5-flash-lite";
const STANDARD_DISCLAIMER =
  "Political framing, bias scores, and sentiment ratings are AI-estimated assessments derived strictly from text analysis and do not constitute objective or definitive truth.";

/**
 * Normalizes left, center, right percentages so that they strictly sum to 100.
 */
function normalizePercentages(left: number, center: number, right: number): {
  leftPercentage: number;
  centerPercentage: number;
  rightPercentage: number;
} {
  const sum = left + center + right;
  if (sum === 0) {
    return { leftPercentage: 0, centerPercentage: 100, rightPercentage: 0 };
  }

  // Calculate rounded values
  let l = Math.round((left / sum) * 100);
  let c = Math.round((center / sum) * 100);
  let r = Math.round((right / sum) * 100);

  // Correct rounding variance to enforce sum === 100
  const diff = 100 - (l + c + r);
  if (diff !== 0) {
    c += diff;
  }

  // Ensure bounds [0, 100]
  l = Math.max(0, Math.min(100, l));
  c = Math.max(0, Math.min(100, c));
  r = Math.max(0, Math.min(100, r));

  return { leftPercentage: l, centerPercentage: c, rightPercentage: r };
}

/**
 * Evaluates the dominant framing label adhering to Section 19 rules.
 */
function resolveFramingLabel(
  label: BiasLabel,
  left: number,
  center: number,
  right: number,
  confidence: number
): BiasLabel {
  if (confidence < 0.35) {
    return "unclear";
  }

  const max = Math.max(left, center, right);

  // If percentages are very close (difference between top two < 10) and no clear majority
  const sorted = [left, center, right].sort((a, b) => b - a);
  if (sorted[0] - sorted[1] < 10 && sorted[0] < 50) {
    return "mixed";
  }

  if (max === left && left >= 45) return "left";
  if (max === right && right >= 45) return "right";
  if (max === center && center >= 45) return "center";

  return label || "mixed";
}

/**
 * Analyzes an article using the Vercel AI SDK with Google AI Studio (Gemini) or OpenAI.
 * Retries once if the model call or parsing fails.
 */
export async function analyzeArticleWithAi(
  title: string,
  rawText: string,
  retryCount = 0
): Promise<AiArticleAnalysisOutput> {
  const googleApiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!googleApiKey && !openaiApiKey) {
    throw new Error(
      "[AI Analyzer] Missing GOOGLE_GENERATIVE_AI_API_KEY in environment variables. Please add your key from Google AI Studio (https://aistudio.google.com) to .env.local."
    );
  }

  let modelInstance;
  let activeModelName: string;

  if (googleApiKey) {
    // Primary: Google AI Studio (Gemini)
    activeModelName =
      process.env.GOOGLE_MODEL || process.env.GEMINI_MODEL || DEFAULT_GOOGLE_MODEL;
    const google = createGoogleGenerativeAI({ apiKey: googleApiKey });
    modelInstance = google(activeModelName);
  } else {
    // Secondary: OpenAI
    /*activeModelName = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
    const openai = createOpenAI({ apiKey: openaiApiKey! });
    modelInstance = openai(activeModelName);*/
    throw new Error(
      "[AI Analyzer] Missing GOOGLE_GENERATIVE_AI_API_KEY in environment variables. Please add your key from Google AI Studio (https://aistudio.google.com) to .env.local."
    );
  }

  const systemPrompt = `You are an elite, non-partisan media analyst and computational linguist at Gazette.
Your job is to objectively analyze news article texts for factual substance, emotional tone, and political framing.

CRITICAL RULES:
1. Ground your analysis STRICTLY in the provided article text. Do NOT make assumptions based on publication or author names.
2. Political framing is an AI-estimated evaluation of emphasis, perspectives highlighted or omitted, source selection, and rhetoric.
3. leftPercentage, centerPercentage, and rightPercentage must each be numbers between 0 and 100, and must sum to approximately 100.
4. If the text is balanced or non-partisan, centerPercentage should be high.
5. If evidence of political leaning is weak or ambiguous, keep confidence low and set politicalFramingLabel to 'unclear'.
6. sentimentScore must be between -1.0 (very negative) and 1.0 (very positive), where 0.0 is neutral.
7. Identify loaded terms: emotionally charged, polarizing, judgmental, or rhetoric-heavy words/phrases used in the text.
8. Provide a completely neutral, factual summary (2-4 sentences).`;

  const userPrompt = `ARTICLE TITLE: ${title}

ARTICLE TEXT:
${rawText.slice(0, 20000)}

Perform a thorough, objective framing and sentiment analysis according to your schema instructions.`;

  try {
    const result = await generateObject({
      model: modelInstance,
      schema: aiAnalysisRawOutputSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.2,
    });

    const output: AiAnalysisRawOutput = result.object;

    // Normalize percentages to strictly sum to 100
    const { leftPercentage, centerPercentage, rightPercentage } = normalizePercentages(
      output.leftPercentage,
      output.centerPercentage,
      output.rightPercentage
    );

    // Derived bias score: (right - left) / 100 per AGENTS.md Section 7 & 19
    const biasScore = Number(((rightPercentage - leftPercentage) / 100).toFixed(4));

    // Refine framing label if necessary
    const politicalFramingLabel = resolveFramingLabel(
      output.politicalFramingLabel,
      leftPercentage,
      centerPercentage,
      rightPercentage,
      output.confidence
    );

    return {
      summary: output.summary.trim(),
      sentimentScore: Number(output.sentimentScore.toFixed(4)),
      sentimentLabel: output.sentimentLabel as SentimentLabel,
      politicalFramingLabel,
      leftPercentage,
      centerPercentage,
      rightPercentage,
      biasScore,
      confidence: Number(output.confidence.toFixed(4)),
      framingNotes: output.framingNotes.trim(),
      loadedTerms: output.loadedTerms || [],
      disclaimer: output.disclaimer || STANDARD_DISCLAIMER,
      model: activeModelName,
    };
  } catch (err: unknown) {
    if (retryCount < 1) {
      console.warn(
        `[AI Analyzer] Analysis attempt failed with model ${activeModelName}, retrying once... Error: ${String(err)}`
      );
      return analyzeArticleWithAi(title, rawText, retryCount + 1);
    }
    throw err;
  }
}

/**
 * Generates a 1536-dimensional embedding using Google AI Studio API (or OpenAI fallback).
 * Uses gemini-embedding-2 / gemini-embedding-001 with outputDimensionality: 1536.
 */
export async function generateArticleEmbedding(
  title: string,
  rawText: string,
  retryCount = 0
): Promise<number[]> {
  const googleApiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!googleApiKey && !openaiApiKey) {
    throw new Error(
      "[AI Analyzer] Missing GOOGLE_GENERATIVE_AI_API_KEY in environment variables. Please add your key from Google AI Studio (https://aistudio.google.com) to .env.local."
    );
  }

  // Format text representation for optimal semantic clustering: headline + lead body
  const inputText = `Headline: ${title}\n\nArticle:\n${rawText.slice(0, 8000)}`;

  if (googleApiKey) {
    // Primary: Google AI Studio API with 1536-dimension Matryoshka output
    const modelsToTry = ["gemini-embedding-2", "gemini-embedding-001"];
    let lastError: unknown;

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:embedContent?key=${googleApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: {
                parts: [{ text: inputText }],
              },
              outputDimensionality: 1536,
            }),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Google API returned ${response.status}: ${errText}`);
        }

        const data = await response.json();
        if (data.embedding?.values && Array.isArray(data.embedding.values)) {
          return data.embedding.values as number[];
        }
        throw new Error("Invalid embedding response from Google API");
      } catch (err: unknown) {
        lastError = err;
        console.warn(`[AI Analyzer] Google model ${modelName} embedding failed: ${String(err)}`);
      }
    }

    if (retryCount < 1) {
      console.warn(`[AI Analyzer] Retrying Google embedding generation...`);
      return generateArticleEmbedding(title, rawText, retryCount + 1);
    }
    throw lastError || new Error("Failed to generate embedding with Google AI Studio");
  }

  // Secondary Fallback: OpenAI
  try {
    const openai = createOpenAI({ apiKey: openaiApiKey! });
    const model = openai.embedding("text-embedding-3-small");
    const { embedding } = await embed({
      model,
      value: inputText,
    });
    return embedding;
  } catch (err: unknown) {
    if (retryCount < 1) {
      console.warn(
        `[AI Analyzer] Embedding attempt failed with OpenAI, retrying once... Error: ${String(err)}`
      );
      return generateArticleEmbedding(title, rawText, retryCount + 1);
    }
    throw err;
  }
}


