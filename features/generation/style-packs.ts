import dedent from "dedent";

/**
 * Subject-routed Style Packs for vague briefs.
 *
 * Distills taste-skill principles into executable Tailwind v3 class recipes
 * (no arbitrary brackets). Explicit user aesthetic direction always wins.
 */

export const STYLE_PACK_IDS = [
  "cobaltMinimal",
  "lumenAtmospheric",
  "editorialSpecimen",
  "swissBrutal",
  "kineticAwwwards",
  "softStructural",
] as const;

export type StylePackId = (typeof STYLE_PACK_IDS)[number];

export type SubjectBucket =
  | "tools"
  | "aiCreative"
  | "portfolioEditorial"
  | "industrialOps"
  | "landingAgency"
  | "consumerFriendly";

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

export const STYLE_PACKS: Record<StylePackId, StylePack> = {
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
      "Section: py-24 md:py-32",
      "Muted: text-neutral-600",
    ],
  },
};

const BUCKET_PACKS: Record<SubjectBucket, StylePackId[]> = {
  // Prefer cobalt for tools/API/dashboards so normal builds match premium instrument craft.
  tools: ["cobaltMinimal", "cobaltMinimal", "softStructural"],
  aiCreative: ["lumenAtmospheric", "kineticAwwwards", "cobaltMinimal"],
  portfolioEditorial: [
    "editorialSpecimen",
    "kineticAwwwards",
    "softStructural",
  ],
  industrialOps: ["swissBrutal", "swissBrutal", "cobaltMinimal"],
  landingAgency: ["kineticAwwwards", "editorialSpecimen", "softStructural"],
  consumerFriendly: ["softStructural", "cobaltMinimal", "editorialSpecimen"],
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

/** Detect whether the brief already supplies aesthetic direction (skip packs). */
export function hasExplicitAestheticDirection(brief: string): boolean {
  const text = brief.trim();
  if (!text) return false;

  const aestheticSignals =
    /\b(brutalist|minimalist|editorial|glassmorphism|awwwards|kinetic|swiss\s+industrial|tactical\s+crt|neumorphic|retro-futuristic|art deco|linear-style|apple-y|dark\s+mode|light\s+mode|color\s+scheme|brand\s+colors?|visual\s+theme|color\s+theme|theming|make\s+it\s+(purple|blue|green|red|orange|pink|black|white)|like\s+(linear|vercel|stripe|notion|figma|apple))\b/i;

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

  const hexOrReference = /#[0-9a-f]{3,8}\b|https?:\/\/\S+/i.test(text);

  return aestheticSignals.test(text) || namedColor || hexOrReference;
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

/** Deterministic seed from brief length + first/last token. */
export function hashBriefSeed(brief: string): number {
  const trimmed = brief.trim();
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const first = tokens[0] ?? "";
  const last = tokens[tokens.length - 1] ?? "";
  let hash = trimmed.length * 2654435761;
  const material = `${first}|${last}|${trimmed.length}`;
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
  if (hasExplicitAestheticDirection(brief)) return null;

  const bucket = inferSubjectBucket(brief);
  const candidates = BUCKET_PACKS[bucket];
  const seed = hashBriefSeed(brief);
  return candidates[seed % candidates.length] ?? "cobaltMinimal";
}

export function getStylePack(id: StylePackId): StylePack {
  return STYLE_PACKS[id];
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
 * Server-resolved directive for the active brief. Inject near the top of
 * codegen prompts so normal builds cannot bury the pack in a long catalog.
 */
export function buildActiveStylePackDirective(brief: string): string {
  const packId = selectStylePackId(brief);
  if (!packId) {
    return dedent`
      **Active Style Pack directive (this build):**
      - The brief supplies explicit aesthetic, palette, color, or reference direction.
      - Honor that direction with the color-fidelity and Design Taste contracts.
      - Still apply the Premium composition contract: mixed-cell craft, motivated motion, no three-equal-card defaults.
    `;
  }

  const pack = getStylePack(packId);
  const preflight = formatStylePackPreflight(pack);
  const monoRole = pack.typography.mono
    ? `\n    - mono: \`${pack.typography.mono}\``
    : "";
  const cheat = pack.classCheatSheet.map((line) => `- ${line}`).join("\n");

  return [
    "**Active Style Pack directive (LOCKED for this build — do not re-route):**",
    `- ${preflight}`,
    `- Design Read: ${pack.designReadTemplate}`,
    `- Aesthetic mode: ${pack.aestheticMode} | Luminosity: ${pack.luminosity}`,
    "- You MUST implement this pack's SURFACE_MAP classes, signature element, and composition scaffold below. Do not fall back to anonymous gray SaaS or three equal feature cards.",
    "- Apply this pack's SURFACE_MAP and composition scaffold in the code. Do not dump STYLE_PACK / DIALS / SURFACE_MAP lines into the user-facing reply — keep that lock private.",
    "",
    "### Locked surface map",
    `- canvas: \`${pack.surfaceMap.canvas}\``,
    `- surface: \`${pack.surfaceMap.surface}\``,
    `- subdued: \`${pack.surfaceMap.subdued}\``,
    `- inverse: \`${pack.surfaceMap.inverse}\``,
    `- primary: \`${pack.surfaceMap.primary}\``,
    `- muted: \`${pack.surfaceMap.mutedInk}\``,
    `- overlay: \`${pack.surfaceMap.overlay}\``,
    "",
    "### Locked type roles",
    `- display: \`${pack.typography.display}\``,
    `- body: \`${pack.typography.body}\`${monoRole}`,
    "",
    "### Locked composition scaffold",
    pack.compositionScaffold,
    "",
    "### Class cheat-sheet",
    cheat,
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
    - Apply this when the user has NOT explicitly supplied a theme, palette, named color, visual reference, URL moodboard, or aesthetic direction (e.g. brutalist, Linear-style, dark mode, "make it purple"). Explicit user direction always wins over Style Packs. For edits to an existing app, preserve its established theme unless the user asks to restyle or recolor it.
    - Do NOT default every vague brief to anonymous Vercel-gray SaaS. Vague briefs must lock exactly one Style Pack below and build from its literal surface map, composition scaffold, and class cheat-sheet. When an Active Style Pack directive is present above, it is authoritative — do not pick a different pack.
    - Routing (deterministic, private — never dump the lock into the chat reply):
      1. If explicit aesthetic/color/reference signals exist → skip packs; honor user + color-fidelity contracts.
      2. Else infer a subject bucket: tools/API/docs/dashboard → tools; AI/creative/voice/music → aiCreative; portfolio/agency/editorial → portfolioEditorial; industrial/ops/infra/telemetry → industrialOps; landing/marketing/agency showcase → landingAgency; consumer/health/onboarding/friendly → consumerFriendly; unknown product → tools.
      3. Hash seed = brief character length + first token + last token. Pick among the bucket's allowed packs by \`seed % candidates.length\` so consecutive vague apps can vary.
      4. Privately lock \`STYLE_PACK: <id> | DIALS: V/M/D | SURFACE_MAP: ...\` using the pack's exact classes, then implement from that map. Do not print the preflight line, Design Read, dials, or surface map in the user-facing reply.
    - After locking a pack: reuse its surface-role classes everywhere; do not improvise a second palette mid-build. Aesthetic mode in the Design Taste contract must match the pack (brutalist ↔ swissBrutal, minimalist ↔ cobaltMinimal, etc.).
    - Hallmark family names (Specimen, Cobalt, Lumen, Brutal, Hum, Carnival, …) are aliases for these packs — not a competing default. Pick the pack, then keep one luminosity model.
    - Overlay safety: for light-first packs, portalled overlays (\`DialogContent\`, menus, popovers, sheets) use the pack's \`overlay\` classes (typically white/light). For dark-first packs (lumenAtmospheric), overlays use the pack's dark overlay pair. Never let an inherited root \`dark\` class silently break contrast on unthemed portals.
    - Still banned as lazy defaults across all packs: \`slate-*\` corporate chrome, AI-purple gradients, colored glow blooms, rainbow mesh blobs, and cream+brass+oxblood luxury clichés unless the user explicitly asks.
    - Red/amber remain truthful error/warning colors even when the pack accent differs.
    - Before finalizing an unspecified-theme build, verify the preflight Style Pack id appears conceptually in the class system (canvas/surface/primary match the pack) and no conflicting aesthetic mode was mixed in.

    ## Style Pack catalog (lock exactly one when brief is vague)

    ${packBlocks}
  `;
}

export const stylePackContract = buildStylePackContract();

export const stylePackPlanningRule =
  "Unspecified-theme Style Pack: when the user provides no explicit theme, palette, named color, visual reference, or aesthetic direction, deterministically route to one Style Pack (cobaltMinimal, lumenAtmospheric, editorialSpecimen, swissBrutal, kineticAwwwards, softStructural) from the subject bucket + brief-hash seed; privately lock dials and literal SURFACE_MAP classes and apply them in code without dumping STYLE_PACK preflight into the user reply; do not default to anonymous Vercel-gray SaaS; honor explicit user aesthetic direction over packs.";

/** @deprecated Use stylePackContract — kept as alias during migration. */
export const unspecifiedThemeStylePackContract = stylePackContract;
