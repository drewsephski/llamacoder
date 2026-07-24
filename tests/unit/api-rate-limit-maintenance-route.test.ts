import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  purgeExpiredRateLimitBuckets: vi.fn(),
}));

vi.mock("@/features/security/server/rate-limit", () => ({
  purgeExpiredRateLimitBuckets: mocks.purgeExpiredRateLimitBuckets,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => ({ apiRateLimitBucket: { count: mocks.count } }),
}));

import { GET } from "@/app/api/maintenance/rate-limit-buckets/route";

describe("expired rate-limit bucket maintenance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CRON_SECRET", "maintenance-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects unauthenticated requests in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const response = await GET(
      new Request(
        "https://www.squidagent.app/api/maintenance/rate-limit-buckets",
      ),
    );

    expect(response.status).toBe(401);
    expect(mocks.purgeExpiredRateLimitBuckets).not.toHaveBeenCalled();
  });

  it("allows unauthenticated requests outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mocks.purgeExpiredRateLimitBuckets.mockResolvedValue(0);
    mocks.count.mockResolvedValue(0);

    const response = await GET(
      new Request(
        "https://www.squidagent.app/api/maintenance/rate-limit-buckets",
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.purgeExpiredRateLimitBuckets).toHaveBeenCalled();
  });

  it("purges expired buckets and confirms the backlog is empty", async () => {
    mocks.purgeExpiredRateLimitBuckets.mockResolvedValue(12);
    mocks.count.mockResolvedValue(0);

    const response = await GET(
      new Request(
        "https://www.squidagent.app/api/maintenance/rate-limit-buckets",
        {
          headers: { authorization: "Bearer maintenance-secret" },
        },
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "completed",
      purged: 12,
      remainingExpiredBuckets: 0,
    });
  });
});
