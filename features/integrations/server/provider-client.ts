import "server-only";

import { decryptIntegrationCredential } from "@/features/integrations/server/credential-vault";
import { createGitHubInstallationToken } from "@/features/integrations/server/github-app";
import { IntegrationServiceError } from "@/features/integrations/server/integration-error";
import {
  getSupabaseProviderAuthorization,
  markSupabaseProviderReauthorizationRequired,
  refreshSupabaseProviderAuthorization,
  type SupabaseProviderAuthorization,
} from "@/features/integrations/server/supabase-oauth-tokens";
import { getPrisma } from "@/lib/prisma";

function sanitizedProviderErrorText(value: unknown, depth = 0): string {
  if (depth > 2) return "";
  if (typeof value === "string") return value.slice(0, 1_000);
  if (Array.isArray(value)) {
    return value
      .slice(0, 8)
      .map((item) => sanitizedProviderErrorText(item, depth + 1))
      .join(" ");
  }
  if (!value || typeof value !== "object") return "";
  return Object.values(value as Record<string, unknown>)
    .slice(0, 12)
    .map((item) => sanitizedProviderErrorText(item, depth + 1))
    .join(" ")
    .slice(0, 2_000);
}

export async function getAuthorizedProjectIntegration({
  projectId,
  bindingId,
  userId,
  expectedProvider,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  expectedProvider: "github" | "vercel" | "supabase";
}) {
  const binding = await getPrisma().projectIntegration.findFirst({
    where: {
      id: bindingId,
      chatId: projectId,
      providerId: expectedProvider,
      connection: { userId },
    },
    include: { connection: { include: { credentials: true } } },
  });
  if (!binding) {
    const providerName =
      expectedProvider === "github"
        ? "GitHub"
        : expectedProvider === "vercel"
          ? "Vercel"
          : "Supabase";
    throw new IntegrationServiceError(
      "INTEGRATION_NOT_FOUND",
      `${providerName} is not connected to this project.`,
      404,
    );
  }

  const metadata =
    binding.connection.metadata &&
    typeof binding.connection.metadata === "object"
      ? (binding.connection.metadata as Record<string, unknown>)
      : {};
  const installationId =
    typeof metadata.installationId === "string"
      ? metadata.installationId
      : null;
  let accessToken: string;
  let providerAuthorization: SupabaseProviderAuthorization | null = null;
  if (expectedProvider === "github" && installationId) {
    try {
      accessToken = await createGitHubInstallationToken(installationId);
    } catch {
      throw new IntegrationServiceError(
        "GITHUB_INSTALLATION_TOKEN_FAILED",
        "GitHub could not authorize this app installation.",
        502,
      );
    }
  } else {
    if (expectedProvider === "supabase") {
      providerAuthorization = await getSupabaseProviderAuthorization({
        connection: binding.connection,
      });
      accessToken = providerAuthorization.accessToken;
    } else {
      const credential = binding.connection.credentials.find(
        (candidate) => candidate.kind === "access_token",
      );
      if (!credential) {
        throw new IntegrationServiceError(
          "AUTHORIZATION_REQUIRED",
          "Reconnect this provider before using it.",
          409,
        );
      }
      accessToken = decryptIntegrationCredential({
        credential,
        userId,
        connectionId: binding.connectionId,
        kind: credential.kind,
      });
    }
  }
  return { binding, metadata, accessToken, providerAuthorization };
}

export async function providerFetch(
  provider: "github" | "vercel" | "supabase",
  authorization: string | SupabaseProviderAuthorization,
  input: string,
  init: RequestInit = {},
  fetchImpl: typeof fetch = fetch,
) {
  const request = (accessToken: string) =>
    fetchImpl(input, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept:
          provider === "github"
            ? "application/vnd.github+json"
            : "application/json",
        ...(provider === "github"
          ? { "X-GitHub-Api-Version": "2022-11-28" }
          : {}),
        ...init.headers,
      },
      cache: "no-store",
    });
  const initialAccessToken =
    typeof authorization === "string"
      ? authorization
      : authorization.accessToken;
  let response = await request(initialAccessToken);
  if (
    response.status === 401 &&
    provider === "supabase" &&
    typeof authorization !== "string"
  ) {
    const refreshed = await refreshSupabaseProviderAuthorization({
      authorization,
      fetchImpl,
    });
    response = await request(refreshed.accessToken);
    if (response.status === 401) {
      await markSupabaseProviderReauthorizationRequired({
        authorization: refreshed,
      });
    }
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const supabaseBodyText =
      provider === "supabase" ? sanitizedProviderErrorText(body) : "";
    const isProjectCapacityError =
      provider === "supabase" &&
      (init.method ?? "GET").toUpperCase() === "POST" &&
      /^https:\/\/api\.supabase\.com\/v1\/projects\/?$/.test(input) &&
      /(?:active[ -]?project|project)[ -]?(?:capacity|limit)|(?:maximum|max)[^\n]{0,80}(?:active[ -]?)?projects?|too many (?:active )?projects?/i.test(
        supabaseBodyText,
      );
    if (isProjectCapacityError) {
      throw new IntegrationServiceError(
        "SUPABASE_PROJECT_LIMIT_REACHED",
        "Supabase project capacity has been reached for this account.",
        response.status >= 400 && response.status < 500 ? response.status : 502,
      );
    }
    const providerMessage =
      provider === "supabase"
        ? response.status === 401 || response.status === 403
          ? "authorization expired or lacks the required scope"
          : response.status === 404
            ? "project not found"
            : response.status === 429
              ? "rate limit reached"
              : `request failed with HTTP ${response.status}`
        : body && typeof body === "object" && "message" in body
          ? String(body.message)
          : `HTTP ${response.status}`;
    throw new IntegrationServiceError(
      `${provider.toUpperCase()}_REQUEST_FAILED`,
      `${
        provider === "github"
          ? "GitHub"
          : provider === "vercel"
            ? "Vercel"
            : "Supabase"
      }: ${providerMessage}`,
      response.status >= 400 && response.status < 500 ? response.status : 502,
    );
  }
  return body;
}
