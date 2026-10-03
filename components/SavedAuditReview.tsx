"use client";
import { useState } from "react";
import ScanResults from "@/components/ScanResults";
import AddendumPanel from "@/components/AddendumPanel";
import type { Addendum, ScanResult } from "@/lib/types";

export default function SavedAuditReview({ scanId, originalText, result, documentTitle, flagIdMap, initialStatuses, initialAddendum }: {
  scanId: string; originalText: string; result: ScanResult; documentTitle: string;
  flagIdMap: Record<string, string>; initialStatuses: Record<string, "open" | "accepted" | "resolved" | "dismissed">;
  initialAddendum: Addendum | null;
}) {
  const [addendum, setAddendum] = useState(initialAddendum);
  return <>
    <ScanResults originalText={originalText} result={result} documentTitle={documentTitle} flagIdMap={flagIdMap} initialStatuses={initialStatuses} addendum={addendum} />
    <AddendumPanel originalText={originalText} scanResult={result} addendum={addendum} setAddendum={setAddendum} scanId={scanId} />
  </>;
}
