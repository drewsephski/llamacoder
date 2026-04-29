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
import { MODELS } from "@/lib/constants";
import { checkAndConsumeCredits, getModelCreditCost } from "@/lib/billing";

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, quality, screenshotUrl, screenshotData } =
      await request.json();

    // Check authentication - required for all chat creation
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

    const prisma = getPrisma();

    // Check if selected model is free or paid
    const selectedModel = MODELS.find((m) => m.value === model);
    const isPaidModel = selectedModel?.paid ?? false;

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
          { status: 403 },
        );
      }
      return NextResponse.json(
        {
          error: creditCheck.error,
          message:
            creditCheck.error === "INSUFFICIENT_CREDITS"
              ? `Need ${getModelCreditCost(model)} credits for this model. Upgrade or buy credits to continue.`
              : "Unable to process request",
        },
        { status: 402 },
      );
    }

    let resolvedModel = model;

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
        console.warn(
          "Screenshot processing failed, continuing without it:",
          err,
        );
      }
    }

    let plan: string | null = null;
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

      plan = initialRes.text ?? null;
      userMessage = prompt; // Use original prompt instead of plan

      // Track plan generation in GenerationLog
      try {
        await prisma.generationLog.create({
          data: {
            userId: session?.user.id || null,
            modelId: resolvedModel,
            creditsUsed: getModelCreditCost(resolvedModel),
            status: "plan_generated",
            chatId: chat.id,
          },
        });
      } catch (logError) {
        console.error("Failed to log plan generation:", logError);
      }
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
        plan: plan,
        hasCode: false,
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
      .sort(
        (a: { position: number }, b: { position: number }) =>
          a.position - b.position,
      )
      .at(-1) as { id: string } | undefined;
    if (!lastMessage) throw new Error("No new message");

    return NextResponse.json({
      chatId: chat.id,
      lastMessageId: lastMessage.id,
      plan: plan,
      hasCode: false,
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 },
    );
  }
}
