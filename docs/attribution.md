# Samples and attribution

## Synthetic development fixtures

`public/samples/*.txt` mirrors the four assistant-authored examples in `evaluation/smoke-cases.json`. These are intentionally small, non-patient examples for testing workflows. Expected categories are development expectations, not expert annotation or held-out evaluation. The scanner's cardiology, psychiatry, and pharmacology samples are also synthetic and contain intentional concerns; they are not quotations from published textbooks or clinical guidance.

## External PDF used for integration testing

- Publisher: National Heart, Lung, and Blood Institute, National Institutes of Health.
- Title: Learn What a Heart Attack Feels Like.
- Publication: October 2020, NIH Publication No. 20-HL-5062, two pages.
- [Source page](https://www.nhlbi.nih.gov/resources/learn-what-heart-attack-feels-fact-sheet).
- [Original PDF](https://www.nhlbi.nih.gov/sites/default/files/publications/Learn%20What%20a%20Heart%20Attack%20Feels%20Like_October%202020_Final.pdf).
- Downloaded October 2, 2026 into ignored `tmp/pdfs/` for upload testing. No redistributed copy is committed.

The public source is an integration-test input, not a training dataset or a gold-standard bias label. NHLBI does not endorse EquiScan. Do not infer broad model quality from a single successful scan.
