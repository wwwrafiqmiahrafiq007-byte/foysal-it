# Project Structure

This document explains the repository in plain language so a new developer can understand where to work.

## Top level

- `src/` — application source code.
- `public/` — static assets such as icons and images.
- `drizzle/` — database migrations and Drizzle metadata.
- `docs/` — architecture, operations and product documentation.
- `tests/` — automated tests.
- `.github/` — CI, security automation and contribution templates.
- `.env.example` — documented environment-variable template; never put real secrets here.

## Application boundaries

### `src/app`
Next.js routes, pages and API endpoints. Keep route handlers thin: authenticate, authorize, validate input, call a service, and return a consistent response.

### `src/components`
Reusable UI components. Keep business logic out of presentational components whenever practical.

### `src/agents`
AI agent definitions, orchestration policies and agent execution boundaries.

### `src/ai`
Provider adapters, model routing, prompts and AI-specific infrastructure. Provider-specific code should stay isolated here.

### `src/auth`
Authentication and session logic. Secrets and credential operations stay server-side.

### `src/billing`
Plans, subscriptions, invoices, usage and payment-provider integration.

### `src/db`
Database connection, schema access and persistence helpers.

### `src/integrations`
External systems such as Google, Gmail, YouTube, Stripe and other providers.

### `src/permissions`
RBAC, workspace membership and authorization rules. Authorization must be enforced on the server.

### `src/security`
Security controls, audit events, rate limits and security-sensitive utilities.

### `src/services`
Domain/business services used by routes and jobs.

### `src/validators`
Input validation schemas and reusable request validation.

### `src/workflows`
Multi-step automation and background task orchestration.

### `src/types`
Shared TypeScript types. Avoid putting business logic in type-only modules.

## Golden request pattern

```text
Request
  -> Authentication
  -> Workspace resolution
  -> Authorization
  -> Validation
  -> Rate limit (where needed)
  -> Service
  -> Database/provider
  -> Audit event (where needed)
  -> Response
```

## Golden AI pattern

```text
User request
  -> NOVA
  -> Planner/Moderator
  -> Model Router
  -> Specialist Agent
  -> Allowlisted tools
  -> Approval gate when required
  -> Result
  -> Report/audit
```

## Naming rules

- Components: `PascalCase.tsx`
- Utilities/services: `camelCase.ts`
- API routes: Next.js route conventions
- Database tables: consistent singular/plural convention matching the existing schema
- Environment variables: `UPPER_SNAKE_CASE`
- Avoid vague names such as `utils2`, `temp`, `newService`, or `finalFinal`.

## Change discipline

Prefer small, focused commits. Do not mix unrelated UI, database, billing and security changes in one commit. Database migrations must be reviewed with the code that consumes them.
