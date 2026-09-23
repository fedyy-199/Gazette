import { NextRequest, NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/lib/ai/schema";
import { runAnalysisPipeline } from "@/lib/ai/pipeline";

/**
 * POST /api/analyze
 * AI article analysis endpoint protected by GAZETTE_ADMIN_SECRET.
 * Adheres strictly to AGENTS.md Sections 14, 15, 19.
 */
export async function POST(request: NextRequest) {
  // 1. Admin Secret Verification (Section 15)
  const adminSecret = process.env.GAZETTE_ADMIN_SECRET;
  const providedSecret = request.headers.get("x-gazette-admin-secret");

  if (!adminSecret || !providedSecret || providedSecret !== adminSecret) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid x-gazette-admin-secret header" },
      { status: 401 }
    );
  }

  // 2. Parse & validate request payload
  let options = {};
  try {
    const rawBody = await request.text();
    if (rawBody && rawBody.trim().length > 0) {
      const json = JSON.parse(rawBody);
      const parsed = analyzeRequestSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid request payload", details: parsed.error.format() },
          { status: 400 }
        );
      }
      options = parsed.data;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Malformed JSON request body", details: msg },
      { status: 400 }
    );
  }

  try {
    // 3. Run the AI analysis pipeline
    const summary = await runAnalysisPipeline(options);
    return NextResponse.json(summary, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/analyze] Unhandled pipeline error:", err);
    return NextResponse.json(
      { error: "AI analysis pipeline failed", details: msg },
      { status: 500 }
    );
  }
}
