import dedent from "dedent";
import { DEFAULT_MODEL, FREE_MODEL } from "@/lib/constants";
import {
  buildDesignIntelligenceReference,
  CLONE_MODE_SUSPENDED_RULES,
  UNIVERSAL_ANTI_SLOP_RULES,
} from "@/features/generation/design-intelligence";
import type {
  BillingBudgetMessage,
  MessageContent,
} from "@/features/generation/server/message-budget";
import { getMessageTextContent } from "@/features/generation/server/message-budget";

const INSPIRATION_ONLY_PATTERN =
  /\b(inspired by|similar vibe|like this but|don't copy|do not copy|not a pixel|reference only|use as inspiration|same energy|match the vibe)\b/i;

const CLONE_SIGNAL_PATTERN =
  /\b(clone|recreate|replicate|copy|match this|build this|build it like|same as|pixel.?perfect|from (this|the) (screenshot|image|design|site|page|url)|make (this|it) (look|work) like)\b/i;

export type ScreenshotCloneIntent = {
  mode: "clone" | "inspiration" | "none";
  /** True when fidelity mode should suspend Style Pack rotation. */
  fidelityLocked: boolean;
};

export function detectScreenshotCloneIntent(
  userPrompt: string,
  options: {
    hasScreenshot: boolean;
    websiteReferenceRequired?: boolean;
  },
): ScreenshotCloneIntent {
  if (!options.hasScreenshot) {
    return { mode: "none", fidelityLocked: false };
  }

  const objective = userPrompt.trim();

  if (INSPIRATION_ONLY_PATTERN.test(objective)) {
    return { mode: "inspiration", fidelityLocked: false };
  }

  if (
    options.websiteReferenceRequired ||
    CLONE_SIGNAL_PATTERN.test(objective) ||
    objective.length === 0
  ) {
    return { mode: "clone", fidelityLocked: true };
  }

  // Screenshot attached without explicit inspiration language → default to clone
  // (homepage "clone a site" flow and most upload-and-build expectations).
  return { mode: "clone", fidelityLocked: true };
}

/**
 * Hallmark `study` verb — image-mode DNA extraction schema for vision models.
 * Produces structured text the coding model can implement without seeing pixels.
 */
export const screenshotCloneVisionPrompt = dedent`
  You are a design analyst extracting implementation DNA from a website screenshot.
  A React developer will recreate this UI from your description alone — precision matters.

  Output using EXACTLY these markdown section headings (fill every section):

  ## Macrostructure
  Name the closest Hallmark macrostructure (e.g. Marquee Hero, Bento Grid, Workbench, Long Document, Stat-Led, Split Scroll, Gallery Masonry, Terminal Shell). Describe page shape in one sentence.

  ## Nav archetype
  Describe navigation placement, density, logo treatment, link count, primary CTA, mobile collapse hints.

  ## Footer archetype
  Describe footer shape (statement, utility bar, colophon, multi-column, or none).

  ## Color system
  List every major surface with Tailwind-friendly class targets: canvas, primary surfaces, inverse/focal regions, primary CTA, secondary controls, borders, muted text. Include approximate hex if clearly visible. Note light-first vs dark-first.

  ## Typography
  For display, body, and mono/data roles: approximate font category (geometric sans, grotesk, serif, mono, condensed), weights, sizes (text-sm through text-6xl scale), tracking, and casing patterns.

  ## Section inventory
  List sections top-to-bottom in DOM order. For each: layout (columns, grid spans, alignment), background, primary content, and spacing rhythm.

  ## Components and states
  Inventory buttons, inputs, cards, tabs, badges, charts, avatars, icons. Note visible hover/focus/active/disabled cues if inferable.

  ## Exact copy
  Verbatim text from the screenshot: headlines, subheads, nav labels, button labels, body snippets, legal/footer text. Do not paraphrase.

  ## Imagery and media
  Describe photos, illustrations, logos, video areas, placeholders. Do not invent URLs — describe placement and aspect ratio.

  ## Motion cues
  Note any visible animation hints (marquee, carousel, sticky regions, parallax) or state "static" if none.

  ## Responsive hints
  What likely changes at 320, 375, 414, and 768px (stack order, nav collapse, grid → single column).

  ## Fidelity priorities
  Rank top 5 elements that MUST match closely (layout grid, color pairs, type scale, nav structure, hero composition).

  Rules:
  - Think step-by-step; describe alignment, padding, margin, gap, border-radius, and shadows precisely.
  - Mention headers, footers, sidebars, and floating elements.
  - Do not suggest improvements or a different design — describe what IS visible.
  - Do not output code — only structured analysis.
`;

/** @deprecated Alias — use screenshotCloneVisionPrompt */
export const screenshotToCodePrompt = screenshotCloneVisionPrompt;

export function buildScreenshotCloneCodegenDirective(): string {
  return dedent`
    **Screenshot clone contract (FIDELITY MODE — overrides Style Pack rotation):**

    ${buildDesignIntelligenceReference({ mode: "screenshot-clone" })}

    The user attached a reference screenshot on their message (image part). Your job is to recreate it as closely as possible in React + Tailwind v3 — not to "improve" or re-theme it.

    ### Mandatory fidelity rules
    - The attached screenshot is the primary source of truth. Read layout, colors, typography, spacing, and verbatim copy directly from the image.
    - Any structured RECREATE / DNA text in the user message is a cross-check only — prefer the pixels when they disagree.
    - Use the **exact verbatim copy** from the analysis for all visible text (headlines, nav, buttons, labels).
    - Match described Tailwind color families and surface roles; do not substitute a Style Pack palette.
    - Preserve nav archetype, footer archetype, and macrostructure from the analysis unless physically impossible in the sandbox.
    - Reproduce spacing rhythm, grid spans, alignment, and border-radius character from the analysis.
    - Implement implied responsive behavior at 320, 375, 414, and 768px as described.
    - Add honest local interactivity (tabs, toggles, forms) where controls are visible — do not leave inert buttons.

    ### Suspended for this build (do not apply)
    ${CLONE_MODE_SUSPENDED_RULES.map((rule) => `- ${rule}`).join("\n")}

    ### Still mandatory
    ${UNIVERSAL_ANTI_SLOP_RULES.map((rule) => `- ${rule}`).join("\n")}
    - WCAG contrast: if the reference pair fails contrast, adjust shade within the same hue family — do not re-theme.
    - Stamp the root stylesheet comment: \`/* Hallmark · studied: yes · mode: screenshot-clone · fidelity: reference */\`

    ### Implementation stack
    - React + Tailwind v3 literal utilities (no arbitrary bracket values).
    - Lucide icons only when the reference shows icons; match approximate size and stroke weight.
    - Placeholder blocks for photos you cannot fetch: dashed border + neutral fill matching reference aspect ratio.
    - Do not wrap the UI in fake browser or device chrome — render the page content directly.
  `;
}

export function formatScreenshotCloneUserContext(analysisText: string): string {
  return dedent`

    RECREATE THIS UI AS CLOSELY AS POSSIBLE (screenshot fidelity mode):

    ${analysisText.trim()}

    Implementation reminder: match layout, colors, type scale, and exact copy above. Do not apply Style Pack rotation or a different macrostructure.
  `;
}

/** Best-effort parse of vision output for project memory / diversification logs. */
export function buildScreenshotDirectCodingUserText(
  userText: string,
  intent: ScreenshotCloneIntent,
): string {
  const trimmed = userText.trim();
  if (intent.fidelityLocked) {
    return dedent`
      The reference screenshot is attached to this message. Recreate that UI as closely as possible in React + Tailwind v3. Match layout grid, colors, typography scale, spacing rhythm, nav/footer structure, and every visible word of copy exactly.

      User request:
      ${trimmed || "Recreate the attached screenshot."}
    `;
  }

  return dedent`
    A reference screenshot is attached for visual hierarchy, color, and composition cues. Follow the user request below — compose originally unless they explicitly asked to clone or match the screenshot.

    User request:
    ${trimmed || "Build from the attached reference."}
  `;
}

/** Models known to be text-only for Squid codegen — route screenshot builds to a multimodal default. */
const TEXT_ONLY_CODING_MODELS = new Set<string>([
  FREE_MODEL,
  "deepseek/deepseek-v4-flash",
]);

export function resolveVisionCapableCodingModel(modelId: string): string {
  if (TEXT_ONLY_CODING_MODELS.has(modelId)) {
    return DEFAULT_MODEL;
  }
  return modelId;
}

export function buildScreenshotMultimodalUserContent(
  userText: string,
  screenshotData: string,
  intent: ScreenshotCloneIntent,
): MessageContent {
  return [
    {
      type: "text",
      text: buildScreenshotDirectCodingUserText(userText, intent),
    },
    { type: "image", image: screenshotData },
  ];
}

export function attachScreenshotToUserMessage(
  message: BillingBudgetMessage,
  screenshotData: string,
  intent: ScreenshotCloneIntent,
): BillingBudgetMessage {
  const userText = getMessageTextContent(message.content);
  return {
    role: "user",
    content: buildScreenshotMultimodalUserContent(
      userText,
      screenshotData,
      intent,
    ),
  };
}

export function parseScreenshotDesignDna(analysisText: string): {
  macrostructure?: string;
  nav?: string;
  footer?: string;
  theme: string;
} {
  const pick = (heading: string) => {
    const pattern = new RegExp(
      `## ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`,
      "i",
    );
    return analysisText.match(pattern)?.[1]?.trim().split("\n")[0]?.trim();
  };

  return {
    macrostructure: pick("Macrostructure"),
    nav: pick("Nav archetype"),
    footer: pick("Footer archetype"),
    theme: "studied-DNA (screenshot)",
  };
}
