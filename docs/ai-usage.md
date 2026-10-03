# Live AI usage

Scans, alternative rewrites, and addenda require a verified Supabase session. The server reserves a request before contacting Groq. Apply `supabase/migrations/202610020002_ai_usage.sql` and configure the server-only `SUPABASE_SERVICE_ROLE_KEY` before using live AI.

Allowances are 8 requests per user per UTC day, 20 across the application per UTC day, and one across the application per calendar minute. These are application limits, not promises about provider capacity. Adjacent calendar minutes can admit requests close together. Provider errors may still occur, and reserved attempts count even if inference fails.

Reservations use a database transaction and a shared advisory lock so multiple server instances cannot independently spend the same allowance. Browser roles cannot access the counters or invoke the reservation function. Counters contain a user ID and counts, with no document text. Old buckets are cleaned up after 30 days when a reservation succeeds.

Missing configuration or database errors return 503 without calling the model; exceeded limits return 429 with Retry-After. The prepared `/demo` needs no AI reservations. Removing the development login shortcut prevents arbitrary-email impersonation in development as well as production.

Verification: the migration was applied to the existing EquiScan project on October 2, 2026. Rollback-only SQL checks in `supabase/tests/003_ai_usage.sql` passed for server-only function permissions, reservations, all three caps, uncharged denials, and rejection of unknown users. A multi-connection concurrency test remains pending; the reservation function serializes checks with a transaction advisory lock.
