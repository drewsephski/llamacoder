// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  PreviewStatusOverlay,
  type PreviewLifecycle,
} from "@/components/preview-status-overlay";

describe("PreviewStatusOverlay", () => {
  it.each([
    [{ status: "loading" }, "Loading preview"],
    [{ status: "compiling" }, "Compiling preview"],
    [{ status: "ready" }, "Preview ready"],
    [{ status: "error", error: "Unexpected token" }, "Preview couldn't start"],
    [
      { status: "timeout", error: "Preview timed out" },
      "Preview took too long",
    ],
  ] satisfies Array<[PreviewLifecycle, string]>)(
    "renders the %s lifecycle",
    (lifecycle, title) => {
      render(<PreviewStatusOverlay lifecycle={lifecycle} onRetry={vi.fn()} />);

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByTestId("preview-status-overlay")).toHaveAttribute(
        "data-preview-status",
        lifecycle.status,
      );
    },
  );

  it("keeps public errors safe while exposing retry", () => {
    const onRetry = vi.fn();
    render(
      <PreviewStatusOverlay
        lifecycle={{ status: "error", error: "private compiler detail" }}
        onRetry={onRetry}
      />,
    );

    expect(
      screen.queryByText("private compiler detail"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry preview" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("retains workspace error inspection and repair", () => {
    const onRequestFix = vi.fn();
    render(
      <PreviewStatusOverlay
        lifecycle={{ status: "error", error: "Unexpected token" }}
        onRequestFix={onRequestFix}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText("Unexpected token")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fix error" }));
    expect(onRequestFix).toHaveBeenCalledWith("Unexpected token");
  });
});
