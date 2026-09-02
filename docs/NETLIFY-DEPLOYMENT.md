# Netlify Deployment — FOYSAL IT OS

FOYSAL IT is a Next.js application. Netlify supports Next.js App Router, SSR, ISR, middleware and image optimization through its Next.js runtime. Typical settings are `next build` and `.next`.

## Repository settings

- Build command: `npm run build`
- Publish directory: `.next`
- Node: 22
- Production branch: `main`

## Environment variables

Set required variables in Netlify Site configuration → Environment variables. Do not commit production secrets or put them in `netlify.toml`.

Recommended contexts:

- Production: real production services/credentials
- Deploy Preview: isolated preview services/credentials where possible
- Local: `.env.local` only

At minimum audit the application's `.env.example` against every `process.env.*` reference before deployment.

## Database warning

Netlify is not a database host. Use a managed PostgreSQL provider and set `DATABASE_URL` in Netlify. Run migrations through a controlled deployment/migration process rather than relying on a browser request.

## OAuth

Production callback URLs must use the final production domain and must exactly match the URLs registered at the OAuth provider.

## Stripe

Configure production secret and webhook signing secret only in Netlify's secret environment variables. Verify webhook signatures and idempotency before enabling live billing.

## AI providers

Server-only API keys must never use `NEXT_PUBLIC_`. If a provider is not configured, the UI must report `Not Configured` rather than claiming availability.

## Preview safety

Do not expose production credentials to untrusted preview builds. Prefer separate preview credentials and data. Review Netlify's sensitive-variable policy for public repositories.

## Deploy verification

After the first deployment:

1. Open the deployed URL.
2. Verify the home page and all critical routes.
3. Verify server/API routes.
4. Verify authentication.
5. Verify database reads/writes.
6. Verify AI only if configured.
7. Verify OAuth callbacks.
8. Verify billing only in the intended Stripe mode.
9. Inspect deploy and function logs for errors or secret leakage.
10. Run production smoke/E2E tests.

## Wasmer

If Wasmer is also used as a secondary deployment/runtime target, keep it as a separate deployment profile. Do not assume a Netlify configuration is portable to Wasmer. Validate Node/runtime support, environment variables, server process behavior, persistent storage, database connectivity and routing independently.
