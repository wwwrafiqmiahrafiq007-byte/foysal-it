import { getGmailExtensionCheck } from "@/lib/launch-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, ...getGmailExtensionCheck() });
}
