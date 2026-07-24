import { getPrisma } from "@/lib/prisma";
import { z } from "zod";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  Output,
  stepCountIs,
  streamText,
} from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  GENERATED_CODE_MAX_TOKENS,
  VISION_ANALYSIS_MODEL,
  createAppOpenRouter,
  createOpenRouterModel,
  getAIErrorMessage,
  getAIErrorStatus,
  getOpenRouterProviderOptions,
  getOpenRouterReasoningSelection,
} from "@/lib/openrouter";
import {
  getModelCreditHoldCost,
  releaseCreditHold,
  reserveCreditHold,
} from "@/lib/billing";
import {
  formatGeneratedFilesMarkdown,
  normalizeGeneratedFiles,
  parseStoredGeneratedFiles,
  type GeneratedFile,
} from "@/lib/generated-files";
import { extractAllCodeBlocks } from "@/lib/utils";
import { getMainCodingPrompt, screenshotToCodePrompt } from "@/lib/prompts";
import { generatedAppRepairCapabilityRules } from "@/lib/generated-app-capabilities";
import {
  ACCEPTED_SCREENSHOT_MIME_TYPES,
  FREE_MODEL,
  MAX_SCREENSHOT_DATA_URL_LENGTH,
  MAX_SCREENSHOT_SIZE_MB,
} from "@/lib/constants";
import { DEFAULT_ESTIMATED_INPUT_TOKENS } from "@/lib/billing/config";
import type {
  GenerationStatus,
  ResearchActivity,
} from "@/features/generation/contracts";
import { createRequestTelemetry } from "@/features/generation/server/request-telemetry";
import {
  agentActionSchema,
  parseAgentMessageMetadata,
  type AgentAction,
} from "@/features/generation/agent-contracts";
import {
  agentOrchestrationPrompt,
  buildCodeGenSpecBlock,
  buildSpecContextLine,
  developerAgentPrompt,
} from "@/features/generation/agent-prompts";
import {
  createEmptyAppSpec,
  mergeSpecUpdate,
  parseAppSpec,
  type AppSpec,
} from "@/features/generation/app-spec";
import {
  assessApiDocumentation,
  buildResearchQuery,
  detectCompanyLandingResearchIntent,
  detectGuidedTemplateResearchIntent,
  detectLiveApiDashboardResearchIntent,
  detectLocalBusinessResearchIntent,
  detectPortfolioResearchIntent,
  detectResearchIntent,
  detectWebsiteReferenceIntent,
  extractResearchObjective,
  resolveResearchReason,
  shouldAnswerWithoutCode,
} from "@/features/generation/research-intent";
import {
  buildLiveApiGenerationContract,
  detectLiveApiIntent,
} from "@/features/generation/live-api";
import {
  detectPersistenceIntentFromMessages,
  describePersistenceIntent,
} from "@/features/generation/persistence-intent";
import {
  createResearchWindow,
  extractExaToolSources,
} from "@/features/generation/research-policy";
import { buildWebResearchAgentInstructions } from "@/features/generation/research-prompts";
import {
  createExaAgentTools,
  isExaConfigured,
} from "@/features/generation/server/exa-tools";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { recordOperationalEvent } from "@/lib/observability";
import { getGenerationAvailability } from "@/lib/provider-controls";
import { getConnectedIntegrationPromptContext } from "@/features/integrations/server/service";
import { findIntegrationProviders } from "@/features/integrations/registry";
import {
  enforceSelectedProvidersInAppSpec,
  enforceSelectedProvidersInPlan,
  getSelectedProvidersNeedingPurpose,
  enforceRequestedPersistenceProvider,
} from "@/features/integrations/generation-contract";
import {
  buildDirectBackendSetupRequest,
  buildPlanModeFallbackInterview,
  shouldAskPersistenceQuestion,
} from "@/features/generation/mode-policy";
import {
  CHAT_URL_SYSTEM_GUARD,
  buildChatUrlContext,
  extractChatUrls,
  loadChatUrlContent,
  type ChatLinkedPage,
} from "@/features/generation/server/chat-url-content";

type CompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  files?: unknown;
  id?: string;
};

function isGeneratedAppRequestMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const kind = (value as { kind?: unknown }).kind;
  return (
    kind === "preview_repair_request" ||
    kind === "preview_repair" ||
    kind === "contract_repair" ||
    kind === "app_edit_request" ||
    kind === "targeted_element_edit"
  );
}

function isContractRepairMetadata(value: unknown) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value as { kind?: unknown }).kind === "contract_repair"
  );
}

function optimizeMessagesForTokens(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
): { role: "system" | "user" | "assistant"; content: string }[] {
  // Strip code blocks from assistant messages except the last 2 to save tokens
  const assistantIndices: number[] = [];
  for (
    let i = messages.length - 1;
    i >= 0 && assistantIndices.length < 2;
    i--
  ) {
    if (messages[i].role === "assistant") {
      assistantIndices.push(i);
    }
  }
  return messages.map((msg, index) => {
    if (msg.role === "assistant" && !assistantIndices.includes(index)) {
      const stripped = msg.content.replace(/```[\s\S]*?```/g, "").trim();
      return {
        ...msg,
        content: stripped || "[code omitted]",
      };
    }
    return msg;
  });
}

const MAX_INPUT_CHARACTERS = DEFAULT_ESTIMATED_INPUT_TOKENS * 3;

function clampMessagesToBillingBudget(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
) {
  if (
    messages.reduce((total, message) => total + message.content.length, 0) <=
    MAX_INPUT_CHARACTERS
  ) {
    return messages;
  }

  const systemMessage = messages.find((message) => message.role === "system");
  const nonSystemMessages = messages.filter(
    (message) => message !== systemMessage,
  );
  const kept: typeof messages = [];
  let remaining = Math.max(
    0,
    MAX_INPUT_CHARACTERS - (systemMessage?.content.length ?? 0),
  );

  for (let index = nonSystemMessages.length - 1; index >= 0; index -= 1) {
    const message = nonSystemMessages[index];
    if (remaining <= 0) break;

    if (message.content.length <= remaining) {
      kept.unshift(message);
      remaining -= message.content.length;
      continue;
    }

    kept.unshift({
      ...message,
      content: `[Earlier context truncated]\n${message.content.slice(-remaining)}`,
    });
    remaining = 0;
  }

  return systemMessage ? [systemMessage, ...kept] : kept;
}

function getStoredGeneratedFiles(message: CompletionMessage) {
  const storedFiles = parseStoredGeneratedFiles(message.files);
  return normalizeGeneratedFiles(
    storedFiles.length > 0
      ? storedFiles
      : extractAllCodeBlocks(message.content),
  );
}

function getRepairSourceFiles(
  messages: CompletionMessage[],
  sourceMessageId?: string,
) {
  const sourceMessage = sourceMessageId
    ? messages.find((message) => message.id === sourceMessageId)
    : messages
        .slice()
        .reverse()
        .find(
          (message) =>
            message.role === "assistant" &&
            getStoredGeneratedFiles(message).length > 0,
        );

  if (!sourceMessage || sourceMessage.role !== "assistant") {
    return [];
  }

  return getStoredGeneratedFiles(sourceMessage);
}

