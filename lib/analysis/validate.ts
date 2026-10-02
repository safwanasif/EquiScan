import type { BiasCategory, BiasFlag, ScanResult } from "../types";

export const CATEGORIES: BiasCategory[] = [
  "MALE_DEFAULT_CASE", "MISSING_FEMALE_SYMPTOMS", "PRONOUN_DEFAULT",
  "PSYCHOSOMATIC_ATTRIBUTION", "MISSING_SEX_DATA",
];
export const MAX_SCAN_CHARACTERS = 8_000;

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected an object");
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, max = 4000): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    throw new Error("Invalid text field");
  }
  return value;
}

export function validateRewrites(value: unknown) {
  const result = object(value);
  return { conservative: text(result.conservative), balanced: text(result.balanced), comprehensive: text(result.comprehensive) };
}

export function validateAddendum(value: unknown) {
  const result = object(value);
  const content = text(result.content, 12000);
  if (!Array.isArray(result.topicsCovered) || result.topicsCovered.length > 20) throw new Error("Invalid topics");
  return { title: text(result.title, 240), content, wordCount: content.trim().split(/\s+/).length,
    topicsCovered: result.topicsCovered.map(topic => text(topic, 240)) };
}

// Provider output is untrusted. Structural validity does not establish accuracy.
export function validateScanResult(value: unknown, source: string): ScanResult {
  const result = object(value);
  if (!Array.isArray(result.flags) || result.flags.length > 200) {
    throw new Error("Invalid flags");
  }
  const score = result.documentBiasScore;
  if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 10) {
    throw new Error("Invalid score");
  }
  const counts = Object.fromEntries(CATEGORIES.map(c => [c, 0])) as Record<BiasCategory, number>;
  const seen = new Set<string>();
  const flags: BiasFlag[] = result.flags.map((value, index) => {
    const flag = object(value);
    const sentence = text(flag.flaggedSentence, MAX_SCAN_CHARACTERS);
    if (!source.includes(sentence)) throw new Error("Finding is not an exact source quote");
    if (!CATEGORIES.includes(flag.category as BiasCategory)) throw new Error("Invalid category");
    const category = flag.category as BiasCategory;
    if (flag.severity !== 1 && flag.severity !== 2 && flag.severity !== 3) {
      throw new Error("Invalid severity");
    }
    const key = JSON.stringify([category, sentence]);
    if (seen.has(key)) throw new Error("Duplicate finding");
    seen.add(key);
    counts[category]++;
    // Citation text is intentionally withheld until a verified evidence registry
    // can resolve IDs. Well-formed model citations are not verified sources.
    return {
      id: `flag-${index + 1}`, flaggedSentence: sentence, category,
      severity: flag.severity, explanation: text(flag.explanation),
      suggestedRewrite: text(flag.suggestedRewrite),
    };
  });
  return {
    documentBiasScore: score,
    letterGrade: score < 2 ? "A" : score < 4 ? "B" : score < 6 ? "C" : score < 8 ? "D" : "F",
    summary: text(result.summary), flags, totalFlags: flags.length, categoryCounts: counts,
  };
}
