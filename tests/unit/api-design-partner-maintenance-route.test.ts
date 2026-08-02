import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isCronAuthorized: vi.fn(),
  isConfigured: vi.fn(),
  notify: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/features/security/server/cron-auth", () => ({
  isCronAuthorized: mocks.isCronAuthorized,
}));
vi.mock("@/features/design-partners/server/notification", () => ({
  isDesignPartnerNotificationConfigured: mocks.isConfigured,
  notifyDesignPartnerApplication: mocks.notify,
}));
vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({
    designPartnerApplication: { findMany: mocks.findMany },
  }),
}));

import { GET } from "@/app/api/maintenance/design-partner-notifications/route";

describe("design partner notification maintenance route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isCronAuthorized.mockReturnValue(true);
    mocks.isConfigured.mockReturnValue(true);
    mocks.findMany.mockResolvedValue([{ id: "application_1" }]);
    mocks.notify.mockResolvedValue({ status: "sent" });
  });

  it("rejects unauthorized requests", async () => {
    mocks.isCronAuthorized.mockReturnValue(false);

    const response = await GET(new Request("http://localhost/maintenance"));

    expect(response.status).toBe(401);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("does no work when delivery is not configured", async () => {
    mocks.isConfigured.mockReturnValue(false);

    const response = await GET(new Request("http://localhost/maintenance"));

    await expect(response.json()).resolves.toEqual({
      processed: 0,
      notificationConfigured: false,
    });
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("retries queued applications", async () => {
    const response = await GET(new Request("http://localhost/maintenance"));

    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        notificationStatus: {
          in: ["pending", "failed", "disabled", "sending"],
        },
      },
      orderBy: { createdAt: "asc" },
      take: 25,
      select: { id: true },
    });
    expect(mocks.notify).toHaveBeenCalledWith("application_1");
    await expect(response.json()).resolves.toMatchObject({
      processed: 1,
      notificationConfigured: true,
    });
  });
});
