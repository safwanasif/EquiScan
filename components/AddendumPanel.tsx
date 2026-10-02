"use client";

import React, { useState } from "react";
import { ScanResult, Addendum } from "@/lib/types";

interface Props {
  originalText: string;
  scanResult: ScanResult;
  addendum: Addendum | null;
  setAddendum: (a: Addendum | null) => void;
}

export default function AddendumPanel({
  originalText,
  scanResult,
  addendum,
  setAddendum,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/addendum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalText, scanResult }),
      });
      if (!response.ok) throw new Error("Addendum generation failed");
      const data: Addendum = await response.json();
      setAddendum(data);
    } catch (err) {
      console.error(err);
      setError("Could not generate addendum. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!addendum) return;
    const fullText = `${addendum.title}\n\n${addendum.content}`;
    navigator.clipboard.writeText(fullText);
  };

  if (!addendum && !loading) {
    return (
      <div className="bg-ink text-paper rounded-sm p-10 mt-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-rose" />
            <span className="font-mono text-[11px] tracking-widest text-paper/60 uppercase">
              The Missing Chapter
            </span>
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight mb-4">
            Generate the content
            <br />
            that should have been there.
          </h2>
          <p className="text-paper/70 text-lg leading-relaxed mb-8 max-w-2xl">
            Generate a draft &ldquo;Sex and Gender
            Considerations&rdquo; addendum in the same clinical register as the
            original, addressing every bias pattern found in the scan.
          </p>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-3 bg-rose text-paper px-6 py-4 text-base hover:bg-rose-dim transition-colors rounded-sm group"
          >
            <span>Generate the missing chapter</span>
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
            Writing the missing chapter
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
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-xs font-mono uppercase tracking-widest py-2 px-4 border border-line hover:border-ink transition-colors rounded-sm"
          >
            Copy
          </button>
          <button
            onClick={() => setAddendum(null)}
            className="text-xs font-mono uppercase tracking-widest py-2 px-4 bg-ink text-paper hover:bg-rose transition-colors rounded-sm"
          >
            Regenerate
          </button>
        </div>
      </div>

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