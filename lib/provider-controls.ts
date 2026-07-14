type GenerationAvailability =
  | { available: true }
  | { available: false; reason: string };

function getDisabledValues(name: "DISABLED_MODELS" | "DISABLED_PROVIDERS") {
  return new Set(
    (process.env[name] ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function getGenerationAvailability(
  modelId: string,
): GenerationAvailability {
  if (process.env.GENERATION_KILL_SWITCH === "1") {
    return {
      available: false,
      reason: "Generation is temporarily paused while we resolve an incident.",
    };
  }

  const normalizedModel = modelId.trim().toLowerCase();
  const provider = normalizedModel.split("/", 1)[0];
  if (getDisabledValues("DISABLED_MODELS").has(normalizedModel)) {
    return {
      available: false,
      reason: "This model is temporarily unavailable. Choose another model.",
    };
  }
  if (provider && getDisabledValues("DISABLED_PROVIDERS").has(provider)) {
    return {
      available: false,
      reason:
        "This model provider is temporarily unavailable. Choose another model.",
    };
  }

  return { available: true };
}

export function assertGenerationAvailable(modelId: string) {
  const availability = getGenerationAvailability(modelId);
  if (!availability.available) {
    throw new Error(`GENERATION_DISABLED:${availability.reason}`);
  }
}
