"use client";

import type { ProjectMessage } from "@/features/projects/contracts";
import {
  parseJsonEventStream,
  uiMessageChunkSchema,
  type UIMessageChunk,
} from "ai";

export type CompletionStream = {
  events: ReadableStream<UIMessageChunk>;
  messageId: string;
  creditHoldId?: string;
  generationRunId?: string;
};

export const COMPLETION_START_TIMEOUT_MS = 30_000;
export const COMPLETION_IDLE_TIMEOUT_MS = 75_000;

export class CompletionStreamError extends Error {
  constructor(
    message: string,
    public readonly messageId: string,
  ) {
    super(message);
    this.name = "CompletionStreamError";
  }
}

export function getCompletionStreamMessageId(error: unknown) {
  return error instanceof CompletionStreamError ? error.messageId : undefined;
}

function toCompletionStreamError(
  error: unknown,
  messageId: string,
  fallback: string,
) {
  if (error instanceof CompletionStreamError) return error;
  return new CompletionStreamError(
    error instanceof Error && error.name !== "AbortError"
      ? error.message
      : fallback,
    messageId,
  );
}

function withIdleTimeout({
  stream,
  messageId,
  abort,
}: {
  stream: ReadableStream<UIMessageChunk>;
  messageId: string;
  abort: () => void;
}) {
  let reader: ReadableStreamDefaultReader<UIMessageChunk> | null = null;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let settled = false;

  const clearIdleTimeout = () => {
    if (timeout) clearTimeout(timeout);
    timeout = undefined;
  };

  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      reader = stream.getReader();
      const scheduleIdleTimeout = () => {
        clearIdleTimeout();
        timeout = setTimeout(() => {
          if (settled) return;
          settled = true;
          const error = new CompletionStreamError(
            "The response stopped making progress. Please retry.",
            messageId,
          );
          abort();
          void reader?.cancel(error).catch(() => undefined);
          controller.error(error);
        }, COMPLETION_IDLE_TIMEOUT_MS);
      };

      scheduleIdleTimeout();
      try {
        while (!settled) {
          const next = await reader.read();
          if (next.done) {
            settled = true;
            clearIdleTimeout();
            controller.close();
            return;
          }
          controller.enqueue(next.value);
          scheduleIdleTimeout();
        }
      } catch (error) {
        if (settled) return;
        settled = true;
        clearIdleTimeout();
        controller.error(
          toCompletionStreamError(
            error,
            messageId,
            "The response connection was interrupted. Please retry.",
          ),
        );
      }
    },
    async cancel(reason) {
      settled = true;
      clearIdleTimeout();
      abort();
      await reader?.cancel(reason).catch(() => undefined);
    },
  });
}

export type GenerationRunSnapshot = {
  id: string;
  messageId: string;
  status: string;
  phase: string;
  label: string;
  partialText: string;
  creditHoldId?: string;
  errorMessage?: string;
  assistantMessageId?: string;
};

export async function fetchGenerationRun(
  runId: string,
): Promise<GenerationRunSnapshot> {
  const response = await fetch(`/api/generation-runs/${runId}`);
  const run = await response.json().catch(() => null);
  if (!response.ok || !run?.id) {
    throw new Error(
      run?.errorMessage ||
        run?.message ||
        "Unable to load the generation run state",
    );
  }
  return run as GenerationRunSnapshot;
}

export async function fetchCompletionStream({
  messageId,
  model,
  screenshotData,
}: {
  messageId: string;
  model: string;
  screenshotData?: string;
}) {
  const abortController = new AbortController();
  let startTimedOut = false;
  const startTimeout = setTimeout(() => {
    startTimedOut = true;
    abortController.abort();
  }, COMPLETION_START_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("/api/get-next-completion-stream-promise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId,
        model,
        screenshotData,
      }),
      signal: abortController.signal,
    });
  } catch (error) {
    throw toCompletionStreamError(
      error,
      messageId,
      startTimedOut
        ? "Squid couldn't start the response in time. Please retry."
        : "Unable to connect to the generation service. Please retry.",
    );
  } finally {
    clearTimeout(startTimeout);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new CompletionStreamError(
      errorText || "Failed to start generation",
      messageId,
    );
  }

  if (!response.body) {
    throw new CompletionStreamError(
      "Generation did not return a response body",
      messageId,
    );
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
    events: withIdleTimeout({
      stream: events,
      messageId,
      abort: () => abortController.abort(),
    }),
    messageId,
    creditHoldId: response.headers.get("x-credit-hold-id") || undefined,
    generationRunId: response.headers.get("x-generation-run-id") || undefined,
  };
}

export async function recoverCompletionStream(
  runId: string,
): Promise<CompletionStream> {
  const response = await fetch(`/api/generation-runs/${runId}`);
  const run = await response.json().catch(() => null);
  if (!response.ok || !run?.partialText) {
    throw new Error(
      run?.errorMessage ||
        run?.message ||
        "No recoverable generation output was found",
    );
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
    messageId: run.messageId,
    creditHoldId: run.creditHoldId || undefined,
    generationRunId: run.id,
  };
}

export async function retryCompletionStream({
  messageId,
  model,
  generationRunId,
}: {
  messageId: string;
  model: string;
  generationRunId?: string;
}) {
  if (generationRunId) {
    await updateGenerationRun(generationRunId, { action: "cancel" });
  }

  return fetchCompletionStream({ messageId, model });
}

export async function finalizeGenerationRun(
  runId: string,
): Promise<ProjectMessage> {
  const response = await fetch(`/api/generation-runs/${runId}`, {
    method: "POST",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.message?.id) {
    throw new Error(
      payload?.message ||
        payload?.error ||
        "Unable to finalize the generated app",
    );
  }
  return payload.message as ProjectMessage;
}

export async function updateGenerationRun(
  runId: string,
  body: { action: "cancel" },
) {
  const response = await fetch(`/api/generation-runs/${runId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Unable to update the generation run");
}
