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

Supabase project `drctvavraalywvpcpbbc` was paused and was resumed through its dashboard. After recovery, read-only SQL against `postgres` returned zero public tables and zero auth users. The expected workspace/document/scan schema is absent in this project. This establishes current state, not why it differs from the old handoff. No database schema or policy changes have been applied in this batch. Next work must provide versioned schema and provisioning rather than assume the historical RLS patch applies.

Real magic-link login, account isolation, saved review/reopen behavior, rendered PDF layout, mobile/keyboard regression coverage, and model correctness remain unverified. One output flagged a pronoun referring to an explicitly identified male case patient; context-sensitive false positives need evaluation before trusting the taxonomy.
