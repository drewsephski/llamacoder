"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CompletionStream } from "@/features/generation/client/completion-stream";

type StreamPromise = Promise<CompletionStream>;
type StreamPromiseListener = (streamPromise: StreamPromise) => void;

type GenerationHandoffContextValue = {
  claimStreamPromise: (streamPromise: StreamPromise) => boolean;
  setStreamPromise: (streamPromise: StreamPromise | undefined) => void;
  subscribeToStreamPromise: (listener: StreamPromiseListener) => () => void;
};

const GenerationHandoffContext =
  createContext<GenerationHandoffContextValue | null>(null);

export function GenerationHandoffProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pendingStreamPromiseRef = useRef<StreamPromise | undefined>(undefined);
  const listenersRef = useRef(new Set<StreamPromiseListener>());

  const claimStreamPromise = useCallback((streamPromise: StreamPromise) => {
    if (pendingStreamPromiseRef.current !== streamPromise) return false;

    pendingStreamPromiseRef.current = undefined;
    return true;
  }, []);

  const setStreamPromise = useCallback(
    (streamPromise: StreamPromise | undefined) => {
      pendingStreamPromiseRef.current = streamPromise;
      if (!streamPromise) return;

      for (const listener of listenersRef.current) {
        listener(streamPromise);
      }
    },
    [],
  );

  const subscribeToStreamPromise = useCallback(
    (listener: StreamPromiseListener) => {
      listenersRef.current.add(listener);

      const pendingStreamPromise = pendingStreamPromiseRef.current;
      if (pendingStreamPromise) {
        listener(pendingStreamPromise);
      }

      return () => {
        listenersRef.current.delete(listener);
      };
    },
    [],
  );

  const value = useMemo(
    () => ({
      claimStreamPromise,
      setStreamPromise,
      subscribeToStreamPromise,
    }),
    [claimStreamPromise, setStreamPromise, subscribeToStreamPromise],
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
 * for a stream handed off during navigation. The provider behaves as a mailbox:
 * an offered stream remains pending until one mounted destination claims that
 * exact promise. A destination with an active stream discards, but never adopts,
 * a late offer.
 */
export function useGenerationHandoffStream() {
  const { claimStreamPromise, subscribeToStreamPromise } =
    useGenerationHandoff();
  const [streamPromise, setOwnedStreamPromise] = useState<StreamPromise>();
  const ownedStreamPromiseRef = useRef<StreamPromise | undefined>(undefined);

  const setStreamPromise = useCallback(
    (nextStreamPromise: StreamPromise | undefined) => {
      ownedStreamPromiseRef.current = nextStreamPromise;
      setOwnedStreamPromise(nextStreamPromise);
    },
    [],
  );

  useEffect(
    () =>
      subscribeToStreamPromise((offeredStreamPromise) => {
        if (ownedStreamPromiseRef.current) {
          claimStreamPromise(offeredStreamPromise);
          return;
        }
        if (!claimStreamPromise(offeredStreamPromise)) return;

        ownedStreamPromiseRef.current = offeredStreamPromise;
        setOwnedStreamPromise(offeredStreamPromise);
      }),
    [claimStreamPromise, subscribeToStreamPromise],
  );

  return {
    streamPromise,
    setStreamPromise,
  };
}
