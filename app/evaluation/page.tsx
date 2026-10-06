import Link from "next/link";
import Navbar from "@/components/Navbar";
import cases from "@/evaluation/smoke-cases.json";

export default function EvaluationPage() {
  return <><Navbar /><main className="max-w-5xl mx-auto px-6 py-12">
    <p className="section-label mb-4">Engineering evidence</p>
    <h1 className="font-serif text-4xl mb-5">What we tested—and what it means.</h1>
    <p className="text-muted mb-8">EquiScan uses a prompted model hosted by Groq, not a custom-trained classifier. These checks help verify behavior and source grounding. They do not establish medical accuracy or clinical validity.</p>
    <section className="border border-line p-6 mb-8">
      <h2 className="font-serif text-2xl mb-3">Current development evidence</h2>
      <dl className="grid sm:grid-cols-2 gap-5 text-sm">
        <div><dt className="font-semibold">Dataset</dt><dd>{cases.length} synthetic, assistant-authored development cases; no patient data</dd></div>
        <div><dt className="font-semibold">Historical model</dt><dd>openai/gpt-oss-120b via Groq; calls recorded October 1, 2026</dd></div>
        <div><dt className="font-semibold">Observed behavior</dt><dd>One matching category for generic male pronouns; no findings for the other three cases after prompt tuning</dd></div>
        <div><dt className="font-semibold">Limitations</dt><dd>Not held out, not independently reviewed, one observed call per case; does not cover all five categories</dd></div>
      </dl>
      <p className="mt-5 text-sm text-muted">These examples were used to tune the prompt. We do not report accuracy, precision, or recall from them. The deployed model configuration can change; this page records historical checks and does not run live inference.</p>
    </section>
    <section className="mb-10" aria-labelledby="cases-heading">
      <h2 id="cases-heading" className="font-serif text-3xl mb-5">Explore the cases</h2>
      <div className="space-y-4">{cases.map(item => <details key={item.id} className="border border-line p-5">
        <summary className="cursor-pointer font-semibold">{item.id} · Expected: {item.expectedCategories.length ? item.expectedCategories.join(", ") : "no findings"}</summary>
        <p className="mt-4 text-sm whitespace-pre-wrap">{item.source}</p>
        <p className="mt-3 text-sm text-muted">Rationale: {item.rationale}</p>
      </details>)}</div>
    </section>
    <section className="mb-10">
      <h2 className="font-serif text-3xl mb-4">Checks around the model</h2>
      <ul className="list-disc pl-5 space-y-3 text-sm">
        <li>Runtime validation rejects invented source quotations, duplicates, invalid categories, and malformed scores.</li>
        <li>Automated tests cover valid/invalid model responses, provider failures, safe edit application, and exact-quote comparison.</li>
        <li>Rollback-only database tests check ownership, cross-user denial, and source preservation.</li>
        <li>Human decisions and reviewer notes remain separate from the original model score.</li>
      </ul>
    </section>
    <section className="border-t border-line pt-6">
      <h2 className="font-serif text-2xl mb-3">Next evaluation milestone</h2>
      <p className="text-sm text-muted">Collect permissioned examples across every category, have reviewers label them independently, and reserve unseen cases for testing. Report false positives, missed labels, quotation validity, latency distributions, dataset size, and exact model/prompt versions. No such benchmark is claimed here.</p>
      <p className="mt-5"><Link href="/demo" className="underline">Explore the prepared demo</Link></p>
    </section>
  </main></>;
}
