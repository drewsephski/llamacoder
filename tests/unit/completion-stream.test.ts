import { createUIMessageStreamResponse, type UIMessageChunk } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchCompletionStream,
  recoverCompletionStream,
} from "@/features/generation/client/completion-stream";

describe("fetchCompletionStream", () => {
  afterEach(() => {
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

  it("replays persisted output without another model request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          id: "run_1",
          partialText: "```tsx{path=App.tsx}\nexport default function App(){}\n```",
          creditHoldId: "hold_1",
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
  });
});
