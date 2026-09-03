import { createHash, scryptSync } from "crypto";
import { db } from "@/db";
import {
  apiKeys,
  auditLogs,
  authCredentials,
  authProviderConfigs,
  affiliatePrograms,
  agentMarketplaceItems,
  agentOrchestrationRuns,
  aiAgents,
  aiCommandRuns,
  aiMemoryItems,
  aiOutputs,
  aiProviderSlots,
  brandVoiceProfiles,
  businessCatalogItems,
  businessOperations,
  businessProfiles,
  calendarEvents,
  contentRepurposingPlans,
  cpaCampaigns,
  creativeStudioProjects,
  crmClients,
  crmLeads,
  customAiAgents,
  dashboardWidgets,
  dataOperations,
  emailMessages,
  featureFlags,
  finalStructureSections,
  globalizationSettings,
  humanApprovalPolicies,
  integrations,
  invoices,
  knowledgeDocuments,
  officeAssets,
  onboardingItems,
  onboardingPreferences,
  osCapabilities,
  planEntitlements,
  plans,
  platformMetrics,
  platformModules,
  productionReadinessItems,
  projects,
  remoteMeetings,
  rolePermissions,
  securitySettings,
  sessions,
  subscriptions,
  systemHealthChecks,
  tasks,
  targetUserSegments,
  trackingMatrixEvents,
  translationConfigs,
  trustedDevices,
  universalActionOptions,
  usageMeters,
  userProfiles,
  voiceAiConfigs,
  meetingConfigs,
  modelRoutingRules,
  whiteLabelSettings,
  users,
  workflowTemplates,
  workspaceMembers,
  workspaces,
} from "@/db/schema";
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";

