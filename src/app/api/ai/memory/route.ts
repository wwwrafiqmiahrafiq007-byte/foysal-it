import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    controls: ["View", "Edit", "Delete", "Disable"],
    memoryTypes: ["User Preferences", "Business Knowledge", "Brand Rules", "Projects", "Products", "Services"],
    policy: "AI memory is workspace-scoped, permission-aware, and user-controllable.",
    items: snapshot.aiMemoryItems,
  });
}
