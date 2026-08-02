import "server-only";

import { after } from "next/server";
import { Resend } from "resend";

import { getPrisma } from "@/lib/prisma";

let resendClient: Resend | undefined;

function recipients() {
  return (
    process.env.DESIGN_PARTNER_NOTIFICATION_EMAILS ??
    process.env.FEEDBACK_NOTIFICATION_EMAILS ??
    ""
  )
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export function isDesignPartnerNotificationConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && recipients().length > 0);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function deliveryError(error: unknown) {
  return (error instanceof Error ? error.message : "Delivery failed.").slice(
    0,
    1_000,
  );
}

export async function notifyDesignPartnerApplication(applicationId: string) {
  const prisma = getPrisma();
  const application = await prisma.designPartnerApplication.findUnique({
    where: { id: applicationId },
  });
  if (!application) throw new Error("Design partner application not found.");
  if (application.notificationStatus === "sent") {
    return { status: "sent" as const };
  }

  const notificationRecipients = recipients();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || notificationRecipients.length === 0) {
    await prisma.designPartnerApplication.update({
      where: { id: applicationId },
      data: { notificationStatus: "disabled", notificationError: null },
    });
    return { status: "disabled" as const };
  }

  await prisma.designPartnerApplication.update({
    where: { id: applicationId },
    data: { notificationStatus: "sending", notificationError: null },
  });

  try {
    resendClient ??= new Resend(apiKey);
    const result = await resendClient.emails.send(
      {
        from:
          process.env.RESEND_FROM_EMAIL ||
          "Squid Agent <onboarding@resend.dev>",
        to: notificationRecipients,
        subject: `Design partner application: ${application.name}`,
        text: [
          `${application.name} (${application.email}) applied to the Squid design partner program.`,
          `Role: ${application.role}`,
          `Company: ${application.companyName || "Not provided"}`,
          `Portfolio: ${application.portfolioUrl || "Not provided"}`,
          `Timeline: ${application.timeline}`,
          `Preferred contact: ${application.preferredContact}`,
          `Project: ${application.projectSummary}`,
          `Source: ${application.acquisitionSource || "direct"}`,
        ].join("\n\n"),
        html: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;color:#171717">
            <h1 style="font-size:24px;line-height:1.25;margin:0 0 20px">New design partner application</h1>
            <p style="font-size:15px;line-height:1.6;margin:0 0 20px">
              <strong>${escapeHtml(application.name)}</strong> applied as
              <strong>${escapeHtml(application.role.replaceAll("_", " "))}</strong>.
            </p>
            <div style="border-left:3px solid #2563eb;padding-left:18px;margin:24px 0">
              <p style="font-size:13px;color:#737373;margin:0 0 4px">CONTACT</p>
              <p style="font-size:15px;line-height:1.6;margin:0 0 18px">${escapeHtml(application.email)} · ${escapeHtml(application.preferredContact)}</p>
              <p style="font-size:13px;color:#737373;margin:0 0 4px">PROJECT</p>
              <p style="font-size:15px;line-height:1.6;margin:0 0 18px">${escapeHtml(application.projectSummary)}</p>
              <p style="font-size:13px;color:#737373;margin:0 0 4px">SOURCE</p>
              <p style="font-size:15px;line-height:1.6;margin:0">${escapeHtml(application.acquisitionSource || "direct")}</p>
            </div>
          </div>
        `,
      },
      { idempotencyKey: `design-partner-${application.id}` },
    );
    if (result.error) throw new Error(result.error.message);

    await prisma.designPartnerApplication.update({
      where: { id: applicationId },
      data: {
        notificationStatus: "sent",
        notifiedAt: new Date(),
        notificationError: null,
      },
    });
    return { status: "sent" as const };
  } catch (error) {
    const message = deliveryError(error);
    await prisma.designPartnerApplication.update({
      where: { id: applicationId },
      data: { notificationStatus: "failed", notificationError: message },
    });
    return { status: "failed" as const, error: message };
  }
}

export function scheduleDesignPartnerNotification(applicationId: string) {
  after(async () => {
    try {
      await notifyDesignPartnerApplication(applicationId);
    } catch (error) {
      console.error("[design-partners] Notification failed", error);
    }
  });
}
