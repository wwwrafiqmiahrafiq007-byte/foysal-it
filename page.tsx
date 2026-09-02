import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getFullAppTestMatrix,
  getGmailExtensionCheck,
  getMeetingReadinessCheck,
  getSubscriptionSalesReadiness,
} from "@/lib/launch-readiness";

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

function tone(status: string | number | boolean) {
  const text = String(status);
  if (/working|configured|operational|available|true/i.test(text)) return "green" as const;
  if (/partial|required|not configured|authorization|no data|false|needs/i.test(text)) return "gold" as const;
  if (/failed|error|down/i.test(text)) return "red" as const;
  return "slate" as const;
}

export default async function TestCenterPage() {
  const [matrix, sales, gmail, meeting] = await Promise.all([
    getFullAppTestMatrix(),
    getSubscriptionSalesReadiness(),
    Promise.resolve(getGmailExtensionCheck()),
    Promise.resolve(getMeetingReadinessCheck()),
  ]);

  return (
    <main className="min-h-screen px-5 py-5 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <nav className="glass-panel flex flex-col justify-between gap-4 rounded-[2rem] p-5 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/foysal-it-mark.svg" alt="FOYSAL IT" width={48} height={48} className="rounded-2xl" />
            <div><p className="font-black tracking-[0.18em]">FOYSAL IT · TEST CENTER</p><p className="text-sm text-white/50">Works · Missing · Sell Ready · Gmail · Meet · Security</p></div>
          </Link>
          <div className="flex flex-wrap gap-2">
            <a href="/api/platform/full-test" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Full Test API</a>
            <a href="/api/platform/subscription-sales-readiness" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Sales API</a>
            <Link href="/app-center" className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#250022]">App Center</Link>
          </div>
        </nav>

        <section className="glass-panel rounded-[2rem] p-7 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-yellow-200/75">Professional QA answer</p>
          <h1 className="mt-3 max-w-5xl text-5xl font-black tracking-[-0.055em] md:text-7xl">All OK না—core কাজ করে, কিন্তু subscription sell করার আগে কিছু critical integration বাকি।</h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-white/65">This page checks real database/runtime configuration. Working modules are usable now. Gmail, Meet, WhatsApp, payments, n8n execution and native app publishing require real credentials/testing before selling as fully automated SaaS.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4"><p className="text-sm text-white/50">Working checks</p><p className="text-4xl font-black text-emerald-100">{matrix.summary.working}</p></div>
            <div className="rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4"><p className="text-sm text-white/50">Partial</p><p className="text-4xl font-black text-yellow-100">{matrix.summary.partial}</p></div>
            <div className="rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4"><p className="text-sm text-white/50">Integration Required</p><p className="text-4xl font-black text-yellow-100">{matrix.summary.integrationRequired}</p></div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card title="Can You Sell Subscription Now?">
            <div className="mt-5 rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-5">
              <div className="flex items-center justify-between gap-3"><p className="font-black">Sales Mode</p><Pill tone={sales.canSellNow ? "green" : "gold"}>{sales.canSellNow ? "Public paid launch ready" : "Manual/Beta sell recommended"}</Pill></div>
              <p className="mt-3 text-sm text-white/65">{sales.recommendedSellingModeNow}</p>
            </div>
            <div className="mt-5 space-y-3">{sales.packagedPlans.map((plan) => <div key={plan.name} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold">{plan.name}</p><Pill tone={plan.sellable ? "green" : "gold"}>{plan.sellable ? "Sellable with limits" : "Needs integrations"}</Pill></div><p className="mt-2 text-sm text-white/55">{plan.target} · {plan.limit}</p><p className="mt-1 text-xs text-yellow-100">{plan.note}</p></div>)}</div>
          </Card>

          <Card title="Before Public Paid Launch">
            <div className="mt-5 space-y-2">{sales.mustFinishBeforePublicPaidLaunch.map((item) => <p key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/72">→ {item}</p>)}</div>
            <div className="mt-5 grid gap-3 md:grid-cols-2"><Pill tone={tone(sales.payment.status)}>Payment: {sales.payment.status}</Pill><Pill tone={tone(sales.domain.permanentDomainConfigured)}>Domain: {sales.domain.permanentDomainConfigured ? "Configured" : "Needs Env"}</Pill></div>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card title="Gmail + Extension Check">
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-bold">Gmail OAuth</p><Pill tone={tone(gmail.gmailStatus)}>{gmail.gmailStatus}</Pill></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-bold">SMTP</p><Pill tone={tone(gmail.smtpStatus)}>{gmail.smtpStatus}</Pill></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-bold">Extension</p><Pill tone={tone(gmail.extensionStatus)}>{gmail.extensionStatus}</Pill></div>
            </div>
            <p className="mt-4 text-sm text-white/60">{gmail.workFromExtension}</p>
            <a href="/api/integrations/gmail-extension-check" className="mt-4 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Gmail Check API</a>
          </Card>

          <Card title="Google Meet / Voice Translation Check">
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Pill tone={tone(meeting.googleMeet)}>Google Meet: {meeting.googleMeet}</Pill>
              <Pill tone={tone(meeting.speechToText)}>Speech: {meeting.speechToText}</Pill>
              <Pill tone={tone(meeting.translation)}>Translation: {meeting.translation}</Pill>
              <Pill tone={tone(meeting.voiceOutput)}>Voice: {meeting.voiceOutput}</Pill>
            </div>
            <p className="mt-4 text-sm text-white/60">{meeting.note}</p>
            <a href="/api/integrations/meeting-readiness" className="mt-4 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Meet Check API</a>
          </Card>
        </div>

        <Card title="Full App Test Matrix">
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {matrix.checks.map((check) => <div key={check.name} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold">{check.name}</p><Pill tone={tone(check.status)}>{check.status}</Pill></div><p className="mt-2 text-sm text-white/55">{check.evidence}</p><p className="mt-2 text-xs text-yellow-100">{check.action}</p></div>)}
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card title="Usable Now">
            <div className="mt-5 space-y-2">{matrix.usableNow.map((item) => <p key={item} className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-3 text-sm text-emerald-50">✓ {item}</p>)}</div>
          </Card>
          <Card title="Not Ready Until Configured">
            <div className="mt-5 space-y-2">{matrix.notReadyUntilConfigured.map((item) => <p key={item} className="rounded-2xl border border-yellow-200/15 bg-yellow-200/10 p-3 text-sm text-yellow-50">⚠ {item}</p>)}</div>
          </Card>
        </div>
      </div>
    </main>
  );
}
