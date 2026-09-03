import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    positioning: "NOVA AI is the master AI router, planner, and orchestrator — not a competitor to every model.",
    architecture: ["User", "Workspace", "NOVA AI", "AI Agent Orchestrator", "Specialist Agents", "Tools", "Workflow", "Output", "Report"],
    moderatorFlow: ["User", "Moderator", "Agents", "Tools", "Results", "Moderator", "User"],
    supervisorResponsibilities: ["Understand user request", "Break task into subtasks", "Select agents", "Assign jobs", "Monitor progress", "Detect failure", "Retry", "Request approval", "Combine outputs", "Produce final answer"],
    sample: {
      userRequest: "আমার YouTube channel-এর complete SEO audit করো।",
      selectedAgents: ["Research Agent", "YouTube SEO Agent", "Content Agent", "Analytics Agent"],
      output: "Final professional report",
    },
    runs: snapshot.orchestrationRuns,
  });
}
