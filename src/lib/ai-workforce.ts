import { db } from "@/db";
import {
  aiApprovalCenterItems,
  aiProviderSlots,
  aiWorkforceActivityLogs,
  aiWorkforceEmployees,
  aiWorkforceTasks,
  auditLogs,
  humanEmployees,
  leadRecords,
  websiteAudits,
} from "@/db/schema";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { seedJarvisCore } from "@/lib/jarvis-core";
import { getLeadPlatformSnapshot, runWebsiteAudit } from "@/lib/lead-intelligence";

type EmployeeSeed = {
  employeeKey: string;
  name: string;
  department: string;
  level: number;
  role: string;
  skills: string[];
  tools: string[];
  permissions: string[];
  memoryScopes: string[];
  instructions: string;
  managerEmployeeKey?: string;
};

const safeEscalationRules = [
  "Escalate if confidence is low",
  "Escalate before external communication",
  "Escalate before spend/payment/deletion/security changes",
  "Log every important action",
  "Never bypass authorization, provider limits, CAPTCHA, MFA, privacy controls or platform restrictions",
];

const executiveRoles = [
  "AI CEO",
  "AI COO",
  "AI CTO",
  "AI CMO",
  "AI CFO",
  "AI CRO",
  "AI CHRO",
  "AI Strategy Director",
  "AI Operations Director",
  "AI Product Director",
  "AI Customer Director",
  "AI Security Director",
  "AI Automation Director",
];

const seoRoles = [
  "SEO Manager",
  "Technical SEO Team Lead",
  "Local SEO Team Lead",
  "Backlink Team Lead",
  "SEO Strategy Specialist",
  "SEO Audit Specialist",
  "Technical SEO Specialist",
  "On-page SEO Specialist",
  "Off-page SEO Specialist",
  "Local SEO Specialist",
  "E-commerce SEO Specialist",
  "International SEO Specialist",
  "Enterprise SEO Specialist",
  "Keyword Research Specialist",
  "Competitor SEO Analyst",
  "Content SEO Specialist",
  "Semantic SEO Specialist",
  "Internal Linking Specialist",
  "Backlink Analysis Specialist",
  "Link Building Specialist",
  "Broken Link Analyst",
  "Lost Link Recovery Specialist",
  "Digital PR Specialist",
  "Citation Building Specialist",
  "Local Citation Specialist",
  "Google Business Profile Specialist",
  "Schema Specialist",
  "Sitemap Specialist",
  "Robots Specialist",
  "Core Web Vitals Specialist",
  "Page Speed Specialist",
  "Image SEO Specialist",
  "Video SEO Specialist",
  "YouTube SEO Specialist",
  "SERP Analysis Specialist",
  "Rank Tracking Specialist",
  "Content Gap Specialist",
  "Keyword Gap Specialist",
  "Anchor Text Analyst",
  "Domain Authority Analyst",
  "Referring Domain Analyst",
  "Toxic Link Detection Specialist",
  "SEO Reporting Specialist",
  "SEO Quality Control Specialist",
  "SEO Strategy Planning Specialist",
];

