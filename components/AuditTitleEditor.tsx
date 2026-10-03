"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuditTitleEditor({ documentId, title }: { documentId: string; title: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!editing) return <button onClick={() => { setValue(title); setError(""); setEditing(true); }} className="text-sm underline underline-offset-4">Rename audit</button>;
  return <form className="space-y-3 max-w-xl" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/audit-title", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId, title: value }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not rename audit.");
      setEditing(false); router.refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not connect. Try again."); }
    finally { setBusy(false); }
  }}>
    <label className="block text-sm">Audit title<input autoFocus required maxLength={240} value={value} onChange={event => setValue(event.target.value)} disabled={busy} className="block w-full bg-white border border-line rounded-sm p-3 mt-1" /></label>
    <button disabled={busy || !value.trim()} className="bg-ink text-paper px-4 py-2 rounded-sm disabled:opacity-40">{busy ? "Saving…" : "Save title"}</button>
    <button type="button" disabled={busy} onClick={() => setEditing(false)} className="text-sm underline ml-4">Cancel</button>
    {error ? <p role="alert" className="text-sm text-rose">{error}</p> : null}
  </form>;
}
