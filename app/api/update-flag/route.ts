import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body || typeof body.flagId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.flagId) ||
      !["open", "accepted", "resolved", "dismissed"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid flag or status" }, { status: 400 });
    }
    const { data, error } = await supabase.from("flags").update({ status: body.status })
      .eq("id", body.flagId).select("id").maybeSingle();
    if (error) throw error;
    // RLS hides other users' rows; do not report a successful update when no row matched.
    if (!data) return NextResponse.json({ error: "Flag not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update flag" }, { status: 500 });
  }
}
