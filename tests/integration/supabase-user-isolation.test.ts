import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DEFAULT_SUPABASE_AUTH_MODE } from "@/features/integrations/supabase-backend";
import { encryptIntegrationCredential } from "@/features/integrations/server/credential-vault";
import { IntegrationServiceError } from "@/features/integrations/server/integration-error";
import { getAuthorizedProjectIntegration } from "@/features/integrations/server/provider-client";
import { getIntegrationWorkspace } from "@/features/integrations/server/service";
import { getPrisma } from "@/lib/prisma";

const prisma = getPrisma();
const runId = randomUUID();
const userAId = `isolation-a-${runId}`;
const userBId = `isolation-b-${runId}`;
const projectAId = `isolation-project-${runId}`;
const connectionAId = `isolation-connection-${runId}`;
const bindingAId = `isolation-binding-${runId}`;

async function expectIntegrationError(promise: Promise<unknown>, code: string) {
  try {
    await promise;
    throw new Error(`Expected ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(IntegrationServiceError);
    expect((error as IntegrationServiceError).code).toBe(code);
  }
}

describe.sequential("Supabase credential and project isolation", () => {
  beforeAll(async () => {
    await prisma.user.createMany({
      data: [
        { id: userAId, email: `${userAId}@example.test` },
        { id: userBId, email: `${userBId}@example.test` },
      ],
    });
    await prisma.chat.create({
      data: {
        id: projectAId,
        userId: userAId,
        model: "test-model",
        quality: "test",
        prompt: "Test Supabase isolation",
        title: "User A project",
        shadcn: false,
      },
    });
    await prisma.integrationConnection.create({
      data: {
        id: connectionAId,
        userId: userAId,
        providerId: "supabase",
        displayName: "User A Supabase",
        authType: "oauth2",
        status: "configured",
        credentials: {
          create: [
            {
              kind: "access_token",
              ...encryptIntegrationCredential({
                value: "user-a-access-token",
                userId: userAId,
                connectionId: connectionAId,
                kind: "access_token",
              }),
            },
            {
              kind: "refresh_token",
              ...encryptIntegrationCredential({
                value: "user-a-refresh-token",
                userId: userAId,
                connectionId: connectionAId,
                kind: "refresh_token",
              }),
            },
          ],
        },
      },
    });
    await prisma.projectIntegration.create({
      data: {
        id: bindingAId,
        chatId: projectAId,
        connectionId: connectionAId,
        providerId: "supabase",
        environment: "development",
        status: "configured",
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [userAId, userBId] } },
    });
    await prisma.$disconnect();
  });

  it("allows User A while denying User B access to User A's project and credential", async () => {
    const workspace = await getIntegrationWorkspace({
      projectId: projectAId,
      userId: userAId,
    });
    expect(workspace.integrations.map((integration) => integration.id)).toEqual(
      [bindingAId],
    );

    const authorized = await getAuthorizedProjectIntegration({
      projectId: projectAId,
      bindingId: bindingAId,
      userId: userAId,
      expectedProvider: "supabase",
    });
    expect(authorized.accessToken).toBe("user-a-access-token");

    await expectIntegrationError(
      getIntegrationWorkspace({ projectId: projectAId, userId: userBId }),
      "PROJECT_NOT_FOUND",
    );
    await expectIntegrationError(
      getAuthorizedProjectIntegration({
        projectId: projectAId,
        bindingId: bindingAId,
        userId: userBId,
        expectedProvider: "supabase",
      }),
      "INTEGRATION_NOT_FOUND",
    );
  });

  it("scrubs legacy plaintext refresh tokens and fails closed without an encrypted copy", async () => {
    const legacyConnectionId = `legacy-connection-${runId}`;
    const legacyBindingId = `legacy-binding-${runId}`;
    await prisma.integrationConnection.create({
      data: {
        id: legacyConnectionId,
        userId: userAId,
        providerId: "supabase",
        displayName: "Legacy Supabase",
        authType: "oauth2",
        status: "configured",
        metadata: {
          supabaseRefreshToken: "legacy-plaintext-refresh-token",
          organizationId: "org_test",
        },
      },
    });
    await prisma.projectIntegration.create({
      data: {
        id: legacyBindingId,
        chatId: projectAId,
        connectionId: legacyConnectionId,
        providerId: "supabase",
        environment: "preview",
        status: "configured",
      },
    });
    await prisma.integrationConnection.update({
      where: { id: connectionAId },
      data: {
        metadata: { supabaseRefreshToken: "stale-plaintext-copy" },
      },
    });

    const migration = await readFile(
      path.join(
        process.cwd(),
        "prisma/migrations/20260731150000_remove_plaintext_supabase_refresh_tokens/migration.sql",
      ),
      "utf8",
    );
    // The file is a trusted, version-controlled migration and has no dynamic input.
    await prisma.$queryRawUnsafe(migration);

    const [connection, binding, encryptedConnection] = await Promise.all([
      prisma.integrationConnection.findUniqueOrThrow({
        where: { id: legacyConnectionId },
      }),
      prisma.projectIntegration.findUniqueOrThrow({
        where: { id: legacyBindingId },
      }),
      prisma.integrationConnection.findUniqueOrThrow({
        where: { id: connectionAId },
      }),
    ]);
    expect(connection.metadata).toEqual({ organizationId: "org_test" });
    expect(connection.status).toBe("authorization_required");
    expect(connection.lastHealthStatus).toBe("failed");
    expect(binding.status).toBe("authorization_required");
    expect(encryptedConnection.metadata).toEqual({});
    expect(encryptedConnection.status).toBe("configured");
  });

  it("keeps verified email as the default and prototype auth explicit", () => {
    expect(DEFAULT_SUPABASE_AUTH_MODE).toBe("verified_email");
  });
});
