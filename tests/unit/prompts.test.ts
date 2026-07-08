import { describe, expect, it } from "vitest";
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
    expect(prompt).toContain("mobile should reorganize around the core task");
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
  });

  it("keeps design direction and anti-generic review in the planning prompt", () => {
    expect(softwareArchitectPrompt).toContain(
      'include a concise "Design direction" section',
    );
    expect(softwareArchitectPrompt).toContain("Subject/audience/job");
    expect(softwareArchitectPrompt).toContain("Palette/type/layout/signature");
    expect(softwareArchitectPrompt).toContain("Anti-generic check");
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
  });
});
