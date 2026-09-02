import type { ReactNode } from "react";
import Image from "next/image";
import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

const authFlow = ["Voice Login", "Microphone Permission", "Voice Verification", "Identity Check", "Risk Check", "Session", "Dashboard"];
const phoneFlow = ["Phone", "OTP Verification", "Name", "Password / Passkey", "Account Type", "Workspace", "Onboarding"];
const subscriptionFlow = ["Workspace", "Subscription", "Plan", "Entitlements", "Backend Feature Access"];
const expiryFlow = ["Active", "Renewal Due", "Grace Period", "Limited Access", "Suspended"];
const vRoadmap = [
  { version: "V1", title: "Launch Foundation", items: "Email, Google, Phone, Password Recovery, Email Verification, Workspace, Session, Security, Subscription" },
  { version: "V1.5", title: "Security Upgrade", items: "Passkey, 2FA, Recovery Codes, Device Management, NOVA AI Help" },
  { version: "V2", title: "Enterprise Identity", items: "Voice Verification, Enterprise SSO, Advanced Security, Magic Link, QR Login" },
  { version: "V3", title: "Adaptive OS", items: "AI Security, Risk-based Authentication, Enterprise Identity, Advanced Billing and Entitlements" },
];

const accountCenter = [
  { title: "Account", items: ["Sign Up", "Login", "Logout", "Email Verification", "Password Reset", "Account Recovery", "Sessions", "Devices", "Security Alerts", "Account Status"] },
  { title: "Profile", items: ["Name", "Photo", "Title", "Bio", "Skills", "Experience", "Education", "Certifications", "Portfolio", "Website", "Social Links", "Privacy"] },
  { title: "Workspace", items: ["Personal", "Business", "Agency", "Client", "Project", "Department", "Team", "Switching", "Roles", "Permissions"] },
  { title: "Dashboard", items: ["Tasks", "Projects", "Leads", "Customers", "Sales", "Revenue", "Marketing", "SEO", "Local SEO", "Ads", "Content", "Meetings", "Files", "AI Usage", "Education", "Reports"] },
  { title: "Billing", items: ["Subscription", "Usage", "Invoices", "Payments", "Plans", "Entitlements", "Transaction History"] },
  { title: "Support", items: ["NOVA AI Help", "Tickets", "System Status", "Security Assistant"] },
];

const moduleArchitecture = [
  { title: "AUTH", items: ["Email", "Phone", "Google", "OAuth", "Passkey", "Biometric", "Voice", "Magic Link", "MFA", "Recovery"] },
  { title: "ACCOUNT", items: ["Profile", "Devices", "Sessions", "Security", "Privacy"] },
  { title: "WORKSPACE", items: ["Organization", "Team", "Roles", "Permissions", "Invitations"] },
  { title: "BILLING", items: ["Plans", "Subscription", "Usage", "Payments", "Invoices", "Entitlements"] },
  { title: "AI", items: ["Universal Assistant", "Business Advisor", "Research Agent", "Marketing Agent", "SEO Agent", "Local SEO Agent", "AEO Agent", "GEO Agent", "Backlink Agent", "CPA Agent", "Developer Agent", "Content Agent", "Creative Agent", "Data Agent", "Education Agent", "Automation Agent"] },
];

const securityPolicies = ["Password Policy", "Session Policy", "2FA Policy", "Allowed Login Methods", "SSO", "Device Policy", "IP Restrictions", "Audit Logs"];
const recoveryOptions = ["Use email", "Use recovery code", "Use passkey", "Use another trusted session", "Account recovery"];

function StatusPill({ children, tone = "purple" }: { children: ReactNode; tone?: "purple" | "gold" | "green" | "red" | "slate" }) {
  const tones = {
    purple: "border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-100",
    gold: "border-yellow-200/40 bg-yellow-300/10 text-yellow-100",
    green: "border-emerald-300/35 bg-emerald-400/10 text-emerald-100",
    red: "border-rose-300/35 bg-rose-400/10 text-rose-100",
    slate: "border-white/15 bg-white/5 text-white/70",
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.36em] text-yellow-200/80">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-white/68">{description}</p>
    </div>
  );
}

function Flow({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
      {items.map((item, index) => (
        <div key={item} className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-white/80">
          <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-500/20 text-xs font-black text-yellow-100">{index + 1}</div>
          <p className="font-semibold text-white">{item}</p>
          {index < items.length - 1 ? <span className="absolute -right-2 top-1/2 hidden text-white/25 xl:block">→</span> : null}
        </div>
      ))}
    </div>
  );
}

