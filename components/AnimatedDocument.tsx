"use client";

import React, { useEffect, useState } from "react";

type FlagState = {
  id: string;
  sentence: string;
  category: string;
  label: string;
};

const FLAGS: FlagState[] = [
  {
    id: "f1",
    sentence: "A 55-year-old man presents with crushing substernal chest pain radiating down his left arm.",
    category: "MALE_DEFAULT_CASE",
    label: "Male Default",
  },
  {
    id: "f2",
    sentence: "The patient should inform his physician of any medications he is taking.",
    category: "PRONOUN_DEFAULT",
    label: "Pronoun Default",
  },
  {
    id: "f3",
    sentence: "Women presenting with unexplained chronic pain should be screened for anxiety.",
    category: "PSYCHOSOMATIC_ATTRIBUTION",
    label: "Psychosomatic",
  },
];

const DOCUMENT_TEXT = [
  "Chapter 14",
  "Acute Coronary Syndromes",
  "",
  "14.1  Clinical Presentation",
  "",
  "A 55-year-old man presents with crushing substernal chest pain radiating down his left arm. The patient should inform his physician of any medications he is taking. Initial workup includes ECG and serum troponin.",
  "",
  "14.2  Differential Diagnosis",
  "",
  "Women presenting with unexplained chronic pain should be screened for anxiety. The recommended workup includes...",
];

export default function AnimatedDocument() {
  const [scanProgress, setScanProgress] = useState(0);
  const [visibleFlags, setVisibleFlags] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const runLoop = () => {
      setScanning(true);
      setVisibleFlags([]);
      setScanProgress(0);

      let progress = 0;
      const scanInterval = setInterval(() => {
        progress += 1;
        setScanProgress(progress);
        if (progress >= 100) clearInterval(scanInterval);
      }, 40);

      setTimeout(() => setVisibleFlags(["f1"]), 1800);
      setTimeout(() => setVisibleFlags(["f1", "f2"]), 2800);
      setTimeout(() => setVisibleFlags(["f1", "f2", "f3"]), 3800);

      setTimeout(() => {
        setScanning(false);
        setScanProgress(0);
      }, 7000);
    };

    runLoop();
    const interval = setInterval(runLoop, 8000);
    return () => clearInterval(interval);
  }, []);

  const highlightSentence = (text: string): React.ReactNode => {
    const f1 = FLAGS[0].sentence;
    const f2 = FLAGS[1].sentence;
    const f3 = FLAGS[2].sentence;

    if (text.includes(f1)) {
      const before = text.slice(0, text.indexOf(f1));
      const after = text.slice(text.indexOf(f1) + f1.length);
      return (
        <>
          {before}
          <mark
            className="bg-transparent"
            style={{
              boxShadow: visibleFlags.includes("f1") ? "inset 0 -8px 0 #FCE7EC" : "none",
              transition: "box-shadow 0.6s ease",
            }}
          >
            {f1}
          </mark>
          {highlightSentence(after)}
        </>
      );
    }
    if (text.includes(f2)) {
      const before = text.slice(0, text.indexOf(f2));
      const after = text.slice(text.indexOf(f2) + f2.length);
      return (
        <>
          {before}
          <mark
            className="bg-transparent"
            style={{
              boxShadow: visibleFlags.includes("f2") ? "inset 0 -8px 0 #FCE7EC" : "none",
              transition: "box-shadow 0.6s ease",
            }}
          >
            {f2}
          </mark>
          {highlightSentence(after)}
        </>
      );
    }
    if (text.includes(f3)) {
      const before = text.slice(0, text.indexOf(f3));
      const after = text.slice(text.indexOf(f3) + f3.length);
      return (
        <>
          {before}
          <mark
            className="bg-transparent"
            style={{
              boxShadow: visibleFlags.includes("f3") ? "inset 0 -8px 0 #FCE7EC" : "none",
              transition: "box-shadow 0.6s ease",
            }}
          >
            {f3}
          </mark>
          {highlightSentence(after)}
        </>
      );
    }
    return text;
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative bg-white border border-line shadow-[0_24px_60px_-20px_rgba(10,10,10,0.12)] rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-line bg-paperShade">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-line" />
            <span className="w-2.5 h-2.5 rounded-full bg-line" />
            <span className="w-2.5 h-2.5 rounded-full bg-line" />
          </div>
          <span className="font-mono text-[10px] tracking-widest text-muted uppercase">
            cardiology_ch14.pdf
          </span>
          <span className="font-mono text-[10px] tracking-widest text-rose uppercase slow-pulse">
            {scanning ? "Scanning" : "Idle"}
          </span>
        </div>

        {scanning && scanProgress < 100 && (
          <div
            className="absolute left-0 right-0 h-[2px] bg-rose/40 z-10 pointer-events-none"
            style={{
              top: `${20 + (scanProgress / 100) * 70}%`,
              boxShadow: "0 0 24px 4px rgba(159, 18, 57, 0.35)",
            }}
          />
        )}

        <div className="px-8 py-6 font-serif text-ink leading-relaxed min-h-[360px]">
          {DOCUMENT_TEXT.map((line, i) => {
            if (line === "") return <div key={i} className="h-3" />;
            if (
              line.startsWith("Chapter") ||
              line.includes("Differential") ||
              line.includes("Clinical")
            ) {
              return (
                <p
                  key={i}
                  className={
                    line.startsWith("Chapter")
                      ? "text-sm text-muted tracking-widest uppercase font-sans mb-1"
                      : "text-sm font-semibold mb-2 mt-3"
                  }
                >
                  {line}
                </p>
              );
            }
            if (line === "Acute Coronary Syndromes") {
              return (
                <p key={i} className="text-2xl font-serif mb-4 tracking-tight">
                  {line}
                </p>
              );
            }
            return (
              <p key={i} className="text-[15px] mb-3 text-ink/90">
                {highlightSentence(line)}
              </p>
            );
          })}
        </div>
      </div>

      <div className="absolute -right-4 top-32 space-y-3 hidden lg:block">
        {FLAGS.map((flag, i) => (
          <div
            key={flag.id}
            className={`bg-white border border-line rounded-sm px-4 py-3 shadow-[0_12px_32px_-12px_rgba(10,10,10,0.15)] w-64 transition-all duration-500 ${
              visibleFlags.includes(flag.id)
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-6"
            }`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[9px] tracking-widest text-rose uppercase">
                Flag {i + 1}
              </span>
              <span className="font-mono text-[9px] tracking-widest text-muted uppercase">
                Severity {i === 0 ? "3" : i === 1 ? "1" : "3"}
              </span>
            </div>
            <p className="font-sans text-sm font-medium text-ink">
              {flag.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}