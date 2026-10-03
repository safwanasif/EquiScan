"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuditTrashButton({ documentId, restore = false }: { documentId: string; restore?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/audit-trash", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, action: restore ? "restore" : "trash" }) });
      if (!response.ok) throw new Error("Could not update the audit. Please try again.");
      router.refresh();
      setConfirming(false);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not connect. Please try again.");
    } finally { setBusy(false); }
  };
  return <div className="text-sm">
    {confirming ? <div className="space-y-2"><p>Move this audit to Trash? You can restore it from your workspace.</p>
      <button disabled={busy} onClick={submit} className="underline mr-4 disabled:opacity-40">{busy ? "Moving…" : "Move to Trash"}</button>
      <button disabled={busy} onClick={() => setConfirming(false)} className="underline">Cancel</button>
    </div> : <button disabled={busy} onClick={() => restore ? submit() : setConfirming(true)} className="underline underline-offset-4 disabled:opacity-40">{busy ? "Restoring…" : restore ? "Restore audit" : "Move to Trash"}</button>}
    {error ? <p role="alert" className="text-rose mt-2">{error}</p> : null}
  </div>;
}
