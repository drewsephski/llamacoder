// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PreviewLifecycle } from "@/components/preview-status-overlay";

vi.mock("@/components/code-runner", () => ({
  default: ({
    onPreviewLifecycleChange,
  }: {
    onPreviewLifecycleChange?: (lifecycle: PreviewLifecycle) => void;
  }) => (
    <div>
      {(
        [
          { status: "compiling" },
          { status: "ready" },
          { status: "error", error: "Compile failed" },
          { status: "timeout", error: "Timed out" },
        ] as PreviewLifecycle[]
      ).map((lifecycle) => (
        <button
          key={lifecycle.status}
          onClick={() => onPreviewLifecycleChange?.(lifecycle)}
          type="button"
        >
          {lifecycle.status}
        </button>
      ))}
    </div>
  ),
}));

import { GalleryPreviewRunner } from "@/features/gallery/components/gallery-preview-runner";

describe("GalleryPreviewRunner", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preserves loading, ready, and terminal gallery capture semantics", () => {
    const postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => undefined);
    const { container } = render(
      <GalleryPreviewRunner
        files={[{ path: "App.tsx", content: "export default 1" }]}
      />,
    );
    const root = container.firstElementChild;

    expect(root).toHaveAttribute("data-gallery-preview-status", "loading");
    fireEvent.click(screen.getByRole("button", { name: "compiling" }));
    expect(root).toHaveAttribute("data-gallery-preview-status", "loading");
    expect(postMessage).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "ready" }));
    expect(root).toHaveAttribute("data-gallery-preview-status", "ready");
    expect(postMessage).toHaveBeenLastCalledWith(
      { source: "squid-gallery-preview", type: "ready" },
      window.location.origin,
    );

    fireEvent.click(screen.getByRole("button", { name: "timeout" }));
    expect(root).toHaveAttribute("data-gallery-preview-status", "error");
    expect(postMessage).toHaveBeenLastCalledWith(
      { source: "squid-gallery-preview", type: "error" },
      window.location.origin,
    );
  });
});
