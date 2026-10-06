import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(request: NextRequest) {
  try {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to save notes" }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (!body || typeof body.flagId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.flagId) || typeof body.note !== "string" || body.note.length > 2000)
      return NextResponse.json({ error: "Invalid reviewer note" }, { status: 400 });
    const { data, error } = await db.rpc("save_reviewer_note", { p_flag_id: body.flagId, p_note: body.note });
    if (error) return NextResponse.json({ error: "Note storage is unavailable" }, { status: 503 });
    if (!data) return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Could not save note" }, { status: 503 }); }
}
