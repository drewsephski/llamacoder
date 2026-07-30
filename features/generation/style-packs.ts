import dedent from "dedent";

/**
 * Subject-routed Style Packs for vague briefs.
 *
 * Distills Hallmark taste-skill principles into executable Tailwind v3 class
 * recipes (no arbitrary brackets). Each pack is a complete aesthetic world —
 * palette, type, radius, nav, footer, motion, and composition scaffold.
 * Explicit user aesthetic direction always wins.
 */

export const STYLE_PACK_IDS = [
  "cobaltMinimal",
  "lumenAtmospheric",
  "editorialSpecimen",
  "swissBrutal",
  "kineticAwwwards",
  "softStructural",
  "terminalPhosphor",
  "gardenBotanical",
  "midnightCool",
  "manifestoGeometric",
  "newsprintEditorial",
  "risoPoster",
] as const;

/** Palettes the model reaches for when no Style Pack is locked — hard-ban globally. */
export const GENERIC_AI_PALETTE_BANS = [
  "yellow-400/500 primary CTA on black or near-black canvas (the default AI hazard combo)",
  "amber-on-black as the only identity when the locked pack is not lumenAtmospheric",
  "Inter / system-ui / Roboto as the sole voice with no display pairing",
  "purple gradient mesh hero on white or neutral-950",
  "anonymous Vercel-gray neutral SaaS with no pack signature element",
] as const;

export type StylePackId = (typeof STYLE_PACK_IDS)[number];

const THEME_TO_PACK: Record<string, StylePackId> = {
  cobalt: "cobaltMinimal",
  cobaltminimal: "cobaltMinimal",
  lumen: "lumenAtmospheric",
  lumenatmospheric: "lumenAtmospheric",
  specimen: "editorialSpecimen",
  editorial: "editorialSpecimen",
  editorialspecimen: "editorialSpecimen",
  brutal: "swissBrutal",
  swissbrutal: "swissBrutal",
  carnival: "kineticAwwwards",
  kinetic: "kineticAwwwards",
  kineticawwwards: "kineticAwwwards",
  hum: "softStructural",
  softstructural: "softStructural",
  terminal: "terminalPhosphor",
  terminalphosphor: "terminalPhosphor",
  garden: "gardenBotanical",
  gardenbotanical: "gardenBotanical",
  midnight: "midnightCool",
  midnightcool: "midnightCool",
  aurora: "midnightCool",
  manifesto: "manifestoGeometric",
  manifestogeometric: "manifestoGeometric",
  atelier: "editorialSpecimen",
  newsprint: "newsprintEditorial",
  newsprinteditorial: "newsprintEditorial",
  riso: "risoPoster",
  risoposter: "risoPoster",
};

export function themeNameToStylePackId(theme: string): StylePackId | null {
  const key = theme
    .trim()
    .toLowerCase()
    .replace(/[\s/_-]+/g, "");
  return THEME_TO_PACK[key] ?? null;
}

export type SubjectBucket =
  | "tools"
  | "aiCreative"
  | "portfolioEditorial"
  | "industrialOps"
  | "landingAgency"
  | "consumerFriendly";

export type RequestedLuminosity = "light-first" | "dark-first";

export type StylePackDials = {
  variance: number;
  motion: number;
  density: number;
};

export type StylePack = {
  id: StylePackId;
  hallmarkAlias: string;
  aestheticMode: string;
  luminosity: "light-first" | "dark-first";
  dials: StylePackDials;
  designReadTemplate: string;
  surfaceMap: {
    canvas: string;
    surface: string;
    subdued: string;
    inverse: string;
    primary: string;
    accent?: string;
    mutedInk: string;
    border: string;
    overlay: string;
  };
  typography: {
    display: string;
    body: string;
    mono?: string;
  };
  radiusLock: string;
  elevationLock: string;
  navArchetype: string;
  footerArchetype: string;
  signatureElement: string;
  motionRecipe: string;
  /** Concrete section/JSX craft the model must adapt — not optional flavor text. */
  compositionScaffold: string;
  hardBans: string[];
  classCheatSheet: string[];
};

export type StylePackFontPairing = {
  display: string;
  body: string;
  mono?: string;
  googleFontsUrl: string;
  /** Semantic CSS classes the model must define in index.html or a global style block. */
  displayClass: string;
  bodyClass: string;
  monoClass?: string;
};

type StylePackCore = Omit<StylePack, "fontPairing"> & {
  fontPairing?: StylePackFontPairing;
};

export type StylePackWithFonts = StylePack & {
  fontPairing: StylePackFontPairing;
};

