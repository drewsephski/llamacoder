// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SupabaseTechnicalWalkthrough } from "@/components/supabase-technical-walkthrough";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Supabase technical walkthrough", () => {
  it("moves from a held generation gate to a verified release", async () => {
    render(<SupabaseTechnicalWalkthrough />);

    expect(
      screen.getByRole("heading", {
        name: "Generated code is not a backend.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("generation held")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "05Verify" }));
    expect(
      screen.getByRole("heading", { name: "Read the database back" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ownership_policies")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "06Generate" }));
    expect(screen.getByText("generation released")).toBeInTheDocument();
    expect(screen.getByText("service_role")).toBeInTheDocument();
    expect(screen.getByText("absent")).toBeInTheDocument();
  });
});
