import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { SCANNER_SYSTEM_PROMPT } from "@/lib/prompts";
import { ScanResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: string = body.text;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400 }
      );
    }

    const truncatedText = text.slice(0, 60000);

    const result = await callClaude<ScanResult>(
      SCANNER_SYSTEM_PROMPT,
      `Analyze the following medical text for gender bias:\n\n${truncatedText}`,
      8192
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scan route error:", error);
    return NextResponse.json(
      { error: "Failed to scan document" },
      { status: 500 }
    );
  }
}
