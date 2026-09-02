# API Standards

## Request lifecycle

```text
Request → Auth → Workspace → Permission → Validation → Rate Limit → Service → Persistence/Provider → Audit → Response
```

## Response contract

Success:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "requestId": "..."
}
```

Failure:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this resource"
  },
  "requestId": "..."
}
```

## Rules

- Never trust client-provided workspace IDs or role claims without server verification.
- Validate every external/user-controlled input.
- Return safe errors; never expose secrets, stack traces or internal SQL details to clients.
- Use stable machine-readable error codes.
- Add request/correlation IDs to logs and important asynchronous jobs.
- Enforce authorization before data access and before external side effects.
- Idempotency should be used for payment/webhook and other retry-prone mutations.
- Paginate unbounded collections.
- Set explicit timeouts for external providers.
- Retry only operations that are safe to retry.
- Audit privileged and consequential actions.

## AI APIs

AI routes must additionally enforce provider availability, model policy, token/cost limits, tool permissions and human approval requirements before execution.
