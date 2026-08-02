import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  DEFAULT_MODEL,
  getModelReasoningCapability,
  type ReasoningEffort,
} from "@/lib/constants";
import { getOpenRouterMaxPrice, hasModelPricing } from "@/lib/billing/config";
import { getModelWithFallbacks } from "@/lib/model-fallbacks";
import { assertGenerationAvailable } from "@/lib/provider-controls";
import { getErrorMessage } from "@/features/shared/errors";
import type { SystemModelMessage } from "ai";

const MAX_OPENROUTER_FALLBACK_MODELS = 3;
export const HELICONE_OPENROUTER_BASE_URL =
  "https://openrouter.helicone.ai/api/v1";
export const GENERATED_CODE_MAX_TOKENS = 16000;
export const VISION_ANALYSIS_MODEL =
  process.env.OPENROUTER_VISION_MODEL || DEFAULT_MODEL;
type OpenRouterClient = ReturnType<typeof createOpenRouter>;
type OpenRouterModelSettings = NonNullable<Parameters<OpenRouterClient>[1]>;
type OpenRouterProviderOptions = {
  openrouter: {
    reasoning:
      | { enabled: boolean; exclude?: boolean }
      | { effort: ReasoningEffort; exclude?: boolean };
  };
};
type OpenRouterRoutingOptions = {
  enforceMaxPrice?: boolean;
  sort?: "price" | "throughput" | "latency";
};

export type GenerationQuality = "high" | "low";

export type OpenRouterReasoningSelection = {
  enabled: boolean;
  visible: boolean;
  mandatory: boolean;
  effort: ReasoningEffort | "default" | "none";
  providerOptions?: OpenRouterProviderOptions;
};

