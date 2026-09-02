import JSZip from "jszip";

export const platformOwners = [
  {
    role: "Owner / Super Owner",
    email: "foysalahmed.dm23@gmail.com",
    note: "Owner email normalized to Gmail spelling from company details; verify before production login/email routing.",
  },
  {
    role: "Admin",
    email: "ff3841087@gmail.com",
    note: "Admin account should use RBAC and 2FA before production access.",
  },
  {
    role: "Moderator",
    email: "hif4939@gmail.com",
    note: "Moderator access should be limited to review/quality/safety permissions.",
  },
];

export const fiftyFutureFeatures = [
  "Native Windows desktop app wrapper with auto-update",
  "macOS desktop app wrapper",
  "Android wrapper through Capacitor/TWA",
  "iOS wrapper through Capacitor/PWA policy path",
  "Chrome extension companion for meeting/context capture",
  "Edge extension companion",
  "Google Sheets OAuth spreadsheet picker",
  "Gmail OAuth multi-user sending",
  "Email provider queue workers",
  "Bounce/complaint webhook processor",
  "WhatsApp Business Cloud API templates",
  "WhatsApp opt-in/opt-out center",
  "n8n webhook execution with signed callbacks",
  "n8n marketplace workflow installer",
  "Redis/queue-backed background workers",
  "Object storage for production uploads",
  "Backup and restore test runner",
  "Payment checkout with Stripe/SSLCommerz/Paddle",
  "Payment webhook verification",
  "Refund and failed payment workflow",
  "Lead detail editable 360° tabs",
  "Advanced import mapping correction UI",
  "Saved lead views and segments",
  "Bulk action approval center",
  "PDF report export",
  "CSV/XLSX full export",
  "Deep website crawler provider integration",
  "Core Web Vitals provider integration",
  "Google Search Console integration",
  "GA4 integration",
  "Google Business Profile integration",
  "Google Ads integration",
  "Meta Ads integration",
  "LinkedIn/TikTok tracking connectors",
  "Backlink provider integration",
  "Rank tracking provider integration",
  "OCR/vision model integration",
  "PDF/DOCX/PPTX rich extraction provider",
  "Video transcription provider",
  "Live meeting browser audio companion",
  "Speech-to-text provider",
  "Text-to-speech provider",
  "Translation provider",
  "Call center telephony provider",
  "AI provider router adapters",
  "AI consensus engine with real model calls",
  "AI cost ledger and alerting",
  "Enterprise SSO/SAML/OIDC",
  "Audit log export and retention policy",
  "Real API request/error telemetry",
  "Customer/client portal hardening",
  "White-label custom domain wizard",
  "Marketplace billing/add-ons",
  "Mobile-first quick action command palette",
  "Accessibility audit automation",
  "SEO-ready public blog/RSS feed",
];

export const missingForWorldClass = [
  "Permanent production domain env configuration for APP_URL/PUBLIC_URL/API_URL/OAUTH_CALLBACK_URL/WEBHOOK_URL",
  "Real AI provider credentials and tested adapters for generative AI execution",
  "Real email provider credentials and tested send/webhook adapters",
  "Official WhatsApp Business/API configuration",
  "Google OAuth app for Sheets/Gmail/Calendar/Meet/GSC/GA4/GBP",
  "n8n hosted instance with signed webhook execution",
  "Payment provider credentials and webhook verification",
  "Production file storage and backup infrastructure",
  "Telemetry/monitoring provider for request volume, errors, traces and uptime",
  "Native app store signing/publishing pipeline for Windows/macOS/iOS/Android if required",
];

export const revenuePlaybook = [
  "Sell FOYSAL IT lead intelligence as a monthly SaaS subscription.",
  "Offer agency plan with client portal, reports, audits and outreach automation.",
  "Charge setup fees for Google/Meta/GMB/Analytics/n8n integrations.",
  "Sell audit credits for website/SEO/local SEO/ads opportunity reports.",
  "Offer managed service upsells: SEO, Local SEO, Meta Ads, Google Ads, YouTube SEO, Backlink Building, Analytics Setup.",
  "Add AI employee packs by department: SEO pack, Sales pack, Call Center pack, Support pack.",
  "Add white-label agency licensing for client portal and branded reports.",
  "Add per-seat human team pricing and usage-based AI/workflow pricing.",
  "Add paid exports: professional audit PDF, monthly client report, sales opportunity report.",
  "Add enterprise support, SSO, custom limits and dedicated onboarding.",
];

