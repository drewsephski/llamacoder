import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentSession: vi.fn(),
  getPrisma: vi.fn(),
  finalizeOwnedGenerationRun: vi.fn(),
  releaseCreditHold: vi.fn(),
}));

vi.mock("@/features/auth/server/session", () => ({
  getCurrentSession: mocks.getCurrentSession,
}));

vi.mock("@/lib/billing", () => ({
  releaseCreditHold: mocks.releaseCreditHold,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: mocks.getPrisma,
}));

vi.mock(
  "@/features/generation/server/workflow",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@/features/generation/server/workflow")
    >()),
    finalizeOwnedGenerationRun: mocks.finalizeOwnedGenerationRun,
  }),
);

import { GET, PATCH, POST } from "@/app/api/generation-runs/[runId]/route";

describe("/api/generation-runs/[runId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentSession.mockResolvedValue({ user: { id: "user_1" } });
    mocks.releaseCreditHold.mockResolvedValue({ success: true });
    mocks.getPrisma.mockReturnValue({
      generationRun: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    });
  });

  it("returns the persisted generation run snapshot for the owner", async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: "run_1",
      messageId: "message_1",
      status: "recoverable",
      phase: "validation_repair",
      label: "Fixing generated app",
      partialText: "```tsx{path=App.tsx}\nexport default function App(){}\n```",
      creditHoldId: "hold_1",
      errorMessage: "Generated app did not pass its required contract",
    });
    mocks.getPrisma.mockReturnValue({
      generationRun: { findFirst, update: vi.fn() },
    });

    const response = await GET(
      new Request("http://localhost/api/generation-runs/run_1"),
      {
        params: Promise.resolve({ runId: "run_1" }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "run_1",
      messageId: "message_1",
      status: "recoverable",
      phase: "validation_repair",
      label: "Fixing generated app",
      partialText: "```tsx{path=App.tsx}\nexport default function App(){}\n```",
      creditHoldId: "hold_1",
      errorMessage: "Generated app did not pass its required contract",
      recoveryMode: "restore",
    });
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: "run_1", userId: "user_1" },
    });
  });

  it("rejects client-authored completion state", async () => {
    const findFirst = vi.fn();
    const update = vi.fn().mockResolvedValue({});
    mocks.getPrisma.mockReturnValue({
      generationRun: { findFirst, update },
    });

    const response = await PATCH(
      new Request("http://localhost/api/generation-runs/run_1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          assistantMessageId: "assistant_1",
        }),
      }),
      { params: Promise.resolve({ runId: "run_1" }) },
    );

    expect(response.status).toBe(400);
    expect(findFirst).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("finalizes a generation run through the server-owned workflow", async () => {
    mocks.finalizeOwnedGenerationRun.mockResolvedValue({
      id: "assistant_1",
      chatId: "chat_1",
      role: "assistant",
    });

    const response = await POST(
      new Request("http://localhost/api/generation-runs/run_1", {
        method: "POST",
      }),
      { params: Promise.resolve({ runId: "run_1" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: {
        id: "assistant_1",
        chatId: "chat_1",
        role: "assistant",
      },
    });
    expect(mocks.finalizeOwnedGenerationRun).toHaveBeenCalledWith({
      runId: "run_1",
      userId: "user_1",
    });
  });
});
