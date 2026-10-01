import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { REWRITER_SYSTEM_PROMPT } from "@/lib/prompts";
import { BiasCategory } from "@/lib/types";

interface RewriteResponse {
  conservative: string;
  balanced: string;
  comprehensive: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const flaggedSentence: string = body.flaggedSentence;
    const category: BiasCategory = body.category;
    const context: string | undefined = body.context;

    if (!flaggedSentence || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userContent = context
      ? `Bias category: ${category}\n\nFlagged sentence:\n"${flaggedSentence}"\n\nSurrounding context:\n${context}`
      : `Bias category: ${category}\n\nFlagged sentence:\n"${flaggedSentence}"`;

    const result = await callClaude<RewriteResponse>(
      REWRITER_SYSTEM_PROMPT,
      userContent,
      1024
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Rewrite route error:", error);
    return NextResponse.json(
      { error: "Failed to generate rewrites" },
      { status: 500 }
    );
  }
}
