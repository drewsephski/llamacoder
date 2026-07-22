import type { Plan } from "@/features/generation/agent-contracts";
import type { AppSpec, Integration } from "@/features/generation/app-spec";
import type { QuestionFlowStepDefinition } from "@/components/tool-ui/question-flow/schema";
import {
  getIntegrationProvider,
  type IntegrationProvider,
} from "@/features/integrations/registry";

function getSelectedProviders(providerIds: string[]) {
  return Array.from(new Set(providerIds)).flatMap((providerId) => {
    const provider = getIntegrationProvider(providerId);
    return provider ? [provider] : [];
  });
}

function defaultSelectedProviderPurpose(provider: IntegrationProvider) {
  return `Power the app's ${provider.capabilities.slice(0, 2).join(" and ")} functionality.`;
}

function selectedProviderIntegration(
  provider: IntegrationProvider,
  existing?: Integration,
): Integration {
  return {
    providerId: provider.id,
    name: provider.name,
    purpose: existing?.purpose ?? defaultSelectedProviderPurpose(provider),
    required: true,
    docsUrl: provider.docsUrl,
    baseUrl: provider.baseUrl,
    auth: provider.auth,
    requiredSecrets: [...provider.requiredSecrets],
    ...(provider.corsCompatible === null
      ? {}
      : { corsCompatible: provider.corsCompatible }),
    runtime: provider.runtime,
  };
}

export function getSelectedProvidersNeedingPurpose(
  spec: AppSpec,
  providerIds: string[],
) {
  const integrationsByProviderId = new Map(
    spec.integrations.flatMap((integration) =>
      integration.providerId ? [[integration.providerId, integration]] : [],
    ),
  );

  return getSelectedProviders(providerIds).filter((provider) => {
    const purpose = integrationsByProviderId.get(provider.id)?.purpose.trim();
    return !purpose || purpose === defaultSelectedProviderPurpose(provider);
  });
}

function summarizeAppPrompt(prompt: string) {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  if (!normalized) return "the app you described";
  return normalized.length <= 120
    ? normalized
    : `${normalized.slice(0, 117).trimEnd()}...`;
}

function providerCapabilitySummary(provider: IntegrationProvider) {
  return `${provider.name} for ${provider.capabilities.slice(0, 2).join(" and ")}`;
}

function needsGeneratedServerRuntime(provider: IntegrationProvider) {
  // Supabase Management OAuth stays on Squid's server, while verified Auth and
  // Data API flows use the protected publishable-key browser client with RLS.
  if (provider.id === "supabase") return false;
  return (
    provider.runtime === "server" ||
    provider.auth === "secret" ||
    provider.auth === "oauth"
  );
}

export function buildSelectedApiPurposeStep({
  prompt,
  providers,
}: {
  prompt: string;
  providers: IntegrationProvider[];
}): QuestionFlowStepDefinition {
  const appPrompt = summarizeAppPrompt(prompt);
  const providerNames = providers.map((provider) => provider.name).join(" + ");
  const capabilities = providers.map(providerCapabilitySummary).join("; ");
  const idSuffix = providers.map((provider) => provider.id).join("-");

  return {
    id: `selected-api-purpose-${idSuffix}`,
    title: `What should ${providerNames} do in this app?`,
    description: "Choose the API-powered direction closest to what you want.",
    options: [
      {
        id: "api-powered-core",
        label: "API-powered core (Recommended)",
        description: `Best fit: make live API functionality central to “${appPrompt}”: ${capabilities}.`,
      },
      {
        id: "live-insights",
        label: "Live insights dashboard",
        description: `Add a dashboard to “${appPrompt}” that turns ${providerNames} data into useful status, trends, and actions.`,
      },
      {
        id: "supporting-tools",
        label: "Supporting API tools",
        description: `Keep “${appPrompt}” as the main experience and use ${providerNames} for focused supporting tools powered by ${capabilities}.`,
      },
    ],
  };
}

export function enforceSelectedProvidersInAppSpec(
  spec: AppSpec,
  providerIds: string[],
): AppSpec {
  const providers = getSelectedProviders(providerIds);
  if (providers.length === 0) return spec;

  const selectedIds = new Set(providers.map((provider) => provider.id));
  const existingByProviderId = new Map(
    spec.integrations.flatMap((integration) =>
      integration.providerId ? [[integration.providerId, integration]] : [],
    ),
  );
  const selectedIntegrations = providers.map((provider) =>
    selectedProviderIntegration(
      provider,
      existingByProviderId.get(provider.id),
    ),
  );
  const otherIntegrations = spec.integrations.filter(
    (integration) =>
      !integration.providerId || !selectedIds.has(integration.providerId),
  );
  const selectedAcceptanceCriteria = providers.map(
    (provider) =>
      `${provider.name} [${provider.id}] is wired into a user-visible flow using its reviewed API contract.`,
  );
  const needsServerRuntime = providers.some(needsGeneratedServerRuntime);

  return {
    ...spec,
    deliveryContract:
      needsServerRuntime && spec.deliveryContract === "browser_frontend"
        ? "frontend_with_backend_blueprint"
        : spec.deliveryContract,
    integrations: [...otherIntegrations, ...selectedIntegrations],
    acceptanceCriteria: Array.from(
      new Set([...spec.acceptanceCriteria, ...selectedAcceptanceCriteria]),
    ),
  };
}

export function enforceSelectedProvidersInPlan(
  plan: Plan,
  providerIds: string[],
): Plan {
  const providers = getSelectedProviders(providerIds);
  if (providers.length === 0) return plan;

  const needsServerRuntime = providers.some(needsGeneratedServerRuntime);

  return {
    ...plan,
    deliveryContract:
      needsServerRuntime && plan.deliveryContract === "browser_frontend"
        ? "frontend_with_backend_blueprint"
        : plan.deliveryContract,
    sections: [
      ...plan.sections.filter((section) => section.id !== "selected-apis"),
      {
        id: "selected-apis",
        title: "Selected APIs (required)",
        items: providers.map(
          (provider) =>
            `${provider.name} [${provider.id}] must power a user-visible flow; use its reviewed ${provider.runtime} integration and do not substitute another provider.`,
        ),
      },
    ],
  };
}

export function enforceRequestedPersistenceProvider(spec: AppSpec): AppSpec {
  if (spec.dataPersistence.status !== "connect_confirmed") {
    return spec;
  }

  const providerId = "supabase";
  if (
    spec.integrations.some(
      (integration) => integration.providerId === providerId,
    )
  ) {
    return spec;
  }

  const provider = getIntegrationProvider(providerId);
  if (!provider) {
    return spec;
  }

  return enforceSelectedProvidersInAppSpec(spec, [provider.id]);
}
