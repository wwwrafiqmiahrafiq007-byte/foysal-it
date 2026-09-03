import { buildWindowsPackageZip } from "@/lib/distribution-center";

export const dynamic = "force-dynamic";

export async function GET() {
  const zip = await buildWindowsPackageZip();
  const body = new Uint8Array(zip).buffer;
  return new Response(body, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": "attachment; filename=foysal-it-os-windows-pc-package.zip",
      "cache-control": "no-store",
    },
  });
}
