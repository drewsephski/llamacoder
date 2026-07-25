import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentSessionMock, prismaMock } = vi.hoisted(() => ({
  getCurrentSessionMock: vi.fn(),
  prismaMock: {
    chat: {
      findFirst: vi.fn(),
    },
    message: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/features/auth/server/session", () => ({
  getCurrentSession: getCurrentSessionMock,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/features/generation/message-files", () => ({
  getMessageGeneratedFiles: () => [],
}));

vi.mock("@/lib/observability", () => ({
  recordOperationalEvent: vi.fn(),
}));

import { GET } from "@/app/api/projects/[projectId]/versions/route";

describe("project versions route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    prismaMock.chat.findFirst.mockResolvedValue({ id: "chat_1" });
    prismaMock.message.findMany.mockResolvedValue([]);
  });

  it("returns 400 for invalid cursor values", async () => {
    const response = await GET(
      new Request(
        "https://example.com/api/projects/chat_1/versions?cursor=abc",
      ),
      { params: Promise.resolve({ projectId: "chat_1" }) },
    );

    expect(response.status).toBe(400);
  });
});
