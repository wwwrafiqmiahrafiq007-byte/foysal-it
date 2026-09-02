import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getJarvisSnapshot } from "@/lib/jarvis-core";

export const dynamic = "force-dynamic";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return <section className="glass-panel rounded-[2rem] p-6"><h2 className="text-2xl font-black">{title}</h2>{children}</section>;
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-yellow-200/25 bg-yellow-200/10 px-3 py-1 text-xs font-bold text-yellow-100">{children}</span>;
}

export default async function JarvisPage() {
  const snapshot = await getJarvisSnapshot();

  return (
    <main className="min-h-screen px-5 py-5 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <nav className="glass-panel flex flex-col justify-between gap-4 rounded-[2rem] p-5 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/foysal-it-mark.svg" alt="FOYSAL IT" width={48} height={48} className="rounded-2xl" />
            <div><p className="font-black tracking-[0.18em]">FOYSAL IT · JARVIS CORE</p><p className="text-sm text-white/50">EZY Chat · AI Orchestrator · n8n Backbone</p></div>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/ai-workforce" className="rounded-full border border-yellow-200/25 bg-yellow-200/10 px-4 py-2 text-sm font-bold text-yellow-100">AI Workforce</Link>
            <Link href="/lead-intelligence" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Lead Intelligence</Link>
            <Link href="/dashboard" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Unified OS</Link>
            <a href="/api/jarvis/overview" className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#250022]">Jarvis API</a>
          </div>
        </nav>

        <section className="glass-panel rounded-[2rem] p-7 md:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-yellow-200/75">Universal AI Operating System</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.055em] md:text-7xl">EZY Chat + Jarvis Core coordinates AI, humans, business, marketing, meetings and automation.</h1>
          <p className="mt-5 max-w-4xl text-white/65">Working features use database/runtime data. Meeting translation, WhatsApp, email sending, n8n workflow execution and provider actions remain Integration Required until configured and tested.</p>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card title="One Command Center">
            <div className="mt-5 rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4"><p className="text-sm text-white/55">Try via API</p><p className="mt-1 font-black text-yellow-100">“Jarvis, আজকের সব important কাজ দেখাও।”</p></div>
            <div className="mt-5 space-y-3">{snapshot.commandRuns.map((run) => <div key={run.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-bold">{run.commandText}</p><p className="mt-2 text-sm text-white/55">{run.resultSummary}</p></div>)}</div>
            <form action="/api/jarvis/command" method="post" className="mt-4"><a href="/api/jarvis/overview" className="block rounded-2xl border border-white/15 px-4 py-3 text-center font-bold text-white/75">Open Command APIs</a></form>
          </Card>

          <Card title="Business Brain">
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-sm text-white/45">Revenue</p><p className="text-2xl font-black">৳{snapshot.businessBrief.revenue.toLocaleString()}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-sm text-white/45">Expenses</p><p className="text-2xl font-black">৳{snapshot.businessBrief.expenses.toLocaleString()}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-sm text-white/45">Profit/Loss</p><p className="text-2xl font-black text-yellow-100">৳{snapshot.businessBrief.profit.toLocaleString()}</p></div>
            </div>
            <div className="mt-5 space-y-3">{snapshot.products.map((product) => <div key={product.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"><p className="font-bold">{product.name}</p><p className="mt-1 text-sm text-white/55">SKU {product.sku} · margin ৳{(product.price - product.cost).toLocaleString()} · stock {product.stock}</p></div>)}</div>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card title="Universal Meeting AI">
            <p className="mt-2 text-sm text-white/55">Two-way conversation mode: Bangla → Japanese voice and Japanese → Bangla voice require configured speech, translation and voice providers.</p>
            <div className="mt-5 space-y-3">{snapshot.meetings.map((meeting) => <div key={meeting.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold">{meeting.title}</p><Pill>{meeting.providerStatus}</Pill></div><p className="mt-2 text-sm text-white/55">{meeting.yourLanguage} ↔ {meeting.clientLanguage} · {meeting.mode} · Autonomous reply: {meeting.autonomousReplyEnabled ? "On" : "Off"}</p><p className="mt-2 text-xs text-yellow-100">Suggested answer available, but default flow is Suggest → You Review → Speak.</p></div>)}</div>
            <a href="/api/jarvis/meeting" className="mt-4 block rounded-2xl border border-white/15 px-4 py-3 text-center font-bold text-white/75">Meeting API</a>
          </Card>

          <Card title="n8n Automation Backbone">
            <p className="mt-2 text-sm text-white/55">n8n is the hands of FOYSAL IT: lead import, audits, outreach, member payroll, server monitoring and workflow execution.</p>
            <div className="mt-5 space-y-3">{snapshot.workflows.map((workflow) => <div key={workflow.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold">{workflow.name}</p><Pill>{workflow.status}</Pill></div><p className="mt-2 text-xs text-white/45">{workflow.steps.join(" → ")}</p></div>)}</div>
            <a href="/api/jarvis/n8n" className="mt-4 block rounded-2xl border border-white/15 px-4 py-3 text-center font-bold text-white/75">n8n API</a>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Card title="Off-Page SEO Payroll">
            <div className="mt-5 space-y-3">{snapshot.backlinkLogs.map((log) => <div key={log.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-bold">{log.fileName}</p><p className="mt-1 text-sm text-white/55">{log.approvedLinks} approved × ৳{log.ratePerLink} = ৳{log.earningAmount}</p><p className="text-xs text-yellow-100">{log.validationStatus} · {log.paymentStatus}</p></div>)}</div>
          </Card>
          <Card title="Server Jarvis">
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-bold">API {snapshot.server.apiStatus} · DB {snapshot.server.databaseStatus}</p><p className="mt-1 text-sm text-white/55">Memory {snapshot.server.memoryUsedMb} MB · uptime {snapshot.server.uptimeSeconds}s · queue {snapshot.server.queueStatus}</p><p className="mt-2 text-xs text-yellow-100">Safe recovery only. No unrestricted destructive server actions.</p></div>
            <a href="/api/jarvis/server" className="mt-4 block rounded-2xl border border-white/15 px-4 py-3 text-center font-bold text-white/75">Server API</a>
          </Card>
          <Card title="AI Backup System">
            <div className="mt-5 space-y-3">{snapshot.aiBackup.map((policy) => <div key={policy.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-bold">{policy.name}</p><p className="mt-2 text-xs text-white/45">{policy.layers.join(" → ")}</p><p className="mt-2 text-xs text-yellow-100">Consensus + human handoff enabled. No fake success.</p></div>)}</div>
          </Card>
        </div>
      </div>
    </main>
  );
}
