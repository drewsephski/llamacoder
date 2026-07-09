import "server-only";

import { generateText } from "ai";
import { z } from "zod";
import { FREE_MODEL } from "@/lib/constants";
import {
  createAppOpenRouter,
  createOpenRouterModel,
  getAIErrorMessage,
  getOpenRouterProviderOptions,
} from "@/lib/openrouter";
import type { GeneratedFile } from "@/lib/generated-files";

const FOLLOW_UP_PROMPT_COUNT = 3;
const MAX_PROMPT_LENGTH = 90;
const MAX_CONTEXT_LENGTH = 4000;

const followUpPromptsSchema = z.object({
  prompts: z.array(z.string()).min(1).max(FOLLOW_UP_PROMPT_COUNT),
});

type PromptMessage = {
  role: string;
  content: string;
};

type PromptChat = {
  id: string;
  title: string;
  prompt: string;
  messages?: PromptMessage[];
};

type RawExecutor = {
  $executeRaw: (
    query: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<number>;
};

export function normalizeFollowUpPrompts(
  prompts: unknown,
  fallback: string[],
) {
  const candidates = Array.isArray(prompts) ? prompts : [];
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;

    const prompt = candidate
      .replace(/^[-*"'\s]+|[-*"'\s]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) continue;

    const key = prompt.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    normalized.push(prompt);

    if (normalized.length === FOLLOW_UP_PROMPT_COUNT) {
      return normalized;
    }
  }

  for (const prompt of fallback) {
    if (normalized.length === FOLLOW_UP_PROMPT_COUNT) break;
    const key = prompt.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(prompt);
  }

  return normalized;
}

export async function generateFollowUpPrompts({
  chat,
  assistantContent,
  files = [],
}: {
  chat: PromptChat;
  assistantContent: string;
  files?: GeneratedFile[];
}) {
  const fallback = buildFallbackPrompts(chat.title || chat.prompt);

  try {
    const openrouter = createAppOpenRouter({
      sessionId: chat.id,
      sessionName: "SquidAgent Follow-up Prompts",
    });

    const response = await generateText({
      model: createOpenRouterModel(openrouter, FREE_MODEL, {
        maxTokens: 300,
      }),
      providerOptions: getOpenRouterProviderOptions(FREE_MODEL),
      temperature: 0.45,
      messages: [
        {
          role: "system",
          content:
            "Generate concise follow-up prompts for an AI app builder. Return only JSON shaped as {\"prompts\":[\"...\"]}.",
        },
        {
          role: "user",
          content: buildPromptContext({ chat, assistantContent, files }),
        },
      ],
    });

    const parsed = parsePromptsJson(response.text);
    return normalizeFollowUpPrompts(parsed, fallback);
  } catch (error) {
    console.warn(
      "Follow-up prompt generation failed, using fallback prompts:",
      getAIErrorMessage(error),
    );
    return fallback;
  }
}

export async function saveMessageFollowUpPrompts(
  client: RawExecutor,
  messageId: string,
  prompts: string[],
) {
  if (prompts.length === 0) return;

  try {
    const promptsJson = JSON.stringify(prompts);
    await client.$executeRaw`
      UPDATE "Message"
      SET "followUpPrompts" = ${promptsJson}::jsonb
      WHERE "id" = ${messageId}
    `;
  } catch (error) {
    console.warn(
      "Failed to persist follow-up prompts:",
      getAIErrorMessage(error),
    );
  }
}

function buildPromptContext({
  chat,
  assistantContent,
  files,
}: {
  chat: PromptChat;
  assistantContent: string;
  files: GeneratedFile[];
}) {
  const recentMessages =
    chat.messages
      ?.filter((message) => message.role !== "system")
      .slice(-5)
      .map((message) => {
        const content = truncate(stripCodeBlocks(message.content), 500);
        return `${message.role}: ${content}`;
      })
      .join("\n") || "No prior conversation.";

  const fileSummary =
    files.length > 0
      ? files
          .slice(0, 12)
          .map((file) => `- ${file.path}: ${summarizeCode(file.code)}`)
          .join("\n")
      : "No generated files were detected.";

  return truncate(
    [
      "Create exactly 3 brief prompts the user can click to continue improving this generated app.",
      "Rules:",
      "- Each prompt must be specific to the current project and latest assistant response.",
      "- Keep each prompt under 90 characters.",
      "- Use direct user wording, not labels or explanations.",
      "- Prefer practical next edits: UI polish, interactions, data, responsive behavior, edge states.",
      "- Do not mention files, code blocks, JSON, models, credits, or implementation details.",
      "",
      `Project title: ${chat.title}`,
      `Original prompt: ${chat.prompt}`,
      "",
      "Recent conversation:",
      recentMessages,
      "",
      "Generated files:",
      fileSummary,
      "",
      "Latest assistant response summary:",
      truncate(stripCodeBlocks(assistantContent), 900),
    ].join("\n"),
    MAX_CONTEXT_LENGTH,
  );
}

function parsePromptsJson(text: string) {
  const trimmed = text.trim();
  const jsonText =
    trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() || trimmed;
  const json = JSON.parse(jsonText);
  if (Array.isArray(json)) return json;

  const parsed = followUpPromptsSchema.safeParse(json);
  return parsed.success ? parsed.data.prompts : [];
}

function buildFallbackPrompts(seed: string) {
  const subject = normalizeSubject(seed);

  return [
    `Polish the ${subject} UI`,
    `Add realistic ${subject} data`,
    `Make the ${subject} mobile-ready`,
  ];
}

function normalizeSubject(seed: string) {
  const words = seed
    .replace(/[^\w\s-]/g, " ")
    .replace(/\b(build|make|create|app|application|please|for|with|a|an|the)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 3)
    .join(" ")
    .toLowerCase();

  return words || "app";
}

function stripCodeBlocks(text: string) {
  return text.replace(/```[\s\S]*?```/g, "[code omitted]").trim();
}

function summarizeCode(code: string) {
  const compact = code
    .replace(/import[\s\S]*?;\n/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return truncate(compact, 180);
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}
