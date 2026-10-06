"use client";
import { useState } from "react";
import ScanResults from "@/components/ScanResults";
import AddendumPanel from "@/components/AddendumPanel";
import type { Addendum, ScanResult } from "@/lib/types";

export default function SavedAuditReview({ scanId, originalText, result, documentTitle, flagIdMap, initialStatuses, initialAddendum, initialNotes }: {
  scanId: string; originalText: string; result: ScanResult; documentTitle: string;
  flagIdMap: Record<string, string>; initialStatuses: Record<string, "open" | "accepted" | "resolved" | "dismissed">;
  initialAddendum: Addendum | null;
  initialNotes: Record<string, string>;
}) {
  const [addendum, setAddendum] = useState(initialAddendum);
  return <>
    <ScanResults originalText={originalText} result={result} documentTitle={documentTitle} flagIdMap={flagIdMap} initialStatuses={initialStatuses} initialNotes={initialNotes} addendum={addendum} scanId={scanId} />
    <AddendumPanel originalText={originalText} scanResult={result} addendum={addendum} setAddendum={setAddendum} scanId={scanId} />
  </>;
}
