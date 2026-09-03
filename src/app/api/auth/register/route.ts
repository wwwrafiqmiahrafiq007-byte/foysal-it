import { cookies } from "next/headers";
import { registerAccount } from "@/lib/auth-protocol";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await registerAccount(body);

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
