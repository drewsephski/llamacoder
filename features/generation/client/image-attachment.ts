import {
  ACCEPTED_SCREENSHOT_MIME_TYPES,
  MAX_SCREENSHOT_BYTES,
  MAX_SCREENSHOT_SIZE_MB,
} from "@/lib/constants";

const ACCEPTED_SCREENSHOT_TYPES = new Set<string>(
  ACCEPTED_SCREENSHOT_MIME_TYPES,
);

export const IMAGE_ATTACHMENT_ACCEPT = ACCEPTED_SCREENSHOT_MIME_TYPES.join(",");

export function getImageAttachmentError(file: File) {
  if (!ACCEPTED_SCREENSHOT_TYPES.has(file.type)) {
    return "Please attach a PNG, JPEG, or WebP image.";
  }

  if (file.size > MAX_SCREENSHOT_BYTES) {
    return `Please attach an image under ${MAX_SCREENSHOT_SIZE_MB} MB.`;
  }

  return null;
}

export function readImageAttachmentAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read image file."));
    };
    reader.onerror = () => {
      reject(new Error("Unable to read image file."));
    };
    reader.readAsDataURL(file);
  });
}

export function getClipboardImageFile(
  clipboardData: Pick<DataTransfer, "files" | "items">,
) {
  for (const item of Array.from(clipboardData.items)) {
    if (item.kind !== "file" || !item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (file) return file;
  }

  return (
    Array.from(clipboardData.files).find((file) =>
      file.type.startsWith("image/"),
    ) ?? null
  );
}
