# Environment & Configuration

FOYSAL IT OS uses environment variables for secrets and deployment-specific configuration. Keep `.env.example` documented and safe; real values belong only in local/hosting secret stores.

## Configuration groups

| Group | Examples | Secret? |
|---|---|---|
| App | `NEXT_PUBLIC_APP_URL`, `NODE_ENV` | Usually no |
| Database | `DATABASE_URL` | YES |
| Auth | `TOKEN_SECRET` | YES |
| OpenAI | `AI_OPENAI_KEY`, model/base URL | Key YES |
| Groq | `AI_GROQ_KEY`, model/base URL | Key YES |
| xAI/OpenRouter | model/provider configuration | Depends |
| Google | OAuth client ID/secret, redirect URI, scopes | Secret YES |
| SMTP | host/user/password/port | Password YES |
| Stripe | secret/webhook secret | YES |

## Rules

1. Never commit real credentials.
2. Public browser variables must use the `NEXT_PUBLIC_` prefix only when genuinely safe to expose.
3. Server-only secrets must never be imported into client components.
4. Production values must be stored in the hosting provider's secret/environment manager.
5. OAuth redirect URIs must exactly match the provider configuration.
6. Rotate credentials after suspected exposure.
7. Use separate credentials for development/staging/production.
8. Document every new variable in `.env.example` and this file.
9. Validate required configuration at startup or at the boundary where it is used.
10. Do not silently fall back from a missing production secret to a development/default secret.

## Environment tiers

```text
local → development → staging → production
```

Each tier should have separate database credentials and external integration credentials.

## AI provider policy

A provider is `Not Configured` when its required credentials are absent. The application must not display it as connected or available merely because its code exists.

## Deployment checklist

- [ ] All required variables are present.
- [ ] No secret is in Git history.
- [ ] Database URL points to the correct environment.
- [ ] OAuth callbacks use the production URL.
- [ ] Stripe webhook endpoint and signing secret match production.
- [ ] SMTP sender/domain is verified.
- [ ] AI provider keys have appropriate limits.
- [ ] Logs redact credentials and authorization headers.
