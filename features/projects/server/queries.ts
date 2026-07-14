import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";
import { cache } from "react";

import { getCurrentSession } from "@/features/auth/server/session";
import type {
  ProjectMessage,
  ProjectWorkspace,
} from "@/features/projects/contracts";
import { getPrisma } from "@/lib/prisma";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";

const loadProjectWorkspace = cache(
  async (id: string, userId: string): Promise<ProjectWorkspace | null> => {
    const prisma = getPrisma();
    const chat = await prisma.chat.findFirst({
      where: { id, userId },
    });

    if (!chat) return null;

    const [totalMessages, initialMessages, recentMessages, activeRun] =
      await Promise.all([
        prisma.message.count({ where: { chatId: id } }),
        prisma.message.findMany({
          where: { chatId: id, position: { in: [0, 1] } },
          orderBy: { position: "asc" },
        }),
        prisma.message.findMany({
          where: { chatId: id, position: { gte: 2 } },
          orderBy: { position: "desc" },
          take: 100,
        }),
        prisma.generationRun.findFirst({
          where: {
            chatId: id,
            status: { in: ["running", "recoverable"] },
            partialText: { not: "" },
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            messageId: true,
            status: true,
            phase: true,
            label: true,
            partialText: true,
            createdAt: true,
          },
        }),
      ]);

    const allMessages = [...initialMessages, ...recentMessages].sort(
      (a, b) => a.position - b.position,
    );
    const followUpPromptsByMessageId = await getFollowUpPromptsByMessageId(
      prisma,
      id,
    );
    const messageIds = allMessages.map((message) => message.id);
    const [receiptsByMessageId, exportStatusByMessageId] = await Promise.all([
      getGenerationReceiptsByMessageId(prisma, messageIds),
      getExportStatusesByMessageId(prisma, messageIds),
    ]);
    const messages: ProjectMessage[] = allMessages.map((message) => ({
      ...message,
      followUpPrompts:
        followUpPromptsByMessageId.get(message.id) ?? message.followUpPrompts,
      generationReceipt: receiptsByMessageId.has(message.id)
        ? {
            ...receiptsByMessageId.get(message.id)!,
            exportVerification: exportStatusByMessageId.get(message.id) ?? null,
          }
        : null,
    }));

    const firstLoadedAssistantPosition = messages.reduce<number | null>(
      (minimum, message) => {
        if (message.role !== "assistant") return minimum;
        return minimum === null
          ? message.position
          : Math.min(minimum, message.position);
      },
      null,
    );
    const assistantMessagesCountBefore =
      firstLoadedAssistantPosition === null
        ? 0
        : (
            await prisma.message.findMany({
              where: {
                chatId: id,
                role: "assistant",
                position: { lt: firstLoadedAssistantPosition },
              },
              select: { content: true, files: true },
            })
          ).filter((message) => getMessageGeneratedFiles(message).length > 0)
            .length;

    return {
      ...chat,
      messages,
      totalMessages,
      assistantMessagesCountBefore,
      activeGenerationRun: activeRun
        ? {
            id: activeRun.id,
            messageId: activeRun.messageId,
            status: activeRun.status === "running" ? "running" : "recoverable",
            phase: activeRun.phase,
            label: activeRun.label,
            partialTextLength: activeRun.partialText.length,
            createdAt: activeRun.createdAt,
          }
        : null,
    };
  },
);

async function getGenerationReceiptsByMessageId(
  prisma: PrismaClient,
  messageIds: string[],
) {
  if (messageIds.length === 0) return new Map();

  try {
    const rows = await prisma.generationLog.findMany({
      where: { messageId: { in: messageIds } },
      orderBy: { createdAt: "desc" },
      select: {
        messageId: true,
        estimatedCredits: true,
        actualCredits: true,
        creditsUsed: true,
        refundedCredits: true,
        phase: true,
        status: true,
      },
    });

    const receipts = new Map<
      string,
      {
        estimatedCredits: number | null;
        actualCredits: number;
        refundedCredits: number;
        phase: string | null;
        status: string;
      }
    >();
    for (const row of rows) {
      if (!row.messageId || receipts.has(row.messageId)) continue;
      receipts.set(row.messageId, {
        estimatedCredits: row.estimatedCredits,
        actualCredits: row.actualCredits ?? row.creditsUsed,
        refundedCredits: row.refundedCredits,
        phase: row.phase,
        status: row.status,
      });
    }
    return receipts;
  } catch (error) {
    console.warn("Failed to load generation receipts:", error);
    return new Map();
  }
}

async function getExportStatusesByMessageId(
  prisma: PrismaClient,
  messageIds: string[],
) {
  if (messageIds.length === 0) return new Map<string, string>();

  const rows = await prisma.exportArtifact.findMany({
    where: { messageId: { in: messageIds } },
    orderBy: { createdAt: "desc" },
    select: { messageId: true, status: true },
  });
  const statuses = new Map<string, "verified" | "warning" | "failed">();
  for (const row of rows) {
    if (statuses.has(row.messageId)) continue;
    if (
      row.status === "verified" ||
      row.status === "warning" ||
      row.status === "failed"
    ) {
      statuses.set(row.messageId, row.status);
    }
  }
  return statuses;
}

export async function getAuthorizedProjectWorkspace(
  id: string,
): Promise<ProjectWorkspace | null> {
  const session = await getCurrentSession();
  if (!session) return null;

  return loadProjectWorkspace(id, session.user.id);
}

async function getFollowUpPromptsByMessageId(
  prisma: PrismaClient,
  chatId: string,
) {
  try {
    const rows = await prisma.$queryRaw<
      { id: string; followUpPrompts: Prisma.JsonValue }[]
    >`
      SELECT "id", "followUpPrompts"
      FROM "Message"
      WHERE "chatId" = ${chatId}
        AND "followUpPrompts" IS NOT NULL
    `;

    return new Map(rows.map((row) => [row.id, row.followUpPrompts]));
  } catch (error) {
    console.warn("Failed to load follow-up prompts:", error);
    return new Map<string, Prisma.JsonValue>();
  }
}
