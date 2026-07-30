import { describe, expect, it } from "vitest";

import { getForSaleProducts } from "@/features/for-sale/products";
import { buildPurchasedPageBundle } from "@/features/for-sale/server/page-bundle";

describe.each(getForSaleProducts())(
  "purchased page bundle: $key",
  (product) => {
    it("builds a downloadable project with a valid package manifest", () => {
      const files = buildPurchasedPageBundle(product);
      const packageFile = files.find((file) => file.path === "package.json");

      expect(files.length).toBeGreaterThan(0);
      expect(packageFile).toBeDefined();
      expect(typeof packageFile?.content).toBe("string");

      const packageJson = JSON.parse(String(packageFile?.content)) as {
        dependencies?: Record<string, string>;
      };
      expect(packageJson.dependencies).toBeDefined();
      expect(Object.keys(packageJson.dependencies ?? {})).not.toContain(",");
    });
  },
);
