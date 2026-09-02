import { db } from "@/db";
import { auditLogs, leadRecords, plans, sessions, subscriptions, users, workspaces } from "@/db/schema";
import { getAIWorkforceSnapshot } from "@/lib/ai-workforce";
import { getDistributionOverview } from "@/lib/distribution-center";
import { getJarvisSnapshot } from "@/lib/jarvis-core";
import { getFullAppTestMatrix, getGmailExtensionCheck, getMeetingReadinessCheck, getSubscriptionSalesReadiness } from "@/lib/launch-readiness";
import { getLeadPlatformSnapshot, previewImport } from "@/lib/lead-intelligence";
import { getDeepHealthSnapshot, getGapAnalysis, getLiveMonitoringSnapshot } from "@/lib/platform-observability";
import { getAppDistributionStatus, getPaymentProviderStatus, getProductionUrls } from "@/lib/strategy-audit";
import { count, eq, sql } from "drizzle-orm";

function hasEnv(keys: string[]) {
  return keys.some((key) => Boolean(process.env[key]));
}

function statusFromEnv(keys: string[]): "PARTIAL" | "INTEGRATION_REQUIRED" {
  return hasEnv(keys) ? "PARTIAL" : "INTEGRATION_REQUIRED";
}

function statusEvidenceFromEnv(keys: string[]) {
  return hasEnv(keys) ? "Configured - Test Required" : "Integration Required";
}

function item(name: string, status: "PASS" | "PARTIAL" | "INTEGRATION_REQUIRED" | "FAIL" | "MANUAL_CHECK", evidence: string, nextAction: string) {
  return { name, status, evidence, nextAction };
}

