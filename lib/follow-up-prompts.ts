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
const CANDIDATE_COUNT = 5;
const MAX_PROMPT_LENGTH = 90;
const MAX_CONTEXT_LENGTH = 4000;

const followUpPromptsSchema = z.object({
  prompts: z.array(z.string()).min(1).max(CANDIDATE_COUNT),
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

export function normalizeFollowUpPrompts(prompts: unknown, fallback: string[]) {
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

/**
 * Rank follow-up candidates by specificity to the current project state.
 *
 * Scoring factors:
 * - Contains the project title or a word from it (+3)
 * - References a concrete feature, component, or action (+2)
 * - Uses action verbs specific to app building (+1)
 * - Is a generic/polite suggestion (-1)
 */
function rankCandidate(
  candidate: string,
  projectTitle: string,
  assistantContent: string,
): number {
  let score = 0;
  const lower = candidate.toLowerCase();
  const titleWords = projectTitle
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  for (const word of titleWords) {
    if (lower.includes(word)) {
      score += 3;
      break;
    }
  }

  const specificPatterns = [
    /\b(?:add|create|build|implement|wire|connect|integrate|fix|repair|refactor)\b/i,
    /\b(?:loading|empty|error|success|disabled|hover|active|focus|dark|light|mobile|responsive|animation|transition|drag|drop|sort|filter|search|validate|submit|save|delete|edit|update|toggle|switch|select|upload|download|copy|paste|undo|redo)\b/i,
    /\b(?:dialog|drawer|modal|toast|tooltip|popover|menu|sidebar|navbar|header|footer|hero|card|table|list|grid|form|input|button|badge|avatar|tab|accordion|carousel)\b/i,
  ];

  for (const pattern of specificPatterns) {
    if (pattern.test(lower)) {
      score += 1;
    }
  }

  const genericPatterns = [
    /\b(?:please|could you|would you|can you|thanks|thank you)\b/i,
    /\b(?:make it better|improve it|make it nice|make it good)\b/i,
    /\b(?:the app|this app|the page|this page)\b/i,
  ];

  for (const pattern of genericPatterns) {
    if (pattern.test(lower)) {
      score -= 1;
    }
  }

  if (candidate.length < 20) {
    score -= 1;
  }

  return score;
}

/**
 * Extract previous follow-up prompts from recent messages for deduplication.
 */
function getPreviousFollowUpPrompts(messages?: PromptMessage[]): string[] {
  if (!messages) return [];

  const previous: string[] = [];
  for (const message of messages) {
    if (message.role === "assistant") {
      try {
        const parsed = JSON.parse(message.content);
        if (Array.isArray(parsed)) {
          for (const p of parsed) {
            if (typeof p === "string") previous.push(p.toLowerCase());
          }
        }
      } catch {
        // Not JSON, skip
      }
    }
  }

  return previous;
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

    const previousPrompts = getPreviousFollowUpPrompts(chat.messages);
    const previousContext =
      previousPrompts.length > 0
        ? `\n\nDo NOT repeat these previous follow-up prompts:\n${previousPrompts.map((p) => `- "${p}"`).join("\n")}`
        : "";

    const response = await generateText({
      model: createOpenRouterModel(openrouter, FREE_MODEL, {
        maxTokens: 400,
      }),
      providerOptions: getOpenRouterProviderOptions(FREE_MODEL),
      temperature: 0.5,
      system: dedentSystemPrompt(previousContext),
      prompt: buildPromptContext({ chat, assistantContent, files }),
    });

    const allCandidates = parsePromptsJson(response.text);

    const ranked = allCandidates
      .map((candidate) => ({
        text: candidate,
        score: rankCandidate(candidate, chat.title, assistantContent),
      }))
      .sort((a, b) => b.score - a.score);

    const deduplicated = deduplicateByOverlap(
      ranked.map((r) => r.text),
      previousPrompts,
    );

    return normalizeFollowUpPrompts(deduplicated, fallback);
  } catch (error) {
    console.warn(
      "Follow-up prompt generation failed, using fallback prompts:",
      getAIErrorMessage(error),
    );
    return fallback;
  }
}

function dedentSystemPrompt(previousContext: string): string {
  return `Generate exactly ${CANDIDATE_COUNT} brief prompts the user can click to continue improving this generated app. Return only JSON shaped as {"prompts":["prompt1","prompt2",...]}.

Rules:
- Generate exactly ${CANDIDATE_COUNT} candidates (we will pick the best 3).
- Each prompt must be specific to the current project and latest assistant response.
- Keep each prompt under ${MAX_PROMPT_LENGTH} characters.
- Use direct user wording, not labels or explanations.
- Prioritize practical next edits: UI polish, interactions, data, responsive behavior, edge states.
- Do not mention files, code blocks, JSON, models, credits, or implementation details.
- Vary the candidates: each should target a different improvement area.
- Lead with action verbs (Add, Make, Change, Fix, Improve, Build, Wire, etc.).
- Reference concrete UI elements, states, or behaviors, not abstract concepts.
${previousContext}`;
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
      `Project title: ${chat.title}`,
      `Original prompt: ${chat.prompt}`,
      "",
      "Recent conversation:",
      recentMessages,
      "",
      "Generated files:",
      fileSummary,
      "",
      "Latest assistant response:",
      truncate(stripCodeBlocks(assistantContent), 900),
    ].join("\n"),
    MAX_CONTEXT_LENGTH,
  );
}

function parsePromptsJson(text: string): string[] {
  const trimmed = text.trim();
  const jsonText =
    trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() || trimmed;

  try {
    const json = JSON.parse(jsonText);
    if (Array.isArray(json)) return json.filter((p) => typeof p === "string");

    const parsed = followUpPromptsSchema.safeParse(json);
    return parsed.success ? parsed.data.prompts : [];
  } catch {
    return [];
  }
}

/**
 * Remove candidates that are too semantically similar to each other or to
 * previously generated prompts. Uses simple word-overlap scoring.
 */
function deduplicateByOverlap(
  candidates: string[],
  previous: string[],
  similarityThreshold = 0.6,
): string[] {
  const kept: string[] = [];
  const allPrevious = previous.map(
    (p) => new Set(p.toLowerCase().split(/\s+/)),
  );

  for (const candidate of candidates) {
    const words = new Set(candidate.toLowerCase().split(/\s+/));

    const tooSimilarToPrevious = allPrevious.some((prevWords) => {
      const overlap = countOverlap(words, prevWords);
      const union = new Set([...words, ...prevWords]).size;
      return union > 0 && overlap / union >= similarityThreshold;
    });

    if (tooSimilarToPrevious) continue;

    const tooSimilarToKept = kept.some((keptText) => {
      const keptWords = new Set(keptText.toLowerCase().split(/\s+/));
      const overlap = countOverlap(words, keptWords);
      const union = new Set([...words, ...keptWords]).size;
      return union > 0 && overlap / union >= similarityThreshold;
    });

    if (tooSimilarToKept) continue;

    kept.push(candidate);

    if (kept.length >= FOLLOW_UP_PROMPT_COUNT) break;
  }

  return kept;
}

function countOverlap(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const word of a) {
    if (b.has(word)) count++;
  }
  return count;
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
    .replace(
      /\b(build|make|create|app|application|please|for|with|a|an|the)\b/gi,
      " ",
    )
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
