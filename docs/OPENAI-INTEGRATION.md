# OpenAI Integration

Keep OpenAI access behind a server-side provider adapter so business logic does not depend on one provider.

Recommended flow:

```text
FOYSAL IT OS → AI provider adapter → OpenAI Responses API → model/tools/structured output
```

Production rules:

- API keys are server-side only.
- Model IDs are configuration, not scattered hardcoded constants.
- Use structured outputs for machine-consumed results where appropriate.
- Apply application authorization before invoking tools.
- Track internal request/trace IDs and usage/cost metadata.
- Use background/asynchronous execution for long-running jobs.
- Define retention/privacy expectations explicitly.
- Verify current model availability in the OpenAI platform before production rollout.