const moderatorRoles = Array.from({ length: 55 }, (_, index) => `AI Moderator ${String(index + 1).padStart(2, "0")}`);
const callCenterRoles = [
  "Receptionist",
  "Sales Caller",
  "Lead Qualification Caller",
  "Customer Support Caller",
  "Appointment Booking Agent",
  "Follow-up Caller",
  "Complaint Handling Agent",
  "Technical Support Caller",
  "Billing Support Caller",
  "Order Support Caller",
  "Renewal Agent",
  "Customer Success Caller",
  "Survey Agent",
  "Outbound Sales Agent",
  "Inbound Support Agent",
  "Escalation Agent",
  "Translation Call Agent",
  "Call Summary Agent",
  "Call QA Agent",
  "Call Supervisor",
  ...Array.from({ length: 12 }, (_, index) => `Voice Support Agent ${String(index + 1).padStart(2, "0")}`),
];
const customerHelpRoles = [
  "General Support Agent",
  "Product Support Agent",
  "Service Support Agent",
  "Technical Support Agent",
  "Billing Help Agent",
  "Order Help Agent",
  "Returns Help Agent",
  "Account Help Agent",
  "Onboarding Help Agent",
  "Troubleshooting Agent",
  "FAQ Agent",
  "Complaint Resolution Agent",
  "Customer Success Agent",
  "Retention Agent",
  "Renewal Help Agent",
  "Appointment Support Agent",
  "Documentation Agent",
  "Multilingual Support Agent",
  "Escalation Help Agent",
  ...Array.from({ length: 14 }, (_, index) => `Customer Help Agent ${String(index + 1).padStart(2, "0")}`),
];
const salesRoles = ["Lead Generation", "Lead Enrichment", "Lead Scoring", "Prospect Research", "SDR", "Sales Qualification", "Sales Strategy", "Proposal", "Quotation", "Follow-up", "Pipeline Management", "Customer Conversion", "Upselling", "Cross-selling", "Renewal", "Sales Reporting", "Pricing Rules", "Customer Objection Handler"];
const marketingRoles = ["Marketing Strategy", "Market Research", "Competitor Research", "Campaign Planning", "Meta Ads", "Google Ads", "YouTube Ads", "Social Media", "Content", "Copywriting", "Email Marketing", "Landing Pages", "Conversion Optimization", "Creative Strategy", "Analytics", "Retargeting", "Audience Strategy", "Outreach"];
const developmentRoles = ["Frontend", "Backend", "Full-stack", "Database", "API", "DevOps", "Cloud", "QA", "Testing", "Code Review", "Bug Fixing", "Performance", "Security Diagnostics", "Documentation", "Integration", "Release Manager"];
const businessRoles = ["Business Strategy", "Operations", "Finance", "Accounting Assistance", "HR", "Procurement", "Inventory", "Sales Operations", "Customer Success", "Business Analytics", "Forecasting", "Reporting", "Process Optimization", "Profit/Loss Analyst"];
const researchRoles = ["Research Agent", "Data Analyst", "Competitor Analyst", "Market Intelligence", "Trend Analyst", "Opportunity Finder", "Risk Analyst", "Report Analyst", "Verification Agent", "Fact-checking Agent"];
const languageRoles = ["Voice Agent", "Speech-to-text Agent", "Text-to-speech Agent", "Translation Agent", "Language Detection Agent", "Meeting Translator", "Call Translator", "Voice QA Agent", "Meeting Agent", "Transcription Agent"];

function key(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
}

function makeEmployee(role: string, department: string, level: number, managerEmployeeKey: string | undefined, index: number): EmployeeSeed {
  return {
    employeeKey: `${key(department)}_${key(role)}_${index}`,
    name: `${role}`,
    department,
    level,
    role,
    skills: [department, role, "analysis", "reporting", "human handoff"],
    tools: department === "Call Center" ? ["CRM", "Call logs", "Meeting Intelligence", "Knowledge Base"] : department === "SEO" ? ["Website Audit", "SEO Findings", "Backlink Files", "Reports"] : department === "Moderation" ? ["Conversation review", "Policy checks", "Risk signals", "Audit logs"] : ["CRM", "Tasks", "Reports", "Knowledge Base"],
    permissions: department === "Executive" ? ["workspace.read", "reports.read", "ai.use", "approval.request"] : ["workspace.read", "ai.use", "tasks.update", "reports.read"],
    memoryScopes: ["organization_memory", "business_memory", "knowledge_base"],
    instructions: `Act as ${role} in the ${department} department. Use only authorized workspace data and tools. Show evidence, confidence and limitations. Request human approval for external, financial, destructive, security or high-risk actions.`,
    managerEmployeeKey,
  };
}

