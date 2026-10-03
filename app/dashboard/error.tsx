"use client";

export default function WorkspaceError({ unstable_retry }: { unstable_retry: () => void }) {
  return <main className="max-w-3xl mx-auto px-6 py-12">
    <h1 className="font-serif text-4xl mb-4">Your workspace could not be loaded.</h1>
    <p className="text-muted mb-6">Please try again shortly. Your saved audits have not been changed.</p>
    <button onClick={unstable_retry} className="bg-ink text-paper px-5 py-3 rounded-sm">Try again</button>
  </main>;
}
