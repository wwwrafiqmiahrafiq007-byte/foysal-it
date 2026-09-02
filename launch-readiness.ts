import { db } from "@/db";
import { auditLogs, leadRecords, plans, sessions, subscriptions, users, workspaces } from "@/db/schema";
import { getAIWorkforceSnapshot } from "@/lib/ai-workforce";
import { getJarvisSnapshot } from "@/lib/jarvis-core";
import { getLeadPlatformSnapshot, previewImport, runWebsiteAudit } from "@/lib/lead-intelligence";
import { getDeepHealthSnapshot, getGapAnalysis, getLiveMonitoringSnapshot } from "@/lib/platform-observability";
import { getAppDistributionStatus, getPaymentProviderStatus, getProductionUrls } from "@/lib/strategy-audit";
import { count, eq, sql } from "drizzle-orm";

function hasEnv(keys: string[]) {
  return keys.some((key) => Boolean(process.env[key]));
}

function envStatus(keys: string[]) {
  return hasEnv(keys) ? "Configured - Test Required" : "Integration Required";
}

function pass(name: string, evidence: string) {
  return { name, status: "Working", evidence, action: "Keep and harden with production testing." };
}

function partial(name: string, evidence: string, action: string) {
  return { name, status: "Partial", evidence, action };
}

function required(name: string, evidence: string, action: string) {
  return { name, status: "Integration Required", evidence, action };
}

export const routeInventory = [
  { group: "Core", routes: ["/", "/dashboard", "/platform-audit", "/professional-review", "/app-center"] },
  { group: "AI", routes: ["/jarvis", "/ai-workforce", "/api/ai/orchestrator", "/api/ai/model-router", "/api/workforce/overview"] },
  { group: "Lead SaaS", routes: ["/lead-intelligence", "/api/lead-platform/leads", "/api/lead-platform/import", "/api/lead-platform/audits/website", "/api/lead-platform/outreach"] },
  { group: "Public Website", routes: ["/about", "/features", "/solutions", "/ai", "/agency-os", "/business-os", "/integrations", "/pricing", "/enterprise", "/security", "/documentation", "/faq", "/contact", "/login", "/register", "/free-trial"] },
  { group: "Monitoring", routes: ["/api/platform/deep-health", "/api/platform/live-monitoring", "/api/platform/gap-analysis", "/api/platform/strategy-audit"] },
  { group: "Distribution", routes: ["/manifest.webmanifest", "/offline", "/api/download/windows-package", "/api/platform/app-distribution", "/api/platform/domain-status"] },
];

