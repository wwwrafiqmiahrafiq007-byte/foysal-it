import { cookies } from "next/headers";
import { listUserSessions } from "@/lib/auth-protocol";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const result = await listUserSessions(cookieStore.get("foysal_session")?.value);
  return Response.json(result, { status: result.status });
}
