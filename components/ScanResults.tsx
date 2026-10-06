"use client";

import React, { useRef, useState } from "react";
import { ScanResult, BiasFlag, BiasCategory, Addendum } from "@/lib/types";
import { BIAS_CATEGORIES } from "@/data/biasCategories";
import ReviewerNote from "@/components/ReviewerNote";
import RevisionPreview from "@/components/RevisionPreview";

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
  initialNotes?: Record<string, string>;
  scanId?: string;
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
  initialNotes = {},
  scanId,
}: Props) {
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);
  const passageRefs = useRef<Record<string, HTMLElement | null>>({});
  const goToPassage = (flag: BiasFlag) => {
    setExpandedFlag(flag.id);
    const passage = passageRefs.current[flag.id];
    if (!passage) {
      setActionError("This passage overlaps another highlighted finding. Locate the quoted text in the analyzed document.");
      return;
    }
    setActionError(null);
    passage.scrollIntoView({ behavior: "smooth", block: "center" });
    passage.focus({ preventScroll: true });
  };
  const [rewrites, setRewrites] = useState<RewritesMap>({});
  const [loadingRewrite, setLoadingRewrite] = useState<string | null>(null);
  const [activeRewriteMode, setActiveRewriteMode] = useState<ModeMap>({});
  const [exporting, setExporting] = useState<boolean>(false);
  const [flagStatuses, setFlagStatuses] = useState<StatusMap>(initialStatuses);
  const [reviewerNotes, setReviewerNotes] = useState(initialNotes);
  const [updatingFlag, setUpdatingFlag] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<BiasCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<FlagStatus | "all">("all");

  const [actionError, setActionError] = useState<string | null>(null);

  const gradeStyle = GRADE_COLORS[result.letterGrade] || GRADE_COLORS.F;

  const getFlagStatus = (flagId: string): FlagStatus => {
    return flagStatuses[flagId] || "open";
  };
  const reviewedCount = result.flags.filter(flag => getFlagStatus(flag.id) !== "open").length;
  const visibleFlags = result.flags.filter(flag =>
    (categoryFilter === "all" || flag.category === categoryFilter) &&
    (statusFilter === "all" || getFlagStatus(flag.id) === statusFilter));

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
        body: JSON.stringify({ result, addendum, documentTitle, originalText, reviewerNotes, reviewDecisions: Object.fromEntries(result.flags.map(flag => [flag.id, getFlagStatus(flag.id)])) }),
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

      // Allow browsers time to begin reading the Blob before releasing it.
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error("Action failed");
      setActionError(err instanceof Error ? err.message : "Action failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExpandFlag = (flag: BiasFlag) => {
    const willExpand = expandedFlag !== flag.id;
    setExpandedFlag(willExpand ? flag.id : null);

    if (demo) {
      setRewrites(prev => ({ ...prev, [flag.id]: { conservative: flag.suggestedRewrite, balanced: flag.suggestedRewrite, comprehensive: flag.suggestedRewrite } }));
      return;
    }

  };

  const generateRewrites = async (flag: BiasFlag) => {
    if (!rewrites[flag.id] && !loadingRewrite) {
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
          ref={element => { passageRefs.current[flag.id] = element; }}
          tabIndex={0}
          role="button"
          aria-label={`Review highlighted passage: ${flag.flaggedSentence}`}
          onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handleExpandFlag(flag); } }}
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
      {actionError ? <p role="alert" className="mb-4 text-sm text-rose lg:col-span-3">{actionError}</p> : null}
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
                  AI CONCERN SCORE {result.documentBiasScore}/10
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

          <p className="text-sm text-muted mt-5">
            Lower means fewer estimated sex or gender bias concerns. This is an
            uncalibrated AI estimate, not a percentage or a medical accuracy rating.
            A zero means no supported concerns were identified in this excerpt;
            review the individual findings rather than relying on the number alone.
            Reviewing a finding does not recalculate this original scan score.
          </p>
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
          <p className="section-label mb-2">Flags {result.flags.length}</p>
          <p role="status" className="text-sm text-muted mb-3">{reviewedCount} of {result.flags.length} reviewed</p>
          {result.flags.length > 0 ? <div className="bg-white border border-line rounded-sm p-3 mb-4 space-y-3">
            <label className="block text-sm">Category
              <select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value as BiasCategory | "all")} className="block w-full border border-line p-2 mt-1 bg-white rounded-sm">
                <option value="all">All categories</option>
                {Object.values(BIAS_CATEGORIES).filter(category => result.flags.some(flag => flag.category === category.id)).map(category => <option key={category.id} value={category.id}>{category.shortLabel}</option>)}
              </select>
            </label>
            <label className="block text-sm">Review status
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as FlagStatus | "all")} className="block w-full border border-line p-2 mt-1 bg-white rounded-sm">
                <option value="all">All statuses</option>
                {(["open", "accepted", "resolved", "dismissed"] as FlagStatus[]).map(status => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
              </select>
            </label>
            <p className="text-xs text-muted">Showing {visibleFlags.length} of {result.flags.length}. Filters affect this list; reports include all findings.</p>
          </div> : null}
          {result.flags.length > 0 && visibleFlags.length === 0 ? <p className="text-sm text-muted py-4">No findings match these filters.</p> : null}

          <div className="space-y-3">
            {visibleFlags.map((flag: BiasFlag) => {
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
                          <div className="mt-3"><p className="text-xs text-muted">
                            Marked as {status}. {demo ? "Example decision only; not saved online." : "Your audit library reflects saved review decisions."}
                          </p><button onClick={() => updateFlagStatus(flag, "open")} disabled={isUpdating || (!demo && !flagIdMap[flag.id])} className="text-xs underline underline-offset-4 mt-2 disabled:opacity-40">Reopen finding</button></div>
                        ) : null}
                      </div>

                      {!demo && flagIdMap[flag.id] ? <ReviewerNote flagId={flagIdMap[flag.id]} initialNote={reviewerNotes[flag.id] || ""} onSaved={note => setReviewerNotes(previous => ({ ...previous, [flag.id]: note }))} /> : null}
                      <button onClick={() => goToPassage(flag)} className="block text-sm underline underline-offset-4 mt-4 mb-4">Go to passage in analyzed text</button>
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

                      {!flagRewrites ? (
                        <div>
                          <p className="section-label mb-2">Suggested edit</p>
                          <p className="text-sm text-ink leading-relaxed font-serif">{flag.suggestedRewrite}</p>
                          {!demo ? <button onClick={() => generateRewrites(flag)} disabled={Boolean(loadingRewrite)} className="mt-3 text-sm underline underline-offset-4 disabled:opacity-40">Generate alternative rewrites</button> : null}
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
      {!demo && result.flags.length > 0 ? <div className="lg:col-span-3"><RevisionPreview source={originalText} result={result} scanId={scanId} /></div> : null}
    </div>
  );
}
