import { getDeepHealthSnapshot, getGapAnalysis, getLiveMonitoringSnapshot } from "@/lib/platform-observability";
import { getAIWorkforceSnapshot } from "@/lib/ai-workforce";
import { getLeadPlatformSnapshot } from "@/lib/lead-intelligence";

function envPresent(keys: string[]) {
  return keys.some((key) => Boolean(process.env[key]));
}

function firstEnv(keys: string[]) {
  return keys.find((key) => Boolean(process.env[key]));
}

export function getProductionUrls() {
  const appUrl = process.env.APP_URL || process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || null;
  const apiUrl = process.env.API_URL || (appUrl ? `${appUrl.replace(/\/$/, "")}/api` : null);
  const oauthCallbackUrl = process.env.OAUTH_CALLBACK_URL || (appUrl ? `${appUrl.replace(/\/$/, "")}/api/auth/oauth/callback` : null);
  const webhookUrl = process.env.WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || null;

  return {
    appUrl,
    apiUrl,
    oauthCallbackUrl,
    webhookUrl,
    permanentDomainConfigured: Boolean(appUrl && /^https:\/\//i.test(appUrl) && !/localhost|e2b|preview|netlify|bolt/i.test(appUrl)),
    recommendation: "Set APP_URL, PUBLIC_URL, API_URL, OAUTH_CALLBACK_URL and WEBHOOK_URL to the permanent HTTPS domain such as https://foysalit.com after deployment.",
  };
}

export function getPaymentProviderStatus() {
  const providers = [
    { key: "stripe", name: "Stripe", configured: envPresent(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]), requiredEnv: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
    { key: "sslcommerz", name: "SSLCommerz", configured: envPresent(["SSLCOMMERZ_STORE_ID", "SSLCOMMERZ_STORE_PASSWORD"]), requiredEnv: ["SSLCOMMERZ_STORE_ID", "SSLCOMMERZ_STORE_PASSWORD"] },
    { key: "paddle", name: "Paddle", configured: envPresent(["PADDLE_API_KEY", "PADDLE_WEBHOOK_SECRET"]), requiredEnv: ["PADDLE_API_KEY", "PADDLE_WEBHOOK_SECRET"] },
    { key: "manual", name: "Manual Invoice / Bank / bKash workflow", configured: false, requiredEnv: [] },
  ];

  const active = providers.find((provider) => provider.configured);
  return {
    status: active ? "Configured - Test Required" : "Integration Required",
    activeProvider: active?.name ?? null,
    providers,
    safety: [
      "Never store raw card data",
      "Use provider tokenization",
      "Verify payment webhooks server-side",
      "Owner/admin authorization required for refunds and billing changes",
      "No fake payment success responses",
    ],
  };
}

export function getAppDistributionStatus() {
  return {
    web: { status: "Working", note: "Next.js responsive web app is available now." },
    pwa: { status: "Configured", note: "Manifest and service worker provide installable/offline shell support." },
    windows: { status: "PWA Ready", note: "Install from Chromium/Edge as a desktop app; native Windows wrapper can be added later with Tauri/Electron." },
    mac: { status: "PWA Ready", note: "Install from supported browser; native macOS wrapper can be added later." },
    ios: { status: "PWA Ready", note: "Add to Home Screen from Safari; push/background limitations depend on iOS/browser support." },
    android: { status: "PWA Ready", note: "Installable from Chrome; native Play Store wrapper can be added later if needed." },
    offline: { status: "Basic Offline Shell", note: "Static shell/offline page is cached. Dynamic database/API operations require network." },
  };
}

export async function getProfessionalStrategyAudit() {
  const [gap, health, monitoring, workforce, leadPlatform] = await Promise.all([
    getGapAnalysis(),
    getDeepHealthSnapshot(),
    getLiveMonitoringSnapshot(),
    getAIWorkforceSnapshot(),
    getLeadPlatformSnapshot(),
  ]);

  const repoInspiredCoverage = [
    { area: "App Router structure", status: "Working", current: "Routes exist for public site, dashboard, Jarvis, lead intelligence, AI workforce, Super Owner and APIs." },
    { area: "Account/auth pages", status: "Partial", current: "Auth APIs work; dedicated rich UI pages can be upgraded beyond current public info pages." },
    { area: "Admin/Super Owner", status: "Working", current: "Super Owner + platform audit + monitoring + User 360 are implemented." },
    { area: "Agents/AI workforce", status: "Working Framework", current: `${workforce.counts.aiEmployees} AI employee records with tasks, approvals, activity and provider states.` },
    { area: "Command/Jarvis", status: "Working", current: "Jarvis commands summarize actual workspace lead/finance/server data." },
    { area: "Leads/import/audit/outreach", status: "Working", current: `${leadPlatform.counts.leads} leads, ${leadPlatform.counts.audits} audits, ${leadPlatform.counts.opportunities} opportunities in database.` },
    { area: "Gmail/Email Robot", status: envPresent(["SMTP_HOST", "RESEND_API_KEY"]) ? "Configured - Test Required" : "Integration Required", current: `Server env detected: ${firstEnv(["SMTP_HOST", "RESEND_API_KEY"]) ?? "none"}.` },
    { area: "Google Sheets private OAuth", status: envPresent(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]) ? "Configured - Test Required" : "Integration Required", current: "Public CSV import attempt exists; private picker requires OAuth." },
    { area: "n8n backbone", status: envPresent(["N8N_WEBHOOK_URL", "N8N_API_KEY"]) ? "Configured - Test Required" : "Integration Required", current: "n8n workflow records and setup/test API exist." },
    { area: "Payment API", status: getPaymentProviderStatus().status, current: "Payment provider status API added; no fake payment success." },
    { area: "PWA / desktop/mobile app", status: "PWA Ready", current: "Installable responsive web app with offline shell; native wrappers are future optional." },
    { area: "Permanent domain", status: getProductionUrls().permanentDomainConfigured ? "Configured" : "Needs Production Env", current: getProductionUrls().appUrl ?? "APP_URL/PUBLIC_URL not set." },
  ];

  const professionalUpdates = [
    "Replace text-heavy landing blocks with shorter premium hero sections, KPI proof cards, screenshots, and workflow diagrams.",
    "Create richer dedicated Login/Register/Forgot/Reset pages instead of only API/public-info pages.",
    "Add lead detail route with editable 360° tabs: audit, SEO, local SEO, ads, tracking, outreach, tasks, notes, timeline.",
    "Add import mapping correction UI for user-adjusted column mapping before import.",
    "Add export endpoints for PDF and CSV reports using actual stored report data.",
    "Add real SMTP/Resend/Gmail OAuth adapter after credentials are configured and tested.",
    "Add n8n webhook execution after permanent domain and webhook URL are configured.",
    "Add payment checkout/webhook only after Stripe/SSLCommerz/Paddle credentials are supplied.",
    "Add production object storage for files and backups.",
    "Add request/error telemetry provider for real API traffic charts.",
  ];

  const marketDemand = [
    { segment: "Digital marketing agencies", demand: "Very High", why: "Need lead finding, audits, outreach, reporting, client portal and automation." },
    { segment: "SEO/local SEO freelancers", demand: "High", why: "Website audit + service matching + outreach saves time and improves sales workflow." },
    { segment: "Small business owners", demand: "High", why: "Want simple business audit, marketing recommendations and follow-up automation." },
    { segment: "B2B sales teams", demand: "High", why: "Lead scoring, research, outreach approval and pipeline management directly support revenue." },
    { segment: "Call center/support teams", demand: "Medium-High", why: "Voice/call AI is valuable but requires real providers and compliance setup." },
    { segment: "Enterprise teams", demand: "Medium", why: "Will require SSO, audit logs, data retention, security review and SLAs before buying." },
  ];

  return {
    product: "FOYSAL IT OS",
    positioning: "One platform for AI-powered lead intelligence, digital audit, marketing opportunity, outreach automation, sales management and AI-human workforce operations.",
    repoReference: "https://github.com/soiyadplaza-tech/ai-marketing-saas-platform",
    repoInspiredCoverage,
    professionalUpdates,
    marketDemand,
    domain: getProductionUrls(),
    payment: getPaymentProviderStatus(),
    apps: getAppDistributionStatus(),
    health,
    monitoring,
    gap,
    verdict: "The current app is functional in core local/database areas, but 100% production readiness requires real credentials, permanent domain, email/payment/n8n/provider testing, storage, and telemetry. No external success is claimed until configured and tested.",
  };
}
