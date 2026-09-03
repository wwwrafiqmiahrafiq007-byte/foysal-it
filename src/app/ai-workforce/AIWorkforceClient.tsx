"use client";

import type { ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";

type Employee = {
  id: string;
  name: string;
  department: string;
  level: number;
  role: string;
  skills: string[];
  tools: string[];
  permissions: string[];
  status: string;
  managerEmployeeKey: string | null;
  performanceScore: number;
  successRate: number;
  tasksCompleted: number;
  tasksFailed: number;
  usageUnits: number;
  estimatedCostCents: number;
};

type Snapshot = {
  employees: Employee[];
  humans: Array<{ id: string; name: string; department: string; role: string; status: string; aiCollaborationMode: string; performanceScore: number }>;
  tasks: Array<{ id: string; taskCode: string; objective: string; status: string; result: string | null; verification: string | null; approvalStatus: string }>;
  approvals: Array<{ id: string; title: string; preview: string; riskLevel: string; status: string; allowedActions: string[] }>;
  activities: Array<{ id: string; eventType: string; description: string; createdAt: string | Date }>;
  providers: Array<{ id: string; displayName: string; configuredStatus: string; availabilityLabel: string }>;
  departmentCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  counts: { aiEmployees: number; humanEmployees: number; tasks: number; approvals: number; leads: number; audits: number };
  modes: string[];
  operatingModel: string[];
  noFakeRule: string;
};

function Pill({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "green" | "red" | "slate" }) {
  const tones = {
    gold: "border-yellow-200/25 bg-yellow-200/10 text-yellow-100",
    green: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    red: "border-rose-300/25 bg-rose-400/10 text-rose-100",
    slate: "border-white/15 bg-white/[0.055] text-white/70",
  };
  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function toneForStatus(status: string) {
  if (/completed|idle|available/i.test(status)) return "green" as const;
  if (/failed|error/i.test(status)) return "red" as const;
  if (/approval|required|not configured|waiting/i.test(status)) return "gold" as const;
  return "slate" as const;
}

export function AIWorkforceClient({ initial }: { initial: Snapshot }) {
  const [snapshot, setSnapshot] = useState(initial);
  const [department, setDepartment] = useState("All");
  const [objective, setObjective] = useState("Run today's business and prepare a priority report.");
  const [result, setResult] = useState("Ready. Assign a task to the AI workforce or review approvals.");
  const [isPending, startTransition] = useTransition();

  const departments = useMemo(() => ["All", ...Object.keys(snapshot.departmentCounts).sort()], [snapshot.departmentCounts]);
  const employees = department === "All" ? snapshot.employees : snapshot.employees.filter((employee) => employee.department === department);

  async function refresh() {
    const response = await fetch("/api/workforce/overview");
    const data = await response.json();
    setSnapshot(data);
  }

  function run(label: string, action: () => Promise<unknown>) {
    setResult(`${label}: Loading...`);
    startTransition(async () => {
      try {
        const data = await action();
        setResult(JSON.stringify(data, null, 2));
        await refresh();
      } catch (error) {
        setResult(`${label}: Error — ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  }

  async function postJson(url: string, body: unknown) {
    const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return response.json();
  }

  return (
    <div className="space-y-5">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-yellow-200/75">AI + Human Workforce OS</p>
            <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-[-0.05em] md:text-6xl">200+ AI employees coordinated by NOVA, humans, approvals and n8n automation.</h1>
            <p className="mt-4 max-w-4xl text-white/65">Not static cards: every employee is a database record connected to role, instructions, tools, permissions, memory scopes, task system, activity logs, performance, cost, escalation and human approval.</p>
          </div>
          <div className="grid min-w-80 grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-sm text-white/45">AI Employees</p><p className="text-3xl font-black">{snapshot.counts.aiEmployees}</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-sm text-white/45">Humans</p><p className="text-3xl font-black">{snapshot.counts.humanEmployees}</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-sm text-white/45">Tasks</p><p className="text-3xl font-black">{snapshot.counts.tasks}</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-sm text-white/45">Approvals</p><p className="text-3xl font-black">{snapshot.counts.approvals}</p></div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">EZY Chat → Workforce Command</h2>
          <p className="mt-2 text-sm text-white/55">Owner commands become structured tasks. External communication, calls, ads spend, payment, delete, security and production changes require approval.</p>
          <textarea aria-label="AI workforce objective" value={objective} onChange={(event) => setObjective(event.target.value)} className="mt-5 min-h-28 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 outline-none focus:border-yellow-200" />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <button disabled={isPending} onClick={() => run("Assign task", () => postJson("/api/workforce/tasks", { objective }))} className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-yellow-300 px-4 py-3 font-black text-[#250022] disabled:opacity-50">Assign to NOVA</button>
            <button disabled={isPending} onClick={() => run("Create AI employee", () => postJson("/api/workforce/employees", { name: "Custom Growth Agent", department: "Marketing", role: "Growth Specialist", purpose: "Find growth opportunities using authorized workspace data." }))} className="rounded-2xl border border-white/15 px-4 py-3 font-bold text-white/80 disabled:opacity-50">Hire AI Employee</button>
          </div>
          <pre className="mt-5 max-h-72 overflow-auto rounded-2xl border border-white/10 bg-black/35 p-4 text-xs leading-5 text-white/70">{result}</pre>
        </div>

        <div className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">Operating Model</h2>
          <div className="mt-5 grid gap-2 md:grid-cols-3">
            {snapshot.operatingModel.map((item) => <Pill key={item}>{item}</Pill>)}
          </div>
          <div className="mt-5 rounded-2xl border border-yellow-200/20 bg-yellow-200/10 p-4 text-sm text-yellow-50">{snapshot.noFakeRule}</div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {snapshot.providers.map((provider) => <div key={provider.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-bold">{provider.displayName}</p><p className="mt-1 text-sm text-yellow-100">{provider.availabilityLabel} · {provider.configuredStatus}</p></div>)}
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div><h2 className="text-2xl font-black">AI Workforce Manager</h2><p className="mt-2 text-sm text-white/55">Filter departments, inspect permissions, status, usage and performance.</p></div>
          <select value={department} onChange={(event) => setDepartment(event.target.value)} className="rounded-2xl border border-white/10 bg-[#250022] px-4 py-3 text-sm font-bold outline-none focus:border-yellow-200">
            {departments.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(snapshot.departmentCounts).sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => <button key={name} onClick={() => setDepartment(name)} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left"><p className="font-bold">{name}</p><p className="mt-1 text-3xl font-black text-yellow-100">{count}</p></button>)}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {employees.slice(0, 60).map((employee) => <div key={employee.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black">{employee.name}</p><p className="text-sm text-white/45">{employee.department} · Level {employee.level}</p></div><Pill tone={toneForStatus(employee.status)}>{employee.status}</Pill></div><p className="mt-2 text-sm text-white/60">{employee.role}</p><div className="mt-3 flex flex-wrap gap-2"><Pill tone="slate">Success {employee.successRate}%</Pill><Pill tone="slate">Tasks {employee.tasksCompleted}</Pill><Pill tone="slate">Cost ${(employee.estimatedCostCents / 100).toFixed(2)}</Pill></div></div>)}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="glass-panel rounded-[2rem] p-6"><h2 className="text-2xl font-black">AI Approval Center</h2><div className="mt-5 space-y-3">{snapshot.approvals.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold">{item.title}</p><Pill tone={toneForStatus(item.status)}>{item.status}</Pill></div><p className="mt-2 text-sm text-white/55">{item.preview}</p><div className="mt-3 flex flex-wrap gap-2">{(item.allowedActions ?? ["Approve", "Reject"]).map((action) => <button key={action} onClick={() => run(action, () => postJson("/api/workforce/approvals", { id: item.id, action }))} className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/75">{action}</button>)}</div></div>)}</div></div>
        <div className="glass-panel rounded-[2rem] p-6"><h2 className="text-2xl font-black">Human + AI Team</h2><div className="mt-5 space-y-3">{snapshot.humans.map((human) => <div key={human.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between"><p className="font-bold">{human.name}</p><Pill tone="green">{human.status}</Pill></div><p className="mt-1 text-sm text-white/55">{human.department} · {human.role} · {human.aiCollaborationMode}</p></div>)}</div></div>
      </section>

      <section className="glass-panel rounded-[2rem] p-6"><h2 className="text-2xl font-black">Workforce Activity & Tasks</h2><div className="mt-5 grid gap-5 lg:grid-cols-2"><div className="space-y-3">{snapshot.tasks.map((task) => <div key={task.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-bold">{task.taskCode}</p><p className="mt-1 text-sm text-white/55">{task.objective}</p><p className="mt-2 text-xs text-yellow-100">{task.status} · {task.approvalStatus}</p></div>)}</div><div className="space-y-3">{snapshot.activities.map((activity) => <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"><p className="font-bold">{activity.eventType}</p><p className="mt-1 text-sm text-white/55">{activity.description}</p></div>)}</div></div></section>
    </div>
  );
}
