import { vi } from "vitest";

export function createDelegateMock(methods: string[]) {
  return Object.fromEntries(methods.map((method) => [method, vi.fn()]));
}

export function createPrismaMock() {
  return {
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
      callback(createPrismaTransactionMock()),
    ),
    user: createDelegateMock(["findUnique", "update", "updateMany"]),
    chat: createDelegateMock([
      "count",
      "create",
      "delete",
      "findMany",
      "findUnique",
      "update",
      "updateMany",
    ]) as Record<string, ReturnType<typeof vi.fn>> & { first: undefined },
    message: createDelegateMock([
      "create",
      "findFirst",
      "findMany",
      "findUnique",
      "update",
    ]),
    creditHistory: createDelegateMock(["create"]),
    creditGrant: createDelegateMock([
      "create",
      "findMany",
      "findUnique",
      "update",
      "updateMany",
    ]),
    creditHold: createDelegateMock([
      "create",
      "findMany",
      "findUnique",
      "update",
      "updateMany",
    ]),
    generationLog: createDelegateMock(["create"]),
    generationRun: createDelegateMock([
      "create",
      "findFirst",
      "findMany",
      "update",
      "updateMany",
    ]),
    runtimeVerification: createDelegateMock(["create", "findMany"]),
    projectIntegration: createDelegateMock(["findMany"]),
    anonymousUsage: createDelegateMock(["create", "findFirst", "update"]),
    stripeWebhookEvent: createDelegateMock(["findUnique", "upsert"]),
    subscription: createDelegateMock([
      "create",
      "findFirst",
      "update",
      "updateMany",
      "upsert",
    ]),
  };
}

export function createPrismaTransactionMock() {
  return {
    user: createDelegateMock(["findUnique", "update", "updateMany"]),
    chat: createDelegateMock(["create", "update", "updateMany"]),
    message: createDelegateMock(["create"]),
    creditHistory: createDelegateMock(["create"]),
    creditGrant: createDelegateMock([
      "create",
      "findMany",
      "findUnique",
      "update",
      "updateMany",
    ]),
    creditHold: createDelegateMock([
      "create",
      "findMany",
      "findUnique",
      "update",
      "updateMany",
    ]),
    generationLog: createDelegateMock(["create"]),
    generationRun: createDelegateMock(["create", "update", "updateMany"]),
  };
}
