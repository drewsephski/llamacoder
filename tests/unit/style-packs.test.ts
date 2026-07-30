import { describe, expect, it } from "vitest";
import {
  STYLE_PACK_IDS,
  STYLE_PACKS,
  buildActiveStylePackDirective,
  buildStylePackContract,
  formatStylePackPreflight,
  getStylePack,
  hasExplicitAestheticDirection,
  hashBriefSeed,
  inferSubjectBucket,
  inferRequestedLuminosity,
  selectStylePackId,
  stylePackContract,
  stylePackPlanningRule,
} from "@/features/generation/style-packs";
import { premiumCompositionContract } from "@/features/generation/premium-composition-contract";
import { parseEnhancedText } from "@/features/prompt-builder/hooks/use-prompt-builder";

describe("style pack router", () => {
  it("exposes all twelve packs with literal surface maps and scaffolds", () => {
    expect(STYLE_PACK_IDS).toHaveLength(12);
    for (const id of STYLE_PACK_IDS) {
      const pack = getStylePack(id);
      expect(pack.id).toBe(id);
      expect(pack.surfaceMap.canvas).toMatch(/^bg-/);
      expect(pack.surfaceMap.primary).toMatch(/bg-/);
      expect(pack.classCheatSheet.length).toBeGreaterThan(2);
      expect(pack.compositionScaffold.length).toBeGreaterThan(80);
      expect(pack.compositionScaffold).toMatch(/className=/);
      expect(pack.dials.variance).toBeGreaterThanOrEqual(1);
      expect(pack.dials.variance).toBeLessThanOrEqual(10);
      expect(pack.fontPairing.googleFontsUrl).toContain(
        pack.fontPairing.display.replaceAll(" ", "+"),
      );
      expect(pack.fontPairing.googleFontsUrl).toContain(
        pack.fontPairing.body.replaceAll(" ", "+"),
      );
      expect(pack.fontPairing.display).not.toBe("Fraunces");
    }
  });

  it("builds an active directive with a conditional composition reference", () => {
    const directive = buildActiveStylePackDirective(
      "Build an API proxy dashboard for developers",
    );
    expect(directive).toContain("LOCKED for this build");
    expect(directive).toContain("Full-style commitment");
    expect(directive).toContain("Conditional composition reference");
    expect(directive).toContain("never force a bento");
    expect(directive).toMatch(
      /STYLE_PACK: (cobaltMinimal|terminalPhosphor|midnightCool|manifestoGeometric|swissBrutal|newsprintEditorial)/,
    );
    expect(directive).toContain("font-display");
    expect(directive).toContain("Ready-to-use class recipes");
    expect(directive).toContain(
      "the pack supplies a visual language, not product content or page shape",
    );
    expect(directive).not.toContain("Reading this as: portfolio");
    expect(directive).not.toMatch(/className=/);
    expect(directive.length).toBeLessThan(5_000);

    const explicit = buildActiveStylePackDirective("make it purple brutalist");
    expect(explicit).toContain("explicit aesthetic");
    expect(explicit).not.toContain("LOCKED for this build");
  });

  it("defines premium composition craft rules", () => {
    expect(premiumCompositionContract).toContain("hairline bento");
    expect(premiumCompositionContract).toContain("six or more dense");
    expect(premiumCompositionContract).toContain("Motion is optional");
    expect(premiumCompositionContract).toContain("three equal");
  });

  it("detects explicit aesthetic direction and skips packs", () => {
    expect(hasExplicitAestheticDirection("build a todo app")).toBe(false);
    expect(hasExplicitAestheticDirection("make it purple")).toBe(true);
    expect(hasExplicitAestheticDirection("brutalist dashboard")).toBe(true);
    expect(hasExplicitAestheticDirection("dark mode AI chat")).toBe(true);
    expect(hasExplicitAestheticDirection("like Linear")).toBe(true);
    expect(selectStylePackId("make a purple analytics tool")).toBeNull();
  });

  it("treats luminosity as a constraint and chooses a compatible pack", () => {
    const prompt =
      "Build a modern landing page for an AI startup with a bold hero section, an animated feature grid, a pricing table with three tiers, a testimonials carousel, and a waitlist signup form. Use smooth scroll animations and a sleek dark theme.";

    expect(inferRequestedLuminosity(prompt)).toBe("dark-first");
    expect(selectStylePackId(prompt)).toBe("midnightCool");
    expect(getStylePack(selectStylePackId(prompt)!).luminosity).toBe(
      "dark-first",
    );
  });

  it("routes vague briefs into subject buckets", () => {
    expect(inferSubjectBucket("API docs explorer")).toBe("tools");
    expect(inferSubjectBucket("AI chatbot for writers")).toBe("aiCreative");
    expect(inferSubjectBucket("designer portfolio")).toBe("portfolioEditorial");
    expect(inferSubjectBucket("fleet telemetry ops console")).toBe(
      "industrialOps",
    );
    expect(inferSubjectBucket("SaaS landing page")).toBe("landingAgency");
    expect(inferSubjectBucket("wellness onboarding app")).toBe(
      "consumerFriendly",
    );
    expect(inferSubjectBucket("todo app")).toBe("tools");
  });

  it("picks a deterministic Style Pack for vague briefs", () => {
    const a = selectStylePackId("todo app for teams");
    const b = selectStylePackId("todo app for teams");
    expect(a).not.toBeNull();
    expect(a).toBe(b);
    expect(STYLE_PACK_IDS).toContain(a!);

    const ai = selectStylePackId("AI music generation studio");
    expect(ai).not.toBeNull();
    expect([
      "lumenAtmospheric",
      "midnightCool",
      "kineticAwwwards",
      "terminalPhosphor",
      "risoPoster",
    ]).toContain(ai!);
  });

  it("maps Hallmark theme names in briefs to packs", () => {
    expect(selectStylePackId("build a dashboard with Terminal theme")).toBe(
      "terminalPhosphor",
    );
    expect(selectStylePackId("Garden style landing page")).toBe(
      "gardenBotanical",
    );
  });

  it("varies seed when brief tokens change", () => {
    expect(hashBriefSeed("short")).not.toBe(
      hashBriefSeed("a much longer brief here"),
    );
  });

  it("formats STYLE_PACK preflight lines", () => {
    const pack = STYLE_PACKS.cobaltMinimal;
    const line = formatStylePackPreflight(pack);
    expect(line).toContain("STYLE_PACK: cobaltMinimal");
    expect(line).toContain("DIALS: 5/4/6");
    expect(line).toContain("SURFACE_MAP:");
    expect(line).toContain(pack.surfaceMap.canvas);
  });

  it("builds a contract that replaces anonymous Vercel-neutral SaaS", () => {
    const contract = buildStylePackContract();
    expect(contract).toBe(stylePackContract);
    expect(contract).toContain("Unspecified-theme Style Pack contract");
    expect(contract).toContain(
      "Do NOT default every vague brief to anonymous Vercel-gray SaaS",
    );
    expect(contract).toContain("cobaltMinimal");
    expect(contract).toContain("lumenAtmospheric");
    expect(contract).toContain("terminalPhosphor");
    expect(contract).toContain("gardenBotanical");
    expect(contract).toContain("midnightCool");
    expect(contract).toContain("Full-style commitment");
    expect(contract).toContain("yellow-400/500");
    expect(contract).toContain("editorialSpecimen");
    expect(contract).toContain("swissBrutal");
    expect(contract).toContain("kineticAwwwards");
    expect(contract).toContain("softStructural");
    expect(contract).toContain("STYLE_PACK: <id>");
    expect(stylePackPlanningRule).toContain("Style Pack");
    expect(contract).not.toContain(".hallmark");
    expect(stylePackPlanningRule).not.toContain(".hallmark");
    expect(contract).not.toContain(
      "Default to a light-first, Vercel-inspired Tailwind `neutral` system",
    );
  });
});

