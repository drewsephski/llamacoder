const PREVIEW_INSPECTOR_SOURCE = "squid-preview-inspector";
const PREVIEW_PARENT_SOURCE = "squid-preview-parent";
const CAPTURE_TIMEOUT_MS = 30_000;

export const GALLERY_THUMBNAIL_WIDTH = 1280;
export const GALLERY_THUMBNAIL_HEIGHT = 720;
export const GALLERY_THUMBNAIL_QUALITY = 78;
export const GALLERY_THUMBNAIL_SETTLE_MS = 1_000;

function getPreviewIframe(root: ParentNode) {
  return root.querySelector<HTMLIFrameElement>(".sp-preview-iframe");
}

export async function capturePreviewScreenshot({
  width = GALLERY_THUMBNAIL_WIDTH,
  height = GALLERY_THUMBNAIL_HEIGHT,
  quality = GALLERY_THUMBNAIL_QUALITY,
  root = document,
}: {
  width?: number;
  height?: number;
  quality?: number;
  root?: ParentNode;
} = {}): Promise<Blob> {
  const iframe = getPreviewIframe(root);
  const iframeWindow = iframe?.contentWindow;
  if (!iframeWindow) {
    throw new Error("Preview iframe is not available.");
  }

  const requestId = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Preview screenshot timed out."));
    }, CAPTURE_TIMEOUT_MS);

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
    }

    function onMessage(event: MessageEvent) {
      if (event.source !== iframeWindow) return;

      const message = event.data;
      if (
        !message ||
        message.source !== PREVIEW_INSPECTOR_SOURCE ||
        message.type !== "screenshot" ||
        message.requestId !== requestId
      ) {
        return;
      }

      cleanup();

      if (typeof message.error === "string" && message.error.length > 0) {
        reject(new Error(message.error));
        return;
      }

      if (!(message.buffer instanceof ArrayBuffer)) {
        reject(new Error("Invalid screenshot payload."));
        return;
      }

      resolve(
        new Blob([message.buffer], {
          type:
            typeof message.mimeType === "string"
              ? message.mimeType
              : "image/jpeg",
        }),
      );
    }

    window.addEventListener("message", onMessage);
    iframeWindow.postMessage(
      {
        source: PREVIEW_PARENT_SOURCE,
        type: "capture-screenshot",
        requestId,
        width,
        height,
        quality,
      },
      "*",
    );
  });
}

export async function waitForPreviewScreenshot({
  isReady,
  timeoutMs = CAPTURE_TIMEOUT_MS,
  pollIntervalMs = 250,
}: {
  isReady: () => boolean;
  timeoutMs?: number;
  pollIntervalMs?: number;
}) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (isReady()) return;
    await new Promise((resolve) => window.setTimeout(resolve, pollIntervalMs));
  }

  throw new Error("Preview did not become ready in time.");
}

export function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
