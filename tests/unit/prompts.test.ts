import { describe, expect, it } from "vitest";
import { developerCodeGenPrompt } from "@/features/generation/agent-prompts";
import { getMainCodingPrompt, softwareArchitectPrompt } from "@/lib/prompts";

describe("prompt design guidance", () => {
  it("keeps one concise, production-safe coding contract", () => {
    const prompt = getMainCodingPrompt({
      userPrompt: "Build a premium habit tracker",
    });

    expect(prompt).toContain("latest explicit user instruction");
    expect(prompt).toContain("## Execution contract");
    expect(prompt).toContain("Every import must resolve");
    expect(prompt).toContain("standard Tailwind v3 utilities only");
    expect(prompt).toContain("Every visible control must have a real handler");
    expect(prompt).toContain("Build the requested product surface first");
    expect(prompt).toContain("Choose structure before styling");
    expect(prompt).toContain("Do not force an effect");
    expect(prompt).toContain("Never fabricate metrics");
    expect(prompt).toContain("320, 375, 414, and 768px");
    expect(prompt).toContain(
      "Philosophy, Hierarchy, Execution, Specificity, Restraint, and Variety",
    );
    expect(prompt).toContain("a bare API name/link is not a contract");
    expect(prompt).toContain("Never replace selected API data");
    expect(prompt).toContain('from "sonner"');
    expect(prompt).toContain("@/lib/supabase");
    expect(prompt).toContain("## Output contract");

    expect(prompt).not.toContain("Premium UI/UX execution contract");
    expect(prompt).not.toContain("27. Did you implement");
    expect(prompt).not.toContain("Vary border-radius");
    expect(prompt.length).toBeLessThan(35_000);
  });

  it("keeps design guidance contextual instead of forcing decoration", () => {
    const prompt = getMainCodingPrompt({
      userPrompt: "Build a focused project settings tool",
    });

    expect(prompt).toContain(
      "A product surface, focused utility, or strong typographic opening",
    );
    expect(prompt).toContain(
      "Signature is optional when the product surface or typography is already distinctive",
    );
    expect(prompt).toContain("never force a bento, hero, media effect");
    expect(prompt).toContain("one luminosity model");
    expect(prompt).toContain("Headings stay roman");
    expect(prompt).toContain("centered hero -> three equal cards -> CTA");
  });

  it("keeps design direction and anti-generic review in the planning prompt", () => {
    expect(softwareArchitectPrompt).toContain(
      'include a concise "Design direction" section',
    );
    expect(softwareArchitectPrompt).toContain("Design Read:");
    expect(softwareArchitectPrompt).toContain("Taste dials:");
    expect(softwareArchitectPrompt).toContain("DESIGN_VARIANCE");
    expect(softwareArchitectPrompt).toContain("Subject/audience/job");
    expect(softwareArchitectPrompt).toContain("Structural archetype");
    expect(softwareArchitectPrompt).toContain("Palette/type/signature");
    expect(softwareArchitectPrompt).toContain("Anti-generic check");
    expect(softwareArchitectPrompt).toContain("Content integrity");
    expect(softwareArchitectPrompt).toContain("Product states");
    expect(softwareArchitectPrompt).toContain("Interaction inventory:");
    expect(softwareArchitectPrompt).toContain(
      "No planned control may be inert",
    );
    expect(softwareArchitectPrompt).toContain("Theme behavior:");
    expect(softwareArchitectPrompt).toContain(
      "one shared light/dark state owner initialized from localStorage with an OS fallback",
    );
    expect(softwareArchitectPrompt).toContain(
      "toggle the dark class on document.documentElement",
    );
    expect(softwareArchitectPrompt).toContain("Responsive behavior");
    expect(softwareArchitectPrompt).toContain(
      "Treat premium as clarity, craft, and restraint",
    );
    expect(softwareArchitectPrompt).toContain("visual QA pass");
    expect(softwareArchitectPrompt).toContain(
      "centered hero → three equal feature cards → CTA",
    );
    expect(softwareArchitectPrompt).toContain(
      "Build the actual product surface first",
    );
    expect(softwareArchitectPrompt).toContain("Sandbox import contract:");
    expect(softwareArchitectPrompt).toContain(
      "Never use braces for a default-only component",
    );
    expect(softwareArchitectPrompt).toContain("Never import `LucideIcon`");
    expect(softwareArchitectPrompt).toContain("Never import `ArrowLeft`");
    expect(softwareArchitectPrompt).toContain(
      "Never import Heroicons-style names from Lucide",
    );
    expect(softwareArchitectPrompt).toContain(
      "when the user supplies a documentation link but not a complete endpoint contract",
    );
    expect(softwareArchitectPrompt).toContain(
      "use that contract directly without asking for redundant research",
    );
    expect(softwareArchitectPrompt).toContain("Contrast contract:");
    expect(softwareArchitectPrompt).toContain("Explicit color fidelity:");
    expect(softwareArchitectPrompt).toContain(
      "record the exact standard Tailwind family",
    );
    expect(softwareArchitectPrompt).toContain("Style Pack lock:");
    expect(softwareArchitectPrompt).toContain("Incomplete-theme Style Pack:");
    expect(softwareArchitectPrompt).toContain("cobaltMinimal");
    expect(softwareArchitectPrompt).toContain(
      "do not default to anonymous Vercel-gray SaaS",
    );
    expect(softwareArchitectPrompt).toContain("Premium composition:");
    expect(softwareArchitectPrompt).toContain(
      "mixed-cell Bento only for six or more dense comparable modules",
    );
    expect(softwareArchitectPrompt).toContain(
      "Normal, helper, and placeholder text must reach 4.5:1",
    );
    expect(softwareArchitectPrompt).toContain("Visual-system coherence:");
    expect(softwareArchitectPrompt).toContain(
      "allow at most one focal inverse region",
    );
  });

  it("keeps Hallmark-derived constraints in the plan-mode code generator", () => {
    expect(developerCodeGenPrompt).toContain(
      "Choose the structural archetype before styling",
    );
    expect(developerCodeGenPrompt).toContain(
      "Never fabricate metrics, testimonials, customer logos",
    );
    expect(developerCodeGenPrompt).toContain(
      "Do not draw fake browser, phone, terminal, code-window, or IDE chrome",
    );
    expect(developerCodeGenPrompt).toContain(
      "Philosophy, Hierarchy, Execution, Specificity, Restraint, and Variety",
    );
    expect(developerCodeGenPrompt).toContain(
      "call that API at runtime instead of web-searching for the same values",
    );
    expect(developerCodeGenPrompt).toContain(
      "Treat every surface and its foreground as an inseparable, explicit pair",
    );
    expect(developerCodeGenPrompt).toContain("Contrast may never fail");
    expect(developerCodeGenPrompt).toContain(
      "Pair semantic Tailwind roles directly",
    );
    expect(developerCodeGenPrompt).toContain(
      "Opacity, gradients, images, and translucent overlays",
    );
    expect(developerCodeGenPrompt).toContain(
      "Explicit color fidelity contract (mandatory)",
    );
    expect(developerCodeGenPrompt).toContain("`purple` stays `purple`");
    expect(developerCodeGenPrompt).toContain(
      "Avoid card-in-card nesting, emoji feature icons",
    );
    expect(developerCodeGenPrompt).toContain(
      "Runtime Style Pack policy (mandatory)",
    );
    expect(developerCodeGenPrompt).toContain(
      "server-resolved Style Pack as a visual implementation recipe",
    );
    expect(developerCodeGenPrompt).toContain(
      "mixed-cell bento only for dense comparable modules",
    );
    expect(developerCodeGenPrompt).toContain(
      "Never combine the user's canvas request with an accent copied from an incompatible pack",
    );
    expect(developerCodeGenPrompt).toContain(
      "Visual system coherence contract (mandatory)",
    );
    expect(developerCodeGenPrompt).toContain(
      "Data visualization inherits the screen's luminosity model",
    );
    expect(developerCodeGenPrompt).toContain(
      "Functional interaction contract (mandatory)",
    );
    expect(developerCodeGenPrompt).toContain("Do not emit inert controls");
    expect(developerCodeGenPrompt).toContain(
      "Theme behavior contract (mandatory",
    );
    expect(developerCodeGenPrompt).toContain(
      "document.documentElement.style.colorScheme",
    );
    expect(developerCodeGenPrompt).toContain(
      'document.documentElement.classList.toggle("dark", isDark)',
    );
    expect(developerCodeGenPrompt).toContain(
      "Bind every rendered theme button/switch directly to that shared `theme` state",
    );
    expect(developerCodeGenPrompt).toContain(
      "Design Taste contract (mandatory for distinctive UI)",
    );
    expect(developerCodeGenPrompt).toContain("DESIGN_VARIANCE");
    expect(developerCodeGenPrompt).toContain("Aesthetic modes");
    expect(developerCodeGenPrompt).toContain(
      "Premium composition contract (mandatory",
    );
    expect(developerCodeGenPrompt).toContain("hairline bento");
    expect(developerCodeGenPrompt).toContain(
      "server-resolved and authoritative",
    );
  });

  it("server-locks a Style Pack scaffold into the coding prompt for vague briefs", () => {
    const prompt = getMainCodingPrompt({
      userPrompt: "Build an API proxy dashboard for developers",
    });
    expect(prompt).toContain("LOCKED for this build");
    expect(prompt).toContain("Conditional composition reference");
    expect(prompt).toMatch(
      /STYLE_PACK: (cobaltMinimal|terminalPhosphor|midnightCool|manifestoGeometric|swissBrutal|newsprintEditorial)/,
    );
    expect(prompt).toContain("Visual signature");
    expect(prompt).toContain("One signature only");
  });

  it("keeps the starter AI landing prompt dark and free of the orange kinetic lock", () => {
    const prompt = getMainCodingPrompt({
      userPrompt:
        "Build a modern landing page for an AI startup with a bold hero section, an animated feature grid, a pricing table with three tiers, a testimonials carousel, and a waitlist signup form. Use smooth scroll animations and a sleek dark theme.",
    });

    expect(prompt).toContain("STYLE_PACK: midnightCool");
    expect(prompt).toContain("luminosity: dark-first");
    expect(prompt).not.toContain("STYLE_PACK: kineticAwwwards");
    expect(prompt).toContain("Media fidelity");
    expect(prompt).not.toContain("## Style Pack catalog");
    expect(prompt.length).toBeLessThan(110_000);
  });

  it("renders the latest effective brief ahead of inferred Style Pack defaults", async () => {
    const { createEmptyAppSpec } = await import(
      "@/features/generation/app-spec"
    );
    const { resolveEffectiveBrief } = await import(
      "@/features/generation/effective-brief"
    );
    const effectiveBrief = resolveEffectiveBrief({
      originalIntent: "Build a dark atmospheric AI music app",
      latestUserRequest: "Make it light and editorial",
      appSpec: createEmptyAppSpec(),
    });
    const prompt = getMainCodingPrompt({ effectiveBrief });

    expect(prompt).toContain("EFFECTIVE BRIEF (authoritative precedence)");
    expect(prompt).toContain("Make it light and editorial");
    expect(prompt).toContain("Style Pack is an implementation aid only");
    expect(prompt).not.toContain("LOCKED for this build");
  });

  it("uses the compressed coding prompt when conversation context is large", () => {
    const prompt = getMainCodingPrompt({
      userPrompt: "Build a dashboard",
      messageCount: 12,
      estimatedContextTokens: 0,
    });

    expect(prompt).toContain("Continuation mode:");
    expect(prompt).toContain("## Execution contract");
    expect(prompt).not.toContain("SquidAgent (Compressed Mode)");
  });

  it("switches to screenshot fidelity mode instead of Style Pack rotation", () => {
    const prompt = getMainCodingPrompt({
      userPrompt: "Recreate this landing page",
      screenshotCloneMode: true,
    });

    expect(prompt).toContain("Screenshot clone contract (FIDELITY MODE");
    expect(prompt).toContain("studied: yes");
    expect(prompt).not.toContain(
      "Active Style Pack directive (LOCKED for this build",
    );
  });
});
