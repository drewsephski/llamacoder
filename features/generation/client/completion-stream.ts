"use client";

import {
  parseJsonEventStream,
  uiMessageChunkSchema,
  type UIMessageChunk,
} from "ai";

export type CompletionStream = {
  events: ReadableStream<UIMessageChunk>;
  creditHoldId?: string;
  generationRunId?: string;
};

export async function fetchCompletionStream({
  messageId,
  model,
  screenshotData,
}: {
  messageId: string;
  model: string;
  screenshotData?: string;
}) {
  const response = await fetch("/api/get-next-completion-stream-promise", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messageId,
      model,
      screenshotData,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Failed to start generation");
  }

  if (!response.body) {
    throw new Error("Generation did not return a response body");
  }

  const events = parseJsonEventStream({
    stream: response.body,
    schema: uiMessageChunkSchema,
  }).pipeThrough(
    new TransformStream({
      transform(result, controller) {
        if (!result.success) {
          throw result.error;
        }
        controller.enqueue(result.value);
      },
    }),
  );

  return {
    events,
    creditHoldId: response.headers.get("x-credit-hold-id") || undefined,
    generationRunId:
      response.headers.get("x-generation-run-id") || undefined,
  };
}

export async function recoverCompletionStream(runId: string): Promise<CompletionStream> {
  const response = await fetch(`/api/generation-runs/${runId}`);
  const run = await response.json().catch(() => null);
  if (!response.ok || !run?.partialText) {
    throw new Error(run?.message || "No recoverable generation output was found");
  }

  const events = new ReadableStream<UIMessageChunk>({
    start(controller) {
      controller.enqueue({
        type: "text-delta",
        id: `recovered-${runId}`,
        delta: run.partialText,
      });
      controller.close();
    },
  });

  return {
    events,
    creditHoldId: run.creditHoldId || undefined,
    generationRunId: run.id,
  };
}

export async function updateGenerationRun(
  runId: string,
  body: { action: "cancel" } | { action: "complete"; assistantMessageId: string },
) {
  const response = await fetch(`/api/generation-runs/${runId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Unable to update the generation run");
}
