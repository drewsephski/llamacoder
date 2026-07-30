"use client";

import {
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react/unstyled";
import { MousePointer2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { getSandpackConfig } from "@/lib/sandpack-config";
import { preflightGeneratedAppImports } from "@/lib/generated-app-dependencies";
import type { PreviewElementSelection } from "@/lib/targeted-preview-edit";
import type { RuntimeVerificationReport } from "@/features/generation/runtime-verification";
import type { SupabaseBrowserRuntimeState } from "@/features/integrations/supabase-browser-runtime";
import {
  PreviewStatusOverlay,
  type PreviewLifecycle,
} from "@/components/preview-status-overlay";

const PREVIEW_INSPECTOR_SOURCE = "squid-preview-inspector";
const PREVIEW_PARENT_SOURCE = "squid-preview-parent";
const PREVIEW_HANDSHAKE_TIMEOUT_MS = 60_000;
const PREVIEW_STABILIZATION_MS = 1_500;
const INITIAL_PREVIEW_LIFECYCLE = { status: "loading" } as const;

export default function ReactCodeRunner({
  files,
  onRequestFix,
  onPreviewHealthChange,
  onPreviewLifecycleChange,
  onPreviewSelection,
  previewSelectionMode = false,
  previewTestNonce = 0,
  onPreviewTestReport,
  supabaseRuntime,
  showStatusOverlay = true,
}: {
  files: Array<{ path: string; content: string }>;
  onRequestFix?: (e: string) => void;
  onPreviewHealthChange?: (health: {
    status: "working" | "error";
    error?: string;
  }) => void;
  onPreviewLifecycleChange?: (lifecycle: PreviewLifecycle) => void;
  onPreviewSelection?: (selection: PreviewElementSelection) => void;
  previewSelectionMode?: boolean;
  previewTestNonce?: number;
  onPreviewTestReport?: (
    report: Omit<RuntimeVerificationReport, "messageId">,
  ) => void;
  supabaseRuntime?: SupabaseBrowserRuntimeState;
  showStatusOverlay?: boolean;
}) {
  const runtimeKey =
    supabaseRuntime?.status === "ready"
      ? `${supabaseRuntime.status}:${supabaseRuntime.config.url}:${supabaseRuntime.config.publishableKey}`
      : (supabaseRuntime?.status ?? "none");
  const filesKey = `${files.map((f) => f.path + f.content).join("")}:${runtimeKey}`;
  const [retryAttempt, setRetryAttempt] = useState(0);
  const retryPreview = useCallback(() => {
    onPreviewLifecycleChange?.(INITIAL_PREVIEW_LIFECYCLE);
    setRetryAttempt((attempt) => attempt + 1);
  }, [onPreviewLifecycleChange]);
  const preflight = preflightGeneratedAppImports(
    files.map(({ path, content }) => ({ path, code: content })),
  );
  const preflightDiagnostic = preflight.diagnostics[0];

  if (preflightDiagnostic) {
    const error = `${preflightDiagnostic.message}${preflightDiagnostic.path ? ` File: ${preflightDiagnostic.path}.` : ""}`;

    return (
      <PreflightFailure
        key={retryAttempt}
        error={error}
        onPreviewHealthChange={onPreviewHealthChange}
        onPreviewLifecycleChange={onPreviewLifecycleChange}
        onRequestFix={onRequestFix}
        onRetry={retryPreview}
      />
    );
  }

  return (
    <PreviewAttempt
      key={`${filesKey}:${retryAttempt}`}
      files={files}
      onRequestFix={onRequestFix}
      onPreviewHealthChange={onPreviewHealthChange}
      onPreviewLifecycleChange={onPreviewLifecycleChange}
      onPreviewSelection={onPreviewSelection}
      previewSelectionMode={previewSelectionMode}
      previewTestNonce={previewTestNonce}
      onPreviewTestReport={onPreviewTestReport}
      supabaseRuntime={supabaseRuntime}
      showStatusOverlay={showStatusOverlay}
      onRetry={retryPreview}
    />
  );
}

function PreflightFailure({
  error,
  onPreviewHealthChange,
  onPreviewLifecycleChange,
  onRequestFix,
  onRetry,
}: {
  error: string;
  onPreviewHealthChange?: (health: {
    status: "working" | "error";
    error?: string;
  }) => void;
  onPreviewLifecycleChange?: (lifecycle: PreviewLifecycle) => void;
  onRequestFix?: (error: string) => void;
  onRetry: () => void;
}) {
  useLayoutEffect(() => {
    onPreviewLifecycleChange?.({ status: "error", error });
    onPreviewHealthChange?.({ status: "error", error });
  }, [error, onPreviewHealthChange, onPreviewLifecycleChange]);

  return (
    <div
      className="relative h-full min-h-0 w-full min-w-0 overflow-hidden"
      data-preview-runner-root
    >
      <PreviewStatusOverlay
        lifecycle={{ status: "error", error }}
        onRequestFix={onRequestFix}
        onRetry={onRetry}
      />
    </div>
  );
}

function PreviewAttempt({
  files,
  onRequestFix,
  onPreviewHealthChange,
  onPreviewLifecycleChange,
  onPreviewSelection,
  previewSelectionMode,
  previewTestNonce,
  onPreviewTestReport,
  supabaseRuntime,
  showStatusOverlay,
  onRetry,
}: {
  files: Array<{ path: string; content: string }>;
  onRequestFix?: (error: string) => void;
  onPreviewHealthChange?: (health: {
    status: "working" | "error";
    error?: string;
  }) => void;
  onPreviewLifecycleChange?: (lifecycle: PreviewLifecycle) => void;
  onPreviewSelection?: (selection: PreviewElementSelection) => void;
  previewSelectionMode: boolean;
  previewTestNonce: number;
  onPreviewTestReport?: (
    report: Omit<RuntimeVerificationReport, "messageId">,
  ) => void;
  supabaseRuntime?: SupabaseBrowserRuntimeState;
  showStatusOverlay: boolean;
  onRetry: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [lifecycle, setLifecycle] = useState<PreviewLifecycle>(
    INITIAL_PREVIEW_LIFECYCLE,
  );
  const lifecycleRef = useRef<PreviewLifecycle>(INITIAL_PREVIEW_LIFECYCLE);
  const healthChangeRef = useRef(onPreviewHealthChange);
  const lifecycleChangeRef = useRef(onPreviewLifecycleChange);

  useLayoutEffect(() => {
    healthChangeRef.current = onPreviewHealthChange;
    lifecycleChangeRef.current = onPreviewLifecycleChange;
  }, [onPreviewHealthChange, onPreviewLifecycleChange]);

  const handleLifecycleChange = useCallback((next: PreviewLifecycle) => {
    const current = lifecycleRef.current;
    const accepted = getAcceptedLifecycle(current, next);
    if (isSameLifecycle(current, accepted)) return;

    lifecycleRef.current = accepted;
    setLifecycle(accepted);
    lifecycleChangeRef.current?.(accepted);

    if (accepted.status === "ready") {
      healthChangeRef.current?.({ status: "working" });
    } else if (accepted.status === "error" || accepted.status === "timeout") {
      healthChangeRef.current?.({
        status: "error",
        error: accepted.error,
      });
    }
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative h-full min-h-0 w-full min-w-0 overflow-hidden"
      data-preview-runner-root
    >
      <SandpackProvider
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
        <PreviewLifecycleReporter
          onChange={handleLifecycleChange}
          rootRef={rootRef}
        />
        {(onPreviewSelection || onPreviewTestReport) && (
          <PreviewInspector
            rootRef={rootRef}
            selectionMode={previewSelectionMode}
            testNonce={previewTestNonce}
            onPreviewSelection={onPreviewSelection}
            onPreviewTestReport={onPreviewTestReport}
          />
        )}
        {showStatusOverlay ? (
          <PreviewStatusOverlay
            lifecycle={lifecycle}
            onRequestFix={onRequestFix}
            onRetry={onRetry}
          />
        ) : null}
      </SandpackProvider>
    </div>
  );
}

function PreviewLifecycleReporter({
  onChange,
  rootRef,
}: {
  onChange: (lifecycle: PreviewLifecycle) => void;
  rootRef: RefObject<HTMLDivElement | null>;
}) {
  const { sandpack } = useSandpack();
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [didHandshakeTimeout, setDidHandshakeTimeout] = useState(false);
  const [didStabilize, setDidStabilize] = useState(false);
  const currentError = sandpack.error?.message ?? null;

  useEffect(() => {
    let retryTimer: number | undefined;
    let handshakeTimeoutTimer: number | undefined;
    const onMessage = (event: MessageEvent) => {
      const iframe = getPreviewIframe(rootRef.current);
      if (
        event.source !== iframe?.contentWindow ||
        event.data?.source !== PREVIEW_INSPECTOR_SOURCE ||
        event.data?.type !== "ready"
      ) {
        return;
      }

      setIsPreviewReady(true);
      if (retryTimer !== undefined) window.clearInterval(retryTimer);
      if (handshakeTimeoutTimer !== undefined) {
        window.clearTimeout(handshakeTimeoutTimer);
      }
      iframe?.contentWindow?.postMessage(
        { source: PREVIEW_PARENT_SOURCE, type: "ready-ack" },
        "*",
      );
    };
    const pingPreview = () => {
      getPreviewIframe(rootRef.current)?.contentWindow?.postMessage(
        { source: PREVIEW_PARENT_SOURCE, type: "ping" },
        "*",
      );
    };

    window.addEventListener("message", onMessage);
    pingPreview();
    retryTimer = window.setInterval(pingPreview, 250);
    handshakeTimeoutTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
      setDidHandshakeTimeout(true);
    }, PREVIEW_HANDSHAKE_TIMEOUT_MS);

    return () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(retryTimer);
      window.clearTimeout(handshakeTimeoutTimer);
    };
  }, [rootRef]);

  useEffect(() => {
    if (
      currentError ||
      !isPreviewReady ||
      didHandshakeTimeout ||
      (sandpack.status !== "running" && sandpack.status !== "done")
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setDidStabilize(true);
    }, PREVIEW_STABILIZATION_MS);

    return () => window.clearTimeout(timer);
  }, [currentError, didHandshakeTimeout, isPreviewReady, sandpack.status]);

  const status: PreviewLifecycle["status"] = currentError
    ? "error"
    : sandpack.status === "timeout" || didHandshakeTimeout
      ? "timeout"
      : didStabilize &&
          isPreviewReady &&
          (sandpack.status === "running" || sandpack.status === "done")
        ? "ready"
        : sandpack.status === "running" || sandpack.status === "done"
          ? "compiling"
          : "loading";
  const error =
    status === "error"
      ? currentError
      : status === "timeout"
        ? "The preview timed out while compiling."
        : null;

  useLayoutEffect(() => {
    if (status === "error" || status === "timeout") {
      onChange({ status, error: error! });
      return;
    }
    onChange({ status });
  }, [error, onChange, status]);

  return null;
}

