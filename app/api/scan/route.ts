import { NextRequest, NextResponse } from "next/server";
import { callGroq, analysisFailure } from "@/lib/groq";
import { SCANNER_SYSTEM_PROMPT } from "@/lib/prompts";
import { MAX_SCAN_CHARACTERS, validateScanResult } from "@/lib/analysis/validate";
import { requireAiSession } from "@/lib/server/ai-usage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 });
    }
    const text: string = body.text;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    if (text.trim().length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400 }
      );
    }

    if (text.length > MAX_SCAN_CHARACTERS) {
      return NextResponse.json(
        { error: `This scanner supports up to ${MAX_SCAN_CHARACTERS.toLocaleString("en-US")} characters. Submit a shorter section; no text has been analyzed.` },
        { status: 413 }
      );
    }

    const limited = await requireAiSession();
    if (limited) return limited;
    const result = await callGroq<unknown>(
      SCANNER_SYSTEM_PROMPT,
      `Analyze the following medical text for potential gender bias:\n\n${text}`,
      3072
    );

    return NextResponse.json(validateScanResult(result, text));
  } catch (error) {
    return analysisFailure(error);
  }
}
