# EquiScan demo and engineering guide

## Planned two-minute demo

This is the v1 target; saved review/reopen actions remain incomplete.

1. Open a labeled sample and explain the educator/editor audience.
2. Show a potential issue in source context with supporting evidence.
3. Compare rewrite drafts; explain that an editor makes the decision.
4. Save an audit, record a review decision, and reopen it from history.
5. Export findings, citations, and an optional draft addendum.
6. Explain analysis coverage, measured evaluation once available, and limitations.

## Current engineering decisions

- Server-side Next.js routes hold the Anthropic key.
- Five categories structure findings; runtime schema enforcement is planned.
- A prompt citation library constrains references; canonical validation is still required.
- pdf2json extracts text and React PDF generates reports; both need targeted verification.
- Supabase provides account storage; database policies must be inspected and tested.

## Evidence before resume claims

Report implemented features, verified deployment, and measured results. Do not claim custom training, clinical validation, reduced diagnostic errors, adoption, or accuracy percentages without evidence.

For a later classifier experiment, record labels, domain review, provenance, document-level splits, baselines, held-out metrics, latency, and cost. Define promotion criteria before opening the final test set. Preserve negative results and limitations, following FootyIQ's evidence-driven approach.
