import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ScanResults from "@/components/ScanResults";
import AuditTrashButton from "@/components/AuditTrashButton";
import { createClient } from "@/lib/supabase/server";
import { validateScanResult } from "@/lib/analysis/validate";

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  // Use the signed-in client so RLS applies to every lookup, including guessed IDs.
  const { data: scan, error: scanError } = await db.from("scans")
    .select("id, document_id, workspace_id, bias_score, summary, created_at").eq("id", id).maybeSingle();
  if (scanError) throw new Error("Could not load audit");
  if (!scan) notFound();
  const [documentQuery, flagsQuery] = await Promise.all([
    db.from("documents").select("title, raw_text, deleted_at").eq("id", scan.document_id).eq("workspace_id", scan.workspace_id).maybeSingle(),
    db.from("flags").select("id, flag_index, flagged_sentence, category, severity, explanation, suggested_rewrite, status")
      .eq("scan_id", id).eq("workspace_id", scan.workspace_id).order("flag_index"),
  ]);
  if (documentQuery.error || flagsQuery.error) throw new Error("Could not load audit details");
  if (!documentQuery.data) notFound();
  const document = documentQuery.data;
  if (document.deleted_at) return <><Navbar /><main className="max-w-3xl mx-auto px-6 py-12">
    <Link href="/dashboard" className="text-sm text-rose">← Back to workspace</Link>
    <h1 className="font-serif text-4xl my-6">This audit is in Trash.</h1>
    <p className="text-muted mb-6">Restore it to continue reviewing {document.title}. Its source and review decisions are still stored.</p>
    <AuditTrashButton documentId={scan.document_id} restore />
  </main></>;
  const rows = flagsQuery.data || [];
  const result = validateScanResult({ documentBiasScore: Number(scan.bias_score), summary: scan.summary,
    flags: rows.map(row => ({ flaggedSentence: row.flagged_sentence, category: row.category, severity: row.severity,
      explanation: row.explanation, suggestedRewrite: row.suggested_rewrite })) }, document.raw_text);
  const flagIdMap: Record<string, string> = {};
  const initialStatuses: Record<string, "open" | "accepted" | "resolved" | "dismissed"> = {};
  rows.forEach((row, index) => {
    const localId = result.flags[index].id;
    flagIdMap[localId] = row.id;
    if (!["open", "accepted", "resolved", "dismissed"].includes(row.status)) throw new Error("Invalid saved review status");
    initialStatuses[localId] = row.status as "open" | "accepted" | "resolved" | "dismissed";
  });
  return <><Navbar /><main className="max-w-6xl mx-auto px-6 py-12">
    <Link href="/dashboard" className="text-sm text-rose">← Back to workspace</Link>
    <p className="section-label mt-8 mb-3">Saved audit</p>
    <h1 className="font-serif text-4xl mb-4 break-words">{document.title}</h1>
    <div className="mb-5"><AuditTrashButton documentId={scan.document_id} /></div>
    <p className="text-muted mb-8">Original findings and saved review decisions. Reopening does not run a new analysis. Additional rewrites are generated on demand and are not saved with this audit.</p>
    <ScanResults key={id} originalText={document.raw_text} result={result} documentTitle={document.title}
      flagIdMap={flagIdMap} initialStatuses={initialStatuses} />
  </main></>;
}
