import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  releaseExpiredCreditHolds: vi.fn(),
}));

vi.mock("@/lib/billing", () => ({
  releaseExpiredCreditHolds: mocks.releaseExpiredCreditHolds,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({ creditHold: { count: mocks.count } }),
}));

import { GET } from "@/app/api/maintenance/credit-holds/route";

describe("expired credit hold maintenance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CRON_SECRET", "maintenance-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects unauthenticated requests without touching billing state", async () => {
    const response = await GET(
      new Request("https://www.squidagent.app/api/maintenance/credit-holds"),
    );

    expect(response.status).toBe(401);
    expect(mocks.releaseExpiredCreditHolds).not.toHaveBeenCalled();
  });

  it("releases expired holds and confirms the backlog is empty", async () => {
    mocks.releaseExpiredCreditHolds.mockResolvedValue({
      expiredHolds: 1,
      creditsRestored: 4,
    });
    mocks.count.mockResolvedValue(0);

    const response = await GET(
      new Request("https://www.squidagent.app/api/maintenance/credit-holds", {
        headers: { authorization: "Bearer maintenance-secret" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "completed",
      expiredHolds: 1,
      creditsRestored: 4,
      remainingExpiredHolds: 0,
    });
    expect(mocks.releaseExpiredCreditHolds).toHaveBeenCalledWith({ limit: 500 });
  });

  it("returns unavailable while more than one batch remains", async () => {
    mocks.releaseExpiredCreditHolds.mockResolvedValue({
      expiredHolds: 500,
      creditsRestored: 1_500,
    });
    mocks.count.mockResolvedValue(2);

    const response = await GET(
      new Request("https://www.squidagent.app/api/maintenance/credit-holds", {
        headers: { authorization: "Bearer maintenance-secret" },
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      status: "incomplete",
      remainingExpiredHolds: 2,
    });
  });
});
