# EquiScan project guide

Snapshot: October 2, 2026, after commit 40f635a. This describes implemented behavior; future plans are identified separately.

October 6 update: application quotas are removed; ai-usage.ts now only verifies authentication. Its historical quota descriptions below describe the earlier implementation. The scanner now offers a sign-in prompt with a prepared guest demo option. Chrome PDF download is owner-confirmed.

## What the product is

EquiScan is a full-stack editorial review assistant for potential sex and gender bias in medical educational text. It helps a human inspect quoted passages, understand possible concerns, consider rewrites, and record decisions. It is not a medical diagnostic tool or a clinically validated bias detector.

The hackathon prototype used Claude. Current AI requests use Groq, with openai/gpt-oss-120b as the configurable default. No custom model has been trained. An OpenAI-named model hosted by Groq is not an OpenAI API call or a use of ChatGPT subscription credits.

## Languages and stack

| Technology | Responsibility |
|---|---|
| TypeScript | Typed frontend components, backend routes, validation and service adapters |
| TSX / React 19 | Interactive forms, results, review controls and reusable UI |
| Next.js 16.3.8 App Router | Pages, server rendering, API routes, auth callback and session proxy |
| CSS / Tailwind CSS 4 | Layout, typography, colour, responsive styling and animation |
| PostgreSQL SQL / PL/pgSQL | Schema, row-level security, atomic audit save and quota/rename functions |
| JavaScript .mjs / Node.js 24 | Tests, smoke checks, evaluation scripts and build tooling |
| JSON | Dependency metadata, TypeScript configuration and evaluation fixtures |
| YAML | GitHub Actions workflow |
| Markdown | Setup, architecture, verification, roadmap and portfolio documentation |
| Supabase | PostgreSQL storage and authentication, including Google OAuth |
| Groq | Hosted foundation-model inference for analysis, rewrites and addenda |
| pdf2json | Text extraction from text-based PDFs |
| @react-pdf/renderer | Server-generated PDF reports |

There is no separate Python ML training service, Express backend, or custom authentication database.

## User workflow

1. Explore the public prepared demo, or sign in for live AI and saved audits.
2. Choose a synthetic sample, paste text, or upload a PDF up to 4,000,000 bytes.
3. For PDFs, choose a contiguous page range and preview extracted text. Empty selected pages trigger a warning; image-only PDFs have no OCR support.
4. Submit 50–8,000 characters. Oversized text is rejected, not silently shortened.
5. The server validates input, verifies the session, reserves quota and requests Groq output.
6. Runtime validation rejects malformed output, invented source quotations and duplicate findings. Counts and letter grades are derived in application code.
7. Signed-in analysis attempts an atomic save of document, scan and findings. A save failure is distinguished from an analysis failure.
8. Inspect findings, filter by category/status, and accept, resolve, dismiss or reopen them.
9. Generate an optional editorial addendum. Explicitly save it to retain the latest draft with the audit. Alternative rewrites remain transient.
10. Reopen, rename, search, export, move to Trash or restore an audit.

## Categories and scores

Five categories: male-default generalisations; generic male pronouns; unsupported sex-based psychosomatic dismissal; explicit unsupported universal symptom claims; and unsupported generalisation/dismissal of sex-specific data. Missing information alone in a short excerpt should not trigger a finding. A legitimate case about a male patient should not be flagged solely for using he/his.

The AI concern score is an uncalibrated 0–10 editorial estimate. Lower means fewer estimated concerns; 0 means none supported were identified in the excerpt, not proof of no bias. It is not a percentage or medical accuracy measure. Grades are A below 2, B below 4, C below 6, D below 8, otherwise F. Review decisions do not recalculate the original score.

Workspace review progress replaces average workspace grading. It counts accepted, resolved and dismissed findings as reviewed, excludes trashed documents, and is unaffected by title-search filtering. This measures decisions, not improvement in source quality.

## Database model and security

