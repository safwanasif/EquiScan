# EquiScan: polished v1 roadmap

Initial repository audit: October 1, 2026.

## Direction

Keep the existing Next.js, TypeScript, Anthropic, and Supabase foundation. Ship a focused tool for reviewing potential sex and gender bias in medical educational material, with traceable findings and human review. Do not represent its grades as clinical validation or its rewrites as authoritative medical guidance.

V1 journey: try a demonstration, sign in, upload or paste a document, review source-linked findings, save and reopen an audit, record review decisions, and export a report.

## Research context received

The supplied `hackathon_research.docx` describes an earlier patient advocacy concept. `equiscan_research_brief.docx` narrows that concept to educational document review and the upload, flag, rewrite, export workflow. Treat both as historical planning material, not current implementation instructions or verified research.

Keep the educator/editor audience, explainable findings, contextual rewrites, and domain-expert review. Patient symptom assessment, diagnosis support, public institution rankings, publisher integrations, and commercial analytics are outside v1.

Before using any research claims publicly, locate primary sources and record the exact population, date, denominator, and limitations. The briefs do not establish their medical statistics, competitor absence, market sizes, regulatory assurances, or processing cost estimates. A particularly important mismatch: the brief's curriculum-related 70% claim is not evidence for the landing page's 70% research-subject claim. Domain-expert involvement is an opportunity for evaluation, not proof that the product is validated.

Prompt sketches and proposed stacks in the briefs are historical alternatives; they do not supersede the inspected implementation. Do not assume every male case, missing sex breakdown, or mental-health reference constitutes bias without surrounding context and supporting evidence.

## Baseline verified

- ESLint and TypeScript checks pass.
- Production build passes with network access for Google Fonts. Middleware deprecation warning remains.
- Source includes scanner, rewrites, addendum, PDF input/output, authentication, scan persistence, dashboard queries, and review actions.
- No Git repository, SQL migrations, or project tests were found in this folder. README is the starter template.
- Live authentication, database schema/RLS, AI quality, browser behavior, and rendered PDF layout remain unverified. No paid model calls were made during this audit.
- The supplied handoff ends at section 6.3; its referenced later sections and SQL patch are absent. Code is newer than the handoff.

## 1. Establish a reproducible foundation

Progress: GitHub setup, proxy migration, and initial browser verification are complete. Correction: the early zero-table result occurred during recovery; the legacy schema subsequently became visible. A data-preserving versioned migration is applied, with rollback-only provisioning, atomic-save, and two-user RLS checks passing. Real email login and browser persistence verification remain pending. See [database verification](docs/database.md).

Explain the current request/data flow; initialize version control after checking for an existing remote; add safe environment setup documentation and example; inspect the actual database schema and record migrations; migrate middleware using the installed Next.js documentation. Review dependency security and deployment configuration.

Done when: setup is documented, secrets are excluded, database structure is reproducible, and lint/type/build checks pass.

## 2. Make findings trustworthy

Validate requests and model responses at runtime. Reject invalid categories, scores, and citations. Derive counts and grades consistently in application code. Verify citation metadata and relevance; store canonical citations independently of model-generated text. Remove unsupported marketing statistics and timing promises. Make prompts distinguish potential issues from confirmed bias and handle legitimate counterexamples. Disclose analysis coverage instead of silently truncating input at 60,000 characters (40,000 for addenda). Improve PDF text boundaries and source matching.

Done when: malformed outputs fail safely, reported coverage is accurate, citation links resolve to verified sources, and a small reviewed set includes both problematic and appropriate passages.

## 3. Complete the saved audit workflow

Verify real login and workspace provisioning. Inspect and test RLS with two users. Make document/scan/flag saving atomic. Return persisted flag IDs and connect review actions to them; validate allowed statuses and confirm an actual row was updated. Add audit detail/reopen and deletion flows. Correct dashboard score thresholds and status totals. Display save, rewrite, export, and review failures to users. Persist the report content needed to reopen it.

Done when: a user can sign in, scan, save, reopen, review, export, and delete an audit; another user cannot access it.

## 4. Polish the product and control operating costs

Review desktop/mobile layouts and keyboard use in the browser. Improve progress, retry, empty, and failure states. Pass document titles to exports and visually inspect PDF pages. Add a clearly labeled precomputed demo for visitors. Protect paid endpoints with authentication, durable quotas/rate limits, input limits, and a total spending safeguard. Correct privacy copy to describe Anthropic processing and Supabase storage; make retention/deletion clear. Avoid logging source text through model error output.

Done when: the demonstration is reliable, the main journey works on mobile and desktop, exports are readable, and public usage cannot trigger unlimited model spending.

## 5. Deploy and verify production

Choose hosting after verifying current request-size, execution-time, and budget constraints, especially PDF uploads. Configure server-only secrets, production auth redirects, database migrations, and basic monitoring. Run the full workflow on the deployed URL, including unauthorized requests, failed requests, and account isolation.

Done when: the public demo and authenticated audit flow work on the live site, with logs and a documented recovery procedure.

## 6. Package for the resume

Replace the starter README with architecture, setup, screenshots, demo, limitations, and evaluation results. Record a short demonstration. Write resume bullets from implemented features and measured results; do not claim a custom-trained model, clinical validation, or invented impact metrics.

Done when: live link, repository, README, demo, and accurate resume bullets are ready to share.

## After v1: evaluated ML improvements

Create a domain-reviewed labeled benchmark, ideally with help from the original domain expert. Measure precision, recall, citation support, latency, and cost on held-out examples. Compare the current LLM approach with a lightweight classifier and retrieval from verified evidence. Add a custom model only if the comparison demonstrates a useful quality, cost, or latency improvement. Defer large-document chunking/OCR and institution-level analytics until the core flow is stable.

## Collaboration cadence

For each step: explain the problem and intended behavior, implement a bounded change, report checks and remaining limitations, and give a short demonstration path. Keep this roadmap updated as evidence changes. Prioritize a complete, credible v1 before expanding scope.
