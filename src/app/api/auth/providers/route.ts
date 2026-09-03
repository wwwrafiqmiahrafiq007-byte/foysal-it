import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();

  return Response.json({
    ok: true,
    providers: snapshot.providers.map((provider) => ({
      key: provider.providerKey,
      label: provider.displayName,
      category: provider.category,
      enabled: provider.enabled,
      phase: provider.phase,
      enterpriseOnly: provider.enterpriseOnly,
    })),
  });
}
