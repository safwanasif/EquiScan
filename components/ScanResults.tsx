"use client";

import React, { useState } from "react";
import { ScanResult, BiasFlag, BiasCategory, Addendum } from "@/lib/types";
import { BIAS_CATEGORIES } from "@/data/biasCategories";

type RewriteMode = "conservative" | "balanced" | "comprehensive";
type FlagStatus = "open" | "accepted" | "resolved" | "dismissed";

type Rewrites = {
  conservative: string;
  balanced: string;
  comprehensive: string;
};

type RewritesMap = { [flagId: string]: Rewrites };
type ModeMap = { [flagId: string]: RewriteMode };
type StatusMap = { [flagId: string]: FlagStatus };
type FlagIdMap = { [localFlagId: string]: string };

interface Props {
  originalText: string;
  result: ScanResult;
  addendum?: Addendum | null;
  documentTitle?: string;
  flagIdMap?: FlagIdMap;
  demo?: boolean;
  initialStatuses?: StatusMap;
}

const GRADE_COLORS: { [key: string]: { bg: string; text: string } } = {
  A: { bg: "bg-green-50", text: "text-green-800" },
  B: { bg: "bg-lime-50", text: "text-lime-800" },
  C: { bg: "bg-yellow-50", text: "text-yellow-800" },
  D: { bg: "bg-orange-50", text: "text-orange-800" },
  F: { bg: "bg-rose-soft", text: "text-rose" },
};

