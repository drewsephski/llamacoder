// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { ArrowRight } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Button, buttonVariants } from "@/components/ui/button";

describe("Button", () => {
  it("uses the premium flat treatment without beveled movement", () => {
    render(<Button>Build project</Button>);

    const button = screen.getByRole("button", { name: "Build project" });
    expect(button).toHaveAttribute("data-variant", "default");
    expect(button).toHaveAttribute("data-size", "default");
    expect(button.className).toContain("shadow-sm");
    expect(button.className).not.toContain("border-b-[4px]");
    expect(button.className).not.toContain("translate-y");
  });

  it("preserves variants, sizes, and icon placement", () => {
    render(
      <Button variant="outline" size="sm">
        Continue
        <ArrowRight data-icon="inline-end" />
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveAttribute("data-variant", "outline");
    expect(button).toHaveAttribute("data-size", "sm");
    expect(button.querySelector("svg")).toHaveAttribute(
      "data-icon",
      "inline-end",
    );
  });

  it("keeps the Radix asChild composition contract", () => {
    render(
      <Button asChild variant="secondary">
        <a href="/dashboard">Dashboard</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(link).toHaveAttribute("data-slot", "button");
    expect(link).toHaveAttribute("data-variant", "secondary");
  });

  it("retains the Squid navigation CTA variant", () => {
    expect(buttonVariants({ variant: "navCta" })).toContain("bg-nav-button");
  });
});
