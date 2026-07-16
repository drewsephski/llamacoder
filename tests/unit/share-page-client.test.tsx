// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/code-runner", () => ({
  default: () => <div data-testid="code-runner" />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { SharePageClient } from "@/app/share/v2/[messageId]/share-page-client";

describe("SharePageClient", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      }),
    );
  });

  it("keeps the desktop project rail fixed beside a full-height preview", () => {
    render(
      <SharePageClient
        messageId="message_1"
        title="Focus Day"
        prompt="Build a focused planning app"
        creatorName="Squid creator"
        files={[
          { path: "App.tsx", content: "export default function App() {}" },
        ]}
        allowRemixes={false}
        galleryHref="/gallery"
      />,
    );

    const shell = screen.getByTestId("shared-project-shell");
    const projectRail = screen.getByRole("complementary", {
      name: "Project details",
    });
    const preview = screen.getByRole("main", {
      name: "Generated app preview",
    });

    expect(shell).toHaveClass("min-h-dvh");
    expect(projectRail).toHaveClass(
      "lg:fixed",
      "lg:h-dvh",
      "lg:overflow-y-auto",
    );
    expect(preview).toHaveClass(
      "h-dvh",
      "min-w-0",
      "items-stretch",
      "overflow-hidden",
    );
    expect(screen.getByTestId("code-runner")).toBeInTheDocument();
  });
});
