import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    roleBased: true,
    customizable: true,
    widgets: snapshot.dashboardWidgets,
    activeRequiredTools: snapshot.onboardingPreference?.requiredTools ?? [],
  });
}
