import { describe, expect, it } from "vitest";

import { getAppOrigin } from "@/lib/app-origin";

describe("application origin", () => {
  it("uses the configured canonical origin and strips paths", () => {
    expect(
      getAppOrigin({
        NODE_ENV: "production",
        NEXT_PUBLIC_APP_URL: "https://www.squidagent.app/some/path",
      }),
    ).toBe("https://www.squidagent.app");
  });

  it("does not depend on request-controlled origin values", () => {
    expect(
      getAppOrigin({
        NODE_ENV: "production",
        NEXT_PUBLIC_APP_URL: "https://www.squidagent.app",
        HTTP_ORIGIN: "https://attacker.example",
      }),
    ).toBe("https://www.squidagent.app");
  });

  it("falls back locally but requires configuration in production", () => {
    expect(getAppOrigin({ NODE_ENV: "development" })).toBe(
      "http://localhost:3000",
    );
    expect(() => getAppOrigin({ NODE_ENV: "production" })).toThrow(
      "NEXT_PUBLIC_APP_URL is required in production",
    );
  });

  it("rejects non-http application URLs", () => {
    expect(() =>
      getAppOrigin({
        NODE_ENV: "production",
        NEXT_PUBLIC_APP_URL: "javascript:alert(1)",
      }),
    ).toThrow("Application URL must use http or https");
  });
});
