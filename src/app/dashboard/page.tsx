import Image from "next/image";
import Link from "next/link";
import { getFoysalOsSnapshot } from "@/lib/foysal-os";
import { TaskExecutionModule } from "@/components/TaskExecutionModule";
import { GmailDispatcherModule } from "@/components/GmailDispatcherModule";
import {
  CheckSquare,
  FolderKanban,
  Users,
  ShieldCheck,
  TrendingUp,
  Layers,
  ArrowRight,
  ExternalLink,
  Bot,
  Cpu,
  Mail,
  Languages,
  Activity,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const snapshot = await getFoysalOsSnapshot();
  const currentPlan = snapshot.subscription?.plan?.name ?? "Enterprise";
  const completedTasks = snapshot.tasks.filter((t) => t.status === "completed").length;
  const taskProgressPct = snapshot.tasks.length > 0 ? Math.round((completedTasks / snapshot.tasks.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#0a0e17] text-slate-100 px-4 py-5 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Executive Header Bar */}
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 md:p-5 shadow-lg backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image
                src="/foysal-it-logo.svg"
                alt="FOYSAL IT"
                width={42}
                height={42}
                className="rounded-xl"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-white text-base">FOYSAL IT OS</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Operational
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {snapshot.workspace.name} · {currentPlan} Tier
                </p>
              </div>
            </Link>
          </div>

          {/* Quick action bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/tasks"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
              <span>Tasks</span>
            </Link>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <FolderKanban className="h-3.5 w-3.5 text-sky-400" />
              <span>Projects</span>
            </Link>
            <Link
              href="/lead-intelligence"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Users className="h-3.5 w-3.5 text-amber-400" />
              <span>Leads</span>
            </Link>
            <Link
              href="/dashboard/translation"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Languages className="h-3.5 w-3.5 text-emerald-400" />
              <span>AI Translation</span>
            </Link>
            <Link
              href="/jarvis"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Bot className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>Jarvis</span>
            </Link>
            <Link
              href="/test-center"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Activity className="h-3.5 w-3.5 text-yellow-400" />
              <span>Test Center</span>
            </Link>
            <Link
              href="/super-owner"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm"
            >
              <span>Super Owner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* 4 Executive Metric Tiles */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Task Execution</span>
              <span className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-400">
                <CheckSquare className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{snapshot.tasks.length}</span>
              <span className="text-xs text-slate-400 font-medium">{taskProgressPct}% completed</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${taskProgressPct}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Active Projects</span>
              <span className="rounded-lg bg-sky-500/10 p-1.5 text-sky-400">
                <FolderKanban className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{snapshot.projects.length}</span>
              <span className="text-xs text-sky-400 font-medium">100% On Track</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Projects linked to CRM client pipeline</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">CRM & Leads</span>
              <span className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {snapshot.clients.length + snapshot.leads.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {snapshot.leads.length} active leads
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{snapshot.clients.length} retained business accounts</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Security & Isolation</span>
              <span className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {snapshot.security?.securityScore ?? 100}
                <span className="text-sm text-slate-400 font-normal">/100</span>
              </span>
              <span className="text-xs text-emerald-400 font-semibold">Strict</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Workspace tenant isolation enforced</p>
          </div>
        </section>

        {/* Main 2-Column Section */}
        <section className="grid gap-6 lg:grid-cols-12">
          {/* Left Column (7 cols): Task Execution Module & CRM Pipeline */}
          <div className="lg:col-span-7 space-y-6">
            {/* Task Execution Module with Dropdown Menu (Required) */}
            <TaskExecutionModule initialTasks={snapshot.tasks} />

            {/* CRM Pipeline */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div>
                  <h3 className="text-lg font-bold text-white">CRM & Client Pipeline</h3>
                  <p className="text-xs text-slate-400">Active leads and automated qualification stages</p>
                </div>
                <Link
                  href="/dashboard/crm"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="mt-4 space-y-2.5">
                {snapshot.leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-slate-800 bg-slate-800/40 p-3 hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{lead.name}</p>
                        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300 capitalize">
                          {lead.stage.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {lead.company} · Next step: <span className="text-slate-300">{lead.nextStep}</span>
                      </p>
                    </div>

                    <span className="self-start sm:self-auto rounded-lg border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300">
                      Score: 92/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Gmail Dispatcher & Project Workflow */}
          <div className="lg:col-span-5 space-y-6">
            {/* Dedicated Gmail & Communications Hub */}
            <GmailDispatcherModule
              defaultRecipient="rafiqmiahrafiq007@gmail.com"
              workspaceName={snapshot.workspace.name}
            />

            {/* Project Workflow & Milestones */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div>
                  <h3 className="text-lg font-bold text-white">Active Projects</h3>
                  <p className="text-xs text-slate-400">Milestone execution & client delivery</p>
                </div>
                <Link
                  href="/dashboard/projects"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>Kanban</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {snapshot.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 space-y-2.5 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{proj.name}</p>
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300 capitalize">
                        {proj.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Progress</span>
                        <span className="font-semibold text-indigo-400">{proj.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="uppercase font-medium text-amber-400">{proj.priority} Priority</span>
                      <span>Review Cycle 1</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Operational Modules Navigation Bar */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-800/80">
            <div>
              <h3 className="text-base font-bold text-white">Unified Workspace Modules</h3>
              <p className="text-xs text-slate-400">Direct navigation across all functional sub-systems</p>
            </div>
            <span className="text-xs text-slate-400">{snapshot.accessibleModules.length} Modules Active</span>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {snapshot.accessibleModules.map((mod) => (
              <Link
                key={mod.id}
                href={mod.route}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-800/30 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800/70 hover:text-white transition group"
              >
                <span>{mod.name}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
