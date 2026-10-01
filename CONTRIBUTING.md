# Working on EquiScan

## Change workflow

1. Choose a bounded roadmap item and explain the intended behavior.
2. Inspect existing code and read relevant installed Next.js documentation, as required by AGENTS.md.
3. Implement the change with meaningful regression coverage where warranted.
4. Run relevant checks and update documentation with actual results.
5. Review the diff and create a focused commit; explain remaining limitations and a manual verification path.

Use descriptive subjects such as `fix: connect saved flag review actions`, `feat: reopen saved audits`, or `docs: explain local setup`. Keep unrelated refactors separate. Never commit credentials, patient records, or raw private research files.

## Documentation and comments

README covers purpose, architecture, setup, verification, API, and limitations. ROADMAP.md defines scope. The release checklist records evidence; the portfolio guide explains the demo and engineering decisions. Link to authoritative detail instead of duplicating it.

Comments should explain an invariant, workaround, or design constraint. Prefer clear names over comments restating code. Add screenshots, deployment URLs, metrics, and resume claims only after they exist and have been verified.

## Verification

Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` for relevant application changes. Documentation-only edits require accuracy and link review. Static checks do not replace browser, database isolation, authentication, AI evaluation, or PDF layout verification.