export const STYLE_PACKS: Record<StylePackId, StylePackCore> = {
  cobaltMinimal: {
    id: "cobaltMinimal",
    hallmarkAlias: "Cobalt / modern-minimal",
    aestheticMode: "minimalist",
    luminosity: "light-first",
    dials: { variance: 5, motion: 4, density: 6 },
    designReadTemplate:
      "Reading this as: technical product surface for builders, with a Linear-calm utilitarian language, leaning Cobalt modern-minimal.",
    surfaceMap: {
      canvas: "bg-neutral-50 text-neutral-950",
      surface: "bg-white text-neutral-950 border border-neutral-200",
      subdued: "bg-neutral-100 text-neutral-700 border border-neutral-200",
      inverse: "bg-neutral-950 text-neutral-50 border border-neutral-800",
      primary:
        "bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500",
      accent: "text-blue-700",
      mutedInk: "text-neutral-600",
      border: "border-neutral-200",
      overlay: "bg-white text-neutral-950 border-neutral-200",
    },
    typography: {
      display:
        "text-3xl md:text-5xl font-semibold tracking-tight text-neutral-950",
      body: "text-sm md:text-base text-neutral-600 leading-relaxed",
      mono: "font-mono text-xs text-neutral-700",
    },
    radiusLock:
      "rounded-md on controls, rounded-lg on panels — never rounded-full cards or pill-heavy chrome",
    elevationLock:
      "prefer border + spacing; shadow-sm only on overlays/raised controls",
    navArchetype:
      "dense inline-link bar with filled primary action inside max-w-6xl mx-auto px-4",
    footerArchetype:
      "compact utility/status bar (version, docs, environment) — not a four-column sitemap",
    signatureElement:
      "live code or request/response panel: font-mono text-xs border border-neutral-200 bg-neutral-100 p-4 rounded-lg",
    motionRecipe:
      "one staggered whileInView section entrance (opacity + translate-y, ~300ms ease-out); no elastic bounce; respect prefers-reduced-motion",
    compositionScaffold: `
Ship at least one hairline instrument bento (adapt content to the product — do not copy placeholder copy). Use only Lucide icons from the allowlist (Shield, Settings, Clock, Search, Check, …).
\`\`\`tsx
<section className="py-24 px-6 max-w-7xl mx-auto">
  <motion.div
    variants={container}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    className="grid grid-cols-1 md:grid-cols-12 gap-px bg-neutral-200 border border-neutral-200 rounded-xl overflow-hidden shadow-sm"
  >
    <motion.div variants={item} className="md:col-span-6 bg-white p-8 space-y-6">
      <div className="flex items-center gap-3 text-neutral-400">
        <Clock className="h-4 w-4" />
        <span className="text-xs font-mono uppercase tracking-widest">Query Stream</span>
      </div>
      <div className="space-y-3 font-mono text-xs">
        {/* dense timestamp / method / duration rows — subject-specific */}
      </div>
    </motion.div>
    <motion.div variants={item} className="md:col-span-6 bg-white p-8 flex flex-col justify-between">
      <div className="flex items-center gap-3 text-neutral-400">
        <Search className="h-4 w-4" />
        <span className="text-xs font-mono uppercase tracking-widest">Regional Latency</span>
      </div>
      <div className="relative h-32 w-full bg-neutral-50 rounded-lg border border-neutral-100 mt-4 grid grid-cols-3 gap-8 place-content-center text-center">
        {/* region codes + ms values */}
      </div>
    </motion.div>
    <motion.div variants={item} className="md:col-span-4 bg-white p-8 space-y-4">
      <Shield className="h-5 w-5 text-neutral-400" />
      <h3 className="font-medium text-neutral-950">Security Headers</h3>
      <p className="text-sm text-neutral-500 leading-relaxed">Subject-specific capability copy.</p>
    </motion.div>
    <motion.div variants={item} className="md:col-span-4 bg-white p-8 space-y-4">
      <Settings className="h-5 w-5 text-neutral-400" />
      <h3 className="font-medium text-neutral-950">Auth Integration</h3>
      <p className="text-sm text-neutral-500 leading-relaxed">Subject-specific capability copy.</p>
    </motion.div>
    <motion.div variants={item} className="md:col-span-4 bg-white p-8 space-y-4">
      <div className="bg-neutral-950 rounded-md p-3 font-mono text-xs text-neutral-300">
        <span className="text-neutral-500">$</span> deploy --env prod
        <br />
        <span className="text-emerald-400">Deployment successful</span>
      </div>
      <h3 className="font-medium text-neutral-950">CLI First</h3>
    </motion.div>
  </motion.div>
</section>
\`\`\`
Define \`container\` / \`item\` stagger variants (hidden→show with delayChildren / staggerChildren). Never ship three equal icon+heading+paragraph cards instead of this mixed-cell craft.
`.trim(),
    hardBans: [
      "purple gradients",
      "glassmorphism on every surface",
      "pill nav clusters",
      "cream+brass luxury defaults",
      "section-number eyebrows",
      "three equal feature cards",
    ],
    classCheatSheet: [
      "Root: min-h-screen bg-neutral-50 text-neutral-950",
      "Hairline bento: grid md:grid-cols-12 gap-px bg-neutral-200 border border-neutral-200 rounded-xl overflow-hidden",
      "Cell: bg-white p-8",
      "Mono label: text-xs font-mono uppercase tracking-widest text-neutral-400",
      "Primary CTA: inline-flex items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      "CLI inverse: bg-neutral-950 rounded-md p-3 font-mono text-xs text-neutral-300",
      "Secondary: rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-950 hover:bg-neutral-100",
    ],
  },

  lumenAtmospheric: {
    id: "lumenAtmospheric",
    hallmarkAlias: "Lumen / atmospheric",
    aestheticMode: "high-end",
    luminosity: "dark-first",
    dials: { variance: 7, motion: 5, density: 4 },
    designReadTemplate:
      "Reading this as: AI/creative product for makers, with an instrument-grade atmospheric language, leaning Lumen.",
    surfaceMap: {
      canvas: "bg-neutral-950 text-neutral-50",
      surface: "bg-neutral-900 text-neutral-50 border border-neutral-800",
      subdued: "bg-neutral-900/80 text-neutral-300 border border-neutral-800",
      inverse: "bg-amber-50 text-neutral-950 border border-amber-100",
      primary:
        "bg-amber-500 text-neutral-950 hover:bg-amber-400 focus-visible:ring-2 focus-visible:ring-amber-300",
      accent: "text-amber-400",
      mutedInk: "text-neutral-400",
      border: "border-neutral-800",
      overlay: "bg-neutral-900 text-neutral-50 border-neutral-800",
    },
    typography: {
      display:
        "text-3xl md:text-6xl font-semibold tracking-tight lowercase text-neutral-50",
      body: "text-sm md:text-base text-neutral-400 leading-relaxed",
      mono: "font-mono text-xs uppercase tracking-wider text-amber-400/90",
    },
    radiusLock:
      "rounded-xl panels, rounded-lg controls — one soft system, no mixed pill+sharp chaos",
    elevationLock:
      "hairline borders over heavy shadows; optional subtle backdrop-blur on sticky nav only",
    navArchetype:
      "floating pill nav (w-max mx-auto mt-6 rounded-full border border-neutral-800 bg-neutral-950/80 backdrop-blur) OR edge-aligned minimal mark + mono links",
    footerArchetype: "single statement line + minimal links — no sitemap grid",
    signatureElement:
      "engineered apparatus motif: one focal canvas with blueprint-grid support (border-neutral-800 grid lines) and a single warm amber readout",
    motionRecipe:
      "measured reveal only (opacity + translate-y); MOTION_INTENSITY mid; no rainbow mesh blobs or purple orbs",
    compositionScaffold: `
Dark instrument canvas with one apparatus motif. Prefer a 12-col hairline grid on dark rails:
\`\`\`tsx
<section className="py-24 px-6 max-w-7xl mx-auto">
  <motion.div
    variants={container}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    className="grid grid-cols-1 md:grid-cols-12 gap-px bg-neutral-800 border border-neutral-800 rounded-xl overflow-hidden"
  >
    <motion.div variants={item} className="md:col-span-7 bg-neutral-900 p-8 space-y-4">
      <span className="font-mono text-xs uppercase tracking-wider text-amber-400">Signal</span>
      <h2 className="text-3xl md:text-5xl font-semibold tracking-tight lowercase text-neutral-50">compose the run</h2>
      <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-300">
        {/* live prompt / token stream UI */}
      </div>
    </motion.div>
    <motion.div variants={item} className="md:col-span-5 bg-neutral-900 p-8 space-y-6">
      <span className="font-mono text-xs uppercase tracking-wider text-amber-400">Telemetry</span>
      {/* dense key/value readouts with amber accents */}
    </motion.div>
  </motion.div>
</section>
\`\`\`
No purple orbs. One warm amber accent family only.
`.trim(),
    hardBans: [
      "AI-purple gradients",
      "neon glow blooms",
      "fake orb hero as the only idea",
      "Inter-only voice",
      "light gray SaaS chrome on dark canvas without contrast pairs",
      "three equal feature cards",
    ],
    classCheatSheet: [
      "Root: min-h-screen bg-neutral-950 text-neutral-50",
      "Hairline bento: grid md:grid-cols-12 gap-px bg-neutral-800 border border-neutral-800 rounded-xl overflow-hidden",
      "Cell: bg-neutral-900 p-8",
      "Panel: rounded-xl border border-neutral-800 bg-neutral-900 p-6",
      "Primary CTA: rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-amber-400",
      "Secondary CTA: rounded-lg border border-neutral-700 bg-transparent px-5 py-2.5 text-sm font-medium text-neutral-50 hover:bg-neutral-900",
      "Mono callout: font-mono text-xs uppercase tracking-wider text-amber-400",
      "Focus ring: focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
    ],
  },

  editorialSpecimen: {
    id: "editorialSpecimen",
    hallmarkAlias: "Specimen / editorial",
    aestheticMode: "editorial",
    luminosity: "light-first",
    dials: { variance: 8, motion: 4, density: 3 },
    designReadTemplate:
      "Reading this as: portfolio or content-led site for design-conscious visitors, with an editorial specimen language, leaning Specimen.",
    surfaceMap: {
      canvas: "bg-stone-50 text-stone-950",
      surface: "bg-white text-stone-950 border border-stone-200",
      subdued: "bg-stone-100 text-stone-700 border border-stone-200",
      inverse: "bg-stone-950 text-stone-50 border border-stone-800",
      primary:
        "bg-stone-950 text-stone-50 hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-stone-400",
      accent: "text-rose-700",
      mutedInk: "text-stone-600",
      border: "border-stone-200",
      overlay: "bg-white text-stone-950 border-stone-200",
    },
    typography: {
      display:
        "text-4xl md:text-6xl font-semibold tracking-tight text-stone-950 leading-none",
      body: "text-base text-stone-600 leading-relaxed max-w-prose",
    },
    radiusLock:
      "rounded-none or rounded-sm primary containers; rounded-md buttons only",
    elevationLock: "hairline borders and print-like rules; almost no shadow",
    navArchetype:
      "editorial masthead: mark + sparse links in max-w-6xl mx-auto px-4, asymmetric bias allowed inside centered shell",
    footerArchetype: "colophon-style dense block (credits, year, sparse links)",
    signatureElement:
      "asymmetric type-led opening: oversized headline with hairline rule and one rose accent mark — never centered three-card hero",
    motionRecipe:
      "restrained scroll fade-up on sections; no perpetual loops; one intentional entrance",
    compositionScaffold: `
Asymmetric type-led opening + hairline editorial board (not three equal cards):
\`\`\`tsx
<section className="py-24 md:py-32 px-6 max-w-6xl mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end border-b border-stone-200 pb-12">
    <h1 className="md:col-span-8 text-4xl md:text-6xl font-semibold tracking-tight leading-none text-stone-950">
      Subject-specific headline in two lines
    </h1>
    <p className="md:col-span-4 text-base text-stone-600 leading-relaxed max-w-prose">
      Short supporting sentence with one <span className="text-rose-700">rose</span> accent mark.
    </p>
  </div>
  <motion.div
    variants={container}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-px bg-stone-200 border border-stone-200"
  >
    <motion.div variants={item} className="md:col-span-8 bg-white p-10">
      {/* long-form specimen / case block */}
    </motion.div>
    <motion.div variants={item} className="md:col-span-4 bg-white p-10 space-y-4">
      {/* colophon meta: year, role, mono labels */}
    </motion.div>
  </motion.div>
</section>
\`\`\`
`.trim(),
    hardBans: [
      "centered hero → three equal cards → CTA",
      "gradient display headlines",
      "Fraunces/Instrument Serif as lazy default",
      "pill badge spam",
      "cream+brass+oxblood cliché stack",
    ],
    classCheatSheet: [
      "Root: min-h-screen bg-stone-50 text-stone-950",
      "Hairline: border-t border-stone-200",
      "Editorial board: grid md:grid-cols-12 gap-px bg-stone-200 border border-stone-200",
      "Display: text-4xl md:text-6xl font-semibold tracking-tight leading-none text-stone-950",
      "Accent word/mark: text-rose-700",
      "Primary CTA: rounded-md bg-stone-950 px-5 py-2.5 text-sm font-medium text-stone-50 hover:bg-stone-800",
      "Secondary CTA: rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-950 hover:bg-stone-100",
      "Section: py-24 md:py-32",
    ],
  },

  swissBrutal: {
    id: "swissBrutal",
    hallmarkAlias: "Brutal / Swiss Industrial",
    aestheticMode: "brutalist",
    luminosity: "light-first",
    dials: { variance: 7, motion: 2, density: 7 },
    designReadTemplate:
      "Reading this as: ops/infra or industrial data surface for operators, with a Swiss Industrial brutalist language, leaning Brutal.",
    surfaceMap: {
      canvas: "bg-neutral-100 text-neutral-950",
      surface: "bg-white text-neutral-950 border-2 border-neutral-950",
      subdued: "bg-neutral-200 text-neutral-950 border border-neutral-950",
      inverse: "bg-neutral-950 text-neutral-50 border-2 border-neutral-950",
      primary:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 rounded-none",
      accent: "text-red-600",
      mutedInk: "text-neutral-700",
      border: "border-neutral-950",
      overlay: "bg-white text-neutral-950 border-2 border-neutral-950",
    },
    typography: {
      display:
        "text-4xl md:text-7xl font-black uppercase tracking-tighter text-neutral-950 leading-none",
      body: "text-sm text-neutral-800 leading-snug",
      mono: "font-mono text-xs uppercase tracking-widest text-neutral-700",
    },
    radiusLock:
      "rounded-none on primary containers and CTAs — mechanical 90° corners only",
    elevationLock:
      "no soft shadows; structure via 1–2px solid borders and full-width rules",
    navArchetype:
      "edge-aligned dense bar with uppercase mono links and one hazard-red action; max-w-7xl mx-auto px-4",
    footerArchetype:
      "compact utility bar with REV / UNIT metadata — not marketing columns",
    signatureElement:
      "one bold move only: full-bleed horizontal rule, overlapping macro numeral, or telemetry frame with ASCII brackets — remove other flourishes",
    motionRecipe:
      "near-static; at most three intentional primitives; no bounce/elastic; no universal hover choreography",
    compositionScaffold: `
Radius-0 telemetry board with 2px ink borders and one hazard-red primary:
\`\`\`tsx
<section className="py-16 px-4 max-w-7xl mx-auto">
  <div className="flex items-end justify-between border-b-2 border-neutral-950 pb-4 mb-0">
    <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">UNIT / OPS</h1>
    <span className="font-mono text-xs uppercase tracking-widest text-neutral-700">REV 2.6</span>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-12 border-2 border-neutral-950 border-t-0">
    <div className="md:col-span-8 border-r-2 border-neutral-950 p-6 space-y-4">
      <span className="font-mono text-xs uppercase tracking-widest text-red-600">[ LIVE FEED ]</span>
      {/* dense mono rows */}
    </div>
    <div className="md:col-span-4 p-6 space-y-4 bg-white">
      <button type="button" className="w-full bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700 rounded-none">
        Execute
      </button>
      {/* status meta */}
    </div>
  </div>
</section>
\`\`\`
No soft shadows, no rounded cards, no glass.
`.trim(),
    hardBans: [
      "glassmorphism",
      "gradients",
      "soft shadow-md/lg",
      "rounded-2xl cards",
      "purple accents",
      "mixing Swiss light with CRT dark in one screen",
      "three equal feature cards",
    ],
    classCheatSheet: [
      "Root: min-h-screen bg-neutral-100 text-neutral-950",
      "Panel: bg-white border-2 border-neutral-950 p-4 rounded-none",
      "Rule: w-full border-t-2 border-neutral-950",
      "Primary: inline-flex items-center justify-center bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700 rounded-none",
      "Secondary CTA: inline-flex items-center justify-center border-2 border-neutral-950 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-950 hover:bg-neutral-100 rounded-none",
      "Meta: font-mono text-xs uppercase tracking-widest text-neutral-700",
      "Display: text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none",
    ],
  },

  kineticAwwwards: {
    id: "kineticAwwwards",
    hallmarkAlias: "Carnival / kinetic (disciplined)",
    aestheticMode: "kinetic",
    luminosity: "light-first",
    dials: { variance: 9, motion: 8, density: 3 },
    designReadTemplate:
      "Reading this as: creative landing or agency showcase for design-forward visitors, with a kinetic Awwwards language, leaning Carnival-disciplined.",
    surfaceMap: {
      canvas: "bg-neutral-50 text-neutral-950",
      surface: "bg-white text-neutral-950 border border-neutral-200",
      subdued: "bg-neutral-100 text-neutral-700 border border-neutral-200",
      inverse: "bg-neutral-950 text-neutral-50 border border-neutral-800",
      primary:
        "bg-neutral-950 text-neutral-50 hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400",
      accent: "text-orange-600",
      mutedInk: "text-neutral-600",
      border: "border-neutral-200",
      overlay: "bg-white text-neutral-950 border-neutral-200",
    },
    typography: {
      display:
        "text-4xl md:text-7xl font-semibold tracking-tight text-neutral-950 max-w-5xl leading-none",
      body: "text-base md:text-lg text-neutral-600 leading-relaxed max-w-2xl",
    },
    radiusLock:
      "rounded-2xl for elevated media tiles; rounded-full only for primary CTA pills when justified",
    elevationLock:
      "selective hard-offset feel via border + translate on hover; avoid colored glow shadows",
    navArchetype:
      "floating glass pill OR minimal split nav inside centered max-w-6xl shell",
    footerArchetype: "massive high-contrast CTA band + clean sparse links",
    signatureElement:
      "AIDA spine with one scroll-craft Desire section (pin OR scrub OR stack — pick one) and gapless bento (N items → N cells, grid-flow-dense)",
    motionRecipe:
      "motivated Framer Motion entrance + one scroll paradigm; animate transform/opacity only; respect prefers-reduced-motion; H1 max 2–3 lines in max-w-5xl/max-w-6xl",
    compositionScaffold: `
Wide cinematic hero (2–3 line H1 in max-w-5xl) then gapless dense bento with mixed spans:
\`\`\`tsx
<main className="overflow-x-hidden w-full max-w-full">
  <section className="min-h-screen flex flex-col justify-center px-4 pt-16 md:pt-24 max-w-6xl mx-auto">
    <motion.h1
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl md:text-7xl font-semibold tracking-tight max-w-5xl leading-none text-neutral-950"
    >
      Two-line cinematic headline
    </motion.h1>
    <p className="mt-6 text-lg text-neutral-600 max-w-2xl">Subtext under twenty words.</p>
    <div className="mt-8 flex gap-3">
      <a className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-neutral-50">Primary</a>
      <a className="rounded-full border border-neutral-200 px-6 py-3 text-sm text-neutral-950">Secondary</a>
    </div>
  </section>
  <section className="py-32 md:py-48 px-4 max-w-7xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 grid-flow-dense">
      <div className="md:col-span-4 md:row-span-2 rounded-2xl border border-neutral-200 bg-white p-8">{/* anchor tile */}</div>
      <div className="md:col-span-2 rounded-2xl border border-neutral-200 bg-white p-8">{/* */}</div>
      <div className="md:col-span-2 rounded-2xl border border-neutral-200 bg-white p-8">{/* */}</div>
      <div className="md:col-span-3 rounded-2xl border border-neutral-200 bg-white p-8">{/* */}</div>
      <div className="md:col-span-3 rounded-2xl border border-neutral-200 bg-white p-8">{/* */}</div>
    </div>
  </section>
</main>
\`\`\`
N tiles → N filled cells. No empty bento holes. No SECTION 01 labels.
`.trim(),
    hardBans: [
      "6-line narrow H1 walls",
      "SECTION 01 / QUESTION 05 meta labels",
      "empty bento holes",
      "stats/trust logos inside hero",
      "purple mesh default",
      "em-dash separators in UI copy",
    ],
    classCheatSheet: [
      "Main: overflow-x-hidden w-full max-w-full",
      "Hero shell: min-h-screen flex flex-col justify-center px-4 pt-16 md:pt-24",
      "H1: text-4xl md:text-7xl font-semibold tracking-tight max-w-5xl leading-none",
      "Section breath: py-32 md:py-48",
      "Bento: grid grid-cols-1 md:grid-cols-6 gap-4 grid-flow-dense",
      "Tile spans: md:col-span-4 md:row-span-2 | md:col-span-2 | md:col-span-3",
      "Primary CTA: rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-neutral-50",
      "Secondary CTA: rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-950 hover:bg-neutral-100",
    ],
  },

  softStructural: {
    id: "softStructural",
    hallmarkAlias: "Hum / Soft Structuralism",
    aestheticMode: "high-end",
    luminosity: "light-first",
    dials: { variance: 7, motion: 5, density: 3 },
    designReadTemplate:
      "Reading this as: consumer or onboarding product for friendly everyday users, with a soft structural language, leaning Hum-adjacent restraint.",
    surfaceMap: {
      canvas: "bg-neutral-50 text-neutral-950",
      surface: "bg-white text-neutral-950 border border-neutral-200/80",
      subdued: "bg-neutral-100 text-neutral-700 border border-neutral-200",
      inverse: "bg-neutral-900 text-neutral-50 border border-neutral-800",
      primary:
        "bg-teal-700 text-white hover:bg-teal-800 focus-visible:ring-2 focus-visible:ring-teal-500",
      accent: "text-teal-700",
      mutedInk: "text-neutral-600",
      border: "border-neutral-200",
      overlay: "bg-white text-neutral-950 border-neutral-200",
    },
    typography: {
      display:
        "text-3xl md:text-5xl font-semibold tracking-tight text-neutral-950",
      body: "text-base text-neutral-600 leading-relaxed",
    },
    radiusLock:
      "rounded-2xl panels via nested double-surface; rounded-xl inner; rounded-lg buttons — not rounded-full cards",
    elevationLock:
      "soft ambient: shadow-sm on truly raised panels; double-bezel (outer p-1 border + inner surface)",
    navArchetype:
      "minimal mark + two to three links + primary; centered max-w-6xl mx-auto px-4",
    footerArchetype: "single statement line with minimal links",
    signatureElement:
      "double-bezel elevated panel: outer rounded-2xl border border-neutral-200 bg-neutral-100/80 p-1; inner rounded-xl bg-white p-6",
    motionRecipe:
      "gentle fade-up (translate-y + opacity, ~600ms ease-out); button active:scale-95; no elastic defaults",
    compositionScaffold: `
Double-bezel elevated modules with generous section rhythm — not flat equal cards:
\`\`\`tsx
<section className="py-24 md:py-32 px-6 max-w-6xl mx-auto space-y-8">
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="rounded-2xl border border-neutral-200 bg-neutral-100 p-1"
  >
    <div className="rounded-xl bg-white p-8 md:p-10 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-7 space-y-4">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-neutral-950">Friendly thesis</h2>
        <p className="text-base text-neutral-600 leading-relaxed">Support copy under two sentences.</p>
        <button type="button" className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 active:scale-95">
          Continue
        </button>
      </div>
      <div className="md:col-span-5 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
        {/* product preview / habit widget */}
      </div>
    </div>
  </motion.div>
</section>
\`\`\`
`.trim(),
    hardBans: [
      "saturated consumer rainbow gradients",
      "emoji-as-icon language",
      "heavy shadow-xl stacks",
      "purple SaaS chrome",
      "fake dense dashboards in marketing mocks",
      "three equal feature cards",
    ],
    classCheatSheet: [
      "Root: min-h-screen bg-neutral-50 text-neutral-950",
      "Double-bezel outer: rounded-2xl border border-neutral-200 bg-neutral-100 p-1",
      "Double-bezel inner: rounded-xl bg-white p-6 shadow-sm",
      "Primary: rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 active:scale-95",
      "Secondary CTA: rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 hover:bg-neutral-100",
      "Section: py-24 md:py-32",
      "Muted: text-neutral-600",
    ],
  },

  terminalPhosphor: {
    id: "terminalPhosphor",
    hallmarkAlias: "Terminal / phosphor CRT",
    aestheticMode: "brutalist",
    luminosity: "dark-first",
    dials: { variance: 6, motion: 3, density: 8 },
    designReadTemplate:
      "Reading this as: developer tool or ops console for power users, with a phosphor terminal language, leaning Terminal.",
    surfaceMap: {
      canvas: "bg-neutral-950 text-emerald-400",
      surface: "bg-neutral-900 text-emerald-300 border border-emerald-900",
      subdued:
        "bg-neutral-900/90 text-emerald-400/80 border border-neutral-800",
      inverse: "bg-emerald-950 text-emerald-100 border border-emerald-800",
      primary:
        "bg-emerald-600 text-neutral-950 hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-none font-mono uppercase tracking-wider text-xs",
      accent: "text-emerald-400",
      mutedInk: "text-emerald-700",
      border: "border-emerald-900",
      overlay: "bg-neutral-900 text-emerald-300 border-emerald-900",
    },
    typography: {
      display:
        "font-mono text-2xl md:text-4xl font-bold uppercase tracking-tight text-emerald-400",
      body: "font-mono text-sm text-emerald-500/90 leading-relaxed",
      mono: "font-mono text-xs uppercase tracking-widest text-emerald-600",
    },
    radiusLock:
      "rounded-none everywhere — CRT scanline aesthetic, no soft corners",
    elevationLock:
      "no shadows; structure via 1px phosphor borders and ASCII brackets",
    navArchetype:
      "edge-aligned mono bar with bracket labels [ HOME ] [ DOCS ] and one phosphor primary; max-w-7xl mx-auto px-4",
    footerArchetype:
      "mono status line: uptime · version · env — no marketing columns",
    signatureElement:
      "ASCII-bracket telemetry frame with blinking cursor block and dense mono log rows",
    motionRecipe:
      "near-static; optional single opacity blink on cursor; no bounce; respect prefers-reduced-motion",
    compositionScaffold: `
Phosphor terminal board — mono throughout, bracket labels, dense rows:
\`\`\`tsx
<section className="py-12 px-4 max-w-7xl mx-auto font-mono">
  <div className="border border-emerald-900 bg-neutral-900 p-6 space-y-4">
    <div className="flex items-center justify-between border-b border-emerald-900 pb-3">
      <span className="text-xs uppercase tracking-widest text-emerald-600">[ LIVE SESSION ]</span>
      <span className="text-xs text-emerald-700">PID 8842</span>
    </div>
    <div className="space-y-1 text-sm text-emerald-400">
      {/* timestamped log lines — subject-specific */}
    </div>
    <div className="flex gap-2 pt-2">
      <span className="text-emerald-500">&gt;</span>
      <span className="animate-pulse text-emerald-400">_</span>
    </div>
  </div>
</section>
\`\`\`
Never mix Inter sans with this pack. Never use yellow accents.
`.trim(),
    hardBans: [
      "yellow or amber accents",
      "Inter/system-ui sans body",
      "rounded-2xl cards",
      "soft shadows",
      "purple gradients",
      "three equal feature cards",
    ],
    classCheatSheet: [
      "Root: min-h-screen bg-neutral-950 text-emerald-400 font-mono",
      "Panel: bg-neutral-900 border border-emerald-900 p-4 rounded-none",
      "Primary: bg-emerald-600 text-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none hover:bg-emerald-500",
      "Bracket label: text-xs uppercase tracking-widest text-emerald-600",
      "Log line: text-sm text-emerald-400",
    ],
  },

  gardenBotanical: {
    id: "gardenBotanical",
    hallmarkAlias: "Garden / botanical craft",
    aestheticMode: "editorial",
    luminosity: "light-first",
    dials: { variance: 7, motion: 4, density: 3 },
    designReadTemplate:
      "Reading this as: craft/food/wellness product for design-conscious visitors, with a botanical editorial language, leaning Garden.",
    surfaceMap: {
      canvas: "bg-stone-100 text-stone-900",
      surface: "bg-stone-50 text-stone-900 border border-stone-300",
      subdued: "bg-emerald-50 text-stone-700 border border-emerald-200",
      inverse: "bg-emerald-900 text-stone-50 border border-emerald-800",
      primary:
        "bg-emerald-800 text-stone-50 hover:bg-emerald-900 focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md",
      accent: "text-emerald-700",
      mutedInk: "text-stone-600",
      border: "border-stone-300",
      overlay: "bg-stone-50 text-stone-900 border-stone-300",
    },
    typography: {
      display:
        "text-3xl md:text-5xl font-semibold tracking-tight text-stone-900 leading-tight",
      body: "text-base text-stone-600 leading-relaxed max-w-prose",
    },
    radiusLock:
      "rounded-lg panels, rounded-md controls — organic soft, not pill-heavy",
    elevationLock:
      "warm borders over shadows; one subtle shadow-sm on elevated cards only",
    navArchetype:
      "editorial mark + sparse links in max-w-6xl mx-auto px-4; leaf-green accent on active link",
    footerArchetype: "colophon block with season/year and sparse links",
    signatureElement:
      "asymmetric botanical board: wide specimen column + narrow meta rail with emerald accent marks",
    motionRecipe:
      "gentle fade-up on sections (~400ms ease-out); no elastic; respect prefers-reduced-motion",
    compositionScaffold: `
Botanical editorial board — stone canvas, emerald accent, asymmetric spans:
\`\`\`tsx
<section className="py-24 px-6 max-w-6xl mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end border-b border-stone-300 pb-12">
    <h1 className="md:col-span-7 text-3xl md:text-5xl font-semibold tracking-tight text-stone-900">
      Subject-specific headline
    </h1>
    <p className="md:col-span-5 text-base text-stone-600 leading-relaxed">
      Supporting copy with <span className="text-emerald-700">botanical</span> accent.
    </p>
  </div>
  <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-px bg-stone-300 border border-stone-300">
    <div className="md:col-span-8 bg-stone-50 p-10">{/* long-form content */}</div>
    <div className="md:col-span-4 bg-emerald-50 p-10 space-y-4">{/* meta rail */}</div>
  </div>
</section>
\`\`\`
`.trim(),
    hardBans: [
      "yellow/black combo",
      "purple gradients",
      "dark-first canvas",
      "Inter-only typography",
      "three equal feature cards",
      "cream+brass luxury cliché",
    ],
    classCheatSheet: [
      "Root: min-h-screen bg-stone-100 text-stone-900",
      "Surface: bg-stone-50 border border-stone-300 p-6 rounded-lg",
      "Accent: text-emerald-700",
      "Primary: bg-emerald-800 text-stone-50 px-5 py-2.5 rounded-md hover:bg-emerald-900",
      "Section: py-24 md:py-32",
    ],
  },

  midnightCool: {
    id: "midnightCool",
    hallmarkAlias: "Midnight / Aurora cool atmospheric",
    aestheticMode: "high-end",
    luminosity: "dark-first",
    dials: { variance: 7, motion: 5, density: 4 },
    designReadTemplate:
      "Reading this as: AI/data product for technical makers, with a cool midnight instrument language, leaning Midnight/Aurora.",
    surfaceMap: {
      canvas: "bg-slate-950 text-slate-50",
      surface: "bg-slate-900 text-slate-50 border border-slate-800",
      subdued: "bg-slate-900/80 text-slate-400 border border-slate-800",
      inverse: "bg-cyan-950 text-cyan-50 border border-cyan-800",
      primary:
        "bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-300 rounded-lg",
      accent: "text-cyan-400",
      mutedInk: "text-slate-400",
      border: "border-slate-800",
      overlay: "bg-slate-900 text-slate-50 border-slate-800",
    },
    typography: {
      display:
        "text-3xl md:text-6xl font-semibold tracking-tight text-slate-50",
      body: "text-sm md:text-base text-slate-400 leading-relaxed",
      mono: "font-mono text-xs uppercase tracking-wider text-cyan-400/90",
    },
    radiusLock: "rounded-xl panels, rounded-lg controls — one cool soft system",
    elevationLock: "hairline slate borders; no colored glow blooms",
    navArchetype:
      "floating pill nav on slate-950/80 backdrop-blur OR edge-aligned mark + cyan mono links",
    footerArchetype: "single statement line + minimal links",
    signatureElement:
      "cool instrument canvas with cyan readout panel and slate hairline grid — NOT amber/yellow",
    motionRecipe:
      "measured opacity + translate-y reveal; no purple orbs; respect prefers-reduced-motion",
    compositionScaffold: `
Cool midnight instrument — slate canvas, cyan accent (never amber/yellow):
\`\`\`tsx
<section className="py-24 px-6 max-w-7xl mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-slate-800 border border-slate-800 rounded-xl overflow-hidden">
    <div className="md:col-span-7 bg-slate-900 p-8 space-y-4">
      <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">Signal</span>
      <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-50">subject headline</h2>
    </div>
    <div className="md:col-span-5 bg-slate-900 p-8 border-l border-slate-800">
      {/* cyan telemetry readouts */}
    </div>
  </div>
</section>
\`\`\`
`.trim(),
    hardBans: [
      "amber or yellow accents (use cyan/indigo instead)",
      "yellow/black primary CTA",
      "purple mesh orbs",
      "Inter-only voice",
      "light gray SaaS on dark without contrast pairs",
      "three equal feature cards",
    ],
    classCheatSheet: [
      "Root: min-h-screen bg-slate-950 text-slate-50",
      "Panel: rounded-xl border border-slate-800 bg-slate-900 p-6",
      "Primary: rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400",
      "Mono callout: font-mono text-xs uppercase tracking-wider text-cyan-400",
      "Focus: focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
    ],
  },

  manifestoGeometric: {
    id: "manifestoGeometric",
    hallmarkAlias: "Manifesto / geometric poster",
    aestheticMode: "kinetic",
    luminosity: "light-first",
    dials: { variance: 9, motion: 6, density: 5 },
    designReadTemplate:
      "Reading this as: bold statement landing or studio manifesto for design-forward visitors, with a geometric poster language, leaning Manifesto.",
    surfaceMap: {
      canvas: "bg-white text-neutral-950",
      surface: "bg-neutral-50 text-neutral-950 border-2 border-neutral-950",
      subdued: "bg-neutral-100 text-neutral-800 border border-neutral-950",
      inverse: "bg-neutral-950 text-white border-2 border-neutral-950",
      primary:
        "bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 rounded-none font-bold uppercase tracking-wide",
      accent: "text-orange-600",
      mutedInk: "text-neutral-600",
      border: "border-neutral-950",
      overlay: "bg-white text-neutral-950 border-2 border-neutral-950",
    },
    typography: {
      display:
        "text-4xl md:text-8xl font-black uppercase tracking-tighter text-neutral-950 leading-none",
      body: "text-base md:text-lg text-neutral-700 leading-snug max-w-xl",
    },
    radiusLock: "rounded-none on containers and primary CTAs — poster geometry",
    elevationLock:
      "hard 2px ink borders; offset via translate on hover, not soft shadow",
    navArchetype:
      "edge-aligned bold mark + uppercase links + orange primary block button",
    footerArchetype: "massive statement band + sparse links",
    signatureElement:
      "oversized geometric headline block with 2px rules and one orange accent stripe",
    motionRecipe:
      "one bold entrance (opacity + translate); hover translate on tiles; no bounce",
    compositionScaffold: `
Manifesto poster block — radius-0, 2px ink, orange signal:
\`\`\`tsx
<section className="min-h-screen flex flex-col justify-center px-4 max-w-7xl mx-auto">
  <div className="border-b-2 border-neutral-950 pb-6 mb-8">
    <h1 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none text-neutral-950">
      Bold<br />Statement
    </h1>
  </div>
  <p className="text-lg text-neutral-700 max-w-xl mb-8">Short manifesto subtext.</p>
  <a className="inline-flex bg-orange-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-orange-700 rounded-none">
    Act now
  </a>
</section>
\`\`\`
Never yellow/black. Never soft rounded SaaS cards.
`.trim(),
    hardBans: [
      "yellow/black combo",
      "rounded-2xl soft cards",
      "purple gradients",
      "Inter/system-ui only",
      "glassmorphism",
      "three equal icon cards",
    ],
    classCheatSheet: [
      "Root: min-h-screen bg-white text-neutral-950",
      "Rule: border-b-2 border-neutral-950",
      "Display: text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none",
      "Primary: bg-orange-600 text-white px-6 py-3 font-bold uppercase tracking-wide rounded-none hover:bg-orange-700",
      "Panel: border-2 border-neutral-950 p-6 rounded-none",
    ],
  },

  newsprintEditorial: {
    id: "newsprintEditorial",
    hallmarkAlias: "Newsprint / roman editorial",
    aestheticMode: "editorial",
    luminosity: "light-first",
    dials: { variance: 6, motion: 3, density: 5 },
    designReadTemplate:
      "Reading this as: publication or content product for readers, with a newsprint editorial language, leaning Newsprint.",
    surfaceMap: {
      canvas: "bg-neutral-100 text-neutral-900",
      surface: "bg-white text-neutral-900 border border-neutral-300",
      subdued: "bg-neutral-50 text-neutral-700 border border-neutral-200",
      inverse: "bg-neutral-900 text-neutral-50 border border-neutral-800",
      primary:
        "bg-neutral-900 text-neutral-50 hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-500 rounded-sm",
      accent: "text-red-800",
      mutedInk: "text-neutral-600",
      border: "border-neutral-300",
      overlay: "bg-white text-neutral-900 border-neutral-300",
    },
    typography: {
      display:
        "text-3xl md:text-5xl font-serif font-normal tracking-normal text-neutral-900 leading-tight",
      body: "text-base text-neutral-700 leading-relaxed max-w-prose",
    },
    radiusLock: "rounded-sm or rounded-none — print-like, minimal radius",
    elevationLock: "hairline rules and column dividers; almost no shadow",
    navArchetype:
      "masthead: centered publication name + date/edition line + sparse section links",
    footerArchetype: "colophon with edition, credits, sparse links",
    signatureElement:
      "multi-column editorial grid with hairline dividers and one red accent dateline",
    motionRecipe: "restrained fade only; no scroll gimmicks",
    compositionScaffold: `
Newsprint column grid — serif display, hairline rules, red dateline accent:
\`\`\`tsx
<section className="py-16 px-6 max-w-5xl mx-auto">
  <header className="border-b border-neutral-300 pb-4 mb-8 text-center">
    <p className="text-xs uppercase tracking-widest text-red-800 mb-2">Edition · Subject</p>
    <h1 className="text-3xl md:text-5xl font-serif text-neutral-900">Headline Here</h1>
  </header>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-neutral-300 pt-8">
    <article className="md:col-span-2 space-y-4">{/* lead column */}</article>
    <aside className="border-l border-neutral-300 pl-8 space-y-4">{/* rail */}</aside>
  </div>
</section>
\`\`\`
`.trim(),
    hardBans: [
      "yellow/black combo",
      "purple gradients",
      "pill nav",
      "Inter-only sans",
      "dark-first canvas",
      "three equal feature cards",
    ],
    classCheatSheet: [
      "Root: min-h-screen bg-neutral-100 text-neutral-900",
      "Display: text-3xl md:text-5xl font-serif text-neutral-900",
      "Dateline: text-xs uppercase tracking-widest text-red-800",
      "Rule: border-t border-neutral-300",
      "Primary: bg-neutral-900 text-neutral-50 px-5 py-2 rounded-sm hover:bg-neutral-800",
    ],
  },

  risoPoster: {
    id: "risoPoster",
    hallmarkAlias: "Riso / poster print",
    aestheticMode: "kinetic",
    luminosity: "light-first",
    dials: { variance: 9, motion: 5, density: 4 },
    designReadTemplate:
      "Reading this as: creative showcase or cultural product for design-forward visitors, with a risograph poster language, leaning Riso.",
    surfaceMap: {
      canvas: "bg-amber-50 text-neutral-950",
      surface: "bg-white text-neutral-950 border-2 border-neutral-950",
      subdued: "bg-orange-100 text-neutral-800 border-2 border-neutral-950",
      inverse: "bg-neutral-950 text-amber-50 border-2 border-neutral-950",
      primary:
        "bg-neutral-950 text-amber-50 hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-none font-bold uppercase",
      accent: "text-orange-700",
      mutedInk: "text-neutral-700",
      border: "border-neutral-950",
      overlay: "bg-white text-neutral-950 border-2 border-neutral-950",
    },
    typography: {
      display:
        "text-4xl md:text-7xl font-black uppercase tracking-tighter text-neutral-950 leading-none",
      body: "text-base text-neutral-800 leading-snug",
    },
    radiusLock: "rounded-none — risograph print registration, hard edges",
    elevationLock:
      "2px ink borders; misregistration feel via overlapping color blocks, not shadows",
    navArchetype: "bold wordmark + uppercase links + ink primary block",
    footerArchetype: "poster-style band with bold type + minimal links",
    signatureElement:
      "overlapping color-block tiles with 2px ink borders — warm paper, not yellow-on-black",
    motionRecipe:
      "one entrance stagger; no elastic; respect prefers-reduced-motion",
    compositionScaffold: `
Riso poster tiles — warm amber paper, ink borders, overlapping blocks (NOT yellow/black CTA):
\`\`\`tsx
<section className="py-24 px-4 max-w-6xl mx-auto bg-amber-50">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-2 border-neutral-950">
    <div className="col-span-2 row-span-2 bg-orange-200 border-2 border-neutral-950 p-8">
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Subject</h1>
    </div>
    <div className="bg-white border-2 border-neutral-950 p-6">{/* tile */}</div>
    <div className="bg-neutral-950 text-amber-50 border-2 border-neutral-950 p-6">{/* inverse tile */}</div>
  </div>
</section>
\`\`\`
Warm amber PAPER is allowed; yellow-400 CTA on black canvas is banned.
`.trim(),
    hardBans: [
      "bg-yellow-400/500 primary CTA on black (generic AI combo)",
      "purple gradients",
      "soft rounded SaaS cards",
      "Inter-only typography",
      "glassmorphism",
    ],
    classCheatSheet: [
      "Root: min-h-screen bg-amber-50 text-neutral-950",
      "Tile: border-2 border-neutral-950 p-6 rounded-none",
      "Display: text-4xl md:text-7xl font-black uppercase tracking-tighter",
      "Primary: bg-neutral-950 text-amber-50 px-5 py-2.5 font-bold uppercase rounded-none",
      "Accent block: bg-orange-200 border-2 border-neutral-950",
    ],
  },
};

