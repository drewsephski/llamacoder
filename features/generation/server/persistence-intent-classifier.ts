import "server-only";

import { generateText, Output } from "ai";

import {
  createPersistenceClassificationFallback,
  persistenceJudgmentSchema,
  persistenceJudgmentToIntent,
} from "@/features/generation/persistence-intent";
import type { DataPersistenceIntent } from "@/features/generation/app-spec";

const PERSISTENCE_CLASSIFIER_SYSTEM_PROMPT = `You classify whether an app or website request needs durable data persistence.

Return only the requested structured result. Judge the product semantically, not by matching words.

Set isAppRequest=false and requiresPersistence=false for non-app, conversational, or off-topic requests.
Set requiresPersistence=true when the product's useful behavior depends on creating, changing, remembering, reviewing, or sharing data over time, even when the user never says "database", "save", or "persist". Infer the expected product behavior from the request instead of requiring an explicit storage requirement. This includes:
- habit, fitness, health, finance, mood, time, goal, and other trackers whose entries, completion state, progress, history, trends, reminders, or streaks must remain available;
- todo lists, calendars, journals, notes, bookmarks, dashboards with mutable records, inventories, accounts, authentication, user-generated content, uploads, saved preferences, commerce, or collaborative features;
- every form, including contact, lead, newsletter, waitlist, login, and signup forms, even when storage is not explicitly mentioned.

Ask this counterfactual: if all user-created or user-modified state disappeared on refresh or when the user returned tomorrow, would the requested product fail its normal purpose? If yes, set requiresPersistence=true. A product does not become static merely because the first screen could be rendered with sample data or temporary client state.

Set requiresPersistence=false for entirely static, read-only experiences such as a landing page, brochure site, or portfolio with no forms or editable/saved user data.

If an app-building request could reasonably involve users returning to continue prior work, review history, or see prior changes, set requiresPersistence=true. This is the product default for ambiguous stateful apps. Do not apply that default to non-app or off-topic requests.

Use the recent requests together: a later message can add persistence needs to an earlier static app. Keep the rationale short and concrete. Return at most four likely persisted entities; use an empty array when persistence is not needed.`;

export type PersistenceClassificationResult =
  | { outcome: "classified"; intent: DataPersistenceIntent }
  | { outcome: "fallback"; intent: DataPersistenceIntent; error: unknown };

export async function classifyPersistenceIntent({
  model,
  recentUserRequests,
  providerOptions,
  abortSignal,
  timeoutMs = 2_500,
}: {
  model: Parameters<typeof generateText>[0]["model"];
  recentUserRequests: string[];
  providerOptions?: Parameters<typeof generateText>[0]["providerOptions"];
  abortSignal?: AbortSignal;
  timeoutMs?: number;
}): Promise<PersistenceClassificationResult> {
  const requests = recentUserRequests
    .map((request) => request.trim())
    .filter(Boolean)
    .slice(-4);

  if (requests.length === 0) {
    return {
      outcome: "classified",
      intent: createPersistenceClassificationFallback(),
    };
  }

  try {
    const result = await generateText({
      model,
      providerOptions,
      abortSignal,
      timeout: { totalMs: timeoutMs },
      output: Output.object({ schema: persistenceJudgmentSchema }),
      system: PERSISTENCE_CLASSIFIER_SYSTEM_PROMPT,
      prompt: requests
        .map((request, index) => `REQUEST ${index + 1}:\n${request}`)
        .join("\n\n"),
    });

    return {
      outcome: "classified",
      intent: persistenceJudgmentToIntent(result.output),
    };
  } catch (error) {
    return {
      outcome: "fallback",
      intent: createPersistenceClassificationFallback(),
      error,
    };
  }
}
