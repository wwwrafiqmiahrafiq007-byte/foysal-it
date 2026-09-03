import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFoysalOsSnapshot, getSuperOwnerUser360 } from "@/lib/foysal-os";
import { SuperOwnerInteractiveControl } from "@/components/SuperOwnerInteractiveControl";

export const dynamic = "force-dynamic";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass-panel rounded-[2rem] p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      {children}
    </section>
  );
}

export default async function SuperOwnerPage() {
  const snapshot = await getFoysalOsSnapshot();
  const user360 = await getSuperOwnerUser360(snapshot.owner.id);

  return (
    <main className="min-h-screen px-5 py-5 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <nav className="glass-panel flex flex-col justify-between gap-4 rounded-[2rem] p-5 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/foysal-it-mark.svg" alt="FOYSAL IT" width={48} height={48} className="rounded-2xl" />
            <div>
              <p className="font-black tracking-[0.18em]">SUPER OWNER CONTROL</p>
              <p className="text-sm text-white/50">Authorized platform visibility · no secrets exposed</p>
            </div>
          </Link>
          <div className="flex gap-2">
            <Link href="/dashboard" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Dashboard</Link>
            <Link href="/platform-audit" className="rounded-full border border-yellow-200/25 bg-yellow-200/10 px-4 py-2 text-sm font-bold text-yellow-100">Build Audit</Link>
            <a href="/api/platform/live-monitoring" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Live Monitoring API</a>
            <a href="/api/platform/overview" className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#250022]">Overview API</a>
          </div>
        </nav>

        <section className="glass-panel rounded-[2rem] p-7 md:p-9">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.36em] text-yellow-200/75">Unified SaaS administration</p>
            <h1 className="mt-3 text-5xl font-black tracking-[-0.05em] md:text-7xl">Monitor the whole FOYSAL IT OS without leaking secrets.</h1>
            <p className="mt-5 text-lg leading-8 text-white/65">Users, organizations, agencies, clients, subscriptions, revenue, AI usage, storage, sessions, activity, meetings, integrations, APIs, security, errors, audit logs, health, flags, and settings are connected through one audited platform layer.</p>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5"><p className="text-sm text-white/50">Users</p><p className="mt-2 text-4xl font-black">{snapshot.counts.users}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5"><p className="text-sm text-white/50">Organizations</p><p className="mt-2 text-4xl font-black">{snapshot.counts.workspaces}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5"><p className="text-sm text-white/50">Roles</p><p className="mt-2 text-4xl font-black">{snapshot.roles.length}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5"><p className="text-sm text-white/50">Target Experiences</p><p className="mt-2 text-4xl font-black">{snapshot.targetSegments.length}</p></div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card title="Roles, Permissions & Configuration">
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {snapshot.roles.map((role) => (
                <div key={role.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{role.displayName}</p>
                    <span className="text-xs text-white/40">{role.isPlatformRole ? "Platform" : "Workspace"}</span>
                  </div>
                  <p className="mt-2 text-xs text-white/50">{role.permissions.length} permissions · {role.navigation.length} nav items</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Administration Coverage">
            <div className="mt-5 flex flex-wrap gap-2">
              {["Users", "Organizations", "Workspaces", "Roles", "Permissions", "Subscriptions", "Billing", "AI Usage", "Storage", "APIs", "Integrations", "Reports", "Security", "Audit Logs", "Errors", "System Health", "Feature Flags", "Configuration"].map((item) => (
                <span key={item} className="rounded-full border border-yellow-200/25 bg-yellow-200/10 px-3 py-1 text-xs font-bold text-yellow-100">{item}</span>
              ))}
            </div>
            <p className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-50">Sensitive secrets never appear in normal UI: no passwords, password hashes, API secrets, OAuth secrets, access tokens, refresh tokens, or raw session tokens.</p>
          </Card>
        </div>

        <Card title="Platform Metrics">
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {snapshot.platformMetrics.map((metric) => (
              <div key={metric.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-sm">{metric.label}</p>
                  <span className="text-xs font-bold text-emerald-200">{metric.trend}</span>
                </div>
                <p className="mt-2 text-3xl font-black text-yellow-100">{metric.value.toLocaleString()}</p>
                <p className="text-sm text-white/45">{metric.unit}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Interactive Control Panel */}
        <SuperOwnerInteractiveControl
          initialFlags={snapshot.featureFlags}
          initialHealth={snapshot.healthChecks}
          user360={{
            user: user360.user,
            membershipsCount: user360.memberships.length,
            sessionsCount: user360.sessions.length,
          }}
        />

        <Card title="Security & Audit Logs">
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {snapshot.auditLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{log.eventType}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-white/35">{log.riskLevel}</span>
                </div>
                <p className="mt-2 text-sm text-white/55">{log.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
