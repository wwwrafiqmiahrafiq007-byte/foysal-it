import { db } from "@/db";
import { aiCommandRuns, auditLogs, workspaces } from "@/db/schema";
import { seedFoysalOsData } from "@/lib/foysal-os";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const campaignPlan = ["Research", "Strategy", "SEO", "Content", "Creative", "Ads", "CRM", "Tasks", "Calendar", "Reports"];
const consequentialActions = ["external publishing", "payments", "deletion", "ad spend", "CRM bulk update", "client-facing send"];

export async function GET() {
  const { workspace } = await seedFoysalOsData();
  const runs = await db.select().from(aiCommandRuns).where(eq(aiCommandRuns.workspaceId, workspace.id)).orderBy(desc(aiCommandRuns.createdAt));
  return Response.json({
    ok: true,
    commandBox: "Create a complete marketing campaign for my business.",
    novaCanPlan: campaignPlan,
    policy: "External publishing, payments, deletion, ad spend, and other consequential actions require authorization/confirmation.",
    runs,
  });
}

export async function POST(request: Request) {
  const { workspace } = await seedFoysalOsData();
  const body = (await request.json().catch(() => ({}))) as { command?: string; confirmConsequentialActions?: boolean };
  const commandText = body.command?.trim() || "Create a complete marketing campaign for my business.";
  const confirmed = body.confirmConsequentialActions === true;

  const [run] = await db
    .insert(aiCommandRuns)
    .values({
      workspaceId: workspace.id,
      commandText,
      planSteps: campaignPlan,
      requiresConfirmation: !confirmed,
      consequentialActions,
      status: confirmed ? "active" : "pending",
      outputPolicy: confirmed
        ? "Confirmed actions may proceed only through configured integrations and permission checks."
        : "AI-generated plan only. Consequential actions are blocked until explicit authorization/confirmation.",
    })
    .returning();

  await db.insert(auditLogs).values({
    workspaceId: workspace.id,
    actorType: "ai_assistant",
    eventType: "nova.universal_command.planned",
    description: "NOVA produced an approval-gated plan for a universal command.",
    riskLevel: confirmed ? "medium" : "low",
    metadata: { consequentialActionsBlocked: !confirmed, externalActionsRequireAuthorization: true },
  });

  const [workspaceRow] = await db.select({ slug: workspaces.slug }).from(workspaces).where(eq(workspaces.id, workspace.id));

  return Response.json({
    ok: true,
    workspace: workspaceRow?.slug,
    run,
    plan: campaignPlan,
    requiresConfirmationFor: consequentialActions,
  });
}
