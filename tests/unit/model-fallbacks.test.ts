import { describe, expect, it } from "vitest";
import { FREE_MODEL, LEGACY_FREE_MODEL } from "@/lib/constants";
import { getModelWithFallbacks } from "@/lib/model-fallbacks";

describe("model fallbacks", () => {
  it("uses only the current free model and routes legacy free chats to it", () => {
    expect(getModelWithFallbacks(FREE_MODEL)).toEqual([FREE_MODEL]);
    expect(getModelWithFallbacks(LEGACY_FREE_MODEL)).toEqual([FREE_MODEL]);
  });

  it("does not add fallback routes for paid models", () => {
    expect(getModelWithFallbacks("moonshotai/kimi-k2.7-code")).toEqual([
      "moonshotai/kimi-k2.7-code",
    ]);
  });
});
