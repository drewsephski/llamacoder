// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ForSaleBanner } from "@/features/for-sale/components/for-sale-banner";

const { beginForSaleCheckoutMock } = vi.hoisted(() => ({
  beginForSaleCheckoutMock: vi.fn(),
}));

vi.mock("@/features/for-sale/checkout", () => ({
  beginForSaleCheckout: beginForSaleCheckoutMock,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/forma",
}));

describe("ForSaleBanner", () => {
  it("opens route-aware sale details and exposes the matching download", async () => {
    const user = userEvent.setup();
    render(<ForSaleBanner />);

    expect(screen.getByText("$99")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Make it yours" }));

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "A bold studio landing page",
    );
    expect(
      screen.getByRole("link", { name: "Download preview asset" }),
    ).toHaveAttribute("href", "/showcase/forma-hero.png");
  });

  it("reports checkout failures without implying payment was collected", async () => {
    beginForSaleCheckoutMock.mockRejectedValueOnce(
      new Error("Unable to start checkout."),
    );
    const user = userEvent.setup();
    render(<ForSaleBanner />);

    await user.click(screen.getByRole("button", { name: "Make it yours" }));
    await user.click(
      screen.getByRole("button", { name: "Get this page for $99" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Unable to start checkout.",
    );
  });

  it("can be dismissed without opening the modal", async () => {
    const user = userEvent.setup();
    render(<ForSaleBanner />);

    await user.click(
      screen.getByRole("button", { name: "Dismiss sale banner" }),
    );

    expect(screen.queryByLabelText("Landing page for sale")).toBeNull();
  });
});
