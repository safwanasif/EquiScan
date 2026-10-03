import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateAddendum } from "@/lib/analysis/validate";

export async function POST(request: NextRequest) {
  try {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to save a draft." }, { status: 401 });
    const body = await request.json().catch(() => null);
    let addendum;
    try {
      if (!body || typeof body.scanId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.scanId)) throw new Error();
      addendum = validateAddendum(body.addendum);
    } catch { return NextResponse.json({ error: "Invalid editorial draft." }, { status: 400 }); }
    const { data: existing, error: lookupError } = await db.from("editorial_drafts").select("scan_id").eq("scan_id", body.scanId).maybeSingle();
    if (lookupError) throw new Error();
    // Column-scoped update grants keep creator and scan identity immutable.
    const query = existing
      ? db.from("editorial_drafts").update({ addendum, updated_at: new Date().toISOString() }).eq("scan_id", body.scanId)
      : db.from("editorial_drafts").insert({ scan_id: body.scanId, created_by: user.id, addendum });
    const { data, error } = await query.select("scan_id").maybeSingle();
    if (error || !data) return NextResponse.json({ error: "Could not save this draft. The audit must be yours and outside Trash." }, { status: 503 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Draft storage is unavailable. Export your report to keep a copy." }, { status: 503 }); }
}
