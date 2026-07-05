import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildMessage, collectStream } from "../fixtures/builders";

const { prismaMock, streamTextMock } = vi.hoisted(() => ({
  streamTextMock: vi.fn(),
  prismaMock: {
    message: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("ai", () => ({
  streamText: streamTextMock,
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prismaMock,
}));

vi.mock("@/lib/openrouter", () => ({
  GENERATED_CODE_MAX_TOKENS: 16000,
  createAppOpenRouter: vi.fn(() => vi.fn()),
  createOpenRouterModel: vi.fn(() => "openrouter-model"),
  getAIErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
  getAIErrorStatus: () => 502,
}));

import { POST } from "@/app/api/get-next-completion-stream-promise/route";

function request(body: unknown) {
  return new Request("http://localhost/api/get-next-completion-stream-promise", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function* chunks(parts: string[]) {
  for (const part of parts) {
    yield part;
  }
}

describe("/api/get-next-completion-stream-promise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid requests and missing messages", async () => {
    let response = await POST(request({ messageId: "", model: "" }));
    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe("Invalid request");

    prismaMock.message.findUnique.mockResolvedValueOnce(null);
    response = await POST(request({ messageId: "msg_1", model: "model_1" }));
    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe("Message not found");
  });

  it("orders history, trims old messages, appends the generation guard, and streams text", async () => {
    prismaMock.message.findUnique.mockResolvedValueOnce(
      buildMessage({ id: "msg_12", chatId: "chat_1", position: 12 }),
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

    const response = await POST(request({ messageId: "msg_12", model: "model_1" }));

    expect(response.status).toBe(200);
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
});
