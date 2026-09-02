# Netlify Deployment

Netlify is a supported Next.js deployment target.

## Build

- Framework: Next.js
- Build command: `npm run build`
- Node: 22.x

Use the repository's Netlify configuration where supported by the current Netlify Next.js runtime. Do not hard-code secrets in this file.

## Environment

Configure production variables in Netlify Site configuration → Environment variables. Review `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `TOKEN_SECRET`, AI providers, Google OAuth, SMTP and Stripe.

## OAuth

Production callback URLs must exactly match the deployed Netlify domain/custom domain registered with each provider.

## Verification

Preview deploy → install → build → application startup → database → auth → AI → integrations → billing → browser smoke tests.

## Important

A successful Netlify build only proves the build completed. It does not prove authentication, database, Stripe, AI providers or third-party integrations work at runtime.
