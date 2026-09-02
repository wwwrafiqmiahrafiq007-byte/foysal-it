# FOYSAL IT OS — Release Checklist

## Before merge
- [ ] Review changed files
- [ ] No secrets or credentials
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Build passes
- [ ] Tests pass
- [ ] Auth/RBAC reviewed
- [ ] Database changes reviewed
- [ ] API/integration changes reviewed

## Before deployment
- [ ] Production environment variables configured
- [ ] Database migration plan confirmed
- [ ] Backup confirmed
- [ ] Rollback plan confirmed
- [ ] Vercel deployment checked
- [ ] Netlify deployment checked
- [ ] Wasmer deployment checked

## After deployment
- [ ] Health endpoint responds
- [ ] Login/logout works
- [ ] Workspace access works
- [ ] Core API works
- [ ] AI provider works or shows a safe Not Configured state
- [ ] Billing/webhooks verified if enabled
- [ ] Error monitoring checked
- [ ] Critical user journey smoke-tested

## Release decision

Only release when all applicable checks pass. A deployment/build success alone is not sufficient evidence of application correctness.
