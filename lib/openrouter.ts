import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getModelWithFallbacks } from "@/lib/model-fallbacks";

const MAX_OPENROUTER_FALLBACK_MODELS = 3;
export const GENERATED_CODE_MAX_TOKENS = 16000;

type OpenRouterClient = ReturnType<typeof createOpenRouter>;
type OpenRouterModelSettings = NonNullable<Parameters<OpenRouterClient>[1]>;

export function createAppOpenRouter({
  sessionId,
  sessionName,
}: {
  sessionId: string;
  sessionName: string;
}) {
  const options: Parameters<typeof createOpenRouter>[0] = {
    appName: "SquidCoder",
    appUrl:
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      process.env.BETTER_AUTH_URL ||
      undefined,
  };

  if (process.env.OPENROUTER_API_KEY) {
    options.apiKey = process.env.OPENROUTER_API_KEY;
  }

  if (process.env.HELICONE_API_KEY) {
    options.baseURL = "https://together.helicone.ai/v1";
    options.headers = {
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      "Helicone-Property-appname": "SquidCoder",
      "Helicone-Session-Id": sessionId,
      "Helicone-Session-Name": sessionName,
    };
  }

  return createOpenRouter(options);
}

export function getOpenRouterModelRoute(model: string) {
  const [primary = model, ...fallbacks] = getModelWithFallbacks(model);
  const safeFallbacks = Array.from(new Set(fallbacks))
    .filter((fallback) => fallback && fallback !== primary)
    .slice(0, MAX_OPENROUTER_FALLBACK_MODELS);

  return {
    primary,
    fallbacks: safeFallbacks.length > 0 ? safeFallbacks : undefined,
  };
}

export function createOpenRouterModel(
  openrouter: OpenRouterClient,
  model: string,
  settings: OpenRouterModelSettings = {},
) {
  const { primary, fallbacks } = getOpenRouterModelRoute(model);

  return openrouter(primary, {
    ...settings,
    models: fallbacks,
  });
}

export function getAIErrorMessage(error: unknown) {
  if (typeof error === "string") return error;

  if (error instanceof Error) {
    const responseBody = "responseBody" in error ? error.responseBody : null;
    if (typeof responseBody === "string") {
      try {
        const parsed = JSON.parse(responseBody);
        const message = parsed?.error?.message;
        if (typeof message === "string" && message.trim()) {
          return message;
        }
      } catch {
        // Fall back to the error message below.
      }
    }

    return error.message;
  }

  return "The model provider returned an unexpected error.";
}

export function getAIErrorStatus(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    if (error.statusCode >= 400 && error.statusCode < 500) return 502;
    if (error.statusCode >= 500 && error.statusCode < 600) return 503;
  }

  return 502;
}
