"use client";
import { useState } from "react";
export default function ReviewerNote({ flagId, initialNote, onSaved }: { flagId: string; initialNote: string; onSaved: (note: string) => void }) {
  const [note, setNote] = useState(initialNote);
  const [saved, setSaved] = useState(initialNote);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const save = async () => {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/reviewer-note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ flagId, note }) });
      if (!response.ok) throw new Error();
      setSaved(note); onSaved(note); setMessage("Reviewer note saved.");
    } catch { setMessage("Could not save the note. Keep a copy and try again; database setup may still be pending."); }
    finally { setBusy(false); }
  };
  return <div className="mt-5">
    <label htmlFor={`note-${flagId}`} className="block text-sm mb-2">Reviewer note / decision rationale</label>
    <textarea id={`note-${flagId}`} maxLength={2000} value={note} disabled={busy} onChange={event => { setNote(event.target.value); setMessage(""); }} className="w-full border border-line bg-paper p-3 text-sm" rows={3} />
    <div className="flex gap-4 items-center mt-2"><button disabled={busy || note === saved} onClick={save} className="text-sm underline disabled:opacity-40">{busy ? "Saving…" : "Save note"}</button><span className="text-xs text-muted">{note.length}/2,000 · {note !== saved ? "Unsaved changes" : "Saved content"}</span></div>
    <p role="status" className="text-sm mt-2">{message}</p>
  </div>;
}
