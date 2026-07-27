import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/docs/source", () => ({
  docsSource: {
    getPages: () => [{ url: "/docs" }],
  },
}));

import sitemap from "@/app/sitemap";
import { CONTENT_REVIEW_DATE, SITE_URL } from "@/lib/marketing-pages";

describe("public sitemap", () => {
  it("uses content dates for reviewed pages and omits timestamps for unchanged static routes", async () => {
    const entries = await sitemap();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));
    const reviewDate = new Date(`${CONTENT_REVIEW_DATE}T00:00:00Z`);

    expect(byUrl.get(`${SITE_URL}/`)?.lastModified).toEqual(reviewDate);
    expect(
      byUrl.get(`${SITE_URL}/blog/export-react-app-from-ai`)?.lastModified,
    ).toEqual(reviewDate);
    expect(byUrl.get(`${SITE_URL}/docs`)?.lastModified).toBeUndefined();
    expect(byUrl.get(`${SITE_URL}/contact`)?.lastModified).toBeUndefined();
  });
});
