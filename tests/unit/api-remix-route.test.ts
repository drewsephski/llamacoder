import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_MODEL } from "@/lib/constants";
import { buildChat, buildMessage, readJson } from "../fixtures/builders";

const {
  checkProjectCreationEligibilityMock,
  getSessionMock,
  prismaMock,
  txMock,
} = vi.hoisted(() => ({
  checkProjectCreationEligibilityMock: vi.fn(),
  getSessionMock: vi.fn(),
  txMock: {
    chat: { create: vi.fn() },
    shareEvent: { create: vi.fn() },
  },
  prismaMock: {
    $transaction: vi.fn(),
    message: { findUnique: vi.fn() },
  },
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

import { POST } from "@/app/api/remix/route";

function request(body: unknown) {
  return new Request("http://localhost/api/remix", {
    method: "POST",
    body: JSON.stringify(body),
  }) as never;
}

function sourceMessage(overrides: Record<string, unknown> = {}) {
  return buildMessage({
    id: "assistant_1",
    role: "assistant",
    chatId: "source_chat",
    files: [
      {
        path: "App.tsx",
        code: "export default function App() { return <main />; }",
      },
      {
        path: "components/Card.tsx",
        code: "export function Card() { return <section />; }",
      },
      {
        path: "components/Header.tsx",
        code: "export function Header() { return <header />; }",
      },
    ],
    chat: buildChat({
      id: "source_chat",
      model: FREE_MODEL,
      userId: "creator_1",
    }),
    ...overrides,
  });
}

describe("/api/remix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    checkProjectCreationEligibilityMock.mockResolvedValue({
      success: true,
      projectCount: 0,
      projectLimit: 3,
      projectsRemaining: 3,
      credits: 5,
      modelCost: 1,
      hasActiveSubscription: false,
    });
    prismaMock.message.findUnique.mockResolvedValue(sourceMessage());
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(txMock),
    );
    txMock.chat.create.mockResolvedValue({ id: "remix_chat" });
    txMock.shareEvent.create.mockResolvedValue({});
  });

  it("checks project/model eligibility before creating a remixed chat", async () => {
    const response = await POST(request({ messageId: "assistant_1" }));

    expect(response.status).toBe(200);
    await expect(readJson(response)).resolves.toEqual({
      chatId: "remix_chat",
    });
    expect(checkProjectCreationEligibilityMock).toHaveBeenCalledWith({
      userId: "user_1",
      modelId: FREE_MODEL,
    });
    expect(txMock.chat.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user_1",
        sourceMessageId: "assistant_1",
        sourceChatId: "source_chat",
        referrerUserId: "creator_1",
      }),
      select: { id: true },
    });
  });

  it("rejects remixes when the free project limit is reached", async () => {
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

    const response = await POST(request({ messageId: "assistant_1" }));

    expect(response.status).toBe(403);
    await expect(readJson(response)).resolves.toEqual({
      error: "PROJECT_LIMIT_REACHED",
      message: "You've used all 3 free projects. View pricing to remix more.",
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects remixes when the source model is not allowed for the user", async () => {
    prismaMock.message.findUnique.mockResolvedValueOnce(
      sourceMessage({
        chat: buildChat({
          id: "source_chat",
          model: "anthropic/claude-paid",
          userId: "creator_1",
        }),
      }),
    );
    checkProjectCreationEligibilityMock.mockResolvedValueOnce({
      success: false,
      error: "FORBIDDEN_MODEL",
      projectCount: 0,
      projectLimit: 3,
      projectsRemaining: 3,
      credits: 5,
      modelCost: 3,
      hasActiveSubscription: false,
    });

    const response = await POST(request({ messageId: "assistant_1" }));

    expect(response.status).toBe(403);
    await expect(readJson(response)).resolves.toEqual({
      error: "FORBIDDEN_MODEL",
      message: "Upgrade to remix apps built with this model",
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