function PreviewInspector({
  rootRef,
  selectionMode,
  testNonce,
  onPreviewSelection,
  onPreviewTestReport,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
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
      const iframe = getPreviewIframe(rootRef.current);
      if (
        event.source !== iframe?.contentWindow ||
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
  }, [onPreviewSelection, rootRef]);

  useEffect(() => {
    const root = rootRef.current;
    const sendSelectionMode = () => {
      getPreviewIframe(root)?.contentWindow?.postMessage(
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
        getPreviewIframe(root)?.contentWindow?.postMessage(
          {
            source: PREVIEW_PARENT_SOURCE,
            type: "set-selection-mode",
            enabled: false,
          },
          "*",
        );
      }
    };
  }, [rootRef, selectionMode]);

  useEffect(() => {
    if (!testNonce || !onPreviewTestReport) return;

    const iframe = getPreviewIframe(rootRef.current);
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
        event.source !== iframe?.contentWindow ||
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
  }, [testNonce, onPreviewTestReport, rootRef, sandpack.error]);

  if (!selectionMode) return null;

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-background px-2.5 py-1.5 text-xs font-medium text-primary shadow-sm">
      <MousePointer2 className="size-3" />
      Select an element
    </div>
  );
}

function getPreviewIframe(root: HTMLElement | null) {
  return root?.querySelector<HTMLIFrameElement>(".sp-preview-iframe") ?? null;
}

function getAcceptedLifecycle(
  current: PreviewLifecycle,
  next: PreviewLifecycle,
): PreviewLifecycle {
  if (current.status === "error" || current.status === "timeout") {
    return current;
  }
  return next;
}

function isSameLifecycle(current: PreviewLifecycle, next: PreviewLifecycle) {
  if (current.status !== next.status) return false;
  if (
    (current.status === "error" || current.status === "timeout") &&
    (next.status === "error" || next.status === "timeout")
  ) {
    return current.error === next.error;
  }
  return true;
}
