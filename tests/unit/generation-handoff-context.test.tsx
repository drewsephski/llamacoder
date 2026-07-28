// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import type { CompletionStream } from "@/features/generation/client/completion-stream";
import {
  GenerationHandoffProvider,
  useGenerationHandoff,
  useGenerationHandoffStream,
} from "@/features/generation/client/generation-handoff-context";

const wrapper = ({ children }: { children: ReactNode }) => (
  <GenerationHandoffProvider>{children}</GenerationHandoffProvider>
);

describe("useGenerationHandoffStream", () => {
  it("adopts a first-message stream handed off after the chat page mounts", async () => {
    const handedOffStream = Promise.resolve({} as CompletionStream);
    const { result } = renderHook(
      () => ({
        handoff: useGenerationHandoff(),
        session: useGenerationHandoffStream(),
      }),
      { wrapper },
    );

    expect(result.current.session.streamPromise).toBeUndefined();

    await act(async () => {
      result.current.handoff.setStreamPromise(handedOffStream);
    });

    expect(result.current.session.streamPromise).toBe(handedOffStream);
  });

  it("does not replace a stream the chat page is already consuming", async () => {
    const activeStream = Promise.resolve({} as CompletionStream);
    const lateHandoff = Promise.resolve({} as CompletionStream);
    const { result } = renderHook(
      () => ({
        handoff: useGenerationHandoff(),
        session: useGenerationHandoffStream(),
      }),
      { wrapper },
    );

    act(() => result.current.session.setStreamPromise(activeStream));
    await act(async () => {
      result.current.handoff.setStreamPromise(lateHandoff);
    });

    expect(result.current.session.streamPromise).toBe(activeStream);
  });
});
