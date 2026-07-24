// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OnboardingWizard } from "@/components/onboarding-wizard";

describe("OnboardingWizard", () => {
  it("walks through three steps and calls onComplete on finish", () => {
    const onComplete = vi.fn();
    const onClose = vi.fn();

    render(
      <OnboardingWizard isOpen onClose={onClose} onComplete={onComplete} />,
    );

    expect(screen.getByText("Describe the product")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Plan first, then build")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Preview, refine, export")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Start building/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
