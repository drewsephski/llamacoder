import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildMessage, collectStream } from "../fixtures/builders";

const {
  getSessionMock,
  prismaMock,
  releaseCreditHoldMock,
  reserveCreditHoldMock,
  streamTextMock,
} = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  releaseCreditHoldMock: vi.fn(),
  reserveCreditHoldMock: vi.fn(),
  streamTextMock: vi.fn(),
  prismaMock: {
    message: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("ai", () => ({
  streamText: streamTextMock,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/lib/billing", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/billing")>();
  return {
    ...actual,
    releaseCreditHold: releaseCreditHoldMock,
    reserveCreditHold: reserveCreditHoldMock,
  };
});

vi.mock("@/lib/openrouter", () => ({
  GENERATED_CODE_MAX_TOKENS: 16000,
  createAppOpenRouter: vi.fn(() => vi.fn()),
  createOpenRouterModel: vi.fn(() => "openrouter-model"),
  getAIErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
  getAIErrorStatus: () => 502,
  getOpenRouterProviderOptions: vi.fn(() => ({
    openrouter: {
      reasoning: { enabled: false },
    },
  })),
}));

import { POST } from "@/app/api/get-next-completion-stream-promise/route";

function request(body: unknown) {
  return new Request(
    "http://localhost/api/get-next-completion-stream-promise",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

async function* chunks(parts: string[]) {
  for (const part of parts) {
    yield part;
  }
}

describe("/api/get-next-completion-stream-promise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    reserveCreditHoldMock.mockResolvedValue({
      success: true,
      holdId: "hold_1",
      creditsUsed: 1,
      remainingCredits: 4,
    });
    releaseCreditHoldMock.mockResolvedValue({ success: true });
  });

  it("rejects invalid requests and missing messages", async () => {
    let response = await POST(request({ messageId: "", model: "" }));
    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe("Invalid request");

    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.message.findUnique.mockResolvedValueOnce(null);
    response = await POST(request({ messageId: "msg_1", model: "model_1" }));
    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe("Message not found");
  });

  it("requires authentication", async () => {
    getSessionMock.mockResolvedValueOnce(null);
    const response = await POST(
      request({ messageId: "msg_1", model: "model_1" }),
    );

    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe("Unauthorized");
  });

  it("rejects requests for chats the session does not own", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_2" } });
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({
        id: "msg_12",
        chatId: "chat_1",
        position: 12,
        chat: {
          userId: "user_1",
          model: "model_1",
        },
      }),
    );

    const response = await POST(
      request({ messageId: "msg_12", model: "model_1" }),
    );

    expect(response.status).toBe(403);
    await expect(response.text()).resolves.toBe("Forbidden");
  });

  it("fails when client-sent model does not match the chat model", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({
        id: "msg_12",
        chatId: "chat_1",
        position: 12,
        chat: {
          userId: "user_1",
          model: "stored-model",
        },
      }),
    );

    const response = await POST(
      request({ messageId: "msg_12", model: "wrong-model" }),
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe("Model mismatch");
  });

  it("orders history, trims old messages, appends the generation guard, and streams text", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({
        id: "msg_12",
        chatId: "chat_1",
        position: 12,
        chat: {
          userId: "user_1",
          model: "model_1",
        },
      }),
    );
    prismaMock.message.findMany.mockResolvedValueOnce([
      { role: "system", content: "system" },
      { role: "user", content: "first user" },
      { role: "assistant", content: "```tsx\nold code\n```" },
      { role: "user", content: "second user" },
      { role: "assistant", content: "assistant 2" },
      { role: "user", content: "third user" },
      { role: "assistant", content: "assistant 3" },
      { role: "user", content: "fourth user" },
      { role: "assistant", content: "assistant 4" },
      { role: "user", content: "fifth user" },
      { role: "assistant", content: "assistant 5" },
      { role: "user", content: "final user" },
    ]);
    streamTextMock.mockReturnValueOnce({
      textStream: chunks(["hello", " ", "world"]),
    });

    const response = await POST(
      request({ messageId: "msg_12", model: "model_1" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-credit-hold-id")).toBe("hold_1");
    await expect(collectStream(response)).resolves.toBe("hello world");
    expect(prismaMock.message.findMany).toHaveBeenCalledWith({
      where: { chatId: "chat_1", position: { lte: 12 } },
      orderBy: { position: "asc" },
    });
    const call = streamTextMock.mock.calls[0][0];
    expect(call.messages).toHaveLength(10);
    expect(call.messages.at(-1)).toMatchObject({
      role: "user",
      content: expect.stringContaining("Generation completeness requirements:"),
    });
    expect(call.messages.at(-1).content).toContain("final user");
  });

  it("uses current files for free preview repairs without the full-generation guard or credit hold", async () => {
    getSessionMock.mockResolvedValueOnce({ user: { id: "user_1" } });
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({
        id: "repair_msg_1",
        chatId: "chat_1",
        position: 4,
        content:
          "The code is not working. Can you fix it? Here's the error:\n\nReferenceError: total is not defined",
        files: {
          kind: "preview_repair_request",
          chargeCredits: false,
          sourceMessageId: "assistant_1",
        },
        chat: {
          id: "chat_1",
          userId: "user_1",
          model: "model_1",
        },
      }),
    );
    prismaMock.message.findMany.mockResolvedValueOnce([
      { id: "system_1", role: "system", content: "system prompt" },
      { id: "user_1", role: "user", content: "build calculator" },
      {
        id: "assistant_1",
        role: "assistant",
        content: "created app",
        files: [
          {
            path: "App.tsx",
            language: "tsx",
            code: "export default function App() { return <main>{total}</main>; }",
          },
          {
            path: "components/Display.tsx",
            language: "tsx",
            code: "export function Display() { return <p />; }",
          },
        ],
      },
      {
        id: "repair_msg_1",
        role: "user",
        content:
          "The code is not working. Can you fix it? Here's the error:\n\nReferenceError: total is not defined",
        files: {
          kind: "preview_repair_request",
          chargeCredits: false,
          sourceMessageId: "assistant_1",
        },
      },
    ]);
    streamTextMock.mockReturnValueOnce({
      textStream: chunks([
        "```tsx{path=App.tsx}\nexport default function App() { return <main>0</main>; }\n```",
      ]),
    });

    const response = await POST(
      request({ messageId: "repair_msg_1", model: "model_1" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-credit-hold-id")).toBeNull();
    await expect(collectStream(response)).resolves.toContain(
      "export default function App()",
    );
    expect(reserveCreditHoldMock).not.toHaveBeenCalled();
    const call = streamTextMock.mock.calls[0][0];
    expect(call.messages).toHaveLength(2);
    expect(call.messages[1].content).toContain(
      "Return only complete files that changed",
    );
    expect(call.messages[1].content).toContain("path=App.tsx");
    expect(call.messages[1].content).toContain(
      "ReferenceError: total is not defined",
    );
    expect(call.messages[1].content).not.toContain(
      "Generation completeness requirements:",
    );
    expect(call.messages[1].content).not.toContain(
      "Output a complete multi-file React + TypeScript app",
    );
  });
});
