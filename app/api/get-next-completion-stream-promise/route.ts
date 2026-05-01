import { getPrisma } from "@/lib/prisma";
import { z } from "zod";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { getModelWithFallbacks } from "@/lib/model-fallbacks";

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

export async function POST(req: Request) {
  const prisma = getPrisma();

  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }
  const { messageId, model } = parsed.data;

  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    return new Response(null, { status: 404 });
  }

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

  let options: Parameters<typeof createOpenRouter>[0] = {};
  if (process.env.HELICONE_API_KEY) {
    options.baseURL = "https://together.helicone.ai/v1";
    options.headers = {
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      "Helicone-Property-appname": "SquidCoder",
      "Helicone-Session-Id": message.chatId,
      "Helicone-Session-Name": "SquidCoder Chat",
    };
  }

  const openrouter = createOpenRouter(options);

  const models = getModelWithFallbacks(model);
  const res = streamText({
    model: openrouter(models[0], {
      maxTokens: 9000,
      models: models.length > 1 ? models.slice(1) : undefined,
    }),
    providerOptions: {
      openrouter: {
        reasoning: { enabled: false },
      },
    },
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: 0.4,
  });

  return res.toTextStreamResponse();
}

export const runtime = "nodejs";
export const maxDuration = 300;