const now = () => new Date();
const periodEnd = () => {
  const date = new Date();
  date.setDate(date.getDate() + 18);
  return date;
};
const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
const stableHash = (value: string) => createHash("sha256").update(value).digest("hex");
const hashPassword = (password: string) => {
  const salt = "foysalit1234salt";
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt-sha256$${salt}$${derived}`;
};

type RoleKey =
  | "super_owner"
  | "platform_admin"
  | "admin"
  | "organization_owner"
  | "agency_owner"
  | "agency_admin"
  | "manager"
  | "team_member"
  | "developer"
  | "marketer"
  | "creator"
  | "hr"
  | "teacher"
  | "student"
  | "client"
  | "affiliate"
  | "viewer"
  | "end_user";

type PlanSeed = {
  code: "free" | "starter" | "professional" | "business" | "enterprise";
  name: string;
  tier: "free" | "starter" | "professional" | "business" | "enterprise";
  summary: string;
  phase: string;
  sortOrder: number;
  entitlements: Array<{
    featureKey: string;
    featureName: string;
    enabled: boolean;
    limitValue?: number;
    limitUnit?: string;
  }>;
};

const roleSeeds: Array<{
  role: RoleKey;
  displayName: string;
  isPlatformRole: boolean;
  permissions: string[];
  navigation: string[];
}> = [
  {
    role: "super_owner",
    displayName: "Super Owner",
    isPlatformRole: true,
    permissions: ["platform.*", "users.read", "users.force_logout", "organizations.read", "billing.read", "security.read", "audit.read", "feature_flags.manage", "system_health.read"],
    navigation: ["super-owner", "users", "organizations", "subscriptions", "revenue", "ai-usage", "security", "audit-logs", "feature-flags", "system-health"],
  },
  {
    role: "platform_admin",
    displayName: "Platform Admin",
    isPlatformRole: true,
    permissions: ["platform.support", "users.read", "organizations.read", "security.read", "audit.read", "system_health.read"],
    navigation: ["admin", "users", "organizations", "security", "audit-logs", "system-health"],
  },
  {
    role: "admin",
    displayName: "Admin",
    isPlatformRole: false,
    permissions: ["workspace.manage", "members.manage", "crm.manage", "projects.manage", "files.manage", "reports.read", "integrations.manage", "security.manage"],
    navigation: ["dashboard", "team", "crm", "projects", "tasks", "files", "reports", "integrations", "security"],
  },
  {
    role: "organization_owner",
    displayName: "Organization Owner",
    isPlatformRole: false,
    permissions: ["workspace.manage", "billing.manage", "members.manage", "crm.manage", "projects.manage", "marketing.manage", "ai.use", "files.manage", "reports.read", "integrations.manage", "api.manage", "security.manage"],
    navigation: ["dashboard", "business_os", "crm", "projects", "team", "marketing", "nova-ai", "analytics", "billing", "security", "settings"],
  },
  {
    role: "agency_owner",
    displayName: "Agency Owner",
    isPlatformRole: false,
    permissions: ["workspace.manage", "billing.manage", "members.manage", "crm.manage", "marketing.manage", "automation.manage", "ai.use", "files.manage", "analytics.read", "integrations.manage", "api.manage", "security.manage"],
    navigation: ["dashboard", "crm", "marketing", "seo", "ads", "social", "nova-ai", "automation", "analytics", "clients", "files", "knowledge", "integrations", "api-center", "billing", "security"],
  },
  {
    role: "agency_admin",
    displayName: "Agency Admin",
    isPlatformRole: false,
    permissions: ["workspace.read", "members.manage", "crm.manage", "marketing.manage", "automation.manage", "ai.use", "files.manage", "analytics.read", "integrations.manage"],
    navigation: ["dashboard", "crm", "marketing", "seo", "ads", "social", "nova-ai", "automation", "analytics", "clients", "files", "knowledge", "integrations"],
  },
  {
    role: "manager",
    displayName: "Manager",
    isPlatformRole: false,
    permissions: ["workspace.read", "crm.manage", "tasks.manage", "ai.use", "files.manage", "analytics.read"],
    navigation: ["dashboard", "crm", "nova-ai", "automation", "analytics", "clients", "files", "knowledge"],
  },
  {
    role: "team_member",
    displayName: "Team Member",
    isPlatformRole: false,
    permissions: ["workspace.read", "tasks.update", "ai.use", "files.read", "clients.read"],
    navigation: ["dashboard", "nova-ai", "clients", "files", "knowledge"],
  },
  {
    role: "developer",
    displayName: "Developer",
    isPlatformRole: false,
    permissions: ["workspace.read", "projects.manage", "tasks.update", "api.manage", "integrations.manage", "ai.use", "files.read"],
    navigation: ["dashboard", "projects", "tasks", "api-center", "integrations", "nova-ai", "files"],
  },
  {
    role: "marketer",
    displayName: "Marketer",
    isPlatformRole: false,
    permissions: ["workspace.read", "marketing.manage", "crm.manage", "reports.read", "ai.use", "files.read", "publish"],
    navigation: ["dashboard", "marketing", "seo", "ads", "social", "content", "reports", "nova-ai"],
  },
  {
    role: "creator",
    displayName: "Creator",
    isPlatformRole: false,
    permissions: ["workspace.read", "content.create", "files.manage", "ai.use", "share"],
    navigation: ["dashboard", "content", "social", "files", "nova-ai"],
  },
  {
    role: "hr",
    displayName: "HR",
    isPlatformRole: false,
    permissions: ["workspace.read", "members.read", "tasks.create", "reports.read", "files.read"],
    navigation: ["dashboard", "team", "tasks", "reports", "files"],
  },
  {
    role: "teacher",
    displayName: "Teacher",
    isPlatformRole: false,
    permissions: ["workspace.read", "content.create", "files.manage", "reports.read", "ai.use"],
    navigation: ["dashboard", "education", "content", "files", "reports", "nova-ai"],
  },
  {
    role: "student",
    displayName: "Student",
    isPlatformRole: false,
    permissions: ["workspace.read", "tasks.update", "files.read", "ai.use"],
    navigation: ["dashboard", "tasks", "files", "nova-ai"],
  },
  {
    role: "affiliate",
    displayName: "Affiliate",
    isPlatformRole: false,
    permissions: ["workspace.read", "affiliate.read", "reports.read", "share"],
    navigation: ["dashboard", "affiliate", "reports"],
  },
  {
    role: "viewer",
    displayName: "Viewer",
    isPlatformRole: false,
    permissions: ["view"],
    navigation: ["dashboard", "reports"],
  },
  {
    role: "client",
    displayName: "Client",
    isPlatformRole: false,
    permissions: ["client_portal.read", "files.read", "tickets.create", "invoices.read"],
    navigation: ["client-portal", "files", "tickets", "invoices"],
  },
  {
    role: "end_user",
    displayName: "End User",
    isPlatformRole: false,
    permissions: ["profile.manage", "support.create"],
    navigation: ["profile", "support"],
  },
];

const moduleSeeds = [
  ["business_os", "Universal Business OS", "business", "Core workspace, tasks, operations, records, and daily business control.", "workspace.read", "business_os", "/dashboard"],
  ["agency_os", "Agency OS", "agency", "Agency delivery, clients, retainers, services, and team execution.", "workspace.read", "agency_tools", "/dashboard/agency"],
  ["crm", "CRM", "crm", "Clients, leads, pipelines, opportunities, and relationship health.", "crm.manage", "client_management", "/dashboard/crm"],
  ["leads", "Leads", "crm", "Leads, prospects, proposals, won clients, onboarding, and client lifecycle stages.", "crm.manage", "client_management", "/dashboard/leads"],
  ["projects", "Projects", "business", "Projects with kanban, list, calendar, deadlines, approvals, and progress tracking.", "workspace.read", "business_os", "/dashboard/projects"],
  ["tasks", "Tasks", "business", "Tasks, subtasks, comments, attachments, activity history, priorities, and assignments.", "tasks.update", "business_os", "/dashboard/tasks"],
  ["team", "Team", "business", "Workspace members, roles, permissions, assignments, and collaboration.", "members.manage", "team_members", "/dashboard/team"],
  ["products", "Products", "business", "Configurable products for any business type or industry.", "workspace.read", "business_os", "/dashboard/products"],
  ["services", "Services", "business", "Agency and business services, deliverables, packages, and operations.", "workspace.read", "agency_tools", "/dashboard/services"],
  ["sales", "Sales", "business", "Orders, pipelines, payments, delivery state, and sales reporting.", "crm.manage", "client_management", "/dashboard/sales"],
  ["finance", "Finance", "business", "Payments, finance overview, tax configuration, and billing operations.", "billing.manage", "billing", "/dashboard/finance"],
  ["marketing_os", "Marketing OS", "marketing", "Campaign planning, funnels, calendars, creative approvals, and growth workflows.", "marketing.manage", "marketing_os", "/dashboard/marketing"],
  ["seo", "SEO", "seo", "Keyword strategy, audits, rankings, content planning, and technical SEO.", "marketing.manage", "seo", "/dashboard/seo"],
  ["ads", "Ads", "ads", "Paid media planning, budgets, experiments, and reporting.", "marketing.manage", "ads", "/dashboard/ads"],
  ["social_media", "Social Media", "social", "Publishing calendars, inbox, approvals, analytics, and brand monitoring.", "marketing.manage", "social_media", "/dashboard/social"],
  ["content", "Content", "marketing", "Blogs, landing pages, captions, approvals, publishing workflow, and content calendar.", "marketing.manage", "marketing_os", "/dashboard/content"],
  ["nova_ai", "NOVA AI", "ai", "AI copilot for business, agency, CRM, support, and security assistance.", "ai.use", "nova_ai", "/dashboard/nova"],
  ["voice_ai", "Voice AI", "ai", "Voice assistant, call intelligence, and future voice authentication workflows.", "ai.use", "voice_ai", "/dashboard/voice-ai"],
  ["translation_ai", "Translation AI", "ai", "Multilingual content, client communication, and workspace localization.", "ai.use", "translation_ai", "/dashboard/translation"],
  ["meeting_ai", "Meeting AI", "ai", "Transcripts, action items, summaries, and meeting insights.", "ai.use", "meeting_ai", "/dashboard/meetings"],
  ["automation", "Automation", "automation", "Triggers, actions, approvals, retries, and operations workflows.", "automation.manage", "advanced_automation", "/dashboard/automation"],
  ["analytics", "Analytics", "analytics", "Business, agency, client, revenue, AI, and operations analytics.", "analytics.read", "advanced_analytics", "/dashboard/analytics"],
  ["client_portal", "Client Portal", "communication", "Secure client access to projects, files, invoices, messages, and approvals.", "client_portal.read", "client_portal", "/dashboard/client-portal"],
  ["file_management", "File Management", "files", "Workspace files, folders, permissions, retention, and client sharing.", "files.manage", "file_management", "/dashboard/files"],
  ["knowledge_base", "Knowledge Base", "knowledge", "Internal SOPs, help center, AI-ready docs, and client knowledge.", "workspace.read", "knowledge_base", "/dashboard/knowledge"],
  ["integrations", "Integrations", "integration", "Google, Microsoft, payment, CRM, analytics, webhooks, and automation connectors.", "integrations.manage", "integrations", "/dashboard/integrations"],
  ["api_center", "API Center", "integration", "API keys, webhooks, scopes, usage, developer logs, and entitlement checks.", "api.manage", "api_center", "/dashboard/api"],
  ["billing", "Subscription & Billing", "billing", "Plans, subscriptions, invoices, payment methods, usage, and transaction history.", "billing.manage", "billing", "/dashboard/billing"],
  ["security_center", "Security Center", "security", "Login methods, MFA, sessions, devices, policies, alerts, and audit logs.", "security.manage", "security_center", "/dashboard/security"],
  ["settings", "Settings", "admin", "Workspace settings, business setup, localization, tax, modules, and policies.", "workspace.manage", "business_os", "/dashboard/settings"],
  ["super_owner", "Super Owner Control", "admin", "Platform users, organizations, revenue, usage, activity, health, flags, and settings.", "platform.*", "super_owner_control", "/super-owner"],
] as const;

const baseEntitlements = [
  { featureKey: "basic_workspace", featureName: "Basic Workspace", enabled: true },
  { featureKey: "limited_ai", featureName: "Limited AI", enabled: true, limitValue: 100, limitUnit: "credits" },
  { featureKey: "limited_projects", featureName: "Limited Projects", enabled: true, limitValue: 3, limitUnit: "projects" },
];

const planSeeds: PlanSeed[] = [
  {
    code: "free",
    name: "Free",
    tier: "free",
    summary: "Basic workspace, limited AI, limited projects, and a safe onboarding path.",
    phase: "V1",
    sortOrder: 10,
    entitlements: [
      ...baseEntitlements,
      { featureKey: "client_management", featureName: "Client Management", enabled: false },
      { featureKey: "nova_ai", featureName: "NOVA AI", enabled: false },
      { featureKey: "advanced_automation", featureName: "Advanced Automation", enabled: false },
      { featureKey: "enterprise_sso", featureName: "Enterprise SSO", enabled: false },
    ],
  },
  {
    code: "starter",
    name: "Starter",
    tier: "starter",
    summary: "More AI usage, more clients, and basic automation for growing teams.",
    phase: "V1",
    sortOrder: 20,
    entitlements: [
      { featureKey: "basic_workspace", featureName: "Basic Workspace", enabled: true },
      { featureKey: "limited_ai", featureName: "Limited AI", enabled: true, limitValue: 500, limitUnit: "credits" },
      { featureKey: "client_management", featureName: "Client Management", enabled: true, limitValue: 25, limitUnit: "clients" },
      { featureKey: "basic_automation", featureName: "Basic Automation", enabled: true },
      { featureKey: "marketing_os", featureName: "Marketing OS", enabled: true },
      { featureKey: "file_management", featureName: "File Management", enabled: true },
      { featureKey: "nova_ai", featureName: "NOVA AI", enabled: false },
      { featureKey: "advanced_automation", featureName: "Advanced Automation", enabled: false },
      { featureKey: "enterprise_sso", featureName: "Enterprise SSO", enabled: false },
    ],
  },
  {
    code: "professional",
    name: "Professional",
    tier: "professional",
    summary: "Advanced AI, agency tools, reporting, automation, and team collaboration.",
    phase: "V1",
    sortOrder: 30,
    entitlements: [
      { featureKey: "business_os", featureName: "Business OS", enabled: true },
      { featureKey: "agency_tools", featureName: "Agency Tools", enabled: true },
      { featureKey: "client_management", featureName: "Client Management", enabled: true, limitValue: 50, limitUnit: "clients" },
      { featureKey: "marketing_os", featureName: "Marketing OS", enabled: true },
      { featureKey: "seo", featureName: "SEO", enabled: true },
      { featureKey: "ads", featureName: "Ads", enabled: true },
      { featureKey: "social_media", featureName: "Social Media", enabled: true },
      { featureKey: "nova_ai", featureName: "NOVA AI", enabled: true, limitValue: 5000, limitUnit: "credits" },
      { featureKey: "translation_ai", featureName: "Translation AI", enabled: true },
      { featureKey: "meeting_ai", featureName: "Meeting AI", enabled: true },
      { featureKey: "advanced_automation", featureName: "Advanced Automation", enabled: true },
      { featureKey: "reports", featureName: "Reports", enabled: true },
      { featureKey: "team_members", featureName: "Team Members", enabled: true, limitValue: 10, limitUnit: "members" },
      { featureKey: "client_portal", featureName: "Client Portal", enabled: true },
      { featureKey: "file_management", featureName: "File Management", enabled: true },
      { featureKey: "knowledge_base", featureName: "Knowledge Base", enabled: true },
      { featureKey: "integrations", featureName: "Integrations", enabled: true },
      { featureKey: "api_center", featureName: "API Center", enabled: true },
      { featureKey: "billing", featureName: "Billing", enabled: true },
      { featureKey: "security_center", featureName: "Security Center", enabled: true },
      { featureKey: "voice_ai", featureName: "Voice AI", enabled: false },
      { featureKey: "enterprise_sso", featureName: "Enterprise SSO", enabled: false },
      { featureKey: "super_owner_control", featureName: "Super Owner Control", enabled: false },
    ],
  },
  {
    code: "business",
    name: "Business",
    tier: "business",
    summary: "Business OS, advanced analytics, larger limits, and team management.",
    phase: "V1.5",
    sortOrder: 40,
    entitlements: [
      { featureKey: "business_os", featureName: "Business OS", enabled: true },
      { featureKey: "agency_tools", featureName: "Agency Tools", enabled: true },
      { featureKey: "client_management", featureName: "Client Management", enabled: true, limitValue: 250, limitUnit: "clients" },
      { featureKey: "marketing_os", featureName: "Marketing OS", enabled: true },
      { featureKey: "seo", featureName: "SEO", enabled: true },
      { featureKey: "ads", featureName: "Ads", enabled: true },
      { featureKey: "social_media", featureName: "Social Media", enabled: true },
      { featureKey: "nova_ai", featureName: "NOVA AI", enabled: true, limitValue: 20000, limitUnit: "credits" },
      { featureKey: "voice_ai", featureName: "Voice AI", enabled: true },
      { featureKey: "translation_ai", featureName: "Translation AI", enabled: true },
      { featureKey: "meeting_ai", featureName: "Meeting AI", enabled: true },
      { featureKey: "advanced_automation", featureName: "Advanced Automation", enabled: true },
      { featureKey: "advanced_analytics", featureName: "Advanced Analytics", enabled: true },
      { featureKey: "team_management", featureName: "Team Management", enabled: true, limitValue: 50, limitUnit: "members" },
      { featureKey: "client_portal", featureName: "Client Portal", enabled: true },
      { featureKey: "file_management", featureName: "File Management", enabled: true },
      { featureKey: "knowledge_base", featureName: "Knowledge Base", enabled: true },
      { featureKey: "integrations", featureName: "Integrations", enabled: true },
      { featureKey: "api_center", featureName: "API Center", enabled: true },
      { featureKey: "billing", featureName: "Billing", enabled: true },
      { featureKey: "security_center", featureName: "Security Center", enabled: true },
      { featureKey: "enterprise_sso", featureName: "Enterprise SSO", enabled: false },
      { featureKey: "super_owner_control", featureName: "Super Owner Control", enabled: false },
    ],
  },
  {
    code: "enterprise",
    name: "Enterprise",
    tier: "enterprise",
    summary: "Custom limits, advanced security, SSO, dedicated support, and enterprise controls.",
    phase: "V2",
    sortOrder: 50,
    entitlements: [
      { featureKey: "business_os", featureName: "Business OS", enabled: true },
      { featureKey: "agency_tools", featureName: "Agency Tools", enabled: true },
      { featureKey: "client_management", featureName: "Client Management", enabled: true },
      { featureKey: "marketing_os", featureName: "Marketing OS", enabled: true },
      { featureKey: "seo", featureName: "SEO", enabled: true },
      { featureKey: "ads", featureName: "Ads", enabled: true },
      { featureKey: "social_media", featureName: "Social Media", enabled: true },
      { featureKey: "nova_ai", featureName: "NOVA AI", enabled: true },
      { featureKey: "voice_ai", featureName: "Voice AI", enabled: true },
      { featureKey: "translation_ai", featureName: "Translation AI", enabled: true },
      { featureKey: "meeting_ai", featureName: "Meeting AI", enabled: true },
      { featureKey: "advanced_automation", featureName: "Advanced Automation", enabled: true },
      { featureKey: "advanced_analytics", featureName: "Advanced Analytics", enabled: true },
      { featureKey: "team_management", featureName: "Team Management", enabled: true },
      { featureKey: "client_portal", featureName: "Client Portal", enabled: true },
      { featureKey: "file_management", featureName: "File Management", enabled: true },
      { featureKey: "knowledge_base", featureName: "Knowledge Base", enabled: true },
      { featureKey: "integrations", featureName: "Integrations", enabled: true },
      { featureKey: "api_center", featureName: "API Center", enabled: true },
      { featureKey: "billing", featureName: "Billing", enabled: true },
      { featureKey: "security_center", featureName: "Security Center", enabled: true },
      { featureKey: "enterprise_sso", featureName: "Enterprise SSO", enabled: true },
      { featureKey: "advanced_security", featureName: "Advanced Security", enabled: true },
      { featureKey: "ip_restrictions", featureName: "IP Restrictions", enabled: true },
      { featureKey: "dedicated_support", featureName: "Dedicated Support", enabled: true },
      { featureKey: "super_owner_control", featureName: "Super Owner Control", enabled: false },
    ],
  },
];

const providerSeeds = [
  { providerKey: "google", displayName: "Continue with Google", category: "oauth", priority: 10, enabled: true, phase: "V1", enterpriseOnly: false },
  { providerKey: "email_password", displayName: "Continue with Email", category: "password", priority: 20, enabled: true, phase: "V1", enterpriseOnly: false },
  { providerKey: "phone_otp", displayName: "Continue with Phone Number", category: "otp", priority: 30, enabled: true, phase: "V1", enterpriseOnly: false },
  { providerKey: "password_recovery", displayName: "Password Recovery", category: "recovery", priority: 35, enabled: true, phase: "V1", enterpriseOnly: false },
  { providerKey: "passkey", displayName: "Use Passkey / Device", category: "passkey", priority: 40, enabled: true, phase: "V1.5", enterpriseOnly: false },
  { providerKey: "voice", displayName: "Use Voice Verification", category: "biometric", priority: 50, enabled: false, phase: "V2", enterpriseOnly: false },
  { providerKey: "magic_link", displayName: "Sign in with Magic Link", category: "magic_link", priority: 60, enabled: false, phase: "V2", enterpriseOnly: false },
  { providerKey: "microsoft", displayName: "Continue with Microsoft", category: "oauth", priority: 70, enabled: false, phase: "V2", enterpriseOnly: false },
  { providerKey: "apple", displayName: "Continue with Apple", category: "oauth", priority: 80, enabled: false, phase: "V2", enterpriseOnly: false },
  { providerKey: "github", displayName: "Continue with GitHub", category: "oauth", priority: 90, enabled: false, phase: "V2", enterpriseOnly: false },
  { providerKey: "enterprise_sso", displayName: "Enterprise SSO", category: "sso", priority: 100, enabled: false, phase: "V2", enterpriseOnly: true },
] as const;

const usageSeeds = [
  { metricKey: "ai_credits", metricName: "AI Credits", used: 3600, limitValue: 5000, percentUsed: 72 },
  { metricKey: "automation", metricName: "Automation", used: 410, limitValue: 1000, percentUsed: 41 },
  { metricKey: "storage", metricName: "Storage", used: 63, limitValue: 100, percentUsed: 63 },
  { metricKey: "team_members", metricName: "Team Members", used: 4, limitValue: 10, percentUsed: 40 },
  { metricKey: "clients", metricName: "Clients", used: 18, limitValue: 50, percentUsed: 36 },
  { metricKey: "api_usage", metricName: "API Usage", used: 31000, limitValue: 100000, percentUsed: 31 },
];

const targetUserSegmentLabels = [
  "Business Owner",
  "Startup",
  "Entrepreneur",
  "B2B Business",
  "B2C Business",
  "Agency",
  "Freelancer",
  "Consultant",
  "Digital Marketer",
  "SEO Expert",
  "Local SEO Expert",
  "AEO Specialist",
  "GEO Specialist",
  "GBP/GMB Expert",
  "Backlink Expert",
  "CPA Marketer",
  "UI/UX Expert",
  "Web Developer",
  "App Developer",
  "Software Developer",
  "Data Entry Expert",
  "Data Analyst",
  "Content Creator",
  "Video Editor",
  "Graphic Designer",
  "Logo Designer",
  "Sales Team",
  "Remote Worker",
  "Office Worker",
  "HR Team",
  "Teacher",
  "Student",
  "Trainer",
  "Affiliate Marketer",
  "E-commerce Business",
  "Enterprise Team",
] as const;

const dashboardWidgetSeeds = [
  ["tasks", "Tasks", "Assigned work, deadlines, blocked items, and approvals.", "tasks.update", ["Remote Worker", "Office Worker", "Student", "Software Developer"]],
  ["projects", "Projects", "Project workflow, kanban, list, calendar, and progress.", "workspace.read", ["Agency", "Freelancer", "Consultant", "Software Developer"]],
  ["leads", "Leads", "Lead pipeline, prospects, proposals, and next steps.", "crm.manage", ["Sales Team", "Agency", "B2B Business"]],
  ["customers", "Customers", "Customer and client health across the workspace.", "clients.read", ["Business Owner", "B2C Business", "E-commerce Business"]],
  ["sales", "Sales", "Orders, opportunities, pipeline, and sales activity.", "crm.manage", ["Sales Team", "Entrepreneur"]],
  ["revenue", "Revenue", "Billing and revenue summary from authorized billing data.", "billing.manage", ["Business Owner", "Startup", "Enterprise Team"]],
  ["marketing", "Marketing", "Campaigns, funnels, calendars, and strategy.", "marketing.manage", ["Digital Marketer", "CPA Marketer", "Agency"]],
  ["seo", "SEO", "SEO tasks, keywords, content opportunities, and audits.", "marketing.manage", ["SEO Expert", "AEO Specialist", "GEO Specialist", "Backlink Expert"]],
  ["local_seo", "Local SEO", "GBP/GMB, local rankings, citations, and location optimization.", "marketing.manage", ["Local SEO Expert", "GBP/GMB Expert"]],
  ["ads", "Ads", "Paid campaign planning, experiments, and performance review.", "marketing.manage", ["CPA Marketer", "Digital Marketer"]],
  ["content", "Content", "Blogs, captions, creative workflow, and publishing calendar.", "content.create", ["Content Creator", "Video Editor", "Graphic Designer", "Logo Designer"]],
  ["meetings", "Meetings", "Meeting schedule, transcripts, summaries, and action items.", "workspace.read", ["Consultant", "Teacher", "Trainer", "Enterprise Team"]],
  ["files", "Files", "Recent files, client assets, permissions, and shared folders.", "files.read", ["Data Entry Expert", "Graphic Designer", "Client"]],
  ["ai_usage", "AI Usage", "NOVA AI credits, agents, outputs, and source labeling.", "ai.use", ["Startup", "Software Developer", "Digital Marketer", "Student"]],
  ["affiliate", "Affiliate", "Affiliate campaigns, links, referrals, and reports.", "affiliate.read", ["Affiliate Marketer"]],
  ["education", "Education", "Lessons, training content, assignments, and learning progress.", "workspace.read", ["Teacher", "Student", "Trainer"]],
  ["reports", "Reports", "Executive, client, marketing, project, and AI-generated reports.", "reports.read", ["Business Owner", "Consultant", "Data Analyst"]],
  ["notifications", "Notifications", "Security alerts, client updates, approvals, and system messages.", "workspace.read", ["Business Owner", "Remote Worker", "Client"]],
] as const;

const osCapabilitySeeds = [
  ["universal_ai_command", "Universal AI Command", "ai", ["One command box", "Research", "Strategy", "SEO", "Content", "Creative", "Ads", "CRM", "Tasks", "Calendar", "Reports"], ["Command", "Plan", "Review", "Confirm consequential actions", "Execute authorized steps", "Report"], true, "planning_and_approval"],
  ["ai_agent_builder", "AI Agent Builder", "ai", ["Custom Agent", "Instructions", "Knowledge", "Tools", "Permissions", "Trigger", "Workflow", "Output", "Approval", "Limits"], ["Define", "Scope", "Approve", "Run", "Monitor"], false, "workspace_native"],
  ["ai_knowledge_base", "AI Knowledge Base", "knowledge", ["Company Information", "Products", "Services", "Brand Rules", "SOP", "Documents", "FAQs", "Client Instructions", "Project Information"], ["Authorize", "Index", "Permission check", "Retrieve", "Answer with source context"], false, "permission_scoped"],
  ["business_os", "Business OS", "business", ["Business Profile", "Customers", "Products", "Services", "Inventory", "Orders", "Sales", "Revenue", "Expenses", "Documents", "Reports", "Employees", "Automation"], ["Configure", "Operate", "Automate", "Analyze", "Report"], false, "workspace_native"],
  ["crm_complete", "Complete CRM", "crm", ["Leads", "Contacts", "Companies", "Customers", "Deals", "Pipeline", "Notes", "Calls", "Meetings", "Tasks", "Follow-ups", "Customer History"], ["Lead", "Qualified", "Proposal", "Negotiation", "Won/Lost", "Customer"], false, "workspace_native"],
  ["agency_os", "Agency OS", "agency", ["Clients", "Leads", "Projects", "Services", "Team", "Tasks", "Proposals", "Contracts/templates", "Meetings", "Reports", "Billing", "Client Portal", "Automation"], ["Lead", "Proposal", "Contract", "Project", "Approval", "Billing", "Report"], false, "workspace_native"],
  ["b2b_system", "B2B System", "sales", ["Company Profiles", "Leads", "Prospect Research", "Decision-maker role", "Sales Pipeline", "Proposals", "RFP Assistance", "Case Studies", "Outreach", "Follow-up", "Account Management"], ["Research", "Outreach", "Qualify", "Proposal", "Negotiate", "Account management"], false, "workspace_native"],
  ["b2c_system", "B2C System", "commerce", ["Customer Profiles", "Products", "Offers", "Coupons", "Campaigns", "Support", "Reviews", "Loyalty", "Retention", "Email/SMS integrations where available"], ["Offer", "Campaign", "Purchase", "Support", "Review", "Retention"], true, "configured_integrations_only"],
  ["project_management", "Project Management", "projects", ["Projects", "Tasks", "Subtasks", "Kanban", "Calendar", "Timeline", "Priority", "Deadlines", "Assignment", "Comments", "Files", "Progress", "Activity"], ["Not Started", "In Progress", "Review", "Client Approval", "Completed", "Blocked", "Overdue"], false, "workspace_native"],
  ["sales_os", "Sales OS", "sales", ["Sales Pipeline", "Lead Qualification", "Sales Scripts", "Proposal", "Quotation", "Follow-up", "Objection Handling", "Upselling", "Cross-selling", "Retention"], ["Qualify", "Pitch", "Quote", "Follow-up", "Close", "Retain"], false, "workspace_native"],
  ["affiliate_partner_os", "Affiliate & Partner OS", "affiliate", ["Affiliate Registration", "Verification", "Approval", "Referral Link", "Referral Code", "QR Code", "Click Tracking", "Lead Tracking", "Conversion Tracking", "Commission", "Coupon Attribution", "Payout", "Campaign", "Creative", "Leaderboard", "Analytics", "Fraud/Anomaly Detection"], ["Register", "Verify", "Approve", "Referral", "Click", "Lead", "Conversion", "Commission", "Approval", "Payout"], true, "approval_required"],
  ["cpa_marketing_os", "CPA Marketing OS", "marketing", ["CPA Campaign", "Offer Management", "Landing Page", "Click Tracking", "Lead Tracking", "Conversion", "Traffic Source", "UTM", "Cost", "Revenue", "CPA", "EPC", "Conversion Rate", "ROI/ROAS", "Funnel", "A/B Testing", "Campaign Report"], ["Traffic", "Landing Page", "Click", "Lead", "Conversion", "Revenue", "CPA", "ROI"], true, "configured_tracking_only"],
  ["digital_marketing_os", "Digital Marketing OS", "marketing", ["SEO", "Local SEO", "AEO", "GEO", "GBP/GMB", "Backlinks", "Content", "Social Media", "Google Ads", "Meta Ads", "Email", "Analytics", "Conversion Optimization"], ["Research", "Plan", "Create", "Publish with authorization", "Measure", "Optimize"], true, "configured_integrations_only"],
  ["seo_pro", "SEO Pro", "seo", ["Technical SEO", "On-page SEO", "Off-page SEO", "Keyword Research", "Search Intent", "Competitor Analysis", "Content Gap", "Internal Links", "Meta Title", "Meta Description", "Headers", "Image ALT", "Sitemap", "Robots", "Indexing", "Page Speed", "SEO Reports"], ["Audit", "Research", "Optimize", "Validate", "Report"], true, "recommendation_until_api_connected"],
  ["aeo", "AEO", "seo", ["Question Research", "Search Intent", "FAQ", "Direct Answers", "Entity Optimization", "Semantic Content", "Question Clustering", "Structured Content", "Featured Snippet Guidance", "Schema Suggestions", "Content Gap"], ["Research", "Cluster", "Structure", "Suggest schema", "Review"], false, "no_guaranteed_placement_claims"],
  ["geo", "GEO", "seo", ["Entity Research", "Brand Mention Monitoring", "Source Discovery", "Citation Opportunities", "Topical Authority", "Brand Consistency", "Expert Signals", "Content Freshness", "AI Search Visibility", "Competitor Comparison"], ["Research", "Monitor", "Improve entity clarity", "Build authority", "Report"], true, "recommendation_until_api_connected"],
  ["local_seo_pro", "Local SEO Pro", "seo", ["Local Keywords", "Location Pages", "NAP Consistency", "Citations", "Local Competitors", "Map Visibility", "Reviews", "Local Content", "Local Links", "Local Schema", "Service Areas", "Local Rankings", "Local SEO Audit"], ["Audit", "Fix NAP", "Optimize pages", "Review", "Report"], true, "recommendation_until_api_connected"],
  ["gbp", "Google Business Profile", "seo", ["Profile Audit", "Business Information", "Category Suggestions", "Services", "Products", "Description", "Posts", "Reviews", "Review Response", "Photos Checklist", "Q&A", "Hours", "Website", "UTM", "Performance Report", "Competitor Analysis"], ["Audit", "Recommend", "Authorize API", "Update with confirmation", "Report"], true, "recommendation_assistance_mode"],
  ["backlink_expert_os", "Backlink Expert OS", "seo", ["Backlink Profile", "Referring Domains", "Referring Pages", "Anchor Text", "Follow/Nofollow", "New Links", "Lost Links", "Link Context", "Relevance", "Quality Signals", "Suspicious Pattern Flags", "Guest Post Opportunities", "Resource Pages", "Broken Link Opportunities", "Digital PR", "Outreach", "Follow-up", "Link Status"], ["Analyze", "Qualify", "Outreach", "Follow-up", "Monitor"], true, "recommendation_until_api_connected"],
  ["gtm_center", "GTM Center", "tracking", ["Containers", "Workspaces", "Tags", "Triggers", "Variables", "Data Layer", "Events", "Conversion Events", "Click Tracking", "Form Tracking", "Scroll Tracking", "Video Tracking", "Download Tracking", "Ecommerce Events", "Debug", "QA", "Version History"], ["Plan", "Configure", "Debug", "QA", "Publish with authorization", "Version"], true, "authorization_required"],
  ["ga4_center", "GA4 Center", "analytics", ["Property Checklist", "Data Stream", "Events", "Key Events", "Parameters", "Audiences", "Acquisition", "Engagement", "Retention", "Monetization", "Funnels", "User Journey", "UTM", "Ecommerce", "Custom Reports"], ["Authorize", "Validate", "Analyze", "Report"], true, "authorization_required"],
  ["pixel_tracking_center", "Pixel & Tracking Center", "tracking", ["Meta Pixel", "Google Ads Conversion Tracking", "GA4", "GTM", "LinkedIn Insight Tag", "TikTok Pixel", "Event Mapping", "Parameters", "Conversion", "Browser Tracking", "Server-side tracking", "Deduplication", "Testing", "Debugging", "Tracking Health"], ["Map", "Install", "Test", "Debug", "Monitor"], true, "configured_integrations_only"],
  ["tracking_health_ai", "Tracking Health AI", "tracking", ["Missing Events", "Duplicate Events", "Wrong Parameters", "Broken Tags", "Incorrect Triggers", "Missing UTM", "Data Mismatch", "Conversion Drop", "Integration Error"], ["Problem", "Cause", "Fix", "Test", "Verify"], true, "diagnosis_requires_data"],
  ["ui_ux_studio", "UI/UX Expert Studio", "creative", ["UI Audit", "UX Audit", "Visual Hierarchy", "Typography", "Spacing", "Alignment", "Accessibility", "Responsive Design", "Navigation", "CTA", "Forms", "Conversion UX", "Mobile UX", "Design Consistency"], ["Upload authorized input", "Analyze", "Recommend", "Review", "Implement"], false, "authorized_inputs_only"],
  ["content_creator_studio", "Content Creator Studio", "content", ["Blog", "Article", "Website Copy", "Landing Page", "Product Description", "Email", "Newsletter", "Case Study", "Whitepaper", "E-book", "Proposal", "Facebook", "Instagram", "LinkedIn", "YouTube", "TikTok", "Threads/X"], ["Brief", "Draft", "Review", "Approve", "Publish with authorization"], true, "approval_required"],
  ["content_repurposing", "Content Repurposing", "content", ["One Content → Many Content", "Blog", "Facebook", "LinkedIn", "Instagram", "YouTube Script", "Reel", "Short", "Email", "Ad"], ["Source", "Transform", "Brand voice check", "Review", "Approve", "Publish with authorization"], true, "approval_required"],
  ["brand_voice", "Brand Voice", "brand", ["Brand Name", "Tone", "Audience", "Language", "Keywords", "CTA", "Style", "Brand Rules"], ["Define", "Apply", "Review", "Enforce", "Update"], false, "workspace_native"],
  ["video_studio", "Video Studio", "creative", ["Video Editor", "Video Generator", "Text → Video", "Image → Video", "Script → Video", "Scene Builder", "Timeline", "Cut", "Trim", "Captions", "Subtitles", "Voice-over", "Noise Removal", "Music", "Thumbnail", "Shorts", "Reels", "TikTok", "YouTube"], ["Brief", "Script", "Scenes", "Timeline", "Edit", "Review", "Export"], true, "connected_media_providers_required"],
  ["graphic_design_studio", "Graphic Design Studio", "creative", ["Social Post", "Banner", "Poster", "Flyer", "Brochure", "Business Card", "Certificate", "Presentation", "Infographic", "Advertisement", "Product Creative", "Website Banner", "Thumbnail"], ["Brief", "Design", "Review", "Resize", "Export"], true, "provider_or_native_editor"],
  ["ai_image_graphic_generator", "AI Image / Graphic Generator", "creative", ["Text → Image", "Image → Image", "Background", "Object Removal", "Enhancement", "Upscale", "Resize", "Crop", "Variations"], ["Prompt", "Generate", "Review", "Edit", "Export"], true, "connected_provider_required"],
  ["logo_brand_studio", "Logo & Brand Studio", "brand", ["Logo Generator", "Logo Concepts", "Icon", "Typography", "Colors", "Favicon", "Social Logo", "Brand Mark", "Mockup", "Brand Kit", "Brand Guidelines"], ["Brief", "Concept", "Refine", "Kit", "Guidelines", "Export"], true, "approval_required"],
  ["presentation_studio", "Presentation Studio", "office", ["PowerPoint-style presentations", "Pitch Deck", "Sales Deck", "Investor Deck", "Education", "Training", "Project Presentation", "Conference Presentation"], ["Topic", "Outline", "Slides", "Content", "Notes", "Review", "Export"], false, "office_compatible"],
  ["data_entry_pro", "Data Entry Pro", "data", ["Excel Data Entry", "CSV", "CRM Entry", "Product Entry", "Customer Entry", "Inventory", "Invoice", "Survey", "Research", "Document-to-Data", "PDF-to-Spreadsheet", "Image-to-Data", "Data Migration"], ["Collect", "Enter", "Validate", "QA", "Import"], true, "authorized_files_only"],
  ["data_cleaning", "Data Cleaning", "data", ["Duplicate Detection", "Missing Fields", "Invalid Email", "Phone Validation", "Date Formatting", "Currency Formatting", "Name Standardization", "Address Standardization", "URL Validation", "Data Quality"], ["Scan", "Detect", "Suggest", "Approve", "Apply", "QA"], false, "workspace_native"],
  ["data_validation", "Data Validation", "data", ["Required", "Type", "Length", "Format", "Range", "Unique", "Email", "Phone", "URL", "Date", "Valid", "Warning", "Error"], ["Rules", "Validate", "Flag", "Fix", "Verify"], false, "workspace_native"],
  ["data_mapping", "Data Mapping", "data", ["Source Column → Destination Field", "Manual Mapping", "AI Suggested Mapping", "Saved Mapping Templates"], ["Upload", "Map", "Review", "Save template", "Use"], false, "workspace_native"],
  ["data_migration", "Data Migration", "data", ["Old System", "Mapping", "Validation", "Preview", "Import", "Verification", "Migration Log", "Failed Records", "Retry", "Error Report", "Rollback strategy where technically feasible"], ["Old System", "Mapping", "Validation", "Preview", "Import", "Verification"], true, "rollback_where_feasible"],
  ["data_entry_qa", "Data Entry QA", "data", ["Sampling", "Double Verification", "Field Comparison", "Reviewer", "Error Rate", "Revision", "Quality Score"], ["Sample", "Review", "Compare", "Revise", "Score"], false, "workspace_native"],
  ["office_remote_work_os", "Office & Remote Work OS", "office", ["Workspace", "Team", "Employee", "Client", "Project", "Department", "Tasks", "Files", "Meetings", "Calendar", "Approvals", "Notifications"], ["Plan", "Assign", "Collaborate", "Approve", "Notify", "Report"], false, "workspace_native"],
  ["document_word_studio", "Document / Word Studio", "office", ["Create", "Edit", "Formatting", "Tables", "Images", "Headers", "Footers", "Page Numbers", "Margins", "Columns", "Links", "Comments", "Review", "Find/Replace", "Spell Check", "Grammar"], ["Create", "Edit", "Review", "Export"], false, "office_compatible"],
  ["ai_document_assistant", "AI Document Assistant", "office", ["Write", "Rewrite", "Summarize", "Expand", "Shorten", "Proofread", "Translate", "Formalize", "Simplify", "Report", "Letter", "Proposal", "Business Writing"], ["Brief", "Draft", "Revise", "Approve", "Export"], false, "workspace_native"],
  ["excel_spreadsheet_studio", "Excel / Spreadsheet Studio", "office", ["Workbook", "Worksheet", "Rows", "Columns", "Cells", "Tables", "Sorting", "Filtering", "Formatting", "Charts", "Data Validation", "Formula Assistance", "Import", "Export"], ["Import", "Edit", "Validate", "Analyze", "Export"], false, "office_compatible"],
  ["excel_ai", "Excel AI", "office", ["Clean this spreadsheet", "Find duplicate records", "Create monthly sales analysis", "Create a chart", "Explain this formula"], ["Ask", "Analyze", "Suggest", "Approve", "Apply"], false, "workspace_native"],
  ["powerpoint_presentation", "PowerPoint / Presentation", "office", ["Slides", "Layouts", "Text", "Images", "Tables", "Charts", "Shapes", "Speaker Notes", "Presentation Templates", "AI Presentation Generator", "Export"], ["Outline", "Slides", "Notes", "Review", "Export"], false, "office_compatible"],
  ["pdf_studio", "PDF Studio", "office", ["PDF Viewer", "Search", "Merge", "Split", "Compress", "PDF → Word", "PDF → Excel", "PDF → Text", "Image → PDF", "Document → PDF", "Summary", "Translation"], ["Open", "Process", "Review", "Export"], true, "authorized_files_only"],
  ["file_manager", "File Manager", "files", ["My Files", "Shared", "Recent", "Starred", "Folders", "Client Files", "Project Files", "Office Files", "Upload", "Download", "Version History"], ["Upload", "Organize", "Share", "Version", "Download"], false, "workspace_native"],
  ["office_compatibility", "Office Compatibility", "office", ["DOCX", "XLSX", "PPTX", "PDF", "CSV", "Office 2016-era common workflows"], ["Import", "Edit common fields", "Export", "Validate"], false, "compatibility_without_proprietary_claims"],
  ["email_assistant", "Email Assistant", "communication", ["Professional Email", "Reply", "Follow-up", "Client Email", "Proposal Email", "Meeting Request", "Invoice Email", "Job Application", "Complaint Response"], ["Draft", "Review", "Approve", "Send via authorized integration"], true, "controlled_sending_only"],
  ["calendar", "Calendar", "office", ["Events", "Meetings", "Tasks", "Deadlines", "Reminders", "Team Calendar", "Client Meetings", "Project Calendar"], ["Create", "Invite", "Remind", "Track"], true, "configured_integrations_only"],
  ["remote_meeting", "Remote Meeting", "communication", ["Create Meeting", "Participants", "Microphone", "Camera", "Screen Share", "Chat", "Recording where permitted", "Live Transcript", "AI Summary", "Action Items"], ["Create", "Join", "Live", "Summarize", "Follow-up"], true, "authorization_required"],
  ["multilingual_live_meeting", "Multilingual Live Meeting", "communication", ["Live Transcript", "Language Detection", "Translation", "Voice Output", "AI Notes", "Speaker Identification", "LIVE", "Speaking", "Language", "Translating", "Voice Output", "Transcript", "Connected", "Participants"], ["Listen", "Detect", "Translate", "Output", "Summarize"], true, "supported_provider_capabilities_only"],
  ["global_voice_translation", "Global Voice Translation", "ai", ["Bangla Voice → Japanese Voice", "Japanese Voice → Bangla Voice", "Voice", "Speech Recognition", "Language Detection", "Translation", "Voice Generation"], ["Voice", "Speech Recognition", "Language Detection", "Translation", "Voice Generation"], true, "never_show_unsupported_capabilities_active"],
] as const;

const aiProviderSlotSeeds = [
  ["nova", "NOVA AI", "orchestrator", "Configured", "🟢 Available", ["routing", "planning", "orchestration", "reports"], true, "Master AI router + planner + orchestrator for FOYSAL IT OS."],
  ["moderator", "Moderator / Supervisor Agent", "agent", "Configured", "🟢 Available", ["understand request", "break subtasks", "select agents", "assign jobs", "monitor progress", "retry", "request approval", "combine outputs"], true, "User → Moderator → Agents → Tools → Results → Moderator → User."],
  ["hermes", "Hermes Agent", "agent", "Not Configured", "⚪ Not Configured", ["long-running tasks", "research", "coding", "terminal workflows", "automation", "developer troubleshooting"], false, "Autonomous technical/research/execution slot. Never receives unrestricted secrets."],
  ["strawberry", "Strawberry AI", "provider", "Not Configured", "⚪ Not Configured", ["creative reasoning", "research", "content", "analysis", "experimentation"], false, "Specialized provider slot only; actual connected status requires configured API/model."],
  ["minimax", "MiniMax Agent", "provider", "Not Configured", "⚪ Not Configured", ["content", "creative generation", "video workflows", "audio/voice where supported", "long-form generation", "automation", "marketing"], true, "Use capability detection; never pretend unavailable API exists."],
  ["kimi", "Kimi Work / Kimi Agent", "provider", "Not Configured", "⚪ Not Configured", ["research", "coding", "documents", "excel", "powerpoint", "long-context tasks", "complex multi-step work", "agent swarm"], true, "Provider slot for Kimi/Kimi Work style long-horizon research, coding, Office and agent workflows when officially configured."],
] as const;

const modelRoutingRuleSeeds = [
  ["coding", "kimi", "hermes", "developer", "Coding tasks route to configured coding/long-context capable models or developer fallback.", "quality_first"],
  ["research", "kimi", "hermes", "research", "Research routes to long-context/research-capable providers with source labeling.", "balanced"],
  ["office", "kimi", "office", "nova", "Office files route to Office-capable models/tools with document compatibility limits.", "balanced"],
  ["image", "minimax", "creative", "nova", "Image tasks route to configured image-capable providers; otherwise assistance mode.", "capability_required"],
  ["video", "minimax", "video", "creative", "Video tasks require media provider capability detection.", "capability_required"],
  ["voice", "minimax", "translation", "nova", "Voice routes to speech providers only when authorized and supported.", "capability_required"],
  ["translation", "translation", "kimi", "nova", "Translation routes to configured translation models/providers with language support checks.", "cost_efficient"],
  ["cheap_simple", "nova", "moderator", "nova", "Simple tasks use cost-efficient routing before specialist escalation.", "cost_efficient"],
] as const;

const agentMarketplaceSeeds = [
  ["web_developer", "Web Developer", "Development", "Build web features, APIs, UI and implementation tasks.", ["workspace.read", "projects.manage", "api.manage"], ["Projects", "API Center", "Files"]],
  ["app_developer", "App Developer", "Development", "Plan mobile/app features, releases and integrations.", ["workspace.read", "projects.manage"], ["Projects", "Tasks"]],
  ["api_developer", "API Developer", "Development", "Design API routes, scopes, webhooks and docs.", ["api.manage"], ["API Center", "Docs"]],
  ["debugger", "Debugger", "Development", "Troubleshoot errors and technical failures.", ["projects.manage"], ["Logs", "Tasks"]],
  ["qa_agent", "QA Agent", "Development", "Generate test plans and QA checklists.", ["reports.read"], ["Projects", "Reports"]],
  ["seo", "SEO", "Marketing", "SEO audit, keywords, on-page and technical recommendations.", ["marketing.manage"], ["SEO", "Reports"]],
  ["aeo", "AEO", "Marketing", "Answer engine optimization planning without guaranteed placement claims.", ["marketing.manage"], ["Content", "SEO"]],
  ["geo", "GEO", "Marketing", "Generative engine optimization and entity clarity.", ["marketing.manage"], ["Content", "Reports"]],
  ["local_seo", "Local SEO", "Marketing", "GBP, citations, local pages and reviews guidance.", ["marketing.manage"], ["GBP", "Local SEO"]],
  ["gbp", "GBP", "Marketing", "Google Business Profile recommendation/assistance mode unless API is authorized.", ["marketing.manage"], ["GBP"]],
  ["backlink", "Backlink", "Marketing", "Backlink opportunities, quality signals and outreach plans.", ["marketing.manage"], ["Backlinks", "CRM"]],
  ["cpa", "CPA", "Marketing", "CPA funnel, tracking, EPC, CPA and ROI/ROAS reporting from configured data.", ["marketing.manage"], ["CPA", "Tracking"]],
  ["affiliate", "Affiliate", "Marketing", "Affiliate campaigns, fraud flags, commissions and payout workflow.", ["affiliate.read"], ["Affiliate", "Reports"]],
  ["writer", "Writer", "Content", "Blogs, articles, website copy and long-form content.", ["content.create"], ["Content", "Brand Voice"]],
  ["copywriter", "Copywriter", "Content", "Ads, landing pages, emails and conversion copy.", ["content.create"], ["Content", "Ads"]],
  ["youtube", "YouTube", "Content", "YouTube scripts, descriptions, titles and SEO audit planning.", ["content.create"], ["YouTube", "SEO"]],
  ["graphic", "Graphic", "Creative", "Social graphics, banners, thumbnails and product creatives.", ["files.manage"], ["Creative Studio"]],
  ["logo", "Logo", "Creative", "Logo concepts, brand kit, typography and guidelines.", ["files.manage"], ["Brand Studio"]],
  ["video", "Video", "Creative", "Video planning, scripts, scenes and provider-based generation.", ["files.manage"], ["Video Studio"]],
  ["presentation", "Presentation", "Creative", "Pitch decks, sales decks, education decks and speaker notes.", ["reports.read"], ["Presentation Studio"]],
  ["crm", "CRM", "Business", "Leads, contacts, customer history and pipeline operations.", ["crm.manage"], ["CRM"]],
  ["sales", "Sales", "Business", "Scripts, proposals, quotations, objections, upsell and retention.", ["crm.manage"], ["Sales", "CRM"]],
  ["proposal", "Proposal", "Business", "Proposal and client-ready business document drafts.", ["reports.read"], ["Documents", "CRM"]],
  ["word", "Word", "Office", "Word-style documents and AI document assistance.", ["files.manage"], ["Docs"]],
  ["excel", "Excel", "Office", "Spreadsheet cleaning, duplicate detection and analysis.", ["files.manage"], ["Sheets", "Data"]],
  ["powerpoint", "PowerPoint", "Office", "Presentation generation and export workflows.", ["files.manage"], ["Presentations"]],
  ["pdf", "PDF", "Office", "PDF summary, conversion, merge/split and translation workflows.", ["files.manage"], ["PDF"]],
  ["data_entry", "Data Entry", "Office", "Data entry, mapping, validation and QA workflows.", ["files.manage"], ["Data"]],
  ["cv", "CV", "Career", "CV, ATS, portfolio and career profile assistance.", ["profile.manage"], ["Career"]],
  ["ats", "ATS", "Career", "ATS optimization and job matching guidance.", ["profile.manage"], ["Career"]],
  ["interview", "Interview", "Career", "Interview preparation and question practice.", ["profile.manage"], ["Career"]],
  ["cover_letter", "Cover Letter", "Career", "Cover letter drafts and job application support.", ["profile.manage"], ["Career"]],
] as const;

const platformMetricSeeds = [
  ["users", "Users", 1248, "accounts", "+12%"],
  ["organizations", "Organizations", 186, "workspaces", "+8%"],
  ["subscriptions", "Subscriptions", 142, "active", "+11%"],
  ["revenue", "Revenue", 845000, "BDT", "+16%"],
  ["ai_usage", "AI Usage", 273500, "credits", "+23%"],
  ["storage", "Storage", 842, "GB", "+7%"],
  ["sessions", "Sessions", 3912, "active", "+9%"],
  ["meetings", "Meetings", 624, "summaries", "+19%"],
  ["integrations", "Integrations", 318, "connected", "+10%"],
  ["api_calls", "API Usage", 918420, "calls", "+31%"],
] as const;

export async function seedFoysalOsData() {
  const [owner] = await db
    .insert(users)
    .values({
      displayName: "Foysal IT Owner",
      email: "owner@foysalit.os",
      phone: "+880 1XXXXXXXXX",
      country: "Bangladesh",
      language: "en",
      timezone: "Asia/Dhaka",
      accountStatus: "active",
      roleLabel: "Super Owner",
      emailVerifiedAt: now(),
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        displayName: "Foysal IT Owner",
        phone: "+880 1XXXXXXXXX",
        country: "Bangladesh",
        language: "en",
        timezone: "Asia/Dhaka",
        accountStatus: "active",
        roleLabel: "Super Owner",
        emailVerifiedAt: now(),
        updatedAt: now(),
      },
    })
    .returning();

  await db
    .insert(authCredentials)
    .values({
      userId: owner.id,
      passwordHash: hashPassword("foysalit123"),
      passwordAlgo: "scrypt-sha256",
    })
    .onConflictDoUpdate({
      target: authCredentials.userId,
      set: {
        passwordHash: hashPassword("foysalit123"),
        passwordAlgo: "scrypt-sha256",
        passwordUpdatedAt: now(),
      },
    });

  // Also seed developer account for user's personal email
  const [rafiqUser] = await db
    .insert(users)
    .values({
      displayName: "Rafiq Miah",
      email: "rafiqmiahrafiq007@gmail.com",
      phone: "+880 1700000000",
      country: "Bangladesh",
      language: "en",
      timezone: "Asia/Dhaka",
      accountStatus: "active",
      roleLabel: "Super Owner",
      emailVerifiedAt: now(),
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        displayName: "Rafiq Miah",
        accountStatus: "active",
        roleLabel: "Super Owner",
        emailVerifiedAt: now(),
        updatedAt: now(),
      },
    })
    .returning();

  await db
    .insert(authCredentials)
    .values({
      userId: rafiqUser.id,
      passwordHash: hashPassword("foysalit123"),
      passwordAlgo: "scrypt-sha256",
    })
    .onConflictDoUpdate({
      target: authCredentials.userId,
      set: {
        passwordHash: hashPassword("foysalit123"),
        passwordAlgo: "scrypt-sha256",
        passwordUpdatedAt: now(),
      },
    });

  const [workspace] = await db
    .insert(workspaces)
    .values({
      ownerUserId: owner.id,
      name: "FOYSAL IT Agency",
      slug: "foysal-it-agency",
      type: "agency",
      status: "active",
      region: "Bangladesh",
      language: "en",
      timezone: "Asia/Dhaka",
    })
    .onConflictDoUpdate({
      target: workspaces.slug,
      set: {
        ownerUserId: owner.id,
        name: "FOYSAL IT Agency",
        type: "agency",
        status: "active",
        region: "Bangladesh",
        language: "en",
        timezone: "Asia/Dhaka",
        updatedAt: now(),
      },
    })
    .returning();

  const [agencyBUser] = await db
    .insert(users)
    .values({
      displayName: "Agency B Owner",
      email: "owner@agency-b.example",
      country: "Bangladesh",
      language: "en",
      timezone: "Asia/Dhaka",
      accountStatus: "active",
      roleLabel: "Agency Owner",
      emailVerifiedAt: now(),
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { displayName: "Agency B Owner", accountStatus: "active", roleLabel: "Agency Owner", emailVerifiedAt: now(), updatedAt: now() },
    })
    .returning();

  const [agencyBWorkspace] = await db
    .insert(workspaces)
    .values({
      ownerUserId: agencyBUser.id,
      name: "Agency B Private Workspace",
      slug: "agency-b-private",
      type: "agency",
      status: "active",
      region: "Bangladesh",
      language: "en",
      timezone: "Asia/Dhaka",
    })
    .onConflictDoUpdate({
      target: workspaces.slug,
      set: { ownerUserId: agencyBUser.id, name: "Agency B Private Workspace", status: "active", updatedAt: now() },
    })
    .returning();

  await db
    .insert(workspaceMembers)
    .values({
      workspaceId: workspace.id,
      userId: owner.id,
      role: "super_owner",
      permissions: ["platform.*", "billing.manage", "security.manage", "workspace.manage", "entitlements.read", "feature_flags.manage", "users.force_logout"],
    })
    .onConflictDoUpdate({
      target: [workspaceMembers.workspaceId, workspaceMembers.userId],
      set: {
        role: "super_owner",
        permissions: ["platform.*", "billing.manage", "security.manage", "workspace.manage", "entitlements.read", "feature_flags.manage", "users.force_logout"],
      },
    });

  await db
    .insert(workspaceMembers)
    .values({
      workspaceId: workspace.id,
      userId: rafiqUser.id,
      role: "super_owner",
      permissions: ["platform.*", "billing.manage", "security.manage", "workspace.manage", "entitlements.read", "feature_flags.manage", "users.force_logout"],
    })
    .onConflictDoUpdate({
      target: [workspaceMembers.workspaceId, workspaceMembers.userId],
      set: {
        role: "super_owner",
        permissions: ["platform.*", "billing.manage", "security.manage", "workspace.manage", "entitlements.read", "feature_flags.manage", "users.force_logout"],
      },
    });

  await db
    .insert(workspaceMembers)
    .values({
      workspaceId: agencyBWorkspace.id,
      userId: agencyBUser.id,
      role: "agency_owner",
      permissions: ["workspace.manage", "billing.manage", "members.manage", "crm.manage", "marketing.manage", "automation.manage", "ai.use", "files.manage", "analytics.read"],
    })
    .onConflictDoUpdate({
      target: [workspaceMembers.workspaceId, workspaceMembers.userId],
      set: { role: "agency_owner", permissions: ["workspace.manage", "billing.manage", "members.manage", "crm.manage", "marketing.manage", "automation.manage", "ai.use", "files.manage", "analytics.read"] },
    });

  for (const role of roleSeeds) {
    await db
      .insert(rolePermissions)
      .values(role)
      .onConflictDoUpdate({
        target: rolePermissions.role,
        set: {
          displayName: role.displayName,
          permissions: role.permissions,
          navigation: role.navigation,
          isPlatformRole: role.isPlatformRole,
        },
      });
  }

  await db
    .insert(securitySettings)
    .values({
      userId: owner.id,
      emailVerified: true,
      phoneVerified: true,
      passwordReady: true,
      authenticatorEnabled: true,
      passkeyEnabled: true,
      voiceVerificationReady: false,
      recoveryCodesReady: false,
      trustedDevices: 2,
      securityScore: 82,
    })
    .onConflictDoUpdate({
      target: securitySettings.userId,
      set: {
        emailVerified: true,
        phoneVerified: true,
        passwordReady: true,
        authenticatorEnabled: true,
        passkeyEnabled: true,
        voiceVerificationReady: false,
        recoveryCodesReady: false,
        trustedDevices: 2,
        securityScore: 82,
        updatedAt: now(),
      },
    });

  await db
    .insert(securitySettings)
    .values({
      userId: agencyBUser.id,
      emailVerified: true,
      phoneVerified: false,
      passwordReady: true,
      authenticatorEnabled: false,
      passkeyEnabled: false,
      recoveryCodesReady: false,
      trustedDevices: 1,
      securityScore: 58,
    })
    .onConflictDoUpdate({
      target: securitySettings.userId,
      set: { emailVerified: true, phoneVerified: false, passwordReady: true, trustedDevices: 1, securityScore: 58, updatedAt: now() },
    });

  for (const provider of providerSeeds) {
    await db
      .insert(authProviderConfigs)
      .values({ ...provider, metadata: { rawSecretStorage: false, secureSecretsRequired: provider.category === "oauth" || provider.category === "sso" } })
      .onConflictDoUpdate({
        target: authProviderConfigs.providerKey,
        set: {
          displayName: provider.displayName,
          category: provider.category,
          priority: provider.priority,
          enabled: provider.enabled,
          phase: provider.phase,
          enterpriseOnly: provider.enterpriseOnly,
          metadata: { rawSecretStorage: false, secureSecretsRequired: provider.category === "oauth" || provider.category === "sso" },
        },
      });
  }

  const planRows = new Map<string, string>();
  for (const plan of planSeeds) {
    const [planRow] = await db
      .insert(plans)
      .values({
        code: plan.code,
        name: plan.name,
        tier: plan.tier,
        summary: plan.summary,
        phase: plan.phase,
        sortOrder: plan.sortOrder,
        isPublic: true,
      })
      .onConflictDoUpdate({
        target: plans.code,
        set: {
          name: plan.name,
          tier: plan.tier,
          summary: plan.summary,
          phase: plan.phase,
          sortOrder: plan.sortOrder,
          isPublic: true,
        },
      })
      .returning();

    planRows.set(plan.code, planRow.id);

    for (const entitlement of plan.entitlements) {
      await db
        .insert(planEntitlements)
        .values({
          planId: planRow.id,
          featureKey: entitlement.featureKey,
          featureName: entitlement.featureName,
          enabled: entitlement.enabled,
          limitValue: entitlement.limitValue,
          limitUnit: entitlement.limitUnit,
          enforcement: "backend_required",
          metadata: { configuredFrom: "database", frontendHideIsNotSecurity: true },
        })
        .onConflictDoUpdate({
          target: [planEntitlements.planId, planEntitlements.featureKey],
          set: {
            featureName: entitlement.featureName,
            enabled: entitlement.enabled,
            limitValue: entitlement.limitValue,
            limitUnit: entitlement.limitUnit,
            enforcement: "backend_required",
            metadata: { configuredFrom: "database", frontendHideIsNotSecurity: true },
          },
        });
    }
  }

  const professionalPlanId = planRows.get("professional");
  if (professionalPlanId) {
    await db
      .insert(subscriptions)
      .values({
        workspaceId: workspace.id,
        planId: professionalPlanId,
        status: "active",
        renewalState: "renews automatically",
        currentPeriodEnd: periodEnd(),
        paymentProviderRef: "tokenized-provider-customer-demo",
      })
      .onConflictDoUpdate({
        target: subscriptions.workspaceId,
        set: {
          planId: professionalPlanId,
          status: "active",
          renewalState: "renews automatically",
          currentPeriodEnd: periodEnd(),
          paymentProviderRef: "tokenized-provider-customer-demo",
          updatedAt: now(),
        },
      });
  }

  const starterPlanId = planRows.get("starter");
  if (starterPlanId) {
    await db
      .insert(subscriptions)
      .values({
        workspaceId: agencyBWorkspace.id,
        planId: starterPlanId,
        status: "active",
        renewalState: "renews automatically",
        currentPeriodEnd: periodEnd(),
        paymentProviderRef: "tokenized-provider-agency-b",
      })
      .onConflictDoUpdate({
        target: subscriptions.workspaceId,
        set: { planId: starterPlanId, status: "active", renewalState: "renews automatically", currentPeriodEnd: periodEnd(), paymentProviderRef: "tokenized-provider-agency-b", updatedAt: now() },
      });
  }

  for (const usage of usageSeeds) {
    await db
      .insert(usageMeters)
      .values({
        workspaceId: workspace.id,
        ...usage,
        periodLabel: "This month",
        warningThreshold: 80,
      })
      .onConflictDoUpdate({
        target: [usageMeters.workspaceId, usageMeters.metricKey],
        set: {
          metricName: usage.metricName,
          used: usage.used,
          limitValue: usage.limitValue,
          percentUsed: usage.percentUsed,
          periodLabel: "This month",
          warningThreshold: 80,
          updatedAt: now(),
        },
      });
  }

  const invoiceSeeds = [
    { invoiceNumber: "INV-001", billingMonth: "Aug 2026", status: "paid" as const },
    { invoiceNumber: "INV-002", billingMonth: "Sep 2026", status: "paid" as const },
    { invoiceNumber: "INV-003", billingMonth: "Oct 2026", status: "pending" as const },
  ];

  for (const invoice of invoiceSeeds) {
    await db
      .insert(invoices)
      .values({
        workspaceId: workspace.id,
        invoiceNumber: invoice.invoiceNumber,
        billingMonth: invoice.billingMonth,
        status: invoice.status,
        providerInvoiceRef: `provider-${invoice.invoiceNumber.toLowerCase()}`,
      })
      .onConflictDoUpdate({
        target: invoices.invoiceNumber,
        set: {
          workspaceId: workspace.id,
          billingMonth: invoice.billingMonth,
          status: invoice.status,
          providerInvoiceRef: `provider-${invoice.invoiceNumber.toLowerCase()}`,
        },
      });
  }

  for (const moduleSeed of moduleSeeds) {
    const [moduleKey, name, category, description, requiredPermission, entitlementKey, route] = moduleSeed;
    await db
      .insert(platformModules)
      .values({
        moduleKey,
        name,
        category,
        description,
        enabled: true,
        navOrder: moduleSeeds.findIndex((entry) => entry[0] === moduleKey) + 1,
        requiredPermission,
        entitlementKey,
        route,
      })
      .onConflictDoUpdate({
        target: platformModules.moduleKey,
        set: { name, category, description, enabled: true, requiredPermission, entitlementKey, route },
      });
  }

  const onboardingSeeds = [
    ["welcome", "Welcome to FOYSAL IT OS", "Understand your unified workspace and choose recommended modules.", true],
    ["profile", "Complete your profile", "Confirm name, phone, country, language, and timezone.", true],
    ["workspace", "Create or initialize workspace", "Set up business/agency workspace, team roles, and permissions.", true],
    ["nova", "Meet NOVA AI", "Use NOVA AI for setup, support, business insights, and security guidance.", false],
    ["integrations", "Connect integrations", "Connect Google, analytics, payment, ads, CRM, or webhooks.", false],
  ] as const;
  for (const [itemKey, title, description, completed] of onboardingSeeds) {
    await db
      .insert(onboardingItems)
      .values({ workspaceId: workspace.id, itemKey, title, description, completed, sortOrder: onboardingSeeds.findIndex((entry) => entry[0] === itemKey) + 1 })
      .onConflictDoUpdate({
        target: [onboardingItems.workspaceId, onboardingItems.itemKey],
        set: { title, description, completed },
      });
  }

  await db
    .insert(businessProfiles)
    .values({
      workspaceId: workspace.id,
      businessName: "FOYSAL IT Agency",
      logoUrl: "/foysal-it-mark.svg",
      industry: "Digital Agency & SaaS",
      businessType: "Agency + Universal Business OS",
      website: "https://foysalit.example",
      location: "Dhaka, Bangladesh",
      currency: "BDT",
      language: "en",
      taxId: "Configured in billing settings",
      contactEmail: "owner@foysalit.os",
      contactPhone: "+880 1XXXXXXXXX",
      configuredAgents: ["Hermes Agent", "Strawberry AI", "Minimax Agent", "Kimi Work", "NOVA AI"],
      engineConfig: { configurableByIndustry: true, isolatedWorkspace: true, plaintextSecrets: false },
    })
    .onConflictDoUpdate({
      target: businessProfiles.workspaceId,
      set: {
        businessName: "FOYSAL IT Agency",
        logoUrl: "/foysal-it-mark.svg",
        industry: "Digital Agency & SaaS",
        businessType: "Agency + Universal Business OS",
        website: "https://foysalit.example",
        location: "Dhaka, Bangladesh",
        currency: "BDT",
        language: "en",
        taxId: "Configured in billing settings",
        contactEmail: "owner@foysalit.os",
        contactPhone: "+880 1XXXXXXXXX",
        configuredAgents: ["Hermes Agent", "Strawberry AI", "Minimax Agent", "Kimi Work", "NOVA AI"],
        engineConfig: { configurableByIndustry: true, isolatedWorkspace: true, plaintextSecrets: false },
        updatedAt: now(),
      },
    });

  await db
    .insert(businessProfiles)
    .values({
      workspaceId: agencyBWorkspace.id,
      businessName: "Agency B Private Business",
      industry: "Private Services",
      businessType: "Agency",
      location: "Bangladesh",
      currency: "BDT",
      language: "en",
      contactEmail: "owner@agency-b.example",
      configuredAgents: ["Kimi Work"],
      engineConfig: { isolatedWorkspace: true },
    })
    .onConflictDoUpdate({
      target: businessProfiles.workspaceId,
      set: { businessName: "Agency B Private Business", industry: "Private Services", updatedAt: now() },
    });

  for (const [index, label] of targetUserSegmentLabels.entries()) {
    const segmentKey = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
    const isMarketing = /SEO|AEO|GEO|GBP|GMB|Backlink|CPA|Marketing|Content|Video|Graphic|Logo/i.test(label);
    const isDeveloper = /Developer|UI\/UX|Software|App|Web/i.test(label);
    const isEducation = /Teacher|Student|Trainer/i.test(label);
    await db
      .insert(targetUserSegments)
      .values({
        segmentKey,
        label,
        description: `Dedicated FOYSAL IT OS workspace experience for ${label}.`,
        recommendedModules: isMarketing ? ["marketing_os", "seo", "ads", "social_media", "content", "reports"] : isDeveloper ? ["projects", "tasks", "api_center", "integrations", "nova_ai"] : isEducation ? ["knowledge_base", "content", "meeting_ai", "files", "reports"] : ["business_os", "crm", "projects", "analytics", "billing"],
        recommendedAiAgents: isMarketing ? ["Marketing Agent", "SEO Agent", "AEO Agent", "GEO Agent", "Backlink Agent", "CPA Agent", "Content Agent"] : isDeveloper ? ["Developer Agent", "App Developer Agent", "Automation Agent"] : isEducation ? ["Education Agent", "Career Agent", "Translation Agent"] : ["Universal Assistant", "Business Advisor", "Analytics Agent", "Reporting Agent"],
        defaultGoals: ["Start working faster", "Use role-based tools", "Automate repeat work", "Generate clear reports"],
        sortOrder: index + 1,
        enabled: true,
      })
      .onConflictDoUpdate({
        target: targetUserSegments.segmentKey,
        set: {
          label,
          description: `Dedicated FOYSAL IT OS workspace experience for ${label}.`,
          sortOrder: index + 1,
          enabled: true,
        },
      });
  }

  for (const [index, widget] of dashboardWidgetSeeds.entries()) {
    const [widgetKey, label, description, requiredPermission, recommendedForSegments] = widget;
    await db
      .insert(dashboardWidgets)
      .values({ widgetKey, label, description, requiredPermission, recommendedForSegments: [...recommendedForSegments], defaultVisible: true, customizable: true, sortOrder: index + 1 })
      .onConflictDoUpdate({
        target: dashboardWidgets.widgetKey,
        set: { label, description, requiredPermission, recommendedForSegments: [...recommendedForSegments], defaultVisible: true, customizable: true, sortOrder: index + 1 },
      });
  }

  for (const capability of osCapabilitySeeds) {
    const [systemKey, name, category, features, workflow, externalConnectionRequired, mode] = capability;
    await db
      .insert(osCapabilities)
      .values({ workspaceId: workspace.id, systemKey, name, category, features: [...features], workflow: [...workflow], externalConnectionRequired, mode, status: "active" })
      .onConflictDoUpdate({
        target: [osCapabilities.workspaceId, osCapabilities.systemKey],
        set: { name, category, features: [...features], workflow: [...workflow], externalConnectionRequired, mode, status: "active" },
      });
  }

  await db
    .insert(workflowTemplates)
    .values({
      workspaceId: workspace.id,
      workflowKey: "universal_marketing_campaign",
      name: "Universal AI Marketing Campaign",
      steps: ["Research", "Strategy", "SEO", "Content", "Creative", "Ads", "CRM", "Tasks", "Calendar", "Reports"],
      confirmationRequiredFor: ["external publishing", "payments", "deletion", "ad spend", "client-facing email", "CRM bulk update"],
      enabled: true,
    })
    .onConflictDoUpdate({
      target: [workflowTemplates.workspaceId, workflowTemplates.workflowKey],
      set: { steps: ["Research", "Strategy", "SEO", "Content", "Creative", "Ads", "CRM", "Tasks", "Calendar", "Reports"], confirmationRequiredFor: ["external publishing", "payments", "deletion", "ad spend", "client-facing email", "CRM bulk update"], enabled: true },
    });

  const existingCommands = await db.select({ id: aiCommandRuns.id }).from(aiCommandRuns).where(eq(aiCommandRuns.workspaceId, workspace.id));
  if (!existingCommands.length) {
    await db.insert(aiCommandRuns).values({
      workspaceId: workspace.id,
      requestedByUserId: owner.id,
      commandText: "Create a complete marketing campaign for my business.",
      planSteps: ["Research", "Strategy", "SEO", "Content", "Creative", "Ads", "CRM", "Tasks", "Calendar", "Reports"],
      requiresConfirmation: true,
      consequentialActions: ["external publishing", "payments", "deletion", "ad spend", "CRM bulk changes"],
      status: "pending",
      outputPolicy: "NOVA may plan the campaign now. Publishing, payment, deletion, and other consequential actions require authorization/confirmation.",
    });
  }

  await db
    .insert(customAiAgents)
    .values({
      workspaceId: workspace.id,
      createdByUserId: owner.id,
      name: "Campaign Operations Agent",
      instructions: "Plan and coordinate campaigns using only authorized workspace knowledge and configured tools.",
      knowledgeScopes: ["company_information", "products", "services", "brand_rules", "client_instructions"],
      tools: ["NOVA AI", "CRM", "Tasks", "Calendar", "Reports"],
      permissions: ["ai.use", "crm.manage", "tasks.update", "reports.read"],
      trigger: "manual_command_or_campaign_brief",
      workflow: ["Brief", "Plan", "Draft", "Request approval", "Create tasks", "Report"],
      outputFormat: "campaign_plan_with_approval_gates",
      approvalRequired: true,
      limits: { monthlyRuns: 100, maxTasksPerRun: 25, externalActionsBlockedUntilConfirmed: true },
      enabled: true,
    })
    .onConflictDoUpdate({
      target: [customAiAgents.workspaceId, customAiAgents.name],
      set: { instructions: "Plan and coordinate campaigns using only authorized workspace knowledge and configured tools.", approvalRequired: true, enabled: true },
    });

  const knowledgeSeeds = [
    ["Company Information", "company_information", "Official company positioning, contacts, service areas, and workspace facts."],
    ["Products", "products", "Authorized product/package descriptions from the business catalog."],
    ["Services", "services", "Agency service definitions, retainers, deliverables, and scopes."],
    ["Brand Rules", "brand_rules", "Tone, colors, logo usage, claims policy, and approval rules."],
    ["SOP", "sop", "Internal process documents and delivery checklists."],
    ["Documents", "documents", "Workspace documents authorized for AI retrieval."],
    ["FAQs", "faqs", "Approved answers for prospects, customers, clients, and support."],
    ["Client Instructions", "client_instructions", "Client-specific instructions protected by workspace permissions."],
    ["Project Information", "project_information", "Project briefs, tasks, deadlines, files, and activity history."],
  ] as const;
  const existingKnowledge = await db.select({ title: knowledgeDocuments.title }).from(knowledgeDocuments).where(eq(knowledgeDocuments.workspaceId, workspace.id));
  const existingKnowledgeTitles = new Set(existingKnowledge.map((doc) => doc.title));
  for (const [title, documentType, summary] of knowledgeSeeds) {
    if (!existingKnowledgeTitles.has(title)) {
      await db.insert(knowledgeDocuments).values({ workspaceId: workspace.id, title, documentType, summary, permissionScope: "workspace.read", authorizedForAi: true, metadata: { workspaceScoped: true, novaMustRespectPermissions: true } });
    }
  }

  const trackingActions = ["Page View", "Lead", "Signup", "View Content", "Add to Cart", "Checkout", "Purchase"] as const;
  for (const action of trackingActions) {
    await db
      .insert(trackingMatrixEvents)
      .values({ workspaceId: workspace.id, businessAction: action, healthStatus: "warning", aiDiagnosis: "Problem → Cause → Fix → Test → Verify. Authorization required before live tag validation." })
      .onConflictDoUpdate({
        target: [trackingMatrixEvents.workspaceId, trackingMatrixEvents.businessAction],
        set: { healthStatus: "warning", aiDiagnosis: "Problem → Cause → Fix → Test → Verify. Authorization required before live tag validation." },
      });
  }

  await db
    .insert(affiliatePrograms)
    .values({ workspaceId: workspace.id, programName: "FOYSAL Partner Program", flow: ["Register", "Verify", "Approve", "Referral", "Click", "Lead", "Conversion", "Commission", "Approval", "Payout"], fraudDetectionEnabled: true, approvalRequired: true, status: "active" })
    .onConflictDoUpdate({ target: [affiliatePrograms.workspaceId, affiliatePrograms.programName], set: { fraudDetectionEnabled: true, approvalRequired: true, status: "active" } });

  await db
    .insert(cpaCampaigns)
    .values({ workspaceId: workspace.id, campaignName: "CPA Lead Generation Blueprint", flow: ["Traffic", "Landing Page", "Click", "Lead", "Conversion", "Revenue", "CPA", "ROI"], metrics: ["Traffic Source", "UTM", "Cost", "Revenue", "CPA", "EPC", "Conversion Rate", "ROI/ROAS", "Funnel", "A/B Testing", "Campaign Report"], status: "active", reportingMode: "configured_data_only" })
    .onConflictDoUpdate({ target: [cpaCampaigns.workspaceId, cpaCampaigns.campaignName], set: { metrics: ["Traffic Source", "UTM", "Cost", "Revenue", "CPA", "EPC", "Conversion Rate", "ROI/ROAS", "Funnel", "A/B Testing", "Campaign Report"], status: "active", reportingMode: "configured_data_only" } });

  await db
    .insert(brandVoiceProfiles)
    .values({
      workspaceId: workspace.id,
      brandName: "FOYSAL IT",
      tone: "Professional, futuristic, helpful, confident",
      audience: "Business owners, agencies, marketers, developers, creators, students, and enterprise teams",
      language: "en + bn",
      keywords: ["FOYSAL IT OS", "NOVA AI", "business automation", "agency growth", "secure workspace"],
      cta: "Start working inside FOYSAL IT OS",
      style: "Clear, premium, action-oriented, no exaggerated claims",
      brandRules: ["Do not promise guaranteed rankings or AI placement", "Label AI-generated recommendations", "Use authorization before publishing", "Never expose secrets"],
    })
    .onConflictDoUpdate({
      target: brandVoiceProfiles.workspaceId,
      set: { tone: "Professional, futuristic, helpful, confident", language: "en + bn", updatedAt: now() },
    });

  const existingRepurpose = await db.select({ id: contentRepurposingPlans.id }).from(contentRepurposingPlans).where(eq(contentRepurposingPlans.workspaceId, workspace.id));
  if (!existingRepurpose.length) {
    await db.insert(contentRepurposingPlans).values({
      workspaceId: workspace.id,
      sourceType: "Blog",
      sourceTitle: "How FOYSAL IT OS unifies agency operations",
      targetFormats: ["Facebook", "LinkedIn", "Instagram", "YouTube Script", "Reel", "Short", "Email", "Ad"],
      approvalRequired: true,
      publishingStatus: "authorization_required",
      status: "active",
    });
  }

  const creativeSeeds = [
    ["video", "Launch Promo Video", ["Text → Video", "Script → Video", "Scene Builder", "Timeline", "Captions", "Voice-over", "Thumbnail", "Shorts", "Reels", "TikTok", "YouTube"]],
    ["graphic", "Social Launch Creative Kit", ["Social Post", "Banner", "Poster", "Flyer", "Brochure", "Advertisement", "Product Creative", "Website Banner", "Thumbnail"]],
    ["image_generator", "AI Image Creative", ["Text → Image", "Image → Image", "Background", "Object Removal", "Enhancement", "Upscale", "Resize", "Crop", "Variations"]],
    ["logo_brand", "FOYSAL IT Brand Kit", ["Logo Concepts", "Icon", "Typography", "Colors", "Favicon", "Social Logo", "Brand Mark", "Mockup", "Brand Guidelines"]],
    ["presentation", "Investor Pitch Deck", ["Pitch Deck", "Sales Deck", "Education", "Training", "Project Presentation", "Speaker Notes", "Export"]],
  ] as const;
  const existingCreative = await db.select({ title: creativeStudioProjects.title }).from(creativeStudioProjects).where(eq(creativeStudioProjects.workspaceId, workspace.id));
  const existingCreativeTitles = new Set(existingCreative.map((item) => item.title));
  for (const [studioType, title, features] of creativeSeeds) {
    if (!existingCreativeTitles.has(title)) {
      await db.insert(creativeStudioProjects).values({ workspaceId: workspace.id, studioType, title, features: [...features], providerStatus: "authorization_required", approvalRequired: true, status: "active" });
    }
  }

  const dataSeeds = [
    ["data_entry", "Client CRM Import", ["Collect", "Excel/CSV", "CRM Entry", "Validate", "QA"], ["Required", "Email", "Phone", "Unique"], "warning", 86, true],
    ["data_cleaning", "Duplicate Customer Cleanup", ["Scan", "Duplicate Detection", "Missing Fields", "Invalid Email", "Fix", "Verify"], ["Format", "Unique", "URL", "Date"], "warning", 79, true],
    ["data_mapping", "Old CRM to FOYSAL Mapping", ["Source Column", "Destination Field", "AI Suggested Mapping", "Saved Template"], ["Type", "Length", "Format"], "valid", 91, true],
    ["data_migration", "Legacy Spreadsheet Migration", ["Old System", "Mapping", "Validation", "Preview", "Import", "Verification", "Failed Records", "Retry", "Error Report"], ["Required", "Range", "Email", "Phone"], "warning", 74, true],
    ["data_entry_qa", "Double Verification QA", ["Sampling", "Double Verification", "Field Comparison", "Reviewer", "Revision", "Quality Score"], ["Required", "Format", "Unique"], "valid", 94, false],
  ] as const;
  const existingDataOps = await db.select({ title: dataOperations.title }).from(dataOperations).where(eq(dataOperations.workspaceId, workspace.id));
  const existingDataTitles = new Set(existingDataOps.map((item) => item.title));
  for (const [operationType, title, workflow, validationRules, validationState, qualityScore, rollbackFeasible] of dataSeeds) {
    if (!existingDataTitles.has(title)) {
      await db.insert(dataOperations).values({ workspaceId: workspace.id, operationType, title, workflow: [...workflow], validationRules: [...validationRules], validationState, qualityScore, rollbackFeasible, status: "active" });
    }
  }

  const officeSeeds = [
    ["document", "Client Proposal Document", "DOCX", ["Create", "Edit", "Formatting", "Tables", "Images", "Comments", "Review", "Spell Check", "Grammar"]],
    ["spreadsheet", "Monthly Sales Analysis", "XLSX", ["Workbook", "Worksheet", "Rows", "Columns", "Tables", "Sorting", "Filtering", "Charts", "Formula Assistance", "Import", "Export"]],
    ["presentation", "Training Deck", "PPTX", ["Slides", "Layouts", "Text", "Images", "Tables", "Charts", "Speaker Notes", "AI Presentation Generator", "Export"]],
    ["pdf", "Signed Contract PDF", "PDF", ["PDF Viewer", "Search", "Merge", "Split", "Compress", "PDF → Word", "PDF → Excel", "Summary", "Translation"]],
    ["file", "Shared Brand Assets", "Folder", ["My Files", "Shared", "Recent", "Starred", "Folders", "Upload", "Download", "Version History"]],
  ] as const;
  const existingOffice = await db.select({ title: officeAssets.title }).from(officeAssets).where(eq(officeAssets.workspaceId, workspace.id));
  const existingOfficeTitles = new Set(existingOffice.map((item) => item.title));
  for (const [assetType, title, format, features] of officeSeeds) {
    if (!existingOfficeTitles.has(title)) {
      await db.insert(officeAssets).values({ workspaceId: workspace.id, assetType, title, format, features: [...features], shared: assetType === "file", starred: true, status: "active" });
    }
  }

  const existingCalendar = await db.select({ title: calendarEvents.title }).from(calendarEvents).where(eq(calendarEvents.workspaceId, workspace.id));
  if (!existingCalendar.length) {
    await db.insert(calendarEvents).values([
      { workspaceId: workspace.id, title: "Client Strategy Meeting", eventType: "meeting", startAt: daysFromNow(2), endAt: daysFromNow(2), reminders: ["1 day", "30 minutes"], participants: ["Owner", "Client", "NOVA Meeting Agent"] },
      { workspaceId: workspace.id, title: "Campaign Deadline", eventType: "deadline", startAt: daysFromNow(7), endAt: daysFromNow(7), reminders: ["2 days", "1 day"], participants: ["Marketing Team"] },
    ]);
  }

  const existingMeetings = await db.select({ title: remoteMeetings.title }).from(remoteMeetings).where(eq(remoteMeetings.workspaceId, workspace.id));
  if (!existingMeetings.length) {
    await db.insert(remoteMeetings).values({
      workspaceId: workspace.id,
      title: "Multilingual Client Meeting Architecture",
      providerStatus: "authorization_required",
      liveStatus: "not_live",
      features: ["Create Meeting", "Participants", "Microphone", "Camera", "Screen Share", "Chat", "Recording where permitted", "Live Transcript", "AI Summary", "Action Items"],
      liveIndicators: ["LIVE", "Speaking", "Language", "Translating", "Voice Output", "Transcript", "Connected", "Participants"],
      supportedVoicePipeline: ["Voice", "Speech Recognition", "Language Detection", "Translation", "Voice Generation"],
      recordingPermitted: false,
    });
  }

  const readinessSeeds = [
    ["database_backup", "backup_recovery", "Database Backup", "AUTHORIZATION REQUIRED", "No managed backup provider is connected in this preview; show actual status only after infrastructure integration.", ["Connect managed PostgreSQL backups", "Define retention", "Schedule restore tests"]],
    ["file_backup", "backup_recovery", "File Backup", "NOT CONNECTED", "No production object storage backup integration is connected in this preview.", ["Connect storage provider", "Enable versioning", "Test restore"]],
    ["configuration_backup", "backup_recovery", "Configuration Backup", "NO DATA", "Configuration backup state is unavailable until production deployment config is connected.", ["Export encrypted config", "Protect secrets", "Run restore drill"]],
    ["recovery_process", "backup_recovery", "Recovery Process", "NO DATA", "Documented as architecture; actual status must come from production runbooks.", ["Create runbook", "Assign owner", "Test quarterly"]],
    ["disaster_recovery", "backup_recovery", "Disaster Recovery", "NO DATA", "DR region/provider not connected in preview.", ["Define RPO/RTO", "Replicate data", "Practice failover"]],
    ["restore_testing", "backup_recovery", "Restore Testing", "NO DATA", "Restore test evidence is not available in this sandbox.", ["Run test restore", "Record timestamp", "Audit result"]],
    ["database_performance", "performance", "Database, Indexes & Pagination", "CONFIGURED", "Schema includes workspace indexes, unique constraints and paginated API-ready structure.", ["Use keyset pagination", "Monitor slow queries", "Add query plans"]],
    ["api_performance", "performance", "Caching, API Calls & Background Jobs", "ARCHITECTURE READY", "Routes are server-side and modular; production caching/job queues depend on deployment infrastructure.", ["Add cache tags", "Queue file processing", "Track API latency"]],
    ["large_data", "performance", "Search, Streaming, Real-time & Large Data", "ARCHITECTURE READY", "Large data should use pagination, search indexes and streaming where connected.", ["Add search service", "Stream exports", "Use background imports"]],
    ["responsive_ui", "responsive_accessibility", "Responsive UI Components", "CONFIGURED", "Dashboard uses responsive grids, sidebar, cards, links and mobile-friendly layouts.", ["Add tables", "Add modals/drawers", "Add empty/loading/error states"]],
    ["accessibility", "responsive_accessibility", "Accessibility", "ARCHITECTURE READY", "Readable contrast and semantic links are present; full audit requires browser accessibility testing.", ["Keyboard test", "Form labels", "Focus states", "Clear errors"]],
    ["real_data_principle", "data_integrity", "Real Data Principle", "ENFORCED BY POLICY", "Disconnected/unavailable/unsupported states are labeled instead of fabricated metrics.", ["Show NO DATA", "Show NOT CONNECTED", "Show AUTHORIZATION REQUIRED", "Show UNSUPPORTED"]],
  ] as const;
  for (const [itemKey, category, name, statusLabel, evidence, recommendations] of readinessSeeds) {
    await db
      .insert(productionReadinessItems)
      .values({ workspaceId: workspace.id, itemKey, category, name, statusLabel, evidence, recommendations: [...recommendations] })
      .onConflictDoUpdate({ target: [productionReadinessItems.workspaceId, productionReadinessItems.itemKey], set: { category, name, statusLabel, evidence, recommendations: [...recommendations], updatedAt: now() } });
  }

  const createOptions = ["Client", "Lead", "Project", "Task", "Content", "Video", "Graphic", "Logo", "CV", "Course", "Campaign", "Affiliate Campaign", "Meeting", "Report", "AI Agent", "Workflow", "Invoice", "Document", "Spreadsheet", "Presentation"] as const;
  for (const [index, label] of createOptions.entries()) {
    const optionKey = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
    await db
      .insert(universalActionOptions)
      .values({ actionType: "create", optionKey, label, flow: ["Open + Create", "Choose type", "Complete form", "Permission check", "Create"], requiredPermission: "workspace.read", approvalRequired: ["Invoice", "Affiliate Campaign"].includes(label), sortOrder: index + 1 })
      .onConflictDoUpdate({ target: [universalActionOptions.actionType, universalActionOptions.optionKey], set: { label, sortOrder: index + 1, enabled: true } });
  }

  const importFormats = ["CSV", "XLSX", "JSON", "TXT", "PDF", "Images", "Documents"];
  await db
    .insert(universalActionOptions)
    .values({ actionType: "import", optionKey: "universal_import", label: "Universal Import", supportedFormats: importFormats, flow: ["Upload", "Preview", "Mapping", "Validation", "Approval", "Import"], requiredPermission: "workspace.manage", approvalRequired: true, sortOrder: 1 })
    .onConflictDoUpdate({ target: [universalActionOptions.actionType, universalActionOptions.optionKey], set: { supportedFormats: importFormats, flow: ["Upload", "Preview", "Mapping", "Validation", "Approval", "Import"], approvalRequired: true } });

  const exportFormats = ["PDF", "DOCX", "XLSX", "CSV", "JSON", "Images", "Presentation", "Text"];
  await db
    .insert(universalActionOptions)
    .values({ actionType: "export", optionKey: "universal_export", label: "Universal Export", supportedFormats: exportFormats, flow: ["Select records", "Permission check", "Preview", "Export", "Audit"], requiredPermission: "export", approvalRequired: false, sortOrder: 1 })
    .onConflictDoUpdate({ target: [universalActionOptions.actionType, universalActionOptions.optionKey], set: { supportedFormats: exportFormats, flow: ["Select records", "Permission check", "Preview", "Export", "Audit"] } });

  await db
    .insert(globalizationSettings)
    .values({ workspaceId: workspace.id, languages: ["Bengali", "English", "German", "Chinese", "French", "Spanish"], currencies: ["BDT", "USD", "EUR", "GBP", "JPY"], timezones: ["Asia/Dhaka", "UTC", "America/New_York", "Europe/Berlin", "Asia/Tokyo"], dateFormats: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"], numberFormats: ["1,234.56", "1.234,56"], countrySettings: ["Bangladesh", "United States", "Germany", "Japan", "Global"] })
    .onConflictDoUpdate({ target: globalizationSettings.workspaceId, set: { languages: ["Bengali", "English", "German", "Chinese", "French", "Spanish"], currencies: ["BDT", "USD", "EUR", "GBP", "JPY"], updatedAt: now() } });

  await db
    .insert(whiteLabelSettings)
    .values({ workspaceId: workspace.id, logoUrl: "/foysal-it-mark.svg", brandName: "FOYSAL IT", domain: "client.foysalit.example", clientPortalBranding: true, reportBranding: true, emailBranding: true, theme: { primary: "#c313e7", accent: "#f2ea35", mode: "dark" }, statusLabel: "CONFIGURED" })
    .onConflictDoUpdate({ target: whiteLabelSettings.workspaceId, set: { brandName: "FOYSAL IT", statusLabel: "CONFIGURED", updatedAt: now() } });

  const memorySeeds = [
    ["user_preferences", "User Preferences", "Theme, dashboard, language and tool preferences controlled by the user."],
    ["business_knowledge", "Business Knowledge", "Business profile, goals, customers, products and services authorized for NOVA."],
    ["brand_rules", "Brand Rules", "Tone, keywords, CTA, style and claims policy."],
    ["projects", "Projects", "Project names, deadlines, tasks and activity summaries within workspace permissions."],
    ["products", "Products", "Product catalog and package summaries."],
    ["services", "Services", "Service definitions and agency delivery scopes."],
  ] as const;
  const existingMemory = await db.select({ title: aiMemoryItems.title }).from(aiMemoryItems).where(eq(aiMemoryItems.workspaceId, workspace.id));
  const existingMemoryTitles = new Set(existingMemory.map((item) => item.title));
  for (const [memoryType, title, summary] of memorySeeds) {
    if (!existingMemoryTitles.has(title)) {
      await db.insert(aiMemoryItems).values({ workspaceId: workspace.id, userId: owner.id, memoryType, title, summary, controls: ["View", "Edit", "Delete", "Disable"], enabled: true });
    }
  }

  const approvalOperations = ["External publishing", "Paid advertising", "Payments", "Bulk deletion", "Client delivery", "Sensitive data", "Account changes"] as const;
  for (const operation of approvalOperations) {
    const operationKey = operation.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
    await db
      .insert(humanApprovalPolicies)
      .values({ workspaceId: workspace.id, operationKey, label: operation, flow: ["AI Draft", "Human Review", "Approval", "Action"], required: true, riskLevel: operation === "Payments" || operation === "Bulk deletion" ? "high" : "medium" })
      .onConflictDoUpdate({ target: [humanApprovalPolicies.workspaceId, humanApprovalPolicies.operationKey], set: { label: operation, required: true } });
  }

  const universalWorkflowSeeds = [
    ["business_master", "Business", ["Lead", "CRM", "Sales", "Customer", "Project", "Invoice", "Report"]],
    ["marketing_master", "Marketing", ["Research", "SEO", "Content", "Creative", "Ads", "Tracking", "Analytics", "Report"]],
    ["seo_master", "SEO", ["Audit", "Keywords", "Content", "On-page", "Links", "Tracking", "Report"]],
    ["local_seo_master", "Local SEO", ["GBP", "Citations", "Reviews", "Local Content", "Maps", "Report"]],
    ["developer_master", "Developer", ["Idea", "Requirements", "Architecture", "Development", "Testing", "Documentation", "Release"]],
    ["career_master", "Career", ["Profile", "CV", "Job Match", "Cover Letter", "Interview", "Application"]],
    ["education_master", "Education", ["Course", "Lesson", "Assignment", "Quiz", "Exam", "Result", "Certificate"]],
    ["data_master", "Data", ["Collect", "Import", "Clean", "Validate", "Verify", "Store", "Report"]],
    ["office_master", "Office", ["Create", "Edit", "Review", "Approve", "Export", "Share"]],
    ["meeting_master", "Meeting", ["Schedule", "Join", "Voice", "Transcript", "Translate", "Summary", "Action Items", "Tasks"]],
    ["ultimate_one_command", "Ultimate One-Command", ["Understand", "Research", "Plan", "Create", "Connect", "Automate", "Track", "Analyze", "Report", "Optimize", "Grow"]],
    ["master_flow", "Final Master Flow", ["Discover", "Plan", "Create", "Manage", "Connect", "Automate", "Track", "Analyze", "Report", "Review", "Optimize", "Grow"]],
    ["ai_work_os", "AI Work OS", ["Business Information", "SEO", "Local SEO", "AEO", "GEO", "Backlinks", "Content", "Creative", "GTM", "GA4", "Pixels", "CPA", "Analytics", "Recommendations", "Tasks", "Professional Report"]],
  ] as const;
  for (const [workflowKey, name, steps] of universalWorkflowSeeds) {
    await db
      .insert(workflowTemplates)
      .values({ workspaceId: workspace.id, workflowKey, name, steps: [...steps], confirmationRequiredFor: ["external publishing", "paid advertising", "payments", "bulk deletion", "client delivery", "sensitive data", "account changes"], enabled: true })
      .onConflictDoUpdate({ target: [workflowTemplates.workspaceId, workflowTemplates.workflowKey], set: { name, steps: [...steps], enabled: true } });
  }

  const finalSections = [
    ["ai", "🧠", "AI", ["NOVA", "AI Router", "Agent Orchestrator", "Agents", "Knowledge", "Automation"]],
    ["business", "💼", "Business", ["Business", "CRM", "Sales", "B2B", "B2C", "E-commerce"]],
    ["agency", "🏢", "Agency", ["Clients", "Projects", "Team", "Billing", "Reports", "Client Portal"]],
    ["marketing", "📈", "Marketing", ["SEO", "AEO", "GEO", "Local SEO", "GBP", "Backlinks", "CPA", "Ads"]],
    ["analytics", "📊", "Analytics", ["GTM", "GA4", "Pixels", "Conversion", "Attribution", "Dashboards"]],
    ["creative", "🎨", "Creative", ["Content", "Graphic", "Logo", "Video", "Presentation", "Brand"]],
    ["development", "💻", "Development", ["Web", "App", "API", "Code", "Testing", "Documentation"]],
    ["data", "📂", "Data", ["Data Entry", "Research", "Cleaning", "Validation", "Migration", "QA"]],
    ["office", "🏢", "Office", ["Remote Office", "Docs", "Sheets", "Presentations", "PDF", "Email", "Calendar"]],
    ["education", "🎓", "Education", ["LMS", "Course", "AI Tutor", "Assignment", "Quiz", "Exam", "Certificate"]],
    ["career", "👤", "Career", ["CV", "ATS", "Job Match", "Cover Letter", "Portfolio", "Interview"]],
    ["affiliate", "🤝", "Affiliate", ["Referral", "Tracking", "Conversion", "Commission", "Payout"]],
    ["meeting", "🎥", "Meeting", ["Live Meeting", "Transcript", "Translation", "Voice", "AI Summary"]],
    ["reports", "📑", "Reports", ["Create", "Analyze", "Review", "Approve", "Export", "Share", "Archive"]],
    ["platform", "⚙️", "Platform", ["Auth", "Security", "RBAC", "Multi-Tenant", "API", "Integrations", "Billing", "Backup", "Monitoring"]],
  ] as const;
  for (const [index, section] of finalSections.entries()) {
    const [sectionKey, icon, title, modules] = section;
    await db
      .insert(finalStructureSections)
      .values({ sectionKey, icon, title, modules: [...modules], sortOrder: index + 1 })
      .onConflictDoUpdate({ target: finalStructureSections.sectionKey, set: { icon, title, modules: [...modules], sortOrder: index + 1 } });
  }

  await db
    .insert(userProfiles)
    .values({
      userId: owner.id,
      profilePhotoUrl: "/foysal-it-mark.svg",
      professionalTitle: "Super Owner & Digital Business Architect",
      bio: "Building FOYSAL IT OS as one connected business, agency, AI, billing, security, and administration platform.",
      skills: ["SaaS", "Agency Operations", "AI Strategy", "CRM", "Automation", "Security", "Billing"],
      experience: ["Agency founder", "Business systems architect", "Multi-tenant SaaS operator"],
      education: ["Continuous professional learning"],
      certifications: ["Security-first platform design", "AI operations architecture"],
      portfolio: ["FOYSAL IT OS", "NOVA AI", "Agency OS"],
      website: "https://foysalit.example",
      socialLinks: { website: "https://foysalit.example" },
      preferences: { theme: "dark", dashboardCustomizable: true, defaultWorkspace: "foysal-it-agency" },
      privacyControls: { profilePhoto: true, title: true, bio: true, skills: true, portfolio: true, email: false, phone: false },
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        professionalTitle: "Super Owner & Digital Business Architect",
        bio: "Building FOYSAL IT OS as one connected business, agency, AI, billing, security, and administration platform.",
        skills: ["SaaS", "Agency Operations", "AI Strategy", "CRM", "Automation", "Security", "Billing"],
        preferences: { theme: "dark", dashboardCustomizable: true, defaultWorkspace: "foysal-it-agency" },
        privacyControls: { profilePhoto: true, title: true, bio: true, skills: true, portfolio: true, email: false, phone: false },
        updatedAt: now(),
      },
    });

  await db
    .insert(onboardingPreferences)
    .values({
      userId: owner.id,
      workspaceId: workspace.id,
      targetSegmentKey: "agency",
      whatTheyDo: "Build and operate digital business systems for clients",
      industry: "Digital Agency & SaaS",
      businessType: "Agency Workspace",
      mainGoals: ["Manage clients", "Automate operations", "Use NOVA AI", "Track billing", "Secure workspace"],
      requiredTools: ["CRM", "Projects", "Tasks", "Marketing", "SEO", "Ads", "Social Media", "Reports", "Automation", "Files", "AI Usage"],
      preferredLanguage: "en",
      preferredTimezone: "Asia/Dhaka",
      completed: true,
    })
    .onConflictDoUpdate({
      target: [onboardingPreferences.userId, onboardingPreferences.workspaceId],
      set: {
        targetSegmentKey: "agency",
        whatTheyDo: "Build and operate digital business systems for clients",
        industry: "Digital Agency & SaaS",
        businessType: "Agency Workspace",
        mainGoals: ["Manage clients", "Automate operations", "Use NOVA AI", "Track billing", "Secure workspace"],
        requiredTools: ["CRM", "Projects", "Tasks", "Marketing", "SEO", "Ads", "Social Media", "Reports", "Automation", "Files", "AI Usage"],
        preferredLanguage: "en",
        preferredTimezone: "Asia/Dhaka",
        completed: true,
        updatedAt: now(),
      },
    });

  const catalogSeeds = [
    ["product", "Starter Website Package", 12],
    ["service", "SEO Growth Retainer", 7],
    ["inventory", "Content Production Slots", 24],
    ["order", "Monthly Campaign Orders", 18],
    ["payment", "Tokenized Payment Records", 33],
    ["delivery", "Client Delivery Queue", 9],
    ["finance", "Tax & Finance Rules", 4],
    ["marketing", "Campaign Playbooks", 11],
  ] as const;
  const existingCatalog = await db.select({ name: businessCatalogItems.name }).from(businessCatalogItems).where(eq(businessCatalogItems.workspaceId, workspace.id));
  const existingCatalogNames = new Set(existingCatalog.map((item) => item.name));
  for (const [itemType, name, quantity] of catalogSeeds) {
    if (!existingCatalogNames.has(name)) {
      await db.insert(businessCatalogItems).values({ workspaceId: workspace.id, itemType, name, quantity, status: "active", metadata: { universalBusinessEngine: true } });
    }
  }

  const leadSeeds = [
    ["Ayesha Rahman", "Northstar Retail", "proposal", 88, "Send proposal follow-up"],
    ["Tanvir Hossain", "Dhaka Growth Lab", "prospect", 72, "Schedule discovery call"],
    ["Mina Tech", "Enterprise Pilot", "onboarding", 81, "Collect brand assets"],
    ["Paused Account", "Legacy Client", "paused_client", 47, "Review reactivation plan"],
  ] as const;
  const existingLeads = await db.select({ name: crmLeads.name }).from(crmLeads).where(eq(crmLeads.workspaceId, workspace.id));
  const existingLeadNames = new Set(existingLeads.map((lead) => lead.name));
  for (const [name, company, stage, valueScore, nextStep] of leadSeeds) {
    if (!existingLeadNames.has(name)) {
      await db.insert(crmLeads).values({ workspaceId: workspace.id, assignedUserId: owner.id, name, company, email: `${name.toLowerCase().replaceAll(" ", ".")}@example.com`, source: "Website", stage, valueScore, nextStep });
    }
  }

  const agencyBExistingLead = await db.select({ name: crmLeads.name }).from(crmLeads).where(eq(crmLeads.workspaceId, agencyBWorkspace.id));
  if (!agencyBExistingLead.length) {
    await db.insert(crmLeads).values({ workspaceId: agencyBWorkspace.id, assignedUserId: agencyBUser.id, name: "Agency B Confidential Lead", company: "Private Co", source: "Referral", stage: "lead", valueScore: 66, nextStep: "Private follow-up" });
  }

  const aiAgentSeeds = [
    ["universal", "Universal Assistant", "General workspace assistant across business, agency, CRM, files, and operations"],
    ["business_advisor", "Business Advisor", "Business recommendations, strategy, offers, retention, and operations guidance"],
    ["research", "Research Agent", "Research planning and source-aware summaries"],
    ["marketing", "Marketing Agent", "Campaign strategy, channels, funnels, and conversion optimization"],
    ["seo", "SEO Agent", "SEO planning, keyword research, intent, technical and content recommendations"],
    ["local_seo", "Local SEO Agent", "Local keywords, GBP/GMB recommendations, NAP, citations, local audits"],
    ["aeo", "AEO Agent", "Answer engine optimization without guaranteed AI/search placement claims"],
    ["geo", "GEO Agent", "Generative engine optimization, entity clarity, citations, and authority guidance"],
    ["backlink", "Backlink Agent", "Backlink analysis, quality signals, outreach and opportunity planning"],
    ["cpa", "CPA Agent", "CPA funnel planning, offer tracking, EPC, CPA, ROI/ROAS reporting using configured data"],
    ["developer", "Developer Agent", "Web/software development planning, API center guidance, and implementation tasks"],
    ["app_developer", "App Developer Agent", "App planning, feature breakdown, release tasks, and integration support"],
    ["content", "Content Agent", "Blogs, articles, copy, landing pages, newsletters, proposals, and social captions"],
    ["creative", "Creative Agent", "Creative direction, UI/UX recommendations, design consistency and conversion UX"],
    ["data", "Data Agent", "Data entry, cleaning, analysis planning, and structured reporting"],
    ["office", "Office Agent", "Office workflows, documents, tasks, HR and admin productivity"],
    ["education", "Education Agent", "Teacher, student, trainer workflows, lessons, assignments, and learning help"],
    ["career", "Career Agent", "Professional profile, skills, portfolio and career guidance"],
    ["meeting", "Meeting Agent", "Meeting summaries, action items, decisions and follow-up tasks"],
    ["translation", "Translation Agent", "Translation workflows and language-aware communication"],
    ["analytics", "Analytics Agent", "Workspace analytics interpretation without inventing real metrics"],
    ["reporting", "Reporting Agent", "Reports and executive summaries with source labels"],
    ["automation", "Automation Agent", "Workflow planning, triggers, approvals, and automation limits"],
    ["moderator", "AI Moderator", "Safety, tone, compliance, and moderation"],
    ["ads", "AI Ads", "Ad copy, experiments, and campaign ideas"],
    ["sales", "AI Sales", "Sales scripts, objections, proposals, quotations, upselling and retention"],
    ["product", "AI Product", "Product/service recommendations"],
    ["customer", "AI Customer", "Customer analysis and support guidance"],
    ["inventory", "AI Inventory", "Inventory and capacity assistance"],
    ["finance", "AI Finance", "Finance summaries and anomaly guidance"],
  ] as const;
  for (const [agentKey, name, role] of aiAgentSeeds) {
    await db.insert(aiAgents).values({ agentKey, name, role, enabled: true }).onConflictDoUpdate({ target: aiAgents.agentKey, set: { name, role, enabled: true } });
  }

  const existingAiOutputs = await db.select({ title: aiOutputs.title }).from(aiOutputs).where(eq(aiOutputs.workspaceId, workspace.id));
  if (!existingAiOutputs.length) {
    await db.insert(aiOutputs).values([
      { workspaceId: workspace.id, agentKey: "seo", title: "Keyword opportunity draft", summary: "AI-generated keyword ideas for agency service pages. Verify rankings with connected SEO APIs before reporting.", dataSource: "ai_generated", verified: false },
      { workspaceId: workspace.id, agentKey: "analytics", title: "Workspace usage summary", summary: "Summarized from workspace usage meters already stored in FOYSAL IT OS.", dataSource: "workspace_data", verified: true, externalSourceLabel: "Internal usage meters" },
      { workspaceId: workspace.id, agentKey: "reporting", title: "External ranking data", summary: "Authorization required before pulling real rankings or analytics. No fake API status is shown.", dataSource: "not_connected", verified: false, externalSourceLabel: "SEO API not connected" },
    ]);
  }

  await db.insert(voiceAiConfigs).values({ workspaceId: workspace.id }).onConflictDoUpdate({ target: voiceAiConfigs.workspaceId, set: { speechToTextStatus: "authorization_required", textToSpeechStatus: "authorization_required", speakerDetectionStatus: "authorization_required", languageDetectionStatus: "authorization_required", voiceAssistantStatus: "authorization_required", voiceHistoryEnabled: false, updatedAt: now() } });
  await db.insert(translationConfigs).values({ workspaceId: workspace.id }).onConflictDoUpdate({ target: translationConfigs.workspaceId, set: { status: "authorization_required", updatedAt: now() } });
  await db.insert(meetingConfigs).values({ workspaceId: workspace.id }).onConflictDoUpdate({ target: meetingConfigs.workspaceId, set: { googleAccountStatus: "authorization_required", googleMeetStatus: "authorization_required", calendarStatus: "authorization_required", liveTranscriptStatus: "authorization_required", aiAssistantStatus: "not_connected", updatedAt: now() } });

  const clients = [
    ["Northstar Retail", "active", 92],
    ["Dhaka Growth Lab", "active", 87],
    ["Enterprise Pilot", "pending", 74],
  ] as const;
  const existingClients = await db.select({ name: crmClients.name }).from(crmClients).where(eq(crmClients.workspaceId, workspace.id));
  const existingClientNames = new Set(existingClients.map((client) => client.name));
  for (const [name, status, healthScore] of clients) {
    if (!existingClientNames.has(name)) {
      await db.insert(crmClients).values({ workspaceId: workspace.id, ownerUserId: owner.id, name, status, healthScore });
    }
  }

  const workspaceClients = await db.select().from(crmClients).where(eq(crmClients.workspaceId, workspace.id));
  const firstClient = workspaceClients.at(0);
  const projectSeeds = [
    ["Agency Website Revamp", "in_progress", "high", 62, 14],
    ["SEO Retainer Launch", "review", "medium", 78, 9],
    ["Paid Ads Funnel", "client_approval", "urgent", 84, 5],
    ["Blocked Analytics Migration", "blocked", "high", 31, 2],
  ] as const;
  const existingProjects = await db.select({ name: projects.name }).from(projects).where(eq(projects.workspaceId, workspace.id));
  const existingProjectNames = new Set(existingProjects.map((project) => project.name));
  for (const [name, status, priority, progress, daysUntilDeadline] of projectSeeds) {
    if (!existingProjectNames.has(name)) {
      const [project] = await db
        .insert(projects)
        .values({ workspaceId: workspace.id, clientId: firstClient?.id, ownerUserId: owner.id, name, status, priority, progress, deadline: daysFromNow(daysUntilDeadline) })
        .returning();
      await db.insert(tasks).values([
        { workspaceId: workspace.id, projectId: project.id, assignedUserId: owner.id, title: `${name}: strategy`, status: "in_progress", priority, progress: Math.min(progress, 70), commentsCount: 3, attachmentsCount: 1, deadline: daysFromNow(Math.max(1, daysUntilDeadline - 4)) },
        { workspaceId: workspace.id, projectId: project.id, assignedUserId: owner.id, title: `${name}: client approval`, status: status === "client_approval" ? "client_approval" : "review", priority: "medium", progress: Math.min(progress + 8, 95), commentsCount: 5, attachmentsCount: 2, deadline: daysFromNow(daysUntilDeadline) },
      ]);
    }
  }

  const operationSeeds = [
    ["crm", "Lead pipeline cleanup", "active", 68],
    ["marketing_os", "October campaign launch", "active", 76],
    ["seo", "Technical SEO audit", "warning", 52],
    ["automation", "Invoice follow-up automation", "active", 91],
    ["meeting_ai", "Weekly client meeting summaries", "active", 83],
  ] as const;
  const existingOperations = await db
    .select({ moduleKey: businessOperations.moduleKey, title: businessOperations.title })
    .from(businessOperations)
    .where(eq(businessOperations.workspaceId, workspace.id));
  const existingOperationKeys = new Set(existingOperations.map((operation) => `${operation.moduleKey}:${operation.title}`));
  for (const [moduleKey, title, status, progress] of operationSeeds) {
    if (!existingOperationKeys.has(`${moduleKey}:${title}`)) {
      await db.insert(businessOperations).values({ workspaceId: workspace.id, moduleKey, title, status, progress, metadata: { owner: "Unified OS" } });
    }
  }

  const integrationSeeds = [
    ["google_workspace", "Google Workspace", "active"],
    ["stripe", "Payment Provider", "active"],
    ["meta_ads", "Meta Ads", "pending"],
    ["webhooks", "Webhooks", "active"],
  ] as const;
  for (const [providerKey, displayName, status] of integrationSeeds) {
    await db
      .insert(integrations)
      .values({ workspaceId: workspace.id, providerKey, displayName, status, secretsStored: false, tokenized: true, lastSyncAt: status === "active" ? now() : undefined })
      .onConflictDoUpdate({
        target: [integrations.workspaceId, integrations.providerKey],
        set: { displayName, status, secretsStored: false, tokenized: true, lastSyncAt: status === "active" ? now() : undefined },
      });
  }

  await db
    .insert(apiKeys)
    .values({
      workspaceId: workspace.id,
      name: "Production API",
      keyPrefix: "fit_live_4N7Q",
      keyHash: stableHash("fit_live_demo_secret_never_exposed"),
      active: true,
      lastUsedAt: now(),
    })
    .onConflictDoUpdate({
      target: apiKeys.keyHash,
      set: { name: "Production API", keyPrefix: "fit_live_4N7Q", active: true, lastUsedAt: now() },
    });

  for (const [providerKey, displayName, providerType, configuredStatus, availabilityLabel, workloads, capabilityDetection, documentationNote] of aiProviderSlotSeeds) {
    await db
      .insert(aiProviderSlots)
      .values({ providerKey, displayName, providerType, configuredStatus, availabilityLabel, workloads: [...workloads], capabilityDetection, documentationNote, enabled: configuredStatus === "Configured" })
      .onConflictDoUpdate({
        target: aiProviderSlots.providerKey,
        set: { displayName, providerType, configuredStatus, availabilityLabel, workloads: [...workloads], capabilityDetection, documentationNote, enabled: configuredStatus === "Configured", updatedAt: now() },
      });
  }

  for (const [taskType, primaryProviderKey, secondaryProviderKey, fallbackProviderKey, routingReason, costStrategy] of modelRoutingRuleSeeds) {
    await db
      .insert(modelRoutingRules)
      .values({ taskType, primaryProviderKey, secondaryProviderKey, fallbackProviderKey, routingReason, costStrategy, requiresHumanNotificationOnFailure: true, enabled: true })
      .onConflictDoUpdate({
        target: modelRoutingRules.taskType,
        set: { primaryProviderKey, secondaryProviderKey, fallbackProviderKey, routingReason, costStrategy, requiresHumanNotificationOnFailure: true, enabled: true },
      });
  }

  for (const [index, agent] of agentMarketplaceSeeds.entries()) {
    const [agentKey, name, category, description, permissions, tools] = agent;
    await db
      .insert(agentMarketplaceItems)
      .values({ agentKey, name, category, description, permissions: [...permissions], tools: [...tools], requiresApprovalForExternalActions: true, installedByDefault: ["seo", "writer", "crm", "sales", "word", "excel"].includes(agentKey), enabled: true, sortOrder: index + 1 })
      .onConflictDoUpdate({
        target: agentMarketplaceItems.agentKey,
        set: { name, category, description, permissions: [...permissions], tools: [...tools], enabled: true, sortOrder: index + 1 },
      });
  }

  const existingOrchestration = await db.select({ id: agentOrchestrationRuns.id }).from(agentOrchestrationRuns).where(eq(agentOrchestrationRuns.workspaceId, workspace.id));
  if (!existingOrchestration.length) {
    await db.insert(agentOrchestrationRuns).values({
      workspaceId: workspace.id,
      requestedByUserId: owner.id,
      userRequest: "আমার YouTube channel-এর complete SEO audit করো।",
      moderatorPlan: ["Understand request", "Break into subtasks", "Select Research, YouTube SEO, Content and Analytics agents", "Check tool authorization", "Run agent tasks", "Combine outputs", "Produce final professional report"],
      selectedAgents: ["Moderator Agent", "Research Agent", "YouTube SEO Agent", "Content Agent", "Analytics Agent"],
      tools: ["Knowledge Base", "SEO recommendations", "Content planner", "Analytics connector if authorized"],
      progressStatus: "planned",
      failurePolicy: "Primary Agent → Secondary Agent → Fallback Agent → Human Notification. Never silently fabricate a result.",
      finalOutputType: "youtube_seo_audit_report",
      approvalRequired: true,
    });
  }

  for (const [metricKey, label, value, unit, trend] of platformMetricSeeds) {
    await db
      .insert(platformMetrics)
      .values({ metricKey, label, value, unit, trend, visibleToSuperOwner: true })
      .onConflictDoUpdate({
        target: platformMetrics.metricKey,
        set: { label, value, unit, trend, visibleToSuperOwner: true, updatedAt: now() },
      });
  }

  const healthSeeds = [
    ["database", "PostgreSQL Database", "active", 100],
    ["auth", "Authentication", "active", 100],
    ["billing", "Billing Engine", "active", 99],
    ["ai", "NOVA AI Layer", "active", 99],
    ["email", "Email Queue", "active", 98],
    ["integrations", "Integration Worker", "warning", 96],
  ] as const;
  for (const [componentKey, displayName, status, uptimePercent] of healthSeeds) {
    await db
      .insert(systemHealthChecks)
      .values({ componentKey, displayName, status, uptimePercent, lastCheckedAt: now() })
      .onConflictDoUpdate({
        target: systemHealthChecks.componentKey,
        set: { displayName, status, uptimePercent, lastCheckedAt: now() },
      });
  }

  const flagSeeds = [
    ["voice_login", "Voice Login", false, 0, "enterprise"],
    ["magic_link", "Magic Link", false, 0, "business"],
    ["enterprise_sso", "Enterprise SSO", false, 0, "enterprise"],
    ["nova_security_assistant", "NOVA AI Security Assistant", true, 100, "professional"],
    ["client_portal_v2", "Client Portal V2", true, 35, "professional"],
  ] as const;
  for (const [flagKey, name, enabled, rolloutPercent, requiredPlan] of flagSeeds) {
    await db
      .insert(featureFlags)
      .values({ flagKey, name, enabled, rolloutPercent, requiredPlan })
      .onConflictDoUpdate({
        target: featureFlags.flagKey,
        set: { name, enabled, rolloutPercent, requiredPlan, updatedAt: now() },
      });
  }

  await db
    .insert(trustedDevices)
    .values({ userId: owner.id, deviceHash: stableHash("owner-primary-device"), displayName: "Owner MacBook / Chrome", trusted: true, lastUsedAt: now() })
    .onConflictDoUpdate({
      target: [trustedDevices.userId, trustedDevices.deviceHash],
      set: { displayName: "Owner MacBook / Chrome", trusted: true, lastUsedAt: now() },
    });

  await db
    .insert(sessions)
    .values({
      userId: owner.id,
      workspaceId: workspace.id,
      sessionTokenHash: stableHash("owner-demo-session"),
      status: "active",
      ipHash: stableHash("127.0.0.1"),
      userAgent: "FOYSAL IT OS Preview Browser",
      riskScore: 8,
      suspicious: false,
      lastSeenAt: now(),
      expiresAt: daysFromNow(30),
    })
    .onConflictDoUpdate({
      target: sessions.sessionTokenHash,
      set: { status: "active", riskScore: 8, suspicious: false, lastSeenAt: now(), expiresAt: daysFromNow(30) },
    });

  const auditSeeds = [
    ["auth.registration.auto_activation.ready", "Registration creates a secure user, queues verification and welcome email, verifies email, activates account, creates workspace, and opens dashboard.", "low"],
    ["auth.provider_registry.updated", "Provider registry prepared for Email, Phone, Google, Passkey, Voice, Magic Link, and SSO.", "low"],
    ["rbac.server_side.enforced", "Server-side role and permission checks protect workspace, billing, security, and platform administration data.", "medium"],
    ["billing.subscription.active", "Workspace subscription is active and feature access is plan-entitlement driven.", "low"],
    ["security.voice_architecture.ready", "Voice verification stores verification results only; raw voice recordings are not persisted.", "medium"],
    ["super_owner.control_center.ready", "Super Owner can monitor authorized platform metrics, users, organizations, sessions, activity, health, flags, and audit logs without displaying secrets.", "medium"],
  ] as const;

  const existingLogs = await db.select({ eventType: auditLogs.eventType }).from(auditLogs).where(eq(auditLogs.workspaceId, workspace.id));
  const existingEventTypes = new Set(existingLogs.map((log) => log.eventType));

  for (const [eventType, description, riskLevel] of auditSeeds) {
    if (!existingEventTypes.has(eventType)) {
      await db.insert(auditLogs).values({
        workspaceId: workspace.id,
        userId: owner.id,
        actorType: "system",
        eventType,
        description,
        riskLevel,
        metadata: { demo: true, secretsDisplayed: false },
      });
    }
  }

  return { owner, workspace };
}

export async function getFoysalOsSnapshot() {
  const { owner, workspace } = await seedFoysalOsData();

  const [security] = await db.select().from(securitySettings).where(eq(securitySettings.userId, owner.id));
  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, owner.id));
  const providers = await db.select().from(authProviderConfigs).orderBy(asc(authProviderConfigs.priority));
  const aiProviders = await db.select().from(aiProviderSlots).orderBy(asc(aiProviderSlots.displayName));
  const routingRules = await db.select().from(modelRoutingRules).where(eq(modelRoutingRules.enabled, true)).orderBy(asc(modelRoutingRules.taskType));
  const agentHub = await db.select().from(agentMarketplaceItems).where(eq(agentMarketplaceItems.enabled, true)).orderBy(asc(agentMarketplaceItems.category), asc(agentMarketplaceItems.sortOrder));
  const orchestrationRuns = await db.select().from(agentOrchestrationRuns).where(eq(agentOrchestrationRuns.workspaceId, workspace.id)).orderBy(desc(agentOrchestrationRuns.createdAt));
  const roles = await db.select().from(rolePermissions).orderBy(asc(rolePermissions.displayName));
  const targetSegments = await db.select().from(targetUserSegments).where(eq(targetUserSegments.enabled, true)).orderBy(asc(targetUserSegments.sortOrder));
  const widgets = await db.select().from(dashboardWidgets).orderBy(asc(dashboardWidgets.sortOrder));
  const modules = await db.select().from(platformModules).orderBy(asc(platformModules.navOrder));
  const planCatalog = await db.select().from(plans).orderBy(asc(plans.sortOrder));
  const subscriptionsWithPlan = await db
    .select({ subscription: subscriptions, plan: plans })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(eq(subscriptions.workspaceId, workspace.id));
  const subscription = subscriptionsWithPlan.at(0);
  const meters = await db.select().from(usageMeters).where(eq(usageMeters.workspaceId, workspace.id)).orderBy(asc(usageMeters.metricName));
  const invoiceRows = await db.select().from(invoices).where(eq(invoices.workspaceId, workspace.id)).orderBy(asc(invoices.invoiceNumber));

  const planIds = planCatalog.map((plan) => plan.id);
  const entitlementRows = planIds.length
    ? await db.select().from(planEntitlements).where(inArray(planEntitlements.planId, planIds)).orderBy(asc(planEntitlements.featureName))
    : [];

  const currentEntitlements = subscription ? entitlementRows.filter((entitlement) => entitlement.planId === (subscription.plan?.id ?? (subscription as any).planId)) : [];
  const currentEntitlementKeys = new Set(currentEntitlements.filter((entitlement) => entitlement.enabled).map((entitlement) => entitlement.featureKey));
  const accessibleModules = modules.filter((module) => !module.entitlementKey || currentEntitlementKeys.has(module.entitlementKey) || module.moduleKey === "super_owner");

  const onboarding = await db.select().from(onboardingItems).where(eq(onboardingItems.workspaceId, workspace.id)).orderBy(asc(onboardingItems.sortOrder));
  const [onboardingPreference] = await db
    .select()
    .from(onboardingPreferences)
    .where(and(eq(onboardingPreferences.workspaceId, workspace.id), eq(onboardingPreferences.userId, owner.id)));
  const [businessProfile] = await db.select().from(businessProfiles).where(eq(businessProfiles.workspaceId, workspace.id));
  const catalogItems = await db.select().from(businessCatalogItems).where(eq(businessCatalogItems.workspaceId, workspace.id)).orderBy(asc(businessCatalogItems.itemType));
  const clients = await db.select().from(crmClients).where(eq(crmClients.workspaceId, workspace.id)).orderBy(desc(crmClients.createdAt));
  const leads = await db.select().from(crmLeads).where(eq(crmLeads.workspaceId, workspace.id)).orderBy(desc(crmLeads.createdAt));
  const projectRows = await db.select().from(projects).where(eq(projects.workspaceId, workspace.id)).orderBy(desc(projects.createdAt));
  const taskRows = await db.select().from(tasks).where(eq(tasks.workspaceId, workspace.id)).orderBy(desc(tasks.createdAt));
  const operations = await db.select().from(businessOperations).where(eq(businessOperations.workspaceId, workspace.id)).orderBy(desc(businessOperations.createdAt));
  const capabilityRows = await db.select().from(osCapabilities).where(eq(osCapabilities.workspaceId, workspace.id)).orderBy(asc(osCapabilities.name));
  const workflowRows = await db.select().from(workflowTemplates).where(eq(workflowTemplates.workspaceId, workspace.id)).orderBy(asc(workflowTemplates.name));
  const commandRows = await db.select().from(aiCommandRuns).where(eq(aiCommandRuns.workspaceId, workspace.id)).orderBy(desc(aiCommandRuns.createdAt));
  const customAgentRows = await db.select().from(customAiAgents).where(eq(customAiAgents.workspaceId, workspace.id)).orderBy(asc(customAiAgents.name));
  const knowledgeRows = await db.select().from(knowledgeDocuments).where(eq(knowledgeDocuments.workspaceId, workspace.id)).orderBy(asc(knowledgeDocuments.documentType));
  const trackingRows = await db.select().from(trackingMatrixEvents).where(eq(trackingMatrixEvents.workspaceId, workspace.id)).orderBy(asc(trackingMatrixEvents.businessAction));
  const affiliateRows = await db.select().from(affiliatePrograms).where(eq(affiliatePrograms.workspaceId, workspace.id)).orderBy(asc(affiliatePrograms.programName));
  const cpaRows = await db.select().from(cpaCampaigns).where(eq(cpaCampaigns.workspaceId, workspace.id)).orderBy(asc(cpaCampaigns.campaignName));
  const [brandVoice] = await db.select().from(brandVoiceProfiles).where(eq(brandVoiceProfiles.workspaceId, workspace.id));
  const repurposingRows = await db.select().from(contentRepurposingPlans).where(eq(contentRepurposingPlans.workspaceId, workspace.id)).orderBy(desc(contentRepurposingPlans.createdAt));
  const creativeRows = await db.select().from(creativeStudioProjects).where(eq(creativeStudioProjects.workspaceId, workspace.id)).orderBy(asc(creativeStudioProjects.studioType));
  const dataOperationRows = await db.select().from(dataOperations).where(eq(dataOperations.workspaceId, workspace.id)).orderBy(asc(dataOperations.operationType));
  const officeRows = await db.select().from(officeAssets).where(eq(officeAssets.workspaceId, workspace.id)).orderBy(asc(officeAssets.assetType));
  const calendarRows = await db.select().from(calendarEvents).where(eq(calendarEvents.workspaceId, workspace.id)).orderBy(asc(calendarEvents.startAt));
  const remoteMeetingRows = await db.select().from(remoteMeetings).where(eq(remoteMeetings.workspaceId, workspace.id)).orderBy(desc(remoteMeetings.createdAt));
  const readinessRows = await db.select().from(productionReadinessItems).where(eq(productionReadinessItems.workspaceId, workspace.id)).orderBy(asc(productionReadinessItems.category));
  const actionRows = await db.select().from(universalActionOptions).where(eq(universalActionOptions.enabled, true)).orderBy(asc(universalActionOptions.actionType), asc(universalActionOptions.sortOrder));
  const [globalization] = await db.select().from(globalizationSettings).where(eq(globalizationSettings.workspaceId, workspace.id));
  const [whiteLabel] = await db.select().from(whiteLabelSettings).where(eq(whiteLabelSettings.workspaceId, workspace.id));
  const memoryRows = await db.select().from(aiMemoryItems).where(eq(aiMemoryItems.workspaceId, workspace.id)).orderBy(asc(aiMemoryItems.memoryType));
  const approvalRows = await db.select().from(humanApprovalPolicies).where(eq(humanApprovalPolicies.workspaceId, workspace.id)).orderBy(asc(humanApprovalPolicies.label));
  const finalStructureRows = await db.select().from(finalStructureSections).orderBy(asc(finalStructureSections.sortOrder));
  const aiAgentRows = await db.select().from(aiAgents).orderBy(asc(aiAgents.name));
  const aiOutputRows = await db.select().from(aiOutputs).where(eq(aiOutputs.workspaceId, workspace.id)).orderBy(desc(aiOutputs.createdAt));
  const [voiceAi] = await db.select().from(voiceAiConfigs).where(eq(voiceAiConfigs.workspaceId, workspace.id));
  const [translation] = await db.select().from(translationConfigs).where(eq(translationConfigs.workspaceId, workspace.id));
  const [meeting] = await db.select().from(meetingConfigs).where(eq(meetingConfigs.workspaceId, workspace.id));
  const integrationRows = await db.select().from(integrations).where(eq(integrations.workspaceId, workspace.id)).orderBy(asc(integrations.displayName));
  const apiKeyRows = await db
    .select({ id: apiKeys.id, name: apiKeys.name, keyPrefix: apiKeys.keyPrefix, active: apiKeys.active, lastUsedAt: apiKeys.lastUsedAt, createdAt: apiKeys.createdAt })
    .from(apiKeys)
    .where(eq(apiKeys.workspaceId, workspace.id))
    .orderBy(desc(apiKeys.createdAt));
  const platformMetricRows = await db.select().from(platformMetrics).where(eq(platformMetrics.visibleToSuperOwner, true)).orderBy(asc(platformMetrics.label));
  const healthRows = await db.select().from(systemHealthChecks).orderBy(asc(systemHealthChecks.displayName));
  const flagRows = await db.select().from(featureFlags).orderBy(asc(featureFlags.name));
  const sessionRows = await db
    .select({ id: sessions.id, status: sessions.status, userAgent: sessions.userAgent, riskScore: sessions.riskScore, suspicious: sessions.suspicious, lastSeenAt: sessions.lastSeenAt, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.userId, owner.id))
    .orderBy(desc(sessions.lastSeenAt));
  const deviceRows = await db
    .select({ id: trustedDevices.id, displayName: trustedDevices.displayName, trusted: trustedDevices.trusted, lastUsedAt: trustedDevices.lastUsedAt })
    .from(trustedDevices)
    .where(eq(trustedDevices.userId, owner.id))
    .orderBy(desc(trustedDevices.lastUsedAt));

  const [userCount] = await db.select({ value: count() }).from(users);
  const [workspaceCount] = await db.select({ value: count() }).from(workspaces);
  const [activeSubscriptionCount] = await db.select({ value: count() }).from(subscriptions).where(eq(subscriptions.status, "active"));
  const [auditCount] = await db.select({ value: count() }).from(auditLogs);

  const auditRows = await db.select().from(auditLogs).where(eq(auditLogs.workspaceId, workspace.id)).orderBy(desc(auditLogs.createdAt));

  return {
    owner,
    workspace,
    security,
    profile,
    providers,
    aiProviders,
    routingRules,
    agentHub,
    orchestrationRuns,
    roles,
    targetSegments,
    dashboardWidgets: widgets,
    modules,
    accessibleModules,
    plans: planCatalog,
    allEntitlements: entitlementRows,
    subscription,
    currentEntitlements,
    usageMeters: meters,
    invoices: invoiceRows,
    onboarding,
    onboardingPreference,
    businessProfile,
    catalogItems,
    clients,
    leads,
    projects: projectRows,
    tasks: taskRows,
    operations,
    osCapabilities: capabilityRows,
    workflowTemplates: workflowRows,
    aiCommandRuns: commandRows,
    customAiAgents: customAgentRows,
    knowledgeDocuments: knowledgeRows,
    trackingMatrixEvents: trackingRows,
    affiliatePrograms: affiliateRows,
    cpaCampaigns: cpaRows,
    brandVoice,
    contentRepurposingPlans: repurposingRows,
    creativeStudioProjects: creativeRows,
    dataOperations: dataOperationRows,
    officeAssets: officeRows,
    calendarEvents: calendarRows,
    remoteMeetings: remoteMeetingRows,
    productionReadinessItems: readinessRows,
    universalActionOptions: actionRows,
    globalization,
    whiteLabel,
    aiMemoryItems: memoryRows,
    humanApprovalPolicies: approvalRows,
    finalStructureSections: finalStructureRows,
    aiAgents: aiAgentRows,
    aiOutputs: aiOutputRows,
    voiceAi,
    translation,
    meeting,
    integrations: integrationRows,
    apiKeys: apiKeyRows,
    platformMetrics: platformMetricRows,
    healthChecks: healthRows,
    featureFlags: flagRows,
    sessions: sessionRows,
    devices: deviceRows,
    auditLogs: auditRows,
    counts: {
      users: userCount?.value ?? 0,
      workspaces: workspaceCount?.value ?? 0,
      activeSubscriptions: activeSubscriptionCount?.value ?? 0,
      auditLogs: auditCount?.value ?? 0,
    },
  };
}

export async function checkWorkspaceEntitlement(workspaceSlug: string, featureKey: string) {
  await seedFoysalOsData();

  const rows = await db
    .select({ workspace: workspaces, subscription: subscriptions, plan: plans, entitlement: planEntitlements })
    .from(workspaces)
    .innerJoin(subscriptions, eq(subscriptions.workspaceId, workspaces.id))
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .innerJoin(planEntitlements, and(eq(planEntitlements.planId, plans.id), eq(planEntitlements.featureKey, featureKey)))
    .where(eq(workspaces.slug, workspaceSlug));

  const row = rows.at(0);
  if (!row) {
    return {
      allowed: false,
      reason: "No entitlement found for this workspace and feature.",
      status: "not_found",
    };
  }

  const activeEnough = ["active", "renewal_due", "grace_period"].includes(row.subscription.status);
  const allowed = Boolean(row.entitlement.enabled && activeEnough && row.workspace.status === "active");

  return {
    allowed,
    reason: allowed
      ? "Feature access granted by active workspace subscription and backend entitlement."
      : "Feature access blocked by workspace status, subscription status, or plan entitlement.",
    status: row.subscription.status,
    workspaceStatus: row.workspace.status,
    workspace: row.workspace.slug,
    plan: row.plan.code,
    featureKey: row.entitlement.featureKey,
    featureName: row.entitlement.featureName,
    limitValue: row.entitlement.limitValue,
    limitUnit: row.entitlement.limitUnit,
    enforcement: row.entitlement.enforcement,
  };
}

export async function getWorkspaceSecureSnapshot(requestingUserId: string, workspaceSlug: string) {
  await seedFoysalOsData();

  const rows = await db
    .select({ workspace: workspaces, membership: workspaceMembers })
    .from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(and(eq(workspaces.slug, workspaceSlug), eq(workspaceMembers.userId, requestingUserId)));

  const row = rows.at(0);
  if (!row) {
    await db.insert(auditLogs).values({
      actorType: "system",
      eventType: "workspace.access.denied",
      description: "A workspace-scoped data request was denied because the user is not a member of that organization.",
      riskLevel: "high",
      metadata: { workspaceSlug, requestingUserId, isolatedTenantBoundary: true, privateDataReturned: false },
    });
    return { ok: false, status: 403, error: "Forbidden: workspace membership required.", isolatedTenantBoundary: true, privateDataReturned: false };
  }

  const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.workspaceId, row.workspace.id));
  const leadRows = await db.select().from(crmLeads).where(eq(crmLeads.workspaceId, row.workspace.id)).orderBy(desc(crmLeads.createdAt));
  const projectRows = await db.select().from(projects).where(eq(projects.workspaceId, row.workspace.id)).orderBy(desc(projects.createdAt));
  const clientRows = await db.select().from(crmClients).where(eq(crmClients.workspaceId, row.workspace.id)).orderBy(desc(crmClients.createdAt));

  return {
    ok: true,
    status: 200,
    workspace: { id: row.workspace.id, name: row.workspace.name, slug: row.workspace.slug, status: row.workspace.status },
    membership: { role: row.membership.role, permissions: row.membership.permissions },
    businessProfile: profile,
    leads: leadRows,
    projects: projectRows,
    clients: clientRows,
    isolatedTenantBoundary: true,
    privateDataReturnedOnlyForMember: true,
  };
}

export async function getSuperOwnerUser360(userId?: string) {
  const snapshot = await getFoysalOsSnapshot();
  const targetUserId = userId ?? snapshot.owner.id;
  const [user] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
      phone: users.phone,
      country: users.country,
      language: users.language,
      timezone: users.timezone,
      accountStatus: users.accountStatus,
      roleLabel: users.roleLabel,
      emailVerifiedAt: users.emailVerifiedAt,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, targetUserId));

  const memberships = await db
    .select({ workspaceName: workspaces.name, workspaceSlug: workspaces.slug, role: workspaceMembers.role, permissions: workspaceMembers.permissions })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, targetUserId));

  const sessionRows = await db
    .select({ id: sessions.id, status: sessions.status, userAgent: sessions.userAgent, riskScore: sessions.riskScore, suspicious: sessions.suspicious, lastSeenAt: sessions.lastSeenAt, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.userId, targetUserId))
    .orderBy(desc(sessions.lastSeenAt));

  const securityRows = await db.select().from(securitySettings).where(eq(securitySettings.userId, targetUserId));
  const events = await db
    .select({ eventType: auditLogs.eventType, description: auditLogs.description, riskLevel: auditLogs.riskLevel, createdAt: auditLogs.createdAt })
    .from(auditLogs)
    .where(eq(auditLogs.userId, targetUserId))
    .orderBy(desc(auditLogs.createdAt));

  return {
    user,
    memberships,
    sessions: sessionRows,
    security: securityRows.at(0),
    auditEvents: events,
    secretsDisplayed: false,
    excludedFields: ["password", "passwordHash", "apiKeyHash", "oauthAccessToken", "oauthRefreshToken", "sessionTokenHash"],
  };
}

export async function forceLogoutUserSessions(userId: string) {
  await db.update(sessions).set({ status: "force_logged_out", lastSeenAt: now() }).where(and(eq(sessions.userId, userId), eq(sessions.status, "active")));
  await db.insert(auditLogs).values({
    userId,
    actorType: "system",
    eventType: "auth.sessions.force_logout",
    description: "A privileged platform action force-logged out active sessions for the selected user.",
    riskLevel: "medium",
    metadata: { serverSideRbacRequired: true, secretsDisplayed: false },
  });
}

export async function recordEmailQueued(userId: string, toEmail: string, subject: string, templateKey: string, metadata: Record<string, string | number | boolean>) {
  await db.insert(emailMessages).values({ userId, toEmail, subject, templateKey, status: "queued", metadata });
}

export async function getSanitizedPlatformOverview() {
  const snapshot = await getFoysalOsSnapshot();
  return {
    counts: snapshot.counts,
    metrics: snapshot.platformMetrics,
    health: snapshot.healthChecks,
    featureFlags: snapshot.featureFlags,
    modules: snapshot.modules,
    secretsDisplayed: false,
    policy: "Super Owner visibility is authorized, audited, and never includes passwords, hashes, API secrets, OAuth secrets, access tokens, or refresh tokens.",
  };
}
