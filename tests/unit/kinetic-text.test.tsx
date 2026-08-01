// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KineticText } from "@/components/ui/kinetic-text";

describe("KineticText", () => {
  it("renders one decorative span per character and one accessible label", () => {
    const { container } = render(<KineticText as="span" text="Squid Agent" />);

    expect(screen.getByText("Squid Agent")).toHaveClass("sr-only");
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(11);
    expect(
      container.querySelector('[data-slot="kinetic-text"]'),
    ).toHaveTextContent("Squid Agent");
  });

  it("uses a heading element by default", () => {
    render(<KineticText text="Kinetic" />);

    expect(
      screen.getByRole("heading", { name: "Kinetic", level: 1 }),
    ).toBeInTheDocument();
  });
});
