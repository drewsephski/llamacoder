import { describe, expect, it } from "vitest";

import { getForSaleProduct } from "@/features/for-sale/products";

describe("getForSaleProduct", () => {
  it("returns route-specific product data for standalone landings", () => {
    expect(getForSaleProduct("/forma")?.name).toBe("Forma");
    expect(getForSaleProduct("/questly")?.assetHref).toBe(
      "/showcase/questly-hero.png",
    );
  });

  it("maps sale pages to immutable Stripe prices", () => {
    expect(getForSaleProduct("/forma")?.priceId).toBe(
      "price_1Tv0PrRWYMzP8fBmeKf9aAxP",
    );
  });

  it("covers every curated homepage landing route", () => {
    expect(getForSaleProduct("/mindloop")?.priceId).toBe(
      "price_1Tv1CZRWYMzP8fBmVS6CYKYC",
    );
    expect(getForSaleProduct("/sentinel")?.priceId).toBe(
      "price_1Tv1CYRWYMzP8fBmpvDe3Pjn",
    );
  });

  it("uses the parent showcase product on preview routes", () => {
    expect(getForSaleProduct("/gallery/cinder-studio/preview")?.assetHref).toBe(
      "/showcase/cinder-studio.webp",
    );
  });

  it("does not show on the main homepage or ordinary gallery routes", () => {
    expect(getForSaleProduct("/")).toBeNull();
    expect(getForSaleProduct("/gallery")).toBeNull();
    expect(getForSaleProduct("/gallery/community-project")).toBeNull();
  });
});
