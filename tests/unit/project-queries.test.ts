import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentSessionMock, prismaMock } = vi.hoisted(() => ({
  getCurrentSessionMock: vi.fn(),
  prismaMock: {
    $queryRaw: vi.fn(),
    chat: { findFirst: vi.fn() },
    message: { count: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock("@/features/auth/server/session", () => ({
  getCurrentSession: getCurrentSessionMock,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

import { getAuthorizedProjectWorkspace } from "@/features/projects/server/queries";

describe("project workspace queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not query project data without a verified session", async () => {
    getCurrentSessionMock.mockResolvedValue(null);

    await expect(
      getAuthorizedProjectWorkspace("private_1"),
    ).resolves.toBeNull();
    expect(prismaMock.chat.findFirst).not.toHaveBeenCalled();
  });

  it("scopes the workspace query to the current user", async () => {
    getCurrentSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    prismaMock.chat.findFirst.mockResolvedValue(null);

    await expect(
      getAuthorizedProjectWorkspace("private_2"),
    ).resolves.toBeNull();
    expect(prismaMock.chat.findFirst).toHaveBeenCalledWith({
      where: { id: "private_2", userId: "user_1" },
    });
  });
});
