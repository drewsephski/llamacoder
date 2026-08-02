// @vitest-environment jsdom

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sandpackState } = vi.hoisted(() => ({
  sandpackState: {
    error: null as Error | null,
    status: "idle",
  },
}));
const { getSandpackConfigMock } = vi.hoisted(() => ({
  getSandpackConfigMock: vi.fn(() => ({})),
}));

vi.mock("@codesandbox/sandpack-react/unstyled", () => ({
  SandpackProvider: ({
    children,
    className,
  }: PropsWithChildren<{ className?: string }>) => (
    <div className={className} data-testid="sandpack-provider">
      {children}
    </div>
  ),
  SandpackPreview: ({ className }: { className?: string }) => (
    <div className={className} data-testid="sandpack-preview">
      <iframe className="sp-preview-iframe" title="Generated preview" />
    </div>
  ),
  useSandpack: () => ({ sandpack: sandpackState }),
}));

vi.mock("@/lib/sandpack-config", () => ({
  getSandpackConfig: getSandpackConfigMock,
}));

import CodeRunnerReact from "@/components/code-runner-react";

describe("CodeRunnerReact", () => {
  beforeEach(() => {
    sandpackState.error = null;
    sandpackState.status = "idle";
    getSandpackConfigMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes updated Supabase runtime configuration into Sandpack", () => {
    const files = [
      {
        path: "App.tsx",
        content: "export default function App() { return null; }",
      },
    ];
    const firstRuntime = {
      status: "ready" as const,
      config: {
        url: "https://project-one.supabase.co",
        publishableKey: "sb_publishable_one",
      },
    };
    const secondRuntime = {
      status: "ready" as const,
      config: {
        url: "https://project-two.supabase.co",
        publishableKey: "sb_publishable_two",
      },
    };
    const { rerender } = render(
      <CodeRunnerReact files={files} supabaseRuntime={firstRuntime} />,
    );
    rerender(<CodeRunnerReact files={files} supabaseRuntime={secondRuntime} />);

    expect(getSandpackConfigMock).toHaveBeenLastCalledWith(
      files,
      secondRuntime,
    );
  });

  it("constrains generated content to the height owned by its parent", () => {
    render(
      <CodeRunnerReact
        files={[
          {
            path: "App.tsx",
            content: "export default function App() { return null; }",
          },
        ]}
      />,
    );

    expect(screen.getByTestId("sandpack-provider")).toHaveClass(
      "h-full",
      "min-h-0",
      "overflow-hidden",
    );
    expect(screen.getByTestId("sandpack-preview")).toHaveClass(
      "h-full",
      "min-h-0",
      "overflow-hidden",
    );
  });

  it("keeps a transient preview error visible and fixable", () => {
    const onRequestFix = vi.fn();
    const files = [
      {
        path: "App.tsx",
        content: "export default function App() { return null; }",
      },
    ];
    const { rerender } = render(
      <CodeRunnerReact files={files} onRequestFix={onRequestFix} />,
    );

    sandpackState.error = new Error("ReferenceError: widget is not defined");
    rerender(<CodeRunnerReact files={files} onRequestFix={onRequestFix} />);
    sandpackState.error = null;
    rerender(<CodeRunnerReact files={files} onRequestFix={onRequestFix} />);

    expect(
      screen.getByText("ReferenceError: widget is not defined"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fix error" }));
    expect(onRequestFix).toHaveBeenCalledWith(
      "ReferenceError: widget is not defined",
    );
  });

  it("reports a transient preview error immediately for automatic repair", () => {
    const onPreviewHealthChange = vi.fn();
    const files = [
      {
        path: "App.tsx",
        content: "export default function App() { return null; }",
      },
    ];
    const { rerender } = render(
      <CodeRunnerReact
        files={files}
        onPreviewHealthChange={onPreviewHealthChange}
      />,
    );

    sandpackState.error = new Error("TypeError: failed to render");
    rerender(
      <CodeRunnerReact
        files={files}
        onPreviewHealthChange={onPreviewHealthChange}
      />,
    );
    sandpackState.error = null;
    rerender(
      <CodeRunnerReact
        files={files}
        onPreviewHealthChange={onPreviewHealthChange}
      />,
    );

    expect(onPreviewHealthChange).toHaveBeenCalledWith({
      status: "error",
      error: "TypeError: failed to render",
    });
  });

  it("requires the compiled-app handshake, healthy Sandpack state, and stabilization before ready", () => {
    vi.useFakeTimers();
    const onPreviewHealthChange = vi.fn();
    const onPreviewLifecycleChange = vi.fn();
    const files = [
      {
        path: "App.tsx",
        content: "export default function App() { return null; }",
      },
    ];
    const { rerender } = render(
      <CodeRunnerReact
        files={files}
        onPreviewHealthChange={onPreviewHealthChange}
        onPreviewLifecycleChange={onPreviewLifecycleChange}
      />,
    );

    sandpackState.status = "done";
    rerender(
      <CodeRunnerReact
        files={files}
        onPreviewHealthChange={onPreviewHealthChange}
        onPreviewLifecycleChange={onPreviewLifecycleChange}
      />,
    );
    expect(screen.getByTestId("preview-status-overlay")).toHaveAttribute(
      "data-preview-status",
      "compiling",
    );

    sandpackState.status = "running";
    rerender(
      <CodeRunnerReact
        files={files}
        onPreviewHealthChange={onPreviewHealthChange}
        onPreviewLifecycleChange={onPreviewLifecycleChange}
      />,
    );

    const iframe = screen
      .getByTitle("Generated preview")
      .closest("iframe") as HTMLIFrameElement;
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          source: iframe.contentWindow,
          data: { source: "squid-preview-inspector", type: "ready" },
        }),
      );
    });
    act(() => vi.advanceTimersByTime(1_499));
    expect(onPreviewHealthChange).not.toHaveBeenCalledWith({
      status: "working",
    });

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId("preview-status-overlay")).toHaveAttribute(
      "data-preview-status",
      "ready",
    );
    expect(onPreviewLifecycleChange).toHaveBeenLastCalledWith({
      status: "ready",
    });
    expect(onPreviewHealthChange).toHaveBeenCalledWith({ status: "working" });

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByTestId("preview-status-overlay")).toHaveAttribute(
      "data-preview-status",
      "ready",
    );
  });

  it("waits for preview readiness before running runtime verification", () => {
    vi.useFakeTimers();
    const onPreviewTestReport = vi.fn();
    const files = [
      {
        path: "App.tsx",
        content: "export default function App() { return <button>Save</button>; }",
      },
    ];
    const { rerender } = render(
      <CodeRunnerReact
        files={files}
        previewTestNonce={1}
        onPreviewTestReport={onPreviewTestReport}
      />,
    );

    act(() => vi.advanceTimersByTime(3_000));
    expect(onPreviewTestReport).not.toHaveBeenCalled();

    sandpackState.status = "running";
    rerender(
      <CodeRunnerReact
        files={files}
        previewTestNonce={1}
        onPreviewTestReport={onPreviewTestReport}
      />,
    );
    const iframe = screen
      .getByTitle("Generated preview")
      .closest("iframe") as HTMLIFrameElement;
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          source: iframe.contentWindow,
          data: { source: "squid-preview-inspector", type: "ready" },
        }),
      );
    });
    act(() => vi.advanceTimersByTime(1_500));

    const report = {
      status: "passed" as const,
      viewport: { width: 1280, height: 720 },
      clickableElements: 1,
      unnamedClickableElements: 0,
      horizontalOverflow: false,
      runtimeError: null,
      checkedAt: "2026-08-02T00:39:30.000Z",
    };
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          source: iframe.contentWindow,
          data: {
            source: "squid-preview-inspector",
            type: "runtime-test-report",
            requestId: 1,
            report,
          },
        }),
      );
    });

    expect(onPreviewTestReport).toHaveBeenCalledWith(report);
  });

  it("ignores a ready message from a different runner iframe", () => {
    vi.useFakeTimers();
    sandpackState.status = "done";
    render(
      <>
        <CodeRunnerReact
          files={[{ path: "App.tsx", content: "export default 1" }]}
        />
        <CodeRunnerReact
          files={[{ path: "App.tsx", content: "export default 2" }]}
        />
      </>,
    );
    const iframes = screen.getAllByTitle("Generated preview");
    const overlays = screen.getAllByTestId("preview-status-overlay");

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          source: (iframes[0] as HTMLIFrameElement).contentWindow,
          data: { source: "squid-preview-inspector", type: "ready" },
        }),
      );
    });
    act(() => vi.advanceTimersByTime(1_500));

    expect(overlays[0]).toHaveAttribute("data-preview-status", "ready");
    expect(overlays[1]).toHaveAttribute("data-preview-status", "compiling");
  });

  it("reports a terminal timeout and retry remounts a fresh attempt", () => {
    vi.useFakeTimers();
    sandpackState.status = "done";
    const onPreviewLifecycleChange = vi.fn();
    render(
      <CodeRunnerReact
        files={[{ path: "App.tsx", content: "export default 1" }]}
        onPreviewLifecycleChange={onPreviewLifecycleChange}
      />,
    );

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByTestId("preview-status-overlay")).toHaveAttribute(
      "data-preview-status",
      "timeout",
    );
    expect(onPreviewLifecycleChange).toHaveBeenCalledWith({
      status: "timeout",
      error: "The preview timed out while compiling.",
    });

    sandpackState.status = "idle";
    const configCallsBeforeRetry = getSandpackConfigMock.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Retry preview" }));

    expect(getSandpackConfigMock.mock.calls.length).toBeGreaterThan(
      configCallsBeforeRetry,
    );
    expect(screen.getByTestId("preview-status-overlay")).toHaveAttribute(
      "data-preview-status",
      "loading",
    );
    expect(onPreviewLifecycleChange).toHaveBeenLastCalledWith({
      status: "loading",
    });
  });

  it("renders one accessible live status and hides the spinner announcement", () => {
    render(
      <CodeRunnerReact
        files={[{ path: "App.tsx", content: "export default 1" }]}
      />,
    );

    const overlay = screen.getByTestId("preview-status-overlay");
    expect(within(overlay).getAllByRole("status")).toHaveLength(1);
    expect(within(overlay).getByText("Loading preview")).toBeInTheDocument();
    expect(
      overlay.querySelector('[data-slot="comet-spinner"]'),
    ).toHaveAttribute("aria-hidden", "true");
    expect(overlay).toHaveClass("motion-reduce:transition-none");
  });

  it("fails unsupported imports before Sandpack starts and routes the diagnostic to repair", () => {
    const onPreviewHealthChange = vi.fn();
    const onRequestFix = vi.fn();

    render(
      <CodeRunnerReact
        files={[
          {
            path: "App.tsx",
            content: 'import axios from "axios"; export default axios;',
          },
        ]}
        onPreviewHealthChange={onPreviewHealthChange}
        onRequestFix={onRequestFix}
      />,
    );

    expect(screen.queryByTestId("sandpack-provider")).not.toBeInTheDocument();
    expect(screen.getByTestId("preview-status-overlay")).toHaveAttribute(
      "data-preview-status",
      "error",
    );
    expect(
      screen.getByText(/Unsupported external package "axios"/),
    ).toBeInTheDocument();
    expect(onPreviewHealthChange).toHaveBeenCalledWith({
      status: "error",
      error: expect.stringContaining('Unsupported external package "axios"'),
    });

    fireEvent.click(screen.getByRole("button", { name: "Fix error" }));
    expect(onRequestFix).toHaveBeenCalledWith(
      expect.stringContaining('Unsupported external package "axios"'),
    );
    expect(getSandpackConfigMock).not.toHaveBeenCalled();
  });
});
