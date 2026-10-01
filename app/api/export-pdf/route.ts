import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import ReportPDF from "@/components/ReportPDF";
import { ScanResult, Addendum } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ExportPdfRequest {
  result: ScanResult;
  addendum?: Addendum | null;
  documentTitle?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ExportPdfRequest = await req.json();
    const { result, addendum, documentTitle } = body;

    if (!result) {
      return NextResponse.json(
        { error: "Missing scan result" },
        { status: 400 }
      );
    }

    const element = React.createElement(ReportPDF, {
      result,
      addendum,
      documentTitle,
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
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}