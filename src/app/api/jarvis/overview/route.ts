import { getJarvisSnapshot } from "@/lib/jarvis-core";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getJarvisSnapshot();
  return Response.json({
    ok: true,
    product: "FOYSAL IT — Universal AI Operating System",
    interface: "EZY CHAT / JARVIS CORE",
    architecture: ["FOYSAL IT", "EZY CHAT / JARVIS CORE", "AI ORCHESTRATOR", "Business OS", "Marketing OS", "Meeting OS", "N8N Backbone", "APIs / Files / Server", "Multi-AI / LLM Layer", "Primary AI / Backup AI / Human"],
    ...snapshot,
    noFakeStatus: true,
  });
}
