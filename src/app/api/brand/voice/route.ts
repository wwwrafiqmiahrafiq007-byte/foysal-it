import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    brandVoice: snapshot.brandVoice,
    fields: ["Brand Name", "Tone", "Audience", "Language", "Keywords", "CTA", "Style", "Brand Rules"],
    policy: "NOVA and content tools apply brand voice while still labeling AI-generated output and requiring approval for external publishing.",
  });
}
