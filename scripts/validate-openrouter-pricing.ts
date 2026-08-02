import { z } from "zod";

import {
  getModelTokenPricing,
  getOpenRouterMaxPrice,
} from "../lib/billing/config";
import { MODELS } from "../lib/constants";

const catalogSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      pricing: z.object({
        prompt: z.string(),
        completion: z.string(),
      }),
    }),
  ),
});

const tolerancePercent = Number.parseFloat(
  process.env.OPENROUTER_PRICE_DRIFT_TOLERANCE_PERCENT || "5",
);

function relativeDifference(configured: number, live: number) {
  if (live === 0) return configured === 0 ? 0 : Number.POSITIVE_INFINITY;
  return (Math.abs(configured - live) / live) * 100;
}

async function main() {
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    signal: AbortSignal.timeout(10_000),
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`OpenRouter catalog request failed (${response.status})`);
  }

  const catalog = catalogSchema.parse(await response.json());
  const liveModels = new Map(catalog.data.map((model) => [model.id, model]));
  const failures: string[] = [];

  for (const activeModel of MODELS) {
    const liveModel = liveModels.get(activeModel.value);
    if (!liveModel) {
      failures.push(
        `${activeModel.value}: missing from the live model catalog`,
      );
      continue;
    }

    const live = {
      inputPricePerMillion: Number(liveModel.pricing.prompt) * 1_000_000,
      outputPricePerMillion: Number(liveModel.pricing.completion) * 1_000_000,
    };
    if (
      !Number.isFinite(live.inputPricePerMillion) ||
      !Number.isFinite(live.outputPricePerMillion)
    ) {
      failures.push(`${activeModel.value}: live token pricing is invalid`);
      continue;
    }

    const configured = getModelTokenPricing(activeModel.value);
    const ceiling = getOpenRouterMaxPrice(activeModel.value);
    if (
      ceiling.inputPricePerMillion < live.inputPricePerMillion ||
      ceiling.outputPricePerMillion < live.outputPricePerMillion
    ) {
      failures.push(
        `${activeModel.value}: max_price ${ceiling.inputPricePerMillion}/${ceiling.outputPricePerMillion} is below live pricing ${live.inputPricePerMillion}/${live.outputPricePerMillion}`,
      );
    }

    const inputDrift = relativeDifference(
      configured.inputPricePerMillion,
      live.inputPricePerMillion,
    );
    const outputDrift = relativeDifference(
      configured.outputPricePerMillion,
      live.outputPricePerMillion,
    );
    if (inputDrift > tolerancePercent || outputDrift > tolerancePercent) {
      failures.push(
        `${activeModel.value}: configured pricing drift is ${inputDrift.toFixed(1)}%/${outputDrift.toFixed(1)}% (limit ${tolerancePercent}%)`,
      );
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `OpenRouter pricing validation failed:\n- ${failures.join("\n- ")}`,
    );
  }

  console.log(
    `Validated pricing for ${MODELS.length} active OpenRouter models.`,
  );
}

void main();
