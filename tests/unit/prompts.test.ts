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
    expect(prompt).toContain("Functional interaction contract (mandatory)");
    expect(prompt).toContain(
      "inventory every visible button, link, menu item, tab, form, row action, and toggle",
    );
    expect(prompt).toContain("Do not emit inert controls");
    expect(prompt).toContain("Shadcn `Dialog`");
    expect(prompt).toContain("Shadcn `Toaster`");
    expect(prompt).toContain("Theme behavior contract (mandatory");
    expect(prompt).toContain(
      'window.matchMedia("(prefers-color-scheme: dark)")',
    );
    expect(prompt).toContain(
      "toggle the `dark` class on `document.documentElement`",
    );
    expect(prompt).toContain("document.documentElement.style.colorScheme");
    expect(prompt).toContain('from "@/components/ui/dialog"');
    expect(prompt).toContain('from "@/components/ui/alert-dialog"');
    expect(prompt).toContain('from "@/components/ui/toaster"');
    expect(prompt).toContain('from "@/components/ui/use-toast"');
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
    expect(prompt).toContain("Explicit color fidelity contract (mandatory)");
    expect(prompt).toContain(
      "A color named by the user is a hard visual requirement",
    );
    expect(prompt).toContain("`purple` stays `purple`");
    expect(prompt).toContain("complete, literal, static Tailwind v3 utilities");
    expect(prompt).toContain("never use `bg-${color}-500`");
    expect(prompt).toContain(
      "Do not append competing utilities and rely on class order",
    );
    expect(prompt).toContain("Composed spatial rhythm");
    expect(prompt).toContain("Surface and voice restraint");
    expect(prompt).toContain("Distribution-default copy");
    expect(prompt).toContain("Unspecified-theme default (mandatory)");
    expect(prompt).toContain("light-first, Vercel-inspired Tailwind `neutral`");
    expect(prompt).toContain(
      "every portalled overlay surface must be explicitly light",
    );
    expect(prompt).toContain("`bg-white text-neutral-950 border-neutral-200`");
    expect(prompt).toContain("Do not default to `slate-*`, `purple-*`");
    expect(prompt).toContain(
      "Do not copy Vercel branding or force every product into a marketing-page structure",
    );
    expect(prompt).toContain(
      "does the app use the Vercel-inspired Tailwind neutral fallback",
    );
    expect(prompt).toContain("Visual system coherence contract (mandatory)");
    expect(prompt).toContain("Choose one luminosity model for the screen");
    expect(prompt).toContain(
      "Do not create visual drama by dropping a collection of near-black cards",
    );
    expect(prompt).toContain(
      "Never place `text-neutral-950`, `text-neutral-900`",
    );
    expect(prompt).toContain("uniform army of same-sized, same-colored cards");
    expect(prompt).toContain(
      "Reserve uppercase plus wide tracking for short tertiary labels only",
    );
    expect(prompt).toContain(
      "Explicitly style every chart title, value, axis label, tick, grid line, legend, tooltip",
    );
    expect(prompt).toContain("one coherent luminosity model");
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
    expect(softwareArchitectPrompt).toContain("Interaction inventory:");
    expect(softwareArchitectPrompt).toContain(
      "No planned control may be inert",
    );
    expect(softwareArchitectPrompt).toContain("Theme behavior:");
    expect(softwareArchitectPrompt).toContain(
      "persisted light/dark state initialized from the OS",
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
    expect(softwareArchitectPrompt).toContain("Unspecified-theme default:");
    expect(softwareArchitectPrompt).toContain(
      "plan a light-first Vercel-inspired Tailwind neutral system",
    );
    expect(softwareArchitectPrompt).toContain(
      "explicitly white overlay and form-control surfaces",
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
      "Unspecified-theme default (mandatory)",
    );
    expect(developerCodeGenPrompt).toContain(
      "light-first, Vercel-inspired Tailwind `neutral`",
    );
    expect(developerCodeGenPrompt).toContain(
      "every portalled overlay surface must be explicitly light",
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
  });
});