/** Locked font pairings per pack — avoids Inter/system-ui convergence across builds. */
export const PACK_FONT_PAIRINGS: Record<StylePackId, StylePackFontPairing> = {
  cobaltMinimal: {
    display: "Space Grotesk",
    body: "IBM Plex Sans",
    mono: "IBM Plex Mono",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
    monoClass: "font-mono-ui",
  },
  lumenAtmospheric: {
    display: "Syne",
    body: "DM Sans",
    mono: "JetBrains Mono",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
    monoClass: "font-mono-ui",
  },
  editorialSpecimen: {
    display: "Libre Baskerville",
    body: "Source Sans 3",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
  },
  swissBrutal: {
    display: "Archivo Black",
    body: "Archivo",
    mono: "IBM Plex Mono",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
    monoClass: "font-mono-ui",
  },
  kineticAwwwards: {
    display: "Syne",
    body: "Manrope",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=Syne:wght@600;700;800&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
  },
  softStructural: {
    display: "Plus Jakarta Sans",
    body: "Nunito Sans",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
  },
  terminalPhosphor: {
    display: "JetBrains Mono",
    body: "JetBrains Mono",
    mono: "JetBrains Mono",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
    monoClass: "font-mono-ui",
  },
  gardenBotanical: {
    display: "Bricolage Grotesque",
    body: "Manrope",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Manrope:wght@400;500;600&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
  },
  midnightCool: {
    display: "Outfit",
    body: "Inter",
    mono: "JetBrains Mono",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@600;700;800&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
    monoClass: "font-mono-ui",
  },
  manifestoGeometric: {
    display: "Bebas Neue",
    body: "Barlow",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Bebas+Neue&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
  },
  newsprintEditorial: {
    display: "Lora",
    body: "Source Serif 4",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Source+Serif+4:wght@400;500;600&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
  },
  risoPoster: {
    display: "Anton",
    body: "Rubik",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Anton&family=Rubik:wght@400;500;600&display=swap",
    displayClass: "font-display",
    bodyClass: "font-body",
  },
};

