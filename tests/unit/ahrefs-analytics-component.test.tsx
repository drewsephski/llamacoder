// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://www.squidagent.app/"}

import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AhrefsAnalytics } from "@/features/analytics/ahrefs-analytics";
import {
  AHREFS_ANALYTICS_KEY,
  AHREFS_ANALYTICS_SCRIPT_ID,
  AHREFS_ANALYTICS_SCRIPT_URL,
} from "@/features/analytics/ahrefs-config";

let currentPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

function setAhrefsApi(api?: { sendEvent: (eventName: string) => void }) {
  const analyticsWindow = window as typeof window & {
    AhrefsAnalytics?: { sendEvent: (eventName: string) => void };
  };

  if (api) analyticsWindow.AhrefsAnalytics = api;
  else delete analyticsWindow.AhrefsAnalytics;
}

describe("Ahrefs analytics loader", () => {
  beforeEach(() => {
    currentPathname = "/";
    setAhrefsApi();
    document.getElementById(AHREFS_ANALYTICS_SCRIPT_ID)?.remove();
  });

  it("loads in the head with automatic pageviews disabled and sanitized paths", async () => {
    const sendEvent = vi.fn();
    const view = render(<AhrefsAnalytics />);

    const script = await waitFor(() => {
      const element = document.getElementById(
        AHREFS_ANALYTICS_SCRIPT_ID,
      ) as HTMLScriptElement | null;
      expect(element).not.toBeNull();
      return element as HTMLScriptElement;
    });

    expect(script.parentElement).toBe(document.head);
    expect(script.src).toBe(AHREFS_ANALYTICS_SCRIPT_URL);
    expect(script.async).toBe(true);
    expect(script.getAttribute("data-key")).toBe(AHREFS_ANALYTICS_KEY);
    expect(script).toHaveAttribute("data-no-pageview-on-load", "");
    expect(script).toHaveAttribute("data-no-pageview-auto", "");
    expect(script).toHaveAttribute("data-page-location", "/");

    setAhrefsApi({ sendEvent });
    fireEvent.load(script);
    expect(sendEvent).toHaveBeenCalledOnce();
    expect(sendEvent).toHaveBeenLastCalledWith("pageview");

    currentPathname = "/blog/launch-guide/?utm_source=private-value";
    view.rerender(<AhrefsAnalytics />);

    await waitFor(() => expect(sendEvent).toHaveBeenCalledTimes(2));
    expect(script).toHaveAttribute("data-page-location", "/blog/launch-guide");
  });

  it("does not load on a private route", async () => {
    currentPathname = "/dashboard";
    render(<AhrefsAnalytics />);

    await Promise.resolve();
    expect(document.getElementById(AHREFS_ANALYTICS_SCRIPT_ID)).toBeNull();
  });
});