export default function ScanResults({
  originalText,
  result,
  addendum,
  documentTitle,
  flagIdMap = {},
  demo = false,
  initialStatuses = {},
}: Props) {
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);
  const [rewrites, setRewrites] = useState<RewritesMap>({});
  const [loadingRewrite, setLoadingRewrite] = useState<string | null>(null);
  const [activeRewriteMode, setActiveRewriteMode] = useState<ModeMap>({});
  const [exporting, setExporting] = useState<boolean>(false);
  const [flagStatuses, setFlagStatuses] = useState<StatusMap>(initialStatuses);
  const [updatingFlag, setUpdatingFlag] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);

  const gradeStyle = GRADE_COLORS[result.letterGrade] || GRADE_COLORS.F;

  const getFlagStatus = (flagId: string): FlagStatus => {
    return flagStatuses[flagId] || "open";
  };

  const updateFlagStatus = async (flag: BiasFlag, status: FlagStatus) => {
    if (demo) {
      setFlagStatuses(prev => ({ ...prev, [flag.id]: status }));
      return;
    }
    const dbFlagId = flagIdMap[flag.id];
    if (!dbFlagId) return;
    setReviewError(null);
    setUpdatingFlag(flag.id);

    try {
      const response = await fetch("/api/update-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagId: dbFlagId, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update flag");
      }

      setFlagStatuses((prev) => ({
        ...prev,
        [flag.id]: status,
      }));
    } catch (err) {
      console.error("Action failed");
      setActionError(err instanceof Error ? err.message : "Action failed. Please try again.");
      setReviewError("Could not save your review decision. Please try again.");
    } finally {
      setUpdatingFlag(null);
    }
  };

  const handleExport = async () => {
    if (demo) {
      const blob = new Blob([JSON.stringify({ sample: true, documentTitle, originalText, result, reviewDecisions: flagStatuses }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "equiscan-prepared-sample.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    setExporting(true);
    setActionError(null);

    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, addendum, documentTitle }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `equiscan-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Action failed");
      setActionError(err instanceof Error ? err.message : "Action failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExpandFlag = async (flag: BiasFlag) => {
    const willExpand = expandedFlag !== flag.id;
    setExpandedFlag(willExpand ? flag.id : null);

    if (demo) {
      setRewrites(prev => ({ ...prev, [flag.id]: { conservative: flag.suggestedRewrite, balanced: flag.suggestedRewrite, comprehensive: flag.suggestedRewrite } }));
      return;
    }

    if (willExpand && !rewrites[flag.id]) {
      setLoadingRewrite(flag.id);
      setActionError(null);

      try {
        const response = await fetch("/api/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flaggedSentence: flag.flaggedSentence,
            category: flag.category,
          }),
        });

        if (!response.ok) {
          const failure = await response.json().catch(() => null);
          throw new Error(failure?.error || "Rewrite generation failed. Please try again later.");
        }

        const data: Rewrites = await response.json();

        setRewrites((prev) => ({ ...prev, [flag.id]: data }));
        setActiveRewriteMode((prev) => ({
          ...prev,
          [flag.id]: "balanced",
        }));
      } catch (err) {
        console.error("Action failed");
      setActionError(err instanceof Error ? err.message : "Action failed. Please try again.");
      } finally {
        setLoadingRewrite(null);
      }
    }
  };

  const renderDocumentWithHighlights = (): React.ReactNode => {
    const elements: React.ReactNode[] = [];
    let key = 0;

    const sortedFlags = [...result.flags].sort(
      (a, b) =>
        originalText.indexOf(a.flaggedSentence) -
        originalText.indexOf(b.flaggedSentence)
    );

    let cursor = 0;

    for (const flag of sortedFlags) {
      const idx = originalText.indexOf(flag.flaggedSentence, cursor);

      if (idx === -1) {
        continue;
      }

      if (idx > cursor) {
        elements.push(
          <span key={key++}>{originalText.slice(cursor, idx)}</span>
        );
      }

      const isActive = expandedFlag === flag.id;
      const status = getFlagStatus(flag.id);

      elements.push(
        <mark
          key={key++}
          onClick={() => handleExpandFlag(flag)}
          className={`cursor-pointer transition-all ${
            status !== "open"
              ? "bg-green-50"
              : isActive
                ? "bg-rose-soft"
                : "bg-rose-soft/60 hover:bg-rose-soft"
          }`}
          style={{
            boxShadow:
              isActive && status === "open"
                ? "inset 0 -3px 0 #9F1239"
                : "none",
            padding: "1px 2px",
          }}
        >
          {flag.flaggedSentence}
        </mark>
      );

      cursor = idx + flag.flaggedSentence.length;
    }

    if (cursor < originalText.length) {
      elements.push(<span key={key++}>{originalText.slice(cursor)}</span>);
    }

    return elements;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {actionError ? <p role="alert" className="mb-4 text-sm text-rose">{actionError}</p> : null}
      <p className="mb-4 text-sm text-muted lg:col-span-3">{demo ? "Prepared demonstration. The same example edit is shown in each rewrite mode." : "AI-generated findings may be incorrect."} Grades are not clinically validated; no findings does not establish that a document is unbiased.</p>
      <div className="lg:col-span-2">
        <div className="bg-white border border-line rounded-sm p-8 mb-6 shadow-[0_8px_24px_-12px_rgba(10,10,10,0.08)]">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="section-label mb-3">Provisional review grade</p>
              <div className="flex items-baseline gap-4">
                <span
                  className={`font-serif text-7xl leading-none ${gradeStyle.text}`}
                >
                  {result.letterGrade}
                </span>
                <span className="font-mono text-sm text-muted">
                  BIAS SCORE {result.documentBiasScore}/10
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">
                Flags Detected
              </p>
              <p className="font-serif text-5xl text-ink leading-none">
                {result.totalFlags}
              </p>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="mt-4 inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 text-[11px] font-mono tracking-widest uppercase hover:bg-rose transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <span className="slow-pulse">Generating</span>
                ) : (
                  <span>{demo ? "Download sample JSON" : "Download Report"}</span>
                )}
              </button>
            </div>
          </div>

          <p className="text-ink/80 leading-relaxed mt-6 pt-6 border-t border-line">
            {result.summary}
          </p>
        </div>

        <div className="bg-white border border-line rounded-sm p-8 shadow-[0_8px_24px_-12px_rgba(10,10,10,0.08)]">
          <p className="section-label mb-4">Analyzed Document</p>
          <div className="font-serif text-[15px] text-ink/90 leading-relaxed whitespace-pre-wrap">
            {renderDocumentWithHighlights()}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
          <p className="section-label mb-4">Flags {result.flags.length}</p>

          <div className="space-y-3">
            {result.flags.map((flag: BiasFlag) => {
              const categoryDef = BIAS_CATEGORIES[flag.category as BiasCategory];
              const isExpanded = expandedFlag === flag.id;
              const isLoading = loadingRewrite === flag.id;
              const flagRewrites = rewrites[flag.id];
              const activeMode = activeRewriteMode[flag.id] || "balanced";
              const status = getFlagStatus(flag.id);
              const isUpdating = updatingFlag === flag.id;

              return (
                <div
                  key={flag.id}
                  className={`bg-white border rounded-sm transition-all ${
                    isExpanded ? "border-rose" : "border-line"
                  } ${status !== "open" ? "opacity-80" : ""}`}
                >
                  <button
                    onClick={() => handleExpandFlag(flag)}
                    className="w-full text-left p-4 hover:bg-paperShade/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] tracking-widest text-rose uppercase">
                        {categoryDef ? categoryDef.shortLabel : flag.category}
                      </span>
                      <span className="font-mono text-[10px] tracking-widest text-muted uppercase">
                        {status === "open"
                          ? `Severity ${flag.severity}`
                          : status}
                      </span>
                    </div>

                    <p className="text-sm text-ink font-medium line-clamp-2 mb-2">
                      &ldquo;{flag.flaggedSentence}&rdquo;
                    </p>

                    <p className="text-xs text-muted leading-relaxed">
                      {flag.explanation}
                    </p>
                  </button>

                  {isExpanded ? (
                    <div className="border-t border-line p-4 bg-paperShade/30">
                      <div className="mb-4 pb-4 border-b border-line">
                        <p className="font-mono text-[10px] tracking-widest text-muted uppercase mb-2">
                          Resolution
                        </p>
                        {(!demo && !flagIdMap[flag.id]) ? <p className="text-xs text-muted mb-3">Save this audit to a workspace before recording review decisions.</p> : null}
                        {reviewError ? <p role="alert" className="text-xs text-rose mb-3">{reviewError}</p> : null}

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() =>
                              updateFlagStatus(flag, "accepted")
                            }
                            disabled={isUpdating || (!demo && !flagIdMap[flag.id])}
                            className="text-[10px] font-mono tracking-widest uppercase py-2 px-2 bg-ink text-paper hover:bg-rose transition-colors rounded-sm disabled:opacity-40"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              updateFlagStatus(flag, "resolved")
                            }
                            disabled={isUpdating || (!demo && !flagIdMap[flag.id])}
                            className="text-[10px] font-mono tracking-widest uppercase py-2 px-2 border border-line hover:border-ink transition-colors rounded-sm disabled:opacity-40"
                          >
                            Resolve
                          </button>

                          <button
                            onClick={() =>
                              updateFlagStatus(flag, "dismissed")
                            }
                            disabled={isUpdating || (!demo && !flagIdMap[flag.id])}
                            className="text-[10px] font-mono tracking-widest uppercase py-2 px-2 border border-line hover:border-ink transition-colors rounded-sm disabled:opacity-40"
                          >
                            Dismiss
                          </button>
                        </div>

                        {status !== "open" ? (
                          <p className="text-xs text-muted mt-3">
                            Marked as {status}. {demo ? "Example decision only; not saved online." : "Refresh dashboard to update workspace metrics."}
                          </p>
                        ) : null}
                      </div>

                      {isLoading ? (
                        <p className="text-xs text-muted font-mono uppercase tracking-widest slow-pulse">
                          Generating rewrites
                        </p>
                      ) : null}

                      {flag.citation ? (
                        <div className="mb-4 pb-4 border-b border-line">
                          <p className="font-mono text-[10px] tracking-widest text-muted uppercase mb-2">
                            Grounded in
                          </p>

                          <p className="font-serif text-sm text-ink leading-snug mb-2">
                            {flag.citation.text}
                          </p>

                          <p className="text-xs text-muted leading-relaxed italic mb-2">
                            {flag.citation.relevance}
                          </p>

                          {flag.citation.pubmedId ? (
                            <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${flag.citation.pubmedId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-rose uppercase hover:text-rose-dim transition-colors"
                            >
                              <span>View on PubMed</span>
                              <span aria-hidden>{"\u2197"}</span>
                            </a>
                          ) : null}
                        </div>
                      ) : null}

                      {flagRewrites ? (
                        <div>
                          <div className="flex gap-1 mb-3">
                            {(["conservative", "balanced", "comprehensive"] as RewriteMode[]).map(
                              (mode) => (
                                <button
                                  key={mode}
                                  onClick={() =>
                                    setActiveRewriteMode((prev) => ({
                                      ...prev,
                                      [flag.id]: mode,
                                    }))
                                  }
                                  className={`flex-1 text-[10px] font-mono tracking-widest uppercase py-1.5 px-2 transition-colors rounded-sm ${
                                    activeMode === mode
                                      ? "bg-ink text-paper"
                                      : "bg-white text-muted hover:text-ink border border-line"
                                  }`}
                                >
                                  {mode === "conservative"
                                    ? "Cons"
                                    : mode === "balanced"
                                      ? "Bal"
                                      : "Comp"}
                                </button>
                              )
                            )}
                          </div>

                          <p className="text-sm text-ink leading-relaxed font-serif">
                            {flagRewrites[activeMode]}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
