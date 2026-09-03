import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFoysalOsSnapshot } from "@/lib/foysal-os";
import { InteractiveAuthPortal } from "@/components/InteractiveAuthPortal";
import {
  CheckSquare,
  FolderKanban,
  Users,
  ShieldCheck,
  Languages,
  Bot,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

function StatusPill({
  children,
  tone = "purple",
}: {
  children: ReactNode;
  tone?: "purple" | "gold" | "green" | "slate";
}) {
  const tones = {
    purple: "border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-200",
    gold: "border-yellow-200/40 bg-yellow-300/10 text-yellow-100",
    green: "border-emerald-300/35 bg-emerald-400/10 text-emerald-200",
    slate: "border-white/15 bg-white/5 text-white/70",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default async function HomePage() {
  const snapshot = await getFoysalOsSnapshot();
  const completedTasks = snapshot.tasks.filter((t) => t.status === "completed").length;

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 overflow-hidden">
      {/* Top Header Navigation */}
      <section className="relative px-4 py-5 md:px-8 lg:px-12">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3.5 shadow-xl backdrop-blur-md">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/foysal-it-logo.svg"
              alt="FOYSAL IT"
              width={42}
              height={42}
              className="rounded-xl shadow-md"
              priority
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">FOYSAL IT OS</span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold text-emerald-400">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400">Universal Enterprise Business OS</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/dashboard"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/tasks"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Tasks
            </Link>
            <Link
              href="/dashboard/projects"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Projects
            </Link>
            <Link
              href="/lead-intelligence"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Lead Intelligence
            </Link>
            <Link
              href="/jarvis"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Jarvis AI
            </Link>
            <Link
              href="/test-center"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Test Center
            </Link>
            <Link
              href="/final-check"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Final Check
            </Link>
            <Link
              href="/super-owner"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm"
            >
              <span>Super Owner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>

        {/* Hero & Login Section */}
        <div className="mx-auto grid max-w-7xl gap-8 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left Column: Value Proposition & Direct Navigation */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="green">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Production PostgreSQL Active
              </StatusPill>
              <StatusPill tone="gold">100% Workspace Tenant Isolation</StatusPill>
              <StatusPill tone="purple">Enterprise AI & Automation</StatusPill>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
                Unified Operating System for High-Growth Businesses
              </h1>
              <p className="mt-4 text-base text-slate-400 max-w-xl leading-relaxed">
                Transform business operations with integrated Lead Intelligence, CRM Pipeline, 
                Milestone Project Delivery, Task Execution with Confirmation Guardrails, and NOVA AI.
              </p>
            </div>

            {/* Quick Access CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition"
              >
                <Zap className="h-4 w-4" />
                <span>Enter Dashboard</span>
              </Link>
              <Link
                href="/dashboard/tasks"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 px-4 py-3 text-xs font-semibold text-slate-200 transition"
              >
                <CheckSquare className="h-4 w-4 text-indigo-400" />
                <span>Task Execution</span>
              </Link>
              <Link
                href="/dashboard/projects"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 px-4 py-3 text-xs font-semibold text-slate-200 transition"
              >
                <FolderKanban className="h-4 w-4 text-sky-400" />
                <span>Project Tracks</span>
              </Link>
              <Link
                href="/super-owner"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 px-4 py-3 text-xs font-semibold text-slate-200 transition"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Super Owner</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-xs text-slate-500">Leads Captured</span>
                <p className="mt-0.5 text-lg font-bold text-white">{snapshot.leads.length}</p>
                <span className="text-[10px] text-emerald-400 font-medium">Scored 0–100</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-xs text-slate-500">Active Tasks</span>
                <p className="mt-0.5 text-lg font-bold text-white">{snapshot.tasks.length}</p>
                <span className="text-[10px] text-indigo-400 font-medium">{completedTasks} completed</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-xs text-slate-500">Projects</span>
                <p className="mt-0.5 text-lg font-bold text-white">{snapshot.projects.length}</p>
                <span className="text-[10px] text-sky-400 font-medium">Milestone tracks</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-xs text-slate-500">Security Score</span>
                <p className="mt-0.5 text-lg font-bold text-emerald-400">100/100</p>
                <span className="text-[10px] text-slate-400 font-medium">Strict isolation</span>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Interactive Authentication Portal */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-md">
            <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/foysal-it-logo.svg"
                  alt="FOYSAL IT"
                  width={44}
                  height={44}
                  className="rounded-xl shadow"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Secure Workspace Access
                  </span>
                  <h2 className="text-xl font-bold text-white">Sign In to FOYSAL IT OS</h2>
                </div>
              </div>

              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                1-Click Ready
              </span>
            </div>

            {/* The Full Interactive Authentication Portal Component */}
            <InteractiveAuthPortal initialMode="signin" />
          </div>
        </div>
      </section>

      {/* 4 Core Architectural Capabilities */}
      <section className="px-4 py-12 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Core Operational Subsystems</h2>
            <p className="text-xs text-slate-400">Production capabilities built on real database records</p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
          >
            <span>Explore All 32 Modules</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pillar 1 */}
          <Link
            href="/lead-intelligence"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/40 hover:bg-slate-900/90 transition shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 group-hover:scale-105 transition">
                <Users className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition" />
            </div>
            <h3 className="mt-3 font-bold text-white text-base">Lead Intelligence & Audit</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Automated website crawler, SEO gap detector, multi-factor scoring (0–100), and approval-gated outreach drafts.
            </p>
          </Link>

          {/* Pillar 2 */}
          <Link
            href="/dashboard/tasks"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/40 hover:bg-slate-900/90 transition shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-sky-500/10 p-2.5 text-sky-400 group-hover:scale-105 transition">
                <CheckSquare className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-sky-400 transition" />
            </div>
            <h3 className="mt-3 font-bold text-white text-base">Task Execution Control</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Task sorting dropdown by Due Date or Priority, progress toggles, and destructive confirmation modals.
            </p>
          </Link>

          {/* Pillar 3 */}
          <Link
            href="/dashboard/projects"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/40 hover:bg-slate-900/90 transition shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400 group-hover:scale-105 transition">
                <FolderKanban className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition" />
            </div>
            <h3 className="mt-3 font-bold text-white text-base">Project Milestone Delivery</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Dynamic milestone tracks, progress resets with confirmation modals, and CRM client account synchronization.
            </p>
          </Link>

          {/* Pillar 4 */}
          <Link
            href="/dashboard/translation"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/40 hover:bg-slate-900/90 transition shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 group-hover:scale-105 transition">
                <Languages className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition" />
            </div>
            <h3 className="mt-3 font-bold text-white text-base">NOVA Translation & Voice</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Bi-directional meeting translator for English, Bangla, and international markets with text-to-speech replay.
            </p>
          </Link>
        </div>
      </section>

      {/* Footer Navigation Bar */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 px-4 py-8 md:px-8 lg:px-12 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">FOYSAL IT OS</span>
            <span>·</span>
            <span>Enterprise Business Operating System</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/dashboard/tasks" className="hover:text-white transition">Tasks</Link>
            <Link href="/dashboard/projects" className="hover:text-white transition">Projects</Link>
            <Link href="/super-owner" className="hover:text-white transition">Super Owner</Link>
            <Link href="/test-center" className="hover:text-white transition">Test Center</Link>
            <Link href="/final-check" className="hover:text-white transition">Final Check</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
