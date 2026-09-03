import { getFoysalOsSnapshot } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getFoysalOsSnapshot();
  return Response.json({
    ok: true,
    voiceAi: snapshot.voiceAi,
    translation: snapshot.translation,
    meetingAi: snapshot.meeting,
    translationPipeline: snapshot.translation?.pipeline ?? ["Speaker", "Speech Recognition", "Language Detection", "Translation", "Text/Voice Output"],
    supportedLanguages: snapshot.translation?.supportedLanguages ?? ["Bengali", "English", "German", "Chinese", "French", "Spanish"],
    meetingArchitecture: ["Google Account", "Google Meet", "Calendar", "Create Meeting", "Schedule Meeting", "Participants", "Live Meeting", "Live Transcript", "Translation", "AI Assistant", "Summary", "Action Items", "Key Decisions", "Follow-Up Tasks"],
    externalApiPolicy: "Use official authorization/API connections. If not connected, show Authorization Required / Not Connected and never fake connected status.",
  });
}
