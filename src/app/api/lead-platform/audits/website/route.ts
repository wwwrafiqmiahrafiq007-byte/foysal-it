import { runWebsiteAudit } from "@/lib/lead-intelligence";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { leadId?: string; url?: string };
  const result = await runWebsiteAudit(body);
  return Response.json(result, { status: result.status });
}
