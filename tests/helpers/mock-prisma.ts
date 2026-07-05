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
    ]),
    message: createDelegateMock(["create", "findMany", "findUnique", "update"]),
    creditHistory: createDelegateMock(["create"]),
    creditGrant: createDelegateMock(["create"]),
    generationLog: createDelegateMock(["create"]),
    anonymousUsage: createDelegateMock(["create", "findFirst", "update"]),
    stripeWebhookEvent: createDelegateMock(["findUnique", "upsert"]),
    subscription: createDelegateMock(["create", "findFirst", "update", "updateMany", "upsert"]),
  };
}

export function createPrismaTransactionMock() {
  return {
    user: createDelegateMock(["findUnique", "update", "updateMany"]),
    chat: createDelegateMock(["create", "update"]),
    message: createDelegateMock(["create"]),
    creditHistory: createDelegateMock(["create"]),
    creditGrant: createDelegateMock(["create"]),
    generationLog: createDelegateMock(["create"]),
  };
}
