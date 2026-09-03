import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    operations: snapshot.dataOperations,
    validationStates: ["Valid", "Warning", "Error"],
    migrationFlow: ["Old System", "Mapping", "Validation", "Preview", "Import", "Verification"],
    qaFeatures: ["Sampling", "Double Verification", "Field Comparison", "Reviewer", "Error Rate", "Revision", "Quality Score"],
  });
}
