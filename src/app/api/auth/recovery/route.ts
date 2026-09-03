import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { requestPasswordReset } from "@/lib/auth-protocol";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; method?: string };
  const method = body.method ?? "email";
  const reset = method === "email" ? await requestPasswordReset(body.email ?? "") : null;

  await db.insert(auditLogs).values({
    actorType: "system",
    eventType: "auth.account_recovery.started",
    description: "Account recovery was started. Identity and risk checks are required before restoring access.",
    riskLevel: "medium",
    metadata: { method, bypassAllowed: false, secretsDisplayed: false },
  });

  return Response.json(
    {
      ok: true,
      recoveryProtocol: ["Choose recovery method", "Verify identity", "Risk/security check", "Restore access", "Review active sessions", "Revoke suspicious sessions", "Security notification"],
      reset,
    },
    { status: 200 },
  );
}
