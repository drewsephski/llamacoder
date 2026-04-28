import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import {
  getMainCodingPrompt,
  screenshotToCodePrompt,
  softwareArchitectPrompt,
} from "@/lib/prompts";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MODELS, FREE_MODEL } from "@/lib/constants";

// Credit costs for different model tiers
const MODEL_CREDIT_COSTS: Record<string, number> = {
  [FREE_MODEL]: 0, // Free model costs 0 credits
  default: 1, // Standard paid models cost 1 credit
  premium: 2, // Premium models (Pro versions) cost 2 credits
};

// Free user project limit
const FREE_PROJECT_LIMIT = 3;

function getModelCreditCost(modelValue: string): number {
  const model = MODELS.find(m => m.value === modelValue);
  if (!model) return MODEL_CREDIT_COSTS.default;
  if (model.free) return 0;
  if (modelValue.includes('pro') || modelValue.includes('maverick')) {
    return MODEL_CREDIT_COSTS.premium;
  }
  return MODEL_CREDIT_COSTS.default;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, quality, screenshotUrl, screenshotData } = await request.json();
    
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const prisma = getPrisma();
    
    // Check if selected model is free or paid
    const selectedModel = MODELS.find(m => m.value === model);
    const isPaidModel = selectedModel?.paid ?? false;
    
    // For unauthenticated users or users without credits/subscription, enforce free model
    let resolvedModel = model;
    let creditCost = 0;
    
    if (!session) {
      // Unauthenticated users must use free model
      if (isPaidModel) {
        return NextResponse.json(
          { error: "PAID_MODEL_REQUIRES_AUTH", message: "Please sign in to use premium models" },
          { status: 403 }
        );
      }
      resolvedModel = FREE_MODEL;
    } else {
      // Authenticated user - check if they can use paid models
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          credits: true,
          subscription: {
            select: {
              status: true,
              tier: true,
            },
          },
        },
      });

      const userCredits = user?.credits || 0;
      const hasActiveSubscription = user?.subscription?.status === "active";
      const isUnlimited = hasActiveSubscription && user?.subscription?.tier === "unlimited";
      const canUsePaidModels = hasActiveSubscription;

      if (isPaidModel && !canUsePaidModels) {
        return NextResponse.json(
          { error: "INSUFFICIENT_CREDITS", message: "Upgrade to use premium models" },
          { status: 402 }
        );
      }

      // Calculate credit cost for this model
      creditCost = getModelCreditCost(model);
      
      // Check if first project (free) or has unlimited subscription
      const existingProjectsCount = await prisma.chat.count({
        where: { userId: session.user.id },
      });
      const isFirstProject = existingProjectsCount === 0;

      // Enforce project limit for free users
      if (!hasActiveSubscription && existingProjectsCount >= FREE_PROJECT_LIMIT) {
        return NextResponse.json(
          { 
            error: "PROJECT_LIMIT_REACHED", 
            message: `Free users can create up to ${FREE_PROJECT_LIMIT} projects. Upgrade to create more.` 
          },
          { status: 402 }
        );
      }

      // Only Unlimited subscribers skip credit deduction; Pro subscribers still use credits
      if (!isFirstProject && !isUnlimited) {
        // Need to deduct credits
        if (userCredits < creditCost) {
          return NextResponse.json(
            { error: "INSUFFICIENT_CREDITS", message: `Need ${creditCost} credits for this model` },
            { status: 402 }
          );
        }

        // Atomic credit deduction + history in a single transaction
        await prisma.$transaction(async (tx) => {
          const result = await tx.user.updateMany({
            where: {
              id: session.user.id,
              credits: { gte: creditCost },
            },
            data: { credits: { decrement: creditCost } },
          });

          if (result.count === 0) {
            throw new Error("INSUFFICIENT_CREDITS");
          }

          await tx.creditHistory.create({
            data: {
              userId: session.user.id,
              amount: -creditCost,
              type: "usage",
              description: `Used ${selectedModel?.label || model}`,
            },
          });
        });
      }
    }

    const chat = await prisma.chat.create({
      data: {
        model: resolvedModel,
        quality,
        prompt,
        title: "",
        shadcn: true,
        userId: session?.user.id || null,
      },
    });

    let options: Parameters<typeof createOpenRouter>[0] = {};
    if (process.env.HELICONE_API_KEY) {
      options.baseURL = "https://together.helicone.ai/v1";
      options.headers = {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        "Helicone-Property-appname": "SquidCoder",
        "Helicone-Session-Id": chat.id,
        "Helicone-Session-Name": "SquidCoder Chat",
      };
    }

    const openrouter = createOpenRouter(options);

    async function fetchTitle() {
      const responseForChatTitle = await generateText({
        model: openrouter(model),
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
      const title = responseForChatTitle.text || prompt;
      return title;
    }

    const title = await fetchTitle();

    let fullScreenshotDescription;
    if (screenshotData) {
      try {
        const screenshotResponse = await generateText({
          model: openrouter(model, {
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

        fullScreenshotDescription = screenshotResponse.text;
      } catch (err) {
        console.warn("Screenshot processing failed, continuing without it:", err);
      }
    }

    let userMessage: string;
    if (quality === "high") {
      let initialRes = await generateText({
        model: openrouter(model, {
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

      console.log("PLAN:", initialRes.text);

      userMessage = initialRes.text ?? prompt;
    } else if (fullScreenshotDescription) {
      userMessage =
        prompt +
        "RECREATE THIS APP AS CLOSELY AS POSSIBLE: " +
        fullScreenshotDescription;
    } else {
      userMessage = prompt;
    }

    let newChat = await prisma.chat.update({
      where: {
        id: chat.id,
      },
      data: {
        title,
        messages: {
          createMany: {
            data: [
              {
                role: "system",
                content: getMainCodingPrompt(),
                position: 0,
              },
              { role: "user", content: userMessage, position: 1 },
            ],
          },
        },
      },
      include: {
        messages: true,
      },
    });

    const lastMessage = newChat.messages
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .at(-1) as { id: string } | undefined;
    if (!lastMessage) throw new Error("No new message");

    return NextResponse.json({
      chatId: chat.id,
      lastMessageId: lastMessage.id,
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 },
    );
  }
}
