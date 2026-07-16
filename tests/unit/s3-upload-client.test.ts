import { afterEach, describe, expect, it, vi } from "vitest";

import { uploadScreenshot } from "@/lib/s3-upload-client";

describe("uploadScreenshot", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads through the server-issued signed URL", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            bucket: "squid-uploads",
            key: "users/a screenshot.png",
            region: "us-east-1",
            url: "https://signed-upload.example",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["image"], "a screenshot.png", {
      type: "image/png",
    });

    await expect(uploadScreenshot(file)).resolves.toEqual({
      url: "https://squid-uploads.s3.us-east-1.amazonaws.com/users/a%20screenshot.png",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://signed-upload.example",
      expect.objectContaining({ method: "PUT", body: file }),
    );
  });

  it("surfaces errors returned by the signing endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: "Upload storage is unavailable." }),
          {
            status: 503,
          },
        ),
      ),
    );
    const file = new File(["image"], "screenshot.png", {
      type: "image/png",
    });

    await expect(uploadScreenshot(file)).rejects.toThrow(
      "Upload storage is unavailable.",
    );
  });
});
