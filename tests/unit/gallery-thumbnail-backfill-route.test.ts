import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock, processBatchMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  processBatchMock: vi.fn(),
}));

vi.mock("@/features/auth/server/session", () => ({
  getCurrentSession: getSessionMock,
}));
vi.mock("@/features/gallery/server/thumbnail", () => ({
  processGalleryThumbnailBatch: processBatchMock,
}));

import { POST } from "@/app/api/gallery/thumbnails/backfill/route";

describe("gallery thumbnail owner backfill", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires an authenticated owner session", async () => {
    getSessionMock.mockResolvedValue(null);
    const response = await POST();

    expect(response.status).toBe(401);
    expect(processBatchMock).not.toHaveBeenCalled();
  });

  it("processes one owner-scoped thumbnail at a time", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "owner_1" } });
    processBatchMock.mockResolvedValue({ processed: 1, ready: 1, failed: 0 });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(processBatchMock).toHaveBeenCalledWith({
      limit: 1,
      userId: "owner_1",
    });
  });
});
