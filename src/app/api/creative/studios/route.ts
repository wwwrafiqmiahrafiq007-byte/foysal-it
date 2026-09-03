import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    studios: snapshot.creativeStudioProjects,
    providerPolicy: "Video generation, AI image generation, and connected media actions use real connected providers where required. Unsupported provider capabilities remain authorization_required/not_connected.",
    presentationFlow: ["Topic", "Outline", "Slides", "Content", "Notes", "Review", "Export"],
  });
}
