// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShowcaseLandingCard } from "@/features/gallery/components/showcase-landing-card";
import { getShowcaseLandingSummaries } from "@/features/gallery/showcase-landings";

describe("ShowcaseLandingCard", () => {
  it("uses a static screenshot and links to the live concept page", () => {
    const landing = getShowcaseLandingSummaries()[0];
    const { container } = render(<ShowcaseLandingCard landing={landing} />);

    expect(
      screen.getByRole("img", { name: `Preview of ${landing.title}` }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `/gallery/${landing.slug}`,
    );
    expect(screen.getByText("Live page")).toBeInTheDocument();
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
  });
});
