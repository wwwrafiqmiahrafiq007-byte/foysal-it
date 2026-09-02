# Production Checklist

## Application
- [ ] production environment variables configured
- [ ] database migrations applied
- [ ] backups verified
- [ ] health endpoint verified
- [ ] error monitoring configured
- [ ] HTTPS/domain configured

## Authentication
- [ ] email verification
- [ ] password reset
- [ ] secure sessions
- [ ] logout-all
- [ ] rate limits
- [ ] OAuth redirect URIs locked down

## SaaS
- [ ] plans
- [ ] entitlements
- [ ] usage limits
- [ ] Stripe webhook signature verification
- [ ] subscription reconciliation

## AI
- [ ] server-only API keys
- [ ] provider/model fallback
- [ ] request IDs and cost tracking
- [ ] tool allowlists
- [ ] approval gates for consequential actions
- [ ] truthful provider status

## GitHub
- [ ] protected `main`
- [ ] required CI checks
- [ ] Dependabot
- [ ] secret scanning and push protection
- [ ] CodeQL
- [ ] dependency review
- [ ] least-privilege Actions permissions