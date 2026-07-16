import { beforeEach, describe, expect, it, vi } from "vitest";

const { processBatchMock } = vi.hoisted(() => ({
  processBatchMock: vi.fn(),
}));

vi.mock("@/features/gallery/server/thumbnail", () => ({
  processGalleryThumbnailBatch: processBatchMock,
}));

import { GET } from "@/app/api/maintenance/gallery-thumbnails/route";

describe("gallery thumbnail maintenance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "a".repeat(32);
  });

  it("rejects unauthenticated recovery requests", async () => {
    const response = await GET(
      new Request("http://localhost/api/maintenance/gallery-thumbnails"),
    );
    expect(response.status).toBe(401);
    expect(processBatchMock).not.toHaveBeenCalled();
  });

  it("processes a bounded recovery batch for Vercel Cron", async () => {
    processBatchMock.mockResolvedValue({ processed: 2, ready: 2, failed: 0 });
    const response = await GET(
      new Request("http://localhost/api/maintenance/gallery-thumbnails", {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      }),
    );

    expect(response.status).toBe(200);
    expect(processBatchMock).toHaveBeenCalledWith();
    await expect(response.json()).resolves.toEqual({
      processed: 2,
      ready: 2,
      failed: 0,
    });
  });
});
