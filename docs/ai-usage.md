# Live AI usage

Scans, alternative rewrites, and addenda require a verified Supabase session. As requested by the owner on October 6, 2026, application daily and per-minute quotas are removed. The server checks authentication before contacting Groq; provider capacity and rate limits still apply. The prepared /demo requires no account or AI call.

The application no longer needs SUPABASE_SERVICE_ROLE_KEY for live inference. Existing quota database objects and historical SQL tests remain for migration history but are not invoked by the application. No database permissions are expanded.
