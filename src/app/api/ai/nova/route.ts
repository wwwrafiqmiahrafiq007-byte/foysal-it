import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    policy: "NOVA AI labels AI-generated content separately from verified workspace or external API data. It does not invent rankings, revenue, API responses, or system status.",
    agents: snapshot.aiAgents,
    outputs: snapshot.aiOutputs,
    authorizationRequiredForExternalData: true,
  });
}
