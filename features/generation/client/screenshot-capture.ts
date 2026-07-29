const DEFAULT_SCREENSHOT_CAPTURE_TIMEOUT_MS = 55_000;

type ScreenshotCaptureResponse = {
  success: true;
  screenshotData: string;
  url: string;
};

function isScreenshotCaptureResponse(
  value: unknown,
): value is ScreenshotCaptureResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<ScreenshotCaptureResponse>;
  return (
    response.success === true &&
    typeof response.screenshotData === "string" &&
    response.screenshotData.startsWith("data:image/") &&
    typeof response.url === "string"
  );
}

export async function captureWebsiteScreenshot(
  url: string,
  options: { timeoutMs?: number } = {},
) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_SCREENSHOT_CAPTURE_TIMEOUT_MS;
  let timedOut = false;
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch("/api/scrape-screenshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: string; message?: string }
      | ScreenshotCaptureResponse
      | null;

    if (!response.ok) {
      const errorResponse = data as {
        error?: string;
        message?: string;
      } | null;
      throw new Error(
        errorResponse?.error ||
          errorResponse?.message ||
          "Failed to capture website",
      );
    }
    if (!isScreenshotCaptureResponse(data)) {
      throw new Error("Website capture returned an invalid response.");
    }

    return data;
  } catch (error) {
    if (timedOut) {
      throw new Error(
        "Website capture took too long. Please try again or use a screenshot instead.",
      );
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
