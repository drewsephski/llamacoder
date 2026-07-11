import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readJson } from "../fixtures/builders";

const {
  consumeRateLimitMock,
  getCurrentSessionMock,
  parsePublicHttpUrlMock,
  stagehandConstructorMock,
  stagehandInstance,
} = vi.hoisted(() => {
  const page = {
    goto: vi.fn(),
    waitForLoadState: vi.fn(),
    screenshot: vi.fn(),
  };
  const instance = {
    init: vi.fn(),
    close: vi.fn(),
    context: {
      pages: vi.fn(() => [page]),
      newPage: vi.fn(async () => page),
    },
    page,
  };

  return {
    consumeRateLimitMock: vi.fn(),
    getCurrentSessionMock: vi.fn(),
    parsePublicHttpUrlMock: vi.fn(async (input: string) => {
      const url = new URL(input);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Unsupported protocol");
      }
      return url;
    }),
    stagehandConstructorMock: vi.fn(function Stagehand() {
      return instance;
    }),
    stagehandInstance: instance,
  };
});

vi.mock("@/features/auth/server/session", () => ({
  getCurrentSession: getCurrentSessionMock,
}));

vi.mock("@/features/security/server/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
}));

vi.mock("@/features/security/server/public-url", () => ({
  parsePublicHttpUrl: parsePublicHttpUrlMock,
}));

vi.mock("@browserbasehq/stagehand", () => ({
  Stagehand: stagehandConstructorMock,
}));

import { POST } from "@/app/api/scrape-screenshot/route";

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/scrape-screenshot", {
    method: "POST",
    body: JSON.stringify(body),
  }) as never;
}

describe("/api/scrape-screenshot", () => {
  const originalApiKey = process.env.BROWSERBASE_API_KEY;
  const originalProjectId = process.env.BROWSERBASE_PROJECT_ID;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BROWSERBASE_API_KEY = "bb_test";
    process.env.BROWSERBASE_PROJECT_ID = "proj_test";
    getCurrentSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    consumeRateLimitMock.mockResolvedValue({ allowed: true, remaining: 5 });
    stagehandInstance.page.screenshot.mockResolvedValue(Buffer.from("png"));
    stagehandInstance.page.waitForLoadState.mockResolvedValue(undefined);
  });

  it("requires authentication before starting a browser session", async () => {
    getCurrentSessionMock.mockResolvedValueOnce(null);

    const response = await POST(request({ url: "https://example.com" }));

    expect(response.status).toBe(401);
    await expect(readJson(response)).resolves.toEqual({
      error: "Unauthorized",
    });
    expect(stagehandConstructorMock).not.toHaveBeenCalled();
  });

  it("rate limits browser sessions before provider initialization", async () => {
    consumeRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      retryAfterSeconds: 30,
    });

    const response = await POST(request({ url: "https://example.com" }));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(stagehandConstructorMock).not.toHaveBeenCalled();
  });

  afterEach(() => {
    process.env.BROWSERBASE_API_KEY = originalApiKey;
    process.env.BROWSERBASE_PROJECT_ID = originalProjectId;
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

  it("rejects missing Browserbase configuration", async () => {
    delete process.env.BROWSERBASE_API_KEY;

    const response = await POST(request({ url: "https://example.com" }));

    expect(response.status).toBe(500);
    await expect(readJson(response)).resolves.toMatchObject({
      error: "BROWSERBASE_API_KEY not configured",
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
    expect(stagehandConstructorMock).toHaveBeenCalledWith({
      apiKey: "bb_test",
      projectId: "proj_test",
      env: "BROWSERBASE",
      disablePino: true,
    });
    expect(stagehandInstance.page.goto).toHaveBeenCalledWith(
      "https://example.com/path",
      {
        waitUntil: "domcontentloaded",
        timeoutMs: 30000,
      },
    );
    expect(stagehandInstance.page.waitForLoadState).toHaveBeenCalledWith(
      "networkidle",
      5000,
    );
    expect(stagehandInstance.close).toHaveBeenCalled();
  });

  it("maps DNS and timeout failures to retryable client errors", async () => {
    stagehandInstance.page.goto.mockRejectedValueOnce(
      new Error("net::ERR_NAME_NOT_RESOLVED"),
    );

    let response = await POST(request({ url: "https://missing.test" }));
    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toMatchObject({
      error: expect.stringContaining("Could not resolve"),
    });

    stagehandInstance.page.goto.mockRejectedValueOnce(
      new Error("Navigation timeout"),
    );
    response = await POST(request({ url: "https://slow.test" }));
    expect(response.status).toBe(408);
    expect(stagehandInstance.close).toHaveBeenCalledTimes(2);
  });
});
