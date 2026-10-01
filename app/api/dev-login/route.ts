import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const email: string = body.email;

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if user exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    let user = existingUsers?.users?.find((u) => u.email === email);

    // Create if not exists
    if (!user) {
      const { data: newUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email,
          email_confirm: true,
        });
      if (createError) throw createError;
      user = newUser.user!;

      // Manually create workspace + membership (the trigger doesn't fire on admin creation)
      const workspaceName = "University of Arizona College of Medicine";
      const slug =
        email.split("@")[0].toLowerCase().replace(/\./g, "-") +
        "-" +
        user.id.substring(0, 8);

      const { data: workspace, error: wsError } = await adminClient
        .from("workspaces")
        .insert({
          name: workspaceName,
          slug,
          created_by: user.id,
        })
        .select()
        .single();
      if (wsError) throw wsError;

      const { error: memberError } = await adminClient
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: "owner",
        });
      if (memberError) throw memberError;
    }

    // Generate a magic link, but extract the token instead of sending email
    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
    if (linkError) throw linkError;

    const tokenHash = linkData.properties?.hashed_token;
    if (!tokenHash) {
      throw new Error("No token returned");
    }

    // Now use the regular client to verify the token and set the session cookie
    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: tokenHash,
    });

    if (verifyError) throw verifyError;

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error("Dev login error:", error);
    return NextResponse.json(
      {
        error: "Dev login failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}