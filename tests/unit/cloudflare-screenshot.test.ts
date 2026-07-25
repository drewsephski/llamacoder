import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  capturePublicUrlScreenshot,
  CloudflareScreenshotError,
  getCloudflareBrowserRenderingConfig,
  mapCloudflareScreenshotError,
} from "@/features/generation/server/cloudflare-screenshot";

describe("cloudflare screenshot capture", () => {
  const originalAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const originalApiToken = process.env.CLOUDFLARE_API_TOKEN;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.CLOUDFLARE_ACCOUNT_ID = "account_test";
    process.env.CLOUDFLARE_API_TOKEN = "token_test";
  });

  afterEach(() => {
    process.env.CLOUDFLARE_ACCOUNT_ID = originalAccountId;
    process.env.CLOUDFLARE_API_TOKEN = originalApiToken;
  });

  it("returns null when Cloudflare Browser Rendering is not configured", () => {
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    expect(getCloudflareBrowserRenderingConfig()).toBeNull();
  });

  it("captures a screenshot through the Browser Rendering REST API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(Buffer.from("png"), {
        status: 200,
        headers: { "content-type": "image/png" },
      }),
    );

    const screenshot = await capturePublicUrlScreenshot("https://example.com");

    expect(screenshot).toEqual(Buffer.from("png"));
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/account_test/browser-rendering/screenshot",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token_test",
        }),
      }),
    );

    const requestBody = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as {
      url: string;
      viewport: { width: number; height: number };
      gotoOptions: { waitUntil: string; timeout: number };
    };
    expect(requestBody).toEqual({
      url: "https://example.com",
      viewport: { width: 1280, height: 720 },
      gotoOptions: { waitUntil: "networkidle0", timeout: 30_000 },
    });
  });

  it("maps Cloudflare API failures to user-facing errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          errors: [{ message: "Navigation timeout of 30000 ms exceeded" }],
        }),
        { status: 500, headers: { "content-type": "application/json" } },
      ),
    );

    await expect(
      capturePublicUrlScreenshot("https://slow.example.com"),
    ).rejects.toEqual(
      expect.objectContaining({
        status: 408,
        message: expect.stringContaining("too long to load"),
      }),
    );
  });

  it("maps DNS failures to retryable client errors", () => {
    const error = mapCloudflareScreenshotError("net::ERR_NAME_NOT_RESOLVED");
    expect(error).toBeInstanceOf(CloudflareScreenshotError);
    expect(error.status).toBe(400);
    expect(error.message).toContain("Could not resolve");
  });
});
