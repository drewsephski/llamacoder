// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useGenerationSession } from "@/features/generation/client/use-generation-session";
import type { CompletionStream } from "@/features/generation/client/completion-stream";

function createStreamPromise() {
  return Promise.resolve({
    events: new ReadableStream(),
  } satisfies CompletionStream);
}

describe("useGenerationSession", () => {
  it("models streaming, persistence, completion, and retry explicitly", async () => {
    const { result } = renderHook(() => useGenerationSession());
    const streamPromise = createStreamPromise();

    act(() => result.current.start(streamPromise));
    expect(result.current.status).toBe("streaming");
    expect(result.current.streamPromise).toBe(streamPromise);

    act(() => {
      result.current.updateStreamText("part");
      result.current.updateStreamText("partial");
    });
    await waitFor(() => expect(result.current.streamText).toBe("partial"));

    act(() => result.current.beginPersisting());
    expect(result.current.status).toBe("persisting");

    act(() => result.current.complete());
    expect(result.current.status).toBe("complete");
    expect(result.current.streamText).toBe("");
    expect(result.current.streamPromise).toBeUndefined();

    act(() =>
      result.current.fail({
        message: "Disconnected",
        partialText: "partial",
        canRetry: true,
      }),
    );
    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Disconnected");

    act(() => result.current.clearError());
    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });
});
