"use client";

import {
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react/unstyled";
import { CheckIcon, CopyIcon, MousePointer2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSandpackConfig } from "@/lib/sandpack-config";
import type { PreviewElementSelection } from "@/lib/targeted-preview-edit";

const PREVIEW_INSPECTOR_SOURCE = "squid-preview-inspector";
const PREVIEW_PARENT_SOURCE = "squid-preview-parent";

export default function ReactCodeRunner({
  files,
  onRequestFix,
  onPreviewHealthChange,
  onPreviewSelection,
  previewSelectionMode = false,
  previewTestNonce = 0,
  onPreviewTestReport,
}: {
  files: Array<{ path: string; content: string }>;
  onRequestFix?: (e: string) => void;
  onPreviewHealthChange?: (health: {
    status: "working" | "error";
    error?: string;
  }) => void;
  onPreviewSelection?: (selection: PreviewElementSelection) => void;
  previewSelectionMode?: boolean;
  previewTestNonce?: number;
  onPreviewTestReport?: (report: string) => void;
}) {
  const filesKey = files.map((f) => f.path + f.content).join("");
  return (
    <SandpackProvider
      key={filesKey}
      className="relative h-full w-full [&_.sp-preview-container]:flex [&_.sp-preview-container]:h-full [&_.sp-preview-container]:w-full [&_.sp-preview-container]:grow [&_.sp-preview-container]:flex-col [&_.sp-preview-container]:justify-center [&_.sp-preview-iframe]:grow"
      {...getSandpackConfig(files)}
    >
      <SandpackPreview
        showNavigator={false}
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
        showRestartButton={false}
        showOpenNewtab={false}
        className="h-full w-full"
      />
      {onRequestFix && <ErrorMessage onRequestFix={onRequestFix} />}
      {onPreviewHealthChange && (
        <PreviewHealthReporter onChange={onPreviewHealthChange} />
      )}
      {(onPreviewSelection || onPreviewTestReport) && (
        <PreviewInspector
          selectionMode={previewSelectionMode}
          testNonce={previewTestNonce}
          onPreviewSelection={onPreviewSelection}
          onPreviewTestReport={onPreviewTestReport}
        />
      )}
    </SandpackProvider>
  );
}

function PreviewHealthReporter({
  onChange,
}: {
  onChange: (health: { status: "working" | "error"; error?: string }) => void;
}) {
  const { sandpack } = useSandpack();

  useEffect(() => {
    if (
      sandpack.status !== "done" &&
      sandpack.status !== "timeout" &&
      !sandpack.error
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const error =
        sandpack.error?.message ??
        (sandpack.status === "timeout"
          ? "The preview timed out while compiling."
          : undefined);

      onChange(error ? { status: "error", error } : { status: "working" });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [onChange, sandpack.error, sandpack.status]);

  return null;
}

function PreviewInspector({
  selectionMode,
  testNonce,
  onPreviewSelection,
  onPreviewTestReport,
}: {
  selectionMode: boolean;
  testNonce: number;
  onPreviewSelection?: (selection: PreviewElementSelection) => void;
  onPreviewTestReport?: (report: string) => void;
}) {
  const { sandpack } = useSandpack();

  useEffect(() => {
    if (!onPreviewSelection) return;

    const onMessage = (event: MessageEvent) => {
      const message = event.data;
      if (
        !message ||
        message.source !== PREVIEW_INSPECTOR_SOURCE ||
        message.type !== "selected"
      ) {
        return;
      }

      onPreviewSelection(message.selection);
    };

    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [onPreviewSelection]);

  useEffect(() => {
    const sendSelectionMode = () => {
      getPreviewIframe()?.contentWindow?.postMessage(
        {
          source: PREVIEW_PARENT_SOURCE,
          type: "set-selection-mode",
          enabled: selectionMode,
        },
        "*",
      );
    };

    sendSelectionMode();
    const retryTimer = window.setInterval(sendSelectionMode, 250);
    const stopRetryTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 5000);

    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopRetryTimer);
      if (selectionMode) {
        getPreviewIframe()?.contentWindow?.postMessage(
          {
            source: PREVIEW_PARENT_SOURCE,
            type: "set-selection-mode",
            enabled: false,
          },
          "*",
        );
      }
    };
  }, [selectionMode]);

  useEffect(() => {
    if (!testNonce || !onPreviewTestReport) return;

    const iframe = getPreviewIframe();
    const doc = iframe?.contentDocument;
    const runtimeError = sandpack.error?.message;

    if (!doc) {
      onPreviewTestReport("Preview unavailable");
      return;
    }

    const clickableElements = Array.from(
      doc.querySelectorAll(
        "button, a, input, select, textarea, [role='button']",
      ),
    );
    const unnamedClickableCount = clickableElements.filter((element) => {
      const label =
        element.getAttribute("aria-label") ||
        element.getAttribute("title") ||
        element.textContent;

      return !label?.replace(/\s+/g, " ").trim();
    }).length;
    const hasHorizontalOverflow =
      doc.documentElement.scrollWidth > doc.documentElement.clientWidth + 8;
    const status =
      runtimeError || unnamedClickableCount > 0 || hasHorizontalOverflow
        ? "Review"
        : "Passed";

    onPreviewTestReport(
      `${status}: ${clickableElements.length} clickable elements, ${
        unnamedClickableCount || "no"
      } unnamed, ${runtimeError ? "runtime error" : "no runtime error"}, ${
        hasHorizontalOverflow ? "mobile overflow risk" : "no overflow detected"
      }`,
    );
  }, [testNonce, onPreviewTestReport, sandpack.error]);

  if (!selectionMode) return null;

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-background px-2.5 py-1.5 text-xs font-medium text-primary shadow-sm">
      <MousePointer2 className="size-3" />
      Select an element
    </div>
  );
}

function getPreviewIframe() {
  return document.querySelector<HTMLIFrameElement>(".sp-preview-iframe");
}

function ErrorMessage({ onRequestFix }: { onRequestFix: (e: string) => void }) {
  const { sandpack } = useSandpack();
  const [didCopy, setDidCopy] = useState(false);

  if (!sandpack.error) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 text-base backdrop-blur-sm">
      <div className="max-w-[400px] rounded-md bg-destructive p-4 text-destructive-foreground shadow-xl">
        <p className="text-lg font-medium">Error</p>

        <p className="mt-4 line-clamp-[10] overflow-x-auto whitespace-pre font-mono text-xs">
          {sandpack.error.message}
        </p>

        <div className="mt-8 flex justify-between gap-4">
          <button
            onClick={async () => {
              if (!sandpack.error) return;

              setDidCopy(true);
              await window.navigator.clipboard.writeText(
                sandpack.error.message,
              );
              await new Promise((resolve) => setTimeout(resolve, 2000));
              setDidCopy(false);
            }}
            className="rounded border border-destructive/30 px-2.5 py-1.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/10"
          >
            {didCopy ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
          </button>
          <button
            onClick={() => {
              if (!sandpack.error) return;
              onRequestFix(sandpack.error.message);
            }}
            className="rounded border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Try to fix
          </button>
        </div>
      </div>
    </div>
  );
}
