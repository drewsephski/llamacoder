"use server";

import { getPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  checkCreditAvailability,
  consumeCreditsForGeneration,
} from "@/lib/billing";
import { normalizeGeneratedFiles } from "@/lib/generated-files";

export async function createMessage(
  chatId: string,
  text: string,
  role: "assistant" | "user",
  files?: any[],
) {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to send messages");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
  if (!chat) notFound();

  if (chat.userId && chat.userId !== session.user.id) {
    throw new Error("You can only add messages to your own projects");
  }

  const maxPosition =
    chat.messages.length > 0
      ? Math.max(...chat.messages.map((m: any) => m.position))
      : 0;

  // Follow-up user messages only reserve the right to start generation. Credits
  // are charged when the assistant response is successfully persisted.
  const isFollowUpUserMessage = role === "user" && chat.messages.length >= 2;

  if (isFollowUpUserMessage && chat.userId) {
    const creditCheck = await checkCreditAvailability({
      userId: chat.userId,
      modelId: chat.model,
    });

    if (!creditCheck.success) {
      if (creditCheck.error === "INSUFFICIENT_CREDITS") {
        throw new Error("INSUFFICIENT_CREDITS");
      }
      throw new Error("CREDIT_CHECK_FAILED");
    }
  }

  const normalizedFiles =
    role === "assistant" && files ? normalizeGeneratedFiles(files) : files;
  const assistantHasFiles =
    role === "assistant" &&
    Array.isArray(normalizedFiles) &&
    normalizedFiles.length > 0;

  const messageData = {
    role,
    content: text,
    files: normalizedFiles ? JSON.parse(JSON.stringify(normalizedFiles)) : null,
    position: maxPosition + 1,
    chatId,
  };

  if (role === "assistant" && chat.userId) {
    return await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: messageData,
      });

      if (assistantHasFiles) {
        await tx.chat.update({
          where: { id: chatId },
          data: { hasCode: true },
        });
      }

      const creditCheck = await consumeCreditsForGeneration({
        client: tx,
        userId: chat.userId!,
        modelId: chat.model,
        chatId,
        description: `AI generation - ${chat.model}`,
        status: "completed",
      });

      if (!creditCheck.success) {
        if (creditCheck.error === "INSUFFICIENT_CREDITS") {
          throw new Error("INSUFFICIENT_CREDITS");
        }
        throw new Error("CREDIT_CHECK_FAILED");
      }

      return newMessage;
    });
  }

  const newMessage = await prisma.message.create({ data: messageData });

  if (assistantHasFiles) {
    await prisma.chat.update({
      where: { id: chatId },
      data: { hasCode: true },
    });
  }

  return newMessage;
}

export async function saveProject(chatId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to save");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.userId) {
    throw new Error("This project is already saved");
  }

  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data: { userId: session.user.id },
  });

  return updatedChat;
}

export async function deleteProject(chatId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to delete projects");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.userId && chat.userId !== session.user.id) {
    throw new Error("You can only delete your own projects");
  }

  if (!chat.userId) {
    throw new Error("Unsaved projects cannot be deleted");
  }

  await prisma.chat.delete({
    where: { id: chatId },
  });
}

export async function renameProject(chatId: string, newTitle: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to rename projects");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.userId !== session.user.id) {
    throw new Error("You can only rename your own projects");
  }

  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data: { title: newTitle },
  });

  return updatedChat;
}

export async function duplicateProject(chatId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to duplicate projects");
  }

  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.userId && chat.userId !== session.user.id) {
    throw new Error("You can only duplicate your own projects");
  }

  if (!chat.userId) {
    throw new Error("Unsaved projects cannot be duplicated");
  }

  const newChat = await prisma.chat.create({
    data: {
      model: chat.model,
      quality: chat.quality,
      prompt: chat.prompt,
      title: `${chat.title} (copy)`,
      llamaCoderVersion: chat.llamaCoderVersion,
      shadcn: chat.shadcn,
      userId: session.user.id,
      messages: {
        create: chat.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          files: msg.files,
          position: msg.position,
        })),
      },
    },
  });

  return newChat;
}
