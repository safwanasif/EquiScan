# Deployment and recovery

Proposed v1 host: Vercel Hobby for this personal portfolio application, with the existing Supabase and Groq projects. Deployment has not yet been performed.

Vercel functions limit request bodies to 4.5 MB. EquiScan limits PDFs to 4,000,000 bytes, checked before uploading and on the server, leaving room for multipart overhead. Analysis still accepts at most 8,000 extracted characters. Larger documents require a smaller section; image-only PDFs need text pasted manually.

References checked October 2, 2026:
- https://vercel.com/docs/functions/limitations
- https://supabase.com/docs/guides/platform/free-project-pausing

## Configure

Import the existing repository with the Next.js preset and Node 24. Use the repository root, npm ci, and npm run build. Enter the variables from .env.example in the hosting dashboard without committing their values. GROQ_API_KEY and SUPABASE_SERVICE_ROLE_KEY must remain server-only. Enable Google login only after its provider is configured.

After the production URL is assigned, set Supabase's Site URL and allow the exact HTTPS /auth/callback URL. Retain the localhost callback for development if needed. The Google client's redirect URI remains the existing Supabase callback. Verify the Google consent audience permits intended visitors; owner-only success is insufficient.

Check public demo and sample downloads while signed out, Google login, a small live scan, save/reopen/review, PDF export, Trash/restore, and a second account's inability to access another user's audit URL. Verify quota errors clearly and inspect deployment logs without recording source text or secrets.

## Longevity and recovery

Supabase Free may pause projects with low activity over seven days. Occasional monthly checking cannot guarantee continuous live availability. Read warning emails and resume a paused project from its dashboard before testing the app. The prepared /demo avoids both Supabase and Groq, so it remains the recommended portfolio entry point when live services are unavailable.

If the provider is unavailable or limits are used, live AI returns an error and visitors can use /demo. If a deployment regresses, roll back to the previous verified deployment. Preserve versioned database migrations; do not reset the database to repair a frontend issue. Maintain a private database backup before relying on saved audits for long-term retention.
