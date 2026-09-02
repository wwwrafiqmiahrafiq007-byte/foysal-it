# Final Release Gate

## Required before production

### Code
- [ ] No source exists only in archives
- [ ] No duplicate implementations
- [ ] No dead temporary code
- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Production build passes

### Product
- [ ] Every route has loading/error/not-found behavior where applicable
- [ ] Every mutation has validation and authorization
- [ ] Every async operation handles retry/failure
- [ ] No fake data in production flows
- [ ] No fake integration status

### Security
- [ ] Secrets are server-side
- [ ] Workspace/tenant isolation tested
- [ ] RBAC tested
- [ ] Rate limits applied to sensitive endpoints
- [ ] Audit events cover privileged/consequential actions
- [ ] OAuth redirects and scopes are minimized
- [ ] Webhook signatures verified

### UX
- [ ] FOYSAL IT identity consistent
- [ ] Shared design tokens used
- [ ] Responsive at 360/390/768/1024/1440/1920px
- [ ] Keyboard accessible
- [ ] Focus states visible
- [ ] Empty/loading/error/not-configured states complete
- [ ] Reduced motion supported

### Operations
- [ ] Database migrations reproducible
- [ ] Backups verified
- [ ] Monitoring configured
- [ ] Health/readiness checks verified
- [ ] Rollback procedure tested
- [ ] Production smoke test passed

## Definition

“Complete” means verified end-to-end. Documentation, screenshots or a visible button do not count as implementation by themselves.
