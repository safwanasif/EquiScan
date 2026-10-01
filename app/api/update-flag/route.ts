import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { flagId, status } = await req.json();

    if (!flagId || !status) {
      return NextResponse.json(
        { error: "Missing flagId or status" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("flags")
      .update({ status })
      .eq("id", flagId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update flag error:", error);
    return NextResponse.json(
      { error: "Failed to update flag" },
      { status: 500 }
    );
  }
}