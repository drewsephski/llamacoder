import "server-only";

import { webSearch, type ExaSearchConfig } from "@exalabs/ai-sdk";
import { tool } from "ai";
import { z } from "zod";

import type { ResearchReason } from "@/features/generation/research-intent";
import type { ResearchWindow } from "@/features/generation/research-policy";
import { parsePublicHttpUrl } from "@/features/security/server/public-url";
import {
  loadChatUrlContent,
  MAX_CHAT_URLS,
} from "@/features/generation/server/chat-url-content";

export type CreateExaAgentToolsOptions = {
  apiKey?: string;
  researchWindow?: ResearchWindow | null;
  reason?: ResearchReason | null;
  freshness?: "recent" | "evergreen";
  parsePublicUrl?: typeof parsePublicHttpUrl;
};

export function isExaConfigured(apiKey = process.env.EXA_API_KEY) {
  return Boolean(apiKey?.trim());
}

/**
 * Builds Exa search config for in-generation tool use.
 * Follows Exa agent guidance: prefer highlights for multi-step agents,
 * reserve fuller text for documentation-heavy technical research, and
 * tighten livecrawl only when freshness matters.
 */
export function buildExaSearchConfig(
  options: CreateExaAgentToolsOptions = {},
): ExaSearchConfig {
  const apiKey = options.apiKey ?? process.env.EXA_API_KEY;
  const researchWindow = options.researchWindow ?? null;
  const freshness =
    options.freshness ?? (researchWindow ? "recent" : "evergreen");
  const reason = options.reason ?? null;
  const recent = freshness === "recent" || researchWindow !== null;
  const technical = reason === "technical-reference";

  return {
    ...(apiKey?.trim() ? { apiKey: apiKey.trim() } : {}),
    type: "auto",
    numResults: technical ? 8 : 6,
    userLocation: "US",
    ...(researchWindow
      ? {
          startPublishedDate: researchWindow.startIso,
          endPublishedDate: researchWindow.endIso,
        }
      : {}),
    contents: technical
      ? {
          // Docs/API work needs broader page context than highlight snippets.
          text: { maxCharacters: 2_500, includeHtmlTags: false },
          livecrawl: recent ? "preferred" : "fallback",
          livecrawlTimeout: 10_000,
        }
      : {
          // Exa agent pattern: highlights keep tool-result tokens small.
          text: false,
          highlights: true,
          livecrawl: recent ? "preferred" : "fallback",
          livecrawlTimeout: 10_000,
        },
  };
}

export function createExaAgentTools(options: CreateExaAgentToolsOptions = {}) {
  const apiKey = options.apiKey ?? process.env.EXA_API_KEY;
  if (!apiKey?.trim()) return null;

  const parsePublicUrl = options.parsePublicUrl ?? parsePublicHttpUrl;
  const searchConfig = buildExaSearchConfig({
    ...options,
    apiKey,
  });

  return {
    // Keep snake_case tool names for stable prompts/tests; AI SDK uses object keys.
    web_search: webSearch(searchConfig),
    fetch_url: tool({
      description: `Fetch and read the main text from one or more public HTTP(S) URLs with Exa Contents. Use when the user names a link, when a specific page must be verified, or when search returned a URL that needs full-page context. Maximum ${MAX_CHAT_URLS} URLs per call. Prefer this over web_search when the exact URL is already known.`,
      inputSchema: z.object({
        urls: z
          .array(z.string().url())
          .min(1)
          .max(MAX_CHAT_URLS)
          .describe("Public HTTP(S) URLs to fetch"),
        focusQuery: z
          .string()
          .max(500)
          .optional()
          .describe(
            "Optional focus query for highlighted excerpts from the page",
          ),
      }),
      execute: async ({ urls, focusQuery }) => {
        const content = await loadChatUrlContent({
          urls,
          query: focusQuery,
          apiKey,
          parsePublicUrl,
        });

        if (!content.configured) {
          return {
            error: "Exa is not configured",
            pages: [],
            rejectedUrls: [],
          };
        }

        return {
          pages: content.pages.map((page) => ({
            url: page.url,
            title: page.title,
            publishedDate: page.publishedDate,
            text: page.text,
          })),
          rejectedUrls: content.rejectedUrls,
        };
      },
    }),
  };
}
