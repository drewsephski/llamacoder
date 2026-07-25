import "server-only";

const SCREENSHOT_VIEWPORT = {
  width: 1280,
  height: 720,
} as const;

const SCREENSHOT_GOTO_OPTIONS = {
  waitUntil: "networkidle0",
  timeout: 30_000,
} as const;

type CloudflareApiErrorResponse = {
  success?: boolean;
  errors?: Array<{ message?: string; code?: number }>;
};

export class CloudflareScreenshotError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "CloudflareScreenshotError";
    this.status = status;
  }
}

function getRequiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) return null;
  if (value.startsWith("your_")) return null;
  return value;
}

export function getCloudflareBrowserRenderingConfig() {
  const accountId = getRequiredEnvironmentValue("CLOUDFLARE_ACCOUNT_ID");
  const apiToken = getRequiredEnvironmentValue("CLOUDFLARE_API_TOKEN");

  if (!accountId || !apiToken) {
    return null;
  }

  return { accountId, apiToken };
}

export function mapCloudflareScreenshotError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("err_name_not_resolved") ||
    normalized.includes("name not resolved") ||
    normalized.includes("dns")
  ) {
    return new CloudflareScreenshotError(
      "Could not resolve the website. Please check the URL and try again.",
      400,
    );
  }

  if (
    normalized.includes("timeout") ||
    normalized.includes("timed out") ||
    normalized.includes("navigation")
  ) {
    return new CloudflareScreenshotError(
      "The website took too long to load. Please try again or try a different URL.",
      408,
    );
  }

  if (
    normalized.includes("connection") &&
    (normalized.includes("refused") ||
      normalized.includes("failed") ||
      normalized.includes("reset"))
  ) {
    return new CloudflareScreenshotError(
      "Connection timed out. The website may be blocking automated access.",
      400,
    );
  }

  return new CloudflareScreenshotError(
    message || "Failed to capture screenshot",
    500,
  );
}

async function readCloudflareErrorMessage(response: Response) {
  const body = (await response
    .json()
    .catch(() => null)) as CloudflareApiErrorResponse | null;
  const message = body?.errors?.[0]?.message?.trim();
  if (message) return message;
  return `Cloudflare Browser Rendering failed with status ${response.status}.`;
}

export async function capturePublicUrlScreenshot(url: string) {
  const config = getCloudflareBrowserRenderingConfig();
  if (!config) {
    throw new CloudflareScreenshotError(
      "Cloudflare Browser Rendering is not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to your environment.",
      500,
    );
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/browser-rendering/screenshot`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
        Accept: "image/png",
      },
      body: JSON.stringify({
        url,
        viewport: SCREENSHOT_VIEWPORT,
        gotoOptions: SCREENSHOT_GOTO_OPTIONS,
      }),
    },
  );

  if (!response.ok) {
    const message = await readCloudflareErrorMessage(response);
    throw mapCloudflareScreenshotError(message);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new CloudflareScreenshotError(
      "Cloudflare Browser Rendering returned an unexpected response.",
      502,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
