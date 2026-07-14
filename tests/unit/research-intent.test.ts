import { describe, expect, it } from "vitest";

import {
  assessApiDocumentation,
  buildResearchQuery,
  detectResearchIntent,
  shouldAnswerWithoutCode,
} from "@/features/generation/research-intent";

describe("detectResearchIntent", () => {
  it("requires research of the exact API documentation link when no contract is provided", () => {
    const content =
      "Build a flight tracker using the API at https://developer.example.com/api/v3/docs";

    expect(assessApiDocumentation([{ content }])).toEqual({
      hasApiContext: true,
      hasCompleteEndpointContract: false,
      referencedUrls: ["https://developer.example.com/api/v3/docs"],
    });
    expect(detectResearchIntent([{ content }])).toMatchObject({
      required: true,
      freshness: "evergreen",
      reason: "technical-reference",
      query: expect.stringContaining(
        "https://developer.example.com/api/v3/docs",
      ),
    });
  });

  it("skips redundant research when the user provides endpoint URLs and their behavior", () => {
    const content = `Build a flight tracker with this complete API contract:
Base URL: https://api.example.com/v2
GET https://api.example.com/v2/flights?number={number} — returns the matching flight, status, and airports.
GET https://api.example.com/v2/airports/{code} — returns the airport name, city, and timezone.`;

    expect(assessApiDocumentation([{ content }])).toMatchObject({
      hasApiContext: true,
      hasCompleteEndpointContract: true,
    });
    expect(detectResearchIntent([{ content }])).toEqual({
      required: false,
      explicitlyRequested: false,
      freshness: "evergreen",
      reason: null,
      query: null,
    });
  });

  it("still searches a complete endpoint contract when the user explicitly asks", () => {
    const content = `Use web search to verify this API before building:
Base URL: https://api.example.com/v2
GET https://api.example.com/v2/flights — returns current flights.`;

    expect(detectResearchIntent([{ content }])).toMatchObject({
      required: true,
      explicitlyRequested: true,
      reason: "explicit",
    });
  });

  it("does not mistake an arbitrary webpage for API documentation", () => {
    const content = "Summarize https://example.com/company/about";

    expect(assessApiDocumentation([{ content }])).toMatchObject({
      hasApiContext: false,
      hasCompleteEndpointContract: false,
    });
    expect(buildResearchQuery(content)).toBe(
      "Summarize https://example.com/company/about",
    );
  });

  it.each([
    "Use web search to get the UFC rankings",
    "Retry this with web search: get the current official UFC pound-for-pound rankings",
    "Search the internet for the official UFC rankings",
    "Look the fighter records up before building this",
  ])("honors explicit research requests: %s", (content) => {
    expect(detectResearchIntent([{ content }])).toMatchObject({
      required: true,
      explicitlyRequested: true,
      freshness: expect.any(String),
      reason: "explicit",
      query: buildResearchQuery(content),
    });
  });

  it("reduces preview error output to the relevant diagnostic terms", () => {
    const content = `The code is not working. Can you fix it? Here's the error:

/components/HeroSection.tsx: Star is not defined (116:17)
  113 | </div>
  114 | <div className="hidden sm:flex items-center gap-1">
  115 | {[1, 2, 3, 4, 5].map((i) => (
> 116 | <Star key={i} className="w-4 h-4" />
      |  ^`;

    expect(buildResearchQuery(content)).toBe(
      "React TypeScript Star is not defined missing import",
    );
  });

  it("uses only the diagnostic line for unfamiliar preview errors", () => {
    const content = `The code is not working. Here's the error:

/components/Card.tsx: Unsupported widget configuration (42:9)
  41 | return (
> 42 |   <Widget secret="do-not-search-source-code" />`;

    expect(buildResearchQuery(content)).toBe(
      "React TypeScript Unsupported widget configuration",
    );
  });

  it("removes generic search instructions and bounds long queries", () => {
    const query = buildResearchQuery(
      `Use web search to get ${"current official lightweight rankings ".repeat(20)}`,
    );

    expect(query).toMatch(/^current official lightweight rankings/);
    expect(query.length).toBeLessThanOrEqual(240);
    expect(query.split(" ").length).toBeLessThanOrEqual(32);
  });

  it.each([
    "Build an app with the current UFC rankings",
    "Show the actual UFC rankings and records",
    "Create a dashboard for live scores today",
  ])("requires recent research for volatile factual data: %s", (content) => {
    expect(detectResearchIntent([{ content }])).toMatchObject({
      required: true,
      freshness: "recent",
    });
  });

  it.each([
    ["Follow Vercel AI SDK tool-calling best practices", "technical-reference"],
    ["Compare Stripe Checkout versus Elements for this app", "recommendation"],
    ["Verify this claim and cite the sources", "verification"],
    ["Summarize https://ai-sdk.dev/docs", "technical-reference"],
  ] as const)(
    "uses evergreen research when external verification is necessary: %s",
    (content, reason) => {
      expect(detectResearchIntent([{ content }])).toMatchObject({
        required: true,
        freshness: "evergreen",
        reason,
      });
    },
  );

  it.each([
    "Build a polished habit tracker app",
    "What is the OAuth authorization code flow?",
    "Explain React server components",
    "Design the best layout for this dashboard",
    "Make the primary button blue",
    "Fix the TypeError using the code already in this chat",
    "Use a warmer, more playful visual style",
  ])("skips search for fully local or subjective work: %s", (content) => {
    expect(detectResearchIntent([{ content }])).toEqual({
      required: false,
      explicitlyRequested: false,
      freshness: "evergreen",
      reason: null,
      query: null,
    });
  });

  it("uses the most recent research-worthy request as the query", () => {
    expect(
      detectResearchIntent([
        { content: "Use web search for old rankings" },
        { content: "Now use web search for the current lightweight rankings" },
      ]).query,
    ).toBe("Now the current lightweight rankings");
  });

  it.each([
    "Use web search for the latest UFC results and do not modify this app",
    "Summarize the latest official release without code changes",
    "Why is the current implementation slow?",
    "Explain how this component works",
  ])("keeps informational chat turns read-only: %s", (content) => {
    expect(shouldAnswerWithoutCode(content)).toBe(true);
  });

  it.each([
    "Build an app with the latest UFC rankings",
    "Use web search and update the dashboard with current prices",
    "Add a search bar to this app",
  ])("preserves concrete code-change requests: %s", (content) => {
    expect(shouldAnswerWithoutCode(content)).toBe(false);
  });
});
