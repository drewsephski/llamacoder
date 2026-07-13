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

  it("assigns distinct colors to Grok and GLM", () => {
    expect(getModelBadgeClass("x-ai/grok-4.5")).toBe("model-grok");
    expect(getModelBadgeClass("z-ai/glm-5.2")).toBe("model-glm");
  });

  it("uses the neutral badge for an unknown provider", () => {
    expect(getModelBadgeClass("unknown/model")).toBe("model-default");
  });
});
