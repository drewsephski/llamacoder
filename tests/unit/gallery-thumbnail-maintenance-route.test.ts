import { beforeEach, describe, expect, it, vi } from "vitest";

const { resetStaleMock } = vi.hoisted(() => ({
  resetStaleMock: vi.fn(),
}));

vi.mock("@/features/gallery/server/thumbnail", () => ({
  resetStaleGalleryThumbnails: resetStaleMock,
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
    expect(resetStaleMock).not.toHaveBeenCalled();
  });

  it("marks stale pending publications as failed for Vercel Cron", async () => {
    resetStaleMock.mockResolvedValue({ markedFailed: 2 });
    const response = await GET(
      new Request("http://localhost/api/maintenance/gallery-thumbnails", {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      }),
    );

    expect(response.status).toBe(200);
    expect(resetStaleMock).toHaveBeenCalledWith();
    await expect(response.json()).resolves.toEqual({ markedFailed: 2 });
  });
});
