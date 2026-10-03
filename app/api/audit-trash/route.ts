import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to manage audits." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.documentId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.documentId) ||
      !["trash", "restore"].includes(body.action)) {
    return NextResponse.json({ error: "Invalid audit action." }, { status: 400 });
  }
  const { data, error } = await db.from("documents")
    .update({ deleted_at: body.action === "trash" ? new Date().toISOString() : null })
    .eq("id", body.documentId).eq("created_by", user.id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "Could not update this audit. Try again." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
