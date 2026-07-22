import "server-only";

import { z } from "zod";

import type { Prisma } from "@prisma/client";

import {
  decryptIntegrationCredential,
  encryptIntegrationCredential,
} from "@/features/integrations/server/credential-vault";
import { IntegrationServiceError } from "@/features/integrations/server/integration-error";
import { getOAuthProviderConfig } from "@/features/integrations/server/oauth-provider";
import { getPrisma } from "@/lib/prisma";

const ACCESS_TOKEN_EXPIRY_METADATA_KEY = "supabaseAccessTokenExpiresAt";
const TOKEN_TYPE_METADATA_KEY = "supabaseTokenType";
const LEGACY_REFRESH_TOKEN_METADATA_KEY = "supabaseRefreshToken";
const PROACTIVE_REFRESH_WINDOW_MS = 5 * 60 * 1_000;
const REFRESH_REQUEST_TIMEOUT_MS = 10_000;
const TERMINAL_REFRESH_STATUSES = new Set([400, 401, 403]);

const refreshTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1).optional(),
  expires_in: z.coerce.number().int().positive().optional(),
  token_type: z.string().min(1).optional(),
  scope: z.string().optional(),
});

type SupabaseConnection = Prisma.IntegrationConnectionGetPayload<{
  include: { credentials: true };
}>;

export type SupabaseProviderAuthorization = {
  accessToken: string;
  connectionId: string;
  userId: string;
};

type RefreshResult =
  | { ok: true; accessToken: string }
  | { ok: false; reason: "reauthorization_required" };

const refreshAttempts = new Map<string, Promise<RefreshResult>>();

function readMetadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : {};
}

function sanitizedTokenMetadata(
  value: unknown,
  input: { expiresAt?: string; tokenType?: string },
) {
  const metadata = readMetadata(value);
  delete metadata[LEGACY_REFRESH_TOKEN_METADATA_KEY];
  if (input.expiresAt) {
    metadata[ACCESS_TOKEN_EXPIRY_METADATA_KEY] = input.expiresAt;
  } else {
    delete metadata[ACCESS_TOKEN_EXPIRY_METADATA_KEY];
  }
  if (input.tokenType) {
    metadata[TOKEN_TYPE_METADATA_KEY] = input.tokenType;
  } else {
    delete metadata[TOKEN_TYPE_METADATA_KEY];
  }
  return metadata;
}

