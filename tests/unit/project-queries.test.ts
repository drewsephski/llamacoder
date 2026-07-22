import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentSessionMock, prismaMock } = vi.hoisted(() => ({
  getCurrentSessionMock: vi.fn(),
  prismaMock: {
    $queryRaw: vi.fn(),
    chat: { findFirst: vi.fn() },
    message: { count: vi.fn(), findMany: vi.fn() },
    generationRun: { findFirst: vi.fn() },
    generationLog: { findMany: vi.fn() },
    exportArtifact: { findMany: vi.fn() },
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
    prismaMock.$queryRaw.mockResolvedValue([]);
    prismaMock.generationRun.findFirst.mockResolvedValue(null);
    prismaMock.generationLog.findMany.mockResolvedValue([]);
    prismaMock.exportArtifact.findMany.mockResolvedValue([]);
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

  it("keeps internal contract drafts and diagnostics out of the public workspace", async () => {
    getCurrentSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    prismaMock.chat.findFirst.mockResolvedValue({
      id: "private_contract_1",
      userId: "user_1",
      model: "model_1",
      quality: "low",
      title: "Task app",
      hasCode: false,
      appSpec: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.message.count.mockResolvedValue(4);
    const systemMessage = {
      id: "system_1",
      chatId: "private_contract_1",
      role: "system",
      content: "system",
      files: null,
      position: 0,
      followUpPrompts: null,
    };
    const userMessage = {
      ...systemMessage,
      id: "user_1",
      role: "user",
      content: "build a task app",
      position: 1,
    };
    const contractMessage = {
      ...userMessage,
      id: "contract_1",
      position: 2,
      files: {
        kind: "contract_repair",
        draftFiles: [{ path: "App.tsx", code: "private invalid draft" }],
        diagnostics: ["private contract diagnostic"],
      },
    };
    const assistantMessage = {
      ...systemMessage,
      id: "assistant_1",
      role: "assistant",
      content: "ready",
      files: [{ path: "App.tsx", code: "export default 1" }],
      position: 3,
    };
    prismaMock.message.findMany
      .mockResolvedValueOnce([systemMessage, userMessage])
      .mockResolvedValueOnce([assistantMessage, contractMessage])
      .mockResolvedValueOnce([userMessage, contractMessage])
      .mockResolvedValueOnce([]);

    const workspace = await getAuthorizedProjectWorkspace("private_contract_1");

    expect(workspace?.messages.map((message) => message.id)).toEqual([
      "system_1",
      "user_1",
      "assistant_1",
    ]);
    expect(workspace?.totalMessages).toBe(3);
    expect(JSON.stringify(workspace)).not.toContain("private invalid draft");
    expect(JSON.stringify(workspace)).not.toContain(
      "private contract diagnostic",
    );
  });
});
