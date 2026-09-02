# FOYSAL IT OS Architecture

## Request path

User → Authentication → Workspace → Membership/RBAC → Entitlement/Usage → Domain API → Service → Database/Provider → Audit → Response

## AI path

User request → NOVA → Planner/Moderator → Model Router → Specialist Agent → Approved Tools → Result → Report

## Security boundaries

Secrets remain server-side. Agent permissions are scoped. Workspace data is tenant-isolated. External actions are explicitly authorized and can require human approval.

## Product domains

Authentication, Workspace, RBAC, Billing, Entitlements, AI Agent Hub, NOVA, AI Workforce, CRM, Lead Intelligence, Marketing, SEO, YouTube SEO, Content, Creative, Development, Data, Office, Meetings, Career, Reports, Automation, Integrations and Files/Knowledge.

## Design principle

Keep the existing FOYSAL IT visual identity and dashboard philosophy. Improve consistency, accessibility, performance, responsiveness and reliability instead of replacing the product with an unrelated redesign.