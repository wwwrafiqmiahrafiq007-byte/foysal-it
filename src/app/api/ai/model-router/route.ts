import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    routerPolicy: "Users do not manually choose a model every time. NOVA routes by task type, capability, cost, availability, and workspace permissions.",
    taskRouting: ["Coding", "Research", "Office", "Image", "Video", "Voice", "Translation", "Cheap/simple task"],
    fallbackFlow: ["Primary Agent", "Failure?", "Secondary Agent", "Failure?", "Fallback Agent", "Human Notification"],
    noFabricationPolicy: "If a provider fails or is not configured, the system reports it and never silently fabricates a result.",
    providers: snapshot.aiProviders,
    rules: snapshot.routingRules,
  });
}
