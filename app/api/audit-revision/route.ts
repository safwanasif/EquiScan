import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateScanResult } from "@/lib/analysis/validate";
export async function POST(request: NextRequest) {
  try {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to save revisions" }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (!body || typeof body.parentScanId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.parentScanId) || typeof body.text !== "string" || body.text.trim().length < 50 || body.text.length > 8000)
      return NextResponse.json({ error: "Use 50–8,000 characters for a revision" }, { status: 400 });
    let result = null;
    if (body.result !== undefined) {
      try { result = validateScanResult(body.result, body.text); }
      catch { return NextResponse.json({ error: "Invalid revised findings" }, { status: 400 }); }
    }
    const { data, error } = await db.rpc("save_audit_revision", { p_parent_scan_id: body.parentScanId, p_text: body.text, p_result: result });
    if (error) return NextResponse.json({ error: "Could not save revision. Keep a downloaded copy and try again." }, { status: 503 });
    return NextResponse.json(data);
  } catch { return NextResponse.json({ error: "Revision storage is unavailable" }, { status: 503 }); }
}
