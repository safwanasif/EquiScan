> Historical reassessment notes. The current implementation order and decisions are in [ROADMAP.md](../ROADMAP.md). Groq has now been selected for v1 evaluation; earlier provider descriptions below describe the pre-migration baseline.

# EquiScan rebuild: engine first, preserve the interface

Decision date: October 1, 2026. Status: foundation work started; no new model
trained or selected. This supersedes the earlier assumption that v1 must remove
all paid inference. Free or inexpensive inference is acceptable if measured
quality and operating limits justify it.

## Product boundary

Review medical educational writing for potential issues, with exact source
passages and a human decision. Keep the current pages, typography, upload flow,
dashboard, and export components while replacing their underlying contracts.
Do not present a document grade as a validated measure of clinical bias.

## What the audit found

The existing scan, rewrite, and addendum routes call one hard-coded Claude
model. JSON parsing is cast to TypeScript types without runtime validation.
Scans and addenda silently truncate source text. The prompt overgeneralizes
male cases and contains citation metadata that has not been independently
verified. Public model endpoints lack durable quotas. Auth and database work
are useful foundations but do not solve model quality or inference costs.

## Candidate approaches

| Approach | Strength | Limitation | Role |
| --- | --- | --- | --- |
| Rules and curated explanations | Predictable, no inference bill | Limited semantic/context coverage | Baseline and fallback |
| Fine-tuned small classifier | Learn task-specific distinctions | Requires licensed, reviewed labels; does not generate reports or medical evidence | Candidate passage detection |
| Low-cost hosted LLM | Contextual explanations and rewrites | Metered cost, privacy terms, rate limits, hallucinations | Candidate v1 engine |
| Browser-local model | No per-request hosted inference charge | Download size, device memory, latency, model license | Experiment after quality baseline |

Do not train a language model from scratch. Compare a small classifier with a
low-cost LLM before deciding. SetFit supports fine-tuning sentence transformers
for classification; this is not a substitute for evidence-backed generation.
PDF/report assembly remains deterministic application code regardless of model.

Sources checked: [SetFit](https://huggingface.co/docs/setfit/main/index),
[Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing),
[browser inference](https://huggingface.co/docs/hub/en/transformers-js).
Recheck model availability, rates, licenses and data-use terms before adoption.
No provider account, billing change, key, or new paid model call is required for
the contract work. Do not switch providers without updating processing disclosures.

## Implementation sequence and acceptance criteria

1. **Stable scan contract (started).** Reject malformed results and quotes absent
   from the source; normalize IDs/counts/grades; remove unverified model citations;
   explicitly reject over-limit scan input. Retain the current engine as baseline.
   Automated contract checks are engineering tests, not a quality benchmark.
2. **Evaluation data.** Write annotation rules and collect permissioned examples
   with document provenance, category labels, exact spans, context, and reviewer
   rationale. Include no-issue and insufficient-context labels. Synthetic examples
   are development fixtures, never clinical validation. Split by source document
   before training; keep related paraphrases in one split. Seek independent domain
   review and document disagreement. Do not invent a large labeled dataset.
3. **Engine comparison.** Compare rules, a low-cost LLM, and (when labels support
   training) a small classifier on the same held-out documents. Report per-category
   precision/recall, false-positive rate on clean passages, quote validity,
   abstention, latency and total token cost. Record model/prompt/dataset versions.
   Training and production inference are separate cost decisions.
4. **Evidence and reports.** Verify a citation registry independently. A classifier
   selects candidate concerns; curated text explains supported rules. Optional
   generative rewrites must not introduce unsupported medical facts. Add source
   locations, analysis coverage and engine version to saved/exported results.
5. **Complete the product.** Reopen/review/delete audits, reliable exports, static
   demo, login, privacy copy, mobile and keyboard checks. Restore verified evidence
   links before representing the product as source-backed.
6. **Deployment.** Authenticate and durably quota all paid actions; enforce input,
   output and total spending limits. Verify real provider failures, account
   isolation and the complete production journey. Then publish screenshots,
   evaluation results and factual resume bullets.

## Current limits

The existing score is still model-assigned, not calibrated. Structural validation
does not prove medical accuracy. Rewrites/addenda still need runtime validation,
coverage handling and quotas. No model comparison has run. The existing model
remains active; Google OAuth is prepared but not configured. Do not describe this
intermediate state as deployment-ready.

Run contract tests with Node 24: `node --test tests/analysis.test.mjs`.
