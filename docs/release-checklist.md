# EquiScan release checklist

The [v1 roadmap](../ROADMAP.md) defines scope. Check items only when supporting verification exists.

## Baseline

- [x] Inspect prototype and research context.
- [x] Verify lint, TypeScript, and production build on October 1, 2026.
- [x] Preserve prototype in local Git history.
- [x] Replace starter README and add environment setup documentation.
- [x] Migrate session refresh to proxy.ts; verify sample analysis and unsigned-in workspace redirect. See [verification notes](verification.md).

## Before deployment

- [x] Inspect restored schema and apply a versioned, data-preserving upgrade; see [database verification](database.md).
- [ ] Verify real login, workspace provisioning, and two-user isolation.
- [ ] Validate requests and model outputs; unify grading and counts.
- [ ] Verify citations and correct unsupported claims.
- [ ] Fix PDF text boundaries and disclose analyzed coverage.
- [x] Make saving atomic and connect persisted flag IDs to review controls; database tests pass, browser verification pending.
- [ ] Reopen and delete saved audits; preserve report content.
- [ ] Add visible error recovery and a precomputed visitor demo.
- [ ] Protect paid endpoints with durable quotas and spending safeguards.
- [ ] Correct privacy copy and verify retention/deletion behavior.
- [ ] Verify desktop/mobile, keyboard use, and rendered PDF reports.
- [ ] Add regression tests and CI.
- [ ] Review dependency security.

## Deployment and portfolio

- [ ] Select hosting after checking current upload and execution limits.
- [ ] Configure production secrets, auth redirects, and database policies.
- [ ] Verify the live workflow, failure recovery, and account isolation.
- [ ] Record deployment evidence and a recovery procedure.
- [ ] Add actual screenshots and a short demo recording.
- [ ] Publish the repository when ready and write accurate resume bullets.
