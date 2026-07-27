"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { researchFeedbackReviewSchema } from "@/features/feedback/contracts";
import { requireFeedbackAdmin } from "@/features/feedback/server/admin";
import {
  notifyResearchFeedbackSubmission,
  syncResearchFeedbackToGoogleSheet,
} from "@/features/feedback/server/delivery";
import { reviewResearchFeedback } from "@/features/feedback/server/review";

function adminRedirect(type: "error" | "message", message: string): never {
  const params = new URLSearchParams({ status: "pending", [type]: message });
  redirect(`/admin/feedback?${params.toString()}`);
}

export async function reviewResearchFeedbackAction(formData: FormData) {
  const session = await requireFeedbackAdmin();
  const values = Object.fromEntries(formData);
  if (values.decision === "reject") delete values.rewardAmount;
  const parsed = researchFeedbackReviewSchema.safeParse(values);
  if (!parsed.success) {
    adminRedirect(
      "error",
      parsed.error.issues[0]?.message || "Review details are invalid.",
    );
  }

  const result = await reviewResearchFeedback({
    reviewerEmail: session.user.email,
    input: parsed.data,
  });
  if (!result.success) adminRedirect("error", result.message);

  revalidatePath("/admin/feedback");
  adminRedirect(
    "message",
    result.status === "approved"
      ? `${result.rewardAmount} credits approved.`
      : "Submission rejected without credits.",
  );
}

export async function retryResearchFeedbackDeliveryAction(formData: FormData) {
  await requireFeedbackAdmin();
  const submissionId = String(formData.get("submissionId") ?? "").trim();
  const channel = String(formData.get("channel") ?? "");
  if (!submissionId) adminRedirect("error", "Submission ID is required.");

  const result =
    channel === "notification"
      ? await notifyResearchFeedbackSubmission(submissionId)
      : await syncResearchFeedbackToGoogleSheet(submissionId);
  revalidatePath("/admin/feedback");
  adminRedirect(
    result.status === "failed" ? "error" : "message",
    result.status === "failed"
      ? result.error
      : channel === "notification"
        ? `Notification ${result.status}.`
        : `Google Sheet ${result.status}.`,
  );
}
