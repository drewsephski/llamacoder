// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GalleryLoading from "@/app/(main)/gallery/loading";

describe("GalleryLoading", () => {
  it("centers the loader within the full dynamic viewport height", () => {
    render(<GalleryLoading />);

    expect(
      screen
        .getByText("Loading gallery...")
        .closest('[data-slot="page-status-shell"]'),
    ).toHaveClass("min-h-dvh", "items-center", "justify-center");
  });
});
