const DEFAULT_CALLBACK_URL = "/dashboard";
const CALLBACK_URL_BASE = "https://squidagent.local";

export function getSafeCallbackUrl(
  value: string | null | undefined,
  fallback = DEFAULT_CALLBACK_URL,
): string {
  if (!value?.startsWith("/")) return fallback;

  try {
    const baseUrl = new URL(CALLBACK_URL_BASE);
    const callbackUrl = new URL(value, baseUrl);

    if (callbackUrl.origin !== baseUrl.origin) return fallback;

    return `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash}`;
  } catch {
    return fallback;
  }
}
