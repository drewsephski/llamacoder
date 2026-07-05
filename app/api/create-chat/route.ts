import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import {
  getMainCodingPrompt,
  screenshotToCodePrompt,
  softwareArchitectPrompt,
} from "@/lib/prompts";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MODELS } from "@/lib/constants";
import {
  checkProjectCreationEligibility,
  getModelCreditCost,
} from "@/lib/billing";
import {
  createAppOpenRouter,
  createOpenRouterModel,
  getAIErrorMessage,
} from "@/lib/openrouter";
import { z } from "zod";

const createChatSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required"),
  model: z.string().min(1, "Model is required"),
  quality: z.enum(["high", "low"]),
  screenshotUrl: z.string().optional(),
  screenshotData: z.string().optional(),
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
  const warnings: string[] = [];

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

    const { prompt, model, quality, screenshotData } = parsed.data;
    const selectedModel = MODELS.find((m) => m.value === model);

    if (!selectedModel) {
      return NextResponse.json(
        { error: "INVALID_MODEL", message: "Selected model is not supported" },
        { status: 400 },
      );
    }

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
              ? `Need ${getModelCreditCost(model)} credits for this model. Upgrade or buy credits to continue.`
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

    const openrouter = createAppOpenRouter({
      sessionId: chat.id,
      sessionName: "SquidCoder Chat",
    });

    let fullScreenshotDescription: string | undefined;

    if (screenshotData) {
      try {
        const screenshotResponse = await generateText({
          model: createOpenRouterModel(openrouter, model, {
            maxTokens: 1000,
          }),
          providerOptions: {
            openrouter: {
              reasoning: { enabled: false },
            },
          },
          temperature: 0.4,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: screenshotToCodePrompt },
                {
                  type: "image",
                  image: screenshotData,
                },
              ],
            },
          ],
        });

        fullScreenshotDescription = screenshotResponse.text || undefined;
      } catch (error) {
        warnings.push("SCREENSHOT_PROCESSING_FAILED");
        console.warn(
          "Screenshot processing failed, continuing without it:",
          getAIErrorMessage(error),
        );
      }
    }

    if (fullScreenshotDescription && quality === "low") {
      const content =
        prompt +
        "RECREATE THIS APP AS CLOSELY AS POSSIBLE: " +
        fullScreenshotDescription;

      await prisma.message
        .update({
          where: { id: userMessage.id },
          data: { content },
        })
        .catch((error) => {
          warnings.push("SCREENSHOT_MESSAGE_UPDATE_FAILED");
          console.error(
            "Failed to attach screenshot context to message:",
            error,
          );
        });
    }

    const [title, plan] = await Promise.all([
      (async () => {
        try {
          const responseForChatTitle = await generateText({
            model: createOpenRouterModel(openrouter, model, {
              maxTokens: 32,
            }),
            messages: [
              {
                role: "system",
                content:
                  "You are a chatbot helping the user create a simple app or script, and your current job is to create a succinct title, maximum 3-5 words, for the chat given their initial prompt. Please return only the title.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          return normalizeGeneratedTitle(
            responseForChatTitle.text,
            fallbackTitle,
          );
        } catch (error) {
          warnings.push("TITLE_GENERATION_FAILED");
          console.warn(
            "Title generation failed, using fallback title:",
            getAIErrorMessage(error),
          );
          return fallbackTitle;
        }
      })(),
      (async () => {
        if (quality !== "high") return null;

        try {
          const initialRes = await generateText({
            model: createOpenRouterModel(openrouter, model, {
              maxTokens: 3000,
            }),
            messages: [
              {
                role: "system",
                content: softwareArchitectPrompt,
              },
              {
                role: "user",
                content: fullScreenshotDescription
                  ? fullScreenshotDescription + prompt
                  : prompt,
              },
            ],
            temperature: 0.4,
          });

          return initialRes.text || null;
        } catch (error) {
          warnings.push("PLAN_GENERATION_FAILED");
          console.warn(
            "Plan generation failed, continuing without plan:",
            getAIErrorMessage(error),
          );
          return null;
        }
      })(),
    ]);

    await prisma.chat
      .update({
        where: {
          id: chat.id,
        },
        data: {
          title,
          plan,
          hasCode: false,
        },
      })
      .catch((error) => {
        warnings.push("CHAT_ENRICHMENT_UPDATE_FAILED");
        console.error("Failed to update chat enrichment fields:", error);
      });

    if (plan) {
      await prisma.generationLog
        .create({
          data: {
            userId: session.user.id,
            modelId: model,
            creditsUsed: getModelCreditCost(model),
            status: "plan_generated",
            chatId: chat.id,
          },
        })
        .catch((error) => {
          console.error("Failed to log plan generation:", error);
        });
    }

    return NextResponse.json({
      chatId: chat.id,
      lastMessageId: userMessage.id,
      plan,
      hasCode: false,
      warnings: warnings.length ? warnings : undefined,
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
