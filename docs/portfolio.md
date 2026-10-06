# EquiScan demo and engineering guide

Current walkthrough: [recruiter-walkthrough.md](recruiter-walkthrough.md). Product and test status: [feature-roadmap.md](feature-roadmap.md), [verification.md](verification.md), and [release-checklist.md](release-checklist.md).

EquiScan is deployed at https://equi-scan.vercel.app. Use /demo for a prepared guest experience and /evaluation for transparent development evidence. Sign in for personal excerpts and private saved audits.

Engineering: Next.js/TypeScript, React, Tailwind, server-side Groq inference, runtime source grounding, Supabase Google OAuth/PostgreSQL RLS, transactional persistence, reviewer notes, reversible edits, saved revisions, exact-quote comparisons and React PDF export. No custom model training or clinical correctness claim.

Describe features with their limitations: scores are uncalibrated; rewritten text requires human review; comparison disappearance is not proof of quality improvement; selected PDF text is bounded to 8,000 characters. Remaining browser/account checks are disclosed in the release checklist.
