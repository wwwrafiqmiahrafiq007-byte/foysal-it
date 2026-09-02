import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

function Tile({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-white/55">{detail}</p>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-yellow-200/25 bg-yellow-200/10 px-3 py-1 text-xs font-bold text-yellow-100">{children}</span>;
}

export default async function DashboardPage() {
  const snapshot = await getFoysalOsSnapshot();
  const currentPlan = snapshot.subscription?.plan;
  const onboardingDone = snapshot.onboarding.filter((item) => item.completed).length;

  return (
    <main className="min-h-screen px-5 py-5 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="glass-panel rounded-[2rem] p-5 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/foysal-it-mark.svg" alt="FOYSAL IT" width={46} height={46} className="rounded-2xl" />
            <div>
              <p className="font-black tracking-[0.16em]">FOYSAL IT OS</p>
              <p className="text-xs text-white/45">Unified Workspace</p>
            </div>
          </Link>
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white/50">Workspace</p>
            <p className="mt-1 font-black">{snapshot.workspace.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-emerald-200">{snapshot.workspace.status}</p>
          </div>
          <nav className="mt-5 space-y-2 overflow-auto pr-1 lg:max-h-[58vh]">
            {snapshot.accessibleModules.map((module) => (
              <a key={module.id} href={module.route} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/72 transition hover:bg-white/[0.08] hover:text-white">
                <span>{module.name}</span>
                <span className="text-white/25">→</span>
              </a>
            ))}
          </nav>
          <Link href="/final-check" className="mt-5 block rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-[#250022]">Final Check</Link>
          <Link href="/test-center" className="mt-3 block rounded-2xl border border-yellow-200/30 bg-yellow-200/10 px-4 py-3 text-center text-sm font-black text-yellow-100">Test Center</Link>
          <Link href="/subscription-launch" className="mt-3 block rounded-2xl border border-white/15 bg-white/[0.055] px-4 py-3 text-center text-sm font-black text-white/80">Subscription Launch</Link>
          <Link href="/app-center" className="mt-3 block rounded-2xl border border-white/15 bg-white/[0.055] px-4 py-3 text-center text-sm font-black text-white/80">App Center</Link>
          <Link href="/ai-workforce" className="mt-3 block rounded-2xl border border-white/15 bg-white/[0.055] px-4 py-3 text-center text-sm font-black text-white/80">AI Workforce</Link>
          <Link href="/jarvis" className="mt-3 block rounded-2xl border border-white/15 bg-white/[0.055] px-4 py-3 text-center text-sm font-black text-white/80">Jarvis Core</Link>
          <Link href="/lead-intelligence" className="mt-3 block rounded-2xl border border-white/15 bg-white/[0.055] px-4 py-3 text-center text-sm font-black text-white/80">Lead Intelligence</Link>
          <Link href="/super-owner" className="mt-3 block rounded-2xl bg-gradient-to-r from-fuchsia-500 to-yellow-300 px-4 py-3 text-center text-sm font-black text-[#250022]">Super Owner Control</Link>
        </aside>

        <section className="space-y-5">
          <div className="glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Pill>Account: {snapshot.owner.accountStatus}</Pill>
                  <Pill>Role: {snapshot.owner.roleLabel}</Pill>
                  <Pill>Plan: {currentPlan?.name ?? "Free"}</Pill>
                </div>
                <h1 className="text-4xl font-black tracking-[-0.04em] md:text-6xl">2026 Enterprise AI Workspace for work, business, creation, development, marketing, sales, communication, analytics, reporting, automation, and growth.</h1>
                <p className="mt-4 max-w-3xl text-white/65">One FOYSAL IT identity, one workspace, one NOVA orchestrator: Business + Agency + Marketing + SEO + Development + Content + Creative + Office + Data + Education + Career + Communication + Automation.</p>
              </div>
              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-5 text-center">
                <p className="text-sm text-white/55">Security Score</p>
                <p className="text-5xl font-black text-emerald-100">{snapshot.security?.securityScore ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Tile label="Clients" value={snapshot.clients.length} detail="CRM records connected to workspace" />
            <Tile label="Active Modules" value={snapshot.accessibleModules.length} detail="Filtered by role + entitlement" />
            <Tile label="Target Experiences" value={snapshot.targetSegments.length} detail="Dedicated user journeys available" />
            <Tile label="Onboarding" value={`${onboardingDone}/${snapshot.onboarding.length}`} detail="Getting started checklist" />
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Professional Profile</h2>
              <p className="mt-2 text-sm text-white/55">Privacy controls decide what others can see.</p>
              <div className="mt-5 space-y-3 text-sm text-white/68">
                <p><span className="text-white/40">Title:</span> {snapshot.profile?.professionalTitle}</p>
                <p><span className="text-white/40">Bio:</span> {snapshot.profile?.bio}</p>
                <p><span className="text-white/40">Website:</span> {snapshot.profile?.website}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {snapshot.profile?.skills.map((skill) => <Pill key={skill}>{skill}</Pill>)}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">First Login Onboarding</h2>
              <p className="mt-2 text-sm text-white/55">Welcome → Profile → Role → Industry → Workspace → Language → Timezone → Preferences → Recommended Tools → Integrations</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-white/40 text-sm">What they do</p><p className="font-bold">{snapshot.onboardingPreference?.whatTheyDo}</p></div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-white/40 text-sm">Industry</p><p className="font-bold">{snapshot.onboardingPreference?.industry}</p></div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-white/40 text-sm">Business type</p><p className="font-bold">{snapshot.onboardingPreference?.businessType}</p></div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-white/40 text-sm">Language / Timezone</p><p className="font-bold">{snapshot.onboardingPreference?.preferredLanguage} · {snapshot.onboardingPreference?.preferredTimezone}</p></div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">Dedicated Target User Experiences</h2>
                <p className="mt-2 text-sm text-white/55">Business owners, agencies, marketers, SEO/AEO/GEO specialists, creators, developers, analysts, teachers, students, affiliates, and enterprise teams get recommended tools automatically.</p>
              </div>
              <a href="/api/onboarding/target-users" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Target Users API</a>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {snapshot.targetSegments.map((segment) => <Pill key={segment.id}>{segment.label}</Pill>)}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">Role-Based Customizable Widgets</h2>
                <p className="mt-2 text-sm text-white/55">Tasks, projects, leads, customers, sales, revenue, marketing, SEO, local SEO, ads, content, meetings, files, AI usage, affiliate, education, reports, and notifications.</p>
              </div>
              <a href="/api/dashboard/widgets" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Widgets API</a>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {snapshot.dashboardWidgets.map((widget) => (
                <div key={widget.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <p className="font-bold">{widget.label}</p>
                  <p className="mt-2 text-xs text-white/45">{widget.customizable ? "Customizable" : "Fixed"} · {widget.defaultVisible ? "Visible" : "Hidden"}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Getting Started</h2>
              <div className="mt-5 space-y-3">
                {snapshot.onboarding.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold">{item.completed ? "✓" : "○"} {item.title}</p>
                      <span className="text-xs text-white/40">#{item.sortOrder}</span>
                    </div>
                    <p className="mt-2 text-sm text-white/55">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Live Business Operations</h2>
              <div className="mt-5 space-y-3">
                {snapshot.operations.map((operation) => (
                  <div key={operation.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">{operation.title}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/35">{operation.moduleKey}</p>
                      </div>
                      <Pill>{operation.status}</Pill>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-yellow-300" style={{ width: `${operation.progress}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Business Setup</h2>
              <div className="mt-5 space-y-3 text-sm text-white/68">
                <p><span className="text-white/40">Business:</span> {snapshot.businessProfile?.businessName}</p>
                <p><span className="text-white/40">Industry:</span> {snapshot.businessProfile?.industry}</p>
                <p><span className="text-white/40">Type:</span> {snapshot.businessProfile?.businessType}</p>
                <p><span className="text-white/40">Location:</span> {snapshot.businessProfile?.location}</p>
                <p><span className="text-white/40">Currency:</span> {snapshot.businessProfile?.currency}</p>
                <p><span className="text-white/40">Contact:</span> {snapshot.businessProfile?.contactEmail}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {snapshot.businessProfile?.configuredAgents.map((agent) => <Pill key={agent}>{agent}</Pill>)}
              </div>
              <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-50">
                Tenant isolation active: this dashboard only queries records where workspace_id = {snapshot.workspace.slug}.
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Universal Business Engine</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {snapshot.catalogItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="font-bold">{item.name}</p>
                    <p className="mt-1 text-sm text-white/50">{item.itemType} · Qty {item.quantity} · {item.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">CRM Pipeline</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {snapshot.leads.map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-bold">{lead.name}</p>
                    <p className="mt-1 text-sm text-white/50">{lead.company} · {lead.stage.replaceAll("_", " ")}</p>
                    <p className="mt-2 text-xs text-yellow-100">Next: {lead.nextStep}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Project Workflow</h2>
              <p className="mt-2 text-sm text-white/55">Not Started → In Progress → Review → Client Approval → Completed, with Blocked and Overdue support.</p>
              <div className="mt-5 space-y-3">
                {snapshot.projects.map((project) => (
                  <div key={project.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold">{project.name}</p>
                      <Pill>{project.status.replaceAll("_", " ")}</Pill>
                    </div>
                    <p className="mt-1 text-sm text-white/50">{project.priority} priority · {project.progress}% complete · Kanban/List/Calendar</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">Universal AI Command</h2>
                <p className="mt-2 text-sm text-white/55">One command box can plan: Research → Strategy → SEO → Content → Creative → Ads → CRM → Tasks → Calendar → Reports.</p>
              </div>
              <a href="/api/ai/command" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Command API</a>
            </div>
            <div className="mt-5 rounded-3xl border border-yellow-200/20 bg-yellow-200/10 p-5">
              <p className="text-sm text-white/50">Example command</p>
              <p className="mt-2 text-2xl font-black text-yellow-100">“Create a complete marketing campaign for my business.”</p>
              <p className="mt-3 text-sm text-white/62">External publishing, payments, deletion, ad spend, CRM bulk updates, and client-facing sends require authorization/confirmation.</p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {snapshot.aiCommandRuns.at(0)?.planSteps.map((step) => <div key={step} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm font-bold text-white/75">{step}</div>)}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">NOVA Master Orchestrator</h2>
                <a href="/api/ai/orchestrator" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Orchestrator API</a>
              </div>
              <p className="mt-2 text-sm text-white/55">NOVA is the AI router + planner + orchestrator. User → Moderator → Agents → Tools → Results → Moderator → User.</p>
              <div className="mt-5 rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4">
                <p className="text-sm text-white/55">Sample request</p>
                <p className="mt-1 font-black text-yellow-100">“আমার YouTube channel-এর complete SEO audit করো।”</p>
                <p className="mt-2 text-sm text-white/60">Moderator selects Research, YouTube SEO, Content, and Analytics agents, then combines a final professional report.</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {snapshot.orchestrationRuns.at(0)?.selectedAgents.map((agent) => <Pill key={agent}>{agent}</Pill>)}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">AI Model Router & Fallback</h2>
                <a href="/api/ai/model-router" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Router API</a>
              </div>
              <p className="mt-2 text-sm text-white/55">NOVA chooses coding, research, office, image, video, voice, translation, or cost-efficient models based on capabilities and configured providers.</p>
              <div className="mt-5 space-y-3">
                {snapshot.aiProviders.map((provider) => (
                  <div key={provider.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3"><p className="font-bold">{provider.displayName}</p><span className="text-xs text-yellow-100">{provider.availabilityLabel}</span></div>
                    <p className="mt-1 text-xs text-white/45">{provider.configuredStatus} · {provider.workloads.slice(0, 4).join(" · ")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">AI Agent Hub</h2>
                <a href="/api/ai/agent-hub" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Hub API</a>
              </div>
              <p className="mt-2 text-sm text-white/55">Marketplace categories include Development, Marketing, Content, Creative, Business, Office, and Career.</p>
              <div className="mt-5 grid gap-2 md:grid-cols-3">
                {snapshot.agentHub.slice(0, 18).map((agent) => <Pill key={agent.id}>{agent.name}</Pill>)}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">AI Agent Builder</h2>
                <a href="/api/ai/agent-builder" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Builder API</a>
              </div>
              <p className="mt-2 text-sm text-white/55">Custom Agent, instructions, knowledge, tools, permissions, trigger, workflow, output, approval, and limits.</p>
              <div className="mt-5 space-y-3">
                {snapshot.customAiAgents.map((agent) => (
                  <div key={agent.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3"><p className="font-bold">{agent.name}</p><Pill>{agent.approvalRequired ? "Approval required" : "Auto"}</Pill></div>
                    <p className="mt-2 text-sm text-white/55">{agent.instructions}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">AI Knowledge Base</h2>
                <a href="/api/ai/knowledge" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Knowledge API</a>
              </div>
              <p className="mt-2 text-sm text-white/55">NOVA uses only authorized company, product, service, brand, SOP, FAQ, client, and project knowledge.</p>
              <div className="mt-5 grid gap-2 md:grid-cols-3">
                {snapshot.knowledgeDocuments.map((doc) => <Pill key={doc.id}>{doc.title}</Pill>)}
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">Complete OS Capability Suite</h2>
                <p className="mt-2 text-sm text-white/55">Business, CRM, Agency, B2B, B2C, Sales, Affiliate, CPA, Digital Marketing, SEO Pro, AEO, GEO, Local SEO, GBP, Backlinks, GTM, GA4, Pixels, Tracking Health AI, UI/UX Studio, and Content Creator Studio.</p>
              </div>
              <a href="/api/os/capabilities" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Capabilities API</a>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
              {snapshot.osCapabilities.map((capability) => (
                <div key={capability.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <p className="font-bold">{capability.name}</p>
                  <p className="mt-2 text-xs text-white/45">{capability.features.length} features · {capability.mode.replaceAll("_", " ")}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">Content Repurposing</h2>
                <a href="/api/content/repurposing" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">API</a>
              </div>
              <p className="mt-2 text-sm text-white/55">One Content → Many Content: Blog → Facebook, LinkedIn, Instagram, YouTube Script, Reel, Short, Email, Ad.</p>
              <div className="mt-5 space-y-3">
                {snapshot.contentRepurposingPlans.map((plan) => (
                  <div key={plan.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-bold">{plan.sourceTitle}</p>
                    <p className="mt-2 text-sm text-white/55">{plan.targetFormats.join(" · ")}</p>
                    <p className="mt-2 text-xs text-yellow-100">Publishing: {plan.publishingStatus.replaceAll("_", " ")} · approval required</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">Brand Voice</h2>
                <a href="/api/brand/voice" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">API</a>
              </div>
              <div className="mt-5 space-y-3 text-sm text-white/65">
                <p><span className="text-white/40">Brand:</span> {snapshot.brandVoice?.brandName}</p>
                <p><span className="text-white/40">Tone:</span> {snapshot.brandVoice?.tone}</p>
                <p><span className="text-white/40">Audience:</span> {snapshot.brandVoice?.audience}</p>
                <p><span className="text-white/40">CTA:</span> {snapshot.brandVoice?.cta}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">{snapshot.brandVoice?.keywords.map((keyword) => <Pill key={keyword}>{keyword}</Pill>)}</div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-black">Creative Studios</h2><a href="/api/creative/studios" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">API</a></div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {snapshot.creativeStudioProjects.map((project) => (
                  <div key={project.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="font-bold">{project.title}</p>
                    <p className="mt-1 text-sm text-white/50">{project.studioType} · {project.providerStatus.replaceAll("_", " ")}</p>
                    <p className="mt-2 text-xs text-white/40">{project.features.slice(0, 5).join(" · ")}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-black">Data Entry, Cleaning, Migration & QA</h2><a href="/api/data/operations" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">API</a></div>
              <div className="mt-5 space-y-3">
                {snapshot.dataOperations.map((operation) => (
                  <div key={operation.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3"><p className="font-bold">{operation.title}</p><Pill>{operation.validationState}</Pill></div>
                    <p className="mt-2 text-sm text-white/50">Quality {operation.qualityScore}% · rollback {operation.rollbackFeasible ? "where feasible" : "not required"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-black">Office, Files & Calendar</h2><a href="/api/office/workspace" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">API</a></div>
              <p className="mt-2 text-sm text-white/55">DOCX, XLSX, PPTX, PDF and CSV workflows are supported as common compatibility workflows, not a claim to reproduce every proprietary Office feature.</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {snapshot.officeAssets.map((asset) => <div key={asset.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"><p className="font-bold">{asset.title}</p><p className="mt-1 text-sm text-white/50">{asset.format} · v{asset.version}</p></div>)}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">{snapshot.calendarEvents.map((event) => <Pill key={event.id}>{event.title}</Pill>)}</div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Remote & Multilingual Live Meeting</h2>
              <p className="mt-2 text-sm text-white/55">Create meetings, participants, mic/camera/screen share/chat, recording where permitted, live transcript, AI summary, action items, live translation, and voice output.</p>
              <div className="mt-5 space-y-3">
                {snapshot.remoteMeetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-bold">{meeting.title}</p>
                    <p className="mt-1 text-sm text-yellow-100">Provider: {meeting.providerStatus.replaceAll("_", " ")} · {meeting.liveStatus.replaceAll("_", " ")}</p>
                    <p className="mt-2 text-xs text-white/45">{meeting.liveIndicators.join(" · ")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">NOVA AI Intelligence Layer</h2>
              <div className="mt-5 grid gap-2 md:grid-cols-3">
                {snapshot.aiAgents.map((agent) => <Pill key={agent.id}>{agent.name}</Pill>)}
              </div>
              <div className="mt-5 space-y-3">
                {snapshot.aiOutputs.map((output) => (
                  <div key={output.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <div className="flex items-center justify-between gap-3"><p className="font-bold">{output.title}</p><span className={output.verified ? "text-emerald-200" : "text-yellow-100"}>{output.dataSource.replaceAll("_", " ")}</span></div>
                    <p className="mt-2 text-sm text-white/55">{output.summary}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Affiliate, CPA & Tracking</h2>
              <div className="mt-5 space-y-3">
                {snapshot.affiliatePrograms.map((program) => (
                  <div key={program.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="font-bold">{program.programName}</p>
                    <p className="mt-1 text-sm text-white/50">{program.flow.join(" → ")}</p>
                  </div>
                ))}
                {snapshot.cpaCampaigns.map((campaign) => (
                  <div key={campaign.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="font-bold">{campaign.campaignName}</p>
                    <p className="mt-1 text-sm text-white/50">{campaign.flow.join(" → ")} · {campaign.reportingMode.replaceAll("_", " ")}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-2 md:grid-cols-2">
                {snapshot.trackingMatrixEvents.slice(0, 6).map((event) => <Pill key={event.id}>{event.businessAction}: {event.healthStatus}</Pill>)}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Voice, Translation & Meeting AI</h2>
              <p className="mt-2 text-sm text-white/55">Official authorization/API connections required. Disconnected services are never shown as connected.</p>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"><p className="font-bold">Voice AI</p><p className="mt-1 text-sm text-yellow-100">Speech-to-Text: {snapshot.voiceAi?.speechToTextStatus.replaceAll("_", " ")} · TTS: {snapshot.voiceAi?.textToSpeechStatus.replaceAll("_", " ")}</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"><p className="font-bold">Translation</p><p className="mt-1 text-sm text-yellow-100">{snapshot.translation?.status.replaceAll("_", " ")} · Bengali, English, German, Chinese, French, Spanish</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"><p className="font-bold">Meeting AI</p><p className="mt-1 text-sm text-yellow-100">Google Meet: {snapshot.meeting?.googleMeetStatus.replaceAll("_", " ")} · Calendar: {snapshot.meeting?.calendarStatus.replaceAll("_", " ")}</p></div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-black">Production Readiness</h2><a href="/api/platform/readiness" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">API</a></div>
              <p className="mt-2 text-sm text-white/55">Backup status is only shown from actual infrastructure. Preview items use NO DATA, NOT CONNECTED, or AUTHORIZATION REQUIRED.</p>
              <div className="mt-5 grid gap-2 md:grid-cols-2">
                {snapshot.productionReadinessItems.slice(0, 8).map((item) => <Pill key={item.id}>{item.name}: {item.statusLabel}</Pill>)}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-black">+ Create · Import · Export</h2><a href="/api/actions/universal" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">API</a></div>
              <p className="mt-2 text-sm text-white/55">Dynamic universal creation with import flow: Upload → Preview → Mapping → Validation → Approval → Import.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {snapshot.universalActionOptions.filter((option) => option.actionType === "create").slice(0, 12).map((option) => <Pill key={option.id}>{option.label}</Pill>)}
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-black">Globalization & White Label</h2><a href="/api/platform/localization-branding" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">API</a></div>
              <div className="mt-5 space-y-3 text-sm text-white/65">
                <p><span className="text-white/40">Languages:</span> {snapshot.globalization?.languages.join(", ")}</p>
                <p><span className="text-white/40">Currencies:</span> {snapshot.globalization?.currencies.join(", ")}</p>
                <p><span className="text-white/40">White label:</span> {snapshot.whiteLabel?.brandName} · {snapshot.whiteLabel?.statusLabel}</p>
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-black">AI Memory & Human Approval</h2><a href="/api/ai/memory" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Memory API</a></div>
              <p className="mt-2 text-sm text-white/55">Controlled memory supports View → Edit → Delete → Disable. Important operations follow AI Draft → Human Review → Approval → Action.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {snapshot.aiMemoryItems.map((memory) => <Pill key={memory.id}>{memory.title}</Pill>)}
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">Universal Workflows, Real Data & Final Structure</h2>
                <p className="mt-2 text-sm text-white/55">Independent → Permission-aware → API-ready → Scalable → Testable → Replaceable modules. Never fabricate unavailable data.</p>
              </div>
              <div className="flex gap-2"><a href="/api/workflows/universal" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Workflows API</a><a href="/api/platform/final-structure" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75">Structure API</a></div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
              {snapshot.finalStructureSections.map((section) => <div key={section.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"><p className="font-bold">{section.icon} {section.title}</p><p className="mt-2 text-xs text-white/45">{section.modules.join(" · ")}</p></div>)}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">CRM Clients</h2>
              <div className="mt-5 space-y-3">
                {snapshot.clients.map((client) => (
                  <div key={client.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="font-bold">{client.name}</p>
                    <p className="mt-1 text-sm text-white/50">{client.status} · Health {client.healthScore}%</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">Integrations</h2>
              <div className="mt-5 space-y-3">
                {snapshot.integrations.map((integration) => (
                  <div key={integration.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="font-bold">{integration.displayName}</p>
                    <p className="mt-1 text-sm text-white/50">{integration.status} · tokenized · secrets hidden</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">API Center</h2>
              <div className="mt-5 space-y-3">
                {snapshot.apiKeys.map((key) => (
                  <div key={key.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="font-bold">{key.name}</p>
                    <p className="mt-1 text-sm text-white/50">Prefix: {key.keyPrefix}•••• · hash/secret never displayed</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
