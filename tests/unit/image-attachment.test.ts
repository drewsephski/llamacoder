// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import {
  getClipboardImageFile,
  getImageAttachmentError,
  readImageAttachmentAsDataUrl,
} from "@/features/generation/client/image-attachment";

describe("image attachment utilities", () => {
  it("extracts an image from clipboard items", () => {
    const image = new File(["png"], "pasted.png", { type: "image/png" });

    expect(
      getClipboardImageFile({
        items: [
          {
            kind: "file",
            type: "image/png",
            getAsFile: () => image,
          },
        ] as unknown as DataTransferItemList,
        files: [] as unknown as FileList,
      }),
    ).toBe(image);
  });

  it("rejects unsupported images and reads valid images locally", async () => {
    const unsupported = new File(["gif"], "animation.gif", {
      type: "image/gif",
    });
    const image = new File(["png"], "pasted.png", { type: "image/png" });

    expect(getImageAttachmentError(unsupported)).toContain(
      "PNG, JPEG, or WebP",
    );
    expect(getImageAttachmentError(image)).toBeNull();
    await expect(readImageAttachmentAsDataUrl(image)).resolves.toBe(
      "data:image/png;base64,cG5n",
    );
  });
});
