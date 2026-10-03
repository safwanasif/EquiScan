import { NextRequest, NextResponse } from "next/server";
import { callGroq, analysisFailure } from "@/lib/groq";
import { REWRITER_SYSTEM_PROMPT } from "@/lib/prompts";
import { BiasCategory } from "@/lib/types";
import { CATEGORIES, validateRewrites } from "@/lib/analysis/validate";
import { reserveAiRequest } from "@/lib/server/ai-usage";

interface RewriteResponse {
  conservative: string;
  balanced: string;
  comprehensive: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 });
    const flaggedSentence: string = body.flaggedSentence;
    const category: BiasCategory = body.category;
    const context: string | undefined = body.context;

    if (typeof flaggedSentence !== "string" || !flaggedSentence.trim() || flaggedSentence.length > 2000 || !CATEGORIES.includes(category) ||
        (context !== undefined && (typeof context !== "string" || context.length > 4000))) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userContent = context
      ? `Bias category: ${category}\n\nFlagged sentence:\n"${flaggedSentence}"\n\nSurrounding context:\n${context}`
      : `Bias category: ${category}\n\nFlagged sentence:\n"${flaggedSentence}"`;

    const limited = await reserveAiRequest();
    if (limited) return limited;
    const result = await callGroq<RewriteResponse>(
      REWRITER_SYSTEM_PROMPT,
      userContent,
      1024
    );

    return NextResponse.json(validateRewrites(result));
  } catch (error) {
    return analysisFailure(error);
  }
}
