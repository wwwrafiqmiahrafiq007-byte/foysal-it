# Data Privacy & Lifecycle

## Data classification

Classify data before adding a feature:

- Public
- Workspace internal
- Confidential
- Secret/credential
- Regulated or sensitive (when applicable)

## Collection

Collect only what the feature needs. Define why the data is stored and how long it is needed.

## Tenant isolation

Every workspace-scoped query must enforce workspace ownership/membership server-side. Never rely on a client-supplied workspace ID alone.

## AI data

Before sending workspace content to an external AI provider, verify the workspace/user permission, provider configuration, data handling expectations and any applicable retention controls.

## Lifecycle

```text
Collect → Validate → Store → Use → Audit → Retain → Export/Delete
```

## Deletion

Deletion must define whether related records are cascaded, anonymized, archived or retained for legal/accounting reasons. Destructive actions should be explicit and auditable.

## Logs

Avoid logging sensitive content. Redact credentials and authentication material.

## Export

Enterprise-ready workspaces should have an intentional data export path with authorization and audit logging.
