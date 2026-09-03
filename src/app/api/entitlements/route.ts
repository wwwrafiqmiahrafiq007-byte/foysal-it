import { checkWorkspaceEntitlement } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspace = url.searchParams.get("workspace") ?? "foysal-it-agency";
  const feature = url.searchParams.get("feature") ?? "nova_ai";

  const result = await checkWorkspaceEntitlement(workspace, feature);

  return Response.json({
    ok: result.allowed,
    architecture: "User → Workspace → Subscription → Plan → Entitlements → Feature Access",
    result,
  });
}
