"use client";

import { CheckIcon, CopyIcon, RefreshCw, Wrench } from "lucide-react";
import { useState } from "react";

import { CometSpinner } from "@/components/loading-ui/comet-spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PreviewLifecycle =
  | { status: "loading" }
  | { status: "compiling" }
  | { status: "ready" }
  | { status: "error"; error: string }
  | { status: "timeout"; error: string };

export function PreviewStatusOverlay({
  lifecycle,
  onRequestFix,
  onRetry,
}: {
  lifecycle: PreviewLifecycle;
  onRequestFix?: (error: string) => void;
  onRetry: () => void;
}) {
  const [didCopy, setDidCopy] = useState(false);
  const isReady = lifecycle.status === "ready";
  const isTerminal =
    lifecycle.status === "error" || lifecycle.status === "timeout";
  const copy = getPreviewStatusCopy(lifecycle);
  const error = isTerminal ? lifecycle.error : null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-center bg-background/95 px-6 text-center backdrop-blur-sm transition-opacity duration-300 ease-out motion-reduce:transition-none",
        isReady ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      data-preview-status={lifecycle.status}
      data-testid="preview-status-overlay"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        {!isReady && !isTerminal ? (
          <CometSpinner
            aria-hidden="true"
            className="size-7 text-primary"
            role="presentation"
          />
        ) : null}

        <div
          aria-atomic="true"
          aria-live={isTerminal ? "assertive" : "polite"}
          className="space-y-1.5"
          role="status"
        >
          <p className="text-sm font-semibold text-foreground">{copy.title}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
        </div>

        {error && onRequestFix ? (
          <div className="w-full rounded-md border border-border bg-muted/40 p-3 text-left">
            <p className="line-clamp-[8] overflow-x-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
              {error}
            </p>
            <Button
              aria-label="Copy preview error"
              className="mt-3"
              onClick={async () => {
                setDidCopy(true);
                await window.navigator.clipboard.writeText(error);
                window.setTimeout(() => setDidCopy(false), 2_000);
              }}
              size="icon"
              type="button"
              variant="ghost"
            >
              {didCopy ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>
        ) : null}

        {isTerminal ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button onClick={onRetry} size="sm" type="button">
              <RefreshCw className="size-4" />
              Retry preview
            </Button>
            {error && onRequestFix ? (
              <Button
                onClick={() => onRequestFix(error)}
                size="sm"
                type="button"
                variant="outline"
              >
                <Wrench className="size-4" />
                Fix error
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getPreviewStatusCopy(lifecycle: PreviewLifecycle) {
  switch (lifecycle.status) {
    case "loading":
      return {
        title: "Loading preview",
        description: "Preparing an isolated environment for this app.",
      };
    case "compiling":
      return {
        title: "Compiling preview",
        description: "Building the app and checking that it can render safely.",
      };
    case "ready":
      return {
        title: "Preview ready",
        description: "The generated app is ready to use.",
      };
    case "error":
      return {
        title: "Preview couldn't start",
        description:
          "Squid couldn't compile this preview. Retry it to restart the isolated app.",
      };
    case "timeout":
      return {
        title: "Preview took too long",
        description:
          "The app did not become ready in time. Retry it to start a fresh preview.",
      };
  }
}
