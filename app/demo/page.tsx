import Navbar from "@/components/Navbar";
import ScanResults from "@/components/ScanResults";
import type { ScanResult } from "@/lib/types";

const source = "Every patient should bring his medication list to the appointment. Ask each patient whether he understands the instructions before he leaves.";
const result: ScanResult = {
  documentBiasScore: 3, letterGrade: "B", totalFlags: 1,
  summary: "This prepared example highlights male pronouns in instructions intended for patients of any sex. It demonstrates the review workflow, not model accuracy.",
  categoryCounts: { MALE_DEFAULT_CASE: 0, MISSING_FEMALE_SYMPTOMS: 0, PRONOUN_DEFAULT: 1, PSYCHOSOMATIC_ATTRIBUTION: 0, MISSING_SEX_DATA: 0 },
  flags: [{
    id: "demo-1", category: "PRONOUN_DEFAULT", severity: 2,
    flaggedSentence: source,
    explanation: "These generic instructions assume a male patient. A reviewer can choose inclusive wording without changing the instructions.",
    suggestedRewrite: "Every patient should bring their medication list to the appointment. Ask each patient whether they understand the instructions before they leave.",
  }],
};

export default function DemoPage() {
  return <><Navbar /><main className="max-w-6xl mx-auto px-6 py-12">
    <p className="section-label mb-4">Interactive sample</p>
    <h1 className="font-serif text-4xl mb-5">Explore an example audit.</h1>
    <p className="text-muted max-w-3xl mb-8">This synthetic example contains prepared findings and edits. No live AI analysis runs here. Expand the finding, try a review decision, and download the example as JSON. Decisions last only until you leave or refresh this page; nothing is saved to a workspace.</p>
    <section aria-labelledby="guest-access-title" className="border border-line rounded-sm p-6 mb-8">
      <h2 id="guest-access-title" className="font-serif text-2xl mb-4">Guest preview or your own audits</h2>
      <div className="grid sm:grid-cols-2 gap-6 text-sm">
        <div><h3 className="font-semibold mb-2">Guest preview</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted">
            <li>One prepared example with fixed findings and edits</li>
            <li>Try review decisions; they reset when you leave or refresh</li>
            <li>Download sample JSON and synthetic text fixtures</li>
            <li>No live scans, saved history, generated addenda, or PDF audit reports</li>
          </ul>
        </div>
        <div><h3 className="font-semibold mb-2">Free account</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted">
            <li>Analyze your own pasted text or selected PDF pages</li>
            <li>Save private audits and review decisions</li>
            <li>Generate alternative edits and save editorial addenda</li>
            <li>Export PDF reports and manage your audit library</li>
          </ul>
          <a href="/login" className="inline-block mt-4 underline underline-offset-4">Sign in or create an account</a>
        </div>
      </div>
    </section>
    <ScanResults originalText={source} result={result} documentTitle="EquiScan prepared sample" demo />
    <section className="mt-12 border-t border-line pt-8">
      <p className="text-sm mb-5"><a href="/evaluation" className="underline">See our development tests and evaluation limitations</a></p>
      <h2 className="font-serif text-3xl mb-3">Try your own walkthrough</h2>
      <p className="text-muted mb-4">Download a synthetic text fixture, then paste its contents into the scanner. These are development examples, not clinical guidance or a validated benchmark. Live scans require sign-in and results may vary.</p>
      <ul className="space-y-2 text-sm">
        <li><a className="underline" href="/samples/generic-pronoun.txt" download>Generic pronouns — expected concern</a></li>
        <li><a className="underline" href="/samples/inclusive-instructions.txt" download>Inclusive instructions — expected no findings</a></li>
        <li><a className="underline" href="/samples/specific-male.txt" download>Specific male patient — legitimate pronoun use</a></li>
        <li><a className="underline" href="/samples/insufficient-context.txt" download>Insufficient context — expected abstention</a></li>
      </ul>
    </section>
  </main></>;
}
