"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CompletionStream } from "@/features/generation/client/completion-stream";

type GenerationHandoffContextValue = {
  streamPromise?: Promise<CompletionStream>;
  setStreamPromise: (stream: Promise<CompletionStream> | undefined) => void;
};

const GenerationHandoffContext =
  createContext<GenerationHandoffContextValue | null>(null);

export function GenerationHandoffProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [streamPromise, setStreamPromise] =
    useState<Promise<CompletionStream>>();
  const value = useMemo(
    () => ({ streamPromise, setStreamPromise }),
    [streamPromise],
  );

  return (
    <GenerationHandoffContext.Provider value={value}>
      {children}
    </GenerationHandoffContext.Provider>
  );
}

export function useGenerationHandoff() {
  const context = useContext(GenerationHandoffContext);
  if (!context) {
    throw new Error(
      "useGenerationHandoff must be used within GenerationHandoffProvider",
    );
  }
  return context;
}

/**
 * Owns the stream currently handled by a chat page while continuing to listen
 * for a stream handed off during navigation. Context updates and route mounts
 * are scheduled independently, so reading the context only as a useState
 * initializer can permanently miss a first-message stream that arrives just
 * after the destination mounts.
 */
export function useGenerationHandoffStream() {
  const {
    streamPromise: handedOffStreamPromise,
    setStreamPromise: setHandedOffStreamPromise,
  } = useGenerationHandoff();
  const [streamPromise, setStreamPromise] = useState<
    Promise<CompletionStream> | undefined
  >(handedOffStreamPromise);

  useEffect(() => {
    if (!handedOffStreamPromise) return;

    // Never replace a stream that this page is already consuming. The handoff
    // is cleared by the consumer once it claims that exact stream.
    setStreamPromise((current) => current ?? handedOffStreamPromise);
  }, [handedOffStreamPromise]);

  return {
    streamPromise,
    setStreamPromise,
    setHandedOffStreamPromise,
  };
}
