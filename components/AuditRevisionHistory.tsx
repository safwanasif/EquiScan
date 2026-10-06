import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { validateScanResult } from "@/lib/analysis/validate";
import { compareFindings } from "@/lib/analysis/comparison";
import type { ScanResult } from "@/lib/types";

export default async function AuditRevisionHistory({ scanId, original }: { scanId: string; original: ScanResult }) {
  const db = await createClient();
  const { data: revisions, error } = await db.from("audit_revisions")
    .select("id,revised_scan_id,revised_text,created_at").eq("parent_scan_id", scanId).order("created_at", { ascending: false }).limit(20);
  if (error) return <p className="text-sm text-muted mt-8">Saved revisions are temporarily unavailable.</p>;
  if (!revisions?.length) return null;
  const items = await Promise.all(revisions.map(async revision => {
    if (!revision.revised_scan_id) return { revision, comparison: null };
    const { data, error } = await db.from("scans").select("scan_data").eq("id", revision.revised_scan_id).maybeSingle();
    if (error || !data) return { revision, comparison: null };
    try { return { revision, comparison: compareFindings(original.flags, validateScanResult(data.scan_data, revision.revised_text).flags) }; }
    catch { return { revision, comparison: null }; }
  }));
  return <section className="mt-10 border-t border-line pt-8" aria-labelledby="versions-title">
    <h2 id="versions-title" className="font-serif text-3xl mb-3">Saved versions and comparisons</h2>
    <p className="text-sm text-muted mb-5">Showing the latest 20 snapshots. Matching uses category and exact quoted wording after whitespace normalization. Changed wording can appear as both a new finding and a finding no longer reported. Model variation means disappearance is not proof of improved medical accuracy.</p>
    <div className="space-y-4">{items.map(({ revision, comparison }) => <details key={revision.id} className="border border-line p-4">
      <summary className="cursor-pointer">{revision.revised_scan_id ? "Rescanned version" : "Draft snapshot"} · {new Date(revision.created_at).toLocaleString("en-US", { timeZone: "UTC" })} UTC</summary>
      {revision.revised_scan_id ? <Link href={`/audits/${revision.revised_scan_id}`} className="block underline my-4">Open revised audit</Link> : null}
      {comparison ? <div className="my-4 space-y-3">
        {([['New', comparison.added], ['Retained', comparison.retained], ['No longer reported', comparison.noLongerReported]] as const).map(([label, flags]) => <div key={label}><h3 className="font-semibold">{label}: {flags.length}</h3><ul className="list-disc pl-5 text-sm">{flags.map((flag, index) => <li key={index}>{flag.flaggedSentence}</li>)}</ul></div>)}
      </div> : revision.revised_scan_id ? <p className="text-sm my-3">Comparison unavailable; try reopening the revised audit.</p> : null}
      <h3 className="font-semibold mt-4">Saved revised text</h3><p className="whitespace-pre-wrap text-sm mt-2">{revision.revised_text}</p>
    </details>)}</div>
  </section>;
}
