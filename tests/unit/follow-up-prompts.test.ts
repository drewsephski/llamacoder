import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@/lib/openrouter", () => ({
  createAppOpenRouter: vi.fn(),
  createOpenRouterModel: vi.fn(),
  getAIErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
  getOpenRouterProviderOptions: vi.fn(),
}));

import { normalizeFollowUpPrompts } from "@/lib/follow-up-prompts";

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
});
