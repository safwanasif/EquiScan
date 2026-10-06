import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MAX_SCAN_CHARACTERS, validateScanResult } from "@/lib/analysis/validate";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body || typeof body.title !== "string" || body.title.trim().length < 1 || body.title.length > 240 ||
      !["pdf", "paste", "sample"].includes(body.sourceType) || typeof body.rawText !== "string" ||
      body.rawText.trim().length < 50 || body.rawText.length > MAX_SCAN_CHARACTERS ||
      !body.result || !Array.isArray(body.result.flags) || body.result.flags.length > 200) {
      return NextResponse.json({ error: "Invalid audit" }, { status: 400 });
    }

    let result;
    try { result = validateScanResult(body.result, body.rawText); }
    catch { return NextResponse.json({ error: "Invalid audit findings" }, { status: 400 }); }
    // Validate source grounding before the transaction; never persist fabricated quotes.
    const { data, error } = await supabase.rpc("save_audit", {
      p_title: body.title.trim(), p_source_type: body.sourceType,
      p_raw_text: body.rawText, p_result: result,
    });
    if (error) {
      const invalid = error.code?.startsWith("22") || error.code?.startsWith("23");
      console.error("Save audit failed:", error.code);
      return NextResponse.json({ error: invalid ? "Invalid audit" : "Failed to save scan" }, { status: invalid ? 400 : 500 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to save scan" }, { status: 500 });
  }
}
