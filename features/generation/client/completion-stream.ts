"use client";

import {
  parseJsonEventStream,
  uiMessageChunkSchema,
  type UIMessageChunk,
} from "ai";

export type CompletionStream = {
  events: ReadableStream<UIMessageChunk>;
  creditHoldId?: string;
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
  };
}