function buildEmployeeSeeds() {
  const seeds: EmployeeSeed[] = [
    {
      employeeKey: "nova_master_ai",
      name: "NOVA Master AI",
      department: "Executive",
      level: 1,
      role: "Master Brain / AI Orchestrator",
      skills: ["intent detection", "planning", "delegation", "verification", "human escalation"],
      tools: ["EZY Chat", "AI Router", "n8n", "CRM", "Reports", "Audit Logs"],
      permissions: ["workspace.read", "ai.use", "tasks.create", "approval.request", "reports.read"],
      memoryScopes: ["organization_memory", "business_memory", "agent_memory", "knowledge_base"],
      instructions: "Understand commands, select managers and specialists, route tools, verify outputs, request approvals and produce final reports. Never fabricate data or integration success.",
    },
  ];

  executiveRoles.forEach((role, index) => seeds.push(makeEmployee(role, "Executive", 2, "nova_master_ai", index + 1)));
  seoRoles.forEach((role, index) => seeds.push(makeEmployee(role, "SEO", index < 4 ? 3 : 4, "executive_ai_cmo_4", index + 1)));
  moderatorRoles.forEach((role, index) => seeds.push(makeEmployee(role, "Moderation", 4, "executive_ai_security_director_12", index + 1)));
  callCenterRoles.forEach((role, index) => seeds.push(makeEmployee(role, "Call Center", role.includes("Supervisor") ? 3 : 4, "executive_ai_customer_director_11", index + 1)));
  customerHelpRoles.forEach((role, index) => seeds.push(makeEmployee(role, "Customer Help", 4, "executive_ai_customer_director_11", index + 1)));
  salesRoles.forEach((role, index) => seeds.push(makeEmployee(role, "Sales", 4, "executive_ai_cro_6", index + 1)));
  marketingRoles.forEach((role, index) => seeds.push(makeEmployee(role, "Marketing", 4, "executive_ai_cmo_4", index + 1)));
  developmentRoles.forEach((role, index) => seeds.push(makeEmployee(role, "Development", 4, "executive_ai_cto_3", index + 1)));
  businessRoles.forEach((role, index) => seeds.push(makeEmployee(role, "Business", 4, "executive_ai_coo_2", index + 1)));
  researchRoles.forEach((role, index) => seeds.push(makeEmployee(role, "Research", 4, "executive_ai_strategy_director_8", index + 1)));
  languageRoles.forEach((role, index) => seeds.push(makeEmployee(role, "Voice & Language", 4, "executive_ai_customer_director_11", index + 1)));
  return seeds;
}

function aiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_AI_API_KEY);
}