function formatDate(date?: Date) {
  if (!date) return "Not scheduled";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default async function HomePage() {
  const snapshot = await getFoysalOsSnapshot();
  const enabledProviders = snapshot.providers.filter((provider) => provider.enabled);
  const futureProviders = snapshot.providers.filter((provider) => !provider.enabled);
  const currentPlan = snapshot.subscription?.plan;
  const currentSubscription = snapshot.subscription?.subscription;
  const currentEntitlementKeys = new Set(snapshot.currentEntitlements.filter((entitlement) => entitlement.enabled).map((entitlement) => entitlement.featureKey));
  const coreFeatureKeys = ["nova_ai", "advanced_automation", "enterprise_sso", "advanced_security", "team_management"];
  const warningMeters = snapshot.usageMeters.filter((meter) => meter.percentUsed >= 70);

  return (
    <main className="overflow-hidden">
      <section className="relative px-6 pb-16 pt-8 md:px-10 lg:px-16">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <Image src="/foysal-it-mark.svg" alt="FOYSAL IT" width={44} height={44} className="rounded-2xl purple-glow" priority />
            <div>
              <p className="text-sm font-black tracking-[0.18em] text-white">FOYSAL IT OS</p>
              <p className="text-xs text-white/55">Identity · Workspace · Billing · AI</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <a href="/features" className="text-sm font-bold text-white/70 hover:text-white">Features</a>
            <a href="/integrations" className="text-sm font-bold text-white/70 hover:text-white">Integrations</a>
            <a href="/pricing" className="text-sm font-bold text-white/70 hover:text-white">Pricing</a>
            <a href="/final-check" className="text-sm font-bold text-yellow-100 hover:text-yellow-200">Final Check</a>
            <a href="/test-center" className="text-sm font-bold text-white/70 hover:text-white">Test Center</a>
            <a href="/subscription-launch" className="text-sm font-bold text-white/70 hover:text-white">Subscription</a>
            <a href="/app-center" className="text-sm font-bold text-white/70 hover:text-white">App Center</a>
            <a href="/professional-review" className="text-sm font-bold text-white/70 hover:text-white">Professional Review</a>
            <a href="/platform-audit" className="text-sm font-bold text-white/70 hover:text-white">Build Audit</a>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-8 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <StatusPill tone="gold">Future-ready authentication</StatusPill>
              <StatusPill>Workspace-level subscription</StatusPill>
              <StatusPill tone="green">No raw card or voice storage</StatusPill>
            </div>
            <h1 className="max-w-5xl text-5xl font-black leading-[0.94] tracking-[-0.055em] text-white md:text-7xl xl:text-8xl">
              Universal AI Work & Business Operating System for work, create, develop, market, sell, communicate, analyze, report, automate, and grow.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              FOYSAL IT OS keeps the same visual identity while becoming a 2026 Enterprise AI Workspace: one AI-powered workspace for Business, Agency, Marketing, SEO, Development, Content, Creative, Office, Data, Education, Career, Communication, and Automation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/final-check" className="rounded-full bg-white px-6 py-3 text-sm font-black text-[#270024] shadow-2xl shadow-fuchsia-950/40 transition hover:bg-yellow-200">Final Check</a>
              <a href="/app-center" className="rounded-full border border-yellow-200/35 bg-yellow-200/10 px-6 py-3 text-sm font-black text-yellow-100 transition hover:bg-yellow-200/20">Download App Package</a>
              <a href="/ai-workforce" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-black text-white/85 transition hover:bg-white/10">AI Workforce</a>
              <a href="/jarvis" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-black text-white/85 transition hover:bg-white/10">Jarvis Core</a>
              <a href="/lead-intelligence" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-black text-white/85 transition hover:bg-white/10">Lead Intelligence</a>
              <a href="/dashboard" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-black text-white/85 transition hover:bg-white/10">Unified OS</a>
              <a href="/super-owner" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-black text-white/85 transition hover:bg-white/10">Super Owner Control</a>
              <a href="/api/entitlements?workspace=foysal-it-agency&feature=nova_ai" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-black text-white/85 transition hover:bg-white/10">Test API Access</a>
            </div>
          </div>

          <div id="signin" className="glass-panel rounded-[2rem] p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-200/75">Login portal</p>
                <h2 className="mt-2 text-3xl font-black">Welcome back</h2>
                <p className="text-sm text-white/58">Sign in to your workspace</p>
              </div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-fuchsia-500/20 text-3xl gold-glow">✦</div>
            </div>

            <div className="space-y-3">
              <button className="w-full rounded-2xl border border-white/12 bg-white px-4 py-3 text-sm font-black text-[#250022] transition hover:bg-yellow-100">Continue with Google</button>
              <div className="flex items-center gap-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-white/35"><span className="h-px flex-1 bg-white/10" />OR<span className="h-px flex-1 bg-white/10" /></div>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none ring-yellow-200/20 placeholder:text-white/35 focus:ring-4" placeholder="Email address" />
                <input className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none ring-yellow-200/20 placeholder:text-white/35 focus:ring-4" placeholder="Password  👁" type="password" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <a className="text-yellow-100 hover:text-yellow-200" href="#recovery">Forgot password?</a>
                <span className="text-white/45">OTP rate limits enabled</span>
              </div>
              <button className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-yellow-300 px-4 py-3 text-sm font-black text-[#21001f] transition hover:brightness-110">Sign In</button>
              <div className="grid gap-3 md:grid-cols-2">
                <button className="rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 text-sm font-bold text-white/90">Continue with Phone</button>
                <button className="rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 text-sm font-bold text-white/90">Use Passkey / Device</button>
              </div>
              <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 p-4">
                <div className="flex items-center gap-4">
                  <div className="voice-ring relative flex h-14 w-14 items-center justify-center rounded-full bg-[#250022] text-2xl">🎙️</div>
                  <div className="flex-1">
                    <p className="font-black">Use Voice Verification</p>
                    <p className="text-sm text-white/60">Hold / Speak → Voice verified ✓ → Login. Raw recordings are not stored.</p>
                  </div>
                  <StatusPill tone="slate">V2</StatusPill>
                </div>
              </div>
              <p className="text-center text-sm text-white/55">New here? <a href="#signup" className="font-bold text-yellow-100">Create an account</a> · <a href="#nova" className="font-bold text-fuchsia-100">✦ AI Help</a></p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Authentication protocol" title="Primary login doors with a provider registry" description="The UI shows only clean sign-in choices, while the backend keeps a configurable registry for future Google, phone, passkey, magic link, voice, and enterprise SSO providers." />
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-panel rounded-[2rem] p-6" id="signup">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-200/70">Create account</p>
              <h3 className="mt-3 text-2xl font-black">Sign up with email or phone</h3>
              <div className="mt-5 grid gap-3">
                <button className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#250022]">Continue with Google</button>
                <input className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35" placeholder="Email" />
                <input className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35" placeholder="Phone +880 1XXXXXXXXX" />
                <input className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35" placeholder="Full Name" />
                <input className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35" placeholder="Password" type="password" />
                <label className="flex gap-3 text-sm text-white/65"><input type="checkbox" className="mt-1" /> Agree to Terms & Privacy</label>
                <button className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-yellow-300 px-4 py-3 text-sm font-black text-[#21001f]">Create Account</button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="glass-panel rounded-[2rem] p-6">
                <h3 className="text-xl font-black">Enabled methods</h3>
                <div className="mt-4 space-y-3">
                  {enabledProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] p-3">
                      <div>
                        <p className="font-bold">{provider.displayName}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/38">{provider.category}</p>
                      </div>
                      <StatusPill tone="green">{provider.phase}</StatusPill>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-panel rounded-[2rem] p-6">
                <h3 className="text-xl font-black">Future methods</h3>
                <div className="mt-4 space-y-3">
                  {futureProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <div>
                        <p className="font-bold text-white/78">{provider.displayName}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/32">{provider.enterpriseOnly ? "enterprise entitlement" : provider.category}</p>
                      </div>
                      <StatusPill tone="slate">{provider.phase}</StatusPill>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="glass-panel rounded-[2rem] p-6">
              <h3 className="text-xl font-black">Phone login/signup flow</h3>
              <p className="mt-2 text-sm text-white/60">Bangladesh-first UX with OTP expiry, resend cooldown, retry limit, abuse protection, and account recovery fallback.</p>
              <div className="mt-5"><Flow items={phoneFlow} /></div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6" id="recovery">
              <h3 className="text-xl font-black">Lost phone recovery</h3>
              <p className="mt-2 text-sm text-white/60">Phone OTP is not a blind password replacement. Recovery requires identity and risk checks before restoring access.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {recoveryOptions.map((option) => <StatusPill key={option} tone="gold">{option}</StatusPill>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Voice + MFA" title="Biometric-ready without unsafe biometric storage" description="Voice and face/device unlock are modeled as secure verification decisions. Sensitive actions can still require passkey or 2FA re-authentication." />
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <Flow items={authFlow} />
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  ["Voice Password", "Not stored as raw voice recording"],
                  ["Sensitive actions", "Passkey / 2FA re-authentication"],
                  ["Decision", "Verification result + risk check"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4">
                    <p className="font-black text-yellow-100">{title}</p>
                    <p className="mt-2 text-sm text-white/62">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-white/55">Security Score</p>
                  <h3 className="text-5xl font-black">{snapshot.security?.securityScore ?? 0}<span className="text-2xl text-white/40"> / 100</span></h3>
                </div>
                <StatusPill tone="green">Healthy</StatusPill>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-yellow-300" style={{ width: `${snapshot.security?.securityScore ?? 0}%` }} />
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <p>✓ Email verified</p>
                <p>✓ Phone verified</p>
                <p>✓ Passkey enabled</p>
                <p className="text-yellow-100">⚠ Add recovery codes</p>
                <p className="text-yellow-100">⚠ Prepare voice verification policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="billing" className="px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Billing & subscription" title="Workspace-level subscription portal" description="Subscription belongs to the workspace/organization, so the agency owner can manage a plan for team members, usage, invoices, and feature access." />
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/55">Current workspace</p>
                  <h3 className="mt-1 text-3xl font-black">{snapshot.workspace.name}</h3>
                  <p className="mt-1 text-white/55">Owner: {snapshot.owner.displayName}</p>
                </div>
                <StatusPill tone="purple">{snapshot.workspace.type}</StatusPill>
              </div>
              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-white/55">Current Plan</p>
                <h4 className="mt-1 text-4xl font-black text-yellow-100">{currentPlan?.name ?? "No plan"}</h4>
                <p className="mt-2 text-white/62">{currentPlan?.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusPill tone="green">{currentSubscription?.status.replaceAll("_", " ") ?? "inactive"}</StatusPill>
                  <StatusPill tone="gold">Renewal: {formatDate(currentSubscription?.currentPeriodEnd)}</StatusPill>
                  <StatusPill tone="slate">Tokenized payments only</StatusPill>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {subscriptionFlow.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-sm font-bold text-white/78">{item}</div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black">Usage Metering</h3>
                <StatusPill tone={warningMeters.length ? "gold" : "green"}>{warningMeters.length ? "Approaching limit" : "Within limits"}</StatusPill>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {snapshot.usageMeters.map((meter) => (
                  <div key={meter.id} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold">{meter.metricName}</p>
                      <p className="text-sm text-white/55">{meter.used} / {meter.limitValue}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${meter.percentUsed >= 70 ? "bg-yellow-300" : "bg-fuchsia-400"}`} style={{ width: `${meter.percentUsed}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-white/45">{meter.percentUsed}% used · {meter.periodLabel}</p>
                  </div>
                ))}
              </div>
              {warningMeters.length ? (
                <div className="mt-5 rounded-2xl border border-yellow-200/25 bg-yellow-200/10 p-4 text-sm text-yellow-50">
                  You&apos;re approaching your monthly AI limit. <span className="font-black">Upgrade Plan</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <h3 className="text-2xl font-black">Invoice Center</h3>
              <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
                {snapshot.invoices.map((invoice) => (
                  <div key={invoice.id} className="grid gap-3 border-b border-white/10 bg-white/[0.045] p-4 last:border-b-0 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
                    <p className="font-black">{invoice.invoiceNumber}</p>
                    <p className="text-white/65">{invoice.billingMonth}</p>
                    <StatusPill tone={invoice.status === "paid" ? "green" : invoice.status === "pending" ? "gold" : "red"}>{invoice.status}</StatusPill>
                    <button className="rounded-full border border-white/12 px-4 py-2 text-xs font-bold text-white/75">View / Download</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <h3 className="text-2xl font-black">Subscription lifecycle</h3>
              <div className="mt-5 space-y-3">
                {expiryFlow.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                    <span className={`h-3 w-3 rounded-full ${index === 0 ? "bg-emerald-300" : "bg-white/25"}`} />
                    <p className="font-bold text-white/78">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-rose-300/25 bg-rose-400/10 p-4">
                <p className="font-black text-rose-100">Payment needs attention</p>
                <p className="mt-2 text-sm text-white/62">Update payment method, retry payment, or contact support. Data is preserved through the retention policy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Plans & entitlements" title="Pricing numbers stay out of code" description="Plan capabilities are stored in PostgreSQL. Frontend hiding is not security; every sensitive feature must call backend entitlement checks." />
          <div className="grid gap-4 lg:grid-cols-5">
            {snapshot.plans.map((plan) => {
              const planEntitlements = snapshot.allEntitlements.filter((entitlement) => entitlement.planId === plan.id && entitlement.enabled).slice(0, 5);
              return (
                <div key={plan.id} className={`rounded-[2rem] border p-5 ${plan.code === currentPlan?.code ? "border-yellow-200/40 bg-yellow-200/10 gold-glow" : "border-white/10 bg-white/[0.055]"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-black">{plan.name}</h3>
                    <StatusPill tone={plan.code === currentPlan?.code ? "gold" : "slate"}>{plan.phase}</StatusPill>
                  </div>
                  <p className="mt-3 min-h-20 text-sm leading-6 text-white/62">{plan.summary}</p>
                  <div className="mt-4 space-y-2 text-sm text-white/76">
                    {planEntitlements.map((entitlement) => <p key={entitlement.id}>✓ {entitlement.featureName}</p>)}
                  </div>
                  <button className="mt-5 w-full rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-xs font-black text-white/80">{plan.code === currentPlan?.code ? "Current plan" : "Review plan"}</button>
                </div>
              );
            })}
          </div>

          <div className="mt-5 glass-panel rounded-[2rem] p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-2xl font-black">Backend entitlement matrix</h3>
                <p className="mt-2 text-sm text-white/60">Current workspace plan: {currentPlan?.name}. API sample: /api/entitlements?workspace=foysal-it-agency&amp;feature=nova_ai</p>
              </div>
              <StatusPill tone="green">Server enforced</StatusPill>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              {coreFeatureKeys.map((key) => (
                <div key={key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">{key.replaceAll("_", " ")}</p>
                  <p className={`mt-3 text-2xl font-black ${currentEntitlementKeys.has(key) ? "text-emerald-200" : "text-rose-200"}`}>{currentEntitlementKeys.has(key) ? "Allowed" : "Blocked"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Security operations" title="Organization security and account center" description="Enterprise and agency workspaces can control login policy, device trust, sessions, invoice permissions, and audit history without rebuilding the platform." />
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <h3 className="text-2xl font-black">Organization Security</h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {securityPolicies.map((policy) => <div key={policy} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-sm font-bold text-white/75">{policy}</div>)}
              </div>
              <div className="mt-5 rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4 text-sm text-white/68">
                Billing security includes payment provider tokenization, no raw card storage, owner/admin authorization, invoice access control, and audit logs.
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {accountCenter.map((group) => (
                <div key={group.title} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5">
                  <h3 className="text-xl font-black text-yellow-100">{group.title}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((item) => <StatusPill key={item} tone="slate">{item}</StatusPill>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="nova" className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-500 to-yellow-300 text-2xl">✦</div>
                <div>
                  <h3 className="text-2xl font-black">NOVA AI Security Assistant</h3>
                  <p className="text-sm text-white/58">Helpful guidance without bypassing security decisions.</p>
                </div>
              </div>
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-white/55">User: “আমার account নিরাপদ আছে?”</p>
                <p className="mt-3 text-white/82">NOVA: Your score is {snapshot.security?.securityScore ?? 0}/100. Email, phone, passkey, and authenticator are ready. Add recovery codes and finalize the voice verification policy to improve resilience.</p>
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <h3 className="text-2xl font-black">Audit log</h3>
              <div className="mt-5 space-y-3">
                {snapshot.auditLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                    <p className="font-bold">{log.eventType}</p>
                    <p className="mt-1 text-sm text-white/55">{log.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Roadmap" title="Professional now, expandable later" description="The system avoids overbuilding V1 while keeping placeholders for voice login, device biometrics, enterprise identity, subscriptions, and advanced AI security." />
          <div className="grid gap-4 lg:grid-cols-4">
            {vRoadmap.map((phase) => (
              <div key={phase.version} className="glass-panel rounded-[2rem] p-6">
                <StatusPill tone="gold">{phase.version}</StatusPill>
                <h3 className="mt-4 text-2xl font-black">{phase.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{phase.items}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-5">
            {moduleArchitecture.map((module) => (
              <div key={module.title} className="rounded-[2rem] border border-white/10 bg-black/20 p-5">
                <h3 className="font-black text-fuchsia-100">{module.title}</h3>
                <div className="mt-4 space-y-2 text-sm text-white/62">
                  {module.items.map((item) => <p key={item}>├── {item}</p>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
