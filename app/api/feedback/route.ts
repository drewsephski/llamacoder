import { getCurrentSession } from "@/features/auth/server/session";
import { researchFeedbackSubmissionSchema } from "@/features/feedback/contracts";
import { scheduleResearchFeedbackDelivery } from "@/features/feedback/server/delivery";
import { submitResearchFeedback } from "@/features/feedback/server/program";
import { consumeRateLimit } from "@/features/security/server/rate-limit";

const errorResponses = {
  ACCOUNT_NOT_VERIFIED: {
    status: 403,
    message: "Verify your Squid account email before submitting feedback.",
  },
  ALREADY_SUBMITTED: {
    status: 409,
    message: "This account has already submitted research feedback.",
  },
  PROJECT_NOT_ELIGIBLE: {
    status: 403,
    message:
      "Choose a generated project that you have previewed, edited, or exported.",
  },
  USER_NOT_FOUND: {
    status: 404,
    message: "Your Squid account could not be found.",
  },
} as const;

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await consumeRateLimit({
    userId: session.user.id,
    operation: "feedback",
    limit: 3,
    windowMs: 60 * 60 * 1_000,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { message: "Too many feedback attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const parsed = researchFeedbackSubmissionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json(
      {
        message:
          "Complete each required question with specific, project-based feedback.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const result = await submitResearchFeedback({
    userId: session.user.id,
    input: parsed.data,
  });
  if (!result.success) {
    const error = errorResponses[result.code];
    return Response.json({ message: error.message }, { status: error.status });
  }

  scheduleResearchFeedbackDelivery(result.submissionId);

  return Response.json(
    { submissionId: result.submissionId, status: "pending" },
    { status: 201 },
  );
}