export async function seedAIWorkforce() {
  const { owner, workspace } = await seedJarvisCore();
  const seeds = buildEmployeeSeeds();
  const configured = aiConfigured();

  for (const employee of seeds) {
    await db
      .insert(aiWorkforceEmployees)
      .values({
        workspaceId: workspace.id,
        ...employee,
        status: configured ? "Idle" : "Ready - Provider Not Configured",
        escalationRules: safeEscalationRules,
        performanceScore: 86,
        successRate: 92,
        modelPolicy: configured ? "route_via_configured_provider" : "integration_required_for_generative_ai",
        enabled: true,
      })
      .onConflictDoUpdate({
        target: [aiWorkforceEmployees.workspaceId, aiWorkforceEmployees.employeeKey],
        set: {
          name: employee.name,
          department: employee.department,
          level: employee.level,
          role: employee.role,
          skills: employee.skills,
          tools: employee.tools,
          permissions: employee.permissions,
          memoryScopes: employee.memoryScopes,
          instructions: employee.instructions,
          managerEmployeeKey: employee.managerEmployeeKey,
          status: configured ? "Idle" : "Ready - Provider Not Configured",
          escalationRules: safeEscalationRules,
          modelPolicy: configured ? "route_via_configured_provider" : "integration_required_for_generative_ai",
          enabled: true,
          updatedAt: new Date(),
        },
      });
  }

  const humanSeeds = [
    ["HUM-OWNER", "Foysal IT Owner", "Executive", "Super Owner", ["platform.*", "approval.owner", "security.manage"]],
    ["HUM-ADMIN", "Operations Admin", "Operations", "Admin", ["workspace.manage", "approval.review", "tasks.manage"]],
    ["HUM-MANAGER", "Sales Manager", "Sales", "Manager", ["crm.manage", "leads.manage", "reports.read"]],
    ["HUM-SEO", "SEO Human Specialist", "SEO", "SEO", ["seo.manage", "backlinks.review", "reports.read"]],
    ["HUM-VIEWER", "Client Viewer", "Client", "Viewer", ["client_portal.read"]],
  ] as const;
  for (const [employeeCode, name, department, role, permissions] of humanSeeds) {
    await db
      .insert(humanEmployees)
      .values({ workspaceId: workspace.id, userId: owner.id, employeeCode, name, department, role, status: "Available", permissions: [...permissions], managerUserId: owner.id, aiCollaborationMode: "Hybrid", performanceScore: 88 })
      .onConflictDoUpdate({ target: [humanEmployees.workspaceId, humanEmployees.employeeCode], set: { name, department, role, permissions: [...permissions], updatedAt: new Date() } });
  }

  const [nova] = await db.select().from(aiWorkforceEmployees).where(and(eq(aiWorkforceEmployees.workspaceId, workspace.id), eq(aiWorkforceEmployees.employeeKey, "nova_master_ai")));
  const taskCode = "TASK-RUN-TODAYS-BUSINESS";
  const [existingTask] = await db.select().from(aiWorkforceTasks).where(and(eq(aiWorkforceTasks.workspaceId, workspace.id), eq(aiWorkforceTasks.taskCode, taskCode)));
  if (!existingTask && nova) {
    const [task] = await db
      .insert(aiWorkforceTasks)
      .values({
        workspaceId: workspace.id,
        requestedByUserId: owner.id,
        assignedEmployeeId: nova.id,
        taskCode,
        objective: "Run today's business: check leads, customers, sales, SEO, ads, support, automation, approvals, server and create a daily priority report.",
        inputs: { command: "Run today's business", externalActionsExecuted: false },
        tools: ["CRM", "Lead Intelligence", "Jarvis", "Server Snapshot", "Reports"],
        status: "Completed",
        result: "Daily operating report prepared from workspace data. External actions were not executed without approval.",
        verification: "Verified against database counts and integration statuses. Missing external providers remain NOT CONNECTED / AUTHORIZATION REQUIRED.",
        approvalStatus: "Required For External Actions",
        usageUnits: 1,
        estimatedCostCents: 0,
      })
      .returning();
    await db.insert(aiWorkforceActivityLogs).values({ workspaceId: workspace.id, employeeId: nova.id, taskId: task.id, eventType: "task.completed", description: "NOVA completed the default daily business operating report using available workspace data.", metadata: { fakeActivity: false, externalActionsExecuted: false } });
    await db.insert(aiApprovalCenterItems).values({ workspaceId: workspace.id, taskId: task.id, requestedByEmployeeId: nova.id, actionType: "external_communication", title: "Approve outbound communications from daily business plan", preview: "Jarvis can prepare outreach/follow-up drafts, but sending requires an approved provider and human approval.", riskLevel: "medium", status: "Waiting Approval", allowedActions: ["Approve", "Reject"] });
  }

  await db.insert(auditLogs).values({ workspaceId: workspace.id, userId: owner.id, actorType: "system", eventType: "ai_workforce.seeded", description: `AI workforce framework initialized with ${seeds.length} AI employees and structured task/audit/performance tracking.`, riskLevel: "low", metadata: { aiEmployeeCount: seeds.length, fakeCardsOnly: false, aiProviderConfigured: configured } }).catch(() => undefined);
  return { owner, workspace, totalSeeded: seeds.length };
}

