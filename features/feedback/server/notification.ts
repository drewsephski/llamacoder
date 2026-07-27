import "server-only";

import { Resend } from "resend";

import type { ResearchFeedbackMirrorRecord } from "@/features/feedback/server/google-sheets";

let resendClient: Resend | undefined;

function notificationRecipients() {
  return (process.env.FEEDBACK_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export function isFeedbackNotificationConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && notificationRecipients().length > 0,
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendResearchFeedbackNotification(
  submission: ResearchFeedbackMirrorRecord,
) {
  const recipients = notificationRecipients();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || recipients.length === 0) {
    return { status: "disabled" as const };
  }

  resendClient ??= new Resend(apiKey);
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const adminUrl = `${appUrl}/admin/feedback?status=pending`;
  const projectUrl = `${appUrl}/chats/${submission.projectId}`;
  const rewardRange = submission.rewardTrack === "extended" ? "25–40" : "15";
  const result = await resendClient.emails.send(
    {
      from:
        process.env.RESEND_FROM_EMAIL || "Squid Agent <onboarding@resend.dev>",
      to: recipients,
      subject: `New Squid feedback: ${submission.projectTitle}`,
      text: [
        `New verified user-research submission from ${submission.accountEmail}.`,
        `Project: ${submission.projectTitle}`,
        `Reward track: ${rewardRange} credits`,
        `Build goal: ${submission.buildGoal}`,
        `Most frustrating: ${submission.frustration}`,
        `Launch blocker: ${submission.launchBlocker}`,
        `Review: ${adminUrl}`,
        `Project: ${projectUrl}`,
      ].join("\n\n"),
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;color:#171717">
          <h1 style="font-size:24px;line-height:1.25;margin:0 0 20px">New verified research feedback</h1>
          <p style="font-size:15px;line-height:1.6;margin:0 0 20px">
            <strong>${escapeHtml(submission.accountEmail)}</strong> submitted feedback for
            <strong>${escapeHtml(submission.projectTitle)}</strong>. This response is eligible for the
            ${rewardRange}-credit track after review.
          </p>
          <div style="border-left:3px solid #171717;padding-left:18px;margin:24px 0">
            <p style="font-size:13px;color:#737373;margin:0 0 4px">BUILD GOAL</p>
            <p style="font-size:15px;line-height:1.6;margin:0 0 18px">${escapeHtml(submission.buildGoal)}</p>
            <p style="font-size:13px;color:#737373;margin:0 0 4px">MOST FRUSTRATING</p>
            <p style="font-size:15px;line-height:1.6;margin:0 0 18px">${escapeHtml(submission.frustration)}</p>
            <p style="font-size:13px;color:#737373;margin:0 0 4px">LAUNCH BLOCKER</p>
            <p style="font-size:15px;line-height:1.6;margin:0">${escapeHtml(submission.launchBlocker)}</p>
          </div>
          <a href="${adminUrl}" style="display:inline-block;background:#171717;color:#fff;text-decoration:none;border-radius:8px;padding:12px 18px;font-weight:600">Review submission</a>
          <a href="${projectUrl}" style="display:inline-block;color:#171717;margin-left:14px;padding:12px 0">Open project</a>
        </div>
      `,
    },
    { idempotencyKey: `research-feedback-${submission.id}` },
  );
  if (result.error) throw new Error(result.error.message);
  return { status: "sent" as const };
}
