import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getMainCodingPrompt } from "@/lib/prompts";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  checkCreditAvailability,
  consumeCreditsForGeneration,
  getModelCreditCost,
} from "@/lib/billing";
import {
  GENERATED_CODE_MAX_TOKENS,
  createAppOpenRouter,
  createOpenRouterModel,
  getAIErrorMessage,
} from "@/lib/openrouter";
import { extractAllCodeBlocks } from "@/lib/utils";
import {
  buildGeneratedFilesRepairPrompt,
  formatGeneratedFilesMarkdown,
  normalizeGeneratedFiles,
  validateGeneratedFiles,
} from "@/lib/generated-files";

class CreditConsumptionError extends Error {
  constructor(
    public readonly code: "INSUFFICIENT_CREDITS" | "CREDIT_CHECK_FAILED",
    message = code,
  ) {
    super(message);
    this.name = "CreditConsumptionError";
  }
}

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

    const creditCheck = await checkCreditAvailability({
      userId: session.user.id,
      modelId: chat.model,
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

    const openrouter = createAppOpenRouter({
      sessionId: chat.id,
      sessionName: "SquidAgent Code Generation",
    });

    const generateCode = (userContent: string) =>
      generateText({
        model: createOpenRouterModel(openrouter, chat.model, {
          maxTokens: GENERATED_CODE_MAX_TOKENS,
        }),
        messages: [
          {
            role: "system",
            content: getMainCodingPrompt(),
          },
          {
            role: "user",
            content: userContent,
          },
        ],
      });

    // Generate code based on the plan
    const codeResponse = await generateCode(chat.plan);

    if (!codeResponse.text.trim()) {
      return NextResponse.json(
        {
          error: "EMPTY_MODEL_RESPONSE",
          message: "The model returned an empty response. Please retry.",
        },
        { status: 502 },
      );
    }

    let generatedText = codeResponse.text;
    let generatedFiles = normalizeGeneratedFiles(
      extractAllCodeBlocks(generatedText),
    );
    let diagnostics = validateGeneratedFiles(generatedFiles);

    if (diagnostics.length > 0) {
      const repairResponse = await generateCode(
        buildGeneratedFilesRepairPrompt(
          generatedText,
          generatedFiles,
          diagnostics,
        ),
      );
      const repairedFiles = normalizeGeneratedFiles(
        extractAllCodeBlocks(repairResponse.text),
      );
      const repairedDiagnostics = validateGeneratedFiles(repairedFiles);

      if (repairResponse.text.trim() && repairedDiagnostics.length === 0) {
        generatedText = repairResponse.text;
        generatedFiles = repairedFiles;
        diagnostics = repairedDiagnostics;
      }
    }

    const content = generatedFiles.length
      ? formatGeneratedFilesMarkdown(generatedFiles)
      : generatedText;

    if (!content.trim()) {
      return NextResponse.json(
        {
          error: "EMPTY_MODEL_RESPONSE",
          message: "The model returned an empty response. Please retry.",
        },
        { status: 502 },
      );
    }

    if (diagnostics.length > 0) {
      console.warn("Generated code saved with diagnostics:", diagnostics);
    }

    const message = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          role: "assistant",
          content,
          files: generatedFiles.length
            ? JSON.parse(JSON.stringify(generatedFiles))
            : null,
          chatId: chat.id,
          position: 2,
        },
      });

      await tx.chat.update({
        where: { id: chat.id },
        data: { hasCode: true },
      });

      const consumeResult = await consumeCreditsForGeneration({
        client: tx,
        userId: session.user.id,
        modelId: chat.model,
        chatId: chat.id,
        description: `Code generation - ${chat.title}`,
        status: "plan_approved",
      });

      if (!consumeResult.success) {
        if (consumeResult.error === "INSUFFICIENT_CREDITS") {
          throw new CreditConsumptionError("INSUFFICIENT_CREDITS");
        }
        throw new CreditConsumptionError("CREDIT_CHECK_FAILED");
      }

      return createdMessage;
    });

    return NextResponse.json({
      success: true,
      messageId: message.id,
    });
  } catch (error) {
    if (error instanceof CreditConsumptionError) {
      return NextResponse.json(
        {
          error: error.code,
          message:
            error.code === "INSUFFICIENT_CREDITS"
              ? "Credits were no longer available. Upgrade or buy credits to continue."
              : "Unable to process credits for this generation.",
        },
        { status: error.code === "INSUFFICIENT_CREDITS" ? 402 : 500 },
      );
    }

    console.error("Error generating code:", getAIErrorMessage(error));
    return NextResponse.json(
      { error: "Failed to generate code", message: getAIErrorMessage(error) },
      { status: 500 },
    );
  }
}
