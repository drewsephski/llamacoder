// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DesignPartnerBanner } from "@/features/design-partners/components/design-partner-banner";
import { DesignPartnerSection } from "@/features/design-partners/components/design-partner-section";

const plausible = vi.fn();

vi.mock("next-plausible", () => ({
  usePlausible: () => plausible,
}));

async function chooseOption(label: RegExp, option: RegExp) {
  fireEvent.click(await screen.findByLabelText(label));
  fireEvent.click(await screen.findByRole("option", { name: option }));
}

async function completeApplication() {
  fireEvent.change(screen.getByLabelText(/^name/i), {
    target: { value: "Avery Morgan" },
  });
  fireEvent.change(screen.getByLabelText(/work email/i), {
    target: { value: "avery@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));

  await chooseOption(/your role/i, /freelance designer/i);
  fireEvent.change(screen.getByLabelText(/company or studio/i), {
    target: { value: "Morgan Product Studio" },
  });
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));

  fireEvent.change(await screen.findByLabelText(/portfolio or company url/i), {
    target: { value: "https://example.com/work" },
  });
  fireEvent.change(screen.getByLabelText(/what would you like to prototype/i), {
    target: {
      value:
        "A reviewable React prototype for a client onboarding workflow before our next stakeholder session.",
    },
  });
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));

  await chooseOption(/project timing/i, /this month/i);
  await chooseOption(/preferred reply/i, /^email$/i);
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));

  fireEvent.click(
    await screen.findByRole("checkbox", { name: /may contact me/i }),
  );
}

describe("design partner homepage surface", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    plausible.mockReset();
    Element.prototype.scrollIntoView = vi.fn();
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

    await completeApplication();
    fireEvent.click(screen.getByRole("button", { name: /apply to partner/i }));

    await screen.findByRole("heading", {
      name: "Your brief is in. We’ll take it from here.",
    });
    expect(screen.getByText("Application received")).toBeVisible();
    expect(
      screen.getByText(/we’ll contact you via Email to plan the session/i),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /see what Squid can build/i }),
    ).toHaveAttribute("href", "/gallery");
    expect(
      screen.queryByRole("button", { name: /apply to partner/i }),
    ).not.toBeInTheDocument();
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

  it("shows clear guidance and focuses the first invalid question", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    render(<DesignPartnerSection />);

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      await screen.findByText("Name must be at least 2 characters."),
    ).toBeVisible();
    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText(/^name/i)).toHaveFocus());
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText("Contact details")).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
  });

  it("keeps answers when moving backward through the guided form", async () => {
    render(<DesignPartnerSection />);

    fireEvent.change(screen.getByLabelText(/^name/i), {
      target: { value: "Avery Morgan" },
    });
    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: "avery@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.click(await screen.findByRole("button", { name: /back/i }));

    expect(await screen.findByLabelText(/^name/i)).toHaveValue("Avery Morgan");
    expect(screen.getByLabelText(/work email/i)).toHaveValue(
      "avery@example.com",
    );
  });

  it("uses the enhanced loader while submitting", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise<Response>(() => undefined),
    );
    const { container } = render(<DesignPartnerSection />);

    await completeApplication();
    fireEvent.click(screen.getByRole("button", { name: /apply to partner/i }));

    expect(await screen.findByText("Submitting")).toBeVisible();
    expect(
      container.querySelector('[data-slot="comet-spinner"]'),
    ).toBeInTheDocument();
    expect(container.querySelector(".lucide-loader-circle")).toBeNull();
  });
});
