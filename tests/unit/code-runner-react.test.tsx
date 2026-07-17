// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

const { sandpackState } = vi.hoisted(() => ({
  sandpackState: {
    error: null as Error | null,
    status: "idle",
  },
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
    <div className={className} data-testid="sandpack-preview" />
  ),
  useSandpack: () => ({ sandpack: sandpackState }),
}));

vi.mock("@/lib/sandpack-config", () => ({
  getSandpackConfig: () => ({}),
}));

import CodeRunnerReact from "@/components/code-runner-react";

describe("CodeRunnerReact", () => {
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
});
