// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AiBuilderFeatureComparison } from "@/components/ai-builder-feature-comparison";

describe("AI builder feature comparison", () => {
  it("renders an accessible five-provider comparison with current source links", () => {
    render(<AiBuilderFeatureComparison />);

    const table = screen.getByRole("table", {
      name: /feature comparison of lovable, bolt.new, base44, v0, and squid agent/i,
    });

    expect(within(table).getByText("Expected build total")).toBeInTheDocument();
    expect(within(table).getByText("Squid Agent")).toBeInTheDocument();
    expect(
      within(table).getByText("Verified ZIP and GitHub publishing"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /base44/i })).toHaveAttribute(
      "href",
      "https://docs.base44.com/Getting-Started/Quick-start-guide",
    );
  });

  it("renders provider cards for the responsive layout", () => {
    render(<AiBuilderFeatureComparison variant="homepage" />);

    expect(
      screen.getByRole("heading", { name: "Squid Agent", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Per-result cost record")).toHaveLength(6);
    expect(screen.getAllByText("No bundled reports documented")).toHaveLength(
      8,
    );
  });
});
