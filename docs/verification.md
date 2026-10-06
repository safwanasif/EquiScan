# Initial browser verification

October 1, 2026. Local development server; this is not production verification.

## Observed

- Landing and scanner pages render in the browser. The existing serif/rose design is retained.
- A live cardiology sample analysis returned successfully; one measured request took 38.7 seconds. Another displayed eight findings and a D grade. This demonstrates the pipeline, not accuracy or stable output.
- An unsigned-in save returns 401. The results now explain that the audit was not saved and that the report can still be downloaded.
- Visiting `/dashboard` without a session redirects to `/login`.
- Navigation includes Workspace, and homepage section links resolve from the scanner.
- Lint, TypeScript, and production build pass after the proxy migration, without the old file-convention warning.

## Changes in this batch

Renamed middleware to proxy using the installed Next.js 16 guide. Added workspace navigation and corrected cross-page anchors. Kept successful scan results independent of save failures. Passed the captured document title into PDF export. Cleared old extracted text when a replacement PDF upload begins. Corrected the landing/login statements about Anthropic processing and Supabase storage.

## Remaining checks

Supabase project `drctvavraalywvpcpbbc` was paused and was resumed through its dashboard. Early SQL checks returned zero tables/users during recovery. **Correction:** the legacy schema subsequently became visible; the earlier conclusion that it was absent was premature. The subsequent data-preserving migration and database tests are recorded in [database verification](database.md).

Real magic-link login, account isolation, saved review/reopen behavior, rendered PDF layout, mobile/keyboard regression coverage, and model correctness remain unverified. One output flagged a pronoun referring to an explicitly identified male case patient; context-sensitive false positives need evaluation before trusting the taxonomy.

## Prepared sample: October 1, 2026

Added /demo with synthetic prepared findings, local-only review decisions, and JSON export. The route skips Supabase session refresh; navigation prefetch is disabled to avoid background auth-dependent navigation requests. Browser verified initial render, expansion, acceptance, and reset on refresh. Download implementation is present but downloaded-file contents have not yet been verified. This does not verify cloud saving or live AI quality.

## Saved audit detail route: October 1, 2026

Added /audits/[id] using signed-in Supabase queries and existing RLS. Dashboard titles link to the latest scan. Source/findings are loaded without another model call and persisted flag statuses initialize review controls. Query failures show a retry page; absent/inaccessible scans use not-found behavior. Dashboard workspace ordering now matches save_audit.

Lint, TypeScript and production build passed. Production HTTP checks: /demo returned 200, malformed audit ID returned 404, and a signed-out valid-format audit URL redirected to /login. Authenticated reopen/update/reload and another-user browser checks remain pending. Original findings are restored; generated addenda/extra rewrite variants are not persisted.

The old development process encountered a stale middleware.ts cache reference. It was stopped; the production build is now served locally with npm run start. Development-cache recovery remains separate from application verification.

## October 2: local server and expired OAuth recovery

- Port 3000 had no listener when Workspace was reported unreachable. Restarted the local production server after a successful build.
- Provider errors returned to the homepage now redirect to a fixed login recovery URL; provider descriptions are not reflected into the UI.
- HTTP checks: signed-out dashboard -> 307 /login; homepage bad_oauth_state -> 307 /login?error=auth_failed; recovery login -> 200 with Google button and retry message; demo -> 200.
- Audit error retry now uses Next.js unstable_retry to refetch server content, as documented by the installed version.
- Browser tooling did not expose the user's tabs in this session. Successful Google consent/session and authenticated save/reopen/review remain unverified.

## October 2: authenticated audit workflow and sample pack

Browser confirmed Google-authenticated workspace access. Downloaded the public NHLBI two-page fact sheet linked in attribution.md; uploaded through the visible file chooser, extracted 1,395 characters, ran live Groq analysis, saved successfully, and reopened from Workspace. That run returned zero findings. This is one integration observation, not expert evaluation.

Pasted an explicitly synthetic generic-pronoun example; one finding was saved. Accepted its review decision, reopened from Workspace, and refreshed: accepted remained visible and the open-flag count was zero. This verifies one real user session; separate-user browser isolation remains pending.

