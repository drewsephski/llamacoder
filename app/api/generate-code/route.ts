import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getMainCodingPrompt } from "@/lib/prompts";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  checkCreditAvailability,
  consumeCreditsForGeneration,
  getModelCreditHoldCost,
  releaseCreditHold,
  reserveCreditHold,
} from "@/lib/billing";
import {
  GENERATED_CODE_MAX_TOKENS,
  createAppOpenRouter,
  createOpenRouterModel,
  getAIErrorMessage,
  getOpenRouterProviderOptions,
  getOpenRouterUsageMetadata,
} from "@/lib/openrouter";
import { extractAllCodeBlocks } from "@/lib/utils";
import {
  buildGeneratedFilesRepairPrompt,
  formatGeneratedFilesMarkdown,
  normalizeGeneratedFiles,
  validateGeneratedFiles,
} from "@/lib/generated-files";
import {
  generateFollowUpPrompts,
  saveMessageFollowUpPrompts,
} from "@/lib/follow-up-prompts";
import { recoverStaleGenerationLocks } from "@/lib/generation-recovery";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { recordOperationalEvent } from "@/lib/observability";
import { getGenerationAvailability } from "@/lib/provider-controls";

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
  let reservedHoldId: string | undefined;
  let generationStarted = false;
  let activeChatId: string | undefined;

  const releaseHoldAndResetChat = async () => {
    if (reservedHoldId) {
      await releaseCreditHold({ holdId: reservedHoldId });
      reservedHoldId = undefined;
    }

    if (generationStarted && activeChatId) {
      await getPrisma()
        .chat.updateMany({
          where: { id: activeChatId, generationStatus: "in_progress" },
          data: { generationStatus: "idle", generationStartedAt: null },
        })
        .catch((error) => {
          console.error("Failed to reset generation state:", error);
        });
      generationStarted = false;
    }
  };

  try {
    const { chatId } = await request.json();

    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await consumeRateLimit({
      userId: session.user.id,
      operation: "generate_code",
      limit: 6,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: "Too many generation requests. Please try again shortly.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    const prisma = getPrisma();
    await recoverStaleGenerationLocks({ client: prisma });

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
    const availability = getGenerationAvailability(chat.model);
    if (!availability.available) {
      return NextResponse.json(
        { error: "GENERATION_DISABLED", message: availability.reason },
        { status: 503, headers: { "Retry-After": "300" } },
      );
    }
    activeChatId = chat.id;

    const generationStart = await prisma.chat.updateMany({
      where: {
        id: chat.id,
        userId: session.user.id,
        hasCode: false,
        generationStatus: { not: "in_progress" },
      },
      data: {
        generationStatus: "in_progress",
        generationStartedAt: new Date(),
      },
    });

    if (generationStart.count === 0) {
      return NextResponse.json(
        {
          error: "GENERATION_IN_PROGRESS",
          message: "Code generation is already running for this project.",
        },
        { status: 409 },
      );
    }
    generationStarted = true;

    const creditCheck = await checkCreditAvailability({
      userId: session.user.id,
      modelId: chat.model,
    });

    if (!creditCheck.success) {
      await releaseHoldAndResetChat();
      return NextResponse.json(
        {
          error: creditCheck.error,
          message:
            creditCheck.error === "INSUFFICIENT_CREDITS"
              ? `Need ${getModelCreditHoldCost(chat.model)} credits to start this model. Upgrade or buy credits to continue.`
              : "Unable to process request",
        },
        { status: 402 },
      );
    }

    const holdAmount = getModelCreditHoldCost(chat.model) * 2;
    const hold = await reserveCreditHold({
      userId: session.user.id,
      modelId: chat.model,
      chatId: chat.id,
      reason: `Code generation hold - ${chat.title}`,
      phase: "initial_generation",
      amount: holdAmount,
    });

    if (!hold.success) {
      await releaseHoldAndResetChat();
      return NextResponse.json(
        {
          error: hold.error,
          message:
            hold.error === "INSUFFICIENT_CREDITS"
              ? `Need ${holdAmount} credits to cover generation and one automatic repair attempt. Unused credits are returned automatically.`
              : "Unable to process request",
        },
        { status: hold.error === "USER_NOT_FOUND" ? 404 : 402 },
      );
    }
    reservedHoldId = hold.holdId;

    const openrouter = createAppOpenRouter({
      sessionId: chat.id,
      sessionName: "SquidAgent Code Generation",
    });

    const generateCode = (userContent: string) =>
      generateText({
        model: createOpenRouterModel(openrouter, chat.model, {
          maxTokens: GENERATED_CODE_MAX_TOKENS,
          usage: { include: true },
        }),
        providerOptions: getOpenRouterProviderOptions(
          chat.model,
          chat.quality === "high" ? "high" : "low",
        ),
        system: getMainCodingPrompt(),
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
      });

    // Generate code based on the plan
    const codeResponse = await generateCode(chat.plan);
    const usage = (
      codeResponse as {
        usage?: {
          totalTokens?: unknown;
          inputTokens?: unknown;
          promptTokens?: unknown;
          outputTokens?: unknown;
          completionTokens?: unknown;
        };
      }
    ).usage;
    let tokensUsed =
      typeof usage?.totalTokens === "number" ? usage.totalTokens : undefined;
    let inputTokens =
      typeof usage?.inputTokens === "number"
        ? usage.inputTokens
        : typeof usage?.promptTokens === "number"
          ? usage.promptTokens
          : undefined;
    let outputTokens =
      typeof usage?.outputTokens === "number"
        ? usage.outputTokens
        : typeof usage?.completionTokens === "number"
          ? usage.completionTokens
          : undefined;
    const initialProviderUsage = getOpenRouterUsageMetadata(
      codeResponse.providerMetadata,
    );
    let providerCostUsd = initialProviderUsage?.providerCostUsd;
    let upstreamInferenceCostUsd =
      initialProviderUsage?.upstreamInferenceCostUsd;
    let reasoningTokens = initialProviderUsage?.reasoningTokens;
    let provider = initialProviderUsage?.provider;

    if (!codeResponse.text.trim()) {
      await releaseHoldAndResetChat();
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
      const repairProviderUsage = getOpenRouterUsageMetadata(
        repairResponse.providerMetadata,
      );
      providerCostUsd =
        (providerCostUsd ?? 0) + (repairProviderUsage?.providerCostUsd ?? 0);
      upstreamInferenceCostUsd =
        (upstreamInferenceCostUsd ?? 0) +
        (repairProviderUsage?.upstreamInferenceCostUsd ?? 0);
      inputTokens =
        (inputTokens ?? 0) +
        (repairProviderUsage?.inputTokens ??
          repairResponse.usage?.inputTokens ??
          0);
      outputTokens =
        (outputTokens ?? 0) +
        (repairProviderUsage?.outputTokens ??
          repairResponse.usage?.outputTokens ??
          0);
      reasoningTokens =
        (reasoningTokens ?? 0) +
        (repairProviderUsage?.reasoningTokens ??
          repairResponse.usage?.outputTokenDetails.reasoningTokens ??
          0);
      tokensUsed =
        (tokensUsed ?? 0) +
        (repairProviderUsage?.totalTokens ??
          repairResponse.usage?.totalTokens ??
          0);
      provider = repairProviderUsage?.provider ?? provider;
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
      await releaseHoldAndResetChat();
      return NextResponse.json(
        {
          error: "EMPTY_MODEL_RESPONSE",
          message: "The model returned an empty response. Please retry.",
        },
        { status: 502 },
      );
    }

    if (diagnostics.length > 0) {
      console.warn("Generated code rejected with diagnostics:", diagnostics);
      await releaseHoldAndResetChat();
      return NextResponse.json(
        {
          error: "UNRUNNABLE_GENERATED_CODE",
          message:
            "The model returned code with import/export issues that could not be repaired automatically. Please retry generation.",
          diagnostics,
        },
        { status: 502 },
      );
    }

    const followUpPrompts = await generateFollowUpPrompts({
      chat,
      assistantContent: content,
      files: generatedFiles,
    });

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
        data: {
          hasCode: true,
          generationStatus: "completed",
          generationStartedAt: null,
        },
      });

      const consumeResult = await consumeCreditsForGeneration({
        client: tx,
        userId: session.user.id,
        modelId: chat.model,
        chatId: chat.id,
        messageId: createdMessage.id,
        description: `Code generation - ${chat.title}`,
        phase: "initial_generation",
        status: "completed",
        creditHoldId: reservedHoldId,
        tokensUsed,
        inputTokens,
        outputTokens,
        generatedText: content,
        providerCostUsd,
        upstreamInferenceCostUsd,
        reasoningTokens,
        provider,
      });

      if (!consumeResult.success) {
        if (consumeResult.error === "INSUFFICIENT_CREDITS") {
          throw new CreditConsumptionError("INSUFFICIENT_CREDITS");
        }
        throw new CreditConsumptionError("CREDIT_CHECK_FAILED");
      }

      return createdMessage;
    });
    reservedHoldId = undefined;
    generationStarted = false;

    await saveMessageFollowUpPrompts(prisma, message.id, followUpPrompts);

    return NextResponse.json({
      success: true,
      messageId: message.id,
    });
  } catch (error) {
    await releaseHoldAndResetChat();

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

    await recordOperationalEvent({
      name: "generation_failed",
      level: "error",
      operation: "initial_generation",
      status: "error",
      error,
      metadata: { chatId: activeChatId },
    });

    console.error("Error generating code:", getAIErrorMessage(error));
    return NextResponse.json(
      { error: "Failed to generate code", message: getAIErrorMessage(error) },
      { status: 500 },
    );
  }
}
