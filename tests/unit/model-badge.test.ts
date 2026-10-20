import { describe, expect, it } from "vitest";

import { getModelBadgeClass } from "@/features/projects/model-badge";
import { MODELS } from "@/lib/constants";

describe("getModelBadgeClass", () => {
  it.each(MODELS.map((model) => [model.label, model.value]))(
    "assigns %s a provider color",
    (_label, modelId) => {
      expect(getModelBadgeClass(modelId)).not.toBe("model-default");
    },
  );

  it("assigns distinct colors to GPT Luna and GLM", () => {
    expect(getModelBadgeClass("openai/gpt-6-luna")).toBe("model-gpt");
    expect(getModelBadgeClass("z-ai/glm-5.3-flash")).toBe("model-glm");
  });

  it("uses the neutral badge for an unknown provider", () => {
    expect(getModelBadgeClass("unknown/model")).toBe("model-default");
  });
});