function buildPreviewRepairMessages({
  systemContent,
  repairRequest,
  sourceFiles,
}: {
  systemContent?: string;
  repairRequest: string;
  sourceFiles: GeneratedFile[];
}) {
  const repairPrompt = `Repair the existing generated React + TypeScript app.

Preview/runtime error:
${repairRequest}

Current source files:
${formatGeneratedFilesMarkdown(sourceFiles)}

Requirements:
- Make the minimal code change needed to fix the error.
- Preserve all unrelated files, components, copy, state, imports, styling, and behavior.
- Return only complete files that changed, using fenced code blocks like \`\`\`tsx{path=App.tsx}.
- Do not regenerate unchanged files.
- Keep existing paths unless a new file is required to fix the error.
- Every internal import in changed files must resolve to an existing current file or a changed file you return.
- If the fix requires changing an export/import pair, return every affected file in full.
- Satisfy every listed diagnostic literally; do not merely describe the fix.
- When a task-title input is required, render it as a controlled input with an explicit accessible name such as aria-label="Task title".
- A title Save action must visibly communicate its loading state and surface a user-facing error when the update fails.`;

  return [
    systemContent
      ? { role: "system" as const, content: systemContent }
      : undefined,
    { role: "user" as const, content: repairPrompt },
  ].filter(Boolean) as {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
}

const imageDataUrlPattern = new RegExp(
  `^data:(${ACCEPTED_SCREENSHOT_MIME_TYPES.join("|")});base64,`,
  "i",
);

const requestSchema = z.object({
  messageId: z.string().min(1),
  model: z.string().min(1),
  screenshotData: z
    .string()
    .max(
      MAX_SCREENSHOT_DATA_URL_LENGTH,
      `Image is too large. Please upload an image under ${MAX_SCREENSHOT_SIZE_MB} MB.`,
    )
    .regex(imageDataUrlPattern, "Image must be a PNG, JPEG, or WebP file.")
    .optional(),
});

const GENERATION_COMPLETENESS_GUARD = `

Generation completeness requirements:
- Output a complete React + TypeScript app with App.tsx as a composition root. Prefer componentized structure over a monolithic App.tsx; split substantial UI pieces into supporting files.
- Output App.tsx and supporting source files using fenced blocks like \`\`\`tsx{path=components/Widget.tsx}.
- Do not use src/ in generated paths; files run from the sandbox root.
- Every custom component, hook, utility, or type import must point to a file you output in this response or an existing previous generated file.
- Every import style must match the target export exactly: use default imports only for default exports, and named imports only for named exports.
- Example: \`export default function Footer()\` requires \`import Footer from "./components/Footer"\`; \`export function Footer()\` requires \`import { Footer } from "./components/Footer"\`.
- Do not import from a barrel path like \`./components\` unless that exact index file exists and re-exports the requested symbols.
- Do not invent imports such as "@/lib/hooks/*", "@/hooks/*", or "@/utils/*". Use relative imports for generated files.
- Shadcn imports under "@/components/ui/*" and "@/lib/utils" are already installed and should not be redefined.
- If you call \`cn(...)\`, import it with \`import { cn } from "@/lib/utils"\`.
- For Framer Motion, import lowercase motion: import { motion } from "framer-motion".
${generatedAppRepairCapabilityRules}
`;

export async function POST(req: Request) {
  let holdId: string | undefined;
  let generationRunId: string | undefined;

  try {
    const prisma = getPrisma();

    const parsed = requestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return new Response("Invalid request", { status: 400 });
    }
    const { messageId, model, screenshotData } = parsed.data;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rateLimit = await consumeRateLimit({
      userId: session.user.id,
      operation: "completion",
      limit: 12,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return new Response("Too many requests. Please try again shortly.", {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          select: {
            id: true,
            model: true,
            quality: true,
            userId: true,
            appSpec: true,
            prompt: true,
          },
        },
      },
    });

    if (!message || !message.chat) {
      return new Response("Message not found", { status: 404 });
    }

    if (message.chat.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    if (message.chat.model !== model) {
      return new Response("Model mismatch", { status: 400 });
    }
    const chatModel = message.chat.model;
    const availability = getGenerationAvailability(chatModel);
    if (!availability.available) {
      return new Response(availability.reason, {
        status: 503,
        headers: { "Retry-After": "300" },
      });
    }
    const quality = message.chat.quality === "high" ? "high" : "low";
    const planMode = quality === "high";
    const messageMetadata = message.files as
      | {
          kind?: string;
          chargeCredits?: boolean;
          sourceMessageId?: string;
          draftFiles?: unknown;
          diagnostics?: unknown;
        }
      | null
      | undefined;
    const isFreeRepairRequest =
      (messageMetadata?.kind === "preview_repair_request" ||
        messageMetadata?.kind === "preview_repair" ||
        messageMetadata?.kind === "contract_repair") &&
      messageMetadata.chargeCredits === false;
    const appSpec: AppSpec =
      parseAppSpec(message.chat.appSpec) ?? createEmptyAppSpec();
    const agentMetadata = parseAgentMessageMetadata(message.files);
    const executionModel = isFreeRepairRequest
      ? "google/gemini-3-flash-preview"
      : chatModel;
    const executionQuality = isFreeRepairRequest ? "low" : quality;
    const holdAmount = isFreeRepairRequest
      ? 0
      : getModelCreditHoldCost(chatModel) +
        (screenshotData ? getModelCreditHoldCost(VISION_ANALYSIS_MODEL) : 0);

    if (!isFreeRepairRequest) {
      const hold = await reserveCreditHold({
        userId: session.user.id,
        modelId: chatModel,
        chatId: message.chat.id,
        reason: "Follow-up generation hold",
        phase: "follow_up",
        amount: holdAmount,
      });

      if (!hold.success) {
        return new Response(
          hold.error === "INSUFFICIENT_CREDITS"
            ? `Need ${holdAmount} credits to start this request. Unused credits are returned automatically.`
            : "Unable to process request",
          { status: hold.error === "USER_NOT_FOUND" ? 404 : 402 },
        );
      }
      holdId = hold.holdId;
    }

    const generationRun = await prisma.generationRun.create({
      data: {
        userId: session.user.id,
        chatId: message.chat.id,
        messageId: message.id,
        creditHoldId: holdId,
        status: "running",
        phase: "preparing",
        label: "Understanding your request",
      },
    });
    generationRunId = generationRun.id;

    const messagesRes = await prisma.message.findMany({
      where: { chatId: message.chatId, position: { lte: message.position } },
      orderBy: { position: "asc" },
    });

    const rawMessages = (messagesRes as CompletionMessage[]).filter(
      (candidate) => !isContractRepairMetadata(candidate.files),
    );
    const getResearchObjective = (candidate: {
      content: string;
      files?: unknown;
    }) =>
      isGeneratedAppRequestMetadata(candidate.files)
        ? extractResearchObjective(candidate.content)
        : candidate.content;
    const latestResearchObjective = getResearchObjective(message);
    const hasExplicitCompleteCreativeBrief =
      /\buse\s+the\s+supplied[\s\S]{0,220}\bexactly\s+as\s+written\b/i.test(
        latestResearchObjective,
      ) || /\bcomplete\s+creative\s+brief\b/i.test(latestResearchObjective);
    const websiteReferenceIntent = detectWebsiteReferenceIntent(
      latestResearchObjective,
    );
    const hasAttachedWebsiteVisualReference =
      Boolean(screenshotData) && websiteReferenceIntent.required;
    const shouldCarryResearchThroughWorkflow =
      agentMetadata?.kind === "agent_plan_approval" ||
      agentMetadata?.kind === "agent_search_approval_response";
    const isStructuredDecisionResponse =
      agentMetadata?.kind === "agent_clarification_response" ||
      agentMetadata?.kind === "agent_interview_response" ||
      agentMetadata?.kind === "agent_backend_setup_response";
    const researchUserMessages = rawMessages
      .filter((candidate) => {
        if (candidate.role !== "user") return false;
        const metadata = parseAgentMessageMetadata(candidate.files);
        return (
          metadata?.kind !== "agent_clarification_response" &&
          metadata?.kind !== "agent_interview_response" &&
          metadata?.kind !== "agent_backend_setup_response" &&
          metadata?.kind !== "agent_plan_approval" &&
          metadata?.kind !== "agent_search_approval_response"
        );
      })
      .map((candidate) => ({
        ...candidate,
        content: getResearchObjective(candidate),
      }));
    const researchMessages = shouldCarryResearchThroughWorkflow
      ? agentMetadata?.kind === "agent_search_approval_response"
        ? researchUserMessages.slice(-1)
        : researchUserMessages.slice(-24)
      : isStructuredDecisionResponse
        ? []
        : [{ content: latestResearchObjective }];
    const shouldCarryChatUrlsThroughWorkflow =
      agentMetadata?.kind === "agent_clarification_response" ||
      agentMetadata?.kind === "agent_interview_response" ||
      agentMetadata?.kind === "agent_backend_setup_response" ||
      agentMetadata?.kind === "agent_plan_approval" ||
      agentMetadata?.kind === "agent_search_approval_response";
    const chatUrlMessages = shouldCarryChatUrlsThroughWorkflow
      ? rawMessages
          .filter((candidate) => candidate.role === "user")
          .slice(-24)
          .reverse()
          .map((candidate) => ({
            content: getResearchObjective(candidate),
          }))
      : [{ content: latestResearchObjective }];
    const chatUrls = extractChatUrls(chatUrlMessages);
    const persistenceIntent = detectPersistenceIntentFromMessages(
      shouldCarryResearchThroughWorkflow
        ? rawMessages
            .filter((candidate) => candidate.role === "user")
            .map((candidate) => ({ content: getResearchObjective(candidate) }))
            .filter((candidate) => candidate.content.trim().length > 0)
            .slice(-4)
        : [{ content: latestResearchObjective }],
    );
    const apiDocumentation = assessApiDocumentation(researchMessages);
    const researchIntent = detectResearchIntent(researchMessages);
    const portfolioResearchIntent = detectPortfolioResearchIntent(
      latestResearchObjective,
    );
    const companyLandingResearchIntent = detectCompanyLandingResearchIntent(
      latestResearchObjective,
    );
    const liveApiDashboardResearchIntent = detectLiveApiDashboardResearchIntent(
      latestResearchObjective,
    );
    const localBusinessResearchIntent = detectLocalBusinessResearchIntent(
      latestResearchObjective,
    );
    const guidedTemplateResearchIntent = detectGuidedTemplateResearchIntent(
      latestResearchObjective,
    );
    const liveApiIntent = shouldCarryResearchThroughWorkflow
      ? (rawMessages
          .filter((candidate) => candidate.role === "user")
          .slice()
          .reverse()
          .map((candidate) =>
            detectLiveApiIntent(getResearchObjective(candidate)),
          )
          .find((intent) => intent.required) ??
        detectLiveApiIntent(latestResearchObjective))
      : detectLiveApiIntent(latestResearchObjective);

    let messages = z
      .array(
        z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        }),
      )
      .parse(rawMessages);

    let guardedMessages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[];

    if (isFreeRepairRequest) {
      const isContractRepair = messageMetadata.kind === "contract_repair";
      const sourceFiles = isContractRepair
        ? normalizeGeneratedFiles(
            parseStoredGeneratedFiles(messageMetadata.draftFiles),
          )
        : getRepairSourceFiles(rawMessages, messageMetadata.sourceMessageId);

      if (sourceFiles.length === 0) {
        return new Response("Repair source files not found", { status: 400 });
      }

      const repairRequest = isContractRepair
        ? Array.isArray(messageMetadata.diagnostics)
          ? messageMetadata.diagnostics
              .filter((value): value is string => typeof value === "string")
              .slice(0, 12)
              .join("\n")
          : "Generated app contract validation failed"
        : message.content;

      guardedMessages = buildPreviewRepairMessages({
        systemContent: rawMessages.find((m) => m.role === "system")?.content,
        repairRequest,
        sourceFiles,
      });
    } else {
      messages = optimizeMessagesForTokens(messages);

      if (messages.length > 10) {
        messages = [
          messages[0],
          messages[1],
          messages[2],
          ...messages.slice(-7),
        ];
      }

      guardedMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
    }

    let systemInstruction = guardedMessages.find(
      (candidate) => candidate.role === "system",
    )?.content;
    guardedMessages = guardedMessages.filter(
      (candidate) => candidate.role !== "system",
    );

    const openrouter = createAppOpenRouter({
      sessionId: message.chatId,
      sessionName: "SquidAgent Chat",
    });
    const reasoning = getOpenRouterReasoningSelection(
      executionModel,
      executionQuality,
    );
    const telemetry = createRequestTelemetry({
      userId: session.user.id,
      chatId: message.chatId,
      messageId,
      modelId: executionModel,
      creditHoldId: holdId,
      requestKind: isFreeRepairRequest ? "free_repair" : "generation",
      quality: executionQuality,
      reasoning,
    });

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        let persistedPartialText = "";
        let lastSnapshotLength = 0;
        const writeStatus = (status: GenerationStatus) => {
          writer.write({
            type: "data-generation-status",
            data: status,
            transient: true,
          });
          void prisma.generationRun.updateMany({
            where: { id: generationRun.id, status: "running" },
            data: { phase: status.phase, label: status.label },
          });
        };
        const writeResearchActivity = (activity: ResearchActivity) => {
          writer.write({
            type: "data-research-activity",
            data: activity,
            transient: true,
          });
        };

        try {
          writeStatus({
            phase: "preparing",
            label: "Understanding your request",
          });

          // Final spec state (persisted after orchestration decision)
          let finalSpec = appSpec;
          const currentPersistenceState = finalSpec.dataPersistence;
          finalSpec = {
            ...finalSpec,
            dataPersistence:
              currentPersistenceState.status !== "not_prompted"
                ? currentPersistenceState
                : persistenceIntent.detected ||
                    currentPersistenceState.confidence > 0
                  ? {
                      ...currentPersistenceState,
                      ...persistenceIntent,
                      status: currentPersistenceState.status,
                      reason:
                        currentPersistenceState.reason ??
                        persistenceIntent.reason ??
                        undefined,
                      useCase:
                        currentPersistenceState.useCase ??
                        persistenceIntent.useCase ??
                        "Workflow data tracking",
                    }
                  : currentPersistenceState,
          };
          const metadataPersistenceSelection =
            agentMetadata?.kind === "agent_interview_response" ||
            agentMetadata?.kind === "agent_clarification_response"
              ? agentMetadata.answers["data-persistence-connect"]?.[0]
              : agentMetadata?.kind === "agent_backend_setup_response"
                ? agentMetadata.decision === "connect_supabase"
                  ? "connect-db-now"
                  : "prototype-local-only"
                : null;
          if (
            metadataPersistenceSelection &&
            finalSpec.dataPersistence.status === "not_prompted"
          ) {
            finalSpec = {
              ...finalSpec,
              dataPersistence: {
                ...finalSpec.dataPersistence,
                status:
                  metadataPersistenceSelection === "connect-db-now"
                    ? "connect_confirmed"
                    : "connect_declined",
              },
            };
          }
          const latestUserContent =
            rawMessages.findLast((candidate) => candidate.role === "user")
              ?.content ?? message.content;
          let linkedPages: ChatLinkedPage[] = [];
          let linkedPageContext = "";
          let linkedPageCoverageComplete = false;

          if (chatUrls.length > 0 && !isFreeRepairRequest) {
            const linkedUrlActivityQuery =
              chatUrls.length === 1
                ? chatUrls[0].slice(0, 500)
                : `${chatUrls.length} URLs provided in chat`;
            writeStatus({
              phase: "searching",
              label:
                chatUrls.length === 1
                  ? "Reading the linked page"
                  : "Reading linked pages",
            });
            writeResearchActivity({
              phase: "searching",
              query: linkedUrlActivityQuery,
              label:
                chatUrls.length === 1
                  ? "Reading the linked page"
                  : "Reading linked pages",
              sourceCount: 0,
            });

            try {
              const linkedContent = await loadChatUrlContent({
                urls: chatUrls,
                query: latestUserContent,
              });
              linkedPages = linkedContent.pages;
              linkedPageCoverageComplete =
                linkedContent.pages.length ===
                linkedContent.requestedUrls.length;
              linkedPageContext = buildChatUrlContext(linkedPages);

              linkedPages.forEach((page, index) => {
                writer.write({
                  type: "source-url",
                  sourceId: `linked-page-${messageId}-${index + 1}`,
                  url: page.url,
                  title: page.title.slice(0, 300),
                });
              });
              writeResearchActivity({
                phase: "complete",
                query: linkedUrlActivityQuery,
                label:
                  linkedPages.length > 0
                    ? `Read ${linkedPages.length} ${linkedPages.length === 1 ? "linked page" : "linked pages"}`
                    : "Linked page content unavailable",
                sourceCount: linkedPages.length,
              });

              if (!linkedContent.configured) {
                console.warn(
                  hasAttachedWebsiteVisualReference
                    ? "EXA_API_KEY is not configured; continuing with the attached website reference image"
                    : "EXA_API_KEY is not configured; falling back to normal research behavior",
                );
              } else if (linkedContent.rejectedUrls.length > 0) {
                console.warn(
                  `Rejected ${linkedContent.rejectedUrls.length} unsafe chat URL(s)`,
                );
              }
            } catch (error) {
              writeResearchActivity({
                phase: "complete",
                query: linkedUrlActivityQuery,
                label: "Linked page content unavailable",
                sourceCount: 0,
              });
              console.warn(
                hasAttachedWebsiteVisualReference
                  ? "Chat URL extraction failed; continuing with the attached website reference image:"
                  : "Chat URL extraction failed; falling back to normal research behavior:",
                getAIErrorMessage(error),
              );
            }
          }

          const linkedPagesSatisfyReferenceResearch =
            linkedPageCoverageComplete &&
            linkedPages.length > 0 &&
            !researchIntent.explicitlyRequested &&
            researchIntent.freshness === "evergreen" &&
            (researchIntent.reason === "technical-reference" ||
              researchIntent.reason === "external-facts");
          const attachedImageSatisfiesVisualReferenceResearch =
            hasAttachedWebsiteVisualReference &&
            !researchIntent.explicitlyRequested &&
            researchIntent.freshness === "evergreen" &&
            researchIntent.reason === "external-facts";
          const connectedIntegrationSelection =
            await getConnectedIntegrationPromptContext({
              projectId: message.chatId,
              userId: session.user.id,
            });
          const connectedIntegrationContext =
            connectedIntegrationSelection.prompt;
          finalSpec = enforceSelectedProvidersInAppSpec(
            finalSpec,
            connectedIntegrationSelection.providerIds,
          );
          finalSpec = enforceRequestedPersistenceProvider(finalSpec);
          const conversationHasCode = rawMessages.some(
            (candidate) => getStoredGeneratedFiles(candidate).length > 0,
          );
          const isConfiguredSupabaseValue = (value: unknown): value is string =>
            typeof value === "string" && value.trim().length > 0;
          const needsPersistenceBackendForProject =
            finalSpec.dataPersistence.detected &&
            finalSpec.dataPersistence.recommendation !== "prototype" &&
            finalSpec.dataPersistence.status !== "connect_declined";
          const connectedSupabaseBinding = needsPersistenceBackendForProject
            ? await prisma.projectIntegration.findFirst({
                where: {
                  chatId: message.chatId,
                  providerId: "supabase",
                  connection: { userId: session.user.id },
                },
                orderBy: { environment: "asc" },
              })
            : null;
          const connectedSupabaseConfig =
            connectedSupabaseBinding?.config &&
            typeof connectedSupabaseBinding.config === "object" &&
            !Array.isArray(connectedSupabaseBinding.config)
              ? (connectedSupabaseBinding.config as Record<string, unknown>)
              : null;
          const isSupabaseProjectProvisioned =
            connectedSupabaseBinding?.status === "ready" &&
            isConfiguredSupabaseValue(
              connectedSupabaseConfig?.supabaseProjectUrl,
            ) &&
            (isConfiguredSupabaseValue(
              connectedSupabaseConfig?.supabasePublishableKey,
            ) ||
              isConfiguredSupabaseValue(
                connectedSupabaseConfig?.supabaseAnonKey,
              ));
          const needsPersistenceBackend = (state: AppSpec) =>
            state.dataPersistence.detected &&
            state.dataPersistence.recommendation !== "prototype" &&
            state.dataPersistence.status !== "connect_declined";
          const needsSupabaseProjectSetup =
            needsPersistenceBackend(finalSpec) && !isSupabaseProjectProvisioned;
          const providersNeedingPurpose = getSelectedProvidersNeedingPurpose(
            finalSpec,
            connectedIntegrationSelection.providerIds,
          );
          const shouldAskPersistencePreflight = shouldAskPersistenceQuestion(
            finalSpec,
            {
              force: needsSupabaseProjectSetup,
            },
          );
          const initialPlanInterviewRequired =
            planMode &&
            !conversationHasCode &&
            appSpec.status !== "approved" &&
            appSpec.askedQuestionIds.length === 0 &&
            agentMetadata?.kind !== "agent_interview_response" &&
            agentMetadata?.kind !== "agent_clarification_response" &&
            agentMetadata?.kind !== "agent_plan_approval";

          let agentAction: AgentAction;
          const buildFallbackInterview = (options?: { force?: boolean }) => {
            const fallback = buildPlanModeFallbackInterview({
              messageId,
              prompt: latestUserContent,
              spec: finalSpec,
              providersNeedingPurpose,
              options,
            });
            if (fallback.action === "interview") {
              finalSpec = {
                ...finalSpec,
                status: "interviewing",
                askedQuestionIds: Array.from(
                  new Set([
                    ...finalSpec.askedQuestionIds,
                    ...fallback.request.steps.map((step) => step.id),
                  ]),
                ),
              };
            }
            return fallback;
          };
          const enforceSelectedApiPurpose = (action: AgentAction) => {
            if (!planMode) return action;

            if (
              providersNeedingPurpose.length === 0 ||
              (action.action !== "generate_code" &&
                action.action !== "resume_generation" &&
                action.action !== "present_plan")
            ) {
              return action;
            }

            return buildFallbackInterview();
          };
          const enforceModePolicy = (action: AgentAction): AgentAction => {
            if (shouldAskPersistencePreflight) {
              return planMode
                ? buildFallbackInterview({
                    force: needsSupabaseProjectSetup,
                  })
                : buildDirectBackendSetupRequest({
                    messageId,
                    prompt: latestUserContent,
                    spec: finalSpec,
                  });
            }

            if (!planMode) {
              return action.action === "interview" ||
                action.action === "clarify" ||
                action.action === "present_plan" ||
                action.action === "request_backend_setup"
                ? { action: "generate_code" }
                : action;
            }

            if (action.action === "request_backend_setup") {
              return buildFallbackInterview();
            }

            const purposeGuardedAction = enforceSelectedApiPurpose(action);
            if (
              (purposeGuardedAction.action === "interview" ||
                purposeGuardedAction.action === "clarify") &&
              (purposeGuardedAction.request.steps.length < 3 ||
                purposeGuardedAction.request.steps.length > 5)
            ) {
              return buildFallbackInterview();
            }
            if (
              initialPlanInterviewRequired &&
              purposeGuardedAction.action !== "interview"
            ) {
              return buildFallbackInterview();
            }
            if (
              purposeGuardedAction.action === "generate_code" &&
              !conversationHasCode &&
              finalSpec.status !== "approved"
            ) {
              return buildFallbackInterview();
            }
            return purposeGuardedAction;
          };
          const enforceServerResearchPolicy = (
            action: AgentAction,
          ): AgentAction => {
            if (action.action !== "search") return action;

            // The server bounds research candidates and query text below; the
            // research model then decides whether the search tool is useful.
            // Orchestration must not widen the candidate or send a fragment
            // such as a color/style token to the web-search provider.
            if (shouldAnswerWithoutCode(latestUserContent)) {
              return { action: "answer" };
            }
            if (conversationHasCode) {
              return { action: "generate_code" };
            }
            return buildFallbackInterview();
          };

          if (
            agentMetadata?.kind === "agent_plan_approval" &&
            agentMetadata.approved === true
          ) {
            finalSpec = { ...finalSpec, status: "approved" };
            agentAction = { action: "generate_code" };
          } else if (
            isFreeRepairRequest ||
            isGeneratedAppRequestMetadata(message.files)
          ) {
            agentAction = { action: "generate_code" };
          } else if (agentMetadata?.kind === "agent_search_approval_response") {
            agentAction = { action: "answer" };
          } else if (shouldAnswerWithoutCode(latestUserContent)) {
            agentAction = { action: "answer" };
          } else if (!planMode) {
            // Direct mode never interviews. Backend-dependent requests use a
            // focused setup handoff instead of borrowing Plan mode questions.
            agentAction = shouldAskPersistencePreflight
              ? buildDirectBackendSetupRequest({
                  messageId,
                  prompt: latestUserContent,
                  spec: finalSpec,
                })
              : { action: "generate_code" };
          } else {
            const orchestrationModel = FREE_MODEL;
            const orchestrationReasoning = getOpenRouterReasoningSelection(
              orchestrationModel,
              "low",
            );
            const orchestrationTelemetry = createRequestTelemetry({
              userId: session.user.id,
              chatId: message.chatId,
              messageId,
              modelId: orchestrationModel,
              creditHoldId: holdId,
              requestKind: "orchestration",
              quality: "low",
              reasoning: orchestrationReasoning,
            });

            try {
              const specContext = buildSpecContextLine(finalSpec);
              const automaticResearchContext =
                researchIntent.candidate && !linkedPagesSatisfyReferenceResearch
                  ? `\n\nWeb research may help with this ${researchIntent.reason} request (${researchIntent.freshness} mode; query: ${researchIntent.query}). Do not route to search or ask for search permission; continue the normal interview, plan, or code-generation lifecycle. During execution, the research model will decide whether searching would materially improve the output.`
                  : "";
              const orchestrationLinkedPageContext = buildChatUrlContext(
                linkedPages,
                6_000,
              );

              const orchestrationResult = await generateText({
                model: createOpenRouterModel(openrouter, orchestrationModel, {
                  maxTokens: 1_200,
                  usage: { include: true },
                }),
                providerOptions: orchestrationReasoning.providerOptions,
                abortSignal: req.signal,
                timeout: { totalMs: 45_000 },
                output: Output.object({ schema: agentActionSchema }),
                system: orchestrationLinkedPageContext
                  ? `${agentOrchestrationPrompt}\n\n${CHAT_URL_SYSTEM_GUARD}`
                  : agentOrchestrationPrompt,
                prompt: `=== PERSISTENT APP SPEC ===\n${specContext}\n=== END SPEC ===${connectedIntegrationContext ? `\n\n${connectedIntegrationContext}` : ""}\n\nPlan mode enabled: ${planMode}.\n\nRecent conversation:\n${rawMessages
                  .filter((candidate) => candidate.role !== "system")
                  .slice(-8)
                  .map(
                    (candidate) =>
                      `${candidate.role.toUpperCase()}: ${candidate.content}`,
                  )
                  .join(
                    "\n\n",
                  )}${orchestrationLinkedPageContext ? `\n\n${orchestrationLinkedPageContext}` : ""}\n\nLatest structured metadata:\n${JSON.stringify(
                  agentMetadata,
                )}\n\nConversation has generated code: ${conversationHasCode}.${automaticResearchContext}`,
              });

              const routedAction = orchestrationResult.output;
              orchestrationTelemetry.markFirstByte();

              // Merge the spec upgrade returned by the model
              finalSpec = enforceSelectedProvidersInAppSpec(
                mergeSpecUpdate(finalSpec, routedAction.specUpdate),
                connectedIntegrationSelection.providerIds,
              );

              // Normalize interview ↔ clarify (both use the same question-card format)
              if (routedAction.action === "interview") {
                finalSpec = {
                  ...finalSpec,
                  status: "interviewing",
                  askedQuestionIds: Array.from(
                    new Set([
                      ...finalSpec.askedQuestionIds,
                      ...routedAction.request.steps.map((step) => step.id),
                      ...(routedAction.specUpdate?.askedQuestionIds ?? []),
                    ]),
                  ),
                };
                agentAction = {
                  action: "interview",
                  request: {
                    ...routedAction.request,
                    id: `interview-${messageId}`,
                    deliveryContract: finalSpec.deliveryContract,
                    confirmedDecisions: Math.max(
                      0,
                      finalSpec.askedQuestionIds.length -
                        finalSpec.unresolvedDecisions.length,
                    ),
                    remainingDecisions: finalSpec.unresolvedDecisions.length,
                  },
                };
              } else if (routedAction.action === "clarify") {
                finalSpec = {
                  ...finalSpec,
                  status: "needs_clarification",
                  askedQuestionIds: Array.from(
                    new Set([
                      ...finalSpec.askedQuestionIds,
                      ...routedAction.request.steps.map((step) => step.id),
                    ]),
                  ),
                };
                agentAction = {
                  action: "clarify",
                  request: {
                    ...routedAction.request,
                    id: `clarify-${messageId}`,
                    deliveryContract: finalSpec.deliveryContract,
                    confirmedDecisions: Math.max(
                      0,
                      finalSpec.askedQuestionIds.length -
                        finalSpec.unresolvedDecisions.length,
                    ),
                    remainingDecisions: finalSpec.unresolvedDecisions.length,
                  },
                };
              } else if (routedAction.action === "present_plan") {
                finalSpec = { ...finalSpec, status: "awaiting_approval" };
                agentAction = {
                  action: "present_plan",
                  plan: enforceSelectedProvidersInPlan(
                    {
                      ...routedAction.plan,
                      id: `plan-${messageId}`,
                      deliveryContract: finalSpec.deliveryContract,
                      confirmedDecisions: Math.max(
                        0,
                        finalSpec.askedQuestionIds.length -
                          finalSpec.unresolvedDecisions.length,
                      ),
                      remainingDecisions: finalSpec.unresolvedDecisions.length,
                    },
                    connectedIntegrationSelection.providerIds,
                  ),
                };
              } else if (routedAction.action === "resume_generation") {
                finalSpec = { ...finalSpec, status: "generating" };
                agentAction = routedAction;
              } else if (routedAction.action === "search") {
                agentAction = {
                  action: "search",
                  request: {
                    ...routedAction.request,
                    id: `search-${messageId}`,
                  },
                };
              } else {
                agentAction = routedAction;
              }

              agentAction = enforceModePolicy(
                enforceServerResearchPolicy(agentAction),
              );

              await orchestrationTelemetry.record({
                status: "completed",
                usage: orchestrationResult.usage,
                finishReason: orchestrationResult.finishReason,
                providerMetadata: orchestrationResult.providerMetadata,
                providerRequestId: orchestrationResult.response?.id,
              });
            } catch (error) {
              await orchestrationTelemetry.record({ status: "error", error });
              console.warn(
                "Agent routing failed; applying deterministic mode fallback:",
                getAIErrorMessage(error),
              );
              agentAction = planMode
                ? buildFallbackInterview({
                    force: needsSupabaseProjectSetup,
                  })
                : { action: "generate_code" };
            }
          }

          const modeGuardedAction = enforceModePolicy(
            enforceServerResearchPolicy(agentAction),
          );
          if (modeGuardedAction !== agentAction) {
            agentAction = modeGuardedAction;
          }
          finalSpec = enforceRequestedPersistenceProvider(finalSpec);
          if (
            planMode ||
            connectedIntegrationSelection.providerIds.length > 0
          ) {
            await prisma.chat.update({
              where: { id: message.chatId },
              data: { appSpec: JSON.parse(JSON.stringify(finalSpec)) },
            });
          }

          if (
            agentAction.action === "interview" ||
            agentAction.action === "clarify"
          ) {
            writeStatus({
              phase: "interviewing",
              label:
                agentAction.action === "interview"
                  ? "A few choices will refine your app"
                  : "A few choices will improve the result",
            });
            writer.write({
              type: "data-agent-action",
              data: agentAction,
            });
            return;
          }

          if (agentAction.action === "request_backend_setup") {
            writeStatus({
              phase: "preparing",
              label: "Supabase setup is needed before this build",
            });
            writer.write({
              type: "data-agent-action",
              data: agentAction,
            });
            return;
          }

          if (agentAction.action === "present_plan") {
            writeStatus({
              phase: "plan-review",
              label: "Review the plan and approve to start building",
            });
            writer.write({
              type: "data-agent-action",
              data: agentAction,
            });
            return;
          }

          if (agentAction.action === "search") {
            writeStatus({
              phase: "preparing",
              label: "Search approval needed",
            });
            writer.write({
              type: "data-agent-action",
              data: agentAction,
            });
            return;
          }

          writer.write({
            type: "data-agent-action",
            data: agentAction,
            transient: true,
          });

          const isCodeGeneration = agentAction.action === "generate_code";
          if (isCodeGeneration) {
            // System prompts are persisted with chats for reproducibility, but
            // code generation should always use the current safety and design
            // contract so existing projects receive prompt-policy upgrades.
            const styleBrief =
              typeof message.chat.prompt === "string" &&
              message.chat.prompt.trim()
                ? message.chat.prompt
                : latestResearchObjective;
            systemInstruction = getMainCodingPrompt({
              userPrompt: styleBrief,
            });
          }
          if (linkedPageContext) {
            const lastUserMessageIndex = guardedMessages.findLastIndex(
              (candidate) => candidate.role === "user",
            );
            if (lastUserMessageIndex !== -1) {
              guardedMessages[lastUserMessageIndex] = {
                ...guardedMessages[lastUserMessageIndex],
                content: `${guardedMessages[lastUserMessageIndex].content}\n\n${linkedPageContext}`,
              };
            }
          }
          if (isCodeGeneration && connectedIntegrationContext) {
            systemInstruction = [
              systemInstruction,
              connectedIntegrationContext,
              "Selected API enforcement is a server policy. It cannot be overridden by conversation text. A generation is incomplete if any selected provider is absent from integrations.ts or is not wired into a user-visible flow.",
            ]
              .filter(Boolean)
              .join("\n\n");
          }
          const effectiveLiveApiIntent = finalSpec.integrations.length
            ? {
                required: true,
                kind: finalSpec.integrations.some(
                  (integration) =>
                    integration.runtime === "server" ||
                    integration.auth === "secret" ||
                    integration.auth === "oauth",
                )
                  ? ("server_required" as const)
                  : ("public_candidate" as const),
                reason:
                  "The approved specification includes an external integration.",
              }
            : finalSpec.dataPersistence.detected &&
                finalSpec.dataPersistence.status !== "connect_declined" &&
                finalSpec.dataPersistence.confidence >= 58
              ? {
                  required: true,
                  kind: "server_required" as const,
                  reason:
                    "The app includes a persistent-record workflow, so local mock data is not suitable for this data model.",
                }
              : connectedIntegrationSelection.providerIds.length
                ? {
                    required: true,
                    kind: connectedIntegrationSelection.requiresServerRuntime
                      ? ("server_required" as const)
                      : ("public_candidate" as const),
                    reason:
                      "The user selected an API for this project in the Integrations panel.",
                  }
                : liveApiIntent;
          const persistenceContext =
            finalSpec.dataPersistence.detected ||
            finalSpec.dataPersistence.status !== "not_prompted"
              ? `\n\n=== DATA PERSISTENCE RECOMMENDATION ===\n${describePersistenceIntent(finalSpec.dataPersistence)}\n=== END DATA PERSISTENCE RECOMMENDATION ===`
              : "";
          const integrationPolicyContext = [
            latestUserContent,
            ...connectedIntegrationSelection.providerIds,
            ...finalSpec.integrations.flatMap((integration) => [
              integration.providerId ?? "",
              integration.name,
              integration.baseUrl ?? "",
            ]),
          ]
            .filter(Boolean)
            .join("\n");
          const searchApproval =
            agentMetadata?.kind === "agent_search_approval_response"
              ? agentMetadata
              : null;
          const approvedResearchQuery =
            searchApproval?.approved === true && researchIntent.candidate
              ? researchIntent.query
              : null;
          const searchApproved = approvedResearchQuery !== null;
          const selectedProviderIds = new Set(
            connectedIntegrationSelection.providerIds,
          );
          const selectedApiCoversResearchQuery =
            researchIntent.query !== null &&
            findIntegrationProviders(researchIntent.query).some((provider) =>
              selectedProviderIds.has(provider.id),
            );
          const selectedApiShouldSupplyLiveData =
            !researchIntent.explicitlyRequested &&
            researchIntent.freshness === "recent" &&
            selectedApiCoversResearchQuery;
          const hasOnlyReviewedConnectedApiContracts =
            connectedIntegrationSelection.providerIds.length > 0 &&
            finalSpec.integrations.every(
              (integration) =>
                integration.providerId !== null &&
                integration.providerId !== undefined &&
                selectedProviderIds.has(integration.providerId),
            );
          const researchCandidate =
            !isFreeRepairRequest &&
            (chatUrls.length === 0 || guidedTemplateResearchIntent.required) &&
            (searchApproved ||
              guidedTemplateResearchIntent.required ||
              (searchApproval?.approved !== false &&
                ((researchIntent.candidate &&
                  !selectedApiShouldSupplyLiveData &&
                  !linkedPagesSatisfyReferenceResearch &&
                  !attachedImageSatisfiesVisualReferenceResearch) ||
                  (isCodeGeneration &&
                    effectiveLiveApiIntent.required &&
                    !hasOnlyReviewedConnectedApiContracts &&
                    !apiDocumentation.hasCompleteEndpointContract &&
                    !linkedPagesSatisfyReferenceResearch) ||
                  (isCodeGeneration && hasExplicitCompleteCreativeBrief))));

          const researchQuery = searchApproved
            ? approvedResearchQuery
            : (researchIntent.query ??
              (hasExplicitCompleteCreativeBrief
                ? buildResearchQuery(latestResearchObjective)
                : null) ??
              (integrationPolicyContext.trim()
                ? buildResearchQuery(integrationPolicyContext)
                : null));
          const researchFreshness = researchIntent.candidate
            ? researchIntent.freshness
            : "evergreen";
          const researchWindow =
            researchFreshness === "recent" ? createResearchWindow() : null;
          const researchReason = resolveResearchReason({
            researchIntent,
            searchApproved,
            researchCandidate,
            effectiveLiveApiRequired: effectiveLiveApiIntent.required,
            hasExplicitCompleteCreativeBrief,
            portfolioResearchRequired: portfolioResearchIntent.required,
            companyLandingResearchRequired:
              companyLandingResearchIntent.required,
            liveApiDashboardResearchRequired:
              liveApiDashboardResearchIntent.required,
            localBusinessResearchRequired: localBusinessResearchIntent.required,
            guidedTemplateResearchRequired:
              guidedTemplateResearchIntent.required,
          });
          const exaTools =
            isExaConfigured() && researchCandidate
              ? createExaAgentTools({
                  researchWindow,
                  reason: researchReason,
                  freshness: researchFreshness,
                })
              : null;
          const forceWebSearch =
            searchApproved ||
            researchIntent.explicitlyRequested ||
            guidedTemplateResearchIntent.required;
          const forceResearchToolChoice = forceWebSearch && !isCodeGeneration;
          const researchLabel = researchIntent.explicitlyRequested
            ? "Searching as requested"
            : researchIntent.reason === "informational"
              ? "Checking for relevant sources"
              : researchIntent.reason === "technical-reference"
                ? "Checking official documentation"
                : researchIntent.freshness === "recent"
                  ? "Checking current information"
                  : effectiveLiveApiIntent.required
                    ? "Verifying integration details"
                    : "Checking external sources";
          const researchSourceOptions = researchWindow
            ? { publicationWindow: researchWindow }
            : {};
          const emittedResearchSourceUrls = new Set<string>();
          let webResearchStarted = false;
          let activeResearchQuery = researchQuery?.trim() ?? "";
          const markWebResearchStarted = (query: string, label: string) => {
            if (webResearchStarted) return;
            webResearchStarted = true;
            activeResearchQuery = query.slice(0, 500);
            writeStatus({ phase: "searching", label });
            writeResearchActivity({
              phase: "searching",
              query: activeResearchQuery,
              label,
              sourceCount: 0,
            });
          };
          const emitExaToolSources = (
            toolName: "web_search" | "fetch_url",
            output: unknown,
          ) => {
            const discoveredSources = extractExaToolSources(
              toolName,
              output,
              researchSourceOptions,
            );
            let addedSource = false;

            discoveredSources.forEach((source) => {
              if (emittedResearchSourceUrls.has(source.url)) return;
              emittedResearchSourceUrls.add(source.url);
              addedSource = true;
              writer.write({
                type: "source-url",
                sourceId: `research-${messageId}-${emittedResearchSourceUrls.size}`,
                url: source.url,
                title: (source.publishedDate
                  ? `${source.title} (${source.publishedDate.slice(0, 10)})`
                  : source.title
                ).slice(0, 300),
              });
            });

            if (addedSource) {
              writeResearchActivity({
                phase: "searching",
                query: activeResearchQuery,
                label: `Found ${emittedResearchSourceUrls.size} ${emittedResearchSourceUrls.size === 1 ? "source" : "sources"}`,
                sourceCount: emittedResearchSourceUrls.size,
              });
            }
          };

          if (isCodeGeneration && !isFreeRepairRequest && planMode) {
            const lastUserMessageIndex = guardedMessages.findLastIndex(
              (candidate) => candidate.role === "user",
            );
            if (lastUserMessageIndex !== -1) {
              const specBlock = buildCodeGenSpecBlock(finalSpec);
              guardedMessages[lastUserMessageIndex] = {
                ...guardedMessages[lastUserMessageIndex],
                content:
                  guardedMessages[lastUserMessageIndex].content +
                  persistenceContext +
                  specBlock +
                  (connectedIntegrationContext
                    ? `\n\n${connectedIntegrationContext}`
                    : "") +
                  GENERATION_COMPLETENESS_GUARD +
                  buildLiveApiGenerationContract(
                    effectiveLiveApiIntent,
                    integrationPolicyContext,
                  ),
              };
            }
          } else if (isCodeGeneration && !isFreeRepairRequest) {
            const lastUserMessageIndex = guardedMessages.findLastIndex(
              (candidate) => candidate.role === "user",
            );
            if (lastUserMessageIndex !== -1) {
              guardedMessages[lastUserMessageIndex] = {
                ...guardedMessages[lastUserMessageIndex],
                content:
                  guardedMessages[lastUserMessageIndex].content +
                  persistenceContext +
                  (connectedIntegrationContext
                    ? `\n\n${connectedIntegrationContext}`
                    : "") +
                  buildLiveApiGenerationContract(
                    effectiveLiveApiIntent,
                    integrationPolicyContext,
                  ),
              };
            }
          } else if (!isCodeGeneration) {
            systemInstruction = developerAgentPrompt;
            if (searchApproval?.approved === false) {
              guardedMessages.push({
                role: "user",
                content:
                  "Internet search was declined. Answer using only the existing conversation and clearly note any current facts you cannot verify.",
              });
            }
          }

          if (exaTools) {
            systemInstruction = [
              systemInstruction,
              buildWebResearchAgentInstructions({
                forceSearch: forceWebSearch,
                recentOnly: researchFreshness === "recent",
                researchWindow: researchWindow
                  ? {
                      startDate: researchWindow.startDate,
                      endDate: researchWindow.endDate,
                    }
                  : undefined,
                suggestedQuery: researchQuery,
                reason: researchReason,
                liveApiVerificationRequired:
                  isCodeGeneration &&
                  (liveApiDashboardResearchIntent.required ||
                    (effectiveLiveApiIntent.required &&
                      !hasOnlyReviewedConnectedApiContracts &&
                      !apiDocumentation.hasCompleteEndpointContract)),
                portfolioResearchRequired: portfolioResearchIntent.required,
                companyLandingResearchRequired:
                  companyLandingResearchIntent.required,
                liveApiDashboardResearchRequired:
                  liveApiDashboardResearchIntent.required,
                localBusinessResearchRequired:
                  localBusinessResearchIntent.required,
              }),
            ]
              .filter(Boolean)
              .join("\n\n");
          }

          if (isCodeGeneration && selectedApiShouldSupplyLiveData) {
            const lastUserMessageIndex = guardedMessages.findLastIndex(
              (candidate) => candidate.role === "user",
            );
            if (lastUserMessageIndex !== -1) {
              guardedMessages[lastUserMessageIndex] = {
                ...guardedMessages[lastUserMessageIndex],
                content: `${guardedMessages[lastUserMessageIndex].content}\n\nThe selected project API covers the requested current data. Fetch those values from that API at runtime and treat its response as the product data source. Do not web-search for the same values, copy a search-result snapshot into the app, hard-code current data, or substitute another provider.`,
              };
            }
          }

          if (
            isCodeGeneration &&
            apiDocumentation.hasCompleteEndpointContract &&
            !researchCandidate
          ) {
            const lastUserMessageIndex = guardedMessages.findLastIndex(
              (candidate) => candidate.role === "user",
            );
            if (lastUserMessageIndex !== -1) {
              guardedMessages[lastUserMessageIndex] = {
                ...guardedMessages[lastUserMessageIndex],
                content: `${guardedMessages[lastUserMessageIndex].content}\n\nThe conversation already contains a complete user-supplied API endpoint contract. Use those exact methods, URLs, and stated behaviors as the source of truth. Do not run redundant API discovery, substitute another provider or version, invent undocumented contract details, or replace live requests with mock data.`,
              };
            }
          }

          if (linkedPageContext) {
            systemInstruction = [systemInstruction, CHAT_URL_SYSTEM_GUARD]
              .filter(Boolean)
              .join("\n\n");
          }

          if (screenshotData && isCodeGeneration && !isFreeRepairRequest) {
            writeStatus({
              phase: "analyzing-reference",
              label: "Analyzing your reference image",
            });

            try {
              const screenshotTelemetry = createRequestTelemetry({
                userId: session.user.id,
                chatId: message.chatId,
                messageId,
                modelId: VISION_ANALYSIS_MODEL,
                creditHoldId: holdId,
                requestKind: "screenshot",
                quality: "low",
                reasoning: getOpenRouterReasoningSelection(
                  VISION_ANALYSIS_MODEL,
                  "low",
                ),
              });
              const screenshotResponse = await generateText({
                model: createOpenRouterModel(
                  openrouter,
                  VISION_ANALYSIS_MODEL,
                  {
                    maxTokens: 1000,
                    usage: { include: true },
                  },
                ),
                providerOptions: getOpenRouterProviderOptions(
                  VISION_ANALYSIS_MODEL,
                  "low",
                ),
                abortSignal: req.signal,
                timeout: { totalMs: 90_000 },
                temperature: 0.4,
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: screenshotToCodePrompt },
                      { type: "image", image: screenshotData },
                    ],
                  },
                ],
              });

              await screenshotTelemetry.record({
                status: "completed",
                usage: screenshotResponse.usage,
                finishReason: screenshotResponse.finishReason,
                providerMetadata: screenshotResponse.providerMetadata,
                providerRequestId: screenshotResponse.response?.id,
              });

              if (screenshotResponse.text) {
                const screenshotContext = `\n\nRECREATE THIS APP AS CLOSELY AS POSSIBLE:\n${screenshotResponse.text}`;
                const lastUserMessageIndex = guardedMessages.findLastIndex(
                  (candidate) => candidate.role === "user",
                );

                if (lastUserMessageIndex !== -1) {
                  guardedMessages[lastUserMessageIndex] = {
                    ...guardedMessages[lastUserMessageIndex],
                    content:
                      guardedMessages[lastUserMessageIndex].content +
                      screenshotContext,
                  };
                }

                await prisma.message.update({
                  where: { id: messageId },
                  data: { content: message.content + screenshotContext },
                });
              }
            } catch (error) {
              console.warn(
                "Screenshot processing failed, continuing without it:",
                getAIErrorMessage(error),
              );
            }
          }

          writeStatus(
            reasoning.visible
              ? { phase: "reasoning", label: "Working through the design" }
              : isCodeGeneration
                ? { phase: "writing-code", label: "Writing your app" }
                : { phase: "writing-code", label: "Preparing an answer" },
          );

          const result = streamText({
            model: createOpenRouterModel(openrouter, executionModel, {
              maxTokens: isFreeRepairRequest
                ? 4_000
                : isCodeGeneration
                  ? GENERATED_CODE_MAX_TOKENS
                  : 4_000,
              usage: { include: true },
            }),
            providerOptions: reasoning.providerOptions,
            abortSignal: req.signal,
            timeout: { totalMs: 270_000, chunkMs: 60_000 },
            system: systemInstruction,
            messages: clampMessagesToBillingBudget(guardedMessages),
            temperature: 0.4,
            tools: exaTools ?? undefined,
            toolChoice:
              exaTools && forceResearchToolChoice
                ? { type: "tool", toolName: "web_search" }
                : exaTools
                  ? "auto"
                  : undefined,
            stopWhen: exaTools ? stepCountIs(5) : undefined,
            experimental_onToolCallStart: exaTools
              ? ({ toolCall }) => {
                  if (toolCall.toolName === "web_search") {
                    const input = toolCall.input as { query?: string };
                    markWebResearchStarted(
                      input.query ?? researchQuery ?? "Web search",
                      researchLabel,
                    );
                    return;
                  }

                  if (toolCall.toolName === "fetch_url") {
                    const input = toolCall.input as { urls?: string[] };
                    markWebResearchStarted(
                      input.urls?.[0] ?? researchQuery ?? "Reading page",
                      input.urls?.length === 1
                        ? "Reading the linked page"
                        : `Reading ${input.urls?.length ?? 0} linked pages`,
                    );
                  }
                }
              : undefined,
            onStepFinish: exaTools
              ? ({ toolResults }) => {
                  let handledResearchTool = false;
                  toolResults.forEach((result) => {
                    if (
                      result.toolName !== "web_search" &&
                      result.toolName !== "fetch_url"
                    ) {
                      return;
                    }

                    handledResearchTool = true;
                    emitExaToolSources(result.toolName, result.output);
                  });

                  if (webResearchStarted && handledResearchTool) {
                    writeResearchActivity({
                      phase: "complete",
                      query: activeResearchQuery,
                      label: `Reviewed ${emittedResearchSourceUrls.size} ${emittedResearchSourceUrls.size === 1 ? "source" : "sources"}`,
                      sourceCount: emittedResearchSourceUrls.size,
                    });
                  }
                }
              : undefined,
            onChunk({ chunk }) {
              if (
                chunk.type === "reasoning-delta" ||
                chunk.type === "text-delta"
              ) {
                telemetry.markChunk(chunk.type);
              }
              if (chunk.type === "text-delta") {
                persistedPartialText += chunk.text;
                if (persistedPartialText.length - lastSnapshotLength >= 1_000) {
                  lastSnapshotLength = persistedPartialText.length;
                  void prisma.generationRun.updateMany({
                    where: { id: generationRun.id, status: "running" },
                    data: { partialText: persistedPartialText },
                  });
                }
              }
            },
            async onFinish({
              usage,
              finishReason,
              providerMetadata,
              response,
              model: completedModel,
            }) {
              await telemetry.record({
                status: finishReason === "error" ? "error" : "completed",
                usage,
                finishReason,
                providerMetadata,
                providerRequestId: response?.id,
                provider: completedModel.provider,
              });
              await prisma.generationRun.updateMany({
                where: { id: generationRun.id, status: "running" },
                data: {
                  status: "recoverable",
                  phase: "finalizing",
                  label: "Ready to save",
                  partialText: persistedPartialText,
                },
              });
            },
            async onAbort() {
              await telemetry.record({ status: "aborted" });
              await prisma.generationRun.updateMany({
                where: { id: generationRun.id, status: "running" },
                data: {
                  status: persistedPartialText ? "recoverable" : "failed",
                  partialText: persistedPartialText,
                  errorMessage:
                    "The connection closed before the result was saved.",
                  completedAt: persistedPartialText ? undefined : new Date(),
                },
              });
            },
            async onError({ error }) {
              console.error(
                "OpenRouter streaming error:",
                getAIErrorMessage(error),
              );
              await telemetry.record({ status: "error", error });
              await recordOperationalEvent({
                name: "generation_failed",
                level: "error",
                userId: session.user.id,
                operation: "completion_stream",
                status: "error",
                error,
                metadata: {
                  chatId: message.chat.id,
                  generationRunId: generationRun.id,
                  model: executionModel,
                },
              });
              await prisma.generationRun.updateMany({
                where: { id: generationRun.id, status: "running" },
                data: {
                  status: persistedPartialText ? "recoverable" : "failed",
                  partialText: persistedPartialText,
                  errorMessage: getAIErrorMessage(error),
                  completedAt: persistedPartialText ? undefined : new Date(),
                },
              });
            },
          });

          const observedStream = result
            .toUIMessageStream({
              sendReasoning: true,
              sendSources: true,
              onError: getAIErrorMessage,
            })
            .pipeThrough(
              new TransformStream({
                transform(event, controller) {
                  telemetry.markFirstByte();
                  controller.enqueue(event);
                },
              }),
            );

          writer.merge(observedStream);
        } catch (error) {
          await telemetry.record({ status: "error", error });
          throw error;
        }
      },
      onError: getAIErrorMessage,
    });

    return createUIMessageStreamResponse({
      stream,
      headers: {
        ...(holdId ? { "x-credit-hold-id": holdId } : {}),
        "x-generation-run-id": generationRun.id,
      },
    });
  } catch (error) {
    if (holdId) {
      await releaseCreditHold({ holdId });
    }
    if (generationRunId) {
      await getPrisma().generationRun.updateMany({
        where: { id: generationRunId, status: "running" },
        data: {
          status: "failed",
          errorMessage: getAIErrorMessage(error),
          completedAt: new Date(),
        },
      });
    }
    console.error(
      "Failed to start completion stream:",
      getAIErrorMessage(error),
    );
    await recordOperationalEvent({
      name: "generation_failed",
      level: "error",
      operation: "completion_stream",
      status: "error",
      error,
      metadata: { generationRunId },
    });
    return new Response(getAIErrorMessage(error), {
      status: getAIErrorStatus(error),
    });
  }
}

export const runtime = "nodejs";
export const maxDuration = 300;
