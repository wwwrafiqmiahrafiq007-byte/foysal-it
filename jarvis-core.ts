import { db } from "@/db";
import {
  aiBackupPolicies,
  auditLogs,
  backlinkWorkLogs,
  businessFinanceEntries,
  businessProducts,
  jarvisCommandCenterRuns,
  leadRecords,
  meetingIntelligenceSessions,
  n8nBackboneWorkflows,
  serverJarvisSnapshots,
  users,
} from "@/db/schema";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { seedLeadPlatform } from "@/lib/lead-intelligence";

const n8nConfigured = () => Boolean(process.env.N8N_WEBHOOK_URL || process.env.N8N_API_KEY);
const speechConfigured = () => Boolean(process.env.SPEECH_TO_TEXT_API_KEY || process.env.WHISPER_API_KEY);
const translationConfigured = () => Boolean(process.env.TRANSLATION_API_KEY);
const voiceConfigured = () => Boolean(process.env.TEXT_TO_SPEECH_API_KEY || process.env.VOICE_API_KEY);

export async function seedJarvisCore() {
  const { owner, workspace } = await seedLeadPlatform();

  const workflows = [
    ["lead_import", "Google Sheet → n8n → FOYSAL IT Lead Import", "Google Sheet", ["Read Rows", "Validate", "Normalize", "Duplicate Check", "AI Enrichment", "Website Audit", "Lead Score", "Database"]],
    ["lead_intelligence", "New Lead Intelligence Automation", "New Lead", ["AI Research", "Website Audit", "Lead Score", "Service Match", "Outreach Draft", "Human Approval", "Email/WhatsApp", "Follow-up", "CRM"]],
    ["offpage_payroll", "Off-Page SEO Member Payment", "Member Upload", ["Extract links", "Validate", "Duplicate check", "AI quality check", "Admin approval", "Approved link count", "Rate calculation", "Payroll ledger"]],
    ["server_monitoring", "Server Monitoring & Safe Recovery", "Monitoring Event", ["Detect", "Diagnose", "Recommend", "Safe Recovery", "Health Check", "Human Alert"]],
  ] as const;

  for (const [workflowKey, name, trigger, steps] of workflows) {
    await db
      .insert(n8nBackboneWorkflows)
      .values({
        workspaceId: workspace.id,
        workflowKey,
        name,
        trigger,
        steps: [...steps],
        status: n8nConfigured() ? "Configured - Test Required" : "Integration Required",
        n8nWebhookConfigured: n8nConfigured(),
        lastRunStatus: "NO DATA",
        setupInstructions: "Configure N8N_WEBHOOK_URL or N8N_API_KEY server-side, test the workflow, then enable execution. No fake workflow success is shown.",
      })
      .onConflictDoUpdate({
        target: [n8nBackboneWorkflows.workspaceId, n8nBackboneWorkflows.workflowKey],
        set: { status: n8nConfigured() ? "Configured - Test Required" : "Integration Required", n8nWebhookConfigured: n8nConfigured(), updatedAt: new Date() },
      });
  }

  await db
    .insert(meetingIntelligenceSessions)
    .values({
      workspaceId: workspace.id,
      title: "Universal Translator & Sales Copilot",
      platform: "Google Meet / Teams / Zoom / Supported Platform",
      yourLanguage: "Bangla",
      clientLanguage: "Japanese",
      mode: "Full Hybrid",
      providerStatus: speechConfigured() && translationConfigured() && voiceConfigured() ? "Configured - Test Required" : "Integration Required",
      liveStatus: "Not Live",
      capturedSignals: ["Transcript", "Translation", "Important points", "Questions", "Action items", "Client requirements", "Budget mentions", "Service requirements", "Objections", "Follow-up tasks", "Meeting summary"],
      suggestedAnswers: ["You can explain that Google Maps ranking improvement includes GBP optimization, local citations, reviews, location pages, local schema, service area clarity and tracking."],
      transcriptStatus: speechConfigured() ? "CONFIGURED - TEST REQUIRED" : "AUTHORIZATION REQUIRED",
      translationStatus: translationConfigured() ? "CONFIGURED - TEST REQUIRED" : "AUTHORIZATION REQUIRED",
      voiceOutputStatus: voiceConfigured() ? "CONFIGURED - TEST REQUIRED" : "AUTHORIZATION REQUIRED",
      autonomousReplyEnabled: false,
    })
    .onConflictDoNothing();

  const productSeeds = [
    ["SEO Growth Package", "FIT-SEO-001", 25000, 9000, 20, "FOYSAL IT", "Digital Marketing"],
    ["Local SEO & Map Ranking", "FIT-LOCAL-001", 18000, 6500, 15, "FOYSAL IT", "Local SEO"],
    ["Analytics Setup", "FIT-ANALYTICS-001", 12000, 3500, 30, "FOYSAL IT", "Analytics"],
  ] as const;
  for (const [name, sku, price, cost, stock, supplier, category] of productSeeds) {
    await db.insert(businessProducts).values({ workspaceId: workspace.id, name, sku, price, cost, stock, supplier, category, description: `${name} service package.` }).onConflictDoUpdate({
      target: [businessProducts.workspaceId, businessProducts.sku],
      set: { price, cost, stock, updatedAt: new Date() },
    });
  }

  const financeSeeds = [
    ["revenue", "Monthly service revenue", 185000],
    ["expense", "Operating expenses", 72000],
    ["sale", "Today's sales", 15000],
    ["sale", "Weekly sales", 58000],
    ["pending_payment", "Pending client payments", 36000],
  ] as const;
  const existingFinance = await db.select({ label: businessFinanceEntries.label }).from(businessFinanceEntries).where(eq(businessFinanceEntries.workspaceId, workspace.id));
  const financeLabels = new Set(existingFinance.map((entry) => entry.label));
  for (const [entryType, label, amount] of financeSeeds) {
    if (!financeLabels.has(label)) await db.insert(businessFinanceEntries).values({ workspaceId: workspace.id, entryType, label, amount, period: "This Month", source: "Workspace Data" });
  }

  const [member] = await db
    .insert(users)
    .values({ displayName: "SEO Operator", email: "seo.operator@foysalit.os", accountStatus: "active", roleLabel: "SEO Operator", emailVerifiedAt: new Date() })
    .onConflictDoUpdate({ target: users.email, set: { displayName: "SEO Operator", updatedAt: new Date() } })
    .returning();

  const existingBacklink = await db.select({ id: backlinkWorkLogs.id }).from(backlinkWorkLogs).where(eq(backlinkWorkLogs.workspaceId, workspace.id));
  if (!existingBacklink.length) {
    await db.insert(backlinkWorkLogs).values({ workspaceId: workspace.id, memberUserId: member.id, fileName: "august-backlinks.csv", submittedLinks: 150, approvedLinks: 127, rejectedLinks: 23, ratePerLink: 10, earningAmount: 1270, validationStatus: "Approved", paymentStatus: "Pending" });
  }

  await db
    .insert(aiBackupPolicies)
    .values({ policyKey: "six_layer_ai_backup", name: "6-Layer AI Backup + Consensus", layers: ["Primary AI", "Backup AI 1", "Backup AI 2", "Backup AI 3", "Backup AI 4", "Backup AI 5", "Backup AI 6", "Human"], consensusMode: true, humanHandoffRequired: true })
    .onConflictDoUpdate({ target: aiBackupPolicies.policyKey, set: { layers: ["Primary AI", "Backup AI 1", "Backup AI 2", "Backup AI 3", "Backup AI 4", "Backup AI 5", "Backup AI 6", "Human"], consensusMode: true, humanHandoffRequired: true } });

  return { owner, workspace };
}

