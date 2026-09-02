# Vercel Deployment

Vercel is the primary Next.js deployment target for this repository.

## Build

- Framework: Next.js
- Install: `npm ci` when the lockfile is present
- Build: `npm run build`
- Node: 22.x

## Required configuration

Configure production secrets in Vercel Project Settings → Environment Variables. Never commit real values.

At minimum review: `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `TOKEN_SECRET`, AI provider keys/models, Google OAuth values, SMTP values, Stripe secret/webhook values.

## Production checks

1. Set the production URL.
2. Set environment variables for Production.
3. Deploy a preview first.
4. Run smoke tests.
5. Promote/deploy production.
6. Verify database, authentication, AI and billing flows.
7. Keep rollback available.

## Next.js notes

Keep server secrets in server-only code. Do not expose secret environment variables through `NEXT_PUBLIC_*`.
