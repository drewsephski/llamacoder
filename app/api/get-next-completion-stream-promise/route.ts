import { getPrisma } from "@/lib/prisma";
import { z } from "zod";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
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
  type GeneratedFile,
} from "@/lib/generated-files";
import { extractAllCodeBlocks } from "@/lib/utils";
import { screenshotToCodePrompt } from "@/lib/prompts";
import {
  ACCEPTED_SCREENSHOT_MIME_TYPES,
  MAX_SCREENSHOT_DATA_URL_LENGTH,
  MAX_SCREENSHOT_SIZE_MB,
} from "@/lib/constants";
import type { GenerationStatus } from "@/features/generation/contracts";
import { createRequestTelemetry } from "@/features/generation/server/request-telemetry";

type CompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  files?: unknown;
  id?: string;
};

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

function getStoredGeneratedFiles(message: CompletionMessage) {
  return normalizeGeneratedFiles(
    Array.isArray(message.files) && message.files.length > 0
      ? (message.files as any[])
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

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          select: {
            id: true,
            model: true,
            quality: true,
            userId: true,
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
    const quality = message.chat.quality === "high" ? "high" : "low";
    const messageMetadata = message.files as
      | { kind?: string; chargeCredits?: boolean; sourceMessageId?: string }
      | null
      | undefined;
    const isFreeRepairRequest =
      messageMetadata?.kind === "preview_repair_request" &&
      messageMetadata.chargeCredits === false;

    if (!isFreeRepairRequest) {
      const hold = await reserveCreditHold({
        userId: session.user.id,
        modelId: chatModel,
        chatId: message.chat.id,
        reason: "Follow-up generation hold",
        phase: "follow_up",
      });

      if (!hold.success) {
        return new Response(
          hold.error === "INSUFFICIENT_CREDITS"
            ? `Need ${getModelCreditHoldCost(chatModel)} credits to start this model. Upgrade or buy credits to continue.`
            : "Unable to process request",
          { status: hold.error === "USER_NOT_FOUND" ? 404 : 402 },
        );
      }
      holdId = hold.holdId;
    }

    const messagesRes = await prisma.message.findMany({
      where: { chatId: message.chatId, position: { lte: message.position } },
      orderBy: { position: "asc" },
    });

    const rawMessages = messagesRes as CompletionMessage[];

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
      const lastUserMessageIndex = guardedMessages.findLastIndex(
        (m) => m.role === "user",
      );

      if (lastUserMessageIndex !== -1) {
        guardedMessages[lastUserMessageIndex] = {
          ...guardedMessages[lastUserMessageIndex],
          content:
            guardedMessages[lastUserMessageIndex].content +
            GENERATION_COMPLETENESS_GUARD,
        };
      }
    }

    const openrouter = createAppOpenRouter({
      sessionId: message.chatId,
      sessionName: "SquidAgent Chat",
    });
    const reasoning = getOpenRouterReasoningSelection(chatModel, quality);
    const telemetry = createRequestTelemetry({
      userId: session.user.id,
      chatId: message.chatId,
      messageId,
      modelId: chatModel,
      quality,
      reasoning,
    });

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const writeStatus = (status: GenerationStatus) => {
          writer.write({
            type: "data-generation-status",
            data: status,
            transient: true,
          });
        };

        try {
          writeStatus({
            phase: "preparing",
            label: "Preparing your project",
          });

          if (screenshotData) {
            writeStatus({
              phase: "analyzing-reference",
              label: "Analyzing your reference image",
            });

            try {
              const screenshotResponse = await generateText({
                model: createOpenRouterModel(
                  openrouter,
                  VISION_ANALYSIS_MODEL,
                  {
                    maxTokens: 1000,
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
              : { phase: "writing-code", label: "Writing your app" },
          );

          const result = streamText({
            model: createOpenRouterModel(openrouter, chatModel, {
              maxTokens: GENERATED_CODE_MAX_TOKENS,
              usage: { include: true },
            }),
            providerOptions: reasoning.providerOptions,
            messages: guardedMessages,
            temperature: 0.4,
            onChunk({ chunk }) {
              if (
                chunk.type === "reasoning-delta" ||
                chunk.type === "text-delta"
              ) {
                telemetry.markChunk(chunk.type);
              }
            },
            async onFinish({ usage, finishReason }) {
              await telemetry.record({
                status: finishReason === "error" ? "error" : "completed",
                usage,
                finishReason,
              });
            },
            async onAbort() {
              await telemetry.record({ status: "aborted" });
            },
            async onError({ error }) {
              console.error(
                "OpenRouter streaming error:",
                getAIErrorMessage(error),
              );
              await telemetry.record({ status: "error", error });
            },
          });

          const observedStream = result
            .toUIMessageStream({
              sendReasoning: true,
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
      headers: holdId ? { "x-credit-hold-id": holdId } : undefined,
    });
  } catch (error) {
    if (holdId) {
      await releaseCreditHold({ holdId });
    }
    console.error(
      "Failed to start completion stream:",
      getAIErrorMessage(error),
    );
    return new Response(getAIErrorMessage(error), {
      status: getAIErrorStatus(error),
    });
  }
}

export const runtime = "nodejs";
export const maxDuration = 300;
