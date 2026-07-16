// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GalleryProjectCard } from "@/features/gallery/components/gallery-project-card";
import type { GalleryProjectSummary } from "@/features/gallery/contracts";

const project: GalleryProjectSummary = {
  id: "publication_1",
  slug: "focus-day-chat123",
  title: "Focus Day",
  description: "A calmer way to plan focused work.",
  allowRemixes: true,
  publishedAt: new Date("2026-07-16T12:00:00.000Z"),
  thumbnailUrl: null,
  thumbnailStatus: "pending",
  creator: { name: "Squid creator", image: null },
};

describe("GalleryProjectCard", () => {
  it("renders the live preview fallback while no persisted image exists", () => {
    const { container } = render(<GalleryProjectCard project={project} />);

    expect(screen.getByText("Loading preview")).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeInTheDocument();
  });

  it("renders the persisted thumbnail when it is available", () => {
    const { container } = render(
      <GalleryProjectCard
        project={{
          ...project,
          thumbnailStatus: "ready",
          thumbnailUrl:
            "https://squid-assets.s3.us-east-1.amazonaws.com/squid-gallery/publication_1/message_1.jpg",
        }}
      />,
    );

    expect(screen.getByAltText("Preview of Focus Day")).toBeInTheDocument();
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
  });
});