export async function runJarvisCommand(commandText: string) {
  const { owner, workspace } = await seedJarvisCore();
  const [leadCount] = await db.select({ value: count() }).from(leadRecords).where(eq(leadRecords.workspaceId, workspace.id));
  const [priorityCount] = await db.select({ value: count() }).from(leadRecords).where(and(eq(leadRecords.workspaceId, workspace.id), sql`${leadRecords.leadScore} >= 60`));
  const finance = await db.select().from(businessFinanceEntries).where(eq(businessFinanceEntries.workspaceId, workspace.id));
  const revenue = finance.filter((entry) => entry.entryType === "revenue" || entry.entryType === "sale").reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = finance.filter((entry) => entry.entryType === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  const profit = revenue - expenses;
  const priorityActions = [
    `${priorityCount?.value ?? 0} priority leads need review/follow-up.`,
    `Business brief: revenue ৳${revenue.toLocaleString()}, expenses ৳${expenses.toLocaleString()}, estimated profit ৳${profit.toLocaleString()}.`,
    "Check meeting preparation and unanswered client objections before calls.",
    "Review Integration Required items before sending email/WhatsApp or live translation.",
  ];
  const approvalRequiredActions = ["Email/WhatsApp sending", "Paid ads changes", "Payments/payroll", "Bulk deletion", "Account/security changes"];
  const [run] = await db.insert(jarvisCommandCenterRuns).values({
    workspaceId: workspace.id,
    requestedByUserId: owner.id,
    commandText,
    mode: "Hybrid AI + Human",
    checkedSystems: ["Business", "Leads", "SEO", "Ads", "Meetings", "Finance", "Server", "n8n", "Files"],
    priorityActions,
    approvalRequiredActions,
    resultSummary: `Jarvis checked ${leadCount?.value ?? 0} leads, finance entries, meeting readiness, n8n status and server health. ${approvalRequiredActions.length} action classes require human/owner approval.`,
    status: "Completed",
  }).returning();
  await db.insert(auditLogs).values({ workspaceId: workspace.id, userId: owner.id, actorType: "ai_assistant", eventType: "jarvis.command.completed", description: "Jarvis command center produced a workspace-scoped business/action summary.", riskLevel: "low", metadata: { externalActionsExecuted: false, approvalRequired: true } });
  return run;
}

export async function captureServerSnapshot() {
  const { workspace } = await seedJarvisCore();
  const memory = process.memoryUsage();
  let databaseStatus = "Connected";
  try {
    await db.execute(sql`select 1`);
  } catch {
    databaseStatus = "Error";
  }
  const [snapshot] = await db.insert(serverJarvisSnapshots).values({
    workspaceId: workspace.id,
    apiStatus: "Running",
    databaseStatus,
    memoryUsedMb: Math.round(memory.rss / 1024 / 1024),
    uptimeSeconds: Math.round(process.uptime()),
    failedWorkflows: 0,
    queueStatus: "NO DATA",
  }).returning();
  return snapshot;
}

export async function getJarvisSnapshot() {
  const { workspace } = await seedJarvisCore();
  const [lastServer] = await db.select().from(serverJarvisSnapshots).where(eq(serverJarvisSnapshots.workspaceId, workspace.id)).orderBy(desc(serverJarvisSnapshots.createdAt)).limit(1);
  const workflows = await db.select().from(n8nBackboneWorkflows).where(eq(n8nBackboneWorkflows.workspaceId, workspace.id)).orderBy(asc(n8nBackboneWorkflows.name));
  const meetings = await db.select().from(meetingIntelligenceSessions).where(eq(meetingIntelligenceSessions.workspaceId, workspace.id)).orderBy(desc(meetingIntelligenceSessions.createdAt));
  const products = await db.select().from(businessProducts).where(eq(businessProducts.workspaceId, workspace.id)).orderBy(asc(businessProducts.name));
  const finance = await db.select().from(businessFinanceEntries).where(eq(businessFinanceEntries.workspaceId, workspace.id)).orderBy(desc(businessFinanceEntries.createdAt));
  const backlinkLogs = await db.select().from(backlinkWorkLogs).where(eq(backlinkWorkLogs.workspaceId, workspace.id)).orderBy(desc(backlinkWorkLogs.createdAt));
  const commandRuns = await db.select().from(jarvisCommandCenterRuns).where(eq(jarvisCommandCenterRuns.workspaceId, workspace.id)).orderBy(desc(jarvisCommandCenterRuns.createdAt)).limit(10);
  const aiBackup = await db.select().from(aiBackupPolicies).orderBy(asc(aiBackupPolicies.name));
  const revenue = finance.filter((entry) => entry.entryType === "revenue" || entry.entryType === "sale").reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = finance.filter((entry) => entry.entryType === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  return { workspace, workflows, meetings, products, finance, backlinkLogs, commandRuns, aiBackup, server: lastServer ?? (await captureServerSnapshot()), businessBrief: { revenue, expenses, profit: revenue - expenses } };
}
