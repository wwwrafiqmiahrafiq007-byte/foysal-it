import Image from "next/image";
import Link from "next/link";
import { getFoysalOsSnapshot } from "@/lib/foysal-os";
import { TranslationAiModule } from "@/components/TranslationAiModule";
import { TaskExecutionModule } from "@/components/TaskExecutionModule";
import { ProjectExecutionModule } from "@/components/ProjectExecutionModule";
import { GmailDispatcherModule } from "@/components/GmailDispatcherModule";
import {
  Briefcase,
  Users,
  Target,
  FolderKanban,
  CheckSquare,
  Package,
  Sparkles,
  Layers,
  LineChart,
  ShieldCheck,
  Languages,
  ArrowRight,
  Plus,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Bot,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DashboardModulePage({ params }: Props) {
  const { slug } = await params;
  const snapshot = await getFoysalOsSnapshot();

  // Find module matching slug or fallback to friendly generated module
  const currentModule = snapshot.accessibleModules.find(
    (m) =>
      m.route.toLowerCase().endsWith(`/${slug.toLowerCase()}`) ||
      m.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase() ||
      m.moduleKey.toLowerCase().replace(/_/g, "-") === slug.toLowerCase()
  ) || {
    id: `mod-${slug}`,
    name: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    description: `Enterprise workspace module for ${slug} operations and workflows.`,
    route: `/dashboard/${slug}`,
    category: "general",
  };

  const isTranslation = slug === "translation";

  return (
    <main className="min-h-screen px-4 py-5 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Navigation Bar */}
        <header className="glass-panel flex flex-col justify-between gap-4 rounded-[2rem] p-5 md:flex-row md:items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/foysal-it-logo.svg"
              alt="FOYSAL IT"
              width={48}
              height={48}
              className="rounded-2xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-black tracking-[0.18em]">FOYSAL IT BUSINESS OS</p>
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Active
                </span>
              </div>
              <p className="text-xs text-white/50">
                Workspace: {snapshot.workspace.name} · Role: Super Owner
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/80 hover:bg-white/10 transition"
            >
              ← Overview
            </Link>
            <Link
              href="/super-owner"
              className="rounded-full border border-yellow-200/25 bg-yellow-200/10 px-4 py-2 text-xs font-bold text-yellow-100 hover:bg-yellow-200/20 transition"
            >
              Super Owner Control
            </Link>
            <Link
              href="/test-center"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/80 hover:bg-white/10 transition"
            >
              Test Center
            </Link>
            <Link
              href="/final-check"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/80 hover:bg-white/10 transition"
            >
              Final Check
            </Link>
            <Link
              href="/subscription-launch"
              className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#250022] hover:bg-yellow-200 transition"
            >
              Launch Plan
            </Link>
          </div>
        </header>

        {/* Main Workspace Layout: Persistent Left Sidebar + Active Module Canvas */}
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          {/* Left Navigation Sidebar with all accessible modules */}
          <aside className="glass-panel flex flex-col justify-between rounded-[2rem] p-5 h-fit">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-white/50">
                  Universal Modules
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">
                  {snapshot.accessibleModules.length} Active
                </span>
              </div>

              {/* Scrollable list of modules */}
              <nav className="mt-4 space-y-1.5 max-h-[65vh] overflow-y-auto pr-1">
                {snapshot.accessibleModules.map((mod) => {
                  const isActive =
                    mod.route === `/dashboard/${slug}` ||
                    mod.route.endsWith(`/${slug}`) ||
                    currentModule.name === mod.name;

                  return (
                    <Link
                      key={mod.id}
                      href={mod.route}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                        isActive
                          ? "bg-gradient-to-r from-fuchsia-600/40 to-amber-500/30 text-white border border-fuchsia-400/30 shadow"
                          : "text-white/65 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{mod.name}</span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 ${isActive ? "text-yellow-300" : "text-white/20"}`}
                      />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick System Links */}
            <div className="mt-6 border-t border-white/10 pt-4 space-y-1">
              <Link
                href="/jarvis"
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-white/55 hover:text-white"
              >
                <span>Jarvis Command Core</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="/lead-intelligence"
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-white/55 hover:text-white"
              >
                <span>Lead Intelligence Engine</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="/ai-workforce"
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-white/55 hover:text-white"
              >
                <span>AI Workforce Fleet</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </aside>

          {/* Right Area: Dynamic Module View */}
          <div className="space-y-6">
            {/* If Translation AI, render interactive Translation Engine */}
            {isTranslation ? (
              <TranslationAiModule />
            ) : (
              /* Universal Dedicated Module Canvas */
              <div className="space-y-6">
                {/* Module Hero Banner */}
                <div className="glass-panel rounded-[2rem] p-7 md:p-8 border border-white/10">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yellow-200/75">
                        <span>Universal Business OS</span>
                        <span>•</span>
                        <span>{currentModule.name}</span>
                      </div>
                      <h1 className="mt-2 text-3xl md:text-4xl font-black text-white">
                        {currentModule.name} Command Center
                      </h1>
                      <p className="mt-2 text-sm text-white/60 max-w-2xl">
                        {currentModule.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-[#250022] hover:bg-yellow-200 transition">
                        <Plus className="h-4 w-4" />
                        New Entry
                      </button>
                      <Link
                        href="/super-owner"
                        className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-300" />
                        Run Diagnosis
                      </Link>
                    </div>
                  </div>

                  {/* Top quick stats cards */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs text-white/50">Active Records</p>
                      <p className="mt-1 text-2xl font-black text-white">
                        {slug === "crm"
                          ? snapshot.clients.length
                          : slug === "leads"
                          ? snapshot.leads.length
                          : slug === "projects"
                          ? snapshot.projects.length
                          : slug === "tasks"
                          ? snapshot.tasks.length
                          : slug === "products"
                          ? snapshot.catalogItems.length
                          : 24}
                      </p>
                      <span className="text-[11px] text-emerald-300 font-semibold">
                        +14% this month
                      </span>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs text-white/50">Health & Uptime</p>
                      <p className="mt-1 text-2xl font-black text-emerald-300">100%</p>
                      <span className="text-[11px] text-white/40">Real-time sync</span>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs text-white/50">AI Automation Slot</p>
                      <p className="mt-1 text-2xl font-black text-yellow-200">Active</p>
                      <span className="text-[11px] text-white/40">NOVA Neural Engine</span>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs text-white/50">Access Tier</p>
                      <p className="mt-1 text-2xl font-black text-white">Agency Pro</p>
                      <span className="text-[11px] text-white/40">Full permission</span>
                    </div>
                  </div>
                </div>

                {/* Content Section Specific to Module Type */}
                {slug === "crm" && (
                  <div className="glass-panel rounded-[2rem] p-6 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black">Client Accounts & Directory</h3>
                      <span className="text-xs text-white/50">
                        Total {snapshot.clients.length} Clients
                      </span>
                    </div>

                    <div className="space-y-3">
                      {snapshot.clients.map((client) => (
                        <div
                          key={client.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 gap-3"
                        >
                          <div>
                            <p className="font-bold text-base text-white">{client.name}</p>
                            <p className="text-xs text-white/50 mt-0.5">
                              ID: {client.id.slice(0, 8)} · Health Score: {client.healthScore}/100
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-emerald-400/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-200">
                              {client.status.toUpperCase()}
                            </span>
                            <button className="rounded-xl border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10">
                              View Profile
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slug === "leads" && (
                  <div className="glass-panel rounded-[2rem] p-6 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black">Lead Intelligence & Opportunities</h3>
                      <span className="text-xs text-white/50">
                        {snapshot.leads.length} Captured Leads
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {snapshot.leads.map((lead) => (
                        <div
                          key={lead.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-white">{lead.company || lead.name}</p>
                              <p className="text-xs text-white/50">{lead.name}</p>
                            </div>
                            <span className="rounded-full bg-yellow-200/20 border border-yellow-200/30 px-2.5 py-0.5 text-xs font-bold text-yellow-100">
                              Score: {lead.valueScore}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-white/60">
                            <span>Stage: {lead.stage}</span>
                            <span className="text-emerald-300 font-semibold">
                              Est. ৳{(lead.valueScore * 1250).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slug === "projects" && (
                  <ProjectExecutionModule initialProjects={snapshot.projects} />
                )}

                {slug === "tasks" && (
                  <TaskExecutionModule initialTasks={snapshot.tasks} />
                )}

                {(slug === "email" || slug === "communications") && (
                  <GmailDispatcherModule
                    defaultRecipient="rafiqmiahrafiq007@gmail.com"
                    workspaceName={snapshot.workspace.name}
                  />
                )}

                {/* Default Fallback for all other modules */}
                {!["crm", "leads", "projects", "tasks", "email", "communications"].includes(slug) && (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="glass-panel rounded-[2rem] p-6 border border-white/10 space-y-4">
                      <h3 className="text-xl font-black">Active Operational Workflows</h3>
                      <div className="space-y-3">
                        {snapshot.operations.slice(0, 4).map((op) => (
                          <div
                            key={op.id}
                            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm text-white">{op.title}</p>
                              <span className="text-xs text-emerald-300 font-bold">
                                {op.progress}%
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-white/45">
                              Module: {op.moduleKey} · Status: {op.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel rounded-[2rem] p-6 border border-white/10 space-y-4">
                      <h3 className="text-xl font-black">Associated Service Integrations</h3>
                      <div className="space-y-3">
                        {snapshot.integrations.slice(0, 4).map((integ) => (
                          <div
                            key={integ.id}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                          >
                            <div>
                              <p className="font-bold text-sm text-white">{integ.displayName}</p>
                              <p className="text-xs text-white/40 mt-0.5">
                                Provider: {integ.providerKey}
                              </p>
                            </div>
                            <span className="rounded-full bg-emerald-400/15 border border-emerald-400/25 px-2.5 py-1 text-xs font-bold text-emerald-300">
                              {integ.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
