// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/gallery",
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () =>
    new URLSearchParams("q=focus&sort=oldest&cursor=stale-cursor"),
}));

import { GalleryToolbar } from "@/features/gallery/components/gallery-toolbar";

describe("GalleryToolbar", () => {
  beforeAll(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    pushMock.mockClear();
  });

  it("drops the cursor when a filter changes", () => {
    render(
      <GalleryToolbar initialQuery="focus" remixable={false} sort="oldest" />,
    );

    fireEvent.click(
      screen.getByRole("switch", {
        name: "Show only remixable projects",
      }),
    );

    expect(pushMock).toHaveBeenCalledWith(
      "/gallery?q=focus&sort=oldest&remixable=true",
    );
  });

  it("does not carry a cursor through a submitted search", () => {
    const { container } = render(
      <GalleryToolbar initialQuery="focus" remixable={false} sort="oldest" />,
    );

    const form = container.querySelector("form");
    expect(form).toHaveAttribute("action", "/gallery");
    expect(form?.querySelector('input[name="cursor"]')).toBeNull();
  });
});
