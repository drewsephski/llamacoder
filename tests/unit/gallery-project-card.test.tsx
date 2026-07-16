// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/features/projects/server/actions", () => ({
  deleteProject: vi.fn(),
}));

import { GalleryProjectCard } from "@/features/gallery/components/gallery-project-card";
import type { GalleryProjectSummary } from "@/features/gallery/contracts";

const project: GalleryProjectSummary = {
  id: "publication_1",
  ownerChatId: null,
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
  afterEach(() => vi.useRealTimers());

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

  it("falls back to the live preview when a persisted thumbnail cannot load", () => {
    const { container } = render(
      <GalleryProjectCard
        project={{
          ...project,
          thumbnailStatus: "ready",
          thumbnailUrl: "/api/gallery/publication_1/thumbnail?v=message_1",
        }}
      />,
    );

    fireEvent.error(screen.getByAltText("Preview of Focus Day"));

    expect(container.querySelector("iframe")).toBeInTheDocument();
    expect(screen.getByText("Loading preview")).toBeInTheDocument();
  });

  it("only shows gallery management controls to the project owner", () => {
    const { rerender } = render(<GalleryProjectCard project={project} />);

    expect(
      screen.queryByRole("button", { name: "Make private" }),
    ).not.toBeInTheDocument();

    rerender(
      <GalleryProjectCard project={{ ...project, ownerChatId: "chat_123" }} />,
    );

    expect(
      screen.getByRole("button", { name: "Make private" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete Focus Day" }),
    ).toBeInTheDocument();
  });

  it("does not leave the custom loading overlay stuck indefinitely", () => {
    vi.useFakeTimers();
    render(<GalleryProjectCard project={project} />);

    act(() => vi.advanceTimersByTime(15_000));

    expect(screen.queryByText("Loading preview")).not.toBeInTheDocument();
  });
});