| Table | Stores |
|---|---|
| workspaces | Workspace identity and metadata |
| workspace_members | User membership and role |
| documents | Title, source type, selected source text, creator and Trash timestamp |
| scans | Result summary, concern score, grade, totals and document/workspace linkage |
| flags | Quoted passage, category, severity, explanation, suggested rewrite and review status |
| ai_usage_buckets | User/global quota counters; no document text |
| editorial_drafts | Latest saved addendum per scan, creator and update timestamp |

Supabase auth.users supplies account identity. A provisioning trigger creates a workspace and owner membership for a new account. Row-level security restricts access using authenticated identity and membership. Source and ownership fields do not receive general browser edit permissions. Review changes are status-only; renaming is a narrowly scoped creator-only function. Draft updates cannot change scan or creator identity.

save_audit runs document/scan/flag writes in one transaction so invalid data cannot leave a partial audit. reserve_ai_request serializes reservations with a transaction advisory lock. Live scans, alternative rewrites and addenda share 8 requests per user per UTC day, 20 app-wide per UTC day, and one app-wide per calendar minute. Provider failures still consume a reserved attempt. Adjacent calendar minutes can admit requests close together. These limits do not guarantee provider availability.

The service-role key is used server-side for quota reservations; normal audit access uses the signed-in client so RLS applies. No secrets belong in browser-prefixed variables or Git. Trash is recoverable storage, not permanent erasure. The PDF binary is parsed for text; the normal audit save stores text/results, not a textbook file library.

## Source file map

Paths below are relative to the repository root. Files named page.tsx define pages; route.ts defines an HTTP handler. Generated dependency files are excluded from this map.

### Pages and session handling

| File | Function |
|---|---|
| app/page.tsx | Product landing page and entry points |
| app/layout.tsx | Shared HTML shell, metadata and Google font setup |
| app/globals.css | Global styles, theme and animations |
| app/favicon.ico | Browser tab icon |
| app/login/page.tsx | Login page and callback-error handling |
| app/login/login-form.tsx | Google OAuth and email magic-link forms, loading and error states |
| app/auth/callback/route.ts | Exchanges returned auth code for session, redirects to workspace or login error |
| app/scan/page.tsx | Input modes, file extraction, page selection, scan request, save attempt and generated draft state |
| app/dashboard/page.tsx | Authenticated workspace queries, active audit list, title search, review progress and Trash |
| app/dashboard/error.tsx | Workspace error and retry UI |
| app/audits/[id]/page.tsx | Authenticated audit lookup, reconstruction of saved results/statuses, draft loading and Trash state |
| app/audits/[id]/error.tsx | Saved-audit error and retry UI |
| app/demo/page.tsx | Prepared synthetic interactive audit and downloadable fixtures; no live inference/database required |
| proxy.ts | Session refresh/cookies and OAuth-error recovery; bypasses auth work for demo and sample files |

### Backend HTTP handlers

| File | Function |
|---|---|
| app/api/extract-pdf/route.ts | Validates uploaded PDF, extracts per-page text, returns page count/empty pages/text |
| app/api/scan/route.ts | Validates excerpt, reserves authenticated quota, calls model and validates scan output |
| app/api/rewrite/route.ts | Validates passage/category/context and returns three validated rewrite alternatives |
| app/api/addendum/route.ts | Validates source/result, rejects zero-findings requests, reserves quota and generates editorial draft |
| app/api/save-scan/route.ts | Authenticated audit-save request validation and atomic database RPC |
| app/api/update-flag/route.ts | Authenticated persisted review-status update |
| app/api/export-pdf/route.ts | Validates report payload and renders downloadable PDF |
| app/api/audit-trash/route.ts | Creator-scoped move-to-Trash and restore |
| app/api/audit-title/route.ts | Title/ID validation and restricted rename RPC |
| app/api/editorial-draft/route.ts | Validates and inserts/updates creator-owned saved addendum |

The former app/api/dev-login/route.ts was removed: arbitrary-email instant sign-in is no longer available.

### Reusable interface and report components

