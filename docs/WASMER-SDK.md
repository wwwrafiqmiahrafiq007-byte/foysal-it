# Wasmer SDK

FOYSAL IT can use the official `@wasmer/sdk` JavaScript SDK for Wasm/WASIX workloads.

## Install

```bash
npm install @wasmer/sdk
```

Node.js integrations should use the Node entrypoint where appropriate:

```ts
import { Wasmer } from '@wasmer/sdk/node'
```

Browser integrations should use the browser entrypoint and require HTTPS/cross-origin isolation when using the SDK's worker-based functionality.

## Important

Installing the SDK does not automatically make the whole FOYSAL IT application Wasmer-compatible. Only use the SDK in features that actually need Wasm/WASIX execution. Keep the SDK out of unrelated server/client bundles.

Never expose Wasmer access tokens or other secrets in `NEXT_PUBLIC_*` variables or browser source.

## Verification

After installation, CI must verify dependency installation, lint, typecheck and production build. Runtime Wasmer functionality must also be tested separately when an application feature uses the SDK.
