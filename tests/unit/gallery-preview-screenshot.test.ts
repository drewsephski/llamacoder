// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { capturePreviewScreenshot } from "@/features/gallery/client/preview-screenshot";

describe("capturePreviewScreenshot", () => {
  beforeEach(() => {
    document.body.innerHTML = '<iframe class="sp-preview-iframe"></iframe>';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests a screenshot from the preview iframe and resolves the blob", async () => {
    const iframe =
      document.querySelector<HTMLIFrameElement>(".sp-preview-iframe");
    if (!iframe) throw new Error("Missing preview iframe");

    const contentWindow = {
      postMessage: vi.fn(),
    } as unknown as Window;
    Object.defineProperty(iframe, "contentWindow", {
      value: contentWindow,
      configurable: true,
    });

    const promise = capturePreviewScreenshot();
    const postMessageCall = (
      contentWindow.postMessage as ReturnType<typeof vi.fn>
    ).mock.calls[0];
    const requestId = postMessageCall?.[0]?.requestId;
    expect(postMessageCall?.[0]).toEqual(
      expect.objectContaining({
        source: "squid-preview-parent",
        type: "capture-screenshot",
        width: 1280,
        height: 720,
        quality: 78,
      }),
    );

    const buffer = Uint8Array.from([0xff, 0xd8, 0xff, 0xdb]).buffer;
    window.dispatchEvent(
      new MessageEvent("message", {
        source: contentWindow,
        data: {
          source: "squid-preview-inspector",
          type: "screenshot",
          requestId,
          buffer,
          mimeType: "image/jpeg",
        },
      }),
    );

    await expect(promise).resolves.toEqual(
      expect.objectContaining({
        type: "image/jpeg",
        size: 4,
      }),
    );
  });

  it("rejects when the preview iframe is missing", async () => {
    document.body.innerHTML = "";

    await expect(capturePreviewScreenshot()).rejects.toThrow(
      "Preview iframe is not available.",
    );
  });
});