function readExpiry(metadata: unknown) {
  const value = readMetadata(metadata)[ACCESS_TOKEN_EXPIRY_METADATA_KEY];
  if (typeof value !== "string") return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

async function scrubLegacyRefreshTokenMetadata(
  connection: SupabaseConnection,
) {
  const metadata = readMetadata(connection.metadata);
  if (!(LEGACY_REFRESH_TOKEN_METADATA_KEY in metadata)) return;
  delete metadata[LEGACY_REFRESH_TOKEN_METADATA_KEY];
  await getPrisma().integrationConnection.update({
    where: { id: connection.id },
    data: { metadata: metadata as Prisma.InputJsonValue },
  });
}

function decryptCredential(
  connection: SupabaseConnection,
  kind: "access_token" | "refresh_token",
) {
  const credential = connection.credentials.find(
    (candidate) => candidate.kind === kind,
  );
  if (!credential) return null;
  try {
    return decryptIntegrationCredential({
      credential,
      userId: connection.userId,
      connectionId: connection.id,
      kind,
    });
  } catch {
    return null;
  }
}

async function markReauthorizationRequired(
  tx: Prisma.TransactionClient,
  connection: SupabaseConnection,
) {
  const metadata = readMetadata(connection.metadata);
  delete metadata[LEGACY_REFRESH_TOKEN_METADATA_KEY];
  await tx.integrationConnection.update({
    where: { id: connection.id },
    data: {
      status: "authorization_required",
      metadata: metadata as Prisma.InputJsonValue,
      lastHealthStatus: "failed",
      lastHealthMessage:
        "The Supabase Management authorization expired. Reconnect Supabase.",
      lastHealthCheckAt: new Date(),
    },
  });
  const bindings = await tx.projectIntegration.findMany({
    where: { connectionId: connection.id },
    select: { id: true, config: true },
  });
  const checkedAt = new Date().toISOString();
  await Promise.all(
    bindings.map((binding) => {
      const config = readMetadata(binding.config);
      const projectRef =
        typeof config.supabaseProjectRef === "string"
          ? config.supabaseProjectRef
          : null;
      return tx.projectIntegration.update({
        where: { id: binding.id },
        data: {
          status: "authorization_required",
          config: {
            ...config,
            supabaseManagementCapabilities: {
              projectsRead: "reauthorization_required",
              projectsWrite: "reauthorization_required",
              secretsRead: "reauthorization_required",
              databaseRead: "reauthorization_required",
              databaseWrite: "reauthorization_required",
              authWrite: "reauthorization_required",
              projectRef,
              checkedAt,
              issue: "connection_expired",
            },
          } as Prisma.InputJsonValue,
        },
      });
    }),
  );
  await tx.integrationAuditEvent.create({
    data: {
      userId: connection.userId,
      providerId: "supabase",
      action: "supabase_reauthorization_required",
      connectionId: connection.id,
    },
  });
}

async function performRefresh({
  connectionId,
  userId,
  rejectedAccessToken,
  force,
  now,
  fetchImpl,
}: {
  connectionId: string;
  userId: string;
  rejectedAccessToken?: string;
  force: boolean;
  now: () => number;
  fetchImpl: typeof fetch;
}): Promise<RefreshResult> {
  return getPrisma().$transaction(async (tx) => {
    const lockKey = `supabase-oauth-refresh:${connectionId}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
    const connection = await tx.integrationConnection.findFirst({
      where: { id: connectionId, userId, providerId: "supabase" },
      include: { credentials: true },
    });
    if (!connection) {
      return { ok: false, reason: "reauthorization_required" };
    }

    const accessToken = decryptCredential(connection, "access_token");
    const refreshToken = decryptCredential(connection, "refresh_token");
    if (!accessToken || !refreshToken) {
      await markReauthorizationRequired(tx, connection);
      return { ok: false, reason: "reauthorization_required" };
    }

    if (force && rejectedAccessToken && accessToken !== rejectedAccessToken) {
      return { ok: true, accessToken };
    }
    const expiresAt = readExpiry(connection.metadata);
    if (
      !force &&
      (expiresAt === null || expiresAt > now() + PROACTIVE_REFRESH_WINDOW_MS)
    ) {
      return { ok: true, accessToken };
    }

    const config = getOAuthProviderConfig("supabase");
    if (!config) {
      throw new IntegrationServiceError(
        "SUPABASE_OAUTH_NOT_CONFIGURED",
        "Supabase OAuth is not configured on this Squid deployment.",
        503,
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      REFRESH_REQUEST_TIMEOUT_MS,
    );
    let response: Response;
    try {
      response = await fetchImpl("https://api.supabase.com/v1/oauth/token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch {
      refreshUnavailable();
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      if (TERMINAL_REFRESH_STATUSES.has(response.status)) {
        await markReauthorizationRequired(tx, connection);
        return { ok: false, reason: "reauthorization_required" };
      }
      refreshUnavailable(response.status === 429 ? 429 : 503);
    }
    const parsed = refreshTokenResponseSchema.safeParse(
      await response.json().catch(() => null),
    );
    if (!parsed.success) {
      refreshUnavailable(502);
    }

    const nextRefreshToken = parsed.data.refresh_token ?? refreshToken;
    const nextExpiresAt = parsed.data.expires_in
      ? new Date(now() + parsed.data.expires_in * 1_000).toISOString()
      : undefined;
    const encryptedAccessToken = encryptIntegrationCredential({
      value: parsed.data.access_token,
      userId,
      connectionId,
      kind: "access_token",
    });
    const encryptedRefreshToken = encryptIntegrationCredential({
      value: nextRefreshToken,
      userId,
      connectionId,
      kind: "refresh_token",
    });
    await tx.integrationCredential.upsert({
      where: { connectionId_kind: { connectionId, kind: "access_token" } },
      create: {
        connectionId,
        kind: "access_token",
        ...encryptedAccessToken,
      },
      update: encryptedAccessToken,
    });
    await tx.integrationCredential.upsert({
      where: { connectionId_kind: { connectionId, kind: "refresh_token" } },
      create: {
        connectionId,
        kind: "refresh_token",
        ...encryptedRefreshToken,
      },
      update: encryptedRefreshToken,
    });
    const returnedScopes = parsed.data.scope
      ? parsed.data.scope.split(/[\s,]+/).filter(Boolean)
      : null;
    await tx.integrationConnection.update({
      where: { id: connectionId },
      data: {
        ...(returnedScopes ? { scopes: returnedScopes } : {}),
        metadata: sanitizedTokenMetadata(connection.metadata, {
          expiresAt: nextExpiresAt,
          tokenType: parsed.data.token_type,
        }) as Prisma.InputJsonValue,
      },
    });
    await tx.integrationAuditEvent.create({
      data: {
        userId,
        providerId: "supabase",
        action: "supabase_oauth_token_refreshed",
        connectionId,
        metadata: {
          rotatedRefreshToken: Boolean(parsed.data.refresh_token),
          expiresAtRecorded: Boolean(nextExpiresAt),
          scopesReturned: Boolean(returnedScopes),
        },
      },
    });
    return { ok: true, accessToken: parsed.data.access_token };
  });
}

async function refreshSupabaseAuthorization(
  input: Parameters<typeof performRefresh>[0],
) {
  const pending = refreshAttempts.get(input.connectionId);
  if (pending) return pending;
  const attempt = performRefresh(input).finally(() => {
    refreshAttempts.delete(input.connectionId);
  });
  refreshAttempts.set(input.connectionId, attempt);
  return attempt;
}

function authorizationRequired(): never {
  throw new IntegrationServiceError(
    "AUTHORIZATION_REQUIRED",
    "Reconnect Supabase before using the Management API.",
    409,
  );
}

function refreshUnavailable(status = 503): never {
  throw new IntegrationServiceError(
    "SUPABASE_OAUTH_REFRESH_UNAVAILABLE",
    status === 429
      ? "Supabase temporarily rate-limited authorization refresh. Retry shortly."
      : "Supabase authorization refresh is temporarily unavailable.",
    status,
  );
}

export async function getSupabaseProviderAuthorization({
  connection,
  now = Date.now,
  fetchImpl = fetch,
}: {
  connection: SupabaseConnection;
  now?: () => number;
  fetchImpl?: typeof fetch;
}): Promise<SupabaseProviderAuthorization> {
  const accessToken = decryptCredential(connection, "access_token");
  const refreshToken = decryptCredential(connection, "refresh_token");
  if (!accessToken || !refreshToken) {
    const result = await refreshSupabaseAuthorization({
      connectionId: connection.id,
      userId: connection.userId,
      force: true,
      now,
      fetchImpl,
    });
    if (!result.ok) authorizationRequired();
    return {
      accessToken: result.accessToken,
      connectionId: connection.id,
      userId: connection.userId,
    };
  }
  const expiresAt = readExpiry(connection.metadata);
  if (expiresAt !== null && expiresAt <= now() + PROACTIVE_REFRESH_WINDOW_MS) {
    const result = await refreshSupabaseAuthorization({
      connectionId: connection.id,
      userId: connection.userId,
      force: false,
      now,
      fetchImpl,
    });
    if (!result.ok) authorizationRequired();
    return {
      accessToken: result.accessToken,
      connectionId: connection.id,
      userId: connection.userId,
    };
  }
  await scrubLegacyRefreshTokenMetadata(connection);
  return {
    accessToken,
    connectionId: connection.id,
    userId: connection.userId,
  };
}

export async function refreshSupabaseProviderAuthorization({
  authorization,
  now = Date.now,
  fetchImpl = fetch,
}: {
  authorization: SupabaseProviderAuthorization;
  now?: () => number;
  fetchImpl?: typeof fetch;
}) {
  const result = await refreshSupabaseAuthorization({
    connectionId: authorization.connectionId,
    userId: authorization.userId,
    rejectedAccessToken: authorization.accessToken,
    force: true,
    now,
    fetchImpl,
  });
  if (!result.ok) authorizationRequired();
  return { ...authorization, accessToken: result.accessToken };
}

export async function markSupabaseProviderReauthorizationRequired({
  authorization,
}: {
  authorization: SupabaseProviderAuthorization;
}) {
  await getPrisma().$transaction(async (tx) => {
    const connection = await tx.integrationConnection.findFirst({
      where: {
        id: authorization.connectionId,
        userId: authorization.userId,
        providerId: "supabase",
      },
      include: { credentials: true },
    });
    if (connection) await markReauthorizationRequired(tx, connection);
  });
}

export const supabaseTokenMetadata = {
  accessTokenExpiresAt: ACCESS_TOKEN_EXPIRY_METADATA_KEY,
  tokenType: TOKEN_TYPE_METADATA_KEY,
  legacyRefreshToken: LEGACY_REFRESH_TOKEN_METADATA_KEY,
} as const;
