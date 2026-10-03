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
