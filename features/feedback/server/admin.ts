import "server-only";

import { getCurrentSession } from "@/features/auth/server/session";

export function parseFeedbackAdminEmails(value: string | undefined) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isFeedbackAdminEmail(
  email: string | null | undefined,
  configuredEmails = process.env.FEEDBACK_ADMIN_EMAILS,
) {
  if (!email) return false;
  return parseFeedbackAdminEmails(configuredEmails).has(email.toLowerCase());
}

export function isFeedbackAdminConfigured(
  configuredEmails = process.env.FEEDBACK_ADMIN_EMAILS,
) {
  return parseFeedbackAdminEmails(configuredEmails).size > 0;
}

export async function requireFeedbackAdmin() {
  const session = await getCurrentSession();
  if (!session || !isFeedbackAdminEmail(session.user.email)) {
    throw new Error("Feedback admin access is required.");
  }
  return session;
}
