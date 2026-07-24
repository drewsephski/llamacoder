import { afterEach, describe, expect, test, vi } from "vitest";

import {
  buildExaSearchConfig,
  createExaAgentTools,
  isExaConfigured,
} from "@/features/generation/server/exa-tools";

describe("exa agent tools", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("isExaConfigured detects trimmed API keys", () => {
    expect(isExaConfigured("")).toBe(false);
    expect(isExaConfigured("   ")).toBe(false);
    expect(isExaConfigured("exa-key")).toBe(true);
  });

  test("buildExaSearchConfig prefers highlights for general agent research", () => {
    expect(
      buildExaSearchConfig({
        apiKey: "test-exa-key",
        reason: "informational",
        freshness: "evergreen",
      }),
    ).toMatchObject({
      type: "auto",
      numResults: 6,
      contents: {
        text: false,
        highlights: true,
        livecrawl: "fallback",
      },
    });
  });

  test("buildExaSearchConfig uses fuller text for technical docs and fresh crawl for recent facts", () => {
    expect(
      buildExaSearchConfig({
        apiKey: "test-exa-key",
        reason: "technical-reference",
        freshness: "recent",
        researchWindow: {
          start: new Date("2026-01-11T00:00:00.000Z"),
          end: new Date("2026-07-11T00:00:00.000Z"),
          startIso: "2026-01-11T00:00:00.000Z",
          endIso: "2026-07-11T00:00:00.000Z",
          startDate: "2026-01-11",
          endDate: "2026-07-11",
        },
      }),
    ).toMatchObject({
      type: "auto",
      numResults: 8,
      startPublishedDate: "2026-01-11T00:00:00.000Z",
      endPublishedDate: "2026-07-11T00:00:00.000Z",
      contents: {
        text: { maxCharacters: 2_500, includeHtmlTags: false },
        livecrawl: "preferred",
      },
    });
  });

  test("web_search uses @exalabs/ai-sdk against the Exa search endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        results: [
          {
            url: "https://example.com/docs",
            title: "Example Docs",
            publishedDate: "2026-01-01T00:00:00.000Z",
            highlights: ["Official docs excerpt"],
          },
        ],
      }),
    );

    const tools = createExaAgentTools({
      apiKey: "test-exa-key",
      reason: "informational",
    });
    expect(tools).not.toBeNull();

    const result = await tools!.web_search.execute!(
      { query: "Example API documentation" },
      {} as never,
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.exa.ai/search",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-api-key": "test-exa-key",
          "x-exa-integration": "vercel-ai-sdk",
        }),
      }),
    );

    const request = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(request.body));
    expect(body).toMatchObject({
      query: "Example API documentation",
      type: "auto",
      numResults: 6,
      contents: {
        text: false,
        highlights: true,
        livecrawl: "fallback",
      },
    });
    expect(result).toEqual({
      results: [
        expect.objectContaining({
          url: "https://example.com/docs",
          title: "Example Docs",
        }),
      ],
    });
  });

  test("fetch_url reads page content through Exa contents", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        results: [
          {
            url: "https://example.com/page",
            title: "Example Page",
            text: "Page body",
          },
        ],
      }),
    );

    const tools = createExaAgentTools({
      apiKey: "test-exa-key",
      parsePublicUrl: async (url: string) => new URL(url),
    });

    const result = await tools!.fetch_url.execute!(
      {
        urls: ["https://example.com/page"],
        focusQuery: "pricing",
      },
      {} as never,
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.exa.ai/contents",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result).toEqual({
      pages: [
        {
          url: "https://example.com/page",
          title: "Example Page",
          publishedDate: null,
          text: "Page text:\nPage body",
        },
      ],
      rejectedUrls: [],
    });
  });
});
