# Observability

Production systems need evidence, not guesses.

## Minimum signals

- request/correlation ID
- authentication failures
- authorization failures
- API latency
- external provider latency/errors
- database errors
- background job state
- AI model/provider, latency, token usage and cost metadata where available
- billing webhook success/failure
- critical audit events

## Logging rules

Never log passwords, access tokens, refresh tokens, API keys, cookies, authorization headers or sensitive user content.

Use structured logs so production incidents can be searched by request ID, workspace ID (when safe), route, status and error code.

## Error handling

User-facing errors should be actionable and safe. Internal logs can contain diagnostic context, but clients must not receive stack traces or secrets.

## Health

Production should expose separate readiness/liveness concepts where appropriate:

- liveness: process is alive
- readiness: dependencies required to serve traffic are usable

## Incident flow

```text
Detect → Triage → Contain → Recover → Verify → Document → Prevent recurrence
```
