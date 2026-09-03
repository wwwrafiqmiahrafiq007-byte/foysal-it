import { resendVerification } from "@/lib/auth-protocol";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const result = await resendVerification(body.email ?? "");
  return Response.json(result, { status: result.status });
}
