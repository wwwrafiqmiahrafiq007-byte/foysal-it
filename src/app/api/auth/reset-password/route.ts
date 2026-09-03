import { cookies } from "next/headers";
import { resetPassword } from "@/lib/auth-protocol";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: string; email?: string; password?: string };
  const tokenOrEmail = body.token || body.email || "";
  const result = await resetPassword(tokenOrEmail, body.password ?? "");

  if (result.ok && "rawSessionToken" in result && result.rawSessionToken) {
    const cookieStore = await cookies();
    cookieStore.set("foysal_session", result.rawSessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return Response.json(result, { status: result.status });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  return Response.json({
    ok: true,
    message: "Submit a POST request with this token and a new password to complete reset.",
    tokenReceived: Boolean(token),
    plaintextPasswordStored: false,
  });
}