function envExample() {
  return `# FOYSAL IT OS production environment\nAPP_URL=https://foysalit.com\nPUBLIC_URL=https://foysalit.com\nAPI_URL=https://foysalit.com/api\nOAUTH_CALLBACK_URL=https://foysalit.com/api/auth/oauth/callback\nWEBHOOK_URL=https://foysalit.com/api/webhooks\nDATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE\n\n# AI providers - configure only real tested providers\nAI_API_KEY=\nOPENAI_API_KEY=\nANTHROPIC_API_KEY=\nGOOGLE_AI_API_KEY=\n\n# n8n backbone\nN8N_WEBHOOK_URL=\nN8N_API_KEY=\n\n# Email\nSMTP_HOST=\nSMTP_PORT=587\nSMTP_USER=\nSMTP_PASS=\nRESEND_API_KEY=\n\n# Google OAuth\nGOOGLE_CLIENT_ID=\nGOOGLE_CLIENT_SECRET=\n\n# WhatsApp Business\nWHATSAPP_ACCESS_TOKEN=\nWHATSAPP_PHONE_NUMBER_ID=\nWHATSAPP_VERIFY_TOKEN=\n\n# Payments\nSTRIPE_SECRET_KEY=\nSTRIPE_WEBHOOK_SECRET=\nSSLCOMMERZ_STORE_ID=\nSSLCOMMERZ_STORE_PASSWORD=\nPADDLE_API_KEY=\nPADDLE_WEBHOOK_SECRET=\n\n# Storage / Monitoring\nSTORAGE_BUCKET=\nS3_BUCKET=\nSENTRY_DSN=\nUPTIME_WEBHOOK_URL=\n`;
}

function powershellInstallScript() {
  return `# FOYSAL IT OS - Windows / Laptop / PC install helper\n# Run in PowerShell as normal user. Review before execution.\n\nWrite-Host "FOYSAL IT OS setup starting..." -ForegroundColor Magenta\n\nif (-not (Get-Command node -ErrorAction SilentlyContinue)) {\n  Write-Host "Node.js is required. Install Node.js 22 LTS from https://nodejs.org/" -ForegroundColor Yellow\n  exit 1\n}\n\nif (-not (Test-Path ".env")) {\n  Copy-Item ".env.production.example" ".env"\n  Write-Host "Created .env from .env.production.example. Edit secrets before production." -ForegroundColor Yellow\n}\n\nnpm install\nnpx next typegen\nnpm exec tsc -- --noEmit --pretty false\nnpm run build\n\nWrite-Host "Build complete. For production use a managed host such as Vercel/Node server with PostgreSQL, HTTPS, secure env vars and process manager." -ForegroundColor Green\nWrite-Host "Do not hard-code preview URLs. Set APP_URL/PUBLIC_URL/API_URL to your permanent domain." -ForegroundColor Yellow\n`;
}

function bashInstallScript() {
  return `#!/usr/bin/env bash\nset -euo pipefail\necho "FOYSAL IT OS setup starting..."\nif ! command -v node >/dev/null 2>&1; then\n  echo "Node.js 22 LTS is required."\n  exit 1\nfi\nif [ ! -f .env ]; then\n  cp .env.production.example .env\n  echo "Created .env from .env.production.example. Edit secrets before production."\nfi\nnpm install\nnpx next typegen\nnpm exec tsc -- --noEmit --pretty false\nnpm run build\necho "Build complete. Set permanent HTTPS domain env vars before production."\n`;
}

