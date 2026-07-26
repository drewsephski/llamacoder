import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createAppOpenRouter, createOpenRouterModel } from "@/lib/openrouter";
import { DEFAULT_MODEL } from "@/lib/constants";
import { promptBuilderSystemPrompt } from "@/lib/prompts";
import { consumeRateLimit } from "@/features/security/server/rate-limit";

const MAX_HISTORY_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_PROMPT_CHARS = 8_000;

const enhancePromptSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "A non-empty prompt is required.")
    .max(MAX_PROMPT_CHARS, "Prompt is too long."),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
      }),
    )
    .max(MAX_HISTORY_MESSAGES)
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          error: "AUTHENTICATION_REQUIRED",
          message: "Sign in to enhance your prompt, then try again.",
        },
        { status: 401 },
      );
    }

    const rateLimit = await consumeRateLimit({
      userId: session.user.id,
      operation: "enhance_prompt",
      limit: 12,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: "Too many prompt enhancements. Please try again shortly.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    const parsed = enhancePromptSchema.safeParse(
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

    const { prompt, history = [] } = parsed.data;

    const openrouter = createAppOpenRouter({
      sessionId: `prompt-builder:${session.user.id}`,
      sessionName: "Prompt Builder",
    });

    const messages = history.map((message) => ({
      role: message.role,
      content: message.content,
    }));
    messages.push({ role: "user" as const, content: prompt });

    const model = createOpenRouterModel(openrouter, DEFAULT_MODEL, {
      maxTokens: 4096,
    });

    const { text } = await generateText({
      model,
      system: promptBuilderSystemPrompt,
      messages,
    });

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "The model returned an empty response. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ enhanced: text.trim() });
  } catch (error: unknown) {
    console.error("Error enhancing prompt:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return NextResponse.json(
      { error: "Failed to enhance prompt.", message },
      { status: 500 },
    );
  }
}
