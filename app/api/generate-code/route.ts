import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getMainCodingPrompt } from "@/lib/prompts";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MODELS } from "@/lib/constants";
import { checkAndConsumeCredits, getModelCreditCost } from "@/lib/billing";
import { getModelWithFallbacks } from "@/lib/model-fallbacks";

export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json();

    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();

    // Fetch chat with plan
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { user: true },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!chat.plan) {
      return NextResponse.json(
        { error: "No plan found for this chat" },
        { status: 400 },
      );
    }

    if (chat.hasCode) {
      return NextResponse.json(
        { error: "Code already generated for this chat" },
        { status: 400 },
      );
    }

    // Check credits for code generation
    const creditCheck = await checkAndConsumeCredits({
      userId: session.user.id,
      modelId: chat.model,
      description: `Code generation - ${chat.title}`,
    });

    if (!creditCheck.success) {
      return NextResponse.json(
        {
          error: creditCheck.error,
          message:
            creditCheck.error === "INSUFFICIENT_CREDITS"
              ? `Need ${getModelCreditCost(chat.model)} credits for this model. Upgrade or buy credits to continue.`
              : "Unable to process request",
        },
        { status: 402 },
      );
    }

    let options: Parameters<typeof createOpenRouter>[0] = {};
    if (process.env.HELICONE_API_KEY) {
      options.baseURL = "https://together.helicone.ai/v1";
      options.headers = {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
        "Helicone-Property-appname": "SquidCoder",
        "Helicone-Session-Id": chat.id,
        "Helicone-Session-Name": "SquidCoder Code Generation",
      };
    }

    const openrouter = createOpenRouter(options);

    // Generate code based on the plan
    const models = getModelWithFallbacks(chat.model);
    const codeResponse = await generateText({
      model: openrouter(models[0], {
        models: models.length > 1 ? models.slice(1) : undefined,
      }),
      messages: [
        {
          role: "system",
          content: getMainCodingPrompt(),
        },
        {
          role: "user",
          content: chat.plan,
        },
      ],
    });

    // Create a message with the generated code
    await prisma.message.create({
      data: {
        role: "assistant",
        content: codeResponse.text,
        chatId: chat.id,
        position: 2,
      },
    });

    // Update chat to mark code as generated
    await prisma.chat.update({
      where: { id: chat.id },
      data: { hasCode: true },
    });

    // Track plan approval and code generation in GenerationLog
    try {
      await prisma.generationLog.create({
        data: {
          userId: session.user.id,
          modelId: chat.model,
          creditsUsed: getModelCreditCost(chat.model),
          status: "plan_approved",
          chatId: chat.id,
        },
      });
    } catch (logError) {
      console.error("Failed to log plan approval:", logError);
    }

    return NextResponse.json({
      success: true,
      messageId: codeResponse.text, // This will be the content, not the ID
    });
  } catch (error) {
    console.error("Error generating code:", error);
    return NextResponse.json(
      { error: "Failed to generate code" },
      { status: 500 },
    );
  }
}
