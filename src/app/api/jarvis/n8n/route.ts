import { getJarvisSnapshot } from "@/lib/jarvis-core";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getJarvisSnapshot();
  return Response.json({
    ok: true,
    backbone: "n8n is the Automation + AI Agent Execution Layer / Hands of FOYSAL IT.",
    configured: Boolean(process.env.N8N_WEBHOOK_URL || process.env.N8N_API_KEY),
    setupRequired: !(process.env.N8N_WEBHOOK_URL || process.env.N8N_API_KEY),
    workflows: snapshot.workflows,
    googleSheetNote: "The provided Google Sheet can be used as the first n8n data source after Google Sheets OAuth/API credentials are configured and tested.",
  });
}

export async function POST() {
  const configured = Boolean(process.env.N8N_WEBHOOK_URL || process.env.N8N_API_KEY);
  if (!configured) {
    return Response.json({ ok: false, status: "Integration Required", message: "Configure N8N_WEBHOOK_URL or N8N_API_KEY server-side before testing/executing n8n workflows." }, { status: 424 });
  }
  return Response.json({ ok: false, status: "Configured - Test Required", message: "n8n credentials are present, but no workflow execution was performed in this sandbox. This prevents fake success responses." }, { status: 409 });
}
