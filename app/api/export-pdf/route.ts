import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import ReportPDF from "@/components/ReportPDF";
import { ScanResult, Addendum } from "@/lib/types";
import { MAX_SCAN_CHARACTERS, validateScanResult, validateAddendum } from "@/lib/analysis/validate";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    let result: ScanResult;
    let addendum: Addendum | null = null;
    let documentTitle: string | undefined;
    const reviewDecisions: Record<string, string> = {};
    try {
      if (!body || typeof body.originalText !== "string" || body.originalText.length > MAX_SCAN_CHARACTERS) throw new Error();
      result = validateScanResult(body.result, body.originalText);
      if (body.addendum) addendum = validateAddendum(body.addendum);
      if (body.documentTitle !== undefined) {
        if (typeof body.documentTitle !== "string" || body.documentTitle.length > 240) throw new Error();
        documentTitle = body.documentTitle;
      }
      if (body.reviewDecisions !== undefined) {
        if (!body.reviewDecisions || typeof body.reviewDecisions !== "object" || Array.isArray(body.reviewDecisions)) throw new Error();
        for (const flag of result.flags) {
          const status = body.reviewDecisions[flag.id] ?? "open";
          if (!["open", "accepted", "resolved", "dismissed"].includes(status)) throw new Error();
          reviewDecisions[flag.id] = status;
        }
      }
    } catch {
      return NextResponse.json({ error: "Invalid report data" }, { status: 400 });
    }

    const element = React.createElement(ReportPDF, {
      result,
      addendum,
      documentTitle,
      reviewDecisions,
    });

    const pdfElement = element as unknown as Parameters<
      typeof renderToBuffer
    >[0];
    const buffer = await renderToBuffer(pdfElement);

    const filename = `equiscan-report-${Date.now()}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    console.error("PDF export failed");
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
