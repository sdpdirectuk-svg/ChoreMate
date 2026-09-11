# ChoreMate

Make helping at home a game.

ChoreMate is a simple family chore app: children complete chores, earn points, and unlock rewards. Parents stay in control with optional approvals.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase Auth + Postgres (persistent household data + RLS)
- Signed httpOnly cookies for child sessions (no child email accounts)
- Basic PWA installability

## Quick local setup

1. Create a free [Supabase](https://supabase.com) project.
2. In the SQL Editor, run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local` and fill in values from **Project Settings → API**.
4. In Supabase Auth settings, for easiest V1 testing disable **Confirm email** (or confirm via the email link).
5. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests |

## How child access works

1. Parent creates an account and finishes setup.
2. Parent dashboard shows a **Kid access code** (also in Settings).
3. Child opens **/kid**, enters the code, and taps their profile.
4. Optional 4-digit PIN can be set per child.
5. ChoreMate stores a signed httpOnly cookie scoped to that household + child for 14 days.
6. Parents can regenerate the code anytime (old code stops working).

Children never need email/password accounts. Unrelated users cannot list another household without the code, and RLS keeps parent-authenticated data isolated per owner.

## Vercel deployment

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add environment variables from `.env.example`:
   - `NEXT_PUBLIC_SITE_URL` = your production URL (e.g. `https://your-app.vercel.app`)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CHILD_SESSION_SECRET` (32+ random characters)
4. In Supabase Auth → URL configuration, add your Vercel URL to **Site URL** and **Redirect URLs**.
5. Deploy.

## Security notes

- Household tables use owner-scoped RLS.
- Child flows use the service role only on the server after verifying the signed child session / kid code.
- Private routes send `noindex` and are listed in `robots.txt` disallow rules.

## License

Private / all rights reserved unless you choose otherwise.
