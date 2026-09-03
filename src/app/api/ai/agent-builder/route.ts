import { db } from "@/db";
import { auditLogs, customAiAgents } from "@/db/schema";
import { seedFoysalOsData } from "@/lib/foysal-os";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const { workspace } = await seedFoysalOsData();
  const agents = await db.select().from(customAiAgents).where(eq(customAiAgents.workspaceId, workspace.id)).orderBy(asc(customAiAgents.name));
  return Response.json({
    ok: true,
    builderTitle: "Create Your Own Agent",
    builderFields: ["Agent Name", "Purpose", "System Instructions", "Tools", "Model", "Knowledge", "Memory", "Permissions", "Output Format", "Schedule", "Web Access", "File Access", "Human Approval", "Cost Limit"],
    permissionModel: {
      read: ["Files", "CRM", "Analytics"],
      write: ["Draft", "Report", "Task"],
      execute: ["Workflow"],
      externalActionRequiresApproval: ["Publish", "Send email", "Spend money", "Delete", "Modify account", "Change campaign", "Upload public content"],
    },
    policy: "Agent tools and knowledge are limited by workspace membership, role permissions, entitlements, cost limits, memory controls, and approval gates.",
    agents,
  });
}

export async function POST(request: Request) {
  const { owner, workspace } = await seedFoysalOsData();
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    instructions?: string;
    knowledgeScopes?: string[];
    tools?: string[];
    permissions?: string[];
    trigger?: string;
    workflow?: string[];
    outputFormat?: string;
    approvalRequired?: boolean;
    limits?: Record<string, string | number | boolean>;
  };

  const [agent] = await db
    .insert(customAiAgents)
    .values({
      workspaceId: workspace.id,
      createdByUserId: owner.id,
      name: body.name?.trim() || "Custom Workspace Agent",
      instructions: body.instructions?.trim() || "Assist using authorized workspace knowledge only.",
      knowledgeScopes: body.knowledgeScopes ?? ["company_information", "products", "services", "brand_rules"],
      tools: body.tools ?? ["NOVA AI", "Tasks", "Reports"],
      permissions: body.permissions ?? ["ai.use", "workspace.read"],
      trigger: body.trigger ?? "manual",
      workflow: body.workflow ?? ["Receive brief", "Check permissions", "Draft output", "Request approval", "Save report"],
      outputFormat: body.outputFormat ?? "structured_report",
      approvalRequired: body.approvalRequired ?? true,
      limits: body.limits ?? { monthlyRuns: 50, externalActionsBlockedUntilConfirmed: true },
      enabled: true,
    })
    .returning();

  await db.insert(auditLogs).values({
    workspaceId: workspace.id,
    userId: owner.id,
    actorType: "system",
    eventType: "ai.agent_builder.created",
    description: "A custom AI agent was created with permission and approval boundaries.",
    riskLevel: "medium",
    metadata: { approvalRequired: agent.approvalRequired, toolsScoped: true },
  });

  return Response.json({ ok: true, agent }, { status: 201 });
}
