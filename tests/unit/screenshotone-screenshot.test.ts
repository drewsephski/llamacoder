import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  capturePublicUrlScreenshot,
  getScreenshotOneConfig,
  mapScreenshotOneError,
  ScreenshotOneError,
} from "@/features/generation/server/screenshotone-screenshot";

describe("screenshotone screenshot capture", () => {
  const originalAccessKey = process.env.SCREENSHOTONE_ACCESS_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.SCREENSHOTONE_ACCESS_KEY = "access_test";
  });

  afterEach(() => {
    process.env.SCREENSHOTONE_ACCESS_KEY = originalAccessKey;
  });

  it("returns null when ScreenshotOne is not configured", () => {
    delete process.env.SCREENSHOTONE_ACCESS_KEY;
    expect(getScreenshotOneConfig()).toBeNull();
  });

  it("captures a screenshot through the ScreenshotOne /take API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(Buffer.from("png"), {
        status: 200,
        headers: { "content-type": "image/png" },
      }),
    );

    const screenshot = await capturePublicUrlScreenshot("https://example.com");

    expect(screenshot).toEqual(Buffer.from("png"));
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.screenshotone.com/take",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Access-Key": "access_test",
        }),
      }),
    );

    const requestBody = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as {
      url: string;
      viewport_width: number;
      viewport_height: number;
      format: string;
      wait_until: string[];
      delay: number;
      timeout: number;
      navigation_timeout: number;
      block_cookie_banners: boolean;
      block_ads: boolean;
      block_chats: boolean;
    };
    expect(requestBody).toEqual({
      url: "https://example.com",
      viewport_width: 1280,
      viewport_height: 720,
      format: "png",
      wait_until: ["domcontentloaded"],
      delay: 2,
      timeout: 35,
      navigation_timeout: 20,
      block_cookie_banners: true,
      block_ads: true,
      block_chats: true,
    });
  });

  it("aborts a screenshot request before the serverless function deadline", async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        }),
    );

    const capture = capturePublicUrlScreenshot("https://slow.example.com", {
      transportTimeoutMs: 50,
    });
    const rejection = expect(capture).rejects.toEqual(
      expect.objectContaining({
        status: 504,
        errorCode: "transport_timeout",
        message: expect.stringContaining("did not respond in time"),
      }),
    );

    await vi.advanceTimersByTimeAsync(50);
    await rejection;
    vi.useRealTimers();
  });

  it("maps ScreenshotOne timeout errors to user-facing errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          is_successful: false,
          error_code: "timeout_error",
          error_message:
            "The screenshot couldn't be taken within the specified timeout.",
        }),
        { status: 408, headers: { "content-type": "application/json" } },
      ),
    );

    await expect(
      capturePublicUrlScreenshot("https://slow.example.com"),
    ).rejects.toEqual(
      expect.objectContaining({
        status: 408,
        errorCode: "timeout_error",
        message: expect.stringContaining("too long to load"),
      }),
    );
  });

  it("maps name_not_resolved errors to retryable client errors", () => {
    const error = mapScreenshotOneError(
      "name_not_resolved",
      "Domain not resolved",
    );
    expect(error).toBeInstanceOf(ScreenshotOneError);
    expect(error.status).toBe(400);
    expect(error.message).toContain("Could not resolve");
  });
});
