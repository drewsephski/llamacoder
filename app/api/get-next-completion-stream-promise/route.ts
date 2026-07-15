import { getPrisma } from "@/lib/prisma";
import { z } from "zod";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  gateway,
  generateText,
  Output,
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
  detectResearchIntent,
  shouldAnswerWithoutCode,
} from "@/features/generation/research-intent";
import {
  buildLiveApiGenerationContract,
  detectLiveApiIntent,
} from "@/features/generation/live-api";
import {
  createResearchWindow,
  extractWebSources,
} from "@/features/generation/research-policy";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { recordOperationalEvent } from "@/lib/observability";
import { getGenerationAvailability } from "@/lib/provider-controls";
import { getConnectedIntegrationPromptContext } from "@/features/integrations/server/service";
import {
  buildSelectedApiPurposeStep,
  enforceSelectedProvidersInAppSpec,
  enforceSelectedProvidersInPlan,
  getSelectedProvidersNeedingPurpose,
} from "@/features/integrations/generation-contract";
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

const WEB_RESEARCH_MODEL = "openai/gpt-5-nano";

function isGeneratedAppRequestMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const kind = (value as { kind?: unknown }).kind;
  return (
    kind === "preview_repair_request" ||
    kind === "preview_repair" ||
    kind === "app_edit_request" ||
    kind === "targeted_element_edit"
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
- If the fix requires changing an export/import pair, return every affected file in full.`;

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
- Output a complete multi-file React + TypeScript app, not a single App.tsx dump.
- Output App.tsx plus at least two supporting source files using fenced blocks like \`\`\`tsx{path=components/Widget.tsx}.
- Do not use src/ in generated paths; files run from the sandbox root.
- Every custom component, hook, utility, or type import must point to a file you output in this response or an existing previous generated file.
- Every import style must match the target export exactly: use default imports only for default exports, and named imports only for named exports.
- Example: \`export default function Footer()\` requires \`import Footer from "./components/Footer"\`; \`export function Footer()\` requires \`import { Footer } from "./components/Footer"\`.
- Do not import from a barrel path like \`./components\` unless that exact index file exists and re-exports the requested symbols.
- Do not invent imports such as "@/lib/hooks/*", "@/hooks/*", or "@/utils/*". Use relative imports for generated files.
- Shadcn imports under "@/components/ui/*" and "@/lib/utils" are already installed and should not be redefined.
- If you call \`cn(...)\`, import it with \`import { cn } from "@/lib/utils"\`.
- For Framer Motion, import lowercase motion: import { motion } from "framer-motion".
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
      | { kind?: string; chargeCredits?: boolean; sourceMessageId?: string }
      | null
      | undefined;
    const isFreeRepairRequest =
      (messageMetadata?.kind === "preview_repair_request" ||
        messageMetadata?.kind === "preview_repair") &&
      messageMetadata.chargeCredits === false;
    const appSpec: AppSpec =
      parseAppSpec(message.chat.appSpec) ?? createEmptyAppSpec();
    const agentMetadata = parseAgentMessageMetadata(message.files);
    const executionModel = isFreeRepairRequest ? FREE_MODEL : chatModel;
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

    const rawMessages = messagesRes as CompletionMessage[];
    const shouldCarryResearchThroughWorkflow =
      agentMetadata?.kind === "agent_plan_approval" ||
      agentMetadata?.kind === "agent_search_approval_response";
    const researchMessages = shouldCarryResearchThroughWorkflow
      ? rawMessages.filter((candidate) => candidate.role === "user").slice(-24)
      : [{ content: message.content }];
    const shouldCarryChatUrlsThroughWorkflow =
      agentMetadata?.kind === "agent_clarification_response" ||
      agentMetadata?.kind === "agent_interview_response" ||
      agentMetadata?.kind === "agent_plan_approval" ||
      agentMetadata?.kind === "agent_search_approval_response";
    const chatUrlMessages = shouldCarryChatUrlsThroughWorkflow
      ? rawMessages
          .filter((candidate) => candidate.role === "user")
          .slice(-24)
          .reverse()
      : [{ content: message.content }];
    const chatUrls = extractChatUrls(chatUrlMessages);
    const apiDocumentation = assessApiDocumentation(researchMessages);
    const researchIntent = detectResearchIntent(researchMessages);
    const liveApiIntent = shouldCarryResearchThroughWorkflow
      ? (rawMessages
          .filter((candidate) => candidate.role === "user")
          .slice()
          .reverse()
          .map((candidate) => detectLiveApiIntent(candidate.content))
          .find((intent) => intent.required) ??
        detectLiveApiIntent(message.content))
      : detectLiveApiIntent(message.content);

    let messages = z
      .array(
        z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        }),
      )
      .parse(messagesRes);

    let guardedMessages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[];

    if (isFreeRepairRequest) {
      const sourceFiles = getRepairSourceFiles(
        rawMessages,
        messageMetadata.sourceMessageId,
      );

      if (sourceFiles.length === 0) {
        return new Response("Repair source files not found", { status: 400 });
      }

      guardedMessages = buildPreviewRepairMessages({
        systemContent: rawMessages.find((m) => m.role === "system")?.content,
        repairRequest: message.content,
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
                  "EXA_API_KEY is not configured; falling back to normal research behavior",
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
                "Chat URL extraction failed; falling back to normal research behavior:",
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

          let agentAction: AgentAction;
          const enforceSelectedApiPurpose = (action: AgentAction) => {
            const providersNeedingPurpose = getSelectedProvidersNeedingPurpose(
              finalSpec,
              connectedIntegrationSelection.providerIds,
            );
            if (
              providersNeedingPurpose.length === 0 ||
              (action.action !== "generate_code" &&
                action.action !== "resume_generation" &&
                action.action !== "present_plan")
            ) {
              return action;
            }

            const purposeStep = buildSelectedApiPurposeStep({
              prompt: latestUserContent,
              providers: providersNeedingPurpose,
            });
            finalSpec = {
              ...finalSpec,
              status: "interviewing",
              askedQuestionIds: Array.from(
                new Set([...finalSpec.askedQuestionIds, purposeStep.id]),
              ),
            };
            return {
              action: "interview" as const,
              request: {
                id: `interview-${messageId}`,
                title: "Choose how the APIs should power your app",
                deliveryContract: finalSpec.deliveryContract,
                confirmedDecisions: Math.max(
                  0,
                  finalSpec.askedQuestionIds.length -
                    providersNeedingPurpose.length,
                ),
                remainingDecisions: providersNeedingPurpose.length,
                steps: [purposeStep],
              },
            };
          };

          if (
            agentMetadata?.kind === "agent_plan_approval" &&
            agentMetadata.approved === true
          ) {
            finalSpec = { ...finalSpec, status: "approved" };
            await prisma.chat.update({
              where: { id: message.chatId },
              data: { appSpec: JSON.parse(JSON.stringify(finalSpec)) },
            });
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
          } else if (
            !planMode &&
            connectedIntegrationSelection.providerIds.length === 0
          ) {
            // Plan mode off: old behavior — generate code immediately,
            // no interview, clarification, or plan. Selected APIs are the one
            // exception because their product role may need clarification.
            agentAction = { action: "generate_code" };
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
              const conversationHasCode = rawMessages.some(
                (candidate) => getStoredGeneratedFiles(candidate).length > 0,
              );
              const automaticResearchContext =
                researchIntent.required && !linkedPagesSatisfyReferenceResearch
                  ? `\n\nAutomatic web research is required for this request because it is ${researchIntent.reason} research (${researchIntent.freshness} mode; query: ${researchIntent.query}). Do not route to search or ask for search permission; continue the normal interview, plan, or code-generation lifecycle. The execution step will run web search before answering or generating code.`
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

              agentAction = enforceSelectedApiPurpose(agentAction);

              // Guard: protect against premature code generation for new builds
              if (
                planMode &&
                agentAction.action === "generate_code" &&
                !conversationHasCode &&
                finalSpec.status !== "approved"
              ) {
                // Downgrade to either plan or interview
                if (
                  finalSpec.unresolvedDecisions.every(
                    (d) => d.impact !== "high",
                  )
                ) {
                  finalSpec = { ...finalSpec, status: "ready_for_plan" };
                  // We do not have the plan content; ask model again to plan by routing to interview with a plan-prompt
                  // Simpler: route to a default interview round asking the user to confirm going to plan
                  agentAction = {
                    action: "interview",
                    request: {
                      id: `interview-${messageId}`,
                      title: "Ready to plan your app",
                      deliveryContract: finalSpec.deliveryContract,
                      confirmedDecisions: finalSpec.askedQuestionIds.length,
                      remainingDecisions: finalSpec.unresolvedDecisions.length,
                      steps: [
                        {
                          id: "confirm-plan",
                          title: "I have enough info to draft a plan. Ready?",
                          options: [
                            {
                              id: "yes",
                              label: "Yes, show me the plan",
                              description:
                                "Draft a compact plan for approval before generating code.",
                            },
                            {
                              id: "more",
                              label: "Ask more questions",
                              description:
                                "Continue the interview to refine the spec.",
                            },
                          ],
                        },
                      ],
                    },
                  };
                } else {
                  agentAction = {
                    action: "interview",
                    request: {
                      id: `interview-${messageId}`,
                      title: "A few more choices will improve the result",
                      deliveryContract: finalSpec.deliveryContract,
                      confirmedDecisions: Math.max(
                        0,
                        finalSpec.askedQuestionIds.length -
                          finalSpec.unresolvedDecisions.length,
                      ),
                      remainingDecisions: finalSpec.unresolvedDecisions.length,
                      steps: finalSpec.unresolvedDecisions
                        .filter((d) => d.impact === "high")
                        .slice(0, 3)
                        .map((d) => ({
                          id: d.id,
                          title: d.topic,
                          description: d.question,
                          options: [
                            {
                              id: `${d.id}-yes`,
                              label: "Yes",
                              description: "Include this requirement",
                            },
                            {
                              id: `${d.id}-no`,
                              label: "No",
                              description: "Exclude this requirement",
                            },
                          ],
                        })),
                    },
                  };
                }
              }

              // Persist any spec updates
              await prisma.chat.update({
                where: { id: message.chatId },
                data: { appSpec: JSON.parse(JSON.stringify(finalSpec)) },
              });

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
                "Agent routing failed; preserving code-generation behavior:",
                getAIErrorMessage(error),
              );
              agentAction = { action: "generate_code" };
            }
          }

          const purposeGuardedAction = enforceSelectedApiPurpose(agentAction);
          if (purposeGuardedAction !== agentAction) {
            agentAction = purposeGuardedAction;
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
            systemInstruction = getMainCodingPrompt();
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
          const searchApproved = searchApproval?.approved === true;
          const researchRequired =
            !isFreeRepairRequest &&
            (searchApproved ||
              (searchApproval?.approved !== false &&
                ((researchIntent.required &&
                  !linkedPagesSatisfyReferenceResearch) ||
                  (isCodeGeneration &&
                    effectiveLiveApiIntent.required &&
                    !apiDocumentation.hasCompleteEndpointContract &&
                    !linkedPagesSatisfyReferenceResearch))));
          const researchQuery = searchApproved
            ? buildResearchQuery(searchApproval.query)
            : (researchIntent.query ??
              (integrationPolicyContext.trim()
                ? buildResearchQuery(integrationPolicyContext)
                : null));
          const researchFreshness = researchIntent.required
            ? researchIntent.freshness
            : "evergreen";

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
            if (researchRequired) {
              guardedMessages.push({
                role: "user",
                content: `Web research is required for this request. Search for: ${researchQuery}. Use the results before answering the underlying request with current, source-grounded information.`,
              });
            } else if (searchApproval?.approved === false) {
              guardedMessages.push({
                role: "user",
                content:
                  "Internet search was declined. Answer using only the existing conversation and clearly note any current facts you cannot verify.",
              });
            }
          }

          if (isCodeGeneration && researchRequired) {
            const lastUserMessageIndex = guardedMessages.findLastIndex(
              (candidate) => candidate.role === "user",
            );
            if (lastUserMessageIndex !== -1) {
              guardedMessages[lastUserMessageIndex] = {
                ...guardedMessages[lastUserMessageIndex],
                content: `${guardedMessages[lastUserMessageIndex].content}\n\nWeb research is required before generating code. The server will attach a verified research brief for: ${researchQuery}. Use that brief as the source of truth for factual app content. Do not invent or substitute placeholder data.`,
              };
            }
          }

          if (
            isCodeGeneration &&
            apiDocumentation.hasCompleteEndpointContract &&
            !researchRequired
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

          if (researchRequired) {
            const query = researchQuery?.trim();
            if (!query) {
              throw new Error("A web research query could not be determined");
            }

            const researchLabel = researchIntent.explicitlyRequested
              ? "Searching as requested"
              : researchIntent.reason === "technical-reference"
                ? "Checking official documentation"
                : researchIntent.freshness === "recent"
                  ? "Checking current information"
                  : effectiveLiveApiIntent.required
                    ? "Verifying integration details"
                    : "Checking external sources";
            writeStatus({ phase: "searching", label: researchLabel });
            writeResearchActivity({
              phase: "searching",
              query,
              label: researchLabel,
              sourceCount: 0,
            });

            const researchModel = WEB_RESEARCH_MODEL;
            const researchWindow =
              researchFreshness === "recent" ? createResearchWindow() : null;
            const researchTelemetry = createRequestTelemetry({
              userId: session.user.id,
              chatId: message.chatId,
              messageId,
              modelId: researchModel,
              creditHoldId: holdId,
              requestKind: "search",
              quality: "low",
              reasoning: {
                enabled: false,
                visible: false,
                mandatory: false,
                effort: "none",
              },
            });

            try {
              const researchResult = streamText({
                model: gateway(researchModel),
                maxOutputTokens: 4_000,
                providerOptions: {
                  gateway: {
                    user: session.user.id,
                    tags: ["feature:web-search", "request:research"],
                  },
                },
                system:
                  researchWindow === null
                    ? `Research the request before answering or generating software. Before invoking web_search, translate the search objective into one or more concise search-engine queries. Never send full user prose, error logs, stack traces, code frames, or source snippets as a tool query. When the objective contains an exact URL, inspect that exact page first and treat it as the primary source; do not replace it with remembered knowledge, a similarly named API, or a different documentation version. Search for information that materially improves accuracy, domain fit, implementation quality, or completeness. Prefer official documentation and primary sources, then reputable secondary sources. Distinguish current claims from stable background information, preserve source URLs, and never guess when sources disagree or do not establish a fact.${effectiveLiveApiIntent.required ? " For any API candidate, verify the official docs URL, base URL, auth model, required credentials, browser CORS support, attribution requirements, rate limits, exact response shape, and unit semantics. Confirm field names and unit codes from an official response example or a live read-only request; distinguish required functional fields from optional metadata. Clearly reject browser use when a secret or server runtime is required, and note any provider header that browsers are not allowed to set. Never recommend mock data as a replacement for the requested live integration." : ""} Return a concise factual brief with source support. Do not write application code.`
                    : `Research current facts for a software-generation request. Today is ${researchWindow.endDate}. Before invoking web_search, translate the search objective into one or more concise search-engine queries. Never send full user prose, error logs, stack traces, code frames, or source snippets as a tool query. Use only sources published from ${researchWindow.startDate} through ${researchWindow.endDate}, inclusive. Ignore undated sources and anything outside that window. Prefer official or primary sources, preserve exact names and ordering, and never describe archived information as current. If qualifying sources do not establish a fact, say it is unavailable rather than guessing. Return a concise factual brief with source support. Do not write application code.`,
                prompt:
                  researchWindow === null
                    ? `${query}\n\nFind the most authoritative sources that can materially improve the response. Include stable documentation or background sources even when they are undated.`
                    : `${query}\n\nRequired publication window: ${researchWindow.startDate} through ${researchWindow.endDate}.`,
                tools: {
                  web_search: gateway.tools.exaSearch({
                    type: "auto",
                    numResults: 8,
                    userLocation: "US",
                    ...(researchWindow
                      ? {
                          startPublishedDate: researchWindow.startIso,
                          endPublishedDate: researchWindow.endIso,
                        }
                      : {}),
                    contents: {
                      text: {
                        maxCharacters: 8_000,
                        includeHtmlTags: false,
                        verbosity: "standard",
                      },
                      highlights: {
                        query,
                        maxCharacters: 3_000,
                      },
                      maxAgeHours: 1,
                      livecrawlTimeout: 10_000,
                    },
                  }),
                },
                toolChoice: "required",
                maxRetries: 1,
              });
              const toolOutputs: unknown[] = [];
              const emittedSourceUrls = new Set<string>();
              let markedFirstResearchEvent = false;
              const sourceOptions = researchWindow
                ? { publicationWindow: researchWindow }
                : {};
              const emitNewSources = (outputs: unknown[]) => {
                const discoveredSources = extractWebSources(
                  outputs,
                  sourceOptions,
                );
                let addedSource = false;

                discoveredSources.forEach((source, index) => {
                  if (emittedSourceUrls.has(source.url)) return;
                  emittedSourceUrls.add(source.url);
                  addedSource = true;
                  writer.write({
                    type: "source-url",
                    sourceId: `research-${messageId}-${index + 1}`,
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
                    query,
                    label: `Found ${emittedSourceUrls.size} ${emittedSourceUrls.size === 1 ? "source" : "sources"}`,
                    sourceCount: emittedSourceUrls.size,
                  });
                }

                return discoveredSources;
              };

              for await (const part of researchResult.fullStream) {
                if (!markedFirstResearchEvent) {
                  markedFirstResearchEvent = true;
                  researchTelemetry.markFirstByte();
                }
                if (part.type === "tool-result") {
                  toolOutputs.push(part.output);
                  emitNewSources(toolOutputs);
                } else if (part.type === "error") {
                  throw part.error;
                }
              }

              const finalToolResults = await researchResult.toolResults;
              const webSources = emitNewSources([
                ...toolOutputs,
                ...finalToolResults.map(({ output }) => output),
              ]);
              if (webSources.length === 0) {
                throw new Error(
                  researchWindow
                    ? `Web search returned no dated sources published from ${researchWindow.startDate} through ${researchWindow.endDate}`
                    : "Web search returned no usable sources",
                );
              }

              writeResearchActivity({
                phase: "complete",
                query,
                label: `Reviewed ${webSources.length} ${webSources.length === 1 ? "source" : "sources"}`,
                sourceCount: webSources.length,
              });

              const sourceEvidence = webSources.map(
                (source, index) =>
                  `[Source ${index + 1}] ${source.title}\nPublished: ${source.publishedDate?.slice(0, 10) ?? "Not provided"}\nURL: ${source.url}\nExcerpt:\n${source.excerpt || "No excerpt was returned."}`,
              );
              const researchBrief = [
                "=== VERIFIED WEB RESEARCH ===",
                researchWindow
                  ? `Strict publication window: ${researchWindow.startDate} through ${researchWindow.endDate}.`
                  : "Research mode: authoritative sources without an artificial publication-date cutoff.",
                sourceEvidence.join("\n\n"),
                "=== END VERIFIED WEB RESEARCH ===",
                researchWindow
                  ? "Use only this dated research as factual source material. Preserve its publication dates and source URLs in the generated app where attribution is useful. Do not revive facts from older conversation messages or label archived data as current."
                  : "Use this research to improve factual accuracy, domain fit, and implementation decisions. Prefer primary sources, preserve source URLs where attribution is useful, and do not claim undated material is current.",
              ].join("\n\n");
              const lastUserMessageIndex = guardedMessages.findLastIndex(
                (candidate) => candidate.role === "user",
              );
              if (lastUserMessageIndex !== -1) {
                guardedMessages[lastUserMessageIndex] = {
                  ...guardedMessages[lastUserMessageIndex],
                  content: `${guardedMessages[lastUserMessageIndex].content}\n\n${researchBrief}`,
                };
              }
              const [usage, finishReason, providerMetadata, response] =
                await Promise.all([
                  researchResult.usage,
                  researchResult.finishReason,
                  researchResult.providerMetadata,
                  researchResult.response,
                ]);
              await researchTelemetry.record({
                status: "completed",
                usage,
                finishReason,
                providerMetadata,
                providerRequestId: response?.id,
              });
            } catch (error) {
              await researchTelemetry.record({ status: "error", error });
              throw error;
            }
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
            system: systemInstruction,
            messages: clampMessagesToBillingBudget(guardedMessages),
            temperature: 0.4,
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
