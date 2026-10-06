# Authentication setup

Google OAuth is implemented behind `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`.
Google is configured in Supabase and enabled locally as of October 1, 2026.
The production build passes and the login button reaches Google's account chooser
with the expected Supabase callback and localhost return URL. Account consent,
session creation, and the authenticated upload/save/reopen/review workflow were
verified in one real browser session on October 2. A second-user browser check
and public-production consent configuration remain pending.
Restart development or rebuild production after changing the flag.

1. Create a Google Auth Platform web client with only basic identity scopes
   (`openid`, email, profile). Configure the consent screen and test audience.
2. Register the hosted Supabase callback
   `https://drctvavraalywvpcpbbc.supabase.co/auth/v1/callback` in Google.
3. Store the Google client ID and secret in Supabase's Google provider settings,
   never in client-side environment variables or Git.
4. Allow `http://localhost:3000/auth/callback` in Supabase redirect URLs for local
   testing. Add the exact deployed callback and set the production Site URL
   before launch. Localhost links cannot open this laptop's app on a phone.
5. Enable the flag, then verify sign-in, workspace provisioning, refresh, sign-out,
   cancelled consent, and a second user's data isolation in the browser.
6. Configure Google's production audience before opening sign-in to the public.

OAuth avoids sending a magic-link email for each login. It still depends on
provider availability and usage limits. Email login remains available while
transitioning, but the default sender is unsuitable for public-scale use.
Callback failures now show recovery instructions; callback success always goes
to the dashboard. No user-controlled destination is needed for this flow.

Reference: [Supabase Google setup](https://supabase.com/docs/guides/auth/social-login/auth-google).

October 6 status: production Site URL and exact callbacks are configured; owner Google login verified. Second-account browser login and consent-audience verification remain incomplete. The scanner prompts guests to sign in or use the prepared demo.