const BUCKET_PACKS: Record<SubjectBucket, StylePackId[]> = {
  tools: [
    "cobaltMinimal",
    "terminalPhosphor",
    "midnightCool",
    "manifestoGeometric",
    "swissBrutal",
    "newsprintEditorial",
  ],
  aiCreative: [
    "lumenAtmospheric",
    "midnightCool",
    "kineticAwwwards",
    "terminalPhosphor",
    "risoPoster",
  ],
  portfolioEditorial: [
    "editorialSpecimen",
    "newsprintEditorial",
    "gardenBotanical",
    "kineticAwwwards",
    "manifestoGeometric",
  ],
  industrialOps: [
    "swissBrutal",
    "terminalPhosphor",
    "cobaltMinimal",
    "midnightCool",
  ],
  landingAgency: [
    "kineticAwwwards",
    "manifestoGeometric",
    "risoPoster",
    "editorialSpecimen",
    "midnightCool",
  ],
  consumerFriendly: [
    "softStructural",
    "gardenBotanical",
    "newsprintEditorial",
    "editorialSpecimen",
  ],
};

const TOOL_KEYWORDS =
  /\b(api|sdk|docs?|dashboard|admin|analytics|cli|devtools?|saas|b2b|crm|erp|workflow|kanban|todo|task|project management|spreadsheet|table|settings|console|monitor)\b/i;
