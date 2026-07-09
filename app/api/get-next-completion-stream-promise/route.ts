import { getPrisma } from "@/lib/prisma";
import { z } from "zod";
import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  GENERATED_CODE_MAX_TOKENS,
  createAppOpenRouter,
  createOpenRouterModel,
  getAIErrorMessage,
  getAIErrorStatus,
  getOpenRouterProviderOptions,
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

const requestSchema = z.object({
  messageId: z.string().min(1),
  model: z.string().min(1),
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
    const { messageId, model } = parsed.data;

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

    const result = streamText({
      model: createOpenRouterModel(openrouter, chatModel, {
        maxTokens: GENERATED_CODE_MAX_TOKENS,
      }),
      providerOptions: getOpenRouterProviderOptions(chatModel),
      messages: guardedMessages,
      temperature: 0.4,
      onError({ error }) {
        console.error("OpenRouter streaming error:", getAIErrorMessage(error));
      },
    });

    return createReadableTextStreamResponse(result.textStream, holdId);
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

function createReadableTextStreamResponse(
  textStream: AsyncIterable<string>,
  holdId?: string,
) {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          for await (const textPart of textStream) {
            controller.enqueue(encoder.encode(textPart));
          }
          controller.close();
        } catch (error) {
          console.error("Completion stream failed:", getAIErrorMessage(error));
          controller.error(new Error(getAIErrorMessage(error)));
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...(holdId ? { "x-credit-hold-id": holdId } : {}),
      },
    },
  );
}
