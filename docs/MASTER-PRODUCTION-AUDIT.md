# FOYSAL IT OS — Master Production Audit

This is the master A→Z implementation and verification checklist. A checked box means evidence exists; documentation alone does not count as runtime proof.

## P0 — Foundation
- [ ] Canonical source extracted from all RAR/ZIP archives
- [ ] No duplicate/conflicting implementations
- [ ] Canonical `src/` architecture
- [ ] Dependency lockfile committed
- [ ] Supported Node/Next/React versions documented
- [ ] Install succeeds from a clean checkout
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Production build passes

## P0 — Security & tenancy
- [ ] Secrets absent from repository/history
- [ ] Server-only secrets isolated from client bundles
- [ ] Authentication flows tested
- [ ] Session lifecycle tested
- [ ] Authorization enforced server-side
- [ ] Workspace/tenant isolation tested
- [ ] IDOR/access-control tests exist
- [ ] Rate limiting/abuse controls applied
- [ ] File upload validation and limits
- [ ] Webhook signatures verified
- [ ] Sensitive logs redacted

## P0 — Database
- [ ] Schema matches product requirements
- [ ] Migrations reproducible
- [ ] Foreign keys and constraints reviewed
- [ ] Query indexes reviewed
- [ ] Pagination for unbounded lists
- [ ] Transactions for atomic state changes
- [ ] Backup and restore tested

## P0 — Environment
- [ ] `.env.example` matches code usage
- [ ] Local/development/staging/production separated
- [ ] Production secrets stored outside Git
- [ ] OAuth redirect URIs verified
- [ ] Database target verified per environment
- [ ] Stripe configuration verified per environment
- [ ] AI provider configuration verified per environment
- [ ] Startup configuration validation exists

## P1 — Product systems
- [ ] Workspace lifecycle
- [ ] Profiles/settings
- [ ] Notifications
- [ ] Files/storage
- [ ] Search
- [ ] Projects/tasks
- [ ] Reports
- [ ] Automation
- [ ] Integrations

## P1 — AI platform
- [ ] Provider adapter abstraction
- [ ] Model routing
- [ ] Deterministic fallback
- [ ] Timeout/retry policy
- [ ] Token/usage accounting
- [ ] Cost tracking
- [ ] Agent permissions
- [ ] Tool allowlists
- [ ] Tool argument validation
- [ ] Human approval for consequential actions
- [ ] AI run history
- [ ] Failure/retry visibility

## P1 — Billing
- [ ] Plans
- [ ] Entitlements
- [ ] Checkout
- [ ] Subscription synchronization
- [ ] Verified webhooks
- [ ] Idempotent webhook processing
- [ ] Cancellation/upgrade/downgrade
- [ ] Usage limits
- [ ] Billing error states

## P1 — Integrations
- [ ] Google OAuth
- [ ] Gmail scopes
- [ ] SMTP/email
- [ ] AI providers
- [ ] Other external providers
- [ ] Token refresh/revocation
- [ ] Disconnect/reconnect
- [ ] Provider outage handling

## P1 — UX
- [ ] Consistent FOYSAL IT design system
- [ ] Every route has intentional loading state
- [ ] Empty state
- [ ] Error state
- [ ] Success state
- [ ] Permission denied state
- [ ] Not configured state
- [ ] Mobile 360/390
- [ ] Tablet
- [ ] Desktop
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Accessible labels and semantics

## P2 — Quality
- [ ] Unit tests
- [ ] Integration tests
- [ ] API tests
- [ ] Auth/RBAC tests
- [ ] Billing tests
- [ ] AI tests
- [ ] E2E tests
- [ ] Production smoke tests
- [ ] Performance baseline
- [ ] Database query profiling
- [ ] Error tracking
- [ ] Structured logging
- [ ] Health/readiness checks

## P2 — GitHub & delivery
- [ ] Protected default branch
- [ ] Required CI checks
- [ ] CODEOWNERS
- [ ] PR template
- [ ] Issue templates
- [ ] CodeQL
- [ ] Dependency review
- [ ] Dependabot
- [ ] Release/versioning strategy
- [ ] Changelog
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Rollback procedure
- [ ] Disaster recovery procedure

## Release gate

Production-ready means every applicable P0/P1 item has implementation evidence and critical runtime checks have passed. Never mark an unchecked item complete merely because a documentation file exists.
