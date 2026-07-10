"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";

import type { CompletionStream } from "@/features/generation/client/completion-stream";

export type GenerationStreamError = {
  message: string;
  partialText: string;
  canRetry: boolean;
  failedMessageId?: string;
};

type GenerationStatus =
  | "idle"
  | "streaming"
  | "persisting"
  | "complete"
  | "error";

type GenerationSessionState = {
  status: GenerationStatus;
  streamPromise?: Promise<CompletionStream>;
  streamText: string;
  error: GenerationStreamError | null;
};

type GenerationSessionAction =
  | { type: "start"; streamPromise: Promise<CompletionStream> }
  | { type: "chunk"; streamText: string }
  | { type: "persist" }
  | { type: "complete" }
  | { type: "fail"; error: GenerationStreamError }
  | { type: "clear-error" };

function reducer(
  state: GenerationSessionState,
  action: GenerationSessionAction,
): GenerationSessionState {
  switch (action.type) {
    case "start":
      return {
        status: "streaming",
        streamPromise: action.streamPromise,
        streamText: "",
        error: null,
      };
    case "chunk":
      return { ...state, streamText: action.streamText };
    case "persist":
      return { ...state, status: "persisting" };
    case "complete":
      return {
        status: "complete",
        streamPromise: undefined,
        streamText: "",
        error: null,
      };
    case "fail":
      return {
        ...state,
        status: "error",
        streamPromise: undefined,
        error: action.error,
      };
    case "clear-error":
      return { ...state, status: "idle", error: null };
  }
}

export function useGenerationSession(
  initialStreamPromise?: Promise<CompletionStream>,
) {
  const [state, dispatch] = useReducer(reducer, {
    status: initialStreamPromise ? "streaming" : "idle",
    streamPromise: initialStreamPromise,
    streamText: "",
    error: null,
  });
  const frameRef = useRef<number | null>(null);
  const pendingStreamTextRef = useRef("");

  const cancelPendingFrame = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);
  const flushPendingText = useCallback(() => {
    cancelPendingFrame();
    dispatch({ type: "chunk", streamText: pendingStreamTextRef.current });
  }, [cancelPendingFrame]);
  const beginPersisting = useCallback(() => {
    flushPendingText();
    dispatch({ type: "persist" });
  }, [flushPendingText]);
  const clearError = useCallback(() => dispatch({ type: "clear-error" }), []);
  const complete = useCallback(() => {
    cancelPendingFrame();
    pendingStreamTextRef.current = "";
    dispatch({ type: "complete" });
  }, [cancelPendingFrame]);
  const fail = useCallback(
    (error: GenerationStreamError) => {
      cancelPendingFrame();
      pendingStreamTextRef.current = error.partialText;
      dispatch({ type: "fail", error });
    },
    [cancelPendingFrame],
  );
  const start = useCallback(
    (streamPromise: Promise<CompletionStream>) => {
      cancelPendingFrame();
      pendingStreamTextRef.current = "";
      dispatch({ type: "start", streamPromise });
    },
    [cancelPendingFrame],
  );
  const updateStreamText = useCallback((streamText: string) => {
    pendingStreamTextRef.current = streamText;
    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        dispatch({
          type: "chunk",
          streamText: pendingStreamTextRef.current,
        });
      });
    }
  }, []);

  useEffect(() => cancelPendingFrame, [cancelPendingFrame]);

  return {
    ...state,
    beginPersisting,
    clearError,
    complete,
    fail,
    start,
    updateStreamText,
  };
}
