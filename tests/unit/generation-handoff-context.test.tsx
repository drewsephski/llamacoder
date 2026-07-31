// @vitest-environment jsdom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { type ReactNode, useState } from "react";
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

function StreamConsumer() {
  const { streamPromise } = useGenerationHandoffStream();

  return (
    <output data-testid="claimed-stream">
      {streamPromise ? "claimed" : "empty"}
    </output>
  );
}

function ConditionalConsumerHarness({
  streamPromise,
}: {
  streamPromise: Promise<CompletionStream>;
}) {
  const handoff = useGenerationHandoff();
  const [isConsumerMounted, setIsConsumerMounted] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => handoff.setStreamPromise(streamPromise)}
      >
        Offer stream
      </button>
      <button
        type="button"
        onClick={() => setIsConsumerMounted((current) => !current)}
      >
        Toggle consumer
      </button>
      {isConsumerMounted ? <StreamConsumer /> : null}
    </>
  );
}

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

  it("claims a stream offered before mount exactly once", async () => {
    const handedOffStream = Promise.resolve({} as CompletionStream);

    render(
      <GenerationHandoffProvider>
        <ConditionalConsumerHarness streamPromise={handedOffStream} />
      </GenerationHandoffProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Offer stream" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle consumer" }));
    expect(await screen.findByText("claimed")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Toggle consumer" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle consumer" }));
    expect(await screen.findByText("empty")).toBeInTheDocument();
  });

  it("returns stable stream ownership actions", () => {
    const { result, rerender } = renderHook(
      () => ({
        handoff: useGenerationHandoff(),
        session: useGenerationHandoffStream(),
      }),
      { wrapper },
    );
    const setHandedOffStreamPromise = result.current.handoff.setStreamPromise;
    const setOwnedStreamPromise = result.current.session.setStreamPromise;

    rerender();

    expect(result.current.handoff.setStreamPromise).toBe(
      setHandedOffStreamPromise,
    );
    expect(result.current.session.setStreamPromise).toBe(setOwnedStreamPromise);
  });
});
