import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GalleryPagination } from "@/features/gallery/components/gallery-pagination";

describe("GalleryPagination", () => {
  it("preserves active filters in previous and next links", () => {
    const html = renderToStaticMarkup(
      <GalleryPagination
        query="focus app"
        remixable
        sort="oldest"
        previousCursor="previous-token"
        nextCursor="next-token"
      />,
    );

    expect(html).toContain('aria-label="Community project pages"');
    expect(html).toContain("q=focus+app");
    expect(html).toContain("remixable=true");
    expect(html).toContain("sort=oldest");
    expect(html).toContain("cursor=previous-token");
    expect(html).toContain("cursor=next-token");
  });

  it("renders nothing when there is only one page", () => {
    expect(
      renderToStaticMarkup(
        <GalleryPagination
          query=""
          remixable={false}
          sort="newest"
          previousCursor={null}
          nextCursor={null}
        />,
      ),
    ).toBe("");
  });
});
