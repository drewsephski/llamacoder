import { after, NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getMainCodingPrompt } from "@/lib/prompts";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { FREE_MODEL, MODELS, isPlanModeAvailable } from "@/lib/constants";
import {
  checkProjectCreationEligibility,
  getModelCreditHoldCost,
} from "@/lib/billing";
import {
  createAppOpenRouter,
  createOpenRouterModel,
  getAIErrorMessage,
  getOpenRouterProviderOptions,
  getOpenRouterReasoningSelection,
} from "@/lib/openrouter";
import { createRequestTelemetry } from "@/features/generation/server/request-telemetry";
import {
  ACCEPTED_SCREENSHOT_MIME_TYPES,
  MAX_SCREENSHOT_DATA_URL_LENGTH,
  MAX_SCREENSHOT_SIZE_MB,
} from "@/lib/constants";
import { z } from "zod";

const IMAGE_DATA_URL_PATTERN = new RegExp(
  `^data:(${ACCEPTED_SCREENSHOT_MIME_TYPES.join("|")});base64,`,
  "i",
);

const createChatSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required"),
  model: z.string().min(1, "Model is required"),
  quality: z.enum(["high", "low"]),
  screenshotUrl: z.string().optional(),
  screenshotData: z
    .string()
    .max(
      MAX_SCREENSHOT_DATA_URL_LENGTH,
      `Image is too large. Please upload an image under ${MAX_SCREENSHOT_SIZE_MB} MB.`,
    )
    .regex(IMAGE_DATA_URL_PATTERN, "Image must be a PNG, JPEG, or WebP file.")
    .optional(),
});

function createFallbackTitle(prompt: string) {
  const title = prompt
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 5)
    .join(" ");

  return title || "New Project";
}

function normalizeGeneratedTitle(title: string | undefined, fallback: string) {
  const normalized = title
    ?.replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized ? normalized.slice(0, 80) : fallback;
}

export async function POST(request: NextRequest) {
  const prisma = getPrisma();

  try {
    const parsed = createChatSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "INVALID_REQUEST",
          message: parsed.error.issues[0]?.message || "Invalid request",
        },
        { status: 400 },
      );
    }

    const { prompt, model, quality: requestedQuality } = parsed.data;
    const selectedModel = MODELS.find((m) => m.value === model);

    if (!selectedModel) {
      return NextResponse.json(
        { error: "INVALID_MODEL", message: "Selected model is not supported" },
        { status: 400 },
      );
    }
    const quality = isPlanModeAvailable(model) ? requestedQuality : "low";

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          error: "AUTHENTICATION_REQUIRED",
          message: "Please sign in to create a project",
        },
        { status: 401 },
      );
    }

    const eligibility = await checkProjectCreationEligibility({
      userId: session.user.id,
      modelId: model,
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
            message: `You've used all ${eligibility.projectLimit} free projects. View pricing to create more.`,
          },
          { status: 403 },
        );
      }

      if (eligibility.error === "FORBIDDEN_MODEL") {
        return NextResponse.json(
          { error: "FORBIDDEN_MODEL", message: "Upgrade to use this model" },
          { status: 403 },
        );
      }

      return NextResponse.json(
        {
          error: eligibility.error,
          message:
            eligibility.error === "INSUFFICIENT_CREDITS"
              ? `Need ${getModelCreditHoldCost(model)} credits to start this model. Upgrade or buy credits to continue.`
              : "Unable to process request",
        },
        { status: eligibility.error === "USER_NOT_FOUND" ? 404 : 402 },
      );
    }

    const fallbackTitle = createFallbackTitle(prompt);

    let chat: {
      id: string;
      messages: { id: string; position: number }[];
    };

    try {
      chat = await prisma.chat.create({
        data: {
          model,
          quality,
          prompt,
          title: fallbackTitle,
          shadcn: true,
          userId: session.user.id,
          messages: {
            createMany: {
              data: [
                {
                  role: "system",
                  content: getMainCodingPrompt(),
                  position: 0,
                },
                { role: "user", content: prompt, position: 1 },
              ],
            },
          },
        },
        select: {
          id: true,
          messages: {
            select: {
              id: true,
              position: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to persist chat:", error);

      return NextResponse.json(
        {
          error: "CHAT_CREATE_FAILED",
          message: "Unable to save the project.",
        },
        { status: 500 },
      );
    }

    const userMessage = chat.messages.find((message) => message.position === 1);

    if (!userMessage) {
      console.error("Created chat without an initial user message:", chat.id);

      await prisma.chat.delete({ where: { id: chat.id } }).catch((error) => {
        console.error("Failed to delete incomplete chat:", error);
      });

      return NextResponse.json(
        {
          error: "CHAT_CREATE_FAILED",
          message: "Unable to initialize the project conversation",
        },
        { status: 500 },
      );
    }

    after(async () => {
      try {
        const openrouter = createAppOpenRouter({
          sessionId: chat.id,
          sessionName: "SquidAgent Chat",
        });
        const titleTelemetry = createRequestTelemetry({
          userId: session.user.id,
          chatId: chat.id,
          messageId: userMessage.id,
          modelId: FREE_MODEL,
          requestKind: "title",
          quality: "low",
          reasoning: getOpenRouterReasoningSelection(FREE_MODEL, "low"),
        });
        const responseForChatTitle = await generateText({
          model: createOpenRouterModel(openrouter, FREE_MODEL, {
            maxTokens: 32,
            usage: { include: true },
          }),
          providerOptions: getOpenRouterProviderOptions(FREE_MODEL, "low"),
          messages: [
            {
              role: "system",
              content:
                "Create a succinct 3-5 word title for this app-building conversation. Return only the title.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        await titleTelemetry.record({
          status: "completed",
          usage: responseForChatTitle.usage,
          finishReason: responseForChatTitle.finishReason,
          providerMetadata: responseForChatTitle.providerMetadata,
          providerRequestId: responseForChatTitle.response?.id,
        });

        await prisma.chat.update({
          where: { id: chat.id },
          data: {
            title: normalizeGeneratedTitle(
              responseForChatTitle.text,
              fallbackTitle,
            ),
          },
        });
      } catch (error) {
        console.warn(
          "Title generation failed, keeping fallback title:",
          getAIErrorMessage(error),
        );
      }
    });

    return NextResponse.json({
      chatId: chat.id,
      lastMessageId: userMessage.id,
      plan: null,
      hasCode: false,
    });
  } catch (error) {
    console.error("Unexpected error creating chat:", error);
    return NextResponse.json(
      {
        error: "CHAT_CREATE_FAILED",
        message: "Failed to create project. Please try again.",
      },
      { status: 500 },
    );
  }
}