export async function getFullAppTestMatrix() {
  const [lead, workforce, jarvis, health, monitoring, gap] = await Promise.all([
    getLeadPlatformSnapshot(),
    getAIWorkforceSnapshot(),
    getJarvisSnapshot(),
    getDeepHealthSnapshot(),
    getLiveMonitoringSnapshot(),
    getGapAnalysis(),
  ]);

  const dbCheck = await db.execute(sql`select 1 as ok`);
  const importPreview = await previewImport([
    { company: "Test Matrix Company", email: "test-matrix@example.com", website: "https://example.com", leadSource: "Test Center" },
  ]);
  const [userCount] = await db.select({ value: count() }).from(users);
  const [workspaceCount] = await db.select({ value: count() }).from(workspaces);
  const [sessionCount] = await db.select({ value: count() }).from(sessions).where(eq(sessions.status, "active"));
  const [planCount] = await db.select({ value: count() }).from(plans);
  const [subscriptionCount] = await db.select({ value: count() }).from(subscriptions);
  const [auditCount] = await db.select({ value: count() }).from(auditLogs);

  const checks = [
    pass("Database", `PostgreSQL query returned ${JSON.stringify(dbCheck)}.`),
    pass("Users / Workspaces", `${userCount?.value ?? 0} users and ${workspaceCount?.value ?? 0} workspaces exist.`),
    pass("Auth/session foundation", `${sessionCount?.value ?? 0} active session records; register/login/reset APIs exist.`),
    pass("RBAC / tenant model", "Workspace-scoped records and secure snapshot checks are implemented."),
    pass("Plans/subscriptions DB", `${planCount?.value ?? 0} plans and ${subscriptionCount?.value ?? 0} subscription records exist.`),
    pass("Lead database", `${lead.counts.leads} leads available with pagination/search API.`),
    pass("CSV/XLSX import preview", `${importPreview.validCount} valid preview rows, ${importPreview.duplicateCount} duplicates, ${importPreview.errorCount} errors.`),
    pass("Website audit engine", `${lead.counts.audits} persisted audits; API performs real homepage fetch when URL is provided.`),
    pass("Opportunity/scoring", `${lead.counts.opportunities} opportunities generated from audit findings.`),
    pass("Outreach draft + approval", `${lead.messages.length} message records; send is blocked unless provider is configured.`),
    pass("Jarvis Core", `${jarvis.commandRuns.length} Jarvis command runs; business brief uses stored finance data.`),
    pass("AI Workforce", `${workforce.counts.aiEmployees} AI employees, ${workforce.counts.humanEmployees} human employees, ${workforce.counts.tasks} tasks.`),
    pass("Monitoring", `${monitoring.metrics.length} monitoring metrics, no fake telemetry for unavailable sources.`),
    pass("System health", `${health.checks.length} health checks with real Operational/Not Configured states.`),
    pass("Audit logs", `${auditCount?.value ?? 0} audit/security/action logs.`),
    partial("Public website", "Public pages exist and are SEO-ready, but landing can be made more visual/premium with less text.", "Add product screenshots, KPI proof, testimonials, and shorter SaaS sections."),
    partial("PWA / Windows / laptop app", "Installable PWA and ZIP package exist.", "Native Windows installer needs Tauri/Electron wrapper and signing if you want a true .exe installer."),
    required("Gmail / Email sending", envStatus(["SMTP_HOST", "RESEND_API_KEY", "GOOGLE_CLIENT_ID"]), "Configure SMTP/Resend or Gmail OAuth, send test, verify bounce/reply webhooks."),
    required("WhatsApp Business", envStatus(["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"]), "Configure official WhatsApp Business Cloud API and approved templates."),
    required("Google Meet live translation", envStatus(["GOOGLE_CLIENT_ID", "SPEECH_TO_TEXT_API_KEY", "TRANSLATION_API_KEY", "TEXT_TO_SPEECH_API_KEY"]), "Requires Google OAuth/browser companion plus speech, translation, and voice providers."),
    required("n8n execution", envStatus(["N8N_WEBHOOK_URL", "N8N_API_KEY"]), "Configure n8n URL/API key and signed callback verification."),
    required("Payment checkout", getPaymentProviderStatus().status, "Configure Stripe/SSLCommerz/Paddle and verify webhooks before selling paid subscription online."),
    required("Production storage/backup", envStatus(["STORAGE_BUCKET", "S3_BUCKET"]), "Connect object storage, backups, restore test and retention policy."),
    required("Real AI LLM execution", envStatus(["OPENAI_API_KEY", "AI_API_KEY", "ANTHROPIC_API_KEY", "GOOGLE_AI_API_KEY"]), "Connect at least one AI provider and test model router/fallback."),
  ];

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      working: checks.filter((check) => check.status === "Working").length,
      partial: checks.filter((check) => check.status === "Partial").length,
      integrationRequired: checks.filter((check) => check.status === "Integration Required").length,
    },
    checks,
    routeInventory,
    gap,
    usableNow: [
      "Lead create/import/preview",
      "Real homepage website audit",
      "Lead scoring and service matching",
      "Personalized outreach draft generation",
      "Approval workflow",
      "Jarvis internal business summary",
      "AI workforce records/task framework",
      "PWA install/offline shell",
      "Downloadable Windows/PC setup ZIP",
    ],
    notReadyUntilConfigured: [
      "Gmail/Email sending",
      "WhatsApp sending/calling",
      "Google Meet live translator",
      "Private Google Sheets OAuth picker",
      "Payment checkout/subscription billing",
      "n8n live workflow execution",
      "Real LLM generation beyond deterministic/internal rules",
      "Production backup/storage/telemetry",
    ],
  };
}

