# Deploy ChoreMate to Vercel

## Prerequisites (do these first)

1. Create a free [Supabase](https://supabase.com) project
2. In **SQL Editor**, run the full contents of `supabase/schema.sql`
3. **Authentication → Providers → Email**: keep Email enabled
4. For simplest V1: turn **Confirm email** OFF (otherwise new parents must confirm via email before signing in)
5. Have a GitHub repo ready with this project pushed

## Exact Vercel environment variables

Add all of these in Vercel → Project → Settings → Environment Variables
(Production, Preview, and Development as needed):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your public URL with no trailing slash (e.g. `https://your-app.vercel.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` secret |
| `CHILD_SESSION_SECRET` | Random string, **at least 32 characters** |

Do **not** commit real secret values.

## Deploy steps

1. Push this repository to GitHub
2. Open https://vercel.com/new and import the repo
3. Framework: **Next.js** (auto-detected)
4. Build command: `npm run build` (default)
5. Output: default Next.js (no special output dir)
6. Paste the environment variables above
7. Click **Deploy**
8. Copy the production URL Vercel gives you

## Immediately after you have the production URL

1. In Vercel, set / update `NEXT_PUBLIC_SITE_URL` to that exact URL (no trailing slash) and **redeploy**
2. In Supabase → **Authentication → URL configuration**:
   - **Site URL**: `https://YOUR-PRODUCTION-DOMAIN`
   - **Redirect URLs**: add `https://YOUR-PRODUCTION-DOMAIN/**`
3. Smoke-test:
   - Homepage loads
   - Parent signup / login
   - Quick Start setup
   - Kid code login → complete chore → parent approve → reward redeem

## Child access reminder

Children never create email accounts. They use the household kid code (+ optional PIN) and a signed cookie session.

## Persistence

All family data lives in Supabase Postgres. It survives browser refresh, logout/login, Vercel redeploys, and server restarts. It does **not** use localStorage or the Vercel serverless filesystem for household data.