const AI_KEYWORDS =
  /\b(ai|llm|gpt|agent|chatbot|generative|diffusion|voice|music|audio|creative tool|prompt|model)\b/i;
const PORTFOLIO_KEYWORDS =
  /\b(portfolio|agency|studio|case study|editorial|blog|magazine|newsletter|storytelling|photographer|designer)\b/i;
const INDUSTRIAL_KEYWORDS =
  /\b(industrial|ops|infra|infrastructure|telemetry|logistics|factory|warehouse|fleet|scada|brutalis|military|aerospace)\b/i;
const LANDING_KEYWORDS =
  /\b(landing|marketing|homepage|awwwards|campaign|launch|waitlist|saas landing)\b/i;
const CONSUMER_KEYWORDS =
  /\b(consumer|onboarding|health|wellness|fitness|local|booking|recipe|habit|kids?|family|friendly)\b/i;

const DARK_LUMINOSITY_PATTERN =
  /\b(?:dark(?:[-\s]+(?:mode|theme|themed|palette|canvas|ui|interface|site|page))|(?:mode|theme|palette|canvas|ui|interface|site|page)\s+(?:is\s+)?dark|near[-\s]+black)\b/i;
const LIGHT_LUMINOSITY_PATTERN =
  /\b(?:light(?:[-\s]+(?:mode|theme|themed|palette|canvas|ui|interface|site|page))|(?:mode|theme|palette|canvas|ui|interface|site|page)\s+(?:is\s+)?light)\b/i;

