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
    <ScanResults originalText={source} result={result} documentTitle="EquiScan prepared sample" demo />
    <section className="mt-12 border-t border-line pt-8">
      <h2 className="font-serif text-3xl mb-3">Try your own walkthrough</h2>
      <p className="text-muted mb-4">Download a synthetic text fixture, then paste its contents into the scanner. These are development examples, not clinical guidance or a validated benchmark. Live scans use AI quota and results may vary.</p>
      <ul className="space-y-2 text-sm">
        <li><a className="underline" href="/samples/generic-pronoun.txt" download>Generic pronouns — expected concern</a></li>
        <li><a className="underline" href="/samples/inclusive-instructions.txt" download>Inclusive instructions — expected no findings</a></li>
        <li><a className="underline" href="/samples/specific-male.txt" download>Specific male patient — legitimate pronoun use</a></li>
        <li><a className="underline" href="/samples/insufficient-context.txt" download>Insufficient context — expected abstention</a></li>
      </ul>
    </section>
  </main></>;
}
