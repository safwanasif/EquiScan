export interface SampleDoc {
  id: string;
  title: string;
  source: string;
  excerpt: string;
  text: string;
}

export const SAMPLE_DOCS: SampleDoc[] = [
  {
    id: "cardiology",
    title: "Acute Coronary Syndromes",
    source: "Synthetic example: cardiology",
    excerpt: "Invented demonstration text with intentional concerns; not clinical guidance.",
    text: `Chapter 14: Acute Coronary Syndromes

14.1 Clinical Presentation

A 55-year-old man presents to the emergency department with crushing substernal chest pain radiating down his left arm. He reports the onset occurred approximately one hour prior while he was mowing his lawn. The patient should inform his physician of any medications he is currently taking, including over-the-counter supplements.

Classic symptoms of acute myocardial infarction include chest pain, pain radiating to the left arm, diaphoresis, and shortness of breath. Initial workup includes 12-lead ECG, serum troponin measurement, and chest radiography.

14.2 Differential Diagnosis

Women presenting with unexplained chronic pain should be screened for anxiety and depression before extensive cardiac workup is pursued. The clinical picture in atypical presentations often resolves with anxiolytic therapy and reassurance.

14.3 Pharmacological Management

The recommended adult dose of aspirin in the acute setting is 325 mg chewed immediately. Beta-blocker therapy should be initiated within 24 hours in all patients without contraindications. The standard metoprolol dose is 50 mg twice daily.`,
  },
  {
    id: "psychiatry",
    title: "Depression in Primary Care",
    source: "Synthetic example: psychiatry",
    excerpt: "Invented demonstration text with intentional concerns; not clinical guidance.",
    text: `Section 3: Depression in Primary Care

3.1 Screening

When a patient presents with vague somatic complaints including fatigue, insomnia, and unexplained pain, the clinician should consider depression as a primary diagnosis. He should administer the PHQ-9 questionnaire during the initial visit.

3.2 Presentation in Women

Female patients are twice as likely as men to report symptoms of depression. This elevated prevalence reflects a biological vulnerability to mood disorders driven by hormonal fluctuations throughout the menstrual cycle and reproductive life stages.

3.3 Treatment

First-line pharmacotherapy is a selective serotonin reuptake inhibitor. The standard starting dose of sertraline is 50 mg daily, titrated upward based on clinical response. Patients should inform his physician of any side effects experienced during the first two weeks.`,
  },
  {
    id: "pharmacology",
    title: "Cardiovascular Pharmacology",
    source: "Synthetic example: pharmacology",
    excerpt: "Invented demonstration text with intentional concerns; not clinical guidance.",
    text: `Chapter 7: Cardiovascular Pharmacology

7.1 Antihypertensive Agents

The standard adult dose of lisinopril is 10 mg once daily, titrated to 40 mg daily as tolerated. Clinical trials establishing these dosing guidelines were conducted primarily in male participants aged 45 to 65.

7.2 Anticoagulation

Warfarin therapy requires careful titration based on INR monitoring. The typical maintenance dose is 5 mg daily. The patient should follow up with his physician every four weeks for dose adjustment.

7.3 Beta-Blockers

Metoprolol succinate is dosed at 25 to 200 mg once daily. Propranolol is dosed at 40 mg twice daily. These dosing recommendations apply uniformly to adult patients regardless of sex or body weight.`,
  },
];