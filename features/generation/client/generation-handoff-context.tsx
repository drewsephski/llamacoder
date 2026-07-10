"use client";

import {
  createContext,
  type ReactNode,
  useContext,
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
