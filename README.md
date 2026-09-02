# FOYSAL IT OS

**2026 Enterprise AI Workspace**

A production-oriented multi-workspace SaaS foundation for AI agents, business operations, CRM, marketing, SEO, YouTube SEO, content, creative, development, data, office, meetings and automation.

## Architecture

USER → WORKSPACE → NOVA AI → ORCHESTRATOR → SPECIALIST AGENTS → TOOLS → WORKFLOW → OUTPUT → REPORT

## Core principles

- Preserve the existing FOYSAL IT identity and product direction.
- Enforce authorization server-side.
- Isolate tenant/workspace data.
- Keep secrets out of source control.
- Give agents least-privilege tools and scoped credentials.
- Require explicit approval for consequential external actions.
- Never fabricate provider or integration status.

## Stack

Next.js 16 · React 19 · TypeScript · PostgreSQL · Drizzle ORM · Tailwind CSS · GitHub Actions

## Domains

Authentication, workspaces, RBAC, subscriptions, entitlements, usage, AI agents, NOVA, CRM/lead intelligence, marketing, SEO, YouTube SEO, content, creative, development, data, office, integrations, files/knowledge, automation and reporting.

## Development

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Before opening a PR:

```bash
npm run check
```

## Production

Read `docs/ARCHITECTURE.md` and `docs/PRODUCTION-CHECKLIST.md` before deployment.

## Security

Never commit `.env.local`, API keys, OAuth secrets, Stripe secrets, SMTP passwords or signing secrets. Use your hosting provider and GitHub secret stores.

See `SECURITY.md` for responsible disclosure.
