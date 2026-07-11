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
      query: content,
    });
  });

  it.each([
    "Build an app with the current UFC rankings",
    "Show the actual UFC rankings and records",
    "Create a dashboard for live scores today",
  ])("requires research for volatile factual data: %s", (content) => {
    expect(detectResearchIntent([{ content }]).required).toBe(true);
  });

  it("does not search for ordinary product requests", () => {
    expect(
      detectResearchIntent([{ content: "Build a polished habit tracker" }]),
    ).toEqual({
      required: false,
      explicitlyRequested: false,
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
