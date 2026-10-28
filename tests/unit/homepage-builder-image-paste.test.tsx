// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock, plausibleMock, routerPushMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  plausibleMock: vi.fn(),
  routerPushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));
vi.mock("next-plausible", () => ({
  usePlausible: () => plausibleMock,
}));
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<unknown>) => {
    if (loader.toString().includes("api-selection-dialog")) {
      return function MockApiSelectionDialog({
        selectedProviderIds,
        onSelectionChange,
      }: {
        selectedProviderIds: string[];
        onSelectionChange: (providerIds: string[]) => void;
      }) {
        return (
          <button
            type="button"
            aria-label={`Open Integrations, ${selectedProviderIds.length} selected`}
            onClick={() => onSelectionChange(["frankfurter"])}
          >
            Integrations
          </button>
        );
      };
    }

    return () => null;
  },
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
vi.mock("@/lib/auth-client", () => ({
  authClient: { getSession: getSessionMock },
}));
vi.mock("@/features/gallery/client/hero-image-rotation", () => ({
  buildGalleryHeroImageDeck: () => [],
}));

import { HomepageBuilderIsland } from "@/features/marketing/components/homepage-builder-island";

describe("HomepageBuilderIsland image paste", () => {
  beforeEach(() => {
    getSessionMock.mockResolvedValue({ data: null });
    plausibleMock.mockReset();
    routerPushMock.mockReset();
    window.sessionStorage.clear();
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

  it("keeps selected integrations when sign-up interrupts project creation", async () => {
    render(
      <HomepageBuilderIsland workflowContent={null}>
        <div />
      </HomepageBuilderIsland>,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Describe the prototype you want..."),
      { target: { value: "Build a currency dashboard" } },
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Open Integrations, 0 selected",
      }),
    );
    expect(
      screen.getByRole("button", {
        name: "Open Integrations, 1 selected",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      document.querySelector<HTMLButtonElement>(
        "#builder button[type=submit]",
      )!,
    );

    await waitFor(() => {
      expect(
        JSON.parse(
          window.sessionStorage.getItem("squid:pending-project") ?? "null",
        ),
      ).toEqual(expect.objectContaining({ providerIds: ["frankfurter"] }));
    });
    expect(routerPushMock).toHaveBeenCalledWith(
      expect.stringContaining("/sign-up?callbackUrl="),
    );
  });
});
