# FOYSAL IT OS — Engineering Standards

## Objective

Build a maintainable enterprise SaaS codebase where every feature is a complete vertical slice and every production claim is backed by a check.

## Architecture rules

- Keep UI, domain services, infrastructure and provider adapters separated.
- Keep route handlers thin.
- Put business rules in services/domain modules, not scattered across pages.
- Keep external integrations behind adapters.
- Never let client code access server secrets.
- Prefer explicit types and small functions.
- Avoid circular dependencies and hidden global state.

## Error model

Use stable application error codes. Distinguish validation, authentication, authorization, not-found, conflict, rate-limit, provider and internal errors.

## Database

- Add indexes for real query patterns.
- Use constraints to enforce invariants.
- Use transactions for multi-record state changes.
- Avoid N+1 queries.
- Paginate unbounded data.
- Review destructive migrations.

## External providers

Every provider adapter needs:

- timeout
- safe retry policy
- normalized errors
- observability
- configuration validation
- credential redaction
- graceful unavailable/not-configured state

## Background work

Long-running operations should not block a normal request. Use a durable job/queue strategy with explicit states, retries, idempotency and dead-letter handling where appropriate.

## Frontend

- Reuse design-system primitives.
- Keep server data fetching predictable.
- Avoid unnecessary client components.
- Avoid duplicated API-fetching logic.
- Provide loading/error/empty/success states.
- Keep forms validated on both client and server.

## Testing pyramid

```text
Unit → Integration → API → E2E → Production smoke
```

Prioritize authentication, authorization, billing, data isolation, destructive actions and AI tool execution.

## Performance

Measure before optimizing. Track web vitals, bundle size, server latency, database latency and external-provider latency. Cache only with a clear invalidation strategy.

## Git discipline

Use small commits with one purpose. Recommended prefixes:

- `feat:` new capability
- `fix:` bug fix
- `refactor:` structural change
- `perf:` performance
- `security:` security hardening
- `docs:` documentation
- `test:` tests
- `chore:` maintenance

## Definition of done

A change is done only when implementation, authorization, validation, persistence, error states, tests, observability and documentation are addressed as applicable.
