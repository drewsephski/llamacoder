import "server-only";

import type { Chat } from "@prisma/client";

import { getCurrentSession } from "@/features/auth/server/session";
import { getPrisma } from "@/lib/prisma";
import type { TierKey } from "@/lib/billing/config";
import { getUserCreditInfo } from "@/lib/billing/credits";
import { reconcileCheckoutSessionForUser } from "@/lib/billing/stripe-fulfillment";
import { buildGeneratedFilesQualityReport } from "@/lib/generated-files";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";

const PROJECTS_PER_PAGE = 9;

export type ProjectVerificationSummary = {
  staticChecks: "passed" | "warnings" | "unknown";
  runtime: "passed" | "review" | "failed" | "not_run";
  export: "verified" | "warning" | "failed" | "not_run";
};

export type DashboardProject = Chat & {
  verification: ProjectVerificationSummary;
};

export type DashboardData = {
  currentPage: number;
  hasActiveSubscription: boolean;
  projects: DashboardProject[];
  session: Awaited<ReturnType<typeof getCurrentSession>>;
  tier: TierKey;
  totalPages: number;
  totalProjects: number;
  userCredits: number;
};

export async function getDashboardData({
  checkoutSessionId,
  page,
}: {
  checkoutSessionId?: string;
  page?: string;
}): Promise<DashboardData> {
  const session = await getCurrentSession();
  const parsedPage = Number.parseInt(page || "1", 10);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  if (!session) {
    return {
      currentPage,
      hasActiveSubscription: false,
      projects: [],
      session: null,
      tier: "free",
      totalPages: 0,
      totalProjects: 0,
      userCredits: 0,
    };
  }

  const prisma = getPrisma();
  if (checkoutSessionId) {
    try {
      await reconcileCheckoutSessionForUser({
        checkoutSessionId,
        userId: session.user.id,
      });
    } catch (error) {
      console.error("[Dashboard] Failed to reconcile checkout session:", error);
    }
  }

  const [totalProjects, projectRows, creditInfo] = await Promise.all([
    prisma.chat.count({ where: { userId: session.user.id } }),
    prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PROJECTS_PER_PAGE,
      take: PROJECTS_PER_PAGE,
      include: {
        messages: {
          where: { role: "assistant" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, content: true, files: true },
        },
      },
    }),
    getUserCreditInfo(session.user.id),
  ]);

  const latestMessageIds = projectRows.flatMap((project) =>
    project.messages[0] ? [project.messages[0].id] : [],
  );
  const [runtimeVerifications, exportArtifacts] =
    latestMessageIds.length > 0
      ? await Promise.all([
          prisma.runtimeVerification.findMany({
            where: { messageId: { in: latestMessageIds } },
            orderBy: { createdAt: "desc" },
            select: { messageId: true, status: true },
          }),
          prisma.exportArtifact.findMany({
            where: { messageId: { in: latestMessageIds } },
            orderBy: { createdAt: "desc" },
            select: { messageId: true, status: true },
          }),
        ])
      : [[], []];
  const latestRuntimeByMessage = new Map<string, string>();
  for (const verification of runtimeVerifications) {
    if (!latestRuntimeByMessage.has(verification.messageId)) {
      latestRuntimeByMessage.set(verification.messageId, verification.status);
    }
  }
  const latestExportByMessage = new Map<string, string>();
  for (const artifact of exportArtifacts) {
    if (!latestExportByMessage.has(artifact.messageId)) {
      latestExportByMessage.set(artifact.messageId, artifact.status);
    }
  }

  const projects: DashboardProject[] = projectRows.map((project) => {
    const latestMessage = project.messages[0];
    const files = latestMessage ? getMessageGeneratedFiles(latestMessage) : [];
    const qualityReport =
      files.length > 0 ? buildGeneratedFilesQualityReport(files) : null;
    const warningCount = qualityReport
      ? qualityReport.diagnostics.length +
        qualityReport.accessibilityWarnings.length
      : null;
    const runtimeStatus = latestMessage
      ? latestRuntimeByMessage.get(latestMessage.id)
      : undefined;
    const exportStatus = latestMessage
      ? latestExportByMessage.get(latestMessage.id)
      : undefined;
    const { messages: _messages, ...chat } = project;

    return {
      ...chat,
      verification: {
        staticChecks:
          warningCount === null
            ? "unknown"
            : warningCount === 0
              ? "passed"
              : "warnings",
        runtime:
          runtimeStatus === "passed" ||
          runtimeStatus === "review" ||
          runtimeStatus === "failed"
            ? runtimeStatus
            : "not_run",
        export:
          exportStatus === "verified" ||
          exportStatus === "warning" ||
          exportStatus === "failed"
            ? exportStatus
            : "not_run",
      },
    };
  });

  return {
    currentPage,
    hasActiveSubscription: creditInfo?.hasActiveSubscription ?? false,
    projects,
    session,
    tier: creditInfo?.tier ?? "free",
    totalPages: Math.ceil(totalProjects / PROJECTS_PER_PAGE),
    totalProjects,
    userCredits: creditInfo?.credits ?? 0,
  };
}
