import { runJarvisCommand } from "@/lib/jarvis-core";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { command?: string };
  const run = await runJarvisCommand(body.command?.trim() || "Jarvis, আজকের সব important কাজ দেখাও।");
  return Response.json({
    ok: true,
    run,
    approvalModel: ["Auto for low-risk summaries", "Approval for external communication/important changes", "Owner Only for financial/security/destructive operations"],
  });
}
