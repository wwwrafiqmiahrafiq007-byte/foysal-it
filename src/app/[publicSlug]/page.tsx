import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InteractiveAuthPortal } from "@/components/InteractiveAuthPortal";

export const dynamic = "force-dynamic";

const pages: Record<string, { title: string; eyebrow: string; description: string; items: string[]; cta: string; href: string }> = {
  about: {
    eyebrow: "About FOYSAL IT",
    title: "AI-powered growth systems for businesses, agencies and sales teams.",
    description: "FOYSAL IT turns raw business information into qualified opportunities through lead intelligence, website audits, service matching, outreach approval, and sales management.",
    items: ["Company: FOYSAL IT", "WhatsApp: 01732011233", "Email: fotysalahmed.dm23@gmail.com", "Website: sites.google.com/view/foysal-it"],
    cta: "Open Lead Intelligence",
    href: "/lead-intelligence",
  },
  features: {
    eyebrow: "Features",
    title: "Lead intelligence, audit, outreach, pipeline and Jarvis automation in one workspace.",
    description: "Functional features use PostgreSQL, local parsing, real website fetch/audit, and approval-gated outreach. External services clearly show Integration Required until configured.",
    items: ["+ ADD DATA", "CSV/XLSX import", "Website audit", "Lead scoring", "Opportunity engine", "Outreach drafts", "Approval workflow", "Sales pipeline"],
    cta: "Try the Platform",
    href: "/lead-intelligence",
  },
  solutions: {
    eyebrow: "Solutions",
    title: "For SEO, local SEO, ads, social media, YouTube and analytics service opportunities.",
    description: "FOYSAL IT maps detected problems to SEO Optimization, Meta Ads, Google Ads, Social Media Marketing, YouTube SEO, Local SEO & Map Ranking, Backlink Building and Analytics Setup.",
    items: ["SEO Optimization", "Meta Ads Management", "Google Ads", "Social Media Marketing", "YouTube SEO", "Local SEO & Map Ranking", "Backlink Building", "Analytics Setup"],
    cta: "View Services Flow",
    href: "/lead-intelligence",
  },
  ai: {
    eyebrow: "AI",
    title: "Jarvis and NOVA coordinate lead research, website audits, outreach and business actions.",
    description: "AI recommendations show reason, evidence and confidence. If an AI provider is unavailable, the system reports the problem instead of fabricating a result.",
    items: ["Lead classification", "Opportunity detection", "Lead scoring", "Outreach generation", "Command center", "Report generation", "AI memory", "Human approval"],
    cta: "Open Jarvis Core",
    href: "/jarvis",
  },
  "agency-os": {
    eyebrow: "Agency OS",
    title: "Clients, leads, audits, proposals, reports, billing and team performance.",
    description: "The agency workspace is isolated, permission-aware and connected to CRM, marketing, files, analytics, outreach and finance.",
    items: ["Clients", "Leads", "Projects", "Services", "Team", "Tasks", "Reports", "Client Portal"],
    cta: "Open Unified OS",
    href: "/dashboard",
  },
  "business-os": {
    eyebrow: "Business OS",
    title: "Business profile, products, sales, expenses, profit/loss and customers.",
    description: "Business Brain summarizes stored revenue, expenses, products and operational activity without inventing unavailable analytics.",
    items: ["Business Profile", "Products", "Sales", "Expenses", "Profit/Loss", "Customers", "Automation", "Reports"],
    cta: "Open Jarvis Business Brain",
    href: "/jarvis",
  },
  integrations: {
    eyebrow: "Integrations",
    title: "Connect Google Sheets, Email, WhatsApp, Analytics, Ads, Meta, GBP and n8n.",
    description: "Every integration shows Connected, Disconnected, Connection Error, Reconnect or Test Connection. Secrets remain server-side only.",
    items: ["Google Sheets", "Email Provider", "WhatsApp Business/API", "GA4", "Search Console", "Google Ads", "Meta", "n8n"],
    cta: "View Integration Status",
    href: "/lead-intelligence",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Database-driven plans without hard-coded pricing claims.",
    description: "Plans and entitlements are stored in PostgreSQL so features can be controlled by workspace subscription and server-side checks.",
    items: ["Free", "Starter", "Professional", "Business", "Enterprise", "Workspace subscription", "Usage", "Entitlements"],
    cta: "View Plans",
    href: "/dashboard#billing",
  },
  enterprise: {
    eyebrow: "Enterprise",
    title: "Security, audit logs, roles, permissions, integrations and Super Owner controls.",
    description: "Enterprise features are permission-aware and designed for strict organization isolation, SSO-ready architecture, policy controls and auditability.",
    items: ["RBAC", "Audit Logs", "Security Center", "Feature Flags", "System Health", "User 360", "Workspace Isolation", "API Center"],
    cta: "Open Super Owner",
    href: "/super-owner",
  },
  security: {
    eyebrow: "Security",
    title: "No plaintext passwords, no exposed API secrets, no fake connected states.",
    description: "Authentication, sessions, device management, recovery, rate limiting foundations and audit logs are implemented with server-side storage rules.",
    items: ["Secure password hashing", "HTTP-only cookies", "Rate limiting", "Audit logs", "Recovery", "2FA foundation", "Secret isolation", "Approval gates"],
    cta: "View Build Audit",
    href: "/platform-audit",
  },
  documentation: {
    eyebrow: "Documentation",
    title: "API-ready modules for leads, imports, audits, outreach, Jarvis, workforce, health and monitoring.",
    description: "Use the APIs to create leads, import data, run audits, generate/approve outreach, inspect integrations, manage AI workforce and monitor platform health.",
    items: ["/api/lead-platform/leads", "/api/lead-platform/import", "/api/lead-platform/audits/website", "/api/workforce/overview", "/api/platform/strategy-audit", "/api/platform/deep-health"],
    cta: "Open Professional Review",
    href: "/professional-review",
  },
  faq: {
    eyebrow: "FAQ",
    title: "What works now, what needs integration, and how FOYSAL IT stays honest.",
    description: "Functional features operate through local database/runtime/fetch capabilities. External services show Integration Required until credentials and tests are available.",
    items: ["Does CSV/XLSX import work? Yes.", "Does website audit work? Homepage fetch/audit works.", "Does WhatsApp send? Integration Required.", "Does n8n run? Requires configured n8n webhook/API."],
    cta: "See Full Audit",
    href: "/platform-audit",
  },
  contact: {
    eyebrow: "Contact",
    title: "Talk to FOYSAL IT about SEO, ads, social, local SEO, backlinks and analytics.",
    description: "Reach FOYSAL IT by WhatsApp or email, then use the platform to turn business data into qualified opportunities.",
    items: ["WhatsApp: 01732011233", "Email: fotysalahmed.dm23@gmail.com", "Website: https://sites.google.com/view/foysal-it/", "Services: https://foysalit.base44.app/services"],
    cta: "Open Lead Intelligence",
    href: "/lead-intelligence",
  },
  login: {
    eyebrow: "Login",
    title: "Secure login foundation for FOYSAL IT OS.",
    description: "Use the implemented authentication APIs for password login, session cookies, recovery and verification. OAuth providers remain configurable.",
    items: ["Email/password", "Session cookie", "Recovery", "Audit logs", "OAuth foundation", "2FA foundation"],
    cta: "Open Dashboard",
    href: "/dashboard",
  },
  register: {
    eyebrow: "Register",
    title: "Create account, verify email, auto-activate workspace and start working.",
    description: "Registration stores hashed passwords only, queues verification/welcome email records, and activates verified users automatically.",
    items: ["Create account", "Verify email", "Activate", "Create workspace", "Assign role", "Open dashboard"],
    cta: "Open Dashboard",
    href: "/dashboard",
  },
  "free-trial": {
    eyebrow: "Free Trial",
    title: "Start with a workspace and import your first leads.",
    description: "The current sandbox uses a seeded workspace so you can immediately try lead creation, import preview, website audit and outreach approval.",
    items: ["Manual lead", "CSV import", "XLSX upload", "Website audit", "Lead scoring", "Outreach draft"],
    cta: "Start Trial Workspace",
    href: "/lead-intelligence",
  },
};

