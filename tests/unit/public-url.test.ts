import { describe, expect, it } from "vitest";

import { parsePublicHttpUrl } from "@/features/security/server/public-url";

describe("parsePublicHttpUrl", () => {
  it.each([
    "http://localhost/admin",
    "http://127.0.0.1/",
    "http://10.0.0.1/",
    "http://169.254.169.254/latest/meta-data/",
    "http://192.168.1.2/",
    "http://[::1]/",
    "http://[fd00::1]/",
  ])("rejects private destination %s", async (url) => {
    await expect(parsePublicHttpUrl(url)).rejects.toThrow(
      "Private network destinations",
    );
  });

  it("rejects non-HTTP protocols", async () => {
    await expect(parsePublicHttpUrl("ftp://8.8.8.8/file")).rejects.toThrow(
      "Only HTTP and HTTPS",
    );
  });

  it("accepts a literal public IP without DNS lookup", async () => {
    await expect(parsePublicHttpUrl("https://8.8.8.8/path")).resolves.toEqual(
      new URL("https://8.8.8.8/path"),
    );
  });
});
