// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShowcaseGameCard } from "@/features/gallery/components/showcase-game-card";
import { getShowcaseGameSummaries } from "@/features/gallery/showcase-games";

describe("ShowcaseGameCard", () => {
  it("uses a static screenshot instead of compiling a live preview", () => {
    const game = getShowcaseGameSummaries()[0];
    const { container } = render(<ShowcaseGameCard game={game} />);

    expect(
      screen.getByRole("img", { name: `Preview of ${game.title}` }),
    ).toBeInTheDocument();
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
    expect(screen.queryByText("Loading preview")).not.toBeInTheDocument();
  });
});
