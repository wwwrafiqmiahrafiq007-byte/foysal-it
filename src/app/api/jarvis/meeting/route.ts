import { getJarvisSnapshot } from "@/lib/jarvis-core";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getJarvisSnapshot();
  return Response.json({
    ok: true,
    title: "Universal Meeting AI",
    modes: ["Translation", "AI Assistant", "Sales Copilot", "Meeting Recorder", "Full Hybrid"],
    twoWayConversation: ["Your Voice", "Speech Recognition", "Language Detection", "AI Translation", "Target Language", "Voice Output"],
    browserCompanionRequired: true,
    sessions: snapshot.meetings,
    policy: "AI suggests answers by default. It does not speak to the client unless explicit autonomous mode is enabled and providers are connected.",
  });
}

export async function POST() {
  return Response.json({
    ok: false,
    status: "Integration Required",
    message: "Live meeting audio, speech recognition, translation and voice output require browser companion/authorized meeting integration and configured speech/translation/voice providers.",
    noFakeTranslation: true,
  }, { status: 424 });
}
