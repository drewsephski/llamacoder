import type { IntegrationProviderSummary } from "@/features/integrations/contracts";
import {
  integrationRegistry,
  type IntegrationProvider,
} from "@/features/integrations/registry";

type OAuthAvailability = Partial<
  Record<"github" | "vercel" | "supabase", boolean>
>;

export function getIntegrationCredentialKind(
  provider: IntegrationProvider,
): "api_key" | "access_token" | null {
  if (provider.auth === "secret" || provider.auth === "publishable_key") {
    return "api_key";
  }
  if (provider.auth === "oauth") return "access_token";
  return null;
}

export function buildIntegrationProviderSummaries({
  oauthAvailability = {},
}: {
  oauthAvailability?: OAuthAvailability;
} = {}): IntegrationProviderSummary[] {
  return integrationRegistry.map((provider) => ({
    id: provider.id,
    name: provider.name,
    category: provider.category,
    description: provider.description,
    capabilities: [...provider.capabilities],
    auth: provider.auth,
    runtime: provider.runtime,
    policyStatus: provider.policyStatus,
    commercialUse: provider.commercialUse,
    docsUrl: provider.docsUrl,
    guidance: provider.guidance,
    attribution: provider.attribution,
    limits: provider.limits,
    exampleEndpoint: provider.exampleEndpoint,
    verifiedAt: provider.verifiedAt,
    setup:
      provider.policyStatus === "blocked"
        ? "blocked"
        : provider.auth === "none"
          ? "instant"
          : provider.auth === "oauth"
            ? "oauth"
            : "api_key",
    healthCheckAvailable: provider.policyStatus !== "blocked",
    credentialKind: getIntegrationCredentialKind(provider),
    oauthAvailable:
      provider.id === "github" ||
      provider.id === "vercel" ||
      provider.id === "supabase"
        ? (oauthAvailability[provider.id] ?? false)
        : false,
  }));
}