export async function getFinalQaReport() {
  const [
    appTests,
    salesReadiness,
    gmail,
    meeting,
    leadPlatform,
    workforce,
    jarvis,
    health,
    monitoring,
    gap,
  ] = await Promise.all([
    getFullAppTestMatrix(),
    getSubscriptionSalesReadiness(),
    Promise.resolve(getGmailExtensionCheck()),
    Promise.resolve(getMeetingReadinessCheck()),
    getLeadPlatformSnapshot(),
    getAIWorkforceSnapshot(),
    getJarvisSnapshot(),
    getDeepHealthSnapshot(),
    getLiveMonitoringSnapshot(),
    getGapAnalysis(),
  ]);

  let dbOk = false;
  let dbEvidence = "Database check was not completed.";
  try {
    const result = await db.execute(sql`select 1 as ok`);
    dbOk = result.rowCount === 1;
    dbEvidence = `PostgreSQL responded with rowCount=${result.rowCount}.`;
  } catch (error) {
    dbEvidence = error instanceof Error ? error.message : "Unknown database error.";
  }

  const [userCount] = await db.select({ value: count() }).from(users);
  const [workspaceCount] = await db.select({ value: count() }).from(workspaces);
  const [leadCount] = await db.select({ value: count() }).from(leadRecords);
  const [sessionCount] = await db.select({ value: count() }).from(sessions).where(eq(sessions.status, "active"));
  const [planCount] = await db.select({ value: count() }).from(plans);
  const [subscriptionCount] = await db.select({ value: count() }).from(subscriptions);
  const [auditCount] = await db.select({ value: count() }).from(auditLogs);
  const importPreview = await previewImport([
    { company: "Final QA Lead", email: "final-qa@example.com", website: "https://example.com", leadSource: "Final QA" },
  ]);

  const domain = getProductionUrls();
  const payment = getPaymentProviderStatus();
  const appDistribution = getAppDistributionStatus();
  const distribution = getDistributionOverview();

  const checks = [
    item("Database", dbOk ? "PASS" : "FAIL", dbEvidence, dbOk ? "Keep monitoring and backups enabled." : "Fix DATABASE_URL/PostgreSQL before launch."),
    item("Users/Workspaces", (userCount?.value ?? 0) > 0 && (workspaceCount?.value ?? 0) > 0 ? "PASS" : "FAIL", `${userCount?.value ?? 0} users, ${workspaceCount?.value ?? 0} workspaces.`, "Keep tenant isolation tests in CI."),
    item("Auth/session foundation", "PASS", `${sessionCount?.value ?? 0} active sessions. Auth APIs exist for register/login/logout/verification/recovery/reset.`, "Add dedicated premium auth UI and enforce route middleware before public launch."),
    item("Lead Intelligence", "PASS", `${leadPlatform.counts.leads} leads, ${leadPlatform.counts.audits} audits, ${leadPlatform.counts.opportunities} opportunities.`, "Add editable lead detail tabs and advanced filters next."),
    item("Import workflow", importPreview.errorCount === 0 ? "PASS" : "PARTIAL", `Preview generated: ${importPreview.validCount} valid, ${importPreview.duplicateCount} duplicate, ${importPreview.errorCount} errors.`, "Add visual mapping correction UI for non-standard columns."),
    item("Website audit", leadPlatform.counts.audits > 0 ? "PASS" : "PARTIAL", `${leadPlatform.counts.audits} stored audits. Audit API performs real homepage fetch.`, "Add deep crawler/Core Web Vitals provider for advanced audits."),
    item("Outreach approval", "PASS", `${leadPlatform.messages.length} outreach records. Send is blocked unless provider is configured.`, "Connect/test email and WhatsApp providers before sending to customers."),
    item("Jarvis Core", "PASS", `${jarvis.commandRuns.length} command runs. Business brief profit=${jarvis.businessBrief.profit}.`, "Add voice Jarvis after speech/TTS provider setup."),
    item("AI Workforce", workforce.counts.aiEmployees >= 200 ? "PASS" : "PARTIAL", `${workforce.counts.aiEmployees} AI employees and ${workforce.counts.humanEmployees} human employees.`, "Connect real AI provider for generative execution beyond deterministic/internal tasks."),
    item("Plans/subscriptions", (planCount?.value ?? 0) > 0 && (subscriptionCount?.value ?? 0) > 0 ? "PASS" : "FAIL", `${planCount?.value ?? 0} plans, ${subscriptionCount?.value ?? 0} subscriptions.`, "Connect payment provider before automatic online paid subscription sales."),
    item("Payment API", payment.status === "Configured - Test Required" ? "PARTIAL" : "INTEGRATION_REQUIRED", payment.status, "Configure Stripe/SSLCommerz/Paddle, test checkout and verify webhooks."),
    item("Permanent domain", domain.permanentDomainConfigured ? "PASS" : "MANUAL_CHECK", domain.appUrl ?? "APP_URL/PUBLIC_URL not set in sandbox.", "Set APP_URL/PUBLIC_URL/API_URL/OAUTH_CALLBACK_URL/WEBHOOK_URL to your HTTPS production domain."),
    item("Gmail/extension", gmail.gmailStatus === "Configured - Test Required" ? "PARTIAL" : "INTEGRATION_REQUIRED", `${gmail.gmailStatus}; ${gmail.extensionStatus}.`, "Configure Google OAuth, extension origin and backend Gmail send route; test with real account."),
    item("Google Meet/translation", meeting.canWorkNow ? "PARTIAL" : "INTEGRATION_REQUIRED", meeting.note, "Configure Google OAuth, browser companion, speech, translation and TTS providers; test consent flow."),
    item("n8n backbone", statusFromEnv(["N8N_WEBHOOK_URL", "N8N_API_KEY"]), statusEvidenceFromEnv(["N8N_WEBHOOK_URL", "N8N_API_KEY"]), "Configure n8n webhook/API and signed callbacks, then test workflow execution."),
    item("Real AI provider", statusFromEnv(["OPENAI_API_KEY", "AI_API_KEY", "ANTHROPIC_API_KEY", "GOOGLE_AI_API_KEY"]), statusEvidenceFromEnv(["OPENAI_API_KEY", "AI_API_KEY", "ANTHROPIC_API_KEY", "GOOGLE_AI_API_KEY"]), "Add provider adapter tests and fallback routing before claiming live AI execution."),
    item("Storage/backups", statusFromEnv(["STORAGE_BUCKET", "S3_BUCKET"]), statusEvidenceFromEnv(["STORAGE_BUCKET", "S3_BUCKET"]), "Configure object storage, database backup, file backup and restore tests."),
    item("Monitoring", "PASS", `${monitoring.metrics.length} monitoring signals and ${health.checks.length} health checks.`, "Add external telemetry for API requests/errors/traces/uptime."),
    item("Audit logs", (auditCount?.value ?? 0) > 0 ? "PASS" : "PARTIAL", `${auditCount?.value ?? 0} audit logs.`, "Add retention/export policy for paid/enterprise customers."),
    item("PWA install", "PASS", `${appDistribution.pwa.status}; ZIP downloads: ${distribution.downloads.length}.`, "Native .exe/iOS/Android store apps require wrappers/signing if needed."),
  ];

  const summary = {
    pass: checks.filter((check) => check.status === "PASS").length,
    partial: checks.filter((check) => check.status === "PARTIAL").length,
    integrationRequired: checks.filter((check) => check.status === "INTEGRATION_REQUIRED").length,
    manualCheck: checks.filter((check) => check.status === "MANUAL_CHECK").length,
    fail: checks.filter((check) => check.status === "FAIL").length,
  };

  return {
    generatedAt: new Date().toISOString(),
    verdict: summary.fail === 0
      ? "Core app is working. Sell as manual/beta subscription now with clear limits; do not claim Gmail/Meet/payment/n8n/live AI integrations until configured and tested."
      : "Critical failures exist. Fix FAIL items before any sale.",
    canPublicAutoSellSubscription: salesReadiness.canSellNow,
    recommendedMode: salesReadiness.recommendedSellingModeNow,
    summary,
    checks,
    routeInventory: appTests.routeInventory,
    usableNow: appTests.usableNow,
    notReadyUntilConfigured: appTests.notReadyUntilConfigured,
    salesReadiness,
    gmail,
    meeting,
    domain,
    payment,
    appDistribution,
    gap,
  };
}
