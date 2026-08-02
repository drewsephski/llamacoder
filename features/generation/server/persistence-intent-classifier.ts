import "server-only";

import { generateText, Output, type LanguageModelUsage } from "ai";

import {
  createPersistenceClassificationFallback,
  persistenceJudgmentSchema,
  persistenceJudgmentToIntent,
} from "@/features/generation/persistence-intent";
import type { DataPersistenceIntent } from "@/features/generation/app-spec";

const PERSISTENCE_CLASSIFIER_SYSTEM_PROMPT = `You are the persistence architect for an AI app builder. Classify the cumulative product request, including short follow-up edits to an app that already exists.

Return only the requested structured result. Judge the product semantically, not by matching words.

Set isAppRequest=true when the conversation asks to build or modify a product, including follow-ups such as "add Supabase", "make it shared", or "save this for each user". Set isAppRequest=false and requiresPersistence=false only for non-app, conversational, or off-topic requests.
Set requiresPersistence=true when the product's useful behavior depends on creating, changing, remembering, reviewing, or sharing data over time, even when the user never says "database", "save", or "persist". Infer the expected product behavior from the request instead of requiring an explicit storage requirement. This includes:
- habit, fitness, health, finance, mood, time, goal, and other trackers whose entries, completion state, progress, history, trends, reminders, or streaks must remain available;
- todo lists, calendars, journals, notes, bookmarks, dashboards with mutable records, inventories, accounts, authentication, user-generated content, uploads, saved preferences, commerce, or collaborative features;
- every form, including contact, lead, newsletter, waitlist, login, and signup forms, even when storage is not explicitly mentioned.

Ask this counterfactual: if all user-created or user-modified state disappeared on refresh or when the user returned tomorrow, would the requested product fail its normal purpose? If yes, set requiresPersistence=true. A product does not become static merely because the first screen could be rendered with sample data or temporary client state.

Set requiresPersistence=false for entirely static, read-only experiences such as a landing page, brochure site, or portfolio with no forms or editable/saved user data.

If an app-building request could reasonably involve users returning to continue prior work, review history, or see prior changes, set requiresPersistence=true. This is the product default for ambiguous stateful apps. Do not apply that default to non-app or off-topic requests.

Treat an explicit request for a backend, database, Supabase, durable storage, accounts, or a full-stack implementation as requiresPersistence=true and explicitlyRequested=true. Never interpret a short follow-up such as "add supabase" as a static or non-app request when earlier messages describe the app.

Set requirements.authentication for per-user/private data or sign-in, requirements.storage for user-managed files or media, requirements.realtime for collaboration/presence/live subscriptions, and requirements.privilegedServerLogic for webhooks, secrets, admin-only operations, scheduled jobs, or other work that cannot safely run in a browser. Database persistence alone does not imply all four capabilities.

Use the recent requests together: a later message can add persistence needs to an earlier static app or override an earlier UI-only decision. Keep the rationale short and concrete. Return at most four normalized entities, with the smallest useful field and relationship set for a real schema. Use field descriptions such as "title: text" or "completed_at: timestamp". Use an empty entity array only when persistence is not needed.`;

export type PersistenceClassificationResult =
  | {
      outcome: "classified";
      intent: DataPersistenceIntent;
      telemetry?: {
        usage: LanguageModelUsage;
        finishReason: string;
        providerMetadata?: unknown;
        providerMetadataByStep: readonly unknown[];
        providerRequestId?: string;
        provider?: string;
      };
    }
  | { outcome: "fallback"; intent: DataPersistenceIntent; error: unknown };

export async function classifyPersistenceIntent({
  model,
  recentUserRequests,
  providerOptions,
  abortSignal,
  timeoutMs = 8_000,
  maxAttempts = 2,
  maxOutputTokens = 720,
  existingAppContext,
}: {
  model: Parameters<typeof generateText>[0]["model"];
  recentUserRequests: string[];
  providerOptions?: Parameters<typeof generateText>[0]["providerOptions"];
  abortSignal?: AbortSignal;
  timeoutMs?: number;
  maxAttempts?: number;
  maxOutputTokens?: number;
  existingAppContext?: string;
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

  const prompt = [
    existingAppContext?.trim()
      ? `EXISTING APP CONTEXT:\n${existingAppContext.trim()}`
      : null,
    requests
      .map((request, index) => `USER REQUEST ${index + 1}:\n${request}`)
      .join("\n\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
  let lastError: unknown;

  for (let attempt = 1; attempt <= Math.max(1, maxAttempts); attempt += 1) {
    try {
      const result = await generateText({
        model,
        providerOptions,
        abortSignal,
        timeout: { totalMs: timeoutMs },
        maxOutputTokens,
        maxRetries: 1,
        output: Output.object({ schema: persistenceJudgmentSchema }),
        system: PERSISTENCE_CLASSIFIER_SYSTEM_PROMPT,
        prompt,
      });

      return {
        outcome: "classified",
        intent: persistenceJudgmentToIntent(result.output),
        telemetry: {
          usage: result.totalUsage ?? result.usage,
          finishReason: result.finishReason,
          providerMetadata: result.providerMetadata,
          providerMetadataByStep: (result.steps ?? []).map(
            (step) => step.providerMetadata,
          ),
          providerRequestId: result.response?.id,
          provider: result.steps?.at(-1)?.model.provider,
        },
      };
    } catch (error) {
      lastError = error;
      if (abortSignal?.aborted) break;
    }
  }

  return {
    outcome: "fallback",
    intent: createPersistenceClassificationFallback({
      reviewRecommended: true,
    }),
    error: lastError,
  };
}