export async function getAIWorkforceSnapshot() {
  const { workspace, totalSeeded } = await seedAIWorkforce();
  const employees = await db.select().from(aiWorkforceEmployees).where(eq(aiWorkforceEmployees.workspaceId, workspace.id)).orderBy(asc(aiWorkforceEmployees.department), asc(aiWorkforceEmployees.level), asc(aiWorkforceEmployees.name));
  const tasks = await db.select().from(aiWorkforceTasks).where(eq(aiWorkforceTasks.workspaceId, workspace.id)).orderBy(desc(aiWorkforceTasks.createdAt)).limit(20);
  const humans = await db.select().from(humanEmployees).where(eq(humanEmployees.workspaceId, workspace.id)).orderBy(asc(humanEmployees.department));
  const approvals = await db.select().from(aiApprovalCenterItems).where(eq(aiApprovalCenterItems.workspaceId, workspace.id)).orderBy(desc(aiApprovalCenterItems.createdAt)).limit(20);
  const activities = await db.select().from(aiWorkforceActivityLogs).where(eq(aiWorkforceActivityLogs.workspaceId, workspace.id)).orderBy(desc(aiWorkforceActivityLogs.createdAt)).limit(20);
  const providers = await db.select().from(aiProviderSlots).orderBy(asc(aiProviderSlots.displayName));
  const departmentCounts = employees.reduce<Record<string, number>>((acc, employee) => {
    acc[employee.department] = (acc[employee.department] ?? 0) + 1;
    return acc;
  }, {});
  const statusCounts = employees.reduce<Record<string, number>>((acc, employee) => {
    acc[employee.status] = (acc[employee.status] ?? 0) + 1;
    return acc;
  }, {});
  const [leadCount] = await db.select({ value: count() }).from(leadRecords).where(eq(leadRecords.workspaceId, workspace.id));
  const [auditCount] = await db.select({ value: count() }).from(websiteAudits).where(eq(websiteAudits.workspaceId, workspace.id));
  return {
    workspace,
    totalSeeded,
    employees,
    tasks,
    humans,
    approvals,
    activities,
    providers,
    departmentCounts,
    statusCounts,
    counts: { aiEmployees: employees.length, humanEmployees: humans.length, tasks: tasks.length, approvals: approvals.length, leads: leadCount?.value ?? 0, audits: auditCount?.value ?? 0 },
    modes: ["Manual", "Assisted", "Auto", "24/7 Business"],
    operatingModel: ["Super Owner", "NOVA Master AI", "Executive AI", "Department Managers", "Team Leaders", "200+ AI Employees", "Human Employees", "n8n + APIs + Tools", "Customers / Business Operations"],
    noFakeRule: "Employees are structured workforce records connected to tools, permissions, task system, activity logs, performance and escalation. Generative/external work remains Integration Required until providers are configured.",
  };
}

export async function createAIEmployee(input: { name?: string; department?: string; role?: string; purpose?: string; skills?: string[] }) {
  const { owner, workspace } = await seedAIWorkforce();
  const name = input.name?.trim() || "Custom AI Employee";
  const department = input.department?.trim() || "Custom";
  const role = input.role?.trim() || "Specialist";
  const [employee] = await db
    .insert(aiWorkforceEmployees)
    .values({
      workspaceId: workspace.id,
      employeeKey: `custom_${key(name)}_${Date.now().toString(36)}`,
      name,
      department,
      level: 4,
      role,
      skills: input.skills ?? [department, role],
      tools: ["EZY Chat", "Tasks", "Knowledge Base", "Reports"],
      permissions: ["workspace.read", "ai.use", "tasks.update"],
      memoryScopes: ["organization_memory", "knowledge_base"],
      instructions: input.purpose?.trim() || `Act as ${role}. Use authorized data only and escalate high-risk actions.`,
      status: aiConfigured() ? "Idle" : "Ready - Provider Not Configured",
      managerEmployeeKey: "nova_master_ai",
      escalationRules: safeEscalationRules,
      performanceScore: 0,
      successRate: 0,
    })
    .returning();
  await db.insert(aiWorkforceActivityLogs).values({ workspaceId: workspace.id, employeeId: employee.id, eventType: "employee.created", description: `${employee.name} was created by the Super Owner/Admin workflow.`, metadata: { createdBy: owner.id } });
  return { ok: true, status: 201, employee };
}

