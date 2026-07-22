"use client";

import {
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react/unstyled";
import { CheckIcon, CopyIcon, MousePointer2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getSandpackConfig } from "@/lib/sandpack-config";
import type { PreviewElementSelection } from "@/lib/targeted-preview-edit";
import type { RuntimeVerificationReport } from "@/features/generation/runtime-verification";
import type { SupabaseBrowserRuntimeState } from "@/features/integrations/supabase-browser-runtime";

const PREVIEW_INSPECTOR_SOURCE = "squid-preview-inspector";
const PREVIEW_PARENT_SOURCE = "squid-preview-parent";
const PREVIEW_HANDSHAKE_TIMEOUT_MS = 60_000;

export default function ReactCodeRunner({
  files,
  onRequestFix,
  onPreviewHealthChange,
  onPreviewSelection,
  previewSelectionMode = false,
  previewTestNonce = 0,
  onPreviewTestReport,
  supabaseRuntime,
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
  onPreviewTestReport?: (
    report: Omit<RuntimeVerificationReport, "messageId">,
  ) => void;
  supabaseRuntime?: SupabaseBrowserRuntimeState;
}) {
  const runtimeKey =
    supabaseRuntime?.status === "ready"
      ? `${supabaseRuntime.status}:${supabaseRuntime.config.url}:${supabaseRuntime.config.publishableKey}`
      : (supabaseRuntime?.status ?? "none");
  const filesKey = `${files.map((f) => f.path + f.content).join("")}:${runtimeKey}`;
  return (
    <SandpackProvider
      key={filesKey}
      className="relative h-full min-h-0 w-full min-w-0 overflow-hidden [&_.sp-preview-container]:flex [&_.sp-preview-container]:h-full [&_.sp-preview-container]:min-h-0 [&_.sp-preview-container]:w-full [&_.sp-preview-container]:min-w-0 [&_.sp-preview-container]:grow [&_.sp-preview-container]:flex-col [&_.sp-preview-container]:overflow-hidden [&_.sp-preview-iframe]:h-full [&_.sp-preview-iframe]:min-h-0 [&_.sp-preview-iframe]:w-full [&_.sp-preview-iframe]:min-w-0 [&_.sp-preview-iframe]:grow"
      {...getSandpackConfig(files, supabaseRuntime)}
    >
      <SandpackPreview
        showNavigator={false}
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
        showRestartButton={false}
        showOpenNewtab={false}
        className="h-full min-h-0 w-full min-w-0 overflow-hidden"
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
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const latchedErrorRef = useRef<string | null>(null);
  const currentError =
    sandpack.error?.message ??
    (sandpack.status === "timeout"
      ? "The preview timed out while compiling."
      : null);

  useEffect(() => {
    let retryTimer: number | undefined;
    const onMessage = (event: MessageEvent) => {
      const iframe = getPreviewIframe();
      if (
        event.source !== iframe?.contentWindow ||
        event.data?.source !== PREVIEW_INSPECTOR_SOURCE ||
        event.data?.type !== "ready"
      ) {
        return;
      }

      setIsPreviewReady(true);
      if (retryTimer !== undefined) window.clearInterval(retryTimer);
      iframe?.contentWindow?.postMessage(
        { source: PREVIEW_PARENT_SOURCE, type: "ready-ack" },
        "*",
      );
    };
    const pingPreview = () => {
      getPreviewIframe()?.contentWindow?.postMessage(
        { source: PREVIEW_PARENT_SOURCE, type: "ping" },
        "*",
      );
    };

    window.addEventListener("message", onMessage);
    pingPreview();
    retryTimer = window.setInterval(pingPreview, 250);
    const stopRetryTimer = window.setTimeout(
      () => window.clearInterval(retryTimer),
      PREVIEW_HANDSHAKE_TIMEOUT_MS,
    );

    return () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(retryTimer);
      window.clearTimeout(stopRetryTimer);
    };
  }, []);

  useEffect(() => {
    if (!currentError) return;

    latchedErrorRef.current = currentError;
    onChange({ status: "error", error: currentError });
  }, [currentError, onChange]);

  useEffect(() => {
    if (
      latchedErrorRef.current ||
      sandpack.error ||
      sandpack.status === "timeout" ||
      (!isPreviewReady && sandpack.status !== "done")
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!latchedErrorRef.current) {
        onChange({ status: "working" });
      }
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [currentError, isPreviewReady, onChange, sandpack.error, sandpack.status]);

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
  onPreviewTestReport?: (
    report: Omit<RuntimeVerificationReport, "messageId">,
  ) => void;
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
    const runtimeError = sandpack.error?.message;
    let settled = false;

    const finish = (report: Omit<RuntimeVerificationReport, "messageId">) => {
      if (settled) return;
      settled = true;
      onPreviewTestReport(report);
    };

    if (runtimeError) {
      finish({
        status: "failed",
        viewport: { width: 1, height: 1 },
        clickableElements: 0,
        unnamedClickableElements: 0,
        horizontalOverflow: false,
        runtimeError,
        checkedAt: new Date().toISOString(),
      });
      return;
    }

    const onMessage = (event: MessageEvent) => {
      const message = event.data;
      if (
        !message ||
        message.source !== PREVIEW_INSPECTOR_SOURCE ||
        message.type !== "runtime-test-report" ||
        message.requestId !== testNonce
      ) {
        return;
      }

      finish(message.report);
    };

    window.addEventListener("message", onMessage);
    iframe?.contentWindow?.postMessage(
      {
        source: PREVIEW_PARENT_SOURCE,
        type: "run-runtime-test",
        requestId: testNonce,
      },
      "*",
    );

    const unavailableTimer = window.setTimeout(() => {
      finish({
        status: "failed",
        viewport: { width: 1, height: 1 },
        clickableElements: 0,
        unnamedClickableElements: 0,
        horizontalOverflow: false,
        runtimeError: "Preview did not respond to the runtime test",
        checkedAt: new Date().toISOString(),
      });
    }, 2500);

    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(unavailableTimer);
    };
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextError = sandpack.error?.message;
    if (!nextError) return;

    // Sandpack may clear a compile error on the next render; retain it
    // synchronously so the user can still inspect and repair that failure.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(nextError);
  }, [sandpack.error]);

  if (!error) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 text-base backdrop-blur-sm">
      <div className="max-w-[400px] rounded-md bg-destructive p-4 text-destructive-foreground shadow-xl">
        <p className="text-lg font-medium">Error</p>

        <p className="mt-4 line-clamp-[10] overflow-x-auto whitespace-pre font-mono text-xs">
          {error}
        </p>

        <div className="mt-8 flex justify-between gap-4">
          <button
            type="button"
            onClick={async () => {
              setDidCopy(true);
              await window.navigator.clipboard.writeText(error);
              await new Promise((resolve) => setTimeout(resolve, 2000));
              setDidCopy(false);
            }}
            className="rounded border border-destructive/30 px-2.5 py-1.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/10"
          >
            {didCopy ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => onRequestFix(error)}
            className="rounded border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Fix error
          </button>
        </div>
      </div>
    </div>
  );
}
