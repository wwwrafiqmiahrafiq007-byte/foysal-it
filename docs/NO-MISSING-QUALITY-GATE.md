# No-Missing Quality Gate

This is the release gate for FOYSAL IT OS. A feature is not production-ready until all applicable checks pass.

## 1. Repository
- [ ] No source code stored only inside ZIP/RAR archives
- [ ] No duplicate canonical implementations
- [ ] No temporary/debug files
- [ ] No secrets or credentials
- [ ] Clear ownership and contribution rules

## 2. Build
- [ ] dependencies install cleanly
- [ ] TypeScript passes
- [ ] lint passes
- [ ] production build passes
- [ ] environment variables are documented

## 3. Runtime
- [ ] startup succeeds
- [ ] database connection succeeds
- [ ] migrations are reproducible
- [ ] health/readiness checks exist where appropriate
- [ ] errors are observable

## 4. Authentication
- [ ] register/login/logout
- [ ] email verification
- [ ] password reset
- [ ] session expiry/revocation
- [ ] secure cookie/token handling
- [ ] rate limiting

## 5. Authorization
- [ ] workspace membership checked server-side
- [ ] role/permission checked server-side
- [ ] object ownership/tenant isolation verified
- [ ] privileged operations audited

## 6. Billing
- [ ] plans are defined
- [ ] entitlements are enforced server-side
- [ ] usage limits are enforced
- [ ] webhook signatures verified
- [ ] webhook handlers are idempotent
- [ ] subscription state is reconciled

## 7. AI
- [ ] provider keys remain server-side
- [ ] model policy is explicit
- [ ] fallback behavior is deterministic
- [ ] tool permissions are scoped
- [ ] external actions require authorization
- [ ] consequential actions can require human approval
- [ ] cost/usage is tracked
- [ ] failures are visible and retryable where safe

## 8. UX
- [ ] desktop
- [ ] tablet
- [ ] mobile
- [ ] loading
- [ ] empty
- [ ] error
- [ ] permission denied
- [ ] not configured
- [ ] success
- [ ] keyboard navigation
- [ ] accessible labels/focus

## 9. Data
- [ ] validation
- [ ] indexes
- [ ] pagination for unbounded lists
- [ ] transaction boundaries
- [ ] safe deletion behavior
- [ ] backup/restore plan

## 10. Release
- [ ] CI green
- [ ] security scans green
- [ ] migration reviewed
- [ ] production environment verified
- [ ] rollback plan documented
- [ ] smoke test completed

## Rule

Do not mark a feature complete because the UI exists. Completion means the full vertical slice is implemented and verified: UI → API → authorization → validation → service → data/provider → errors → audit/telemetry → tests → documentation.
