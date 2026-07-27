import { describe, expect, it } from "vitest";

import {
  AHREFS_ANALYTICS_KEY,
  AHREFS_ANALYTICS_SCRIPT_URL,
  isAhrefsAnalyticsHost,
  isAhrefsAnalyticsPath,
  normalizeAnalyticsPathname,
} from "@/features/analytics/ahrefs-config";
import { getShowcaseGameSummaries } from "@/features/gallery/showcase-games";
import { getShowcaseLandingSummaries } from "@/features/gallery/showcase-landings";
import { marketingLandingPaths, marketingPaths } from "@/lib/marketing-pages";

describe("Ahrefs analytics scope", () => {
  it("covers every public marketing and curated gallery page", () => {
    const publicPaths = [
      "/",
      "/what-is-squid-agent",
      ...marketingLandingPaths,
      ...marketingPaths,
      ...getShowcaseGameSummaries().map((game) => `/gallery/${game.slug}`),
      ...getShowcaseLandingSummaries().map(
        (landing) => `/gallery/${landing.slug}`,
      ),
      "/contact",
      "/privacy",
      "/terms",
      "/cookies",
    ];

    for (const path of publicPaths) {
      expect(isAhrefsAnalyticsPath(path), path).toBe(true);
    }
  });

  it("excludes private, account, preview, and unreviewed gallery routes", () => {
    const excludedPaths = [
      "/admin",
      "/chats/project_123",
      "/dashboard",
      "/dashboard/usage",
      "/gallery/community-project-123",
      "/gallery/cinder-studio/preview",
      "/reset-password",
      "/share/v2/message_123",
      "/sign-in",
      "/sign-up",
      "/verify-email",
    ];

    for (const path of excludedPaths) {
      expect(isAhrefsAnalyticsPath(path), path).toBe(false);
    }
  });

  it("matches public prefixes on segment boundaries only", () => {
    expect(isAhrefsAnalyticsPath("/blog/launch-guide/")).toBe(true);
    expect(isAhrefsAnalyticsPath("/docs?source=nav")).toBe(true);
    expect(isAhrefsAnalyticsPath("/blog-private")).toBe(false);
    expect(
      normalizeAnalyticsPathname("/compare/example/?utm_source=test"),
    ).toBe("/compare/example");
  });

  it("only enables the production hosts with the configured public key", () => {
    expect(isAhrefsAnalyticsHost("www.squidagent.app")).toBe(true);
    expect(isAhrefsAnalyticsHost("SQUIDAGENT.APP")).toBe(true);
    expect(isAhrefsAnalyticsHost("preview.vercel.app")).toBe(false);
    expect(isAhrefsAnalyticsHost("localhost")).toBe(false);
    expect(AHREFS_ANALYTICS_SCRIPT_URL).toBe(
      "https://analytics.ahrefs.com/analytics.js",
    );
    expect(AHREFS_ANALYTICS_KEY).toBe("O4gKckTzoHrR2FUZoZUz8w");
  });
});