export function createAppOpenRouter({
  sessionId,
  sessionName,
}: {
  sessionId: string;
  sessionName: string;
}) {
  const options: Parameters<typeof createOpenRouter>[0] = {
    appName: "SquidAgent",
    appUrl:
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      process.env.BETTER_AUTH_URL ||
      undefined,
  };

  if (process.env.OPENROUTER_API_KEY) {
    options.apiKey = process.env.OPENROUTER_API_KEY;
  }

  if (process.env.HELICONE_API_KEY) {
    options.baseURL = HELICONE_OPENROUTER_BASE_URL;
    options.headers = {
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      "Helicone-Property-appname": "SquidAgent",
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

export function getCacheableSystemPrompt(
  model: string,
  content: string | undefined,
): string | SystemModelMessage | undefined {
  if (!content) return content;
  const { primary } = getOpenRouterModelRoute(model);
  if (!primary.startsWith("anthropic/")) return content;

  return {
    role: "system",
    content,
    providerOptions: {
      openrouter: {
        cacheControl: { type: "ephemeral" },
      },
    },
  };
}

export function createOpenRouterModel(
  openrouter: OpenRouterClient,
  model: string,
  settings: OpenRouterModelSettings = {},
  routing: OpenRouterRoutingOptions = {},
) {
  assertGenerationAvailable(model);
  const { primary, fallbacks } = getOpenRouterModelRoute(model);
  if (!hasModelPricing(primary)) {
    throw new Error(`UNPRICED_MODEL:${model}`);
  }

  const maxPrice = getOpenRouterMaxPrice(primary);
  const configuredProvider = settings.provider;
  const enforceMaxPrice = routing.enforceMaxPrice !== false;

  return openrouter(primary, {
    ...settings,
    models: fallbacks,
    provider: {
      sort: routing.sort ?? "price",
      ...configuredProvider,
      ...(enforceMaxPrice
        ? {
            max_price: {
              prompt: maxPrice.inputPricePerMillion,
              completion: maxPrice.outputPricePerMillion,
              ...configuredProvider?.max_price,
            },
          }
        : { max_price: undefined }),
    },
  });
}

type OpenRouterUsageMetadata = {
  provider?: unknown;
  usage?: {
    cost?: unknown;
    costDetails?: { upstreamInferenceCost?: unknown };
    promptTokens?: unknown;
    promptTokensDetails?: { cachedTokens?: unknown };
    completionTokens?: unknown;
    totalTokens?: unknown;
    completionTokensDetails?: { reasoningTokens?: unknown };
  };
};

export type OpenRouterUsageSummary = ReturnType<
  typeof getOpenRouterUsageMetadata
>;

export function getOpenRouterUsageMetadata(providerMetadata: unknown) {
  if (!providerMetadata || typeof providerMetadata !== "object") return null;

  const openrouter = (providerMetadata as { openrouter?: unknown }).openrouter;
  if (!openrouter || typeof openrouter !== "object") return null;

  const metadata = openrouter as OpenRouterUsageMetadata;
  const usage = metadata.usage;
  const asFiniteNumber = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;

  return {
    provider:
      typeof metadata.provider === "string" ? metadata.provider : undefined,
    providerCostUsd: asFiniteNumber(usage?.cost),
    upstreamInferenceCostUsd: asFiniteNumber(
      usage?.costDetails?.upstreamInferenceCost,
    ),
    inputTokens: asFiniteNumber(usage?.promptTokens),
    cachedInputTokens: asFiniteNumber(usage?.promptTokensDetails?.cachedTokens),
    outputTokens: asFiniteNumber(usage?.completionTokens),
    reasoningTokens: asFiniteNumber(
      usage?.completionTokensDetails?.reasoningTokens,
    ),
    totalTokens: asFiniteNumber(usage?.totalTokens),
  };
}

export function aggregateOpenRouterUsageMetadata(
  providerMetadataByStep: readonly unknown[],
) {
  const summaries = providerMetadataByStep
    .map(getOpenRouterUsageMetadata)
    .filter((summary) => summary !== null);
  if (summaries.length === 0) return null;

  const sum = (
    select: (
      summary: NonNullable<OpenRouterUsageSummary>,
    ) => number | undefined,
  ) => {
    const values = summaries
      .map(select)
      .filter((value): value is number => value !== undefined);
    return values.length > 0
      ? values.reduce((total, value) => total + value, 0)
      : undefined;
  };

  return {
    provider: summaries.findLast((summary) => summary.provider)?.provider,
    providerCostUsd: sum((summary) => summary.providerCostUsd),
    upstreamInferenceCostUsd: sum(
      (summary) => summary.upstreamInferenceCostUsd,
    ),
    inputTokens: sum((summary) => summary.inputTokens),
    cachedInputTokens: sum((summary) => summary.cachedInputTokens),
    outputTokens: sum((summary) => summary.outputTokens),
    reasoningTokens: sum((summary) => summary.reasoningTokens),
    totalTokens: sum((summary) => summary.totalTokens),
  };
}

export function requiresOpenRouterReasoning(model: string) {
  const { primary } = getOpenRouterModelRoute(model);
  return getModelReasoningCapability(primary).mandatory;
}

export function getOpenRouterReasoningSelection(
  model: string,
  quality: GenerationQuality,
): OpenRouterReasoningSelection {
  const { primary } = getOpenRouterModelRoute(model);
  const capability = getModelReasoningCapability(primary);

  if (!capability.supported) {
    return {
      enabled: false,
      visible: false,
      mandatory: false,
      effort: "none",
    };
  }

  if (!capability.mandatory && quality === "low") {
    return {
      enabled: false,
      visible: false,
      mandatory: false,
      effort: "none",
      providerOptions: {
        openrouter: { reasoning: { enabled: false } },
      },
    };
  }

  const selectedEffort =
    capability.mandatory && capability.supportedEfforts?.includes("low")
      ? "low"
      : capability.defaultEffort || capability.supportedEfforts?.[0];

  return {
    enabled: true,
    visible: true,
    mandatory: capability.mandatory,
    effort: selectedEffort || "default",
    providerOptions: {
      openrouter: {
        reasoning: selectedEffort
          ? { effort: selectedEffort, exclude: false }
          : { enabled: true, exclude: false },
      },
    },
  };
}

export function getOpenRouterProviderOptions(
  model: string,
  quality: GenerationQuality = "low",
): OpenRouterProviderOptions | undefined {
  return getOpenRouterReasoningSelection(model, quality).providerOptions;
}

export function getAIErrorMessage(error: unknown) {
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
  }

  const message = getErrorMessage(
    error,
    "The model provider returned an unexpected error.",
  );
  if (/JSON error injected into SSE stream/i.test(message)) {
    return "The model provider interrupted the response before it finished. Your partial work was saved and can be retried or recovered.";
  }

  return message;
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
