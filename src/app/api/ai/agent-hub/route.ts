import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    hubName: "AI Agent Hub",
    categories: ["Development", "Marketing", "Content", "Creative", "Business", "Office", "Career"],
    permissionModel: {
      read: ["Files", "CRM", "Analytics"],
      write: ["Draft", "Report", "Task"],
      execute: ["Workflow"],
      externalActionRequiresApproval: ["Publish", "Send email", "Spend money", "Delete", "Modify account", "Change campaign", "Upload public content"],
    },
    agents: snapshot.agentHub,
  });
}
