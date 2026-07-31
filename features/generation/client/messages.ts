"use client";

import { createUserMessageResponseSchema } from "@/features/generation/contracts";
import { fetchJson } from "@/features/shared/client/http";

export async function createUserMessage(projectId: string, text: string) {
  return fetchJson(
    `/api/projects/${encodeURIComponent(projectId)}/messages`,
    createUserMessageResponseSchema,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    },
  );
}
