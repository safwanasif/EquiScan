import { NextRequest, NextResponse } from "next/server";
import { callGroq, analysisFailure } from "@/lib/groq";
import { ADDENDUM_SYSTEM_PROMPT } from "@/lib/prompts";
import { Addendum, ScanResult } from "@/lib/types";
import { MAX_SCAN_CHARACTERS, validateAddendum, validateScanResult } from "@/lib/analysis/validate";
import { reserveAiRequest } from "@/lib/server/ai-usage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 });
    const originalText: string = body.originalText;
    let scanResult: ScanResult;

    if (typeof originalText !== "string" || originalText.trim().length < 50 || originalText.length > MAX_SCAN_CHARACTERS) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try { scanResult = validateScanResult(body.scanResult, originalText); }
    catch { return NextResponse.json({ error: "Invalid scan result" }, { status: 400 }); }
    if (scanResult.flags.length === 0) return NextResponse.json({ error: "An addendum requires at least one finding to review." }, { status: 400 });
    if (JSON.stringify(scanResult).length > 8000) return NextResponse.json({ error: "Too many findings for one addendum. Use a shorter section." }, { status: 413 });

    const userContent = `ORIGINAL MEDICAL TEXT:
${originalText}

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

    const limited = await reserveAiRequest();
    if (limited) return limited;
    const result = await callGroq<Addendum>(
      ADDENDUM_SYSTEM_PROMPT,
      userContent,
      2048
    );

    return NextResponse.json(validateAddendum(result));
  } catch (error) {
    return analysisFailure(error);
  }
}
