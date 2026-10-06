import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Authenticate live AI requests; provider capacity limits still apply.
export async function requireAiSession(): Promise<NextResponse | null> {
  try {
    const db = await createClient();
    const { data: { user }, error } = await db.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Sign in to run live analysis. The prepared demo is available without login." }, { status: 401 });
    return null;
  } catch {
    return NextResponse.json({ error: "Could not verify your session. Please try again or use the prepared demo." }, { status: 503 });
  }
}
