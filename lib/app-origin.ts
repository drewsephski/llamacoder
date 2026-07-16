import "server-only";

const DEVELOPMENT_APP_ORIGIN = "http://localhost:3000";

export function getAppOrigin(
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const configuredUrl =
    environment.NEXT_PUBLIC_APP_URL?.trim() ||
    environment.BETTER_AUTH_URL?.trim();

  if (!configuredUrl) {
    if (environment.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_APP_URL is required in production");
    }

    return DEVELOPMENT_APP_ORIGIN;
  }

  const url = new URL(configuredUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Application URL must use http or https");
  }

  return url.origin;
}
