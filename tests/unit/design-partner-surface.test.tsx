// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DesignPartnerBanner } from "@/features/design-partners/components/design-partner-banner";
import { DesignPartnerSection } from "@/features/design-partners/components/design-partner-section";

const plausible = vi.fn();

vi.mock("next-plausible", () => ({
  usePlausible: () => plausible,
}));

describe("design partner homepage surface", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    plausible.mockReset();
    window.history.replaceState(
      {},
      "",
      "/?utm_source=email&utm_campaign=design_partners_2026_08",
    );
  });

  it("links the banner to the application section", () => {
    render(<DesignPartnerBanner />);

    expect(
      screen.getByRole("link", { name: /apply for a working session/i }),
    ).toHaveAttribute("href", "#design-partner-program");
  });

  it("submits a complete application with campaign attribution", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ status: "received" }), { status: 201 }),
      );
    render(<DesignPartnerSection />);

    fireEvent.change(screen.getByLabelText(/^name/i), {
      target: { value: "Avery Morgan" },
    });
    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: "avery@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/your role/i), {
      target: { value: "freelance_designer" },
    });
    fireEvent.change(screen.getByLabelText(/company or studio/i), {
      target: { value: "Morgan Product Studio" },
    });
    fireEvent.change(screen.getByLabelText(/portfolio or company url/i), {
      target: { value: "https://example.com/work" },
    });
    fireEvent.change(
      screen.getByLabelText(/what would you like to prototype/i),
      {
        target: {
          value:
            "A reviewable React prototype for a client onboarding workflow before our next stakeholder session.",
        },
      },
    );
    fireEvent.change(screen.getByLabelText(/project timing/i), {
      target: { value: "this_month" },
    });
    fireEvent.change(screen.getByLabelText(/preferred reply/i), {
      target: { value: "email" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /may contact me/i }));
    fireEvent.click(screen.getByRole("button", { name: /apply to partner/i }));

    await screen.findByText("Your brief is in.");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, request] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(request?.body))).toMatchObject({
      email: "avery@example.com",
      permissionToContact: true,
      attribution: {
        source: "email",
        campaign: "design_partners_2026_08",
        landingPath: "/",
      },
    });
    await waitFor(() =>
      expect(plausible).toHaveBeenCalledWith(
        "Design Partner Application Submitted",
        expect.any(Object),
      ),
    );
  });

  it("shows clear field guidance and focuses the first invalid field", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message:
            "Some details need your attention. Review the fields marked below.",
          issues: {
            name: ["Name must be at least 2 characters."],
            email: ["Enter a valid email address."],
            role: ["Choose your role."],
          },
        }),
        { status: 400 },
      ),
    );
    render(<DesignPartnerSection />);

    fireEvent.click(screen.getByRole("button", { name: /apply to partner/i }));

    expect(
      await screen.findByText(
        "Some details need your attention. Review the fields marked below.",
      ),
    ).toBeVisible();
    expect(
      screen.getByText("Name must be at least 2 characters."),
    ).toBeVisible();
    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(screen.getByText("Choose your role.")).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText(/^name/i)).toHaveFocus());
    expect(screen.queryByText(/expected string/i)).not.toBeInTheDocument();
  });

  it("uses the enhanced loader while submitting", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise<Response>(() => undefined),
    );
    const { container } = render(<DesignPartnerSection />);

    fireEvent.click(screen.getByRole("button", { name: /apply to partner/i }));

    expect(await screen.findByText("Submitting")).toBeVisible();
    expect(
      container.querySelector('[data-slot="comet-spinner"]'),
    ).toBeInTheDocument();
    expect(container.querySelector(".lucide-loader-circle")).toBeNull();
  });
});
