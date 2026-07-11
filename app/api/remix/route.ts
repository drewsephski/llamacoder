import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { formatGeneratedFilesMarkdown } from "@/lib/generated-files";
import { getPrisma } from "@/lib/prisma";
import { getMainCodingPrompt } from "@/lib/prompts";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { headers } from "next/headers";
import { z } from "zod";
import {
  checkProjectCreationEligibility,
  getModelCreditHoldCost,
} from "@/lib/billing";

const remixSchema = z.object({
  messageId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = remixSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid remix request" },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "AUTHENTICATION_REQUIRED", message: "Please sign in to remix" },
      { status: 401 },
    );
  }

  const prisma = getPrisma();
  const sourceMessage = await prisma.message.findUnique({
    where: { id: parsed.data.messageId },
    include: { chat: true },
  });

  if (!sourceMessage) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Shared app not found" },
      { status: 404 },
    );
  }

  const files = getMessageGeneratedFiles(sourceMessage);

  if (files.length === 0) {
    return NextResponse.json(
      {
        error: "NO_FILES",
        message: "This app has no generated files to remix",
      },
      { status: 400 },
    );
  }

  const eligibility = await checkProjectCreationEligibility({
    userId: session.user.id,
    modelId: sourceMessage.chat.model,
  });

  if (!eligibility.success) {
    if (eligibility.error === "ELIGIBILITY_CHECK_FAILED") {
      return NextResponse.json(
        {
          error: eligibility.error,
          message: "Unable to verify your credit balance. Please try again.",
        },
        { status: 500 },
      );
    }

    if (eligibility.error === "PROJECT_LIMIT_REACHED") {
      return NextResponse.json(
        {
          error: "PROJECT_LIMIT_REACHED",
          message: `You've used all ${eligibility.projectLimit} free projects. View pricing to remix more.`,
        },
        { status: 403 },
      );
    }

    if (eligibility.error === "FORBIDDEN_MODEL") {
      return NextResponse.json(
        {
          error: "FORBIDDEN_MODEL",
          message: "Upgrade to remix apps built with this model",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error: eligibility.error,
        message:
          eligibility.error === "INSUFFICIENT_CREDITS"
            ? `Need ${getModelCreditHoldCost(sourceMessage.chat.model)} credits to remix this app. Upgrade or buy credits to continue.`
            : "Unable to remix this app",
      },
      { status: eligibility.error === "USER_NOT_FOUND" ? 404 : 402 },
    );
  }

  const referrerUserId =
    sourceMessage.chat.userId && sourceMessage.chat.userId !== session.user.id
      ? sourceMessage.chat.userId
      : null;
  const userPrompt = `Remix this shared Squid app: ${sourceMessage.chat.prompt}`;
  const assistantContent = [
    `Remixed from shared app ${sourceMessage.id}.`,
    "",
    formatGeneratedFilesMarkdown(files),
  ].join("\n");

  const newChat = await prisma.$transaction(async (tx) => {
    const chat = await tx.chat.create({
      data: {
        model: sourceMessage.chat.model,
        quality: sourceMessage.chat.quality,
        prompt: userPrompt,
        title: `${sourceMessage.chat.title} remix`,
        llamaCoderVersion: sourceMessage.chat.llamaCoderVersion,
        shadcn: sourceMessage.chat.shadcn,
        plan: sourceMessage.chat.plan,
        hasCode: true,
        userId: session.user.id,
        sourceMessageId: sourceMessage.id,
        sourceChatId: sourceMessage.chatId,
        referrerUserId,
        messages: {
          createMany: {
            data: [
              {
                role: "system",
                content: getMainCodingPrompt(),
                position: 0,
              },
              {
                role: "user",
                content: userPrompt,
                position: 1,
              },
              {
                role: "assistant",
                content: assistantContent,
                files: JSON.parse(JSON.stringify(files)),
                position: 2,
              },
            ],
          },
        },
      },
      select: { id: true },
    });

    await tx.shareEvent.create({
      data: {
        messageId: sourceMessage.id,
        chatId: sourceMessage.chatId,
        eventType: "remix_created",
        userId: session.user.id,
        referrerUserId,
        metadata: {
          remixChatId: chat.id,
        },
      },
    });

    return chat;
  });

  return NextResponse.json({ chatId: newChat.id });
}
