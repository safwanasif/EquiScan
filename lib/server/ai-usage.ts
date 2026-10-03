import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Server routes only. The service key and reservation RPC never reach client code.
export async function reserveAiRequest(): Promise<NextResponse | null> {
  try {
    const db = await createClient();
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Sign in to run live analysis. The prepared demo is available without login." }, { status: 401 });
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!key || !url) throw new Error("Usage service unavailable");
    const admin = createAdminClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await admin.rpc("reserve_ai_request", { p_user_id: user.id });
    if (error || !data || typeof data.allowed !== "boolean") throw new Error("Usage reservation failed");
    if (!data.allowed) {
      const retryAfter = Math.max(1, Math.min(86400, Number(data.retryAfter) || 60));
      const message = data.reason === "user_daily"
        ? "Your daily live-analysis allowance is used. It resets at midnight UTC. You can still explore the prepared demo."
        : data.reason === "global_daily"
          ? "Today's shared analysis allowance is used. It resets at midnight UTC. The prepared demo remains available."
          : "Another live request used this minute's shared allowance. Try again in about a minute.";
      return NextResponse.json({ error: message, retryAfter }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }
    return null;
  } catch {
    return NextResponse.json({ error: "Live analysis is temporarily unavailable. Please try again later or use the prepared demo." }, { status: 503 });
  }
}