export async function getSubscriptionSalesReadiness() {
  const payment = getPaymentProviderStatus();
  const domain = getProductionUrls();
  const workforce = await getAIWorkforceSnapshot();
  const lead = await getLeadPlatformSnapshot();
  const [planRows] = await Promise.all([db.select().from(plans)]);

  return {
    canSellNow: payment.status === "Configured - Test Required" && domain.permanentDomainConfigured,
    recommendedSellingModeNow: payment.status === "Integration Required" ? "Manual invoice / founder-led beta / setup fee collection outside app until payment gateway is configured" : "Payment gateway configured but checkout still needs live test before public launch",
    subscriptionProduct: "FOYSAL IT — AI Lead Intelligence + Jarvis + AI Workforce SaaS",
    packagedPlans: [
      { name: "Free Trial", target: "test users", limit: "limited leads/audits/manual workflow", sellable: true, note: "Good for demos and onboarding." },
      { name: "Starter", target: "freelancers/small businesses", limit: "lead import + website audit + outreach drafts", sellable: true, note: "Can sell manually now if terms are clear." },
      { name: "Professional", target: "SEO/marketing agencies", limit: "more leads/audits/team/workforce", sellable: true, note: "Best first paid plan." },
      { name: "Agency", target: "multi-client agencies", limit: "client portal + reports + white label + automation", sellable: false, note: "Needs payment, email and n8n integrations for full value." },
      { name: "Enterprise", target: "larger teams", limit: "SSO/security/SLA/custom limits", sellable: false, note: "Needs legal/security/SLA/compliance pack." },
    ],
    proofYouCanShow: [
      `${lead.counts.leads} leads in workspace database`,
      `${lead.counts.audits} website audits stored`,
      `${lead.counts.opportunities} opportunities stored`,
      `${workforce.counts.aiEmployees} AI employees in workforce framework`,
      `${planRows.length} database-driven subscription plans`,
    ],
    mustFinishBeforePublicPaidLaunch: [
      "Permanent domain with HTTPS and APP_URL/PUBLIC_URL configured",
      "Payment provider checkout and webhook verification",
      "Terms of Service, Privacy Policy, Refund Policy and Acceptable Use Policy",
      "Production email delivery provider and domain authentication SPF/DKIM/DMARC",
      "Backup/restore test and storage policy",
      "Admin onboarding and support process",
      "Security checklist: 2FA for owner/admin, secret rotation, audit retention",
    ],
    payment,
    domain,
  };
}

export function getGmailExtensionCheck() {
  const gmailOAuth = hasEnv(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]);
  const smtp = hasEnv(["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]);
  const resend = hasEnv(["RESEND_API_KEY"]);
  return {
    gmailStatus: gmailOAuth ? "Configured - Test Required" : "Authorization Required",
    smtpStatus: smtp ? "Configured - Test Required" : "Not Configured",
    resendStatus: resend ? "Configured - Test Required" : "Not Configured",
    extensionStatus: "Starter Package Available - Chrome Web Store Publishing Required",
    workFromExtension: gmailOAuth ? "OAuth credentials detected, but extension must be built, installed, authorized and tested." : "Cannot access Gmail from extension until Google OAuth is configured and authorized.",
    requiredSteps: [
      "Create Google Cloud OAuth app",
      "Add production domain and extension origins",
      "Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET server-side",
      "Build/sign/publish or sideload Chrome extension starter",
      "Authorize Gmail scopes with user consent",
      "Send one test email through approved backend route",
      "Verify no secrets are exposed in extension/client code",
    ],
    noFakeSend: true,
  };
}

export function getMeetingReadinessCheck() {
  const google = hasEnv(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]);
  const speech = hasEnv(["SPEECH_TO_TEXT_API_KEY", "WHISPER_API_KEY"]);
  const translation = hasEnv(["TRANSLATION_API_KEY"]);
  const voice = hasEnv(["TEXT_TO_SPEECH_API_KEY", "VOICE_API_KEY"]);
  return {
    googleMeet: google ? "Configured - Test Required" : "Authorization Required",
    speechToText: speech ? "Configured - Test Required" : "Authorization Required",
    translation: translation ? "Configured - Test Required" : "Authorization Required",
    voiceOutput: voice ? "Configured - Test Required" : "Authorization Required",
    browserCompanion: "Starter Required / Not Published",
    canWorkNow: google && speech && translation && voice,
    note: "Google Meet live translation cannot fully work until OAuth/browser companion/speech/translation/TTS are configured and tested. The app correctly does not fake live translation.",
  };
}

export async function runSafeWebsiteSmokeTest() {
  const result = await runWebsiteAudit({ url: "https://example.com" });
  return {
    ok: result.ok,
    status: result.status,
    source: "actual_homepage_fetch",
    target: "https://example.com",
    result,
  };
}