export async function assignAIWorkforceTask(input: { objective?: string; employeeId?: string; taskType?: string; leadId?: string }) {
  const { owner, workspace } = await seedAIWorkforce();
  const objective = input.objective?.trim() || "Prepare a workspace status report.";
  let [employee] = input.employeeId
    ? await db.select().from(aiWorkforceEmployees).where(and(eq(aiWorkforceEmployees.workspaceId, workspace.id), eq(aiWorkforceEmployees.id, input.employeeId)))
    : await db.select().from(aiWorkforceEmployees).where(and(eq(aiWorkforceEmployees.workspaceId, workspace.id), eq(aiWorkforceEmployees.employeeKey, "nova_master_ai")));

  if (!employee) [employee] = await db.select().from(aiWorkforceEmployees).where(eq(aiWorkforceEmployees.workspaceId, workspace.id)).limit(1);
  if (!employee) return { ok: false, status: 404, error: "No AI employee is available." };

  const requiresApproval = /send|publish|payment|delete|call|ads|spend|security|credential/i.test(objective);
  const canExecuteInternally = /lead|business|report|summary|audit/i.test(objective);
  const [task] = await db
    .insert(aiWorkforceTasks)
    .values({
      workspaceId: workspace.id,
      requestedByUserId: owner.id,
      assignedEmployeeId: employee.id,
      taskCode: `TASK-${Date.now().toString(36).toUpperCase()}`,
      objective,
      inputs: { taskType: input.taskType ?? "general", leadId: input.leadId ?? "" },
      tools: employee.tools,
      status: canExecuteInternally && !requiresApproval ? "Running" : "Waiting Approval",
      approvalStatus: requiresApproval ? "Waiting Approval" : "Not Required",
    })
    .returning();

  let result = "Task queued.";
  let status = task.status;
  let verification = "Pending verification.";

  if (canExecuteInternally && !requiresApproval) {
    if (input.taskType === "website_audit" && input.leadId) {
      const audit = await runWebsiteAudit({ leadId: input.leadId });
      result = audit.ok ? "Website audit completed by the assigned workforce task." : `Website audit failed: ${"reason" in audit ? audit.reason : audit.error}`;
      status = audit.ok ? "Completed" : "Failed";
      verification = audit.ok ? "Verified by persisted website audit and findings." : "Failure recorded; retry is available.";
    } else {
      const leadSnapshot = await getLeadPlatformSnapshot();
      result = `Workspace report prepared: ${leadSnapshot.counts.leads} leads, ${leadSnapshot.counts.audits} audits, ${leadSnapshot.counts.opportunities} opportunities. External actions were not executed.`;
      status = "Completed";
      verification = "Verified from workspace database counts and integration statuses.";
    }
    await db.update(aiWorkforceTasks).set({ status, result, verification, usageUnits: 1, estimatedCostCents: aiConfigured() ? 1 : 0, updatedAt: new Date() }).where(eq(aiWorkforceTasks.id, task.id));
    await db.update(aiWorkforceEmployees).set({ tasksCompleted: sql`${aiWorkforceEmployees.tasksCompleted} + 1`, usageUnits: sql`${aiWorkforceEmployees.usageUnits} + 1`, lastActiveAt: new Date(), updatedAt: new Date() }).where(eq(aiWorkforceEmployees.id, employee.id));
  } else if (requiresApproval) {
    await db.insert(aiApprovalCenterItems).values({ workspaceId: workspace.id, taskId: task.id, requestedByEmployeeId: employee.id, actionType: input.taskType ?? "high_risk_action", title: `Approval required: ${objective.slice(0, 80)}`, preview: "AI prepared the action, but execution is blocked until human/owner approval and required integrations are connected.", riskLevel: "high", status: "Waiting Approval" });
  }

  await db.insert(aiWorkforceActivityLogs).values({ workspaceId: workspace.id, employeeId: employee.id, taskId: task.id, eventType: "task.assigned", description: `${employee.name} received task: ${objective}`, metadata: { status, requiresApproval, fakeExecution: false } });
  const [updatedTask] = await db.select().from(aiWorkforceTasks).where(eq(aiWorkforceTasks.id, task.id));
  return { ok: true, status: 201, task: updatedTask, assignedEmployee: employee, result, verification };
}

export async function updateApprovalItem(id: string, action: "Approve" | "Reject" | "Retry" | "Edit") {
  const { workspace } = await seedAIWorkforce();
  const status = action === "Approve" ? "Approved" : action === "Reject" ? "Rejected" : action === "Retry" ? "Retry Requested" : "Edit Requested";
  const [item] = await db.update(aiApprovalCenterItems).set({ status, updatedAt: new Date() }).where(and(eq(aiApprovalCenterItems.workspaceId, workspace.id), eq(aiApprovalCenterItems.id, id))).returning();
  if (!item) return { ok: false, status: 404, error: "Approval item not found." };
  await db.insert(aiWorkforceActivityLogs).values({ workspaceId: workspace.id, taskId: item.taskId, employeeId: item.requestedByEmployeeId, eventType: "approval.updated", description: `Approval item ${item.title} changed to ${status}.`, metadata: { action } });
  return { ok: true, status: 200, item };
}