/** A luminosity request constrains a palette, but does not define one. */
export function inferRequestedLuminosity(
  brief: string,
): RequestedLuminosity | null {
  const dark = DARK_LUMINOSITY_PATTERN.test(brief);
  const light = LIGHT_LUMINOSITY_PATTERN.test(brief);
  if (dark === light) return null;
  return dark ? "dark-first" : "light-first";
}

export function hasCompleteAestheticDirection(brief: string): boolean {
  const text = brief.trim();
  if (!text) return false;

  const aestheticSignals =
    /\b(brutalist|minimalist|editorial|glassmorphism|awwwards|kinetic|swiss\s+industrial|tactical\s+crt|neumorphic|retro-futuristic|art deco|linear-style|apple-y|color\s+scheme|brand\s+colors?|visual\s+theme|color\s+theme|theming|make\s+it\s+(purple|blue|green|red|orange|pink|black|white)|like\s+(linear|vercel|stripe|notion|figma|apple))\b/i;

  const colorWords =
    /\b(purple|violet|indigo|fuchsia|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange|red|rose|pink|stone|zinc|neutral|gray|grey|slate|black|white)\b/i;
  const colorIntent =
    /\b(bg-|text-|colour(?:ed)?|colored|palette|accent|primary\s+color|make\s+(?:it|the|this|an?)\s+|use\s+|with\s+a\s+)\b/i;
  const namedColor =
    colorWords.test(text) &&
    (colorIntent.test(text) ||
      /\bmake\s+(?:a|an|the)\s+\w*\s*(purple|violet|indigo|fuchsia|blue|teal|green|red|orange|pink|black|white)\b/i.test(
        text,
      ) ||
      /\b(purple|violet|indigo|fuchsia|blue|teal|green|red|orange|pink)\s+(app|ui|site|page|dashboard|theme|palette|accent)\b/i.test(
        text,
      ));

  return (
    aestheticSignals.test(text) ||
    namedColor ||
    /#[0-9a-f]{3,8}\b|https?:\/\/\S+/i.test(text)
  );
}

