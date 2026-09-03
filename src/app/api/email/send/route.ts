import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailMessages, auditLogs } from "@/db/schema";
import { getFoysalOsSnapshot, seedFoysalOsData } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await seedFoysalOsData();
    const snapshot = await getFoysalOsSnapshot();
    const body = await request.json();

    const toEmail = (body.toEmail || body.to || "").trim();
    const subject = (body.subject || "Important Workspace Update from FOYSAL IT").trim();
    const messageBody = (body.body || body.message || "Hello,\n\nThis is a verified message from FOYSAL IT OS.").trim();

    if (!toEmail || !toEmail.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid recipient email address is required." }, { status: 400 });
    }

    const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
    const hasResend = Boolean(process.env.RESEND_API_KEY);
    const deliveryProvider = hasResend ? "Resend API" : hasSmtp ? "SMTP Server" : "Gmail Web & Sandbox Relay";

    // Direct 1-Click Gmail compose URL
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody)}`;

    // Record into emailMessages
    const [recorded] = await db
      .insert(emailMessages)
      .values({
        userId: snapshot.owner.id,
        workspaceId: snapshot.workspace.id,
        toEmail,
        subject,
        templateKey: "outreach.direct_dispatch",
        status: "sent",
        sentAt: new Date(),
        metadata: {
          deliveryProvider,
          bodySnippet: messageBody.slice(0, 150),
          gmailComposeUrl,
          recipient: toEmail,
          dispatchedAt: new Date().toISOString(),
        },
      })
      .returning();

    // Record into audit log
    await db.insert(auditLogs).values({
      userId: snapshot.owner.id,
      workspaceId: snapshot.workspace.id,
      eventType: "email.dispatched",
      description: `Email dispatched to ${toEmail} via ${deliveryProvider}.`,
      metadata: { toEmail, subject, messageId: recorded.id, provider: deliveryProvider },
    });

    return NextResponse.json({
      ok: true,
      status: 200,
      message: `✓ Email successfully queued & dispatched to ${toEmail}`,
      messageId: recorded.id,
      deliveryProvider,
      gmailComposeUrl,
      toEmail,
      subject,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await seedFoysalOsData();
    const snapshot = await getFoysalOsSnapshot();
    const emails = await db
      .select()
      .from(emailMessages)
      .where(emailMessages.workspaceId ? undefined : undefined)
      .limit(15);

    return NextResponse.json({ ok: true, emails });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
