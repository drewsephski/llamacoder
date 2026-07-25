import { describe, expect, it } from "vitest";
import {
  attachScreenshotToUserMessage,
  buildScreenshotMultimodalUserContent,
  detectScreenshotCloneIntent,
  formatScreenshotCloneUserContext,
  parseScreenshotDesignDna,
  resolveVisionCapableCodingModel,
  screenshotCloneVisionPrompt,
} from "@/features/generation/screenshot-clone";
import { DEFAULT_MODEL, FREE_MODEL } from "@/lib/constants";

describe("screenshot clone intent", () => {
  it("defaults to clone mode when a screenshot is attached", () => {
    expect(
      detectScreenshotCloneIntent("build a dashboard", {
        hasScreenshot: true,
      }),
    ).toEqual({ mode: "clone", fidelityLocked: true });
  });

  it("respects inspiration-only language", () => {
    expect(
      detectScreenshotCloneIntent(
        "inspired by this screenshot but don't copy",
        {
          hasScreenshot: true,
        },
      ),
    ).toEqual({ mode: "inspiration", fidelityLocked: false });
  });

  it("locks fidelity for website reference + screenshot", () => {
    expect(
      detectScreenshotCloneIntent("clone https://example.com", {
        hasScreenshot: true,
        websiteReferenceRequired: true,
      }),
    ).toEqual({ mode: "clone", fidelityLocked: true });
  });

  it("returns none without a screenshot", () => {
    expect(
      detectScreenshotCloneIntent("clone this site", { hasScreenshot: false }),
    ).toEqual({ mode: "none", fidelityLocked: false });
  });
});

describe("screenshot design DNA", () => {
  it("uses Hallmark study section headings in the vision prompt", () => {
    expect(screenshotCloneVisionPrompt).toContain("## Macrostructure");
    expect(screenshotCloneVisionPrompt).toContain("## Exact copy");
    expect(screenshotCloneVisionPrompt).toContain("## Fidelity priorities");
  });

  it("parses macrostructure and chrome from analysis text", () => {
    const analysis = `
## Macrostructure
Bento Grid — dense product modules on a light canvas.

## Nav archetype
Floating pill with logo left, three links, primary CTA right.

## Footer archetype
Compact utility bar with copyright only.
`;

    expect(parseScreenshotDesignDna(analysis)).toMatchObject({
      macrostructure: "Bento Grid — dense product modules on a light canvas.",
      nav: "Floating pill with logo left, three links, primary CTA right.",
      footer: "Compact utility bar with copyright only.",
      theme: "studied-DNA (screenshot)",
    });
  });

  it("wraps analysis for fidelity codegen context", () => {
    const wrapped = formatScreenshotCloneUserContext(
      "## Macrostructure\nMarquee Hero",
    );
    expect(wrapped).toContain("RECREATE THIS UI AS CLOSELY AS POSSIBLE");
    expect(wrapped).toContain("Marquee Hero");
  });

  it("builds multimodal user content with text + image parts", () => {
    const screenshot = "data:image/png;base64,abc";
    const content = buildScreenshotMultimodalUserContent(
      "Clone this landing page",
      screenshot,
      { mode: "clone", fidelityLocked: true },
    );
    expect(content).toEqual([
      expect.objectContaining({
        type: "text",
        text: expect.stringContaining("Clone this landing page"),
      }),
      { type: "image", image: screenshot },
    ]);
  });

  it("routes text-only models to a multimodal default for screenshots", () => {
    expect(resolveVisionCapableCodingModel(FREE_MODEL)).toBe(DEFAULT_MODEL);
    expect(resolveVisionCapableCodingModel("anthropic/claude-sonnet-5")).toBe(
      "anthropic/claude-sonnet-5",
    );
  });

  it("attaches screenshot to the last user message", () => {
    const screenshot = "data:image/png;base64,abc";
    const attached = attachScreenshotToUserMessage(
      { role: "user", content: "Build this" },
      screenshot,
      { mode: "clone", fidelityLocked: true },
    );
    expect(attached.role).toBe("user");
    expect(attached.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "image", image: screenshot }),
      ]),
    );
  });
});
