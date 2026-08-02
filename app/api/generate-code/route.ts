import { after, NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getMainCodingPrompt } from "@/lib/prompts";
import { resolveEffectiveBrief } from "@/features/generation/effective-brief";
import {
  createEmptyAppSpec,
  parseAppSpec,
} from "@/features/generation/app-spec";
import { resolvePastMediaCatalogForPrompt } from "@/features/generation/server/past-media-library";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  checkCreditAvailability,
  getModelCreditHoldCost,
  releaseCreditHold,
  reserveCreditHold,
} from "@/lib/billing";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import {
  GENERATED_CODE_MAX_TOKENS,
  createAppOpenRouter,
  createOpenRouterModel,
  getCacheableSystemPrompt,
  getAIErrorMessage,
  getOpenRouterProviderOptions,
} from "@/lib/openrouter";
import {
  generateFollowUpPrompts,
  saveMessageFollowUpPrompts,
} from "@/lib/follow-up-prompts";
import { recoverStaleGenerationLocks } from "@/lib/generation-recovery";
import { recordOperationalEvent } from "@/lib/observability";
import { getGenerationAvailability } from "@/lib/provider-controls";
import { runGeneratedCodePipeline } from "@/features/generation/server/code-generation-pipeline";
import {
  GenerationWorkflowError,
  persistInitialGenerationResult,
} from "@/features/generation/server/workflow";
import {
  buildComponentRegistryPromptSection,
  ComponentRegistryError,
  resolveComponentRegistryImports,
} from "@/features/generation/server/component-registry";

import { z } from "zod";

const generateCodeSchema = z.object({
  chatId: z.string().trim().min(1, "chatId is required"),
});

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
    const parsed = generateCodeSchema.safeParse(
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

    const { chatId } = parsed.data;

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

    // Fetch previous assistant messages with design scores for dynamic emphasis
    const previousMessages = await prisma.message.findMany({
      where: { chatId: chat.id, role: "assistant" },
      select: { designScores: true },
      orderBy: { position: "desc" },
      take: 3,
    });
    const latestDesignScores = previousMessages.find(
      (message) => message.designScores !== null,
    )?.designScores as
      | import("@/features/generation/design-quality-scoring").DesignScoreSummary
      | null;

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
    const pastMediaCatalog = await resolvePastMediaCatalogForPrompt({
      prompt: chat.prompt?.trim() || "",
    });
    const appSpec = parseAppSpec(chat.appSpec) ?? createEmptyAppSpec();
    const effectiveBrief = resolveEffectiveBrief({
      originalIntent: chat.prompt,
      latestUserRequest: chat.plan,
      appSpec,
    });
    const componentRegistryImports = await resolveComponentRegistryImports(
      [chat.prompt, chat.plan].filter(Boolean).join("\n"),
    );
    const componentRegistryPrompt = buildComponentRegistryPromptSection(
      componentRegistryImports,
    );

    const generateCode = (userContent: string) =>
      generateText({
        model: createOpenRouterModel(openrouter, chat.model, {
          usage: { include: true },
        }, {
          sort: "throughput",
        }),
        maxOutputTokens: GENERATED_CODE_MAX_TOKENS,
        providerOptions: getOpenRouterProviderOptions(
          chat.model,
          chat.quality === "high" ? "high" : "low",
        ),
        system: getCacheableSystemPrompt(
          chat.model,
          [
            getMainCodingPrompt({
              designScoreSummary: latestDesignScores,
              userPrompt: effectiveBrief.latestUserRequest,
              effectiveBrief,
              pastMediaCatalog,
              messageCount: 1,
            }),
            componentRegistryPrompt,
          ]
            .filter(Boolean)
            .join("\n\n"),
        ),
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
      });

    const pipelineResult = await runGeneratedCodePipeline({
      generate: generateCode,
      userContent: chat.plan,
      additionalFiles: componentRegistryImports.flatMap((item) => item.files),
    });

    if (!pipelineResult.ok) {
      if (pipelineResult.error === "CONTRAST_VIOLATION") {
        console.warn(
          "Generated code rejected for contrast:",
          pipelineResult.violations,
        );
      } else if (pipelineResult.error === "UNRUNNABLE_GENERATED_CODE") {
        console.warn(
          "Generated code rejected with diagnostics:",
          pipelineResult.diagnostics,
        );
      }

      await releaseHoldAndResetChat();

      const statusByError = {
        EMPTY_MODEL_RESPONSE: 502,
        UNRUNNABLE_GENERATED_CODE: 502,
        CONTRAST_VIOLATION: 422,
      } as const;

      return NextResponse.json(
        {
          error: pipelineResult.error,
          message: pipelineResult.message,
          diagnostics: pipelineResult.diagnostics,
          violations: pipelineResult.violations,
        },
        { status: statusByError[pipelineResult.error] },
      );
    }

    const {
      content,
      generatedFiles,
      designScores,
      usage: {
        tokensUsed,
        inputTokens,
        outputTokens,
        reasoningTokens,
        providerCostUsd,
        upstreamInferenceCostUsd,
        provider,
      },
    } = pipelineResult;

    const message = await persistInitialGenerationResult({
      userId: session.user.id,
      chat,
      content,
      generatedFiles,
      designScores,
      creditHoldId: reservedHoldId,
      usage: {
        tokensUsed,
        inputTokens,
        outputTokens,
        reasoningTokens,
        providerCostUsd,
        upstreamInferenceCostUsd,
        provider,
      },
    });
    reservedHoldId = undefined;
    generationStarted = false;

    after(async () => {
      const followUpPrompts = await generateFollowUpPrompts({
        chat,
        assistantContent: content,
        files: generatedFiles,
      });
      await saveMessageFollowUpPrompts(prisma, message.id, followUpPrompts);
    });

    return NextResponse.json({
      success: true,
      messageId: message.id,
    });
  } catch (error) {
    await releaseHoldAndResetChat();

    if (error instanceof ComponentRegistryError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: 422 },
      );
    }

    if (
      error instanceof GenerationWorkflowError &&
      (error.code === "INSUFFICIENT_CREDITS" ||
        error.code === "CREDIT_CHECK_FAILED")
    ) {
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
