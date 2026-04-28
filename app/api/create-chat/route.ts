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
import {
  checkAnonymousUsageLimit,
  checkAndConsumeCredits,
  getModelCreditCost,
} from "@/lib/billing";

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

    // For unauthenticated users or users without credits, enforce free model
    let resolvedModel = model;

    if (!session) {
      // Check anonymous usage limit (1 free generation)
      const anonymousCheck = await checkAnonymousUsageLimit(request);
      if (!anonymousCheck.allowed) {
        return NextResponse.json(
          {
            error: "ANONYMOUS_LIMIT_REACHED",
            message: "You've used your free generation. Sign up to continue.",
          },
          { status: 402 }
        );
      }

      // Unauthenticated users must use free model
      if (isPaidModel) {
        return NextResponse.json(
          { error: "PAID_MODEL_REQUIRES_AUTH", message: "Please sign in to use premium models" },
          { status: 403 }
        );
      }
      resolvedModel = FREE_MODEL;
    } else {
      // Authenticated user - use credit engine for all checks
      const creditCheck = await checkAndConsumeCredits({
        userId: session.user.id,
        modelId: model,
        description: `AI generation - ${selectedModel?.label || model}`,
      });

      if (!creditCheck.success) {
        if (creditCheck.error === "FORBIDDEN_MODEL") {
          return NextResponse.json(
            { error: "FORBIDDEN_MODEL", message: "Upgrade to use this model" },
            { status: 403 }
          );
        }
        return NextResponse.json(
          {
            error: creditCheck.error,
            message: creditCheck.error === "INSUFFICIENT_CREDITS"
              ? `Need ${getModelCreditCost(model)} credits for this model. Upgrade or buy credits to continue.`
              : "Unable to process request",
          },
          { status: 402 }
        );
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
