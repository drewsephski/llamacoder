import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
}));

vi.mock("@/features/auth/server/session", () => ({
  getCurrentSession: getSessionMock,
}));

import { POST } from "@/app/api/gallery/thumbnails/backfill/route";

describe("gallery thumbnail owner backfill", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a deprecation response because capture is client-side", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "owner_1" } });

    const response = await POST();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        error: "DEPRECATED",
      }),
    );
  });
});
