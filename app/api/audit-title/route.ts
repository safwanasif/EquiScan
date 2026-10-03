import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to rename an audit." }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (!body || typeof body.documentId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.documentId) ||
      typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 240) {
      return NextResponse.json({ error: "Enter a title of 1–240 characters." }, { status: 400 });
    }
    const { data, error } = await db.rpc("rename_audit", { p_document_id: body.documentId, p_title: body.title.trim() });
    if (error) return NextResponse.json({ error: "Could not rename this audit. Please try again later." }, { status: 503 });
    if (data !== true) return NextResponse.json({ error: "Audit not found or not editable." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not rename this audit. Please try again later." }, { status: 503 });
  }
}
