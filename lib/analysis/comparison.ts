type Finding = { category: string; flaggedSentence: string };
// Conservative matching: normalized exact quote + category, never semantic guesses.
export function compareFindings(before: Finding[], after: Finding[]) {
  const key = (finding: Finding) => `${finding.category}:${finding.flaggedSentence.trim().replace(/\s+/g, " ")}`;
  const oldKeys = new Set(before.map(key));
  const newKeys = new Set(after.map(key));
  return {
    retained: after.filter(finding => oldKeys.has(key(finding))),
    added: after.filter(finding => !oldKeys.has(key(finding))),
    noLongerReported: before.filter(finding => !newKeys.has(key(finding))),
  };
}
