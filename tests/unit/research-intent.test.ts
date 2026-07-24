import { describe, expect, it } from "vitest";

import {
  assessApiDocumentation,
  buildPortfolioResearchQuery,
  buildResearchQuery,
  detectCompanyLandingResearchIntent,
  detectGuidedTemplateResearchIntent,
  detectLiveApiDashboardResearchIntent,
  detectLocalBusinessResearchIntent,
  detectPortfolioResearchIntent,
  buildCompanyLandingResearchQuery,
  buildLiveApiDashboardResearchQuery,
  buildLocalBusinessResearchQuery,
  detectResearchIntent,
  detectWebsiteReferenceIntent,
  extractResearchObjective,
  resolveResearchReason,
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
    expect(detectResearchIntent([{ content }])).toMatchObject({
      candidate: true,
      reason: "informational",
    });
  });

  it("anchors website recreation research to the exact referenced host", () => {
    const content = "Build me a website like https://squidagent.app";

    expect(detectWebsiteReferenceIntent(content)).toEqual({
      required: true,
      url: "https://squidagent.app/",
      hostname: "squidagent.app",
    });
    expect(buildResearchQuery(content)).toBe(
      "https://squidagent.app/ homepage design layout typography colors sections interactions",
    );
    expect(detectResearchIntent([{ content }])).toMatchObject({
      candidate: false,
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
    "Can you look up the latest React 19 features?",
    "Search for official Stripe webhook documentation",
    "Find information about quantum computing on the internet",
  ])(
    "marks explicit web lookup requests as research candidates: %s",
    (content) => {
      expect(detectResearchIntent([{ content }])).toMatchObject({
        candidate: true,
        explicitlyRequested: true,
        freshness: expect.any(String),
        reason: "explicit",
        query: buildResearchQuery(content),
      });
    },
  );

  it("reduces preview error output to the relevant diagnostic terms", () => {
    const content = `The code is not working. Can you fix it? Here's the error:

/components/HeroSection.tsx: Star is not defined (116:17)
  113 | </div>
  114 | <div className="hidden sm:flex items-center gap-1">
  115 | {[1, 2, 3, 4, 5].map((i) => (
> 116 | <Star key={i} className="w-4 h-4" />
      |  ^`;

    expect(buildResearchQuery(content)).toBe(
      "React TypeScript Star is not defined missing import or name shadowing",
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
    expect(buildResearchQuery(content)).toBe(
      "make the buttons text always white",
    );
    expect(detectResearchIntent([{ content }])).toEqual({
      candidate: false,
      explicitlyRequested: false,
      freshness: "evergreen",
      reason: null,
      query: null,
    });
  });

  it("bounds long suggested research objectives after stripping meta instructions", () => {
    const query = buildResearchQuery(
      `Use web search to get ${"current official lightweight rankings ".repeat(20)}`,
    );

    expect(query).toContain("current official lightweight rankings");
    expect(query).not.toMatch(/use web search/i);
    expect(query.length).toBeLessThanOrEqual(240);
    expect(query.split(" ").length).toBeLessThanOrEqual(32);
  });

  it("distills chat meta into a semantic Exa search objective", () => {
    expect(buildResearchQuery("Build me a polished analytics dashboard")).toBe(
      "Build me a polished analytics dashboard",
    );
    expect(
      buildResearchQuery("Can you look up the latest React 19 features?"),
    ).toBe("the latest React 19 features?");
    expect(buildResearchQuery("Use web search to get the UFC rankings")).toBe(
      "the UFC rankings",
    );
    expect(
      buildResearchQuery(
        "Find information about quantum computing on the internet",
      ),
    ).toBe("quantum computing");
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
    ["Follow Vercel AI SDK tool-calling best practices", "informational"],
    ["Compare Stripe Checkout versus Elements for this app", "informational"],
    ["Verify this claim and cite the sources", "explicit"],
    ["Summarize https://ai-sdk.dev/docs", "informational"],
    ["What is the OAuth authorization code flow?", "informational"],
    ["Explain React server components", "informational"],
  ] as const)(
    "offers research when external or informational answers may help: %s",
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
    ).toBe("the current lightweight rankings");
  });

  it("does not treat local code lookup as web research", () => {
    expect(
      detectResearchIntent([
        { content: "Look up the component definition in App.tsx" },
      ]),
    ).toEqual({
      candidate: false,
      explicitlyRequested: false,
      freshness: "evergreen",
      reason: null,
      query: null,
    });
  });

  it.each([
    "Use web search for the latest UFC results and do not modify this app",
    "Summarize the latest official release without code changes",
    "Why is the current implementation slow?",
    "Explain how this component works",
  ])("keeps informational chat turns read-only: %s", (content) => {
    expect(shouldAnswerWithoutCode(content)).toBe(true);
  });

  it("builds portfolio research queries from guided template prompts", () => {
    const content =
      "Build a distinctive personal portfolio website for Jane Doe, a Product Designer. Before generating any UI, research Jane Doe on the web and read their existing portfolio at https://janedoe.com using fetch_url.";

    expect(detectPortfolioResearchIntent(content)).toEqual({
      required: true,
      personName: "Jane Doe",
      portfolioUrl: "https://janedoe.com",
      linkedinUrl: null,
    });
    expect(buildPortfolioResearchQuery(content)).toBe(
      "Jane Doe professional portfolio projects experience bio skills https://janedoe.com",
    );
    expect(buildResearchQuery(content)).toBe(
      "Jane Doe professional portfolio projects experience bio skills https://janedoe.com",
    );
    expect(detectResearchIntent([{ content }])).toMatchObject({
      candidate: true,
      reason: "explicit",
    });
  });

  it("still researches portfolio builds even when a portfolio URL is present", () => {
    const content =
      "Build a portfolio website for Alex Kim at https://alexkim.dev with real projects from the web";

    expect(detectPortfolioResearchIntent(content).required).toBe(true);
    expect(detectResearchIntent([{ content }])).toMatchObject({
      candidate: true,
    });
  });

  it("builds company landing research queries from guided template prompts", () => {
    const content =
      "Build a product landing page for Acme's Acme Cloud. Before generating any UI, research Acme on the web and read their product site at https://acme.com using fetch_url. Also review competitor pages at https://competitor.com when available. Do not invent customers, metrics, awards, or capabilities.";

    expect(detectCompanyLandingResearchIntent(content)).toMatchObject({
      required: true,
      companyName: "Acme",
      productUrl: "https://acme.com",
      competitorUrl: "https://competitor.com",
    });
    expect(buildCompanyLandingResearchQuery(content)).toContain("Acme");
    expect(buildCompanyLandingResearchQuery(content)).toContain(
      "https://acme.com",
    );
    expect(detectGuidedTemplateResearchIntent(content)).toEqual({
      required: true,
      kind: "company-landing",
    });
    expect(detectResearchIntent([{ content }])).toMatchObject({
      candidate: true,
      reason: "explicit",
    });
  });

  it("does not force company landing research for ordinary marketing briefs", () => {
    const content = `Build a product landing page for Relay, a hosted webhook debugging tool for small engineering teams.

The first viewport should explain that Relay captures, inspects, replays, and shares webhook events.`;

    expect(detectCompanyLandingResearchIntent(content).required).toBe(false);
    expect(detectGuidedTemplateResearchIntent(content).required).toBe(false);
  });

  it("builds live API dashboard research queries from guided template prompts", () => {
    const content =
      "Build a live data dashboard called Orbit Monitor that displays current weather forecasts by city from a public API. Before generating any UI, research the official API documentation on the web and read the docs at https://docs.example.com/api using fetch_url. Do not invent endpoints or mock live data.";

    expect(detectLiveApiDashboardResearchIntent(content)).toMatchObject({
      required: true,
      appName: "Orbit Monitor",
      docsUrl: "https://docs.example.com/api",
    });
    expect(buildLiveApiDashboardResearchQuery(content)).toContain(
      "https://docs.example.com/api",
    );
    expect(detectGuidedTemplateResearchIntent(content)).toEqual({
      required: true,
      kind: "live-api-dashboard",
    });
  });

  it("builds local business research queries from guided template prompts", () => {
    const content =
      "Build a website for Rivera Kitchen, a neighborhood Mexican restaurant in Austin, TX. Before generating any UI, research Rivera Kitchen on the web and read their existing site at https://riverakitchen.com using fetch_url. Also review their listing page at https://maps.google.com/?cid=123 when available. Do not invent awards, prices, phone numbers, or testimonials.";

    expect(detectLocalBusinessResearchIntent(content)).toMatchObject({
      required: true,
      businessName: "Rivera Kitchen",
      city: "Austin, TX",
      websiteUrl: "https://riverakitchen.com",
      listingUrl: "https://maps.google.com/?cid=123",
    });
    expect(buildLocalBusinessResearchQuery(content)).toContain(
      "Rivera Kitchen",
    );
    expect(detectGuidedTemplateResearchIntent(content)).toEqual({
      required: true,
      kind: "local-business",
    });
  });
});

