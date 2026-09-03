import { verifyEmailToken } from "@/lib/auth-protocol";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const asJson = url.searchParams.get("format") === "json";
  const result = await verifyEmailToken(token);

  if (!result.ok || asJson) {
    return Response.json(result, { status: result.status });
  }

  return Response.redirect(new URL(result.redirectTo ?? "/dashboard", request.url));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const result = await verifyEmailToken(body.token ?? "");
  return Response.json(result, { status: result.status });
}