export default async function PublicPage({ params }: { params: Promise<{ publicSlug: string }> }) {
  const { publicSlug } = await params;
  const page = pages[publicSlug];
  if (!page) {
    redirect(`/dashboard/${publicSlug}`);
  }

  const isAuth = publicSlug === "login" || publicSlug === "register";

  return (
    <main className="min-h-screen px-5 py-5 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <nav className="glass-panel flex flex-col justify-between gap-4 rounded-[2rem] p-5 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/foysal-it-mark.svg" alt="FOYSAL IT" width={48} height={48} className="rounded-2xl" />
            <div><p className="font-black tracking-[0.18em]">FOYSAL IT</p><p className="text-sm text-white/50">AI SaaS Platform</p></div>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75 hover:bg-white/10 transition">Dashboard</Link>
            <Link href="/lead-intelligence" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75 hover:bg-white/10 transition">Lead Intelligence</Link>
            <Link href="/jarvis" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75 hover:bg-white/10 transition">Jarvis</Link>
            <Link href="/platform-audit" className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#250022] hover:bg-yellow-200 transition">Build Audit</Link>
          </div>
        </nav>

        {isAuth ? (
          <div className="mx-auto max-w-xl glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-200/80">
                  {publicSlug === "login" ? "Account Access" : "Workspace Onboarding"}
                </p>
                <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
                  {publicSlug === "login" ? "Sign In to FOYSAL IT OS" : "Create New Workspace Account"}
                </h1>
              </div>
              <Link
                href={publicSlug === "login" ? "/register" : "/login"}
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                {publicSlug === "login" ? "Create Account →" : "Sign In →"}
              </Link>
            </div>
            <InteractiveAuthPortal initialMode={publicSlug === "login" ? "signin" : "signup"} />
          </div>
        ) : (
          <>
            <section className="glass-panel rounded-[2rem] p-7 md:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.34em] text-yellow-200/75">{page.eyebrow}</p>
              <h1 className="mt-3 max-w-5xl text-5xl font-black tracking-[-0.055em] md:text-7xl">{page.title}</h1>
              <p className="mt-5 max-w-4xl text-lg leading-8 text-white/65">{page.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={page.href} className="rounded-full bg-white px-6 py-3 text-sm font-black text-[#250022] hover:bg-yellow-200 transition">{page.cta}</Link>
                <Link href="/contact" className="rounded-full border border-yellow-200/25 bg-yellow-200/10 px-6 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-200/20 transition">Contact</Link>
              </div>
            </section>
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {page.items.map((item) => <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.055] p-5"><p className="font-bold text-white/85">{item}</p></div>)}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
