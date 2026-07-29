// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { captureWebsiteScreenshot } from "@/features/generation/client/screenshot-capture";

describe("captureWebsiteScreenshot", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns a validated screenshot response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          screenshotData: "data:image/png;base64,cG5n",
          url: "https://example.com/",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      captureWebsiteScreenshot("https://example.com"),
    ).resolves.toMatchObject({
      success: true,
      screenshotData: "data:image/png;base64,cG5n",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/scrape-screenshot",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("aborts a capture that does not settle", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn((_input, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        });
      }),
    );

    const capture = captureWebsiteScreenshot("https://slow.example.com", {
      timeoutMs: 50,
    });
    const rejection = expect(capture).rejects.toThrow(
      "Website capture took too long",
    );

    await vi.advanceTimersByTimeAsync(50);
    await rejection;
  });
});
