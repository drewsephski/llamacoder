import "server-only";

import { decryptIntegrationCredential } from "@/features/integrations/server/credential-vault";
import { createGitHubInstallationToken } from "@/features/integrations/server/github-app";
import { IntegrationServiceError } from "@/features/integrations/server/service";
import { getPrisma } from "@/lib/prisma";

export async function getAuthorizedProjectIntegration({
  projectId,
  bindingId,
  userId,
  expectedProvider,
}: {
  projectId: string;
  bindingId: string;
  userId: string;
  expectedProvider: "github" | "vercel";
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
    throw new IntegrationServiceError(
      "INTEGRATION_NOT_FOUND",
      `${expectedProvider === "github" ? "GitHub" : "Vercel"} is not connected to this project.`,
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
  return { binding, metadata, accessToken };
}

export async function providerFetch(
  provider: "github" | "vercel",
  accessToken: string,
  input: string,
  init: RequestInit = {},
) {
  const response = await fetch(input, {
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
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const providerMessage =
      body && typeof body === "object" && "message" in body
        ? String(body.message)
        : `HTTP ${response.status}`;
    throw new IntegrationServiceError(
      `${provider.toUpperCase()}_REQUEST_FAILED`,
      `${provider === "github" ? "GitHub" : "Vercel"}: ${providerMessage}`,
      response.status >= 400 && response.status < 500 ? response.status : 502,
    );
  }
  return body;
}
