import { beforeEach, describe, expect, it, vi } from "vitest";

const { deleteManyMock, upsertMock } = vi.hoisted(() => ({
  deleteManyMock: vi.fn(),
  upsertMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    apiRateLimitBucket: {
      upsert: upsertMock,
      deleteMany: deleteManyMock,
    },
  }),
}));

import { consumeRateLimit } from "@/features/security/server/rate-limit";

describe("consumeRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T12:00:30.000Z"));
    deleteManyMock.mockResolvedValue({ count: 0 });
  });

  it("uses an atomic bucket increment and reports remaining capacity", async () => {
    upsertMock.mockResolvedValue({ count: 2 });

    await expect(
      consumeRateLimit({
        userId: "user_1",
        operation: "completion",
        limit: 12,
        windowMs: 60_000,
      }),
    ).resolves.toEqual({ allowed: true, remaining: 10 });

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user_1:completion:1783771200000" },
        update: { count: { increment: 1 } },
      }),
    );
  });

  it("returns a retry delay when the bucket is over limit", async () => {
    upsertMock.mockResolvedValue({ count: 7 });

    await expect(
      consumeRateLimit({
        userId: "user_1",
        operation: "screenshot",
        limit: 6,
        windowMs: 60_000,
      }),
    ).resolves.toEqual({ allowed: false, retryAfterSeconds: 30 });
  });
});
