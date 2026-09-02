# Wasmer Deployment

Wasmer is maintained as a separate deployment target from Vercel and Netlify.

## Target policy

Do not assume a Vercel/Netlify-specific runtime, serverless behavior, filesystem semantics or environment configuration is identical on Wasmer. Keep deployment-specific settings isolated from application code.

## Required checks

- Confirm the supported Wasmer runtime/container model for the chosen deployment.
- Provide Node.js 22.x or the project's supported runtime.
- Install dependencies from the committed lockfile once available.
- Run `npm run build`.
- Start the production application using the project's supported start command.
- Configure environment variables in Wasmer's secret/environment system.
- Verify database connectivity and migrations.
- Verify authentication, AI providers, integrations and billing.
- Run browser smoke tests against the deployed URL.

## Security

Never bake secrets into images, source files or deployment configuration committed to Git.

## Runtime compatibility

If the deployment requires a custom adapter, container or reverse-proxy configuration, keep it in deployment-specific files and document why it is needed.
