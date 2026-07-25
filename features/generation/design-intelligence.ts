import dedent from "dedent";

/**
 * Programmatic distillation of Hallmark + design-taste-frontend skills.
 * Used by Squid prompts, screenshot clone analysis, and project memory.
 *
 * Source skills (not loaded at runtime):
 * - Hallmark: macrostructures, genres, themes, slop gates, pre-emit critique
 * - design-taste-frontend: dials, anti-slop tells, preflight matrix
 */

export const PRE_EMIT_CRITIQUE_AXES = [
  "philosophy",
  "hierarchy",
  "execution",
  "specificity",
  "restraint",
  "variety",
] as const;

export type PreEmitCritiqueAxis = (typeof PRE_EMIT_CRITIQUE_AXES)[number];

export const HALLMARK_GENRES = [
  "editorial",
  "modern-minimal",
  "atmospheric",
  "playful",
] as const;

export type HallmarkGenre = (typeof HALLMARK_GENRES)[number];

/** Named page shapes from Hallmark — pick one per build for structural variety. */
export const HALLMARK_MACROSTRUCTURES = [
  "Marquee Hero",
  "Bento Grid",
  "Workbench",
  "Long Document",
  "Stat-Led",
  "Quote-Led",
  "Manifesto",
  "Catalogue",
  "Letter",
  "Split Scroll",
  "Poster Stack",
  "Timeline",
  "Comparison Table",
  "Pricing Ledger",
  "FAQ Conversational",
  "Gallery Masonry",
  "Media Mask Hero",
  "Terminal Shell",
  "Side-Rail App",
  "Editorial Masthead",
  "Horizontal Pan",
] as const;

export type HallmarkMacrostructure = (typeof HALLMARK_MACROSTRUCTURES)[number];

export type DesignTasteDials = {
  designVariance: number;
  motionIntensity: number;
  visualDensity: number;
};

export const DEFAULT_DESIGN_TASTE_DIALS: DesignTasteDials = {
  designVariance: 8,
  motionIntensity: 6,
  visualDensity: 4,
};

/** Hard bans distilled from both skills — safe to inject in any codegen prompt. */
export const UNIVERSAL_ANTI_SLOP_RULES = [
  "No em-dash or en-dash separators in visible UI copy.",
  "No fabricated metrics, testimonials, customer logos, or awards.",
  "No div-based fake browser, phone, terminal, or IDE chrome.",
  "No AI-purple mesh hero, yellow/black hazard CTA combo, or Inter-only typography unless explicitly requested.",
  "No centered hero → three equal feature cards → CTA template when building original designs.",
  "Headings and display type stay roman — never italic headlines.",
  "At most one horizontal marquee per page.",
  "Duplicate CTA intent ban: one label per action across nav, hero, and footer.",
] as const;

/** Clone mode suspends variety rules that fight pixel fidelity. */
export const CLONE_MODE_SUSPENDED_RULES = [
  "Style Pack rotation and macrostructure diversification",
  "Structural diversity 'vary from last app' when it conflicts with the reference",
  "Premium-consumer palette rotation when the reference uses a different palette",
] as const;

export type DesignIntelligenceContext = {
  genre?: HallmarkGenre;
  macrostructure?: HallmarkMacrostructure;
  dials?: DesignTasteDials;
  mode: "original" | "screenshot-clone" | "screenshot-inspiration";
};

/**
 * Compact reference block for planning / agent prompts.
 * Full contracts live in design-prompt-contracts.ts and style-packs.ts.
 */
export function buildDesignIntelligenceReference(
  context: DesignIntelligenceContext,
): string {
  const dials = context.dials ?? DEFAULT_DESIGN_TASTE_DIALS;
  const modeLine =
    context.mode === "screenshot-clone"
      ? "Mode: screenshot-clone — fidelity to extracted DNA overrides Style Pack rotation and structural diversification."
      : context.mode === "screenshot-inspiration"
        ? "Mode: screenshot-inspiration — extract vibe and hierarchy; Style Pack may still apply for original composition."
        : "Mode: original — lock one Style Pack or explicit user direction; diversify macrostructure/nav/footer across session builds.";

  return dedent`
    **Design intelligence (Hallmark + design-taste distillation):**
    - ${modeLine}
    - Genre vocabulary: ${HALLMARK_GENRES.join(" · ")}.
    - Macrostructure vocabulary: ${HALLMARK_MACROSTRUCTURES.slice(0, 8).join(" · ")} … (${HALLMARK_MACROSTRUCTURES.length} total).
    - Taste dials (lock once): DESIGN_VARIANCE=${dials.designVariance}, MOTION_INTENSITY=${dials.motionIntensity}, VISUAL_DENSITY=${dials.visualDensity}.
    - Pre-emit critique axes (1–5 each, revise if <3): ${PRE_EMIT_CRITIQUE_AXES.join(", ")}.
    - Universal anti-slop: ${UNIVERSAL_ANTI_SLOP_RULES.slice(0, 4).join(" ")}
  `;
}
