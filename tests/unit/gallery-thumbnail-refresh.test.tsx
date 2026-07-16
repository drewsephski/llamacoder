// @vitest-environment jsdom

import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { refreshMock } = vi.hoisted(() => ({ refreshMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { GalleryThumbnailRefresh } from "@/features/gallery/components/gallery-thumbnail-refresh";

describe("GalleryThumbnailRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("polls for a newly captured image without requiring an owner session", () => {
    render(<GalleryThumbnailRefresh canBackfill={false} pending />);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("stops polling when the publication no longer has a pending image", () => {
    const { rerender } = render(
      <GalleryThumbnailRefresh canBackfill={false} pending />,
    );
    rerender(<GalleryThumbnailRefresh canBackfill={false} pending={false} />);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(refreshMock).not.toHaveBeenCalled();
  });
});