function extensionManifest() {
  return JSON.stringify(
    {
      manifest_version: 3,
      name: "FOYSAL IT Companion",
      version: "0.1.0",
      description: "Browser companion starter for FOYSAL IT meeting/context workflows. Requires production authorization before capture.",
      permissions: ["activeTab", "storage", "scripting"],
      host_permissions: ["https://meet.google.com/*", "https://teams.microsoft.com/*", "https://zoom.us/*"],
      action: { default_title: "FOYSAL IT" },
      background: { service_worker: "background.js" },
      content_scripts: [
        {
          matches: ["https://meet.google.com/*", "https://teams.microsoft.com/*", "https://zoom.us/*"],
          js: ["content.js"],
        },
      ],
    },
    null,
    2,
  );
}

function extensionBackground() {
  return `chrome.runtime.onInstalled.addListener(() => {\n  console.log("FOYSAL IT Companion installed. Configure production API URL before use.");\n});\n`;
}

function extensionContent() {
  return `// FOYSAL IT Companion starter.\n// This does NOT capture audio or private meeting content automatically.\n// Real capture requires explicit permission, legal compliance, browser capability, and production API authorization.\nconsole.log("FOYSAL IT Companion ready: integration required before meeting intelligence capture.");\n`;
}

export async function buildWindowsPackageZip() {
  const zip = new JSZip();
  zip.file("README.md", `# FOYSAL IT OS Windows/PC Package\n\nThis package contains install scripts, production env template, deployment checklist, and Chrome extension starter files.\n\nIt does not include secrets. It does not claim native app store publication.\n\nUse this for Windows/laptop/PC setup, PowerShell build, and production deployment planning.\n`);
  zip.file("install.ps1", powershellInstallScript());
  zip.file("install.sh", bashInstallScript());
  zip.file(".env.production.example", envExample());
  zip.file("DEPLOYMENT-CHECKLIST.md", `# Production Checklist\n\n- Set permanent domain: APP_URL/PUBLIC_URL/API_URL/OAUTH_CALLBACK_URL/WEBHOOK_URL\n- Configure PostgreSQL DATABASE_URL\n- Configure AI provider adapters if needed\n- Configure n8n webhook/API\n- Configure email provider and test send/webhooks\n- Configure WhatsApp Business API before WhatsApp sending\n- Configure payment provider before checkout/payment success\n- Configure object storage and backups\n- Configure monitoring/telemetry\n- Run: npx next typegen\n- Run: npm exec tsc -- --noEmit --pretty false\n- Run: npm run build\n- Test auth, imports, audits, outreach approval, integrations, payments, backups\n`);
  zip.folder("chrome-extension-starter")?.file("manifest.json", extensionManifest());
  zip.folder("chrome-extension-starter")?.file("background.js", extensionBackground());
  zip.folder("chrome-extension-starter")?.file("content.js", extensionContent());
  zip.file("FUTURE-50.md", fiftyFutureFeatures.map((item, index) => `${index + 1}. ${item}`).join("\n"));
  zip.file("REVENUE-PLAYBOOK.md", revenuePlaybook.map((item, index) => `${index + 1}. ${item}`).join("\n"));
  zip.file("OWNER-ACCOUNTS.md", platformOwners.map((owner) => `- ${owner.role}: ${owner.email} — ${owner.note}`).join("\n"));
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

export function getDistributionOverview() {
  return {
    ownerAccounts: platformOwners,
    downloads: [
      { name: "Windows/PC install package", url: "/api/download/windows-package", status: "Available" },
      { name: "Chrome extension starter files", url: "/api/download/windows-package", status: "Included in ZIP - Integration Required before capture" },
      { name: "Production env template", url: "/api/download/windows-package", status: "Included in ZIP" },
    ],
    missingForWorldClass,
    fiftyFutureFeatures,
    revenuePlaybook,
    appTypes: [
      { type: "Responsive SaaS Web App", status: "Working" },
      { type: "PWA for Windows/Laptop/PC", status: "Configured" },
      { type: "PWA for Android/iOS", status: "Configured with platform limitations" },
      { type: "Native Windows installer", status: "Future - Tauri/Electron wrapper required" },
      { type: "Chrome/Edge browser extension", status: "Starter package available; production extension requires build/signing/publishing" },
      { type: "Offline desktop database mode", status: "Future - local sync architecture required" },
    ],
  };
}
