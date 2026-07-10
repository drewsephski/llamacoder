import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";
import { cache } from "react";

import { getCurrentSession } from "@/features/auth/server/session";
import type {
  ProjectMessage,
  ProjectWorkspace,
} from "@/features/projects/contracts";
import { getPrisma } from "@/lib/prisma";

const loadProjectWorkspace = cache(
  async (id: string, userId: string): Promise<ProjectWorkspace | null> => {
    const prisma = getPrisma();
    const chat = await prisma.chat.findFirst({
      where: { id, userId },
    });

    if (!chat) return null;

    const [totalMessages, initialMessages, recentMessages] = await Promise.all([
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
    ]);

    const allMessages = [...initialMessages, ...recentMessages].sort(
      (a, b) => a.position - b.position,
    );
    const followUpPromptsByMessageId = await getFollowUpPromptsByMessageId(
      prisma,
      id,
    );
    const messages: ProjectMessage[] = allMessages.map((message) => ({
      ...message,
      followUpPrompts:
        followUpPromptsByMessageId.get(message.id) ?? message.followUpPrompts,
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
        : await prisma.message.count({
            where: {
              chatId: id,
              role: "assistant",
              position: { lt: firstLoadedAssistantPosition },
            },
          });

    return {
      ...chat,
      messages,
      totalMessages,
      assistantMessagesCountBefore,
    };
  },
);

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