New sample downloads mirror the four development fixtures. Added attribution and recruiter walkthrough docs following FootyIQ's documentation pattern. Existing sample cards now identify their invented content. Opening a finding displays the original suggested edit; alternative rewrites require an explicit action. Browser checked that control on a reopened audit.

No-findings addenda are rejected before inference and hidden in the UI. Addendum prompt now requests a brief editorial draft without invented medical evidence. Live addendum quality has not been re-evaluated.

PDF endpoint now validates source quotes/result structure/title/addendum/review statuses before rendering. Export includes review decisions and a provisional-grade label. Rendered and inspected a synthetic one-finding accepted report and a zero-findings report; corrected overlapping title/subtitle. Browser download event automation timed out, so a saved browser download is not claimed. Long multi-page reports remain unverified.

Production build, lint and all five contract tests passed. scripts/smoke-http.mjs passed public paths, signed-out workspace redirect, OAuth recovery, invalid upload, no-findings addendum, and malformed export rejection. scripts/smoke-export.mjs returned a valid PDF with accepted status, then visual inspection confirmed its layout. These scripts make no model calls or database writes.

## October 2: finding filters and reversible review

Added category/status filters and reviewed-count progress to live and prepared results. Filters affect only the visible list; PDF export includes all findings. Added Reopen finding to reverse a review decision through the existing authenticated status endpoint.

Browser verified Open filter hides the accepted synthetic finding with an empty-state message, All statuses restores it, and Reopen finding persists after reload with 0 of 1 reviewed. The synthetic audit is now open. Build and lint passed.

## October 2: recoverable audit deletion

Added POST /api/audit-trash, in-app confirmation, Trash view, and restoration. Active workspace metrics omit trashed documents and their scans/flags. Detail URLs show a restore view for trashed audits. Database errors now show a workspace retry screen rather than an empty dashboard.

Approved migration 202610020001 applied successfully. Rollback-only database test 002 passed (see database.md). Browser moved the synthetic Pasted Medical Text audit to Trash, verified active document count changed 2 to 1 and open flags 1 to 0, then restored it from Workspace. Counts returned to 2 documents and 1 open flag. No original data was permanently deleted. Lint and production build passed.

## October 2: durable AI allowances

Applied migration 202610020002 and passed rollback-only SQL test 003: server-only function permission, counter reservations, minute/global/user caps, uncharged denials, and unknown-user rejection. The tests leave existing counters and data unchanged. Multi-connection concurrency testing remains pending.

Removed the development instant-login endpoint and button. Production HTTP smoke checks pass for valid unsigned scan/rewrite/addendum requests returning 401 and the removed endpoint returning 404, in addition to existing checks. Production build and lint pass. Signed-in workspace reload still shows both saved audits.

Result UI now calls the score an AI concern score and explains its uncalibrated nature, lower-is-fewer direction, excerpt scope, and independence from review decisions.

## October 2: mobile and download reliability

Inspected workspace, saved audit, scanner, and prepared demo at a 390 by 844 viewport. Workspace, saved audit, and demo had document width 375 versus viewport 390, with no horizontal overflow. Visible headings, navigation, score, and primary controls fit. This is a spot check, not full device or keyboard coverage.

Changed PDF Blob URL cleanup from immediate revocation to a 60-second delay so the browser can begin reading it. PDF endpoint smoke check, lint, and production build pass. In-app-browser download events still timed out; an actual saved browser download remains unverified. No export failure message appeared.

Added GitHub Actions for npm ci, lint, and the existing validation/provider-adapter tests on Node 24. It requires no project secrets or live model calls. Remote CI execution is pending.

## October 2: hosting preparation and dependency review

GitHub Checks run 37086978698 succeeded for e79b28a. Updated Next.js and eslint-config-next to 16.3.8 and applied compatible npm audit fixes. npm audit --omit=dev reports zero vulnerabilities. Full audit retains five high findings through braces/micromatch/fast-glob in development lint dependencies; npm recommends an incompatible downgrade, which was not applied. Lint and five tests pass after update.

Vercel's documented 4.5 MB function payload limit prompted a 4,000,000-byte PDF limit checked in client and server. Upload errors now preserve server messages. Added docs/deployment.md covering configuration, callbacks, release checks, and Supabase inactivity recovery. Hosting, public deployment, and second-account browser verification remain pending.
Production build on Next.js 16.3.8 and HTTP/export smoke checks passed, including rejection of a 4,000,001-byte PDF before parsing.

