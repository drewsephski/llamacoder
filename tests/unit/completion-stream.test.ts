import { createUIMessageStreamResponse, type UIMessageChunk } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  COMPLETION_IDLE_TIMEOUT_MS,
  COMPLETION_START_TIMEOUT_MS,
  fetchCompletionStream,
  fetchGenerationRun,
  finalizeGenerationRun,
  getCompletionStreamMessageId,
  recoverCompletionStream,
  retryCompletionStream,
} from "@/features/generation/client/completion-stream";

describe("fetchCompletionStream", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("parses UI-message SSE events and preserves the credit hold header", async () => {
    const events: UIMessageChunk[] = [
      { type: "reasoning-start", id: "reasoning_1" },
      {
        type: "reasoning-delta",
        id: "reasoning_1",
        delta: "Planning components",
      },
      { type: "reasoning-end", id: "reasoning_1" },
      { type: "text-start", id: "text_1" },
      { type: "text-delta", id: "text_1", delta: "Writing App.tsx" },
      { type: "text-end", id: "text_1" },
    ];
    const response = createUIMessageStreamResponse({
      stream: new ReadableStream<UIMessageChunk>({
        start(controller) {
          events.forEach((event) => controller.enqueue(event));
          controller.close();
        },
      }),
      headers: {
        "x-credit-hold-id": "hold_1",
        "x-generation-run-id": "run_1",
      },
    });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    const completion = await fetchCompletionStream({
      messageId: "message_1",
      model: "model_1",
      screenshotData: "data:image/png;base64,cG5n",
    });
    const received: UIMessageChunk[] = [];
    const reader = completion.events.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received.push(value);
    }

    expect(completion.creditHoldId).toBe("hold_1");
    expect(completion.generationRunId).toBe("run_1");
    expect(completion.messageId).toBe("message_1");
    expect(received).toEqual(events);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/get-next-completion-stream-promise",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: "message_1",
          model: "model_1",
          screenshotData: "data:image/png;base64,cG5n",
        }),
      }),
    );
  });

  it("fails a stalled start with retryable message identity", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }),
      ),
    );

    const pending = fetchCompletionStream({
      messageId: "message_timeout",
      model: "model_1",
    });
    const assertion = expect(pending).rejects.toMatchObject({
      message: "Squid couldn't start the response in time. Please retry.",
      messageId: "message_timeout",
    });

    await vi.advanceTimersByTimeAsync(COMPLETION_START_TIMEOUT_MS);
    await assertion;
    await expect(pending.catch(getCompletionStreamMessageId)).resolves.toBe(
      "message_timeout",
    );
  });

  it("fails a stream that stops producing events instead of hanging forever", async () => {
    vi.useFakeTimers();
    const response = createUIMessageStreamResponse({
      stream: new ReadableStream<UIMessageChunk>({
        start(controller) {
          controller.enqueue({
            type: "data-generation-status",
            data: { phase: "preparing", label: "Preparing" },
            transient: true,
          });
        },
      }),
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    const completion = await fetchCompletionStream({
      messageId: "message_idle",
      model: "model_1",
    });
    const reader = completion.events.getReader();
    await expect(reader.read()).resolves.toMatchObject({ done: false });

    const stalledRead = reader.read();
    const assertion = expect(stalledRead).rejects.toMatchObject({
      message: "The response stopped making progress. Please retry.",
      messageId: "message_idle",
    });
    await vi.advanceTimersByTimeAsync(COMPLETION_IDLE_TIMEOUT_MS);
    await assertion;
  });

  it("replays persisted output without another model request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          id: "run_1",
          messageId: "message_1",
          partialText:
            "```tsx{path=App.tsx}\nexport default function App(){}\n```",
          creditHoldId: "hold_1",
          recoveryMode: "restore",
        }),
      ),
    );

    const completion = await recoverCompletionStream("run_1");
    const reader = completion.events.getReader();
    const first = await reader.read();

    expect(first.value).toMatchObject({
      type: "text-delta",
      delta: expect.stringContaining("App.tsx"),
    });
    expect(completion.creditHoldId).toBe("hold_1");
    expect(completion.generationRunId).toBe("run_1");
    expect(completion.messageId).toBe("message_1");
  });

  it("cancels the interrupted run before retrying the same message", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ status: "cancelled" }))
      .mockResolvedValueOnce(
        createUIMessageStreamResponse({
          stream: new ReadableStream<UIMessageChunk>({
            start(controller) {
              controller.close();
            },
          }),
          headers: {
            "x-credit-hold-id": "hold_2",
            "x-generation-run-id": "run_2",
          },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const completion = await retryCompletionStream({
      messageId: "message_1",
      model: "model_1",
      generationRunId: "run_1",
    });

    expect(fetchMock.mock.calls).toEqual([
      [
        "/api/generation-runs/run_1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ action: "cancel" }),
        }),
      ],
      [
        "/api/get-next-completion-stream-promise",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            messageId: "message_1",
            model: "model_1",
          }),
        }),
      ],
    ]);
    expect(completion.messageId).toBe("message_1");
    expect(completion.generationRunId).toBe("run_2");
  });

  it("does not replay partial text that cannot produce an application", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          id: "run_1",
          messageId: "message_1",
          partialText: "I will start by creating the application shell.",
          recoveryMode: "restart",
        }),
      ),
    );

    await expect(recoverCompletionStream("run_1")).rejects.toThrow(
      "Restart the build to try again",
    );
  });

  it("surfaces the persisted provider error when a run has no output", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          id: "run_1",
          messageId: "message_1",
          partialText: "",
          errorMessage: "Upstream provider rate limited",
          recoveryMode: "restart",
        }),
      ),
    );

    await expect(recoverCompletionStream("run_1")).rejects.toThrow(
      "Upstream provider rate limited",
    );
  });

  it("loads the persisted generation run phase for stream finalization", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          id: "run_1",
          messageId: "message_1",
          status: "recoverable",
          phase: "validation_repair",
          label: "Fixing generated app",
          partialText:
            "```tsx{path=App.tsx}\nexport default function App(){}\n```",
          recoveryMode: "restore",
        }),
      ),
    );

    const run = await fetchGenerationRun("run_1");

    expect(run.phase).toBe("validation_repair");
    expect(run.partialText).toContain("App.tsx");
  });

  it("asks the server-owned workflow to finalize a generated app", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        message: {
          id: "assistant_1",
          chatId: "chat_1",
          role: "assistant",
          content: "Generated app",
          files: [],
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const message = await finalizeGenerationRun("run_1");

    expect(message.id).toBe("assistant_1");
    expect(fetchMock).toHaveBeenCalledWith("/api/generation-runs/run_1", {
      method: "POST",
    });
  });
});
