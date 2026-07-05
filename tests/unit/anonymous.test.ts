import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  anonymousUsage: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

import {
  checkAnonymousUsageLimit,
  getAnonymousRemainingGenerations,
} from "@/lib/billing/anonymous";

function request(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/create-chat", {
    headers: {
      "x-forwarded-for": "203.0.113.10",
      "user-agent": "Vitest",
      ...headers,
    },
  }) as never;
}

describe("anonymous usage limits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permits the first generation and stores a hashed fingerprint", async () => {
    prismaMock.anonymousUsage.findFirst.mockResolvedValueOnce(null);

    await expect(checkAnonymousUsageLimit(request())).resolves.toEqual({
      allowed: true,
    });

    expect(prismaMock.anonymousUsage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ipHash: "203.0.113.10",
        generationsUsed: 1,
        fingerprintHash: expect.stringMatching(/^[a-f0-9]{32}$/),
      }),
    });
  });

  it("blocks the second generation after the free anonymous limit", async () => {
    prismaMock.anonymousUsage.findFirst.mockResolvedValueOnce({
      id: "anon_1",
      generationsUsed: 1,
    });

    await expect(checkAnonymousUsageLimit(request())).resolves.toEqual({
      allowed: false,
      reason: "LIMIT_REACHED",
    });
    expect(prismaMock.anonymousUsage.update).not.toHaveBeenCalled();
  });

  it("fails open on database errors", async () => {
    prismaMock.anonymousUsage.findFirst.mockRejectedValueOnce(
      new Error("database unavailable"),
    );

    await expect(checkAnonymousUsageLimit(request())).resolves.toEqual({
      allowed: true,
    });
  });

  it("reports remaining anonymous generations", async () => {
    prismaMock.anonymousUsage.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ generationsUsed: 1 });

    await expect(getAnonymousRemainingGenerations(request())).resolves.toBe(1);
    await expect(getAnonymousRemainingGenerations(request())).resolves.toBe(0);
  });
});
