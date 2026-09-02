# Security Policy

## Reporting

Report suspected vulnerabilities privately to the project owner. Do not publish exploit details in a public issue.

Include the affected component, impact, reproduction steps, relevant logs without secrets, and suggested mitigation when available.

## Security baseline

- least-privilege permissions
- server-side authorization
- request validation
- rate limiting on sensitive endpoints
- secure session/token handling
- audit logging for privileged actions
- dependency and code scanning
- protected default branch
- reviewed pull requests

## AI security

AI agents must not receive unrestricted secrets. External or consequential actions require explicit authorization and, where configured, human approval.

## Secrets

Never commit `.env.local`, provider API keys, OAuth secrets, Stripe secrets, SMTP passwords or signing secrets. Rotate any credential that may have been exposed.