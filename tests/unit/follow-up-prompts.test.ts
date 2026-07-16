import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const generateTextMock = vi.hoisted(() => vi.fn());

vi.mock("ai", () => ({
  generateText: generateTextMock,
}));

vi.mock("@/lib/openrouter", () => ({
  createAppOpenRouter: vi.fn(),
  createOpenRouterModel: vi.fn(),
  getAIErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
  getOpenRouterProviderOptions: vi.fn(),
}));

import {
  generateFollowUpPrompts,
  normalizeFollowUpPrompts,
} from "@/lib/follow-up-prompts";

describe("follow-up prompt normalization", () => {
  it("keeps brief unique prompts and backfills with fallbacks", () => {
    expect(
      normalizeFollowUpPrompts(
        [
          "  Add saved filters  ",
          "Add saved filters",
          "x".repeat(120),
          "Improve empty states",
        ],
        ["Polish the dashboard UI", "Add realistic dashboard data"],
      ),
    ).toEqual([
      "Add saved filters",
      "Improve empty states",
      "Polish the dashboard UI",
    ]);
  });

  it("uses the dedicated system channel for generation instructions", async () => {
    generateTextMock.mockResolvedValueOnce({
      text: '{"prompts":["Add filters","Polish mobile","Improve loading"]}',
    });

    await generateFollowUpPrompts({
      chat: { id: "chat_1", title: "Dashboard", prompt: "Build a dashboard" },
      assistantContent: "Dashboard generated.",
    });

    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("Generate concise follow-up prompts"),
        prompt: expect.stringContaining("Project title: Dashboard"),
      }),
    );
    expect(generateTextMock.mock.calls[0][0]).not.toHaveProperty("messages");
  });
});
