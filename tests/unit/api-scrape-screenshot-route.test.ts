import { beforeEach, describe, expect, it, vi } from "vitest";
import { readJson } from "../fixtures/builders";

const {
  capturePublicUrlScreenshotMock,
  consumeRateLimitMock,
  getCloudflareBrowserRenderingConfigMock,
  getCurrentSessionMock,
  parsePublicHttpUrlMock,
} = vi.hoisted(() => ({
  capturePublicUrlScreenshotMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
  getCloudflareBrowserRenderingConfigMock: vi.fn(),
  getCurrentSessionMock: vi.fn(),
  parsePublicHttpUrlMock: vi.fn(async (input: string) => {
    const url = new URL(input);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }
    return url;
  }),
}));

vi.mock("@/features/auth/server/session", () => ({
  getCurrentSession: getCurrentSessionMock,
}));

vi.mock("@/features/security/server/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
}));

vi.mock("@/features/security/server/public-url", () => ({
  parsePublicHttpUrl: parsePublicHttpUrlMock,
}));

vi.mock("@/features/generation/server/cloudflare-screenshot", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/generation/server/cloudflare-screenshot")
  >("@/features/generation/server/cloudflare-screenshot");

  return {
    ...actual,
    capturePublicUrlScreenshot: capturePublicUrlScreenshotMock,
    getCloudflareBrowserRenderingConfig:
      getCloudflareBrowserRenderingConfigMock,
  };
});

import { CloudflareScreenshotError } from "@/features/generation/server/cloudflare-screenshot";
import { POST } from "@/app/api/scrape-screenshot/route";

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/scrape-screenshot", {
    method: "POST",
    body: JSON.stringify(body),
  }) as never;
}

describe("/api/scrape-screenshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    consumeRateLimitMock.mockResolvedValue({ allowed: true, remaining: 5 });
    getCloudflareBrowserRenderingConfigMock.mockReturnValue({
      accountId: "account_test",
      apiToken: "token_test",
    });
    capturePublicUrlScreenshotMock.mockResolvedValue(Buffer.from("png"));
  });

  it("requires authentication before starting a browser session", async () => {
    getCurrentSessionMock.mockResolvedValueOnce(null);

    const response = await POST(request({ url: "https://example.com" }));

    expect(response.status).toBe(401);
    await expect(readJson(response)).resolves.toEqual({
      error: "Unauthorized",
    });
    expect(capturePublicUrlScreenshotMock).not.toHaveBeenCalled();
  });

  it("rate limits browser sessions before provider initialization", async () => {
    consumeRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      retryAfterSeconds: 30,
    });

    const response = await POST(request({ url: "https://example.com" }));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(capturePublicUrlScreenshotMock).not.toHaveBeenCalled();
  });

  it("rejects missing URLs and unsupported protocols", async () => {
    let response = await POST(request({}));
    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toEqual({
      error: "A valid URL is required",
    });

    response = await POST(request({ url: "ftp://example.com" }));
    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toMatchObject({
      error: expect.stringContaining("Invalid URL format"),
    });
  });

  it("rejects missing Cloudflare Browser Rendering configuration", async () => {
    getCloudflareBrowserRenderingConfigMock.mockReturnValueOnce(null);

    const response = await POST(request({ url: "https://example.com" }));

    expect(response.status).toBe(500);
    await expect(readJson(response)).resolves.toMatchObject({
      error: "CLOUDFLARE_BROWSER_RENDERING_NOT_CONFIGURED",
    });
  });

  it("returns a data URL for successful mocked screenshots", async () => {
    const response = await POST(request({ url: "https://example.com/path" }));

    expect(response.status).toBe(200);
    await expect(readJson(response)).resolves.toEqual({
      success: true,
      screenshotData: `data:image/png;base64,${Buffer.from("png").toString("base64")}`,
      url: "https://example.com/path",
    });
    expect(capturePublicUrlScreenshotMock).toHaveBeenCalledWith(
      "https://example.com/path",
    );
  });

  it("maps DNS and timeout failures to retryable client errors", async () => {
    capturePublicUrlScreenshotMock.mockRejectedValueOnce(
      new CloudflareScreenshotError(
        "Could not resolve the website. Please check the URL and try again.",
        400,
      ),
    );

    let response = await POST(request({ url: "https://missing.test" }));
    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toMatchObject({
      error: expect.stringContaining("Could not resolve"),
    });

    capturePublicUrlScreenshotMock.mockRejectedValueOnce(
      new CloudflareScreenshotError(
        "The website took too long to load. Please try again or try a different URL.",
        408,
      ),
    );
    response = await POST(request({ url: "https://slow.test" }));
    expect(response.status).toBe(408);
  });
});
