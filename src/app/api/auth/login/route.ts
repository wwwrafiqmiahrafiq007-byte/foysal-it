import { cookies, headers } from "next/headers";
import { loginWithPassword } from "@/lib/auth-protocol";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const headerStore = await headers();
  const result = await loginWithPassword({
    email: body.email,
    password: body.password,
    ip: headerStore.get("x-forwarded-for") ?? "127.0.0.1",
    userAgent: headerStore.get("user-agent") ?? "Unknown device",
  });

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

  if ("rawSessionToken" in result) {
    const { rawSessionToken: _rawSessionToken, ...safeResult } = result;
    return Response.json(safeResult, { status: result.status });
  }

  return Response.json(result, { status: result.status });
}
