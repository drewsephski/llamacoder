import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentSession: vi.fn(),
  getPrisma: vi.fn(),
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

import { GET, PATCH } from "@/app/api/generation-runs/[runId]/route";

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
    });
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: "run_1", userId: "user_1" },
    });
  });

  it("completes a generation run when requested", async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: "run_1",
      creditHoldId: "hold_1",
    });
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

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "completed" });
    expect(update).toHaveBeenCalledWith({
      where: { id: "run_1" },
      data: {
        status: "completed",
        assistantMessageId: "assistant_1",
        completedAt: expect.any(Date),
      },
    });
  });
});
