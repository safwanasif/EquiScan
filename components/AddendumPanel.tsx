"use client";

import React, { useState } from "react";
import { ScanResult, Addendum } from "@/lib/types";

interface Props {
  originalText: string;
  scanResult: ScanResult;
  addendum: Addendum | null;
  setAddendum: (a: Addendum | null) => void;
  scanId?: string;
}

export default function AddendumPanel({
  originalText,
  scanResult,
  addendum,
  setAddendum,
  scanId,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/addendum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalText, scanResult }),
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => null);
        throw new Error(failure?.error || "Could not generate addendum. Try again.");
      }
      const data: Addendum = await response.json();
      setAddendum(data);
      setSaveMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate addendum. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!addendum) return;
    const fullText = `${addendum.title}\n\n${addendum.content}`;
    navigator.clipboard.writeText(fullText);
  };

  if (scanResult.flags.length === 0) return null;

  if (!addendum && !loading) {
    return (
      <div className="bg-ink text-paper rounded-sm p-10 mt-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-rose" />
            <span className="font-mono text-[11px] tracking-widest text-paper/60 uppercase">
              Draft for review
            </span>
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight mb-4">
            Draft an editorial addendum.
          </h2>
          <p className="text-paper/70 text-lg leading-relaxed mb-8 max-w-2xl">
            Draft a short note addressing the flagged language. Check every claim
            before use. Save the draft to your audit or export it to keep a copy.
          </p>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-3 bg-rose text-paper px-6 py-4 text-base hover:bg-rose-dim transition-colors rounded-sm group"
          >
            <span>Generate draft addendum</span>
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>
              {"\u2192"}
            </span>
          </button>
          {error ? (
            <p className="mt-4 text-sm text-rose-soft">{error}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-ink text-paper rounded-sm p-10 mt-12">
        <div className="max-w-3xl mx-auto text-center py-12">
          <p className="section-label text-paper/60 mb-6">
            Preparing a draft for review
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 bg-rose rounded-full slow-pulse" />
            <span className="w-2 h-2 bg-rose rounded-full slow-pulse" style={{ animationDelay: "0.2s" }} />
            <span className="w-2 h-2 bg-rose rounded-full slow-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
          <p className="font-serif text-xl text-paper/80 italic">
            Drafting in clinical register.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper border border-line rounded-sm p-10 mt-12 shadow-[0_24px_60px_-20px_rgba(10,10,10,0.12)]">
      <div className="flex items-start justify-between gap-6 mb-8 pb-6 border-b border-line">
        <div>
          <p className="section-label mb-3">Generated Addendum</p>
          <h2 className="font-serif text-4xl tracking-tight text-ink leading-tight">
            {addendum ? addendum.title : ""}
          </h2>
          <p className="text-sm text-muted mt-2">
            {addendum ? addendum.wordCount : 0} words
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {scanId ? <button disabled={saving} onClick={async () => {
            setSaving(true); setSaveMessage("");
            try {
              const response = await fetch("/api/editorial-draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scanId, addendum }) });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error || "Could not save draft.");
              setSaveMessage("Draft saved. It will reopen with this audit.");
            } catch (failure) { setSaveMessage(failure instanceof Error ? failure.message : "Could not connect. Export to keep a copy."); }
            finally { setSaving(false); }
          }} className="text-xs font-mono uppercase py-2 px-4 border border-line disabled:opacity-40">{saving ? "Saving…" : "Save draft"}</button> : null}
          <button
            onClick={handleCopy}
            className="text-xs font-mono uppercase tracking-widest py-2 px-4 border border-line hover:border-ink transition-colors rounded-sm"
          >
            Copy
          </button>
          <button
            disabled={saving}
            onClick={() => { setAddendum(null); setSaveMessage(""); }}
            className="text-xs font-mono uppercase tracking-widest py-2 px-4 bg-ink text-paper hover:bg-rose transition-colors rounded-sm"
          >
            Regenerate
          </button>
        </div>
      </div>

      {saveMessage ? <p role="status" className="text-sm text-muted mb-4">{saveMessage}</p> : null}

      {addendum && addendum.topicsCovered && addendum.topicsCovered.length > 0 ? (
        <div className="mb-8">
          <p className="section-label mb-3">Topics Covered</p>
          <div className="flex flex-wrap gap-2">
            {addendum.topicsCovered.map((topic: string, i: number) => (
              <span
                key={i}
                className="text-xs font-sans py-1.5 px-3 bg-rose-soft text-rose-dim rounded-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="font-serif text-[16px] text-ink/90 leading-[1.75] whitespace-pre-wrap max-w-3xl">
        {addendum ? addendum.content : ""}
      </div>
    </div>
  );
}
