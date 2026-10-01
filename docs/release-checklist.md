# EquiScan release checklist

The [v1 roadmap](../ROADMAP.md) defines scope. Check items only when supporting verification exists.

## Baseline

- [x] Inspect prototype and research context.
- [x] Verify lint, TypeScript, and production build on October 1, 2026.
- [x] Preserve prototype in local Git history.
- [x] Replace starter README and add environment setup documentation.

## Before deployment

- [ ] Recover and version database schema and policies.
- [ ] Verify real login, workspace provisioning, and two-user isolation.
- [ ] Validate requests and model outputs; unify grading and counts.
- [ ] Verify citations and correct unsupported claims.
- [ ] Fix PDF text boundaries and disclose analyzed coverage.
- [ ] Make saving atomic and connect persisted flag IDs to review controls.
- [ ] Reopen and delete saved audits; preserve report content.
- [ ] Add visible error recovery and a precomputed visitor demo.
- [ ] Protect paid endpoints with durable quotas and spending safeguards.
- [ ] Correct privacy copy and verify retention/deletion behavior.
- [ ] Verify desktop/mobile, keyboard use, and rendered PDF reports.
- [ ] Add regression tests and CI.
- [ ] Review dependency security and migrate deprecated middleware.

## Deployment and portfolio

- [ ] Select hosting after checking current upload and execution limits.
- [ ] Configure production secrets, auth redirects, and database policies.
- [ ] Verify the live workflow, failure recovery, and account isolation.
- [ ] Record deployment evidence and a recovery procedure.
- [ ] Add actual screenshots and a short demo recording.
- [ ] Publish the repository when ready and write accurate resume bullets.