describe("resolveResearchReason", () => {
  const emptyResearchIntent = {
    candidate: false,
    explicitlyRequested: false,
    freshness: "evergreen" as const,
    reason: null,
    query: null,
  };

  it("preserves detectResearchIntent classifications", () => {
    expect(
      resolveResearchReason({
        researchIntent: {
          ...emptyResearchIntent,
          candidate: true,
          reason: "technical-reference",
        },
      }),
    ).toBe("technical-reference");
  });

  it("uses technical-reference for live API dashboard guided templates", () => {
    expect(
      resolveResearchReason({
        researchIntent: emptyResearchIntent,
        researchCandidate: true,
        liveApiDashboardResearchRequired: true,
      }),
    ).toBe("technical-reference");
  });

  it("uses external-facts for other guided template research gates", () => {
    expect(
      resolveResearchReason({
        researchIntent: emptyResearchIntent,
        researchCandidate: true,
        guidedTemplateResearchRequired: true,
      }),
    ).toBe("external-facts");
  });

  it("uses explicit when search was approved without intent classification", () => {
    expect(
      resolveResearchReason({
        researchIntent: emptyResearchIntent,
        searchApproved: true,
        researchCandidate: true,
      }),
    ).toBe("explicit");
  });

  it("never returns null when research is still a candidate", () => {
    expect(
      resolveResearchReason({
        researchIntent: emptyResearchIntent,
        researchCandidate: true,
      }),
    ).toBe("external-facts");
  });
});
