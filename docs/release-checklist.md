# EquiScan release checklist

Updated October 6, 2026. Historical evidence is in verification.md; future scope is in feature-roadmap.md.

## Completed

- [x] Vercel deployment and production Google sign-in.
- [x] Live production scan, automatic save, reopen and review persistence.
- [x] Runtime request/output validation, exact source quotes and derived counts/grades.
- [x] Atomic audit persistence and rollback-only database isolation tests.
- [x] Recoverable Trash, rename and title search.
- [x] Reviewer notes and saved addenda; notes included in exports.
- [x] Revised-text preview, conflict rejection, undo and snapshots.
- [x] Linked rescans and exact-quote/category comparisons.
- [x] Public prepared demo and account/guest distinction.
- [x] Public evaluation evidence page, clearly limited to development cases.
- [x] PDF API rendering verified, including a long note; Chrome report download owner-confirmed.
- [x] Lint, production build, automated tests, HTTP checks and CI configuration.
- [x] Deployment recovery documentation and recruiter walkthrough.

## Remaining evidence gaps

- [ ] Second Google account production login and guessed-audit denial through the browser (database tests pass).
- [ ] Actual revised-text file download verified in a regular browser.
- [ ] Comprehensive keyboard/screen-reader and device coverage.
- [ ] Final deployment of latest polish inspected.
- [ ] Short demo recording and public repository decision.

## Deliberate scope decisions

No clinical validation, representative accuracy benchmark, OCR or original PDF coordinate mapping is claimed. Application quotas are removed at the owner's request; provider limits remain. Existing legacy quota migrations are historical and unused. Production dependency audit was previously clean; development lint dependency findings were documented.
