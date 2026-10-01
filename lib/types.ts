// Bias categories — matches our 5-category taxonomy
export type BiasCategory =
  | "MALE_DEFAULT_CASE"
  | "MISSING_FEMALE_SYMPTOMS"
  | "PRONOUN_DEFAULT"
  | "PSYCHOSOMATIC_ATTRIBUTION"
  | "MISSING_SEX_DATA";

// A single flagged sentence in a document
export interface BiasFlag {
  id: string;
  flaggedSentence: string;
  category: BiasCategory;
  severity: 1 | 2 | 3;
  explanation: string;
  suggestedRewrite: string;
  alternativeRewrites?: string[];
  citation?: {
    text: string;        // "Mehta LS et al. Circulation. 2016;133(9):916-947"
    pubmedId?: string;   // "26811316" if known, optional
    relevance: string;   // one-sentence why this study backs the flag
  };
}

// The complete scan result for a document
export interface ScanResult {
  documentBiasScore: number;     // 0 (no bias) to 10 (severe)
  letterGrade: "A" | "B" | "C" | "D" | "F";
  summary: string;               // one paragraph overview
  flags: BiasFlag[];             // all flagged sentences
  totalFlags: number;
  categoryCounts: Record<BiasCategory, number>;
}

// What the Addendum Generator returns
export interface Addendum {
  title: string;                 // e.g. "Sex and Gender Considerations"
  content: string;               // the full missing section
  wordCount: number;
  topicsCovered: string[];       // list of what the addendum addresses
}

// Request/response shapes for our API routes
export interface ScanRequest {
  text: string;
}

export interface RewriteRequest {
  flaggedSentence: string;
  category: BiasCategory;
  context?: string;              // surrounding text for better rewrites
}

export interface AddendumRequest {
  originalText: string;
  scanResult: ScanResult;
}