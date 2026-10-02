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
  </main></>;
}
