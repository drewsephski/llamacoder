import { describe, expect, it } from "vitest";

import {
  assessApiDocumentation,
  buildResearchQuery,
  detectResearchIntent,
  detectWebsiteReferenceIntent,
  extractResearchObjective,
  shouldAnswerWithoutCode,
} from "@/features/generation/research-intent";

describe("detectResearchIntent", () => {
  it("offers research for an exact API documentation link when no contract is provided", () => {
    const content =
      "Build a flight tracker using the API at https://developer.example.com/api/v3/docs";

    expect(assessApiDocumentation([{ content }])).toEqual({
      hasApiContext: true,
      hasCompleteEndpointContract: false,
      referencedUrls: ["https://developer.example.com/api/v3/docs"],
    });
    expect(detectResearchIntent([{ content }])).toMatchObject({
      candidate: true,
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
      candidate: false,
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
      candidate: true,
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

  it("anchors website recreation research to the exact referenced host", () => {
    const content = "Build me a website like https://squidagent.app";

    expect(detectWebsiteReferenceIntent(content)).toEqual({
      required: true,
      url: "https://squidagent.app/",
      hostname: "squidagent.app",
    });
    expect(buildResearchQuery(content)).toBe(
      "site:squidagent.app https://squidagent.app/ homepage design layout typography colors sections interactions",
    );
    expect(detectResearchIntent([{ content }])).toMatchObject({
      candidate: true,
      reason: "external-facts",
      query: expect.stringMatching(/^site:squidagent\.app\b/),
    });
  });

  it("does not classify an API implementation URL as a visual website reference", () => {
    expect(
      detectWebsiteReferenceIntent(
        "Build an app using the API at https://developer.example.com/docs",
      ),
    ).toEqual({ required: false, url: null, hostname: null });
  });

  it.each([
    "Use web search to get the UFC rankings",
    "Retry this with web search: get the current official UFC pound-for-pound rankings",
    "Search the internet for the official UFC rankings",
    "Look the fighter records up before building this",
  ])("honors explicit research requests: %s", (content) => {
    expect(detectResearchIntent([{ content }])).toMatchObject({
      candidate: true,
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

  it("isolates a targeted edit instruction from DOM context and current source", () => {
    const content = `Edit the selected preview element in "Meridian".

User requested edit:
make the buttons text always white

Selected element context:
Tag: button
Path: div#root:nth-of-type(1) > main.min-h-screen > button
Classes: bg-black text-black
Text: Try the workspace demo

Current selected version files:
- App.tsx

Current source:
\`\`\`tsx{path=App.tsx}
const rankingsUrl = "https://api.example.com/current-rankings";
export default function App() { return <button>Latest results</button>; }
\`\`\``;

    expect(extractResearchObjective(content)).toBe(
      "make the buttons text always white",
    );
    expect(buildResearchQuery(content)).toBe("the buttons text always white");
    expect(detectResearchIntent([{ content }])).toEqual({
      candidate: false,
      explicitlyRequested: false,
      freshness: "evergreen",
      reason: null,
      query: null,
    });
  });

  it("removes generic search instructions and bounds long queries", () => {
    const query = buildResearchQuery(
      `Use web search to get ${"current official lightweight rankings ".repeat(20)}`,
    );

    expect(query).toMatch(/^current official lightweight rankings/);
    expect(query.length).toBeLessThanOrEqual(240);
    expect(query.split(" ").length).toBeLessThanOrEqual(32);
  });

  it("removes first-person build phrasing without leaving a malformed query", () => {
    expect(buildResearchQuery("Build me a polished analytics dashboard")).toBe(
      "polished analytics dashboard",
    );
  });

  it.each([
    "Build an app with the current UFC rankings",
    "Show the actual UFC rankings and records",
    "Create a dashboard for live scores today",
  ])("offers recent research for volatile factual data: %s", (content) => {
    expect(detectResearchIntent([{ content }])).toMatchObject({
      candidate: true,
      freshness: "recent",
    });
  });

  it.each([
    ["Follow Vercel AI SDK tool-calling best practices", "technical-reference"],
    ["Compare Stripe Checkout versus Elements for this app", "recommendation"],
    ["Verify this claim and cite the sources", "verification"],
    ["Summarize https://ai-sdk.dev/docs", "technical-reference"],
  ] as const)(
    "offers evergreen research when external verification may help: %s",
    (content, reason) => {
      expect(detectResearchIntent([{ content }])).toMatchObject({
        candidate: true,
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
    "Make every button label white",
    "Use white text with strong contrast",
    "Validate the form before submission",
    "Update the source code for the modal",
    "Fix the TypeError using the code already in this chat",
    "Use a warmer, more playful visual style",
  ])("skips search for fully local or subjective work: %s", (content) => {
    expect(detectResearchIntent([{ content }])).toEqual({
      candidate: false,
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
