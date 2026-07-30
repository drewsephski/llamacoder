// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FullPageStatus } from "@/components/page-status/full-page-status";

describe("FullPageStatus", () => {
  it("renders one accessible live status centered in the full viewport", () => {
    render(
      <FullPageStatus
        description="This can take a moment."
        label="Compiling preview..."
      />,
    );

    const status = screen.getByRole("status");
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "true");
    expect(status.closest('[data-slot="page-status-shell"]')).toHaveClass(
      "min-h-dvh",
      "items-center",
      "justify-center",
    );
    expect(
      document.querySelector('[data-slot="comet-spinner"]'),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("supports status surfaces constrained by their parent", () => {
    render(<FullPageStatus label="Loading preview..." variant="constrained" />);

    expect(screen.getByRole("status").parentElement).toHaveClass("min-h-full");
    expect(screen.getByRole("status").parentElement).not.toHaveClass(
      "min-h-dvh",
    );
  });
});
