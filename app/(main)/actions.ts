"use server";

import { getPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MODELS, FREE_MODEL } from "@/lib/constants";

// Credit costs for different model tiers
const MODEL_CREDIT_COSTS: Record<string, number> = {
  [FREE_MODEL]: 0, // Free model costs 0 credits
  default: 1, // Standard paid models cost 1 credit
  premium: 2, // Premium models (Pro versions) cost 2 credits
};

function getModelCreditCost(modelValue: string): number {
  const model = MODELS.find(m => m.value === modelValue);
  if (!model) return MODEL_CREDIT_COSTS.default;
  if (model.free) return 0;
  if (modelValue.includes('pro') || modelValue.includes('maverick')) {
    return MODEL_CREDIT_COSTS.premium;
  }
  return MODEL_CREDIT_COSTS.default;
}

export async function createMessage(
  chatId: string,
  text: string,
  role: "assistant" | "user",
  files?: any[],
) {
  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
  if (!chat) notFound();

  const maxPosition = chat.messages.length > 0
    ? Math.max(...chat.messages.map((m: any) => m.position))
    : 0;

  // Deduct credit for user follow-up messages (not initial creation or assistant messages)
  const isFollowUpUserMessage = role === "user" && chat.messages.length >= 2;

  if (isFollowUpUserMessage && chat.userId) {
    // Check user credits and subscription status in a single query
    const user = await prisma.user.findUnique({
      where: { id: chat.userId },
      select: {
        credits: true,
        subscription: { select: { status: true, tier: true } }
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const hasActiveSubscription = user.subscription?.status === "active";
    const isUnlimited = hasActiveSubscription && user.subscription?.tier === "unlimited";

    // Only Unlimited subscribers skip credit deduction; Pro subscribers still use credits
    if (!isUnlimited) {
      // Calculate credit cost based on the chat's model
      const creditCost = getModelCreditCost(chat.model);

      // Atomic credit deduction + history in a single transaction
      await prisma.$transaction(async (tx) => {
        const result = await tx.user.updateMany({
          where: {
            id: chat.userId!,
            credits: { gte: creditCost }
          },
          data: { credits: { decrement: creditCost } },
        });

        if (result.count === 0) {
          throw new Error("INSUFFICIENT_CREDITS");
        }

        await tx.creditHistory.create({
          data: {
            userId: chat.userId!,
            amount: -creditCost,
            type: "usage",
            description: `AI generation - ${chat.model}`,
            chatId: chatId!,
          },
        });
      });
    }
  }

  const newMessage = await prisma.message.create({
    data: {
      role,
      content: text,
      files: files ? JSON.parse(JSON.stringify(files)) : null,
      position: maxPosition + 1,
      chatId,
    },
  });

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
