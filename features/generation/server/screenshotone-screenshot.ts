import "server-only";

const SCREENSHOTONE_TAKE_URL = "https://api.screenshotone.com/take";

const SCREENSHOT_VIEWPORT = {
  width: 1280,
  height: 720,
} as const;

type ScreenshotOneErrorResponse = {
  is_successful?: boolean;
  error_code?: string;
  error_message?: string;
};

export class ScreenshotOneError extends Error {
  status: number;
  errorCode?: string;

  constructor(message: string, status = 500, errorCode?: string) {
    super(message);
    this.name = "ScreenshotOneError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

function getRequiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) return null;
  if (value.startsWith("your_")) return null;
  return value;
}

export function getScreenshotOneConfig() {
  const accessKey = getRequiredEnvironmentValue("SCREENSHOTONE_ACCESS_KEY");
  if (!accessKey) return null;
  return { accessKey };
}

export function mapScreenshotOneError(
  errorCode: string | undefined,
  errorMessage: string,
  httpStatus?: number,
) {
  switch (errorCode) {
    case "name_not_resolved":
      return new ScreenshotOneError(
        "Could not resolve the website. Please check the URL and try again.",
        400,
        errorCode,
      );
    case "timeout_error":
      return new ScreenshotOneError(
        "The website took too long to load. Please try again or try a different URL.",
        408,
        errorCode,
      );
    case "network_error":
      return new ScreenshotOneError(
        "Connection timed out. The website may be blocking automated access.",
        400,
        errorCode,
      );
    default:
      if (httpStatus && httpStatus >= 400 && httpStatus < 500) {
        return new ScreenshotOneError(
          errorMessage || "Unable to capture screenshot for this URL.",
          httpStatus,
          errorCode,
        );
      }
      return new ScreenshotOneError(
        errorMessage || "Failed to capture screenshot",
        500,
        errorCode,
      );
  }
}

async function readScreenshotOneError(response: Response) {
  const body = (await response
    .json()
    .catch(() => null)) as ScreenshotOneErrorResponse | null;

  return mapScreenshotOneError(
    body?.error_code,
    body?.error_message?.trim() ||
      `ScreenshotOne failed with status ${response.status}.`,
    response.status,
  );
}

export async function capturePublicUrlScreenshot(url: string) {
  const config = getScreenshotOneConfig();
  if (!config) {
    throw new ScreenshotOneError(
      "ScreenshotOne is not configured. Add SCREENSHOTONE_ACCESS_KEY to your environment.",
      500,
    );
  }

  const response = await fetch(SCREENSHOTONE_TAKE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": config.accessKey,
      Accept: "image/png, application/json",
    },
    body: JSON.stringify({
      url,
      viewport_width: SCREENSHOT_VIEWPORT.width,
      viewport_height: SCREENSHOT_VIEWPORT.height,
      format: "png",
      wait_until: ["networkidle0"],
      timeout: 60,
      navigation_timeout: 30,
      block_cookie_banners: true,
      block_ads: true,
      block_chats: true,
    }),
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || contentType.includes("application/json")) {
    throw await readScreenshotOneError(response);
  }

  if (!contentType.startsWith("image/")) {
    throw new ScreenshotOneError(
      "ScreenshotOne returned an unexpected response.",
      502,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
