# EquiScan: recruiter walkthrough

Updated October 6, 2026. Describe only shipped, verified behavior. See verification.md for precise test limits.

## Thirty-second introduction

EquiScan is a full-stack editorial review assistant for potential sex and gender bias in medical educational excerpts. A user uploads a text-based PDF or pastes an excerpt, receives source-linked AI findings, records human review decisions, and previews suggested edits. They can save private audits, reviewer notes, editorial addenda and revised snapshots, rescan a revision, compare findings and export reports. It supports a public prepared demo so visitors can explore without signing in or relying on live inference.

## What I engineered

I built the application workflow around hosted model inference: authenticated API routes, runtime output validation, exact source-quote checks, transactionally saved audits, PostgreSQL row-level security, human review state, safe edit application, version relationships, and PDF export. The model is hosted by Groq; I did not train it. The application's value is the traceable review workflow and engineering around model output, not a claim that AI establishes clinical correctness.

## Demonstration sequence

1. Open https://equi-scan.vercel.app/demo. Show the guest/account distinction and expand the fixed pronoun finding. Guest decisions reset and the example makes no AI call.
2. Sign in with Google. Open the personal audit library and a saved audit. Explain that database policies enforce private access independently of the frontend.
3. Show a source-linked finding, use Go to passage, and record a decision plus its rationale. Reopening keeps the saved state without rerunning AI.
4. Select suggested rewrites and compare original/revised text. Original source stays intact; repeated or overlapping passages are rejected rather than silently replaced.
5. Save a draft snapshot or rescan and save a separate linked audit. Open version history and compare new, retained and no-longer-reported findings. Explain model variation and exact-match limitations.
6. Show a saved editorial addendum and PDF report. These are drafts for review, not medically verified advice.
7. Open /evaluation after its deployment is verified. It documents synthetic cases and engineering checks without claiming benchmark accuracy.

## Frontend

Next.js App Router pages use React 19, TypeScript and Tailwind CSS 4. Server components load protected audits; client components handle input modes, PDF page selection, filters, review decisions, draft edits and save states. Native dialogs provide a sign-in prompt with a prepared guest demo alternative. Source passages have keyboard interaction, and responsive layouts show original/revised text side by side when space permits.

Key components: ScanResults for findings/review/export, ReviewerNote for explicit note saves, RevisionPreview for edit selection and snapshot/rescan actions, SavedAuditReview for shared saved-audit state, AuditRevisionHistory for persisted comparisons, and ReportPDF for report layout.

## Backend and data flow

Browser → Next.js API → verified Supabase session → validation → Groq inference → validated JSON → Supabase transaction → UI.

PDF extraction uses pdf2json on the server. The upload cap is 4 MB and live analysis accepts 50–8,000 characters. Users select a page range and inspect extracted text; image-only documents need pasted text because OCR is not implemented.

Groq uses a configurable model, currently defaulting to openai/gpt-oss-120b. Requests have timeouts and bounded output; malformed output and unsupported source quotes are rejected. The original score is an uncalibrated model estimate, not a percentage or medical accuracy metric. Provider limits still apply; application quota caps were removed on owner request.

Supabase provides Google OAuth and PostgreSQL storage for workspaces/membership, documents, scans, findings, saved addenda and revisions. Normal writes run under the signed-in user's policies. The save_audit transaction prevents partial document/scan/finding writes. Revision creation can atomically save a separate child audit and its relationship to the original. Notes use a restricted creator-checking function. Original audit source is not overwritten by review edits.

Exports use @react-pdf/renderer. Vercel hosts the Next.js application; GitHub Actions runs lint and automated tests. Credentials stay outside Git, and model credentials stay server-side.

## Honest limitations

No trained classifier, clinical validation, verified medical citation system, OCR, whole-textbook processing, or representative held-out benchmark is claimed. Comparison uses quote/category matching rather than semantic alignment. PDF passage navigation currently targets extracted text; persisted original PDF coordinates are still planned. New-account browser isolation and some download/accessibility checks remain recorded release work. Free service availability requires occasional maintenance.

## Resume wording

- Built and deployed a Next.js/TypeScript editorial review app integrating Groq inference, Google OAuth and PostgreSQL row-level security for private saved audits.
- Implemented source-grounded output validation, transactional persistence, reviewer annotations, reversible draft edits, linked revision comparisons and PDF report export; tested model failure handling and cross-user database isolation.

Use metrics only when actually measured. Do not claim production user counts, clinical accuracy or whole-document coverage.
