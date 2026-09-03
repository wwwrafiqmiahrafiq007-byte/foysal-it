import { captureServerSnapshot, getJarvisSnapshot } from "@/lib/jarvis-core";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await captureServerSnapshot();
  return Response.json({ ok: true, serverJarvis: snapshot, monitored: ["API", "Database", "Memory", "Uptime", "Failed workflows", "Queue"], unsafeActionsAllowed: false });
}

export async function POST() {
  const snapshot = await getJarvisSnapshot();
  return Response.json({
    ok: false,
    status: "Owner Approval Required",
    message: "Safe recovery recommendations can be generated, but destructive production actions, database deletion or credential modification are blocked without explicit owner-controlled allowlists.",
    latestServerSnapshot: snapshot.server,
  }, { status: 409 });
}
