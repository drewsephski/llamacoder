import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createAppOpenRouter, createOpenRouterModel } from "@/lib/openrouter";
import { DEFAULT_MODEL } from "@/lib/constants";
import { promptBuilderSystemPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, history } = body as {
      prompt?: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "A non-empty prompt is required." },
        { status: 400 },
      );
    }

    const openrouter = createAppOpenRouter({
      sessionId: "prompt-builder",
      sessionName: "Prompt Builder",
    });

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === "user" || msg.role === "assistant") {
          if (
            typeof msg.content === "string" &&
            msg.content.trim().length > 0
          ) {
            messages.push({ role: msg.role, content: msg.content });
          }
        }
      }
    }

    messages.push({ role: "user", content: prompt });

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
