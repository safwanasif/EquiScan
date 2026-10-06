import { BiasCategory } from "@/lib/types";

export interface BiasCategoryDefinition {
  id: BiasCategory;
  label: string;
  shortLabel: string;
  color: string;          // Tailwind color class for UI
  description: string;
  whyItMatters: string;
  examples: {
    biased: string;
    improved: string;
  }[];
}

export const BIAS_CATEGORIES: Record<BiasCategory, BiasCategoryDefinition> = {
  MALE_DEFAULT_CASE: {
    id: "MALE_DEFAULT_CASE",
    label: "Male-Default Case Study",
    shortLabel: "Male Default",
    color: "bg-red-100 text-red-800 border-red-300",
    description:
      "The excerpt explicitly treats a male case as representative of everyone. A case about an individual man is not itself evidence of bias.",
    whyItMatters:
      "Review universal claims against their stated population and evidence.",
    examples: [
      {
        biased:
          "This male example represents every patient; no other presentation needs to be considered.",
        improved:
          "This example describes one patient. Do not assume it represents every patient or presentation.",
      },
    ],
  },

  MISSING_FEMALE_SYMPTOMS: {
    id: "MISSING_FEMALE_SYMPTOMS",
    label: "Missing Female Symptom Presentation",
    shortLabel: "Missing Female Symptoms",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    description:
      "The excerpt explicitly claims a single symptom pattern applies universally. Missing detail alone is insufficient to establish bias.",
    whyItMatters:
      "Review universal symptom claims without inventing medical details missing from the excerpt.",
    examples: [
      {
        biased:
          "Every patient has exactly the same symptoms; differences between populations never matter.",
        improved:
          "Avoid universal symptom claims without supporting evidence. Verify relevant population differences against appropriate sources.",
      },
    ],
  },

  PRONOUN_DEFAULT: {
    id: "PRONOUN_DEFAULT",
    label: "Male Pronoun Default",
    shortLabel: "Pronoun Default",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    description:
      "The text uses 'he/him/his' as the default when referring to a generic patient, implicitly coding the standard patient as male.",
    whyItMatters:
      "Language shapes cognition. Consistent male pronouns reinforce the male-as-default mental model in trainees.",
    examples: [
      {
        biased:
          "The patient should inform his physician of any medications he is currently taking.",
        improved:
          "The patient should inform their physician of any medications they are currently taking.",
      },
    ],
  },

  PSYCHOSOMATIC_ATTRIBUTION: {
    id: "PSYCHOSOMATIC_ATTRIBUTION",
    label: "Psychosomatic Attribution",
    shortLabel: "Psychosomatic",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    description:
      "Symptoms in women are attributed to stress, anxiety, or emotional causes before physiological causes are investigated.",
    whyItMatters:
      "A reviewer should inspect unsupported sex-based dismissal; an appropriate mental-health assessment is not automatically bias.",
    examples: [
      {
        biased:
          "Because she is a woman, her unexplained pain must be anxiety; no further investigation is needed.",
        improved:
          "Do not infer the cause of symptoms from a patient's sex. Review the assessment and supporting evidence.",
      },
    ],
  },

  MISSING_SEX_DATA: {
    id: "MISSING_SEX_DATA",
    label: "Missing Sex-Disaggregated Data",
    shortLabel: "Missing Sex Data",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    description:
      "The excerpt explicitly dismisses sex-specific evidence. Absence of a breakdown in a short excerpt alone does not establish a concern.",
    whyItMatters:
      "Review explicit dismissal of relevant evidence; do not generate dose changes from missing context.",
    examples: [
      {
        biased:
          "Sex-specific study results should always be ignored when interpreting the evidence.",
        improved:
          "Consider relevant study populations and evidence. Do not dismiss sex-specific results without justification.",
      },
    ],
  },
};

// Helpful aggregation for UI
export const CATEGORY_LIST = Object.values(BIAS_CATEGORIES);
