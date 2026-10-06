export type ProposedEdit = { id: string; quote: string; replacement: string };

// Apply only unambiguous, non-overlapping source matches. Never mutate the source.
export function previewEdits(source: string, edits: ProposedEdit[]) {
  const located = edits.map(edit => {
    const start = source.indexOf(edit.quote);
    if (!edit.quote || start < 0 || source.indexOf(edit.quote, start + 1) >= 0)
      throw new Error("A selected passage is missing or appears more than once. Apply that edit manually.");
    return { ...edit, start, end: start + edit.quote.length };
  }).sort((a, b) => a.start - b.start);
  for (let i = 1; i < located.length; i++) {
    if (located[i].start < located[i - 1].end) throw new Error("Selected passages overlap. Choose one edit at a time.");
  }
  let cursor = 0;
  let revised = "";
  for (const edit of located) {
    revised += source.slice(cursor, edit.start) + edit.replacement;
    cursor = edit.end;
  }
  return { revised: revised + source.slice(cursor), changes: located };
}
