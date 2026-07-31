// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { plausibleMock } = vi.hoisted(() => ({
  plausibleMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("next-plausible", () => ({
  usePlausible: () => plausibleMock,
}));
vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));
vi.mock("next/link", () => ({
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock("framer-motion", () => ({
  useMotionValue: (value: number) => ({
    get: () => value,
    set: vi.fn(),
  }),
  useMotionValueEvent: vi.fn(),
  useReducedMotion: () => true,
  useScroll: () => ({
    scrollY: {
      get: () => 0,
      on: () => vi.fn(),
    },
    scrollYProgress: {
      get: () => 0,
      on: () => vi.fn(),
    },
  }),
  useSpring: (value: unknown) => value,
}));
vi.mock("@/components/header", () => ({
  default: () => null,
}));
vi.mock("@/lib/queries", () => ({
  useUserSession: () => ({ data: null }),
  useUserCredits: () => ({
    data: null,
    isError: false,
    refetch: vi.fn(),
  }),
  useCreateChat: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("@/features/generation/client/generation-handoff-context", () => ({
  useGenerationHandoff: () => ({ setStreamPromise: vi.fn() }),
}));
vi.mock("@/features/gallery/client/hero-image-rotation", () => ({
  buildGalleryHeroImageDeck: () => [],
}));

import { HomepageBuilderIsland } from "@/features/marketing/components/homepage-builder-island";

describe("HomepageBuilderIsland image paste", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  it("attaches a pasted image and creates a usable image-to-code prompt", async () => {
    render(
      <HomepageBuilderIsland workflowContent={null}>
        <div />
      </HomepageBuilderIsland>,
    );

    const prompt = screen.getByPlaceholderText(
      "Describe the prototype you want...",
    );
    const image = new File(["png"], "pasted.png", { type: "image/png" });

    fireEvent.paste(prompt, {
      clipboardData: {
        items: [
          {
            kind: "file",
            type: "image/png",
            getAsFile: () => image,
          },
        ],
        files: [image],
      },
    });

    expect(
      await screen.findByAltText("Uploaded app design reference"),
    ).toBeInTheDocument();
    expect(prompt).toHaveValue(
      "Recreate the attached image as closely as possible in code.",
    );
    expect(
      document.querySelector<HTMLButtonElement>("#builder button[type=submit]"),
    ).toBeEnabled();
  });
});
