import type { Plan } from "@/features/generation/agent-contracts";
import type { AppSpec, Integration } from "@/features/generation/app-spec";
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

function selectedProviderIntegration(
  provider: IntegrationProvider,
  existing?: Integration,
): Integration {
  return {
    providerId: provider.id,
    name: provider.name,
    purpose:
      existing?.purpose ??
      `Power the app's ${provider.capabilities.slice(0, 2).join(" and ")} functionality.`,
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
  const needsServerRuntime = providers.some(
    (provider) =>
      provider.runtime === "server" ||
      provider.auth === "secret" ||
      provider.auth === "oauth",
  );

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

  const needsServerRuntime = providers.some(
    (provider) =>
      provider.runtime === "server" ||
      provider.auth === "secret" ||
      provider.auth === "oauth",
  );

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
