import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_MODEL, LEGACY_QWEN_MAX_MODEL } from "@/lib/constants";
import { buildSubscription, buildUser, readJson } from "../fixtures/builders";

const { getSessionMock, prismaMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  prismaMock: {
    chat: { count: vi.fn() },
    user: { findUnique: vi.fn(), updateMany: vi.fn() },
    creditGrant: { findMany: vi.fn(), update: vi.fn() },
    creditHold: { findMany: vi.fn(), updateMany: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

import { GET } from "@/app/api/user/can-create-project/route";

function request(model = FREE_MODEL) {
  return new Request(
    `http://localhost/api/user/can-create-project?model=${model}`,
  ) as never;
}

describe("/api/user/can-create-project", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.creditGrant.findMany.mockResolvedValue([]);
    prismaMock.creditHold.findMany.mockResolvedValue([]);
  });

  function grant(amount: number) {
    return {
      id: `grant_${amount}`,
      type: "subscription",
      remainingAmount: amount,
      expiresAt: null,
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
    };
  }

  it("allows anonymous users to start the anonymous project flow", async () => {
    getSessionMock.mockResolvedValueOnce(null);

    const response = await GET(request());

    expect(response.status).toBe(200);
    await expect(readJson(response)).resolves.toMatchObject({
      canCreate: true,
      hasExistingProjects: false,
      credits: 0,
      modelCost: 1,
    });
  });

  it("requires signed-in users to have credits for the first starter project", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.chat.count.mockResolvedValueOnce(0);
    prismaMock.user.findUnique.mockResolvedValueOnce(buildUser({ credits: 0 }));

    const response = await GET(request(FREE_MODEL));

    await expect(readJson(response)).resolves.toMatchObject({
      canCreate: false,
      error: "INSUFFICIENT_CREDITS",
      hasExistingProjects: false,
      credits: 0,
      modelCost: 1,
    });
  });

  it("does not treat active subscriptions as unlimited credits", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.chat.count.mockResolvedValueOnce(3);
    prismaMock.user.findUnique.mockResolvedValueOnce(
      buildUser({
        credits: 0,
        subscription: buildSubscription({ status: "active", tier: "pro" }),
      }),
    );

    const response = await GET(request(LEGACY_QWEN_MAX_MODEL));

    await expect(readJson(response)).resolves.toMatchObject({
      canCreate: false,
      hasActiveSubscription: true,
      credits: 0,
      modelCost: 8,
      shortfall: 8,
    });
  });

  it("blocks free users after they reach the free project limit", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.chat.count.mockResolvedValueOnce(3);
    prismaMock.user.findUnique.mockResolvedValueOnce(buildUser({ credits: 5 }));
    prismaMock.creditGrant.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([grant(5)]);

    const response = await GET(request(FREE_MODEL));

    await expect(readJson(response)).resolves.toMatchObject({
      canCreate: false,
      error: "PROJECT_LIMIT_REACHED",
      hasExistingProjects: true,
      projectCount: 3,
      projectLimit: 3,
      projectsRemaining: 0,
      credits: 5,
      modelCost: 1,
    });
  });
});