describe("parseEnhancedText", () => {
  it("splits the five canonical Prompt Builder sections into tabs", () => {
    const raw = `
1. **Enhanced Prompt**
Build a cobalt tools dashboard with STYLE_PACK: cobaltMinimal.

2. **Styling Breakdown**
STYLE_PACK: cobaltMinimal | DIALS: 5/3/6
Canvas: bg-neutral-50 text-neutral-950

3. **Component Architecture**
App.tsx, components/Toolbar.tsx

4. **Interaction Design**
Create opens Dialog; delete uses AlertDialog.

5. **Responsive Strategy**
Stack the workbench at 375px.
`;

    const parsed = parseEnhancedText(raw);
    expect(parsed.enhanced).toContain("cobalt tools dashboard");
    expect(parsed.styling).toContain("STYLE_PACK: cobaltMinimal");
    expect(parsed.components).toContain("Toolbar.tsx");
    expect(parsed.interactions).toContain("AlertDialog");
    expect(parsed.interactions).toContain("375px");
  });

  it("accepts Design Direction and Interaction Inventory aliases", () => {
    const raw = `
1. **Enhanced Prompt**
Portfolio site.

2. **Design Direction**
editorialSpecimen stone canvas

3. **Component Architecture**
Hero.tsx

4. **Interaction Inventory**
Nav links scroll to sections.
`;

    const parsed = parseEnhancedText(raw);
    expect(parsed.enhanced).toContain("Portfolio");
    expect(parsed.styling).toContain("editorialSpecimen");
    expect(parsed.components).toContain("Hero.tsx");
    expect(parsed.interactions).toContain("scroll");
  });
});
