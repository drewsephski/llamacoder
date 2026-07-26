import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateTextMock, getSessionMock, consumeRateLimitMock } = vi.hoisted(
  () => ({
    generateTextMock: vi.fn(),
    getSessionMock: vi.fn(),
    consumeRateLimitMock: vi.fn(),
  }),
);

vi.mock("ai", () => ({
  generateText: generateTextMock,
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: getSessionMock } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/openrouter", () => ({
  createAppOpenRouter: vi.fn(() => "openrouter"),
  createOpenRouterModel: vi.fn(() => "model"),
}));

vi.mock("@/features/security/server/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
}));

import { POST } from "@/app/api/enhance-prompt/route";

function request(body: unknown) {
  return new Request("http://localhost/api/enhance-prompt", {
    method: "POST",
    body: JSON.stringify(body),
  }) as never;
}

describe("POST /api/enhance-prompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consumeRateLimitMock.mockResolvedValue({ allowed: true, remaining: 11 });
    generateTextMock.mockResolvedValue({ text: "Enhanced prompt copy." });
  });

  it("requires authentication", async () => {
    getSessionMock.mockResolvedValue(null);

    const response = await POST(request({ prompt: "Build a dashboard" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("AUTHENTICATION_REQUIRED");
    expect(body.message).toBe(
      "Sign in to enhance your prompt, then try again.",
    );
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("rate limits authenticated requests", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "user_1" } });
    consumeRateLimitMock.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 15,
    });

    const response = await POST(request({ prompt: "Build a dashboard" }));

    expect(response.status).toBe(429);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("returns enhanced text for authenticated users", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "user_1" } });

    const response = await POST(request({ prompt: "Build a dashboard" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.enhanced).toBe("Enhanced prompt copy.");
    expect(consumeRateLimitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        operation: "enhance_prompt",
      }),
    );
  });
});
