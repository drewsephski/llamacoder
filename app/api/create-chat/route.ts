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

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, quality, screenshotUrl } = await request.json();
    const resolvedModel = model; // For now, we'll use the model as-is since we're handling aliases in the frontend

    // Check authentication and credits
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const prisma = getPrisma();

    // If authenticated, check eligibility
    if (session) {
      // Check if user has existing projects
      const existingProjectsCount = await prisma.chat.count({
        where: { userId: session.user.id },
      });

      if (existingProjectsCount > 0) {
        // User has existing projects, check credits or subscription
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            credits: true,
            subscription: {
              select: {
                status: true,
              },
            },
          },
        });

        const credits = user?.credits || 0;
        const hasActiveSubscription = user?.subscription?.status === "active";

        if (!hasActiveSubscription && credits <= 0) {
          return NextResponse.json(
            { error: "INSUFFICIENT_CREDITS" },
            { status: 402 }
          );
        }

        // Deduct one credit for new project if no active subscription
        if (!hasActiveSubscription) {
          const result = await prisma.user.updateMany({
            where: {
              id: session.user.id,
              credits: { gt: 0 },
            },
            data: { credits: { decrement: 1 } },
          });

          if (result.count === 0) {
            return NextResponse.json(
              { error: "INSUFFICIENT_CREDITS" },
              { status: 402 }
            );
          }

          // Record credit history
          await prisma.$transaction([
            prisma.creditHistory.create({
              data: {
                userId: session.user.id,
                amount: -1,
                type: "usage",
                description: "New project creation",
              },
            }),
          ]);
        }
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
    if (screenshotUrl) {
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
                  image: screenshotUrl,
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
