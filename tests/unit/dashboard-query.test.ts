import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentSession: vi.fn(),
  getPrisma: vi.fn(),
  getUserCreditInfo: vi.fn(),
  reconcileCheckoutSessionForUser: vi.fn(),
}));

vi.mock("@/features/auth/server/session", () => ({
  getCurrentSession: mocks.getCurrentSession,
}));
vi.mock("@/lib/prisma", () => ({ getPrisma: mocks.getPrisma }));
vi.mock("@/lib/billing/credits", () => ({
  getUserCreditInfo: mocks.getUserCreditInfo,
}));
vi.mock("@/lib/billing/stripe-fulfillment", () => ({
  reconcileCheckoutSessionForUser: mocks.reconcileCheckoutSessionForUser,
}));

import { getDashboardData } from "@/features/projects/server/dashboard-query";

describe("dashboard verification evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentSession.mockResolvedValue({ user: { id: "user_1" } });
    mocks.getUserCreditInfo.mockResolvedValue({
      credits: 5,
      tier: "free",
      hasActiveSubscription: false,
    });
  });

  it("binds runtime and export evidence to the latest assistant message", async () => {
    const runtimeFindMany = vi
      .fn()
      .mockResolvedValue([{ messageId: "message_latest", status: "passed" }]);
    const exportFindMany = vi
      .fn()
      .mockResolvedValue([{ messageId: "message_latest", status: "verified" }]);
    mocks.getPrisma.mockReturnValue({
      chat: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "chat_1",
            model: "test/model",
            quality: "low",
            prompt: "Build a dashboard",
            title: "Dashboard",
            llamaCoderVersion: "v2",
            shadcn: false,
            plan: null,
            appSpec: null,
            hasCode: true,
            generationStatus: "completed",
            generationStartedAt: null,
            sourceMessageId: null,
            sourceChatId: null,
            referrerUserId: null,
            createdAt: new Date("2026-07-14T00:00:00Z"),
            userId: "user_1",
            messages: [{ id: "message_latest", content: "", files: null }],
          },
        ]),
      },
      runtimeVerification: { findMany: runtimeFindMany },
      exportArtifact: { findMany: exportFindMany },
    });

    const result = await getDashboardData({});

    expect(runtimeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { messageId: { in: ["message_latest"] } },
      }),
    );
    expect(exportFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { messageId: { in: ["message_latest"] } },
      }),
    );
    expect(result.projects[0]?.verification).toMatchObject({
      runtime: "passed",
      export: "verified",
    });
    expect(result.userCredits).toBe(5);
    expect(mocks.getUserCreditInfo).toHaveBeenCalledWith("user_1");
  });
});
