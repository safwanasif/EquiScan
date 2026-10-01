import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { ADDENDUM_SYSTEM_PROMPT } from "@/lib/prompts";
import { Addendum, ScanResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const originalText: string = body.originalText;
    const scanResult: ScanResult = body.scanResult;

    if (!originalText || !scanResult) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const truncatedText = originalText.slice(0, 40000);

    const userContent = `ORIGINAL MEDICAL TEXT:
${truncatedText}

BIAS ANALYSIS SUMMARY:
${scanResult.summary}

FLAGGED BIAS PATTERNS:
${scanResult.flags
  .map(
    (f, i) =>
      `${i + 1}. [${f.category}] ${f.flaggedSentence}\n   Why: ${f.explanation}`
  )
  .join("\n\n")}

Generate the "Sex and Gender Considerations" addendum that should accompany this text.`;

    const result = await callClaude<Addendum>(
      ADDENDUM_SYSTEM_PROMPT,
      userContent,
      2048
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Addendum route error:", error);
    return NextResponse.json(
      { error: "Failed to generate addendum" },
      { status: 500 }
    );
  }
}
