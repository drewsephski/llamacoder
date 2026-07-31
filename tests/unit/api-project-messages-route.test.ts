import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMessageMock } = vi.hoisted(() => ({
  createMessageMock: vi.fn(),
}));

vi.mock("@/features/generation/server/actions", () => ({
  createMessage: createMessageMock,
}));

import { POST } from "@/app/api/projects/[projectId]/messages/route";

function postMessage(body: unknown) {
  return POST(
    new Request("https://example.com/api/projects/chat_1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ projectId: "chat_1" }) },
  );
}

describe("project messages route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMessageMock.mockResolvedValue({ id: "message_1" });
  });

  it("creates a user message through a stable HTTP endpoint", async () => {
    const response = await postMessage({ text: "  Make the header bolder  " });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ messageId: "message_1" });
    expect(createMessageMock).toHaveBeenCalledWith(
      "chat_1",
      "Make the header bolder",
      "user",
    );
  });

  it("rejects an empty message", async () => {
    const response = await postMessage({ text: "   " });

    expect(response.status).toBe(400);
    expect(createMessageMock).not.toHaveBeenCalled();
  });

  it.each([
    ["You must be signed in to send messages", 401, "AUTHENTICATION_REQUIRED"],
    ["You do not have access to this project", 404, "PROJECT_NOT_FOUND"],
    ["INSUFFICIENT_CREDITS", 402, "INSUFFICIENT_CREDITS"],
    ["CREDIT_CHECK_FAILED", 503, "CREDIT_CHECK_FAILED"],
  ])("maps %s to a structured API error", async (message, status, code) => {
    createMessageMock.mockRejectedValueOnce(new Error(message));

    const response = await postMessage({ text: "Update the app" });

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: code }),
    );
  });
});
