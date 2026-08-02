// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

import { WorkflowMediaCard } from "@/components/homepage/workflow-media-card";

const baseProps = {
  alt: "Squid builds an editable React preview",
  description: "Turns a reference into working code.",
  fallback: "create" as const,
  label: "Create",
  posterSrc: "/demo-poster.png",
  reduceMotion: false,
  title: "Screenshot to editable React app",
  titleId: "workflow-media-test",
  videoSrc: "/demo.mp4",
};

describe("WorkflowMediaCard", () => {
  it("keeps the action-specific fallback visible until video can play", () => {
    const { container } = render(<WorkflowMediaCard {...baseProps} />);
    const frame = container.querySelector(".workflow-media-frame");
    const fallback = container.querySelector(
      '[data-fallback-variant="create"]',
    );
    const video = screen.getByLabelText(baseProps.alt);

    expect(frame).toHaveAttribute("data-media-state", "loading");
    expect(fallback).toBeInTheDocument();

    fireEvent.canPlay(video);

    expect(frame).toHaveAttribute("data-media-state", "ready");
  });

  it("returns to the fallback when playback fails", () => {
    const { container } = render(<WorkflowMediaCard {...baseProps} />);
    const frame = container.querySelector(".workflow-media-frame");
    const video = screen.getByLabelText(baseProps.alt);

    fireEvent.canPlay(video);
    fireEvent.error(video);
    expect(frame).toHaveAttribute("data-media-state", "error");
    expect(
      container.querySelector('[data-fallback-variant="create"]'),
    ).toBeInTheDocument();
  });

  it("recovers when cached media loaded before hydration listeners attached", () => {
    const { container } = render(<WorkflowMediaCard {...baseProps} />);
    const frame = container.querySelector(".workflow-media-frame");
    const video = screen.getByLabelText(baseProps.alt);

    fireEvent.timeUpdate(video);

    expect(frame).toHaveAttribute("data-media-state", "ready");
  });

  it("uses the poster over the static fallback for reduced motion", () => {
    const { container } = render(
      <WorkflowMediaCard {...baseProps} fallback="plan" reduceMotion />,
    );
    const frame = container.querySelector(".workflow-media-frame");
    const poster = screen.getByRole("img", { name: baseProps.alt });

    expect(container.querySelector("video")).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-fallback-variant="plan"]'),
    ).toBeInTheDocument();

    fireEvent.load(poster);
    expect(frame).toHaveAttribute("data-media-state", "ready");

    fireEvent.error(poster);
    expect(frame).toHaveAttribute("data-media-state", "error");
  });
});
