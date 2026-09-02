# Definition of Done

A feature is production-ready only when the applicable checklist below is complete.

## Product
- [ ] Requirement and acceptance criteria are explicit.
- [ ] User permissions and edge cases are defined.

## UI
- [ ] Desktop, tablet and mobile behavior is intentional.
- [ ] Loading, empty, success, error and disabled states exist.
- [ ] Accessibility and keyboard behavior are checked.
- [ ] Design-system components are reused.

## Backend
- [ ] Input is validated server-side.
- [ ] Authentication and workspace context are verified.
- [ ] Authorization is enforced server-side.
- [ ] Errors use safe, stable codes.
- [ ] Rate limits/abuse controls are applied where needed.

## Data
- [ ] Schema and migration reviewed.
- [ ] Constraints and indexes reviewed.
- [ ] Tenant isolation verified.
- [ ] Transactions/idempotency used where needed.

## Integrations
- [ ] Credentials are server-side.
- [ ] Timeout/retry behavior is safe.
- [ ] Provider failures are handled.
- [ ] Webhooks are authenticated and idempotent.

## AI
- [ ] Model/provider policy is explicit.
- [ ] Tools are allowlisted.
- [ ] Tool arguments are validated.
- [ ] Cost/usage is tracked where applicable.
- [ ] External side effects require appropriate authorization/approval.

## Quality
- [ ] Unit/integration tests where appropriate.
- [ ] Critical E2E/smoke coverage.
- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Production build passes.
- [ ] Security checks pass.

## Operations
- [ ] Logs/metrics do not expose secrets.
- [ ] Health/readiness behavior is understood.
- [ ] Environment variables documented.
- [ ] Rollback/migration impact understood.
- [ ] Documentation updated.
