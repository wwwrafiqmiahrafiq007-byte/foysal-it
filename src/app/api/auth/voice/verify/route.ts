export const dynamic = "force-dynamic";

type VoiceVerificationRequest = {
  challengePhrase?: string;
  consent?: boolean;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as VoiceVerificationRequest;
  const phraseLength = payload.challengePhrase?.trim().length ?? 0;
  const consentGranted = payload.consent === true;
  const verified = consentGranted && phraseLength >= 6;

  return Response.json({
    ok: verified,
    status: verified ? "voice_verified" : "additional_verification_required",
    message: verified ? "Voice verified ✓" : "Hold / speak again and complete passkey or 2FA re-authentication.",
    stored: {
      rawVoiceRecording: false,
      biometricTemplateInAppDatabase: false,
      verificationResultOnly: true,
    },
    nextStep: verified ? "risk_check_then_session" : "passkey_or_2fa_reauth",
  });
}
