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
      "Tailwind `dark:` utilities activate only when an ancestor has the `dark` class",
    );
    expect(prompt).toContain(
      'document.documentElement.classList.toggle("dark", isDark)',
    );
    expect(prompt).toContain(
      'setTheme((current) => (current === "dark" ? "light" : "dark"))',
    );
    expect(prompt).toContain(
      "mentally click the control twice and verify dark -> light -> dark",
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
    expect(prompt).toContain("Hover styles must stay visually coherent");
    expect(prompt).toContain("components/ui/button.tsx");
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
    expect(prompt).toContain(
      "Unspecified-theme Style Pack contract (mandatory)",
    );
    expect(prompt).toContain(
      "Do NOT default every vague brief to anonymous Vercel-gray SaaS",
    );
    expect(prompt).toContain("STYLE_PACK: <id>");
    expect(prompt).toContain("cobaltMinimal");
    expect(prompt).toContain("lumenAtmospheric");
    expect(prompt).toContain("editorialSpecimen");
    expect(prompt).toContain("swissBrutal");
    expect(prompt).toContain("kineticAwwwards");
    expect(prompt).toContain("softStructural");
    expect(prompt).toContain("Still banned as lazy defaults across all packs");
    expect(prompt).toContain("Active Style Pack directive");
    expect(prompt).toContain("Premium composition contract (mandatory");
    expect(prompt).toContain("hairline bento");
    expect(prompt).toContain("three equal");
    expect(prompt).toContain("gap-px");
    expect(prompt).toContain("did you follow the Active Style Pack directive");
    expect(prompt).toContain("mixed-span hairline bento");
    expect(prompt).not.toContain(
      "does the app use the Vercel-inspired Tailwind neutral fallback",
    );
    expect(prompt).not.toContain(
      "Default to a light-first, Vercel-inspired Tailwind `neutral` system",
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
    expect(prompt).toContain(
      "Design Taste contract (mandatory for distinctive UI)",
    );
    expect(prompt).toContain("DESIGN_VARIANCE");
    expect(prompt).toContain("MOTION_INTENSITY");
    expect(prompt).toContain("VISUAL_DENSITY");
    expect(prompt).toContain("Reading this as:");
    expect(prompt).toContain("Em-dash and en-dash as separators are forbidden");
    expect(prompt).toContain("Aesthetic modes");
    expect(prompt).toContain("Swiss Industrial");
    expect(prompt).toContain("Tactical CRT");
    expect(prompt).toContain("Design Taste preflight");
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
    expect(softwareArchitectPrompt).toContain("Unspecified-theme Style Pack:");
    expect(softwareArchitectPrompt).toContain("cobaltMinimal");
    expect(softwareArchitectPrompt).toContain(
      "do not default to anonymous Vercel-gray SaaS",
    );
    expect(softwareArchitectPrompt).toContain("Premium composition:");
    expect(softwareArchitectPrompt).toContain("mixed-cell hairline bento");
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
      "Unspecified-theme Style Pack contract (mandatory)",
    );
    expect(developerCodeGenPrompt).toContain(
      "Do NOT default every vague brief to anonymous Vercel-gray SaaS",
    );
    expect(developerCodeGenPrompt).toContain("lock one Style Pack");
    expect(developerCodeGenPrompt).toContain("STYLE_PACK preflight");
    expect(developerCodeGenPrompt).toContain("cobaltMinimal");
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
    expect(developerCodeGenPrompt).toContain("composition scaffold");
  });

  it("server-locks a Style Pack scaffold into the coding prompt for vague briefs", () => {
    const prompt = getMainCodingPrompt({
      userPrompt: "Build an API proxy dashboard for developers",
    });
    expect(prompt).toContain("LOCKED for this build");
    expect(prompt).toContain("Locked composition scaffold");
    expect(prompt).toMatch(/STYLE_PACK: (cobaltMinimal|swissBrutal)/);
    expect(prompt).toContain("md:grid-cols-12");
    expect(prompt).toContain("gap-px");
  });
});
