"use client";
import { useState } from "react";
import { previewEdits } from "@/lib/analysis/edits";
import type { ScanResult } from "@/lib/types";

export default function RevisionPreview({ source, result }: { source: string; result: ScanResult }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  let revised = source;
  let error = "";
  try {
    revised = previewEdits(source, result.flags.filter(flag => selected.includes(flag.id))
      .map(flag => ({ id: flag.id, quote: flag.flaggedSentence, replacement: flag.suggestedRewrite }))).revised;
  } catch (failure) { error = failure instanceof Error ? failure.message : "Could not apply selected edits."; }
  const download = () => {
    const url = URL.createObjectURL(new Blob([revised], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "equiscan-revised-draft.txt";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  return <section className="mt-10 border border-line p-6 rounded-sm" aria-labelledby="revision-title">
    <h2 id="revision-title" className="font-serif text-3xl mb-3">Preview a revised draft</h2>
    <p className="text-sm text-muted mb-5">Choose suggested edits to preview. Your original audit and review decisions stay unchanged. This draft is temporary; download a copy before leaving. Check every edit before use.</p>
    <div className="space-y-3 mb-6">{result.flags.map(flag => <label key={flag.id} className="flex gap-3 text-sm">
      <input type="checkbox" checked={selected.includes(flag.id)} onChange={event => { setMessage(""); setSelected(previous => event.target.checked ? [...previous, flag.id] : previous.filter(id => id !== flag.id)); }} />
      <span><del className="text-muted">{flag.flaggedSentence}</del><br /><ins className="no-underline">{flag.suggestedRewrite}</ins></span>
    </label>)}</div>
    {error ? <p role="alert" className="text-rose text-sm mb-4">{error}</p> : null}
    <div className="grid md:grid-cols-2 gap-5">
      <div><h3 className="font-semibold mb-2">Original</h3><p className="whitespace-pre-wrap text-sm border border-line p-4">{source}</p></div>
      <div><h3 className="font-semibold mb-2">Revised preview</h3><p className="whitespace-pre-wrap text-sm border border-line p-4">{error ? "Resolve the selection conflict to preview a draft." : revised}</p></div>
    </div>
    <div className="flex flex-wrap gap-4 mt-5">
      <button disabled={Boolean(error) || !selected.length} onClick={download} className="bg-ink text-paper px-4 py-2 rounded-sm disabled:opacity-40">Download revised text</button>
      <button onClick={() => { setSelected([]); setMessage("All proposed edits undone."); }} className="underline">Undo all edits</button>
    </div>
    <p role="status" className="text-sm text-muted mt-3">{message}</p>
  </section>;
}
