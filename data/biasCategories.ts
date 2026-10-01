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
      "A clinical case or example uses a male patient as the 'standard,' implying that diagnosis in women follows the same pattern.",
    whyItMatters:
      "Teaching medicine with male-default cases trains clinicians to recognize male symptom patterns and miss or dismiss atypical presentations in women.",
    examples: [
      {
        biased:
          "A 55-year-old man presents with crushing substernal chest pain radiating down his left arm. He is immediately evaluated for acute myocardial infarction.",
        improved:
          "A 55-year-old patient presents with chest discomfort. Note that men more often report crushing substernal pain, while women may present with fatigue, nausea, jaw pain, or shortness of breath. Both presentations warrant immediate evaluation for acute myocardial infarction.",
      },
    ],
  },

  MISSING_FEMALE_SYMPTOMS: {
    id: "MISSING_FEMALE_SYMPTOMS",
    label: "Missing Female Symptom Presentation",
    shortLabel: "Missing Female Symptoms",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    description:
      "The text describes symptoms of a condition but omits how those symptoms differ in women.",
    whyItMatters:
      "Over 50% of women having heart attacks present with symptoms not listed in traditional textbooks. This omission is directly responsible for diagnostic delays.",
    examples: [
      {
        biased:
          "Symptoms of myocardial infarction include chest pain, pain radiating to the left arm, and shortness of breath.",
        improved:
          "Symptoms of myocardial infarction commonly include chest pain, pain radiating to the left arm, and shortness of breath. Women are more likely than men to present with atypical symptoms including fatigue, nausea, jaw pain, back pain, and dyspnea without chest pain.",
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
      "Women are significantly more likely than men to have physical symptoms misattributed to mental health causes, leading to dangerous diagnostic delays.",
    examples: [
      {
        biased:
          "Women presenting with unexplained chronic pain should be screened for anxiety and depression.",
        improved:
          "All patients presenting with chronic pain deserve thorough physiological evaluation. Mental health screening may be appropriate after physical causes have been adequately investigated.",
      },
    ],
  },

  MISSING_SEX_DATA: {
    id: "MISSING_SEX_DATA",
    label: "Missing Sex-Disaggregated Data",
    shortLabel: "Missing Sex Data",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    description:
      "Dosing guidelines, drug efficacy, or disease prevalence statistics are presented without sex-based breakdowns, despite known biological differences.",
    whyItMatters:
      "Women experience adverse drug reactions at twice the rate of men across many medications, largely due to dosing standards based on male physiology.",
    examples: [
      {
        biased:
          "The recommended adult dose is 500 mg twice daily.",
        improved:
          "The recommended adult dose is 500 mg twice daily. Note that sex-based differences in metabolism may warrant dose adjustment; refer to pharmacokinetic data for sex-specific recommendations.",
      },
    ],
  },
};

// Helpful aggregation for UI
export const CATEGORY_LIST = Object.values(BIAS_CATEGORIES);