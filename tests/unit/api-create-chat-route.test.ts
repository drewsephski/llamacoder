import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_MODEL } from "@/lib/constants";
import { readJson } from "../fixtures/builders";

const {
  checkProjectCreationEligibilityMock,
  createOpenRouterModelMock,
  generateTextMock,
  getSessionMock,
  prismaMock,
} = vi.hoisted(() => ({
  checkProjectCreationEligibilityMock: vi.fn(),
  createOpenRouterModelMock: vi.fn(() => "openrouter-model"),
  generateTextMock: vi.fn(),
  getSessionMock: vi.fn(),
  prismaMock: {
    chat: {
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    message: { update: vi.fn() },
    generationLog: { create: vi.fn() },
  },
}));

vi.mock("ai", () => ({
  generateText: generateTextMock,
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/lib/billing", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/billing")>();
  return {
    ...actual,
    checkProjectCreationEligibility: checkProjectCreationEligibilityMock,
  };
});

vi.mock("@/lib/openrouter", () => ({
  VISION_ANALYSIS_MODEL: "google/gemini-3-flash-preview",
  createAppOpenRouter: vi.fn(() => vi.fn()),
  createOpenRouterModel: createOpenRouterModelMock,
  getAIErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
}));

import { POST } from "@/app/api/create-chat/route";

function request(body: unknown) {
  return new Request("http://localhost/api/create-chat", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  }) as never;
}

describe("/api/create-chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkProjectCreationEligibilityMock.mockResolvedValue({
      success: true,
      projectCount: 0,
      projectLimit: 3,
      projectsRemaining: 3,
      credits: 5,
      modelCost: 1,
      hasActiveSubscription: false,
    });
    prismaMock.chat.create.mockResolvedValue({
      id: "chat_1",
      messages: [
        { id: "system_msg", position: 0 },
        { id: "user_msg", position: 1 },
      ],
    });
    prismaMock.chat.update.mockResolvedValue({});
    prismaMock.message.update.mockResolvedValue({});
    prismaMock.generationLog.create.mockResolvedValue({});
  });

  it("rejects invalid JSON/body", async () => {
    const response = await POST(request("{not-json"));

    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toMatchObject({
      error: "INVALID_REQUEST",
    });
  });

  it("rejects unsupported models before creating a chat", async () => {
    const response = await POST(
      request({ prompt: "Build", model: "missing/model", quality: "low" }),
    );

    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toEqual({
      error: "INVALID_MODEL",
      message: "Selected model is not supported",
    });
    expect(prismaMock.chat.create).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    getSessionMock.mockResolvedValueOnce(null);

    const response = await POST(
      request({
        prompt: "Build a timer",
        model: FREE_MODEL,
        quality: "low",
      }),
    );

    expect(response.status).toBe(401);
    await expect(readJson(response)).resolves.toMatchObject({
      error: "AUTHENTICATION_REQUIRED",
    });
  });

  it("rejects direct chat creation when the free project limit is reached", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    checkProjectCreationEligibilityMock.mockResolvedValueOnce({
      success: false,
      error: "PROJECT_LIMIT_REACHED",
      projectCount: 3,
      projectLimit: 3,
      projectsRemaining: 0,
      credits: 5,
      modelCost: 1,
      hasActiveSubscription: false,
    });

    const response = await POST(
      request({
        prompt: "Build a fourth app",
        model: FREE_MODEL,
        quality: "low",
      }),
    );

    expect(response.status).toBe(403);
    await expect(readJson(response)).resolves.toEqual({
      error: "PROJECT_LIMIT_REACHED",
      message: "You've used all 3 free projects. View pricing to create more.",
    });
    expect(prismaMock.chat.create).not.toHaveBeenCalled();
  });

  it("falls back when title generation fails and returns the stable response shape", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    generateTextMock.mockRejectedValueOnce(new Error("provider down"));

    const response = await POST(
      request({
        prompt: "Build a polished habit tracker with streak charts",
        model: FREE_MODEL,
        quality: "low",
      }),
    );

    expect(response.status).toBe(200);
    await expect(readJson(response)).resolves.toEqual({
      chatId: "chat_1",
      lastMessageId: "user_msg",
      plan: null,
      hasCode: false,
      warnings: ["TITLE_GENERATION_FAILED"],
    });
    expect(prismaMock.chat.update).toHaveBeenCalledWith({
      where: { id: "chat_1" },
      data: {
        title: "Build a polished habit tracker",
        plan: null,
        hasCode: false,
      },
    });
  });

  it("uses the dedicated vision model when analyzing an uploaded screenshot", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    generateTextMock
      .mockResolvedValueOnce({ text: "Screenshot shows a kanban board." })
      .mockResolvedValueOnce({ text: "Kanban Board" });

    const response = await POST(
      request({
        prompt: "Build this",
        model: FREE_MODEL,
        quality: "low",
        screenshotData: `data:image/png;base64,${Buffer.from("png").toString("base64")}`,
      }),
    );

    expect(response.status).toBe(200);
    expect(createOpenRouterModelMock).toHaveBeenCalledWith(
      expect.any(Function),
      "google/gemini-3-flash-preview",
      { maxTokens: 1000 },
    );
    expect(prismaMock.message.update).toHaveBeenCalledWith({
      where: { id: "user_msg" },
      data: {
        content:
          "Build this\n\nRECREATE THIS APP AS CLOSELY AS POSSIBLE:\nScreenshot shows a kanban board.",
      },
    });
  });
});