| File | Function |
|---|---|
| components/Navbar.tsx | Shared navigation to demo, workspace and scanner |
| components/AnimatedDocument.tsx | Landing-page document animation |
| components/SignOutButton.tsx | Sign-out action and navigation |
| components/ScanResults.tsx | Score/summary, quoted-source highlighting, finding filters, review decisions, rewrites and exports |
| components/AddendumPanel.tsx | Generates, displays, copies and explicitly saves addendum drafts |
| components/SavedAuditReview.tsx | Shared client state connecting a reopened draft, findings and report export |
| components/ReportPDF.tsx | PDF report layout, findings, review statuses, limitations and optional addendum |
| components/AuditTrashButton.tsx | Trash confirmation, restore action, busy/error state |
| components/AuditTitleEditor.tsx | Rename form, validation, save/cancel and refresh |

### Shared logic and examples

| File | Function |
|---|---|
| lib/types.ts | Shared TypeScript shapes for categories, findings, scans, addenda and requests; optional legacy fields do not imply active features |
| lib/prompts.ts | Model instructions for supported concerns, cautious rewrites and editorial addenda |
| lib/groq.ts | Server inference adapter: model/key configuration, timeout, JSON parsing and provider failure mapping |
| lib/analysis/validate.ts | Runtime output validation, exact quotes, duplicate rejection, limits, counts/grades, addendum and rewrite validation; withholds unverified citations |
| lib/server/ai-usage.ts | Verifies session and reserves database quota before inference; returns 401/429/503 guidance |
| lib/supabase/client.ts | Browser Supabase client |
| lib/supabase/server.ts | Cookie-aware server Supabase client |
| data/sampleDocs.ts | Synthetic scanner examples for cardiology, psychiatry and pharmacology |
| data/biasCategories.ts | Category display names, descriptions and presentation metadata |
| public/samples/*.txt | Four downloadable synthetic fixtures: generic-pronoun, specific-male, inclusive-instructions and insufficient-context |
| public/file.svg, globe.svg, next.svg, vercel.svg, window.svg | Static starter image assets; their presence does not make them core product features |

### Database migrations and SQL verification

| File | Function |
|---|---|
| supabase/migrations/202610010001_initial.sql | Initial upgraded schema, membership security, provisioning and atomic audit save |
| supabase/migrations/202610020001_audit_trash.sql | Deletion timestamp and creator-scoped recoverable Trash permission |
| supabase/migrations/202610020002_ai_usage.sql | Private counters and server-only quota reservation function |
| supabase/migrations/202610020003_audit_titles.sql | Validated creator-only rename function |
| supabase/migrations/202610020004_editorial_drafts.sql | Private saved addenda with RLS and column-scoped updates |
| supabase/tests/001_isolation.sql | Rollback-only provisioning, atomic-save, review and cross-user/grant tests |
| supabase/tests/002_audit_trash.sql | Rollback-only Trash/restore and immutability/isolation tests |
| supabase/tests/003_ai_usage.sql | Rollback-only reservations, caps, grants and invalid-user tests |
| supabase/tests/004_audit_titles.sql | Rollback-only rename ownership, validation and Trash restrictions |
| supabase/tests/005_editorial_drafts.sql | Rollback-only own draft save/update and cross-user/anonymous denial |

### Tests, tooling and configuration

| File | Function |
|---|---|
| tests/analysis.test.mjs | Output validation, invented/duplicate quote rejection, grades/counts and abstention |
| tests/groq.test.mjs | Mocked provider success, missing key, quota/errors and incomplete output |
| scripts/smoke-http.mjs | Local HTTP checks for public pages, auth redirects, invalid/oversized uploads, unsigned AI and removed login shortcut |
| scripts/smoke-export.mjs | Generates a synthetic report through the API and checks its PDF signature/content type |
| scripts/evaluate-groq.mjs | Opt-in live evaluation against small synthetic cases; consumes provider quota |
| evaluation/smoke-cases.json | Four development evaluation cases and expected categories |
| evaluation/README.md | Evaluation procedure and limitations; not a clinical benchmark |
| .github/workflows/checks.yml | GitHub Node 24 install, lint and tests; no live provider secrets/calls |
| package.json | Dependencies and dev/build/start/lint/test commands |
| package-lock.json | Locked dependency graph for reproducible npm installs |
| next.config.ts | Next configuration, including external handling for pdf2json |
| tsconfig.json | TypeScript compiler options and imports |
| eslint.config.mjs | Code lint configuration |
| postcss.config.mjs | CSS/Tailwind processing |
| tailwind.config.ts | Tailwind configuration/theme definitions; also inspect globals.css for active Tailwind 4 styling |
| .env.example | Variable names and safe setup instructions, no credentials |
| .env.local | Local secrets/configuration; ignored and never share its contents |
| .gitignore | Excludes dependencies, build output, secrets and temporary artifacts |
| AGENTS.md | Repository instruction to read installed Next.js guides before code changes |
| CLAUDE.md | Historical assistant/project context; may contain stale prototype assumptions |

### Documentation

| File | Function |
|---|---|
| README.md | Main product, architecture and local setup overview |
| CONTRIBUTING.md | Development workflow and contribution guidance |
| ROADMAP.md | Staged v1 and future ML plan; check verification log for latest completed work |
| docs/verification.md | Chronological evidence, tested workflows and unresolved checks |
| docs/release-checklist.md | Deployment checklist; some older checkboxes lag the verification log |
| docs/rebuild.md | Architecture/rebuild rationale and staged approach |
| docs/authentication.md | OAuth setup and authentication verification |
| docs/database.md | Schema/migration and isolation verification |
| docs/ai-usage.md | Quota semantics, failure behavior and test evidence |
| docs/deployment.md | Proposed Vercel configuration, callbacks and recovery procedure |
| docs/attribution.md | Synthetic fixtures and external PDF provenance |
| docs/demo-script.md | Recruiter walkthrough |
| docs/portfolio.md | Engineering/portfolio presentation guidance |
| docs/project-guide.md | This detailed product and file walkthrough |

node_modules is installed third-party code, .next is generated Next output, .git contains version history, and tmp contains ignored downloaded PDFs/export checks. They are not application source files to explain or commit individually.

## Verified versus remaining

Verified locally: production build/lint/five tests; Google owner login; real two-page PDF extraction; synthetic live analysis/save/reopen/review; filters/reopen; page selection; title search; renaming; Trash/restore; live draft generation/save/reload; rollback-only database tests; unsigned AI rejection; PDF API generation and earlier rendered report checks. First GitHub CI run passed.

Still pending: public deployment, production callbacks and public OAuth audience, second-account browser workflow, confirmed saved browser download, rendered PDF containing the latest saved addendum, full accessibility/device coverage, multi-connection quota contention test, and a representative human-reviewed evaluation. Full npm audit has five development lint dependency findings; production-only audit reported zero after dependency updates. Neither result proves complete security.

Future capabilities, not implemented: OCR, large-book storage/background scanning, source-linked page findings, verified citation retrieval, custom trained ML, persistent alternative rewrites and draft version history. The current PDF range survives through its audit title, not structured per-finding page citations.

## Longevity and resume framing

The prepared demo works without Groq or Supabase. Live features still depend on those services; Supabase Free can pause with low activity, provider models/limits can change, and a free service is not guaranteed forever. Deployment recovery is documented, not yet exercised on a public host.

Accurate framing: built a Next.js/TypeScript editorial review application with hosted LLM inference, validated source-linked findings, PostgreSQL RLS, transactional persistence, human review workflows, saved drafts, reports and durable AI quotas. Do not claim a trained model, clinical accuracy, medically verified citations, whole-textbook analysis or a live public deployment until supported.

## October 6 final implementation update

Current status and remaining checks supersede the earlier snapshot above: see release-checklist.md and recruiter-walkthrough.md. Deployment, production callbacks and owner-confirmed Chrome PDF reports are complete. Application quota reservations are removed. New files: ReviewerNote.tsx, RevisionPreview.tsx and AuditRevisionHistory.tsx; api/reviewer-note and api/audit-revision; analysis/edits.ts and analysis/comparison.ts; tests/edits.test.mjs and comparison.test.mjs; migrations/tests for notes and revisions; app/evaluation/page.tsx. My audits is the user-facing library name; database workspaces remain internal.
