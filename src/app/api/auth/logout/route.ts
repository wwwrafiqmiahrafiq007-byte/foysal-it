import { cookies } from "next/headers";
import { logoutSession } from "@/lib/auth-protocol";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("foysal_session")?.value;
  const result = await logoutSession(token);
  cookieStore.delete("foysal_session");
  return Response.json(result, { status: result.status });
}
