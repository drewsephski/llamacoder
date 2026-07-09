import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    shareEvent: { findMany: vi.fn() },
    message: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

import { GET } from "@/app/api/gallery/route";

describe("/api/gallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.shareEvent.findMany.mockResolvedValue([]);
    prismaMock.message.findMany.mockResolvedValue([]);
  });

  it("only promotes explicitly featured share events", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(prismaMock.shareEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventType: "gallery_featured" },
      }),
    );
    await expect(response.json()).resolves.toEqual({ apps: [] });
  });
});
