import { describe, expect, it } from "vitest";

import {
  detectResearchIntent,
  shouldAnswerWithoutCode,
} from "@/features/generation/research-intent";

describe("detectResearchIntent", () => {
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
      query: content,
    });
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
    ["What is the OAuth authorization code flow?", "external-facts"],
    ["Build a polished habit tracker app", "new-build"],
  ] as const)(
    "uses evergreen research when external context can improve the output: %s",
    (content, reason) => {
      expect(detectResearchIntent([{ content }])).toMatchObject({
        required: true,
        freshness: "evergreen",
        reason,
      });
    },
  );

  it.each([
    "Make the primary button blue",
    "Fix the TypeError using the code already in this chat",
    "Use a warmer, more playful visual style",
  ])("skips search for fully local or subjective work: %s", (content) => {
    expect(
      detectResearchIntent([{ content }]),
    ).toEqual({
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
    ).toBe("Now use web search for the current lightweight rankings");
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
