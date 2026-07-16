// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

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
  useSandpack: () => ({ sandpack: { error: null, status: "idle" } }),
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
});
