import { describe, expect, it } from "vitest";

import {
  createResearchWindow,
  extractRecentWebSources,
} from "@/features/generation/research-policy";

describe("research policy", () => {
  it("creates an exact rolling six-month UTC window", () => {
    expect(
      createResearchWindow(new Date("2026-07-31T12:30:00.000Z")),
    ).toMatchObject({
      startIso: "2026-01-31T12:30:00.000Z",
      endIso: "2026-07-31T12:30:00.000Z",
      startDate: "2026-01-31",
      endDate: "2026-07-31",
    });
  });

  it("clamps month-end dates instead of rolling into the next month", () => {
    expect(
      createResearchWindow(new Date("2026-08-31T12:30:00.000Z")),
    ).toMatchObject({ startIso: "2026-02-28T12:30:00.000Z" });
  });

  it("keeps only dated, in-window sources and deduplicates URLs", () => {
    const window = createResearchWindow(
      new Date("2026-07-11T12:00:00.000Z"),
    );
    const sources = extractRecentWebSources(
      [
        {
          results: [
            {
              title: "Recent official update",
              url: "https://example.com/recent",
              publishedDate: "2026-06-20T09:00:00.000Z",
              highlights: ["Verified current facts"],
            },
            {
              title: "Too old",
              url: "https://example.com/old",
              publishedDate: "2025-12-31T23:59:59.000Z",
              text: "Stale facts",
            },
            {
              title: "Missing date",
              url: "https://example.com/undated",
              text: "Unverifiable facts",
            },
          ],
        },
        {
          results: [
            {
              title: "Duplicate",
              url: "https://example.com/recent",
              publishedDate: "2026-07-01T09:00:00.000Z",
            },
          ],
        },
      ],
      window,
    );

    expect(sources).toEqual([
      {
        title: "Recent official update",
        url: "https://example.com/recent",
        publishedDate: "2026-06-20T09:00:00.000Z",
        excerpt: "Verified current facts",
      },
    ]);
  });
});