## October 2: PDF page selection and workspace search

PDF extraction now returns page-numbered text, total pages, and empty-page numbers. Scanner defaults to page 1, supports an explicit contiguous page range, previews selected text, warns about empty selected pages, and disables analysis above 8,000 characters without truncation. PDF audit titles capture the selected page range. No OCR or whole-book processing is claimed.

Browser uploaded the two-page NHLBI fixture: page 1 prepared 466 characters; pages 1–2 prepared 1,396 characters. Direct endpoint verification confirmed both page records and joined text. This check made no AI call and did not save an audit. Page-level extraction still uses the existing heuristic text reconstruction; formatting accuracy is not guaranteed.

Workspace title search verified nhlbi matches only the saved PDF, an unmatched query shows a clear empty state, and workspace totals remain unchanged. Lint, five existing tests, production build, and HTTP smoke checks pass.

Next v1 features: persist editorial drafts and rename audits, then finish accessibility/export/account-isolation checks and deploy. Draft persistence and renaming require a narrowly scoped database migration and are not yet implemented.

## October 2: review progress and audit renaming

Replaced the workspace average concern score and letter grade with review progress. Accepted, resolved, and dismissed findings count as reviewed; open findings do not. Empty findings show no findings to review. This measures recorded decisions, not document quality or improvement. Browser verified current workspace shows 0 of 1 reviewed and one open finding.

Approved migration 202610020003 applied successfully. Rollback-only SQL test 004 passed: creator rename, title trimming, immutable source, invalid titles, and denial for trashed and cross-user documents. Browser renamed the existing synthetic audit to Synthetic pronoun review and confirmed persistence after reload. Build and lint passed before application. Saved editorial drafts remain the next feature.

## October 2: saved editorial addenda

Approved migration 202610020004 applied. Added creator-scoped editorial_drafts storage, column-limited updates, signed-in validated save endpoint, explicit Save draft control, and reopened audit draft loading. Latest saved draft per scan is retained; displaying a new draft does not erase the prior saved copy until explicitly saved. Saving uses no provider request. Alternative rewrites remain transient.

SQL test 005 passed own save/update, immutable creator, anonymous denial, and cross-user read/update denial, with all fixtures rolled back. Browser generated a 64-word editorial addendum for the existing synthetic pronoun audit, saved it, and confirmed the same content after reload without regeneration. This demonstrates workflow, not clinical validity. Saved draft is supplied to the existing PDF export; a rendered export containing this new saved draft has not yet been verified.

Lint, production build, five existing tests, and HTTP smoke checks passed. Next: final product copy/accessibility/export/account checks and deployment.

## October 2: final product copy and deployment preparation

Removed unsupported landing claims about publication-ready addenda, fixed completion times, missing chapters, and clinically defined categories. Metadata now describes excerpt-based editorial review. Addendum copy reports clipboard success/failure, labels the draft unverified, and explains that starting a new draft preserves the saved copy until replacement.

Lint, five tests, production build, HTTP smoke checks and synthetic PDF export check passed. Vercel Hobby account is signed in, existing EquiScan GitHub repository is available, and Next.js import configuration is prepared with root ./. No project creation or deployment has been submitted. Secret entry is handed to the user in the Vercel environment panel.

## October 5: production deployment and authentication

The owner deployed through Vercel after entering environment variables. Production https://equi-scan.vercel.app passed public HTTP smoke checks for demo/sample/login routes, unsigned workspace redirects, OAuth error recovery, invalid/oversized requests, protected AI routes, and removed development login. These checks made no provider calls or database writes.

Approved Supabase Site URL https://equi-scan.vercel.app was saved and confirmed after reload. Exact production and localhost /auth/callback URLs remain allowed. Production Google login reached the authenticated workspace and loaded both existing audits. The synthetic audit reopened with source, finding, status, and saved 64-word addendum. This verifies persistence, not fresh inference or clinical validity.

Remaining: fresh production scan/save/review, actual browser PDF download, second-account production login/isolation, broader keyboard/accessibility checks, and portfolio recording. Repository remains private. See deployment.md for recovery guidance.
