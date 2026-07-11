import { describe, expect, it } from "vitest";

import { getSafeCallbackUrl } from "@/lib/safe-redirect";

describe("getSafeCallbackUrl", () => {
  it("preserves internal paths, query strings, and fragments", () => {
    expect(getSafeCallbackUrl("/dashboard/usage?page=2#credits")).toBe(
      "/dashboard/usage?page=2#credits",
    );
  });

  it.each([
    undefined,
    null,
    "",
    "dashboard",
    "https://attacker.example/phishing",
    "//attacker.example/phishing",
    "/\\attacker.example/phishing",
  ])("falls back for unsafe callback value %s", (value) => {
    expect(getSafeCallbackUrl(value)).toBe("/dashboard");
  });
});
