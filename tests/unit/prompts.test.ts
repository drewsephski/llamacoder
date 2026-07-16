import { describe, expect, it } from "vitest";
import { developerCodeGenPrompt } from "@/features/generation/agent-prompts";
import { getMainCodingPrompt, softwareArchitectPrompt } from "@/lib/prompts";

describe("prompt design guidance", () => {
  it("keeps production UI/UX guardrails in the main coding prompt", () => {
    const prompt = getMainCodingPrompt();

    expect(prompt).toContain("Build the actual product surface first");
    expect(prompt).toContain("Ground the design in the subject");
    expect(prompt).toContain("Avoid AI-template aesthetics");
    expect(prompt).toContain(
      "Spend visual boldness in one justified signature element",
    );
    expect(prompt).toContain("Mobile should reorganize around the core task");
    expect(prompt).toContain("Premium UI/UX execution contract");
    expect(prompt).toContain("Hierarchy before decoration");
    expect(prompt).toContain("Believable product content");
    expect(prompt).toContain("Complete interaction design");
    expect(prompt).toContain("Responsive composition");
    expect(prompt).toContain("Structural variety");
    expect(prompt).toContain("Final design critique");
    expect(prompt).toContain("centered hero → three equal feature cards → CTA");
    expect(prompt).toContain("Never fabricate proof");
    expect(prompt).toContain("fake browser bars");
    expect(prompt).toContain("Headings and display type stay roman");
    expect(prompt).toContain("320, 375, 414, and 768px");
    expect(prompt).toContain(
      "Philosophy, Hierarchy, Execution, Specificity, Restraint, and Variety",
    );
    expect(prompt).toContain("Sandbox import contract:");
    expect(prompt).toContain("Never use braces for a default-only component");
    expect(prompt).toContain("Lucide React only supports these named exports");
    expect(prompt).toContain("Never import `LucideIcon`");
    expect(prompt).toContain("Never import `ArrowLeft`");
    expect(prompt).toContain("Calendar as CalendarIcon");
    expect(prompt).toContain("Do not import `CalendarIcon` directly");
    expect(prompt).toContain(
      "Every JSX component, icon, helper, hook, and constant",
    );
    expect(prompt).toContain("A bare API name or link is not a contract");
    expect(prompt).toContain(
      "must never fall back to mock, sample, placeholder",
    );
    expect(prompt).toContain(
      "Never replace the selected API with web-search results",
    );
    expect(prompt).toContain(
      "Treat each surface and foreground as one locked pair",
    );
    expect(prompt).toContain("Contrast may never fail");
    expect(prompt).toContain("at least 4.5:1 contrast");
    expect(prompt).toContain("component boundaries require at least 3:1");
    expect(prompt).toContain("run a private contrast audit");
  });

  it("keeps design direction and anti-generic review in the planning prompt", () => {
    expect(softwareArchitectPrompt).toContain(
      'include a concise "Design direction" section',
    );
    expect(softwareArchitectPrompt).toContain("Subject/audience/job");
    expect(softwareArchitectPrompt).toContain("Structural archetype");
    expect(softwareArchitectPrompt).toContain("Palette/type/signature");
    expect(softwareArchitectPrompt).toContain("Anti-generic check");
    expect(softwareArchitectPrompt).toContain("Content integrity");
    expect(softwareArchitectPrompt).toContain("Product states");
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
    expect(softwareArchitectPrompt).toContain(
      "Normal, helper, and placeholder text must reach 4.5:1",
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
  });
});
