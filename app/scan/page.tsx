"use client";

import React, { useState } from "react";
import { MAX_SCAN_CHARACTERS } from "@/lib/analysis/validate";
import Navbar from "@/components/Navbar";
import ScanResults from "@/components/ScanResults";
import AddendumPanel from "@/components/AddendumPanel";
import { SAMPLE_DOCS, SampleDoc } from "@/data/sampleDocs";
import { ScanResult, Addendum } from "@/lib/types";

type InputMode = "sample" | "paste" | "upload";

type SavedScan = {
  workspaceId: string;
  documentId: string;
  scanId: string;
  flagIdMap: Record<string, string>;
};

export default function ScanPage() {
  const [inputMode, setInputMode] = useState<InputMode>("sample");
  const [pastedText, setPastedText] = useState<string>("");
  const [selectedSample, setSelectedSample] = useState<string>(SAMPLE_DOCS[0].id);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedText, setUploadedText] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [pdfPages, setPdfPages] = useState<Array<{ pageNumber: number; text: string }>>([]);
  const [firstPage, setFirstPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [analyzedText, setAnalyzedText] = useState<string>("");
  const [analyzedTitle, setAnalyzedTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [addendum, setAddendum] = useState<Addendum | null>(null);
  const [savedScan, setSavedScan] = useState<SavedScan | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>("");

  const getCurrentSample = (): SampleDoc | undefined => {
    return SAMPLE_DOCS.find((d) => d.id === selectedSample);
  };

  const getCurrentText = (): string => {
    if (inputMode === "sample") {
      return getCurrentSample()?.text || "";
    }

    if (inputMode === "paste") {
      return pastedText;
    }

    return pdfPages.length ? pdfPages.filter(page => page.pageNumber >= firstPage && page.pageNumber <= lastPage)
      .map(page => page.text).join("\n\n") : uploadedText;
  };

  const getDocumentTitle = (): string => {
    if (inputMode === "sample") {
      return getCurrentSample()?.title || "Sample Document";
    }

    if (inputMode === "upload") {
      return pdfPages.length ? `${uploadedFileName} · pages ${firstPage}–${lastPage}` : uploadedFileName || "Uploaded PDF";
    }

    return "Pasted Medical Text";
  };

  const saveScanToDatabase = async (
    text: string,
    result: ScanResult
  ): Promise<SavedScan | null> => {
    const response = await fetch("/api/save-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: getDocumentTitle(),
        sourceType: inputMode === "upload" ? "pdf" : inputMode,
        rawText: text,
        result,
      }),
    });

    if (!response.ok) {
      setSaveMessage(response.status === 401
        ? "Not saved. Sign in before your next scan to save it to your workspace. You can still download this report."
        : "Analysis complete, but saving failed. Download your report to keep a copy.");
      return null;
    }

    return response.json();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadedText("");
    setPdfPages([]);
    setError(null);
    setUploadedFileName(file.name);

    if (file.size > 4_000_000) {
      setError("PDF must be 4 MB or smaller. Use a smaller PDF or paste a short section.");
      setUploadedFileName("");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const failure = await response.json().catch(() => null);
        throw new Error(failure?.error || "Could not read that PDF. Try another file or paste the text.");
      }

      const data = await response.json();
      setUploadedText(data.text);
      setPdfPages(data.pages);
      setFirstPage(1);
      // Start with one page; users explicitly choose broader coverage.
      setLastPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that PDF. Try another file or paste the text.");
      setUploadedFileName("");
    } finally {
      setUploading(false);
    }
  };

  const handleScan = async () => {
    const text = getCurrentText();

    if (!text || text.trim().length < 50) {
      setError("Please provide at least 50 characters of medical text to scan.");
      return;
    }

    if (text.length > MAX_SCAN_CHARACTERS) {
      setError("Use a section of up to 8,000 characters. Your text will not be silently shortened.");
      return;
    }

    setScanning(true);
    setError(null);
    setScanResult(null);
    setAnalyzedText("");
    setAnalyzedTitle(getDocumentTitle());
    setAddendum(null);
    setSavedScan(null);
    setSaveMessage("");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const failure = await response.json().catch(() => null);
        throw new Error(failure?.error || "Analysis is unavailable. Please try again later.");
      }

      const data: ScanResult = await response.json();

      setScanResult(data);
      setAnalyzedText(text);

      setSaveMessage("Saving to workspace...");
      // Persistence failures must not turn a successful analysis into a scan error.
      try {
        const saved = await saveScanToDatabase(text, data);
        setSavedScan(saved);
      } catch {
        setSaveMessage("Analysis complete, but saving failed. Download your report to keep a copy.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Could not connect. Please try again later.");
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setAnalyzedText("");
    setError(null);
    setAddendum(null);
    setSavedScan(null);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-24">
        <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-rose" />
            <span className="section-label">Analysis</span>
          </div>

          <h1 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight mb-3">
            {scanResult ? "Analysis complete." : "Begin an analysis."}
          </h1>

          <p className="text-muted text-lg leading-relaxed max-w-2xl">
            {scanResult
              ? "Review potential concerns and suggested edits. Findings require human judgment."
              : "Select a sample document, paste medical text, or upload a PDF."}
          </p>
        </section>

        {!scanResult ? (
          <section className="max-w-6xl mx-auto px-6 lg:px-10">
            <div className="bg-white border border-line rounded-sm shadow-[0_8px_24px_-12px_rgba(10,10,10,0.08)]">
              <div className="flex border-b border-line">
                <button
                  onClick={() => setInputMode("sample")}
                  className={`flex-1 px-6 py-4 text-sm font-mono tracking-widest uppercase transition-colors ${
                    inputMode === "sample"
                      ? "bg-ink text-paper"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Sample
                </button>

                <button
                  onClick={() => setInputMode("paste")}
                  className={`flex-1 px-6 py-4 text-sm font-mono tracking-widest uppercase transition-colors border-l border-line ${
                    inputMode === "paste"
                      ? "bg-ink text-paper"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Paste
                </button>

                <button
                  onClick={() => setInputMode("upload")}
                  className={`flex-1 px-6 py-4 text-sm font-mono tracking-widest uppercase transition-colors border-l border-line ${
                    inputMode === "upload"
                      ? "bg-ink text-paper"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Upload PDF
                </button>
              </div>

              <div className="p-8">
                <p className="text-sm text-muted mb-6">
                  Live AI requires sign-in. Scans, alternative rewrites, and addenda share
                  an allowance of 8 requests per user daily, with 20 daily across the app
                  and one request per calendar minute. Daily limits reset at midnight UTC.
                  {" "}<a href="/demo" className="underline">Explore the prepared demo without login.</a>
                </p>
                {inputMode === "sample" ? (
                  <div>
                    <p className="section-label mb-4">Choose a sample</p>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      {SAMPLE_DOCS.map((doc: SampleDoc) => {
                        const isActive = selectedSample === doc.id;

                        return (
                          <button
                            key={doc.id}
                            onClick={() => setSelectedSample(doc.id)}
                            className={`text-left p-5 border rounded-sm transition-all ${
                              isActive
                                ? "border-rose bg-rose-soft/30"
                                : "border-line hover:border-ink"
                            }`}
                          >
                            <p className="font-mono text-[10px] tracking-widest text-rose uppercase mb-2">
                              {doc.source}
                            </p>
                            <p className="font-serif text-lg text-ink leading-tight mb-2">
                              {doc.title}
                            </p>
                            <p className="text-xs text-muted leading-relaxed">
                              {doc.excerpt}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="bg-paperShade/50 border border-line rounded-sm p-6">
                      <p className="section-label mb-3">Preview</p>
                      <p className="font-serif text-sm text-ink/80 leading-relaxed line-clamp-6 whitespace-pre-wrap">
                        {getCurrentText().slice(0, 400)}...
                      </p>
                    </div>
                  </div>
                ) : null}

                {inputMode === "paste" ? (
                  <div>
                    <p className="section-label mb-4">Paste medical text</p>
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste a textbook chapter, research paper excerpt, or curriculum section here..."
                      className="w-full min-h-70 p-5 border border-line rounded-sm font-serif text-[15px] leading-relaxed bg-paper focus:outline-none focus:border-ink transition-colors resize-none"
                    />
                    <p className="text-xs text-muted mt-2 font-mono">
                      {pastedText.length} / {MAX_SCAN_CHARACTERS.toLocaleString("en-US")} characters
                    </p>
                  </div>
                ) : null}

                {inputMode === "upload" ? (
                  <div>
                    <p className="section-label mb-4">Upload a PDF</p>
                    <label className="block border-2 border-dashed border-line rounded-sm p-12 text-center cursor-pointer hover:border-ink transition-colors">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {uploading ? (
                        <p className="font-mono text-xs tracking-widest text-rose uppercase slow-pulse">
                          Extracting text
                        </p>
                      ) : uploadedFileName ? (
                        <div>
                          <p className="font-serif text-xl text-ink mb-1">
                            {uploadedFileName}
                          </p>
                          <p className="text-xs text-muted">
                            {uploadedText.length} characters extracted. Click to
                            replace.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-serif text-xl text-ink mb-1">
                            Click to choose a PDF
                          </p>
                          <p className="text-xs text-muted">
                            Max 4 MB. Analysis supports up to 8,000 extracted characters.
                          </p>
                        </div>
                      )}
                    </label>
                    {pdfPages.length > 0 ? <div className="mt-6 space-y-4">
                      <p className="text-sm text-muted">{pdfPages.length} pages extracted. Select the pages to analyse; the rest will not be scanned. PDF page numbers may differ from printed page labels.</p>
                      <div className="flex flex-wrap gap-4">
                        <label className="text-sm">From page
                          <select value={firstPage} onChange={event => { const page = Number(event.target.value); setFirstPage(page); setLastPage(Math.max(page, lastPage)); }} className="block border border-line bg-paper p-2 mt-1">
                            {pdfPages.map(page => <option key={page.pageNumber} value={page.pageNumber}>{page.pageNumber}</option>)}
                          </select>
                        </label>
                        <label className="text-sm">Through page
                          <select value={lastPage} onChange={event => setLastPage(Number(event.target.value))} className="block border border-line bg-paper p-2 mt-1">
                            {pdfPages.filter(page => page.pageNumber >= firstPage).map(page => <option key={page.pageNumber} value={page.pageNumber}>{page.pageNumber}</option>)}
                          </select>
                        </label>
                      </div>
                      <p className="text-sm text-muted">Selected pages: {firstPage}–{lastPage} of {pdfPages.length}. {getCurrentText().length.toLocaleString()} / 8,000 characters.</p>
                      {pdfPages.some(page => page.pageNumber >= firstPage && page.pageNumber <= lastPage && !page.text.trim()) ? <p role="alert" className="text-sm text-rose">Some selected pages have no extracted text. Images and scanned pages are not analysed; paste their text manually.</p> : null}
                      {getCurrentText().length > MAX_SCAN_CHARACTERS ? <p role="alert" className="text-sm text-rose">Select fewer pages or paste a shorter section. Nothing will be silently shortened.</p> : null}
                      <details><summary className="text-sm cursor-pointer">Preview selected text</summary><pre className="mt-3 whitespace-pre-wrap text-sm max-h-64 overflow-auto border border-line p-3">{getCurrentText()}</pre></details>
                    </div> : null}
                  </div>
                ) : null}

                {error ? (
                  <p role="alert" className="mt-4 text-sm text-rose">{error}</p>
                ) : null}

                <div className="mt-8 pt-6 border-t border-line flex items-center justify-between">
                  <p className="text-xs text-muted font-mono tracking-widest uppercase">
                    {getCurrentText().length} chars ready
                  </p>

                  <button
                    onClick={handleScan}
                    disabled={scanning || uploading || getCurrentText().trim().length < 50 || getCurrentText().length > MAX_SCAN_CHARACTERS}
                    className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 text-base hover:bg-rose transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {scanning ? (
                      <span className="slow-pulse">Scanning</span>
                    ) : (
                      <span>Scan for bias</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {scanning ? (
              <div className="mt-12 text-center py-16">
                <p className="section-label mb-6">Analyzing</p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="w-2 h-2 bg-rose rounded-full slow-pulse" />
                  <span
                    className="w-2 h-2 bg-rose rounded-full slow-pulse"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="w-2 h-2 bg-rose rounded-full slow-pulse"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
                <p className="font-serif text-2xl text-muted italic">
                  Reading for patterns of bias.
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        {scanResult ? (
          <section className="max-w-6xl mx-auto px-6 lg:px-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                {savedScan ? (
                  <p className="text-xs font-mono tracking-widest uppercase text-muted">
                    Saved to workspace
                  </p>
                ) : (
                  <p role="status" className="text-sm text-muted max-w-xl">
                    {saveMessage}
                  </p>
                )}
              </div>

              <button
                onClick={handleReset}
                className="text-xs font-mono uppercase tracking-widest py-2 px-4 border border-line hover:border-ink transition-colors rounded-sm"
              >
                Scan another
              </button>
            </div>

            <ScanResults
              originalText={analyzedText}
              result={scanResult}
              addendum={addendum}
              documentTitle={analyzedTitle}
              flagIdMap={savedScan?.flagIdMap}
            />

            <AddendumPanel
              originalText={analyzedText}
              scanResult={scanResult}
              addendum={addendum}
              setAddendum={setAddendum}
              scanId={savedScan?.scanId}
            />
          </section>
        ) : null}
      </main>
    </>
  );
}
