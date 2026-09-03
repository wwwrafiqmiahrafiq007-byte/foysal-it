import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    pattern: "One Content → Many Content",
    supportedFlow: ["Blog", "Facebook", "LinkedIn", "Instagram", "YouTube Script", "Reel", "Short", "Email", "Ad"],
    approvalPolicy: "Repurposing drafts can be generated, but publishing requires configured integrations and explicit approval.",
    plans: snapshot.contentRepurposingPlans,
  });
}
