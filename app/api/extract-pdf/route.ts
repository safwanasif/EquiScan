import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";

export const runtime = "nodejs";
export const maxDuration = 30;

interface PDF2JsonPage {
  Texts: Array<{
    R: Array<{ T: string }>;
  }>;
}

interface PDF2JsonData {
  Pages: PDF2JsonPage[];
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 10 MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await extractTextFromPdf(buffer);

    return NextResponse.json({
      text,
      charCount: text.length,
    });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract PDF text" },
      { status: 500 }
    );
  }
}

function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, true);

    parser.on("pdfParser_dataError", (errData: Error | { parserError: Error }) => {
      reject("parserError" in errData ? errData.parserError : errData);
    });

    parser.on("pdfParser_dataReady", (pdfData: PDF2JsonData) => {
      try {
        const safeDecode = (s: string): string => {
          try {
            return decodeURIComponent(s);
          } catch {
            return s;
          }
        };

        const rawText = pdfData.Pages.map((page) => {
          const lines: string[] = [];
          let currentLine = "";
          for (const t of page.Texts) {
            const token = t.R.map((r) => safeDecode(r.T)).join("");
            currentLine += token;
          }
          lines.push(currentLine);
          return lines.join("\n");
        }).join("\n\n");

        const cleaned = rawText
          .replace(/\s+/g, " ")
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/\.([A-Z])/g, ". $1")
          .replace(/,([A-Za-z])/g, ", $1")
          .replace(/:([A-Z])/g, ": $1")
          .trim();

        resolve(cleaned);
      } catch (err) {
        reject(err);
      }
    });

    parser.parseBuffer(buffer);
  });
}