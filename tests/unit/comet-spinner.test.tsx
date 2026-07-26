// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CometSpinner } from "@/components/loading-ui/comet-spinner";
import { AppVersionButton } from "@/components/app-version-button";
import Spinner from "@/components/spinner";

describe("CometSpinner", () => {
  it("renders an accessible animated loading status", () => {
    const { container } = render(
      <CometSpinner
        className="size-6 text-blue-500"
        aria-label="Loading plans"
      />,
    );

    const spinner = screen.getByRole("status", { name: "Loading plans" });
    expect(spinner).toHaveClass("size-6", "text-blue-500");
    expect(spinner).toHaveAttribute("data-slot", "comet-spinner");
    expect(spinner).toHaveStyle({ containerType: "size" });
    expect(document.querySelector("style")?.textContent).toContain(
      "@keyframes loading-ui-comet-rotation",
    );
    expect(document.querySelector("style")?.textContent).toContain(
      "prefers-reduced-motion: reduce",
    );
  });

  it("clamps custom geometry to safe bounds", () => {
    render(<CometSpinner headScale={1} radiusScale={0} />);

    const spinner = screen.getByRole("status", { name: "Loading" });
    expect(spinner.style.getPropertyValue("--loading-ui-comet-head")).toBe(
      "35.00cqmin",
    );
    expect(spinner.style.getPropertyValue("--loading-ui-comet-radius")).toBe(
      "30.00cqmin",
    );
  });
});

describe("Spinner", () => {
  it("uses the comet while preserving the loading control width", () => {
    render(
      <button type="button">
        <Spinner loading label="Opening checkout">
          Buy credits
        </Spinner>
      </button>,
    );

    expect(
      screen.getByRole("status", { name: "Opening checkout" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Buy credits")).toHaveClass("invisible");
  });
});

describe("loader integrations", () => {
  it("uses the comet for generated app versions", () => {
    render(<AppVersionButton version={2} generating disabled={false} />);

    expect(
      screen.getByRole("status", { name: "Generating app version" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Generating...")).toBeInTheDocument();
  });
});
