# EquiScan roadmap

Updated October 6, 2026. Current scope supersedes earlier plans. Detailed status: docs/feature-roadmap.md. Test evidence: docs/verification.md.

## Portfolio release

Implemented: Groq inference with runtime source-quote validation; Google authentication; private saved audits; PDF extraction and page-range selection; finding filters and source passage navigation; persistent review decisions and reviewer notes; saved editorial addenda; PDF reports; reversible draft preview and text export; private revision snapshots, linked rescans and exact-quote comparisons; recoverable Trash; title search and rename; guest prepared demo; evaluation evidence page; CI and versioned database migrations.

Deployed on Vercel at https://equi-scan.vercel.app. Application daily/minute quotas were removed on owner request. Authentication and provider limits still apply. Guest mode has no live inference or private persistence.

## Final verification

Complete second-account production Google login/access check when the owner provides another account. Validate actual revised-text download and comprehensive keyboard/mobile behavior. Keep these evidence gaps visible; passing SQL isolation tests does not replace the full second-account browser test.

## Future improvements

Persist PDF page/offset mappings, add original-PDF navigation, build a representative independently reviewed evaluation set, support tags/favourites, and improve comparison matching beyond exact quotations. OCR, whole-textbook background processing and clinical validation are outside this release. No additional features are needed before the STEM fair.
