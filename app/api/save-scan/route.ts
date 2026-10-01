import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ScanResult } from "@/lib/types";

export const runtime = "nodejs";

type SaveScanRequest = {
  title: string;
  sourceType: "pdf" | "paste" | "sample";
  rawText: string;
  result: ScanResult;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body: SaveScanRequest = await req.json();
    const { title, sourceType, rawText, result } = body;

    if (!title || !sourceType || !rawText || !result) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "No workspace found" },
        { status: 404 }
      );
    }

    const workspaceId = membership.workspace_id;

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .insert({
        workspace_id: workspaceId,
        title,
        source_type: sourceType,
        char_count: rawText.length,
        raw_text: rawText,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (documentError || !document) {
      throw documentError;
    }

    const categoryCounts = result.flags.reduce<Record<string, number>>(
      (counts, flag) => {
        counts[flag.category] = (counts[flag.category] || 0) + 1;
        return counts;
      },
      {}
    );

    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .insert({
        document_id: document.id,
        workspace_id: workspaceId,
        letter_grade: result.letterGrade,
        bias_score: result.documentBiasScore,
        total_flags: result.totalFlags,
        summary: result.summary,
        category_counts: categoryCounts,
        scan_data: result,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (scanError || !scan) {
      throw scanError;
    }

    if (result.flags.length > 0) {
      const flagsToInsert = result.flags.map((flag, index) => ({
        scan_id: scan.id,
        document_id: document.id,
        workspace_id: workspaceId,
        flag_index: index,
        category: flag.category,
        severity: flag.severity,
        flagged_sentence: flag.flaggedSentence,
        explanation: flag.explanation,
        suggested_rewrite: flag.suggestedRewrite,
        citation: flag.citation ?? null,
        status: "open",
      }));

      const { error: flagsError } = await supabase
        .from("flags")
        .insert(flagsToInsert);

      if (flagsError) {
        throw flagsError;
      }
    }

    return NextResponse.json({
      success: true,
      workspaceId,
      documentId: document.id,
      scanId: scan.id,
    });
  } catch (error) {
    console.error("Save scan error:", error);
    return NextResponse.json(
      { error: "Failed to save scan" },
      { status: 500 }
    );
  }
}