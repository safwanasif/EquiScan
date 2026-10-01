# Database setup and verification

## Applied foundation

`supabase/migrations/202610010001_initial.sql` was applied to EquiScan project `drctvavraalywvpcpbbc` on October 1, 2026 through the Supabase SQL editor. The same migration plus the isolation tests first passed inside a rollback-only transaction against the restored legacy database.

The initial zero-table observation occurred during recovery and was not the final restored state. The legacy schema, provisioning trigger, and policies subsequently became visible. The migration preserves those tables and records. It replaces the legacy unrestricted membership-insert policy, narrows grants, and adds composite parent keys so a flag cannot belong to a scan/document in a different workspace.

## New environment

Apply the migration once in an empty Supabase project using its SQL editor or your migration runner. It contains its own transaction. Do not rerun it on the existing EquiScan project; later changes need new migration files. This initial application was manual and is not recorded in Supabase CLI migration history. Reconcile migration history before adopting CLI push against this project.

The fresh-project creation path is included but has not been separately exercised on a clean project. The verified path is the upgrade of the restored legacy schema.

## Access model

- New auth accounts receive a personal workspace through the `auth.users` trigger, including admin-created accounts.
- Existing memberships and shared workspaces remain intact. Audits currently use the caller's earliest joined workspace; workspace selection is not yet a UI feature.
- Membership reads expose only the caller's memberships. Client membership insertion is denied.
- Document, scan, and flag access requires membership. Creator identity is checked on insert; composite foreign keys enforce parent/workspace consistency.
- Only the flag status column can be updated by authenticated clients. Review states are constrained to open, accepted, resolved, or dismissed.
- `save_audit` uses caller privileges and RLS, writes all audit records in one transaction, derives counts/grade, and returns the local-to-database flag ID map.
- Client-supplied analysis is still untrusted content; full AI response validation and provenance are a later milestone. Persisted scores are not clinical validation.

## Repeatable database checks

Run `supabase/tests/001_isolation.sql` through the SQL editor as the database administrator. It creates two synthetic users, switches to the authenticated role, tests access and writes, and rolls the transaction back. It does not send emails or retain test accounts. Expected final result begins `PASS: provisioning, atomic save`.

Coverage: provisioning, membership/workspace isolation, anonymous grants, derived counts/grade, own review update, invalid-final-flag rollback, immutable content, membership escalation, cross-user reads and updates, and forged creator rejection. This tests PostgreSQL roles/RLS, not two independent browser sessions or email delivery.

If any assertion fails, stop and inspect the failure; do not remove real data to make tests pass. Existing schema incompatibilities cause the migration to fail atomically.

## Auth verification still required

Use the real magic-link flow and verify redirects, the dashboard, saving a non-sensitive sample, and changing a flag status. The development login helper is not evidence that email login works. The helper now relies on the database trigger instead of creating a duplicate workspace.

Design references: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [auth user triggers](https://supabase.com/docs/guides/auth/managing-user-data), and [database functions](https://supabase.com/docs/guides/database/functions).
