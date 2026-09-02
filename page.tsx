import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { InstallPwaButton } from "@/components/InstallPwaButton";
import { getFinalQaReport } from "@/lib/final-qa";

export const dynamic = "force-dynamic";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return <section className="glass-panel rounded-[2rem] p-6"><h2 className="text-2xl font-black">{title}</h2>{children}</section>;
}

function Pill({ children, tone = "gold" }: { children: ReactNode; tone?: "green" | "gold" | "red" | "slate" }) {
  const tones = {
    green: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    gold: "border-yellow-200/25 bg-yellow-200/10 text-yellow-100",
    red: "border-rose-300/25 bg-rose-400/10 text-rose-100",
    slate: "border-white/15 bg-white/[0.055] text-white/70",
  };
  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function tone(status: string | boolean) {
  const text = String(status);
  if (/pass|working|configured|true/i.test(text)) return "green" as const;
  if (/fail|down|error/i.test(text)) return "red" as const;
  if (/partial|required|manual|needs|false/i.test(text)) return "gold" as const;
  return "slate" as const;
}

export default async function FinalCheckPage() {
  const report = await getFinalQaReport();

  return (
    <main className="min-h-screen px-5 py-5 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <nav className="glass-panel flex flex-col justify-between gap-4 rounded-[2rem] p-5 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/foysal-it-mark.svg" alt="FOYSAL IT" width={48} height={48} className="rounded-2xl" />
            <div><p className="font-black tracking-[0.18em]">FOYSAL IT · FINAL CHECK</p><p className="text-sm text-white/50">Install · Run · Domain · APIs · Sell Readiness</p></div>
          </Link>
          <div className="flex flex-wrap gap-2">
            <a href="/api/platform/final-qa" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Final QA API</a>
            <Link href="/subscription-launch" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Subscription</Link>
            <Link href="/app-center" className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#250022]">App Center</Link>
          </div>
        </nav>

        <section className="glass-panel rounded-[2rem] p-7 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-yellow-200/75">Final launch answer</p>
          <h1 className="mt-3 max-w-5xl text-5xl font-black tracking-[-0.055em] md:text-7xl">Core app কাজ করে. 100% public paid launch করার আগে integration test বাকি।</h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-white/65">{report.verdict}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4"><p className="text-sm text-white/50">PASS</p><p className="text-4xl font-black text-emerald-100">{report.summary.pass}</p></div>
            <div className="rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4"><p className="text-sm text-white/50">Partial</p><p className="text-4xl font-black text-yellow-100">{report.summary.partial}</p></div>
            <div className="rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4"><p className="text-sm text-white/50">Integration</p><p className="text-4xl font-black text-yellow-100">{report.summary.integrationRequired}</p></div>
            <div className="rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4"><p className="text-sm text-white/50">Manual</p><p className="text-4xl font-black text-yellow-100">{report.summary.manualCheck}</p></div>
            <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4"><p className="text-sm text-white/50">Fail</p><p className="text-4xl font-black text-rose-100">{report.summary.fail}</p></div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card title="Install / Run Options">
            <div className="mt-5 space-y-4">
              <InstallPwaButton />
              <a href="/api/download/windows-package" className="block rounded-2xl border border-white/15 bg-white/[0.055] px-5 py-4 text-center font-black text-white/85">Download Windows/PC ZIP Package</a>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                <p className="font-bold text-white">Run options:</p>
                <p>1. Browser web app now.</p>
                <p>2. Install as PWA from supported browser.</p>
                <p>3. Download ZIP for terminal/PowerShell production setup checklist.</p>
                <p>4. Native .exe/iOS/Android requires wrapper/signing later.</p>
              </div>
            </div>
          </Card>

          <Card title="Permanent Domain Reality">
            <div className="mt-5 space-y-3 text-sm text-white/65">
              <p><span className="text-white/40">APP_URL:</span> {report.domain.appUrl ?? "Not set"}</p>
              <p><span className="text-white/40">API_URL:</span> {report.domain.apiUrl ?? "Not set"}</p>
              <p><span className="text-white/40">WEBHOOK_URL:</span> {report.domain.webhookUrl ?? "Not set"}</p>
              <Pill tone={report.domain.permanentDomainConfigured ? "green" : "gold"}>{report.domain.permanentDomainConfigured ? "Permanent domain configured" : "Needs production domain env"}</Pill>
              <div className="rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4 text-yellow-50">
                Permanent custom domain “all time free” guarantee করা যায় না. Domain registrar usually paid. Free hosting tiers possible, but production SaaS should use your paid/owned domain like foysalit.com with HTTPS.
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card title="Gmail / Extension / Meet">
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Pill tone={tone(report.gmail.gmailStatus)}>Gmail: {report.gmail.gmailStatus}</Pill>
              <Pill tone={tone(report.gmail.extensionStatus)}>Extension: {report.gmail.extensionStatus}</Pill>
              <Pill tone={tone(report.meeting.googleMeet)}>Meet: {report.meeting.googleMeet}</Pill>
              <Pill tone={tone(report.meeting.canWorkNow)}>Live translator: {report.meeting.canWorkNow ? "Can test" : "Not ready"}</Pill>
            </div>
            <p className="mt-4 text-sm text-white/60">Gmail/Meet/extension কাজ করবে only after Google OAuth, browser extension origin, speech/translation/TTS providers, consent and real testing.</p>
          </Card>

          <Card title="Subscription Selling Decision">
            <div className="mt-5 rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-5">
              <div className="flex items-center justify-between gap-3"><p className="font-black">Public auto paid launch</p><Pill tone={report.canPublicAutoSellSubscription ? "green" : "gold"}>{report.canPublicAutoSellSubscription ? "Ready" : "Not ready"}</Pill></div>
              <p className="mt-3 text-sm text-white/65">{report.recommendedMode}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">{report.salesReadiness.packagedPlans.map((plan) => <Pill key={plan.name} tone={plan.sellable ? "green" : "gold"}>{plan.name}</Pill>)}</div>
          </Card>
        </div>

        <Card title="Full A–Z QA Matrix">
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {report.checks.map((check) => (
              <div key={check.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3"><p className="font-bold">{check.name}</p><Pill tone={tone(check.status)}>{check.status}</Pill></div>
                <p className="mt-2 text-sm text-white/55">{check.evidence}</p>
                <p className="mt-2 text-xs text-yellow-100">{check.nextAction}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card title="Use Now">
            <div className="mt-5 space-y-2">{report.usableNow.map((entry) => <p key={entry} className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-3 text-sm text-emerald-50">✓ {entry}</p>)}</div>
          </Card>
          <Card title="Do Not Claim Until Configured">
            <div className="mt-5 space-y-2">{report.notReadyUntilConfigured.map((entry) => <p key={entry} className="rounded-2xl border border-yellow-200/15 bg-yellow-200/10 p-3 text-sm text-yellow-50">⚠ {entry}</p>)}</div>
          </Card>
        </div>
      </div>
    </main>
  );
}
