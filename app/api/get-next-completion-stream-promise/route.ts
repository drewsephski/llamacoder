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
} from "@/lib/openrouter";

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
- Do not invent imports such as "@/lib/hooks/*", "@/hooks/*", or "@/utils/*". Use relative imports for generated files.
- Shadcn imports under "@/components/ui/*" and "@/lib/utils" are already installed and should not be redefined.
- For Framer Motion, import lowercase motion: import { motion } from "framer-motion".
`;

export async function POST(req: Request) {
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

    const messagesRes = await prisma.message.findMany({
      where: { chatId: message.chatId, position: { lte: message.position } },
      orderBy: { position: "asc" },
    });

    let messages = z
      .array(
        z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        }),
      )
      .parse(messagesRes);

    messages = optimizeMessagesForTokens(messages);

    if (messages.length > 10) {
      messages = [messages[0], messages[1], messages[2], ...messages.slice(-7)];
    }

    const openrouter = createAppOpenRouter({
      sessionId: message.chatId,
      sessionName: "SquidAgent Chat",
    });

    const guardedMessages = messages.map((m) => ({
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

    const result = streamText({
      model: createOpenRouterModel(openrouter, chatModel, {
        maxTokens: GENERATED_CODE_MAX_TOKENS,
      }),
      providerOptions: {
        openrouter: {
          reasoning: { enabled: false },
        },
      },
      messages: guardedMessages,
      temperature: 0.4,
      onError({ error }) {
        console.error("OpenRouter streaming error:", getAIErrorMessage(error));
      },
    });

    return createReadableTextStreamResponse(result.textStream);
  } catch (error) {
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

function createReadableTextStreamResponse(textStream: AsyncIterable<string>) {
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
      },
    },
  );
}
