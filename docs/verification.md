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
