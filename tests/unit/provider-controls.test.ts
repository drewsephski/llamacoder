import { afterEach, describe, expect, it } from "vitest";

import { getGenerationAvailability } from "@/lib/provider-controls";

describe("generation provider controls", () => {
  afterEach(() => {
    delete process.env.GENERATION_KILL_SWITCH;
    delete process.env.DISABLED_MODELS;
    delete process.env.DISABLED_PROVIDERS;
  });

  it("can pause all generation without a deploy", () => {
    process.env.GENERATION_KILL_SWITCH = "1";
    expect(getGenerationAvailability("openai/gpt-4.1")).toEqual({
      available: false,
      reason: "Generation is temporarily paused while we resolve an incident.",
    });
  });

  it("matches disabled models and providers case-insensitively", () => {
    process.env.DISABLED_MODELS = "openai/gpt-4.1";
    process.env.DISABLED_PROVIDERS = "Google";

    expect(getGenerationAvailability("OPENAI/GPT-4.1").available).toBe(false);
    expect(
      getGenerationAvailability("google/gemini-2.5-flash-lite").available,
    ).toBe(false);
    expect(getGenerationAvailability("deepseek/deepseek-v4-flash")).toEqual({
      available: true,
    });
  });
});
