// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it, vi } from "vitest";

import DashboardError from "@/app/(main)/dashboard/error";
import MainError from "@/app/(main)/error";
import GalleryError from "@/app/(main)/gallery/error";

type ErrorBoundaryComponent = ComponentType<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

const cases: Array<{
  Component: ErrorBoundaryComponent;
  description: string;
  name: string;
  title: string;
}> = [
  {
    Component: MainError,
    description: "An unexpected error occurred. Please try again.",
    name: "main",
    title: "Something went wrong",
  },
  {
    Component: DashboardError,
    description: "We couldn't load your dashboard. Please try again.",
    name: "dashboard",
    title: "Failed to load dashboard",
  },
  {
    Component: GalleryError,
    description: "We couldn't load the gallery. Please try again.",
    name: "gallery",
    title: "Failed to load gallery",
  },
];

describe("page error boundaries", () => {
  for (const { Component, description, name, title } of cases) {
    it(`sanitizes the ${name} error while retaining its reference and actions`, () => {
      const reset = vi.fn();
      const rawMessage = `private ${name} database failure`;
      const error = Object.assign(new Error(rawMessage), {
        digest: `${name}-digest`,
      });
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      render(<Component error={error} reset={reset} />);

      const alert = screen.getByRole("alert");
      expect(alert.closest('[data-slot="page-status-shell"]')).toHaveClass(
        "min-h-dvh",
      );
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
      expect(
        screen.getByText(`Error reference: ${name}-digest`),
      ).toBeInTheDocument();
      expect(screen.queryByText(rawMessage)).not.toBeInTheDocument();
      expect(consoleError.mock.calls.some((args) => args.includes(error))).toBe(
        true,
      );

      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
      expect(reset).toHaveBeenCalledOnce();
      expect(
        screen.getByRole("button", {
          name: name === "main" ? "Go home" : "Refresh page",
        }),
      ).toBeInTheDocument();

      consoleError.mockRestore();
    });
  }
});
