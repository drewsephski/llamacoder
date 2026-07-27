import "server-only";

import { Prisma } from "@prisma/client";

import type {
  ResearchFeedbackActivityEvidence,
  ResearchFeedbackSubmissionInput,
  ResearchProgramState,
} from "@/features/feedback/contracts";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { getPrisma } from "@/lib/prisma";

type ProjectActivityInput = {
  hasCode: boolean;
  assistantMessages: Array<{
    content: string;
    files: Prisma.JsonValue | null;
  }>;
  runtimeVerificationCount: number;
  exportCount: number;
};

export function getResearchFeedbackActivityEvidence({
  hasCode,
  assistantMessages,
  runtimeVerificationCount,
  exportCount,
}: ProjectActivityInput): ResearchFeedbackActivityEvidence {
  const generatedVersions = assistantMessages.filter(
    (message) => getMessageGeneratedFiles(message).length > 0,
  ).length;
  const previewed = runtimeVerificationCount > 0;
  const edited = generatedVersions >= 2;
  const exported = exportCount > 0;

  return {
    generatedVersions,
    previewed,
    edited,
    exported,
    qualifies:
      hasCode && generatedVersions > 0 && (previewed || edited || exported),
  };
}

export async function getResearchProgramState(
  userId: string,
): Promise<ResearchProgramState | null> {
  const prisma = getPrisma();
  const [user, projects] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        emailVerified: true,
        researchFeedback: {
          select: {
            id: true,
            chatId: true,
            status: true,
            rewardAmount: true,
            createdAt: true,
            chat: { select: { title: true } },
          },
        },
      },
    }),
    prisma.chat.findMany({
      where: { userId, hasCode: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        hasCode: true,
        messages: {
          where: { role: "assistant" },
          select: { content: true, files: true },
        },
        runtimeVerifications: {
          select: { id: true },
          take: 1,
        },
      },
    }),
  ]);

  if (!user) return null;

  const exportRows =
    projects.length > 0
      ? await prisma.exportArtifact.findMany({
          where: { chatId: { in: projects.map((project) => project.id) } },
          select: { chatId: true },
          distinct: ["chatId"],
        })
      : [];
  const exportedProjectIds = new Set(exportRows.map((row) => row.chatId));
  const eligibleProjects = projects.flatMap((project) => {
    const evidence = getResearchFeedbackActivityEvidence({
      hasCode: project.hasCode,
      assistantMessages: project.messages,
      runtimeVerificationCount: project.runtimeVerifications.length,
      exportCount: exportedProjectIds.has(project.id) ? 1 : 0,
    });
    return evidence.qualifies
      ? [
          {
            id: project.id,
            title: project.title,
            createdAt: project.createdAt.toISOString(),
            ...evidence,
          },
        ]
      : [];
  });

  return {
    accountEmail: user.email,
    emailVerified: user.emailVerified,
    eligibleProjects,
    submission: user.researchFeedback
      ? {
          id: user.researchFeedback.id,
          projectId: user.researchFeedback.chatId,
          projectTitle: user.researchFeedback.chat.title,
          status:
            user.researchFeedback.status === "approved" ||
            user.researchFeedback.status === "rejected"
              ? user.researchFeedback.status
              : "pending",
          rewardAmount: user.researchFeedback.rewardAmount,
          createdAt: user.researchFeedback.createdAt.toISOString(),
        }
      : null,
  };
}

export type SubmitResearchFeedbackResult =
  | { success: true; submissionId: string }
  | {
      success: false;
      code:
        | "ACCOUNT_NOT_VERIFIED"
        | "ALREADY_SUBMITTED"
        | "PROJECT_NOT_ELIGIBLE"
        | "USER_NOT_FOUND";
    };

export async function submitResearchFeedback({
  userId,
  input,
}: {
  userId: string;
  input: ResearchFeedbackSubmissionInput;
}): Promise<SubmitResearchFeedbackResult> {
  const prisma = getPrisma();
  const [user, project, exportCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        emailVerified: true,
        researchFeedback: { select: { id: true } },
      },
    }),
    prisma.chat.findFirst({
      where: { id: input.projectId, userId },
      select: {
        id: true,
        hasCode: true,
        messages: {
          where: { role: "assistant" },
          select: { content: true, files: true },
        },
        runtimeVerifications: {
          select: { id: true },
          take: 1,
        },
      },
    }),
    prisma.exportArtifact.count({
      where: { chatId: input.projectId, userId },
    }),
  ]);

  if (!user) return { success: false, code: "USER_NOT_FOUND" };
  if (!user.emailVerified) {
    return { success: false, code: "ACCOUNT_NOT_VERIFIED" };
  }
  if (user.researchFeedback) {
    return { success: false, code: "ALREADY_SUBMITTED" };
  }
  if (!project) {
    return { success: false, code: "PROJECT_NOT_ELIGIBLE" };
  }

  const evidence = getResearchFeedbackActivityEvidence({
    hasCode: project.hasCode,
    assistantMessages: project.messages,
    runtimeVerificationCount: project.runtimeVerifications.length,
    exportCount,
  });
  if (!evidence.qualifies) {
    return { success: false, code: "PROJECT_NOT_ELIGIBLE" };
  }

  try {
    const submission = await prisma.researchFeedbackSubmission.create({
      data: {
        userId,
        chatId: project.id,
        accountEmail: user.email,
        buildGoal: input.buildGoal,
        previousTools: input.previousTools,
        frustration: input.frustration,
        betterThanExpected: input.betterThanExpected,
        abandonmentPoint: input.abandonmentPoint,
        launchBlocker: input.launchBlocker,
        singleImprovement: input.singleImprovement,
        paymentIntent: input.paymentIntent,
        monthlyPriceUsd: input.monthlyPriceUsd,
        followUpConsent: input.followUpConsent,
        mediaUrl: input.mediaUrl,
        rewardTrack:
          input.followUpConsent || input.mediaUrl ? "extended" : "standard",
        activityEvidence: evidence,
      },
      select: { id: true },
    });
    return { success: true, submissionId: submission.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, code: "ALREADY_SUBMITTED" };
    }
    throw error;
  }
}
