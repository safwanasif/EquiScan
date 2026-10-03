# EquiScan: deployment roadmap

Updated October 1, 2026. This is the current plan; it supersedes the earlier provider and browser-only proposals in conversation.

## Product and architecture

Build a full-stack educational-text review assistant. Keep the existing Next.js/TypeScript UI, PDF tools and Supabase database. Replace Claude with Groq-hosted inference. Retain human review and avoid claiming clinical validation. Occasional maintenance is acceptable; no service is promised to remain free or unchanged forever.

Visitors can explore a clearly labeled sample without login. Account users can save and reopen audits. Prefer Google OAuth over relying on the limited built-in email sender. Keep Supabase unless a demonstrated blocker justifies migration. Its tested RLS and atomic-save work remain useful. Guest samples must work when auth/database services are unavailable.

## 1. Groq foundation — in progress

- [x] Runtime scan validation, exact source quotes, derived counts and consistent grades.
- [x] Replace Claude calls with configurable Groq inference for scan, rewrite and addendum.
- [x] Explicit size limits, timeouts, quota errors, incomplete-result rejection; no silent truncation.
- [x] Test live Groq calls after a server-only key is configured (four synthetic development cases; not clinical validation).
- [ ] Record latency and token usage on representative inputs; tune request budgets against account limits.

Exit: sample requests return validated results; quota/provider failures are understandable; no secrets or document text appear in logs. Mock tests do not verify live model quality.

## 2. Quality and evidence

- Create permissioned, reviewed examples including clean text, legitimate male cases, and insufficient context.
- Define category boundaries and evaluation methodology; separate sources across training/test splits.
- Measure false positives, missed findings, quote validity and latency.
- Verify evidence metadata and relevance before restoring citation links.
- Replace unsupported landing-page statistics, speed promises and claims about publication quality.
- Explain or remove the uncalibrated bias score; do not imply a clinical metric.

Exit: documented evaluation with limitations and reproducible examples. Synthetic fixtures are not clinical validation.

## 3. Complete the full-stack workflow

- Configure Google OAuth and production redirects; verify sign-in/out and recovery.
- Verify upload/paste → scan → save → reopen → review → export → delete in real browser sessions.
- Add audit detail pages, review progress, source highlighting and category filters.
- Verify two-user isolation, deletion behavior and workspace selection consistency.
- Remove the development impersonation helper from the production surface.

Exit: complete browser-tested journey with clear saved/unsaved states and no cross-account access.

## 4. Public demo and operational safeguards

- Ship a labeled precomputed sample that makes no AI request and needs no database.
- Protect live endpoints with durable quotas, bounded inputs/outputs and abuse controls.
- Show analysis coverage, useful errors and retry guidance; avoid repeated automatic model calls.
- Record non-sensitive operational metadata and engine versions.
- Review desktop/mobile accessibility and export layout.

Exit: visitors can explore the product when cloud analysis is unavailable; live usage cannot consume unbounded quota.

## 5. Deploy and verify

- Select hosting after checking runtime, PDF upload and execution limits.
- Configure secrets, exact auth redirects and reproducible database migrations.
- Run production smoke tests for success, invalid files, provider failures, unauthenticated actions and account isolation.
- Document database recovery, model replacement, backup/export and rollback.
- Add CI checks and a short monthly/manual pre-application health checklist.

Exit: deployed URL supports the complete workflow, sample mode survives unavailable services, and remaining limits are documented.

## 6. Portfolio release

- Publish architecture, setup, screenshots, short demo recording and measured evaluation results.
- Make repository visibility/license decisions before sharing; verify secret exclusion.
- Write resume bullets from implemented functionality and real measurements.

Exit: live demo, reviewable repository and accurate resume evidence. Then choose a complementary third project.

## After v1: hybrid ML

Train a small classifier only once reviewed, licensed data supports it. Compare Groq-only analysis against classifier-assisted analysis on held-out documents. Check missed candidates, precision/recall, latency and token savings. Integrate only if useful; no custom-model claim before training and evaluation actually happen.

## Current evidence

Legacy database upgrade and rollback-only two-user RLS tests passed; real browser auth remains pending. Analysis contract and mocked provider tests pass. Live Groq smoke calls passed on four synthetic development cases after prompt tuning; these are not held-out quality measurements. The prepared demo and saved-audit detail page are implemented locally. Google Cloud project EquiScan (`static-graph-510401-u1`) has been created; OAuth branding and credentials remain pending. Nothing is deployed yet. See docs/verification.md, docs/authentication.md and evaluation/README.md.

At each step: explain the change, implement a bounded slice, test it, record limitations, and commit reviewable work.