/** Detect any explicit aesthetic constraint; luminosity alone remains pack-eligible. */
export function hasExplicitAestheticDirection(brief: string): boolean {
  return (
    inferRequestedLuminosity(brief) !== null ||
    hasCompleteAestheticDirection(brief)
  );
}

export function inferSubjectBucket(brief: string): SubjectBucket {
  const text = brief.trim();
  if (INDUSTRIAL_KEYWORDS.test(text)) return "industrialOps";
  if (AI_KEYWORDS.test(text)) return "aiCreative";
  if (PORTFOLIO_KEYWORDS.test(text)) return "portfolioEditorial";
  if (LANDING_KEYWORDS.test(text)) return "landingAgency";
  if (CONSUMER_KEYWORDS.test(text)) return "consumerFriendly";
  if (TOOL_KEYWORDS.test(text)) return "tools";
  // Generic product / vague todo-style briefs → tools (cobalt-first)
  return "tools";
}

/** Deterministic seed from the full brief (stable for identical input). */
export function hashBriefSeed(brief: string): number {
  const trimmed = brief.trim();
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const first = tokens[0] ?? "";
  const last = tokens[tokens.length - 1] ?? "";
  let hash = trimmed.length * 2654435761;
  const material = `${first}|${last}|${trimmed}`;
  for (let i = 0; i < material.length; i++) {
    hash = Math.imul(hash ^ material.charCodeAt(i), 16777619);
  }
  return Math.abs(hash);
}

export function selectStylePackId(
  brief: string,
  options?: { forcePack?: StylePackId },
): StylePackId | null {
  if (options?.forcePack) return options.forcePack;

  const text = brief.trim();

  // User named a Hallmark theme explicitly — map to pack when possible
  const hallmarkMatch = text.match(
    /\b(cobalt|lumen|specimen|brutal|hum|carnival|terminal|garden|midnight|aurora|manifesto|atelier|newsprint|riso)\b/i,
  );
  if (hallmarkMatch) {
    const mapped = themeNameToStylePackId(hallmarkMatch[1]!);
    if (mapped) return mapped;
  }

  if (hasCompleteAestheticDirection(brief)) return null;

  const bucket = inferSubjectBucket(brief);
  const requestedLuminosity = inferRequestedLuminosity(brief);
  const bucketCandidates = BUCKET_PACKS[bucket];
  const compatibleCandidates = requestedLuminosity
    ? bucketCandidates.filter(
        (candidate) =>
          STYLE_PACKS[candidate].luminosity === requestedLuminosity,
      )
    : bucketCandidates;
  const candidates =
    compatibleCandidates.length > 0 ? compatibleCandidates : bucketCandidates;
  const seed = hashBriefSeed(brief);
  return candidates[seed % candidates.length] ?? candidates[0]!;
}

export function getStylePack(id: StylePackId): StylePackWithFonts {
  return {
    ...STYLE_PACKS[id],
    fontPairing: PACK_FONT_PAIRINGS[id],
  };
}

export function formatStylePackPreflight(pack: StylePack): string {
  const { dials, surfaceMap } = pack;
  return `STYLE_PACK: ${pack.id} | DIALS: ${dials.variance}/${dials.motion}/${dials.density} | SURFACE_MAP: canvas=${surfaceMap.canvas}; surface=${surfaceMap.surface}; primary=${surfaceMap.primary}`;
}

function formatPackBlock(pack: StylePack): string {
  const bans = pack.hardBans.map((b) => `\`${b}\``).join(", ");
  const cheat = pack.classCheatSheet.map((line) => `    - ${line}`).join("\n");
  const monoLine = pack.typography.mono
    ? `; mono \`${pack.typography.mono}\``
    : "";
  return [
    `### ${pack.id} (${pack.hallmarkAlias})`,
    `- Aesthetic mode: ${pack.aestheticMode} | Luminosity: ${pack.luminosity} | Dials: ${pack.dials.variance}/${pack.dials.motion}/${pack.dials.density}`,
    `- Design Read template: ${pack.designReadTemplate}`,
    `- Surface map:`,
    `  - canvas: \`${pack.surfaceMap.canvas}\``,
    `  - surface: \`${pack.surfaceMap.surface}\``,
    `  - subdued: \`${pack.surfaceMap.subdued}\``,
    `  - inverse: \`${pack.surfaceMap.inverse}\``,
    `  - primary: \`${pack.surfaceMap.primary}\``,
    `  - muted ink: \`${pack.surfaceMap.mutedInk}\``,
    `  - border: \`${pack.surfaceMap.border}\``,
    `  - overlay: \`${pack.surfaceMap.overlay}\``,
    `- Type: display \`${pack.typography.display}\`; body \`${pack.typography.body}\`${monoLine}`,
    `- Radius: ${pack.radiusLock}`,
    `- Elevation: ${pack.elevationLock}`,
    `- Nav: ${pack.navArchetype}`,
    `- Footer: ${pack.footerArchetype}`,
    `- Signature: ${pack.signatureElement}`,
    `- Motion: ${pack.motionRecipe}`,
    `- Composition scaffold (adapt to subject — do not skip):`,
    pack.compositionScaffold,
    `- Hard bans: ${bans}`,
    `- Class cheat-sheet:`,
    cheat,
  ].join("\n");
}

/**
 * Strong "commit fully to one aesthetic world" directive injected with the active pack.
 */
