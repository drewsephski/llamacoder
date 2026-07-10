import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_MODEL } from "@/lib/constants";
import { readJson } from "../fixtures/builders";

const {
  afterMock,
  afterTasks,
  checkProjectCreationEligibilityMock,
  createOpenRouterModelMock,
  generateTextMock,
  getSessionMock,
  prismaMock,
} = vi.hoisted(() => ({
  afterMock: vi.fn(),
  afterTasks: [] as Array<() => Promise<void> | void>,
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
  },
}));

vi.mock("ai", () => ({
  generateText: generateTextMock,
}));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: afterMock };
});

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
  getOpenRouterProviderOptions: vi.fn(() => ({
    openrouter: {
      reasoning: { enabled: false },
    },
  })),
  getOpenRouterUsageMetadata: vi.fn(() => null),
  getOpenRouterReasoningSelection: vi.fn(() => ({
    enabled: false,
    visible: false,
    mandatory: false,
    effort: "none",
  })),
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
    afterTasks.length = 0;
    afterMock.mockImplementation((task: () => Promise<void> | void) => {
      afterTasks.push(task);
    });
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

  it("returns immediately and keeps the fallback title when async title generation fails", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });

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
    });
    expect(generateTextMock).not.toHaveBeenCalled();
    expect(afterTasks).toHaveLength(1);

    generateTextMock.mockRejectedValueOnce(new Error("provider down"));
    await afterTasks[0]();
    expect(prismaMock.chat.update).not.toHaveBeenCalled();
  });

  it("generates and persists the title after the response is returned", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    generateTextMock.mockResolvedValueOnce({ text: "Habit Streaks" });

    const response = await POST(
      request({
        prompt: "Build a polished habit tracker with streak charts",
        model: FREE_MODEL,
        quality: "high",
      }),
    );

    expect(response.status).toBe(200);
    expect(generateTextMock).not.toHaveBeenCalled();

    await afterTasks[0]();
    expect(prismaMock.chat.update).toHaveBeenCalledWith({
      where: { id: "chat_1" },
      data: {
        title: "Habit Streaks",
      },
    });
  });

  it("does not block chat creation on screenshot analysis", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });

    const response = await POST(
      request({
        prompt: "Build this",
        model: FREE_MODEL,
        quality: "low",
        screenshotData: `data:image/png;base64,${Buffer.from("png").toString("base64")}`,
      }),
    );

    expect(response.status).toBe(200);
    expect(generateTextMock).not.toHaveBeenCalled();
    expect(afterTasks).toHaveLength(1);
  });
});
