import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    createButton: "+ CREATE",
    options: snapshot.universalActionOptions,
    importFlow: ["Upload", "Preview", "Mapping", "Validation", "Approval", "Import"],
    exportFormats: ["PDF", "DOCX", "XLSX", "CSV", "JSON", "Images", "Presentation", "Text"],
  });
}