export function buildStyleCommitmentDirective(
  pack: StylePackWithFonts,
  options?: { navigation?: string; footer?: string },
): string {
  const bans = [...GENERIC_AI_PALETTE_BANS, ...pack.hardBans].join("; ");
  const fonts = pack.fontPairing;

  return dedent`
    **Full-style commitment (mandatory):**
    - STYLE_PACK: ${pack.id} | ${pack.hallmarkAlias} | DIALS: ${pack.dials.variance}/${pack.dials.motion}/${pack.dials.density} | ${pack.luminosity}.
    - Surfaces: canvas=\`${pack.surfaceMap.canvas}\`; surface=\`${pack.surfaceMap.surface}\`; subdued=\`${pack.surfaceMap.subdued}\`; inverse=\`${pack.surfaceMap.inverse}\`; primary=\`${pack.surfaceMap.primary}\`; muted=\`${pack.surfaceMap.mutedInk}\`; overlay=\`${pack.surfaceMap.overlay}\`.
    - Type: load ${fonts.googleFontsUrl}; display=${fonts.display} via \`.${fonts.displayClass}\` with \`${pack.typography.display}\`; body=${fonts.body} via \`.${fonts.bodyClass}\` with \`${pack.typography.body}\`${fonts.monoClass && fonts.mono ? `; data/code=${fonts.mono} via \`.${fonts.monoClass}\`` : ""}.
    - Shape/elevation: ${pack.radiusLock}; ${pack.elevationLock}.
    - Navigation=${options?.navigation ?? pack.navArchetype}; footer=${options?.footer ?? pack.footerArchetype}. Omit either when the resolved scope does not need it.
    - Use complete surface + foreground recipes. Keep one luminosity and palette; never fall back to default Shadcn styling midway.
    - Signature is optional. If needed, adapt this cue to the actual subject: ${pack.signatureElement}.
    - Avoid: ${bans}.
  `;
}

/**
 * Server-resolved directive for the active brief. Inject near the top of
 * codegen prompts so normal builds cannot bury the pack in a long catalog.
 */
export function buildActiveStylePackDirective(
  brief: string,
  options?: {
    forcePack?: StylePackId | null;
    macrostructure?: string;
    navigation?: string;
    footer?: string;
  },
): string {
  const packId =
    options && "forcePack" in options
      ? options.forcePack
      : selectStylePackId(brief);
  if (!packId) {
    return dedent`
      **Active Style Pack directive (user-directed):**
      Honor the user's explicit aesthetic and color direction. Use one coherent
      system, preserve literal Tailwind color families, and avoid generic
      yellow/black CTA, Inter-only type, purple-mesh, and three-card defaults.
    `;
  }

  const pack = getStylePack(packId);
  const classes = pack.classCheatSheet.map((line) => `- ${line}`).join("\n");

  return [
    "**Active Style Pack directive (LOCKED for this build - do not re-route):**",
    buildStyleCommitmentDirective(pack, options),
    "### Conditional composition reference",
    `- Resolved macrostructure: ${options?.macrostructure ?? "infer from the product job"}. Infer the real subject, audience, and job from the authoritative brief; the pack supplies a visual language, not product content or page shape.`,
    `- Motion: ${pack.motionRecipe}`,
    "- Use these cues only when they serve the resolved scope. Preserve the visual system but never force a bento, hero, media effect, nav, or footer into a focused utility, component edit, editorial document, or workbench.",
    "### Ready-to-use class recipes",
    classes,
  ].join("\n");
}

/**
 * Full mandatory contract injected into generation / planning prompts.
 */
export function buildStylePackContract(): string {
  const packBlocks = STYLE_PACK_IDS.map((id) =>
    formatPackBlock(STYLE_PACKS[id]),
  ).join("\n\n");

  return dedent`
    **Unspecified-theme Style Pack contract (mandatory):**
    - Apply this when the user has NOT supplied a complete palette, named color, visual reference, URL moodboard, or aesthetic direction (e.g. brutalist, Linear-style, "make it purple"). A luminosity-only request such as dark theme or light mode still needs a compatible Style Pack to supply the missing palette roles. Explicit user direction always wins over Style Packs. For edits to an existing app, preserve its established theme unless the user asks to restyle or recolor it.
    - Do NOT default every vague brief to anonymous Vercel-gray SaaS. Vague briefs must lock exactly one Style Pack below and build from its literal surface map, font pairing, composition scaffold, and class cheat-sheet. When an Active Style Pack directive is present above, it is authoritative — do not pick a different pack.
    - **Full-style commitment:** once a pack is locked, the ENTIRE app must live inside that aesthetic world — canvas, surfaces, type, radius, nav, footer, motion, and signature element. Partial adoption (gray SaaS base + one accent button) reads as generic AI output and fails review.
    - **Generic AI palette bans (always):** yellow-400/500 primary CTA on black/near-black canvas; Inter/system-ui as the only font; purple mesh hero; three equal icon cards when the scaffold specifies mixed-cell craft.
    - Routing (deterministic, private — never dump the lock into the chat reply):
      1. If explicit aesthetic/color/reference signals beyond luminosity exist (not a Hallmark theme name) → skip packs; honor user + color-fidelity contracts. If the request only specifies dark-first or light-first, retain only packs with that luminosity before deterministic selection.
      2. If the user names a Hallmark theme (Cobalt, Lumen, Brutal, Terminal, Garden, …) → map to the matching Style Pack and commit fully.
      3. Else infer a subject bucket: tools/API/docs/dashboard → tools; AI/creative/voice/music → aiCreative; portfolio/agency/editorial → portfolioEditorial; industrial/ops/infra/telemetry → industrialOps; landing/marketing/agency showcase → landingAgency; consumer/health/onboarding/friendly → consumerFriendly; unknown product → tools.
      4. Hash seed = brief character length + first token + last token. Pick among the bucket's allowed packs by \`seed % pool.length\`.
      5. Privately lock \`STYLE_PACK: <id> | DIALS: V/M/D | SURFACE_MAP: ...\` using the pack's exact classes, then implement from that map. Do not print the preflight line, Design Read, dials, or surface map in the user-facing reply.
    - After locking a pack: reuse its surface-role classes AND font pairing everywhere; do not improvise a second palette or font mid-build. Aesthetic mode in the Design Taste contract must match the pack (brutalist ↔ swissBrutal/terminalPhosphor, minimalist ↔ cobaltMinimal, etc.).
    - Hallmark family names map 1:1 to Style Packs — Cobalt→cobaltMinimal; Lumen→lumenAtmospheric; Specimen→editorialSpecimen; Brutal→swissBrutal; Carnival→kineticAwwwards; Hum→softStructural; Terminal→terminalPhosphor; Garden→gardenBotanical; Midnight/Aurora→midnightCool; Manifesto→manifestoGeometric; Newsprint→newsprintEditorial; Riso→risoPoster. Pick the pack, then keep one luminosity model.
    - Overlay safety: for light-first packs, portalled overlays (\`DialogContent\`, menus, popovers, sheets) use the pack's \`overlay\` classes (typically white/light). For dark-first packs (lumenAtmospheric), overlays use the pack's dark overlay pair. Never let an inherited root \`dark\` class silently break contrast on unthemed portals.
    - Still banned as lazy defaults across all packs: \`slate-*\` corporate chrome, AI-purple gradients, colored glow blooms, rainbow mesh blobs, and cream+brass+oxblood luxury clichés unless the user explicitly asks.
    - Red/amber remain truthful error/warning colors even when the pack accent differs.
    - Before finalizing an unspecified-theme build, verify the preflight Style Pack id appears conceptually in the class system (canvas/surface/primary match the pack) and no conflicting aesthetic mode was mixed in.

    ## Style Pack catalog (lock exactly one when brief is vague)

    ${packBlocks}
  `;
}

export const stylePackContract = buildStylePackContract();

/**
 * Compact runtime policy. The server already injects the one selected pack and
 * its concrete recipe, so repeating the full twelve-pack catalog only dilutes
 * the authoritative brief and wastes context.
 */
export const activeStylePackRuntimeContract = dedent`
  **Runtime Style Pack policy (mandatory):**
  - The Active Style Pack directive near the start of this prompt is server-resolved and authoritative. Do not re-route or choose from the catalog during code generation.
  - A requested luminosity such as “dark theme” or “light theme” is a constraint, not a complete palette. The server-selected pack must match that luminosity while supplying the missing surface, accent, type, and motion roles.
  - A named color, visual reference, supplied media URL, or explicit aesthetic overrides inferred pack styling within its requested scope.
  - Preserve one coherent luminosity and one accent family. Never combine the user's canvas request with an accent copied from an incompatible pack.
  - Generic yellow/black CTAs, purple mesh heroes, Inter-only typography, and three equal feature cards remain banned unless the user explicitly requests them.
`;

export const stylePackPlanningRule =
  "Incomplete-theme Style Pack: when the user provides no complete palette, named color, visual reference, or aesthetic direction, deterministically route to one Style Pack (cobaltMinimal, lumenAtmospheric, editorialSpecimen, swissBrutal, kineticAwwwards, softStructural, terminalPhosphor, gardenBotanical, midnightCool, manifestoGeometric, newsprintEditorial, risoPoster) from the subject bucket + brief-hash seed; treat dark/light requests as luminosity constraints and filter to compatible packs; privately lock dials, literal SURFACE_MAP classes, and font pairing; commit fully to that one aesthetic world; do not default to anonymous Vercel-gray SaaS or yellow/black CTAs; honor complete explicit user aesthetic direction over packs.";

/** @deprecated Use stylePackContract — kept as alias during migration. */
export const unspecifiedThemeStylePackContract = stylePackContract;
