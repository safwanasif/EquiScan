"use client";

export default function AuditError({ unstable_retry }: { unstable_retry: () => void }) {
  return <main className="max-w-3xl mx-auto p-10">
    <h1 className="font-serif text-3xl mb-4">This audit could not be loaded.</h1>
    <p className="text-muted mb-6">The service may be unavailable or the saved data may need attention. Your audit has not been changed.</p>
    <button onClick={unstable_retry} className="bg-ink text-paper px-5 py-3 rounded-sm">Try again</button>
  </main>;
}
