module.exports=[155748,708327,151994,663903,166836,70754,2820,324219,935874,e=>{"use strict";let t;var a=e.i(302182),o=e.i(252069);let r=["yellow-400/500 primary CTA on black or near-black canvas (the default AI hazard combo)","amber-on-black as the only identity when the locked pack is not lumenAtmospheric","Inter / system-ui / Roboto as the sole voice with no display pairing","purple gradient mesh hero on white or neutral-950","anonymous Vercel-gray neutral SaaS with no pack signature element"],n={cobalt:"cobaltMinimal",cobaltminimal:"cobaltMinimal",lumen:"lumenAtmospheric",lumenatmospheric:"lumenAtmospheric",specimen:"editorialSpecimen",editorial:"editorialSpecimen",editorialspecimen:"editorialSpecimen",brutal:"swissBrutal",swissbrutal:"swissBrutal",carnival:"kineticAwwwards",kinetic:"kineticAwwwards",kineticawwwards:"kineticAwwwards",hum:"softStructural",softstructural:"softStructural",terminal:"terminalPhosphor",terminalphosphor:"terminalPhosphor",garden:"gardenBotanical",gardenbotanical:"gardenBotanical",midnight:"midnightCool",midnightcool:"midnightCool",aurora:"midnightCool",manifesto:"manifestoGeometric",manifestogeometric:"manifestoGeometric",atelier:"editorialSpecimen",newsprint:"newsprintEditorial",newsprinteditorial:"newsprintEditorial",riso:"risoPoster",risoposter:"risoPoster"},i={cobaltMinimal:{id:"cobaltMinimal",hallmarkAlias:"Cobalt / modern-minimal",aestheticMode:"minimalist",luminosity:"light-first",dials:{variance:5,motion:4,density:6},designReadTemplate:"Reading this as: technical product surface for builders, with a Linear-calm utilitarian language, leaning Cobalt modern-minimal.",surfaceMap:{canvas:"bg-neutral-50 text-neutral-950",surface:"bg-white text-neutral-950 border border-neutral-200",subdued:"bg-neutral-100 text-neutral-700 border border-neutral-200",inverse:"bg-neutral-950 text-neutral-50 border border-neutral-800",primary:"bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500",accent:"text-blue-700",mutedInk:"text-neutral-600",border:"border-neutral-200",overlay:"bg-white text-neutral-950 border-neutral-200"},typography:{display:"text-3xl md:text-5xl font-semibold tracking-tight text-neutral-950",body:"text-sm md:text-base text-neutral-600 leading-relaxed",mono:"font-mono text-xs text-neutral-700"},radiusLock:"rounded-md on controls, rounded-lg on panels — never rounded-full cards or pill-heavy chrome",elevationLock:"prefer border + spacing; shadow-sm only on overlays/raised controls",navArchetype:"dense inline-link bar with filled primary action inside max-w-6xl mx-auto px-4",footerArchetype:"compact utility/status bar (version, docs, environment) — not a four-column sitemap",signatureElement:"live code or request/response panel: font-mono text-xs border border-neutral-200 bg-neutral-100 p-4 rounded-lg",motionRecipe:"one staggered whileInView section entrance (opacity + translate-y, ~300ms ease-out); no elastic bounce; respect prefers-reduced-motion",compositionScaffold:`
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
`.trim(),hardBans:["purple gradients","glassmorphism on every surface","pill nav clusters","cream+brass luxury defaults","section-number eyebrows","three equal feature cards"],classCheatSheet:["Root: min-h-screen bg-neutral-50 text-neutral-950","Hairline bento: grid md:grid-cols-12 gap-px bg-neutral-200 border border-neutral-200 rounded-xl overflow-hidden","Cell: bg-white p-8","Mono label: text-xs font-mono uppercase tracking-widest text-neutral-400","Primary CTA: inline-flex items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500","CLI inverse: bg-neutral-950 rounded-md p-3 font-mono text-xs text-neutral-300","Secondary: rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-950 hover:bg-neutral-100"]},lumenAtmospheric:{id:"lumenAtmospheric",hallmarkAlias:"Lumen / atmospheric",aestheticMode:"high-end",luminosity:"dark-first",dials:{variance:7,motion:5,density:4},designReadTemplate:"Reading this as: AI/creative product for makers, with an instrument-grade atmospheric language, leaning Lumen.",surfaceMap:{canvas:"bg-neutral-950 text-neutral-50",surface:"bg-neutral-900 text-neutral-50 border border-neutral-800",subdued:"bg-neutral-900/80 text-neutral-300 border border-neutral-800",inverse:"bg-amber-50 text-neutral-950 border border-amber-100",primary:"bg-amber-500 text-neutral-950 hover:bg-amber-400 focus-visible:ring-2 focus-visible:ring-amber-300",accent:"text-amber-400",mutedInk:"text-neutral-400",border:"border-neutral-800",overlay:"bg-neutral-900 text-neutral-50 border-neutral-800"},typography:{display:"text-3xl md:text-6xl font-semibold tracking-tight lowercase text-neutral-50",body:"text-sm md:text-base text-neutral-400 leading-relaxed",mono:"font-mono text-xs uppercase tracking-wider text-amber-400/90"},radiusLock:"rounded-xl panels, rounded-lg controls — one soft system, no mixed pill+sharp chaos",elevationLock:"hairline borders over heavy shadows; optional subtle backdrop-blur on sticky nav only",navArchetype:"floating pill nav (w-max mx-auto mt-6 rounded-full border border-neutral-800 bg-neutral-950/80 backdrop-blur) OR edge-aligned minimal mark + mono links",footerArchetype:"single statement line + minimal links — no sitemap grid",signatureElement:"engineered apparatus motif: one focal canvas with blueprint-grid support (border-neutral-800 grid lines) and a single warm amber readout",motionRecipe:"measured reveal only (opacity + translate-y); MOTION_INTENSITY mid; no rainbow mesh blobs or purple orbs",compositionScaffold:`
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
`.trim(),hardBans:["AI-purple gradients","neon glow blooms","fake orb hero as the only idea","Inter-only voice","light gray SaaS chrome on dark canvas without contrast pairs","three equal feature cards"],classCheatSheet:["Root: min-h-screen bg-neutral-950 text-neutral-50","Hairline bento: grid md:grid-cols-12 gap-px bg-neutral-800 border border-neutral-800 rounded-xl overflow-hidden","Cell: bg-neutral-900 p-8","Panel: rounded-xl border border-neutral-800 bg-neutral-900 p-6","Primary CTA: rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-amber-400","Secondary CTA: rounded-lg border border-neutral-700 bg-transparent px-5 py-2.5 text-sm font-medium text-neutral-50 hover:bg-neutral-900","Mono callout: font-mono text-xs uppercase tracking-wider text-amber-400","Focus ring: focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"]},editorialSpecimen:{id:"editorialSpecimen",hallmarkAlias:"Specimen / editorial",aestheticMode:"editorial",luminosity:"light-first",dials:{variance:8,motion:4,density:3},designReadTemplate:"Reading this as: portfolio or content-led site for design-conscious visitors, with an editorial specimen language, leaning Specimen.",surfaceMap:{canvas:"bg-stone-50 text-stone-950",surface:"bg-white text-stone-950 border border-stone-200",subdued:"bg-stone-100 text-stone-700 border border-stone-200",inverse:"bg-stone-950 text-stone-50 border border-stone-800",primary:"bg-stone-950 text-stone-50 hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-stone-400",accent:"text-rose-700",mutedInk:"text-stone-600",border:"border-stone-200",overlay:"bg-white text-stone-950 border-stone-200"},typography:{display:"text-4xl md:text-6xl font-semibold tracking-tight text-stone-950 leading-none",body:"text-base text-stone-600 leading-relaxed max-w-prose"},radiusLock:"rounded-none or rounded-sm primary containers; rounded-md buttons only",elevationLock:"hairline borders and print-like rules; almost no shadow",navArchetype:"editorial masthead: mark + sparse links in max-w-6xl mx-auto px-4, asymmetric bias allowed inside centered shell",footerArchetype:"colophon-style dense block (credits, year, sparse links)",signatureElement:"asymmetric type-led opening: oversized headline with hairline rule and one rose accent mark — never centered three-card hero",motionRecipe:"restrained scroll fade-up on sections; no perpetual loops; one intentional entrance",compositionScaffold:`
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
`.trim(),hardBans:["centered hero → three equal cards → CTA","gradient display headlines","Fraunces/Instrument Serif as lazy default","pill badge spam","cream+brass+oxblood cliché stack"],classCheatSheet:["Root: min-h-screen bg-stone-50 text-stone-950","Hairline: border-t border-stone-200","Editorial board: grid md:grid-cols-12 gap-px bg-stone-200 border border-stone-200","Display: text-4xl md:text-6xl font-semibold tracking-tight leading-none text-stone-950","Accent word/mark: text-rose-700","Primary CTA: rounded-md bg-stone-950 px-5 py-2.5 text-sm font-medium text-stone-50 hover:bg-stone-800","Secondary CTA: rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-950 hover:bg-stone-100","Section: py-24 md:py-32"]},swissBrutal:{id:"swissBrutal",hallmarkAlias:"Brutal / Swiss Industrial",aestheticMode:"brutalist",luminosity:"light-first",dials:{variance:7,motion:2,density:7},designReadTemplate:"Reading this as: ops/infra or industrial data surface for operators, with a Swiss Industrial brutalist language, leaning Brutal.",surfaceMap:{canvas:"bg-neutral-100 text-neutral-950",surface:"bg-white text-neutral-950 border-2 border-neutral-950",subdued:"bg-neutral-200 text-neutral-950 border border-neutral-950",inverse:"bg-neutral-950 text-neutral-50 border-2 border-neutral-950",primary:"bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 rounded-none",accent:"text-red-600",mutedInk:"text-neutral-700",border:"border-neutral-950",overlay:"bg-white text-neutral-950 border-2 border-neutral-950"},typography:{display:"text-4xl md:text-7xl font-black uppercase tracking-tighter text-neutral-950 leading-none",body:"text-sm text-neutral-800 leading-snug",mono:"font-mono text-xs uppercase tracking-widest text-neutral-700"},radiusLock:"rounded-none on primary containers and CTAs — mechanical 90° corners only",elevationLock:"no soft shadows; structure via 1–2px solid borders and full-width rules",navArchetype:"edge-aligned dense bar with uppercase mono links and one hazard-red action; max-w-7xl mx-auto px-4",footerArchetype:"compact utility bar with REV / UNIT metadata — not marketing columns",signatureElement:"one bold move only: full-bleed horizontal rule, overlapping macro numeral, or telemetry frame with ASCII brackets — remove other flourishes",motionRecipe:"near-static; at most three intentional primitives; no bounce/elastic; no universal hover choreography",compositionScaffold:`
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
`.trim(),hardBans:["glassmorphism","gradients","soft shadow-md/lg","rounded-2xl cards","purple accents","mixing Swiss light with CRT dark in one screen","three equal feature cards"],classCheatSheet:["Root: min-h-screen bg-neutral-100 text-neutral-950","Panel: bg-white border-2 border-neutral-950 p-4 rounded-none","Rule: w-full border-t-2 border-neutral-950","Primary: inline-flex items-center justify-center bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700 rounded-none","Secondary CTA: inline-flex items-center justify-center border-2 border-neutral-950 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-950 hover:bg-neutral-100 rounded-none","Meta: font-mono text-xs uppercase tracking-widest text-neutral-700","Display: text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none"]},kineticAwwwards:{id:"kineticAwwwards",hallmarkAlias:"Carnival / kinetic (disciplined)",aestheticMode:"kinetic",luminosity:"light-first",dials:{variance:9,motion:8,density:3},designReadTemplate:"Reading this as: creative landing or agency showcase for design-forward visitors, with a kinetic Awwwards language, leaning Carnival-disciplined.",surfaceMap:{canvas:"bg-neutral-50 text-neutral-950",surface:"bg-white text-neutral-950 border border-neutral-200",subdued:"bg-neutral-100 text-neutral-700 border border-neutral-200",inverse:"bg-neutral-950 text-neutral-50 border border-neutral-800",primary:"bg-neutral-950 text-neutral-50 hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400",accent:"text-orange-600",mutedInk:"text-neutral-600",border:"border-neutral-200",overlay:"bg-white text-neutral-950 border-neutral-200"},typography:{display:"text-4xl md:text-7xl font-semibold tracking-tight text-neutral-950 max-w-5xl leading-none",body:"text-base md:text-lg text-neutral-600 leading-relaxed max-w-2xl"},radiusLock:"rounded-2xl for elevated media tiles; rounded-full only for primary CTA pills when justified",elevationLock:"selective hard-offset feel via border + translate on hover; avoid colored glow shadows",navArchetype:"floating glass pill OR minimal split nav inside centered max-w-6xl shell",footerArchetype:"massive high-contrast CTA band + clean sparse links",signatureElement:"AIDA spine with one scroll-craft Desire section (pin OR scrub OR stack — pick one) and gapless bento (N items → N cells, grid-flow-dense)",motionRecipe:"motivated Framer Motion entrance + one scroll paradigm; animate transform/opacity only; respect prefers-reduced-motion; H1 max 2–3 lines in max-w-5xl/max-w-6xl",compositionScaffold:`
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
`.trim(),hardBans:["6-line narrow H1 walls","SECTION 01 / QUESTION 05 meta labels","empty bento holes","stats/trust logos inside hero","purple mesh default","em-dash separators in UI copy"],classCheatSheet:["Main: overflow-x-hidden w-full max-w-full","Hero shell: min-h-screen flex flex-col justify-center px-4 pt-16 md:pt-24","H1: text-4xl md:text-7xl font-semibold tracking-tight max-w-5xl leading-none","Section breath: py-32 md:py-48","Bento: grid grid-cols-1 md:grid-cols-6 gap-4 grid-flow-dense","Tile spans: md:col-span-4 md:row-span-2 | md:col-span-2 | md:col-span-3","Primary CTA: rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-neutral-50","Secondary CTA: rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-950 hover:bg-neutral-100"]},softStructural:{id:"softStructural",hallmarkAlias:"Hum / Soft Structuralism",aestheticMode:"high-end",luminosity:"light-first",dials:{variance:7,motion:5,density:3},designReadTemplate:"Reading this as: consumer or onboarding product for friendly everyday users, with a soft structural language, leaning Hum-adjacent restraint.",surfaceMap:{canvas:"bg-neutral-50 text-neutral-950",surface:"bg-white text-neutral-950 border border-neutral-200/80",subdued:"bg-neutral-100 text-neutral-700 border border-neutral-200",inverse:"bg-neutral-900 text-neutral-50 border border-neutral-800",primary:"bg-teal-700 text-white hover:bg-teal-800 focus-visible:ring-2 focus-visible:ring-teal-500",accent:"text-teal-700",mutedInk:"text-neutral-600",border:"border-neutral-200",overlay:"bg-white text-neutral-950 border-neutral-200"},typography:{display:"text-3xl md:text-5xl font-semibold tracking-tight text-neutral-950",body:"text-base text-neutral-600 leading-relaxed"},radiusLock:"rounded-2xl panels via nested double-surface; rounded-xl inner; rounded-lg buttons — not rounded-full cards",elevationLock:"soft ambient: shadow-sm on truly raised panels; double-bezel (outer p-1 border + inner surface)",navArchetype:"minimal mark + two to three links + primary; centered max-w-6xl mx-auto px-4",footerArchetype:"single statement line with minimal links",signatureElement:"double-bezel elevated panel: outer rounded-2xl border border-neutral-200 bg-neutral-100/80 p-1; inner rounded-xl bg-white p-6",motionRecipe:"gentle fade-up (translate-y + opacity, ~600ms ease-out); button active:scale-95; no elastic defaults",compositionScaffold:`
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
`.trim(),hardBans:["saturated consumer rainbow gradients","emoji-as-icon language","heavy shadow-xl stacks","purple SaaS chrome","fake dense dashboards in marketing mocks","three equal feature cards"],classCheatSheet:["Root: min-h-screen bg-neutral-50 text-neutral-950","Double-bezel outer: rounded-2xl border border-neutral-200 bg-neutral-100 p-1","Double-bezel inner: rounded-xl bg-white p-6 shadow-sm","Primary: rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 active:scale-95","Secondary CTA: rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 hover:bg-neutral-100","Section: py-24 md:py-32","Muted: text-neutral-600"]},terminalPhosphor:{id:"terminalPhosphor",hallmarkAlias:"Terminal / phosphor CRT",aestheticMode:"brutalist",luminosity:"dark-first",dials:{variance:6,motion:3,density:8},designReadTemplate:"Reading this as: developer tool or ops console for power users, with a phosphor terminal language, leaning Terminal.",surfaceMap:{canvas:"bg-neutral-950 text-emerald-400",surface:"bg-neutral-900 text-emerald-300 border border-emerald-900",subdued:"bg-neutral-900/90 text-emerald-400/80 border border-neutral-800",inverse:"bg-emerald-950 text-emerald-100 border border-emerald-800",primary:"bg-emerald-600 text-neutral-950 hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-none font-mono uppercase tracking-wider text-xs",accent:"text-emerald-400",mutedInk:"text-emerald-700",border:"border-emerald-900",overlay:"bg-neutral-900 text-emerald-300 border-emerald-900"},typography:{display:"font-mono text-2xl md:text-4xl font-bold uppercase tracking-tight text-emerald-400",body:"font-mono text-sm text-emerald-500/90 leading-relaxed",mono:"font-mono text-xs uppercase tracking-widest text-emerald-600"},radiusLock:"rounded-none everywhere — CRT scanline aesthetic, no soft corners",elevationLock:"no shadows; structure via 1px phosphor borders and ASCII brackets",navArchetype:"edge-aligned mono bar with bracket labels [ HOME ] [ DOCS ] and one phosphor primary; max-w-7xl mx-auto px-4",footerArchetype:"mono status line: uptime · version · env — no marketing columns",signatureElement:"ASCII-bracket telemetry frame with blinking cursor block and dense mono log rows",motionRecipe:"near-static; optional single opacity blink on cursor; no bounce; respect prefers-reduced-motion",compositionScaffold:`
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
`.trim(),hardBans:["yellow or amber accents","Inter/system-ui sans body","rounded-2xl cards","soft shadows","purple gradients","three equal feature cards"],classCheatSheet:["Root: min-h-screen bg-neutral-950 text-emerald-400 font-mono","Panel: bg-neutral-900 border border-emerald-900 p-4 rounded-none","Primary: bg-emerald-600 text-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none hover:bg-emerald-500","Bracket label: text-xs uppercase tracking-widest text-emerald-600","Log line: text-sm text-emerald-400"]},gardenBotanical:{id:"gardenBotanical",hallmarkAlias:"Garden / botanical craft",aestheticMode:"editorial",luminosity:"light-first",dials:{variance:7,motion:4,density:3},designReadTemplate:"Reading this as: craft/food/wellness product for design-conscious visitors, with a botanical editorial language, leaning Garden.",surfaceMap:{canvas:"bg-stone-100 text-stone-900",surface:"bg-stone-50 text-stone-900 border border-stone-300",subdued:"bg-emerald-50 text-stone-700 border border-emerald-200",inverse:"bg-emerald-900 text-stone-50 border border-emerald-800",primary:"bg-emerald-800 text-stone-50 hover:bg-emerald-900 focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md",accent:"text-emerald-700",mutedInk:"text-stone-600",border:"border-stone-300",overlay:"bg-stone-50 text-stone-900 border-stone-300"},typography:{display:"text-3xl md:text-5xl font-semibold tracking-tight text-stone-900 leading-tight",body:"text-base text-stone-600 leading-relaxed max-w-prose"},radiusLock:"rounded-lg panels, rounded-md controls — organic soft, not pill-heavy",elevationLock:"warm borders over shadows; one subtle shadow-sm on elevated cards only",navArchetype:"editorial mark + sparse links in max-w-6xl mx-auto px-4; leaf-green accent on active link",footerArchetype:"colophon block with season/year and sparse links",signatureElement:"asymmetric botanical board: wide specimen column + narrow meta rail with emerald accent marks",motionRecipe:"gentle fade-up on sections (~400ms ease-out); no elastic; respect prefers-reduced-motion",compositionScaffold:`
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
`.trim(),hardBans:["yellow/black combo","purple gradients","dark-first canvas","Inter-only typography","three equal feature cards","cream+brass luxury cliché"],classCheatSheet:["Root: min-h-screen bg-stone-100 text-stone-900","Surface: bg-stone-50 border border-stone-300 p-6 rounded-lg","Accent: text-emerald-700","Primary: bg-emerald-800 text-stone-50 px-5 py-2.5 rounded-md hover:bg-emerald-900","Section: py-24 md:py-32"]},midnightCool:{id:"midnightCool",hallmarkAlias:"Midnight / Aurora cool atmospheric",aestheticMode:"high-end",luminosity:"dark-first",dials:{variance:7,motion:5,density:4},designReadTemplate:"Reading this as: AI/data product for technical makers, with a cool midnight instrument language, leaning Midnight/Aurora.",surfaceMap:{canvas:"bg-slate-950 text-slate-50",surface:"bg-slate-900 text-slate-50 border border-slate-800",subdued:"bg-slate-900/80 text-slate-400 border border-slate-800",inverse:"bg-cyan-950 text-cyan-50 border border-cyan-800",primary:"bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-300 rounded-lg",accent:"text-cyan-400",mutedInk:"text-slate-400",border:"border-slate-800",overlay:"bg-slate-900 text-slate-50 border-slate-800"},typography:{display:"text-3xl md:text-6xl font-semibold tracking-tight text-slate-50",body:"text-sm md:text-base text-slate-400 leading-relaxed",mono:"font-mono text-xs uppercase tracking-wider text-cyan-400/90"},radiusLock:"rounded-xl panels, rounded-lg controls — one cool soft system",elevationLock:"hairline slate borders; no colored glow blooms",navArchetype:"floating pill nav on slate-950/80 backdrop-blur OR edge-aligned mark + cyan mono links",footerArchetype:"single statement line + minimal links",signatureElement:"cool instrument canvas with cyan readout panel and slate hairline grid — NOT amber/yellow",motionRecipe:"measured opacity + translate-y reveal; no purple orbs; respect prefers-reduced-motion",compositionScaffold:`
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
`.trim(),hardBans:["amber or yellow accents (use cyan/indigo instead)","yellow/black primary CTA","purple mesh orbs","Inter-only voice","light gray SaaS on dark without contrast pairs","three equal feature cards"],classCheatSheet:["Root: min-h-screen bg-slate-950 text-slate-50","Panel: rounded-xl border border-slate-800 bg-slate-900 p-6","Primary: rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400","Mono callout: font-mono text-xs uppercase tracking-wider text-cyan-400","Focus: focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"]},manifestoGeometric:{id:"manifestoGeometric",hallmarkAlias:"Manifesto / geometric poster",aestheticMode:"kinetic",luminosity:"light-first",dials:{variance:9,motion:6,density:5},designReadTemplate:"Reading this as: bold statement landing or studio manifesto for design-forward visitors, with a geometric poster language, leaning Manifesto.",surfaceMap:{canvas:"bg-white text-neutral-950",surface:"bg-neutral-50 text-neutral-950 border-2 border-neutral-950",subdued:"bg-neutral-100 text-neutral-800 border border-neutral-950",inverse:"bg-neutral-950 text-white border-2 border-neutral-950",primary:"bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 rounded-none font-bold uppercase tracking-wide",accent:"text-orange-600",mutedInk:"text-neutral-600",border:"border-neutral-950",overlay:"bg-white text-neutral-950 border-2 border-neutral-950"},typography:{display:"text-4xl md:text-8xl font-black uppercase tracking-tighter text-neutral-950 leading-none",body:"text-base md:text-lg text-neutral-700 leading-snug max-w-xl"},radiusLock:"rounded-none on containers and primary CTAs — poster geometry",elevationLock:"hard 2px ink borders; offset via translate on hover, not soft shadow",navArchetype:"edge-aligned bold mark + uppercase links + orange primary block button",footerArchetype:"massive statement band + sparse links",signatureElement:"oversized geometric headline block with 2px rules and one orange accent stripe",motionRecipe:"one bold entrance (opacity + translate); hover translate on tiles; no bounce",compositionScaffold:`
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
`.trim(),hardBans:["yellow/black combo","rounded-2xl soft cards","purple gradients","Inter/system-ui only","glassmorphism","three equal icon cards"],classCheatSheet:["Root: min-h-screen bg-white text-neutral-950","Rule: border-b-2 border-neutral-950","Display: text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none","Primary: bg-orange-600 text-white px-6 py-3 font-bold uppercase tracking-wide rounded-none hover:bg-orange-700","Panel: border-2 border-neutral-950 p-6 rounded-none"]},newsprintEditorial:{id:"newsprintEditorial",hallmarkAlias:"Newsprint / roman editorial",aestheticMode:"editorial",luminosity:"light-first",dials:{variance:6,motion:3,density:5},designReadTemplate:"Reading this as: publication or content product for readers, with a newsprint editorial language, leaning Newsprint.",surfaceMap:{canvas:"bg-neutral-100 text-neutral-900",surface:"bg-white text-neutral-900 border border-neutral-300",subdued:"bg-neutral-50 text-neutral-700 border border-neutral-200",inverse:"bg-neutral-900 text-neutral-50 border border-neutral-800",primary:"bg-neutral-900 text-neutral-50 hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-500 rounded-sm",accent:"text-red-800",mutedInk:"text-neutral-600",border:"border-neutral-300",overlay:"bg-white text-neutral-900 border-neutral-300"},typography:{display:"text-3xl md:text-5xl font-serif font-normal tracking-normal text-neutral-900 leading-tight",body:"text-base text-neutral-700 leading-relaxed max-w-prose"},radiusLock:"rounded-sm or rounded-none — print-like, minimal radius",elevationLock:"hairline rules and column dividers; almost no shadow",navArchetype:"masthead: centered publication name + date/edition line + sparse section links",footerArchetype:"colophon with edition, credits, sparse links",signatureElement:"multi-column editorial grid with hairline dividers and one red accent dateline",motionRecipe:"restrained fade only; no scroll gimmicks",compositionScaffold:`
Newsprint column grid — serif display, hairline rules, red dateline accent:
\`\`\`tsx
<section className="py-16 px-6 max-w-5xl mx-auto">
  <header className="border-b border-neutral-300 pb-4 mb-8 text-center">
    <p className="text-xs uppercase tracking-widest text-red-800 mb-2">Edition \xb7 Subject</p>
    <h1 className="text-3xl md:text-5xl font-serif text-neutral-900">Headline Here</h1>
  </header>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-neutral-300 pt-8">
    <article className="md:col-span-2 space-y-4">{/* lead column */}</article>
    <aside className="border-l border-neutral-300 pl-8 space-y-4">{/* rail */}</aside>
  </div>
</section>
\`\`\`
`.trim(),hardBans:["yellow/black combo","purple gradients","pill nav","Inter-only sans","dark-first canvas","three equal feature cards"],classCheatSheet:["Root: min-h-screen bg-neutral-100 text-neutral-900","Display: text-3xl md:text-5xl font-serif text-neutral-900","Dateline: text-xs uppercase tracking-widest text-red-800","Rule: border-t border-neutral-300","Primary: bg-neutral-900 text-neutral-50 px-5 py-2 rounded-sm hover:bg-neutral-800"]},risoPoster:{id:"risoPoster",hallmarkAlias:"Riso / poster print",aestheticMode:"kinetic",luminosity:"light-first",dials:{variance:9,motion:5,density:4},designReadTemplate:"Reading this as: creative showcase or cultural product for design-forward visitors, with a risograph poster language, leaning Riso.",surfaceMap:{canvas:"bg-amber-50 text-neutral-950",surface:"bg-white text-neutral-950 border-2 border-neutral-950",subdued:"bg-orange-100 text-neutral-800 border-2 border-neutral-950",inverse:"bg-neutral-950 text-amber-50 border-2 border-neutral-950",primary:"bg-neutral-950 text-amber-50 hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-none font-bold uppercase",accent:"text-orange-700",mutedInk:"text-neutral-700",border:"border-neutral-950",overlay:"bg-white text-neutral-950 border-2 border-neutral-950"},typography:{display:"text-4xl md:text-7xl font-black uppercase tracking-tighter text-neutral-950 leading-none",body:"text-base text-neutral-800 leading-snug"},radiusLock:"rounded-none — risograph print registration, hard edges",elevationLock:"2px ink borders; misregistration feel via overlapping color blocks, not shadows",navArchetype:"bold wordmark + uppercase links + ink primary block",footerArchetype:"poster-style band with bold type + minimal links",signatureElement:"overlapping color-block tiles with 2px ink borders — warm paper, not yellow-on-black",motionRecipe:"one entrance stagger; no elastic; respect prefers-reduced-motion",compositionScaffold:`
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
`.trim(),hardBans:["bg-yellow-400/500 primary CTA on black (generic AI combo)","purple gradients","soft rounded SaaS cards","Inter-only typography","glassmorphism"],classCheatSheet:["Root: min-h-screen bg-amber-50 text-neutral-950","Tile: border-2 border-neutral-950 p-6 rounded-none","Display: text-4xl md:text-7xl font-black uppercase tracking-tighter","Primary: bg-neutral-950 text-amber-50 px-5 py-2.5 font-bold uppercase rounded-none","Accent block: bg-orange-200 border-2 border-neutral-950"]}},s={cobaltMinimal:{display:"Space Grotesk",body:"IBM Plex Sans",mono:"IBM Plex Mono",googleFontsUrl:"https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap",displayClass:"font-display",bodyClass:"font-body",monoClass:"font-mono-ui"},lumenAtmospheric:{display:"Syne",body:"DM Sans",mono:"JetBrains Mono",googleFontsUrl:"https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap",displayClass:"font-display",bodyClass:"font-body",monoClass:"font-mono-ui"},editorialSpecimen:{display:"Libre Baskerville",body:"Source Sans 3",googleFontsUrl:"https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600&display=swap",displayClass:"font-display",bodyClass:"font-body"},swissBrutal:{display:"Archivo Black",body:"Archivo",mono:"IBM Plex Mono",googleFontsUrl:"https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",displayClass:"font-display",bodyClass:"font-body",monoClass:"font-mono-ui"},kineticAwwwards:{display:"Syne",body:"Manrope",googleFontsUrl:"https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=Syne:wght@600;700;800&display=swap",displayClass:"font-display",bodyClass:"font-body"},softStructural:{display:"Plus Jakarta Sans",body:"Nunito Sans",googleFontsUrl:"https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap",displayClass:"font-display",bodyClass:"font-body"},terminalPhosphor:{display:"JetBrains Mono",body:"JetBrains Mono",mono:"JetBrains Mono",googleFontsUrl:"https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap",displayClass:"font-display",bodyClass:"font-body",monoClass:"font-mono-ui"},gardenBotanical:{display:"Bricolage Grotesque",body:"Manrope",googleFontsUrl:"https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Manrope:wght@400;500;600&display=swap",displayClass:"font-display",bodyClass:"font-body"},midnightCool:{display:"Outfit",body:"Inter",mono:"JetBrains Mono",googleFontsUrl:"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@600;700;800&display=swap",displayClass:"font-display",bodyClass:"font-body",monoClass:"font-mono-ui"},manifestoGeometric:{display:"Bebas Neue",body:"Barlow",googleFontsUrl:"https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Bebas+Neue&display=swap",displayClass:"font-display",bodyClass:"font-body"},newsprintEditorial:{display:"Lora",body:"Source Serif 4",googleFontsUrl:"https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Source+Serif+4:wght@400;500;600&display=swap",displayClass:"font-display",bodyClass:"font-body"},risoPoster:{display:"Anton",body:"Rubik",googleFontsUrl:"https://fonts.googleapis.com/css2?family=Anton&family=Rubik:wght@400;500;600&display=swap",displayClass:"font-display",bodyClass:"font-body"}},l={tools:["cobaltMinimal","terminalPhosphor","midnightCool","manifestoGeometric","swissBrutal","newsprintEditorial"],aiCreative:["lumenAtmospheric","midnightCool","kineticAwwwards","terminalPhosphor","risoPoster"],portfolioEditorial:["editorialSpecimen","newsprintEditorial","gardenBotanical","kineticAwwwards","manifestoGeometric"],industrialOps:["swissBrutal","terminalPhosphor","cobaltMinimal","midnightCool"],landingAgency:["kineticAwwwards","manifestoGeometric","risoPoster","editorialSpecimen","midnightCool"],consumerFriendly:["softStructural","gardenBotanical","newsprintEditorial","editorialSpecimen"]},c=/\b(api|sdk|docs?|dashboard|admin|analytics|cli|devtools?|saas|b2b|crm|erp|workflow|kanban|todo|task|project management|spreadsheet|table|settings|console|monitor)\b/i,d=/\b(ai|llm|gpt|agent|chatbot|generative|diffusion|voice|music|audio|creative tool|prompt|model)\b/i,m=/\b(portfolio|agency|studio|case study|editorial|blog|magazine|newsletter|storytelling|photographer|designer)\b/i,u=/\b(industrial|ops|infra|infrastructure|telemetry|logistics|factory|warehouse|fleet|scada|brutalis|military|aerospace)\b/i,p=/\b(landing|marketing|homepage|awwwards|campaign|launch|waitlist|saas landing)\b/i,h=/\b(consumer|onboarding|health|wellness|fitness|local|booking|recipe|habit|kids?|family|friendly)\b/i,g=/\b(?:dark(?:[-\s]+(?:mode|theme|themed|palette|canvas|ui|interface|site|page))|(?:mode|theme|palette|canvas|ui|interface|site|page)\s+(?:is\s+)?dark|near[-\s]+black)\b/i,f=/\b(?:light(?:[-\s]+(?:mode|theme|themed|palette|canvas|ui|interface|site|page))|(?:mode|theme|palette|canvas|ui|interface|site|page)\s+(?:is\s+)?light)\b/i;function b(e){let t=g.test(e);return t===f.test(e)?null:t?"dark-first":"light-first"}function y(e){let t=e.trim();if(!t)return!1;let a=/\b(purple|violet|indigo|fuchsia|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange|red|rose|pink|stone|zinc|neutral|gray|grey|slate|black|white)\b/i.test(t)&&(/\b(bg-|text-|colour(?:ed)?|colored|palette|accent|primary\s+color|make\s+(?:it|the|this|an?)\s+|use\s+|with\s+a\s+)\b/i.test(t)||/\bmake\s+(?:a|an|the)\s+\w*\s*(purple|violet|indigo|fuchsia|blue|teal|green|red|orange|pink|black|white)\b/i.test(t)||/\b(purple|violet|indigo|fuchsia|blue|teal|green|red|orange|pink)\s+(app|ui|site|page|dashboard|theme|palette|accent)\b/i.test(t));return/\b(brutalist|minimalist|editorial|glassmorphism|awwwards|kinetic|swiss\s+industrial|tactical\s+crt|neumorphic|retro-futuristic|art deco|linear-style|apple-y|color\s+scheme|brand\s+colors?|visual\s+theme|color\s+theme|theming|make\s+it\s+(purple|blue|green|red|orange|pink|black|white)|like\s+(linear|vercel|stripe|notion|figma|apple))\b/i.test(t)||a||/#[0-9a-f]{3,8}\b|https?:\/\/\S+/i.test(t)}function v(e){let t=e.trim(),a=t.split(/\s+/).filter(Boolean),o=a[0]??"",r=a[a.length-1]??"",n=0x9e3779b1*t.length,i=`${o}|${r}|${t}`;for(let e=0;e<i.length;e++)n=Math.imul(n^i.charCodeAt(e),0x1000193);return Math.abs(n)}function w(e,t){let a;if(t?.forcePack)return t.forcePack;let o=e.trim().match(/\b(cobalt|lumen|specimen|brutal|hum|carnival|terminal|garden|midnight|aurora|manifesto|atelier|newsprint|riso)\b/i);if(o){let e=n[o[1].trim().toLowerCase().replace(/[\s/_-]+/g,"")]??null;if(e)return e}if(y(e))return null;let r=(a=e.trim(),u.test(a)?"industrialOps":d.test(a)?"aiCreative":m.test(a)?"portfolioEditorial":p.test(a)?"landingAgency":h.test(a)?"consumerFriendly":(c.test(a),"tools")),s=b(e),g=l[r],f=s?g.filter(e=>i[e].luminosity===s):g,w=f.length>0?f:g;return w[v(e)%w.length]??w[0]}function x(e,t){let o,n,l=t&&"forcePack"in t?t.forcePack:w(e);if(!l)return a.default`
      **Active Style Pack directive (user-directed):**
      Honor the user's explicit aesthetic and color direction. Use one coherent
      system, preserve literal Tailwind color families, and avoid generic
      yellow/black CTA, Inter-only type, purple-mesh, and three-card defaults.
    `;let c={...i[l],fontPairing:s[l]},d=c.classCheatSheet.map(e=>`- ${e}`).join("\n");return["**Active Style Pack directive (LOCKED for this build - do not re-route):**",(o=[...r,...c.hardBans].join("; "),n=c.fontPairing,a.default`
    **Full-style commitment (mandatory):**
    - STYLE_PACK: ${c.id} | ${c.hallmarkAlias} | DIALS: ${c.dials.variance}/${c.dials.motion}/${c.dials.density} | ${c.luminosity}.
    - Surfaces: canvas=\`${c.surfaceMap.canvas}\`; surface=\`${c.surfaceMap.surface}\`; subdued=\`${c.surfaceMap.subdued}\`; inverse=\`${c.surfaceMap.inverse}\`; primary=\`${c.surfaceMap.primary}\`; muted=\`${c.surfaceMap.mutedInk}\`; overlay=\`${c.surfaceMap.overlay}\`.
    - Type: load ${n.googleFontsUrl}; display=${n.display} via \`.${n.displayClass}\` with \`${c.typography.display}\`; body=${n.body} via \`.${n.bodyClass}\` with \`${c.typography.body}\`${n.monoClass&&n.mono?`; data/code=${n.mono} via \`.${n.monoClass}\``:""}.
    - Shape/elevation: ${c.radiusLock}; ${c.elevationLock}.
    - Navigation=${t?.navigation??c.navArchetype}; footer=${t?.footer??c.footerArchetype}. Omit either when the resolved scope does not need it.
    - Use complete surface + foreground recipes. Keep one luminosity and palette; never fall back to default Shadcn styling midway.
    - Signature is optional. If needed, adapt this cue to the actual subject: ${c.signatureElement}.
    - Avoid: ${o}.
  `),"### Conditional composition reference",`- Resolved macrostructure: ${t?.macrostructure??"infer from the product job"}. Infer the real subject, audience, and job from the authoritative brief; the pack supplies a visual language, not product content or page shape.`,`- Motion: ${c.motionRecipe}`,"- Use these cues only when they serve the resolved scope. Preserve the visual system but never force a bento, hero, media effect, nav, or footer into a focused utility, component edit, editorial document, or workbench.\n### Ready-to-use class recipes",d].join("\n")}let k=(t=["cobaltMinimal","lumenAtmospheric","editorialSpecimen","swissBrutal","kineticAwwwards","softStructural","terminalPhosphor","gardenBotanical","midnightCool","manifestoGeometric","newsprintEditorial","risoPoster"].map(e=>{var t;let a,o,r;return a=(t=i[e]).hardBans.map(e=>`\`${e}\``).join(", "),o=t.classCheatSheet.map(e=>`    - ${e}`).join("\n"),r=t.typography.mono?`; mono \`${t.typography.mono}\``:"",[`### ${t.id} (${t.hallmarkAlias})`,`- Aesthetic mode: ${t.aestheticMode} | Luminosity: ${t.luminosity} | Dials: ${t.dials.variance}/${t.dials.motion}/${t.dials.density}`,`- Design Read template: ${t.designReadTemplate}`,"- Surface map:",`  - canvas: \`${t.surfaceMap.canvas}\``,`  - surface: \`${t.surfaceMap.surface}\``,`  - subdued: \`${t.surfaceMap.subdued}\``,`  - inverse: \`${t.surfaceMap.inverse}\``,`  - primary: \`${t.surfaceMap.primary}\``,`  - muted ink: \`${t.surfaceMap.mutedInk}\``,`  - border: \`${t.surfaceMap.border}\``,`  - overlay: \`${t.surfaceMap.overlay}\``,`- Type: display \`${t.typography.display}\`; body \`${t.typography.body}\`${r}`,`- Radius: ${t.radiusLock}`,`- Elevation: ${t.elevationLock}`,`- Nav: ${t.navArchetype}`,`- Footer: ${t.footerArchetype}`,`- Signature: ${t.signatureElement}`,`- Motion: ${t.motionRecipe}`,"- Composition scaffold (adapt to subject — do not skip):",t.compositionScaffold,`- Hard bans: ${a}`,"- Class cheat-sheet:",o].join("\n")}).join("\n\n"),a.default`
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

    ${t}
  `),S=a.default`
  **Runtime Style Pack policy (mandatory):**
  - The Active Style Pack directive near the start of this prompt is server-resolved and authoritative. Do not re-route or choose from the catalog during code generation.
  - A requested luminosity such as “dark theme” or “light theme” is a constraint, not a complete palette. The server-selected pack must match that luminosity while supplying the missing surface, accent, type, and motion roles.
  - A named color, visual reference, supplied media URL, or explicit aesthetic overrides inferred pack styling within its requested scope.
  - Preserve one coherent luminosity and one accent family. Never combine the user's canvas request with an accent copied from an incompatible pack.
  - Generic yellow/black CTAs, purple mesh heroes, Inter-only typography, and three equal feature cards remain banned unless the user explicitly requests them.
`,A="Incomplete-theme Style Pack: when the user provides no complete palette, named color, visual reference, or aesthetic direction, deterministically route to one Style Pack (cobaltMinimal, lumenAtmospheric, editorialSpecimen, swissBrutal, kineticAwwwards, softStructural, terminalPhosphor, gardenBotanical, midnightCool, manifestoGeometric, newsprintEditorial, risoPoster) from the subject bucket + brief-hash seed; treat dark/light requests as luminosity constraints and filter to compatible packs; privately lock dials, literal SURFACE_MAP classes, and font pairing; commit fully to that one aesthetic world; do not default to anonymous Vercel-gray SaaS or yellow/black CTAs; honor complete explicit user aesthetic direction over packs.";e.s(["activeStylePackRuntimeContract",0,S,"buildActiveStylePackDirective",0,x,"hasCompleteAestheticDirection",0,y,"hashBriefSeed",0,v,"inferRequestedLuminosity",0,b,"selectStylePackId",0,w,"stylePackContract",0,k,"stylePackPlanningRule",0,A],708327);let C=a.default`
  **Premium composition contract (mandatory for distinctive product UI):**

  Enhanced-quality builds win because structure serves the product job, not because every app repeats one fashionable module.

  ### Hard composition rules
  - First obey the resolved scope and macrostructure. Component edits preserve their surrounding page. Workbenches use workflow regions, toolbar, canvas, and contextual panels. Focused utilities center the single task. Editorial surfaces use document rhythm. Marketing pages use the selected Hallmark macrostructure.
  - A **hairline bento** is conditional: use it only for six or more dense, comparable modules or multiple valid entry paths. Never add a board merely to demonstrate premium craft.
  - When Bento is selected, use deliberate unequal spans and mix real cell jobs such as live data, a comparable readout, concise capability copy, or a truthful command surface. Do not use three equal \`icon + h3 + paragraph\` cards as a substitute.
  - Instrument labels: \`text-xs font-mono uppercase tracking-widest\` + muted ink + small allowlisted Lucide icon (\`h-4 w-4\`). Use these sparingly as cell headers — not as section-number eyebrows.
  - Section rhythm: marketing/content sections use \`py-24\` / \`py-32 md:py-48\`; product boards sit in \`max-w-7xl mx-auto px-6\`.
  - Motion is optional. When a multi-cell board genuinely benefits from ordered reveal, Framer Motion stagger may animate opacity + transform only. Respect \`prefers-reduced-motion\`; do not add motion solely to satisfy a checklist.
  - CLI / inverse panels are real product surfaces (\`bg-neutral-950 text-neutral-300 font-mono text-xs rounded-md p-3\`), not fake macOS window chrome with traffic lights.
  - Use standard type sizes only: \`text-xs\`, \`text-sm\`, \`text-base\`, \`text-lg\`, \`text-3xl\`, \`text-5xl\`, \`text-7xl\` — never \`text-[13px]\` or other arbitrary brackets. Prefer \`neutral-*\` / pack families over \`slate-*\` unless the user asked for slate.
  - Status colors stay semantic: emerald for success/HIT, amber for warn/MISS, red for error — never rainbow decoration.

  ### Preflight (fail any → revise)
  - Does the primary structure match the resolved scope and user job?
  - If a board exists, are its modules genuinely comparable and its spans deliberate?
  - Is every motion primitive informative, optional under reduced motion, and owned by one interaction?
  - Did you avoid three equal icon cards?
  - Are all classes standard Tailwind (no arbitrary brackets)?
`,T="Premium composition: select structure from the product job first; use workflow regions for workbenches, a focused surface for single-task utilities, document rhythm for editorial work, and a mixed-cell Bento only for six or more dense comparable modules. Never add Bento or motion merely to demonstrate craft.";e.s(["premiumCompositionContract",0,C,"premiumCompositionPlanningRule",0,T],151994);let I=["philosophy","hierarchy","execution","specificity","restraint","variety"],N=["editorial","modern-minimal","atmospheric","playful"],P=["Marquee Hero","Bento Grid","Workbench","Long Document","Stat-Led","Quote-Led","Manifesto","Catalogue","Letter","Split Scroll","Poster Stack","Timeline","Comparison Table","Pricing Ledger","FAQ Conversational","Gallery Masonry","Media Mask Hero","Terminal Shell","Side-Rail App","Editorial Masthead","Horizontal Pan"],D={designVariance:8,motionIntensity:6,visualDensity:4},M=["No em-dash or en-dash separators in visible UI copy.","No fabricated metrics, testimonials, customer logos, or awards.","No div-based fake browser, phone, terminal, or IDE chrome.","No AI-purple mesh hero, yellow/black hazard CTA combo, or Inter-only typography unless explicitly requested.","No centered hero → three equal feature cards → CTA template when building original designs.","Headings and display type stay roman — never italic headlines.","At most one horizontal marquee per page.","Duplicate CTA intent ban: one label per action across nav, hero, and footer."],R=["Style Pack rotation and macrostructure diversification","Structural diversity 'vary from last app' when it conflicts with the reference","Premium-consumer palette rotation when the reference uses a different palette"];var B=e.i(222378);function E(e){return"string"==typeof e?e:e.filter(e=>"text"===e.type).map(e=>e.text).join("\n")}function L(e){return"string"==typeof e?e.length:e.reduce((e,t)=>"text"===t.type?e+t.text.length:e+12e3,0)}let $=3*e.i(353671).DEFAULT_ESTIMATED_INPUT_TOKENS;e.s(["PARTIAL_TEXT_SNAPSHOT_INTERVAL_CHARS",0,4096,"appendTextToMessageContent",0,function(e,t){if("string"==typeof e)return`${e}${t}`;let a=[...e],o=a.findLastIndex(e=>"text"===e.type);if(-1===o)return[{type:"text",text:t.trimStart()},...a];let r=a[o];return r?.type==="text"&&(a[o]={type:"text",text:r.text+t}),a},"clampMessagesToBillingBudget",0,function(e){if(e.reduce((e,t)=>e+L(t.content),0)<=$)return e;let t=e.find(e=>"system"===e.role),a=e.filter(e=>e!==t),o=[],r=Math.max(0,$-(t?L(t.content):0));for(let e=a.length-1;e>=0;e-=1){let t=a[e];if(r<=0)break;let n=L(t.content);if(n<=r){o.unshift(t),r-=n;continue}"string"==typeof t.content?o.unshift({...t,content:`[Earlier context truncated]
${t.content.slice(-r)}`}):o.unshift(t),r=0}return t?[t,...o]:o},"getMessageTextContent",0,E,"optimizeMessagesForTokens",0,function(e){let t=[];for(let a=e.length-1;a>=0&&t.length<2;a--)"assistant"===e[a].role&&t.push(a);return e.map((e,a)=>{if("assistant"===e.role&&!t.includes(a)){if("string"!=typeof e.content)return e;let t=e.content.replace(/```[\s\S]*?```/g,"").trim();return{...e,content:t||"[code omitted]"}}return e})},"toModelMessages",0,function(e){return e.map(e=>"user"===e.role?"string"==typeof e.content?{role:"user",content:e.content}:{role:"user",content:e.content.map(e=>"text"===e.type?{type:"text",text:e.text}:{type:"image",image:e.image})}:"assistant"===e.role?{role:"assistant",content:E(e.content)}:{role:"system",content:E(e.content)})}],663903);let q=/\b(inspired by|similar vibe|like this but|don't copy|do not copy|not a pixel|reference only|use as inspiration|same energy|match the vibe)\b/i,U=/\b(clone|recreate|replicate|copy|match this|build this|build it like|same as|pixel.?perfect|from (this|the) (screenshot|image|design|site|page|url)|make (this|it) (look|work) like)\b/i;function j(){var e;let t,o;return a.default`
    **Screenshot clone contract (FIDELITY MODE — overrides Style Pack rotation):**

    ${t=(e={mode:"screenshot-clone"}).dials??D,o="screenshot-clone"===e.mode?"Mode: screenshot-clone — fidelity to extracted DNA overrides Style Pack rotation and structural diversification.":"screenshot-inspiration"===e.mode?"Mode: screenshot-inspiration — extract vibe and hierarchy; Style Pack may still apply for original composition.":"Mode: original — lock one Style Pack or explicit user direction; diversify macrostructure/nav/footer across session builds.",a.default`
    **Design intelligence (Hallmark + design-taste distillation):**
    - ${o}
    - Genre vocabulary: ${N.join(" · ")}.
    - Macrostructure vocabulary: ${P.slice(0,8).join(" · ")} … (${P.length} total).
    - Taste dials (lock once): DESIGN_VARIANCE=${t.designVariance}, MOTION_INTENSITY=${t.motionIntensity}, VISUAL_DENSITY=${t.visualDensity}.
    - Pre-emit critique axes (1–5 each, revise if <3): ${I.join(", ")}.
    - Universal anti-slop: ${M.slice(0,4).join(" ")}
  `}

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
    ${R.map(e=>`- ${e}`).join("\n")}

    ### Still mandatory
    ${M.map(e=>`- ${e}`).join("\n")}
    - WCAG contrast: if the reference pair fails contrast, adjust shade within the same hue family — do not re-theme.
    - Stamp the root stylesheet comment: \`/* Hallmark · studied: yes · mode: screenshot-clone · fidelity: reference */\`

    ### Implementation stack
    - React + Tailwind v3 literal utilities (no arbitrary bracket values).
    - Lucide icons only when the reference shows icons; match approximate size and stroke weight.
    - Placeholder blocks for photos you cannot fetch: dashed border + neutral fill matching reference aspect ratio.
    - Do not wrap the UI in fake browser or device chrome — render the page content directly.
  `}a.default`
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
`;let F=new Set([B.FREE_MODEL,"deepseek/deepseek-v4-flash"]);e.s(["attachScreenshotToUserMessage",0,function(e,t,o){var r;let n;return{role:"user",content:(r=E(e.content),[{type:"text",text:(n=r.trim(),o.fidelityLocked?a.default`
      The reference screenshot is attached to this message. Recreate that UI as closely as possible in React + Tailwind v3. Match layout grid, colors, typography scale, spacing rhythm, nav/footer structure, and every visible word of copy exactly.

      User request:
      ${n||"Recreate the attached screenshot."}
    `:a.default`
    A reference screenshot is attached for visual hierarchy, color, and composition cues. Follow the user request below — compose originally unless they explicitly asked to clone or match the screenshot.

    User request:
    ${n||"Build from the attached reference."}
  `)},{type:"image",image:t}])}},"buildScreenshotCloneCodegenDirective",0,j,"detectScreenshotCloneIntent",0,function(e,t){if(!t.hasScreenshot)return{mode:"none",fidelityLocked:!1};let a=e.trim();return q.test(a)?{mode:"inspiration",fidelityLocked:!1}:(t.websiteReferenceRequired||U.test(a)||a.length,{mode:"clone",fidelityLocked:!0})},"resolveVisionCapableCodingModel",0,function(e){return F.has(e)?B.DEFAULT_MODEL:e}],166836);let O=a.default`
  **Explicit color fidelity contract (mandatory):**
  - A color named by the user is a hard visual requirement, not loose inspiration. Preserve the exact Tailwind family: \`purple\` stays \`purple\`, not violet, indigo, fuchsia, white, or gray.
  - Match the requested scope. “Make the app purple” changes the root canvas and principal surfaces into a coherent set of purple shades; “make this button purple” changes that control. Never reduce a whole-app color request to a tiny accent.
  - Use complete, literal, static Tailwind v3 utilities in emitted source, such as \`bg-purple-950 text-purple-50 border-purple-800 hover:bg-purple-900 focus-visible:ring-purple-400\` or \`bg-purple-100 text-purple-950\`. The examples illustrate valid class form; choose shades that fit the requested tone and contrast needs.
  - Never construct Tailwind class names with interpolation, concatenation, partial fragments, or runtime data (for example, never use \`bg-\${color}-500\`). Tailwind cannot reliably discover those classes. If variants are data-driven, map each variant to complete literal class strings.
  - Semantic classes such as \`bg-background\` and \`bg-primary\` are allowed when the user did not name a concrete color, or when the generated output explicitly defines those tokens to the requested hue. Otherwise use literal palette utilities so the requested color is guaranteed to render.
  - Keep foreground, border, hover, active, focus-visible, selected, and disabled colors in a deliberate compatible scale. If contrast fails, adjust the shade within the requested family; do not replace the requested colored surface with white or gray.
  - On edits, replace conflicting legacy \`bg-*\`, \`text-*\`, \`border-*\`, gradient, and dark-mode color classes in the requested scope. Do not append competing utilities and rely on class order to decide which color wins.
  - Before finalizing, inspect the emitted files and verify that the requested literal color family appears on the intended elements, no later class overrides it, and the visible result still satisfies the contrast contract.
`,H="Explicit color fidelity: when the user names a color, record the exact standard Tailwind family and whether it is the canvas, surface, primary, or accent role. Preserve that family in implementation; do not substitute a neighboring hue, a semantic token with an unknown value, or a white/gray fallback.",G=a.default`
  **Visual system coherence contract (mandatory):**
  - Before writing JSX, lock a compact surface-role map and reuse it everywhere. When a Style Pack is locked, use that pack's literal canvas/surface/subdued/inverse/primary/overlay classes — do not invent a parallel map. When the user supplied an explicit theme, derive an equivalent role map from their direction. Do not improvise new surface/foreground pairs component by component.
  - Choose one luminosity model for the screen (from the locked Style Pack or explicit user direction). Do not create visual drama by dropping a collection of near-black cards into an otherwise light app shell (or the inverse for dark-first packs). An inverse surface is an exception reserved for at most one genuinely focal region or primary action area on a screen; it is not the default treatment for metric cards, tables, charts, side panels, or every content section.
  - Every surface-setting wrapper must set its own foreground, and every nested override must remain compatible. Dark neutral surfaces use \`text-neutral-50\`/\`text-neutral-100\` for primary content and \`text-neutral-300\`/\`text-neutral-400\` for secondary content; light surfaces use \`text-neutral-950\`/\`text-neutral-900\` and \`text-neutral-600\`/\`text-neutral-700\`. Never place \`text-neutral-950\`, \`text-neutral-900\`, or low-opacity black on \`bg-neutral-950\`/\`bg-neutral-900\`; never place white or very pale text on white/neutral-50. Do not use opacity as a substitute for choosing a readable foreground.
  - Build hierarchy with composition before color. Give the screen one dominant work area, then group supporting information with spacing, alignment, dividers, and typography. Do not render a uniform army of same-sized, same-colored cards. Dashboard metrics should normally sit on light surfaces or in one grouped summary band; charts, activity rows, and support content should not all receive the same heavy container treatment.
  - Make information hierarchy readable at a glance: primary values and task titles receive the strongest contrast, supporting labels remain comfortably legible, and metadata recedes without becoming faint. Reserve uppercase plus wide tracking for short tertiary labels only; never use it for essential instructions or as the only distinction between every dashboard section. Use tabular numerals for aligned quantitative data when available.
  - Validate structure at 320, 375, 414, and 768px so the core task lane remains primary, secondary content reflows cleanly, and no clickable action is forced onto two lines.
  - A monochrome or pack foundation is not a lifeless interface. Prefer the locked Style Pack's primary/accent roles; if the user named a color, honor that family instead. Keep status colors semantic, and never use weak gray text on the accent.
  - Data visualization inherits the screen's luminosity model. Explicitly style every chart title, value, axis label, tick, grid line, legend, tooltip, annotation, and empty/loading state for its actual background; never rely on a chart library's default or inherited text color. Use the accent for the primary series, quieter neutrals for scaffolding, and ensure the data—not the container—is the highest-contrast element.
  - Use elevation sparingly: prefer a one-pixel border and spacing for ordinary grouping, \`shadow-sm\` for truly raised controls or overlays, and no large shadow on every panel. Radius, border, shadow, and padding choices must communicate hierarchy instead of repeating one generic card recipe.
  - Hover and active states must stay coherent with the resting treatment. Prefer design-owned hover recipes (matching bg + text, or bg-only when resting text should persist). Do not inject gray \`hover:text-*\` / \`hover:bg-gray-*\` fallbacks onto branded secondary CTAs, outline/ghost nav Login controls, or other custom-colored actions.
  - **Secondary / outline CTAs (hard fail if violated):** every button that sets its own background (including Shadcn \`variant="outline"\` / \`variant="secondary"\` / any bordered ghost that paints \`bg-*\`) must also set an explicit matching \`text-*\` for that same resting surface. Never rely on a parent hero's \`text-white\` / \`text-neutral-50\` inheritance once the control has a light \`bg-background\`/\`bg-white\` — that produces invisible white-on-white labels on the second hero CTA. Prefer complete Style Pack Secondary CTA recipes (paired border + bg + text), or native \`<a>\`/\`<button>\` with full custom classes, over bare \`<Button variant="outline">\` when the hero luminosity differs from the page canvas.
  - **Theme-aware components:** every interactive control, surface, and text role must remain legible in the active luminosity model and, when a theme toggle exists, in both light and dark via complete \`dark:\` pairs or semantic tokens (\`bg-background\`/\`text-foreground\`, \`bg-card\`/\`text-card-foreground\`, \`bg-primary\`/\`text-primary-foreground\`, \`bg-secondary\`/\`text-secondary-foreground\`, \`bg-muted\`/\`text-muted-foreground\`, \`border-border\`). Do not hard-code only light or only dark ink on shared chrome (nav, hero CTAs, forms, dialogs, toasts, charts).
  - Before emitting files, run a surface audit: list each unique \`bg-*\` role used by a major region, identify its direct foreground and muted foreground, and fix any unpaired, mixed-luminosity, duplicate-emphasis, or low-contrast combination. If the screen still looks like disconnected light and dark themes stitched together, revise the whole role map rather than patching one text class.
`,z="Visual-system coherence: define a compact surface-role map with explicit foregrounds, choose one screen-wide luminosity model, allow at most one focal inverse region, name one optional subject-derived accent and its jobs, describe hierarchy without a uniform card grid, specify explicit chart axis/grid/tooltip/legend colors whenever data visualization is present, and lock primary + secondary CTA bg/text pairs so outline/secondary buttons never inherit invisible ink from a dark hero.";a.default`
  **Typography fidelity contract (mandatory):**
  - Lock exactly one display role and one body role before writing any component, then reuse those two font treatments for every heading and every paragraph in the app. Add a third utility role only when data, code, or captions genuinely need a distinct monospace/tabular treatment — never as decoration.
  - Never reference a font family that is not actually imported/installed in the generated app. If a specific characterful face cannot be confirmed available, build character through scale, weight, tracking, and case on a real, available face rather than naming an aspirational font that will silently fall back.
  - Avoid leaning on Inter, Roboto, Arial, system-ui, Open Sans, or Poppins as the page's only voice. If a system/default sans is the body face, pair it with a display face that carries genuine character so the page doesn't read as generic SaaS defaults.
  - Headings and display type are always roman — never italicized, and never with a single italic emphasis word inside an otherwise upright heading. Reserve italics, if used at all, for inline emphasis inside running body copy.
  - Build hierarchy with explicit levels (primary headings, secondary labels, supporting microcopy) and clear reading rhythm before tweaking color. Avoid typographic effects that do not increase meaning.
  - Once a size/weight/tracking combination is chosen for a heading level (h1, h2, card title, label, etc.), reuse that exact combination for every instance of that level. Do not vary heading treatment ad hoc from section to section.
  - On edits, replace conflicting legacy font-family, font-weight, and tracking utilities in the requested scope rather than layering new type classes on top of old ones.
`;let V="Typography fidelity: lock exactly one display role and one body role for the whole app before writing components; add a third utility role only if data/captions require it, never introduce it as decoration, and never italicize headings.";a.default`
  **Structural diversity contract (mandatory):**
  - Treat navigation and footer as structural decisions tied to the information architecture, not filler chrome to fill out a template. Before building either, silently pick and justify an archetype against the subject:
    - Nav options: minimal two-item mark (only when there truly are ~2 destinations), dense inline-link bar with a filled primary action, floating pill/chip nav, side-rail nav, a visible search/command trigger for search- or docs-heavy products, an editorial masthead, an edge-aligned nav, an announcement-banner-plus-retracting-nav pairing, or a nav folded directly into a workbench/toolbar for tool-shaped products that have no separate marketing chrome at all.
    - Footer options: a single statement line with minimal links and no sitemap, a compact utility/status bar (version, links, environment) for tools and dashboards, a colophon-style dense block for editorial or documentation contexts, a multi-column index only when the product is genuinely a docs root or hub with that many real destinations, or no separate footer when the product is a full-height application shell where a footer would just push content off-screen.
  - For every nav archetype, define one centered chrome shell first: a predictable max-width container (usually \`max-w-6xl\` to \`max-w-7xl\`) with \`mx-auto\` and symmetric horizontal padding, then place the nav inside it. Centering is the default baseline even when links are left- or right-biased.
  - Before finalizing any nav, privately lock the shell plan (selected max-width, horizontal padding, mobile collapse behavior at 320/375/414/768, and whether links are centered, edge-biased, or split inside that shell). Do not dump that preflight prose into the user-facing reply.
  - Mobile behavior must preserve centered structure, not drift: at 320, 375, 414, and 768px collapse dense navs into safe touch-size layouts, stack when needed, and keep the shell centered with equal side gutters.
  - Default away from "wordmark-left + three or four generic links + button-right" nav and "four-column link grid + social row + tiny copyright" footer. These are the most recognizable templated patterns; reach for them only when the brief's actual information architecture has that many top-level destinations to justify them.
  - Within a single build session, do not repeat the same page archetype, nav treatment, and dominant accent hue as the immediately preceding app generated in this conversation, unless the user is iterating on that same app or explicitly asks to match it. Vary at least one of those three axes so consecutive apps read as distinct products, not reskins of one template.
  - Confirm mobile nav/footer density at 320, 375, 414, and 768px so navigation and legal/support links do not crowd or disappear while preserving core task accessibility.
  - This contract governs structure and chrome; it never overrides the color fidelity contract, the typography fidelity contract, or any explicit user requirement.
`,a.default`
  **Premium archetype and theme contract (mandatory):**
  - Use this dispatch model before choosing layout:
    - **Bento Grid**: multiple comparable actions/features/modules (usually 6+) with at least 2 valid entry paths.
    - **Marquee Hero**: one clear thesis or promise-first goal with one featured action.
    - **Workbench / split-workspace**: tool-like, state-heavy, command-driven, create/edit/apply/delete workflows.
    - **Conversational FAQ**: sequential question-answer tasks where interaction is gated by answers.
    - **Long Document / editorial**: one long-form narrative product, policy, or case text is the job.
  - Pick one primary macrostructure and lock it privately. Do not switch archetype midway through building the same screen, and do not dump the archetype name or taste dials into the user-facing reply.
  - For work with dense operations, choose a work-first shell ('workbench-shell' + toolbar + canvas/panel + contextual side rail) rather than a hero-first card shell.
  - For **Bento Grid**, use explicit tile spans ('span-2x2', 'span-2x1', 'span-1x2', 'span-1x1') on a 'bento' container so shape is deliberate.
  - For all screen-level variants, avoid per-section theme changes. Use one theme family and one global luminosity model unless the brief explicitly asks for contrast inversion.
  - Keep motion meaningful: one intentional signature transition for engagement and one confirmation/feedback motion; avoid utility-level effects on every element.
  - Header/nav baseline for all profiles: centered shell, explicit width rhythm, and visible baseline alignment (\`max-w\` + \`mx-auto\` + balanced padding) so nav chrome never drifts toward one edge.
  - If the user does not provide a brand palette or aesthetic direction, do **not** invent a second theme system here — lock one Style Pack from the Unspecified-theme Style Pack contract (Hallmark names are pack aliases: Cobalt→cobaltMinimal, Lumen→lumenAtmospheric, Specimen→editorialSpecimen, Brutal→swissBrutal, Carnival→kineticAwwwards, Hum→softStructural). Privately apply that pack's literal surface map in code; do not print STYLE_PACK / DIALS / SURFACE_MAP in the user-facing reply.
  - Theme routing when the user IS explicit (or after a pack is locked):
    - Creative / portfolio / luxury directions -> ornamental but purposeful visual signature (motion + texture + contrast pivots) within the locked pack.
    - Technical / data-heavy / workflows -> utilitarian minimal, high-legibility tones with restrained ornamentation.
    - Editorial / content-led -> rhythm-first hierarchy and low-motion polish.
    - If the user explicitly states a tone, lock it. If silent, the Style Pack router already chose; do not override it with anonymous gray SaaS.
  - Hallmark style profile selection (maps 1:1 to Style Packs — never a competing default):
    - Editorial / Specimen → editorialSpecimen pack.
    - Modern-minimal / Cobalt → cobaltMinimal pack.
    - Atmospheric / Lumen → lumenAtmospheric pack.
    - Cool atmospheric / Midnight / Aurora → midnightCool pack.
    - Playful / Hum → softStructural pack.
    - Kinetic / Carnival → kineticAwwwards pack.
    - Brutal / Swiss Industrial → swissBrutal pack.
    - Terminal / CRT → terminalPhosphor pack.
    - Botanical / Garden → gardenBotanical pack.
    - Manifesto / poster → manifestoGeometric pack.
    - Newsprint / publication → newsprintEditorial pack.
    - Riso / print → risoPoster pack.
  - **Full-style commitment:** when any Style Pack is locked, execute it completely — every surface, font, radius, nav, footer, and motion cue must belong to that one world. Partial adoption reads as generic.
  - Brutal tone mechanics (when swissBrutal or user asks brutalist):
    - Use a raw, edge-driven register: heavy borders, sharp section edges, strong density contrasts, minimal decorative ornament.
    - Prefer slab / condensed display behavior, tracked caps only when they add intent, no unnecessary rounded corners on primary containers.
    - Keep motion strict and explicit: at most three intentional motion primitives on the page, no elastic/bouncy easings by default, and no universal hover choreography.
    - Require one bold signature element and remove all decorative extras.
  - Reject multi-theme surfaces. One screen should have one primary Style Pack / theme family and one consistent surface map.
`;let W=a.default`
  **Premium archetype + component cheat-sheet (plan-ready):**
  - **Bento Grid:** use for comparable modules, service tiles, dashboards with equal priority cards.
    - 'bento' = container.
    - 'span-2x2' = anchor tile.
    - 'span-2x1' = wide tile.
    - 'span-1x2' = tall tile.
    - 'span-1x1' = regular tile.
  - **Marquee Hero:** use for one thesis, one narrative, one primary action.
  - **Workbench:** use 'workbench-shell', 'toolbar', 'canvas', 'inspector', and 'activity' regions.
  - **Conversational FAQ:** use question cards, answer progression, and clear next-step affordances.
  - **Theme / Style Pack (default when brief is vague):** lock one Style Pack via the Unspecified-theme Style Pack contract — do not invent a parallel Hallmark default.
  - **Hallmark names → Style Pack aliases:** Specimen→editorialSpecimen; Cobalt→cobaltMinimal; Lumen→lumenAtmospheric; Brutal→swissBrutal; Carnival→kineticAwwwards; Hum→softStructural.
  - **Quick checks (must match the locked pack):**
    - **editorialSpecimen:** asymmetric layout first; one-hue accents; hairlines; no gradient text; headings upright.
    - **cobaltMinimal:** one signal blue, live code/request-response artifact, bordered controls, compact radii, no pill-heavy chrome.
    - **lumenAtmospheric:** dark instrument canvas, lowercase headline + uppercase mono callouts, one warm amber accent, no purple orbs.
    - **softStructural:** double-bezel elevated panels, teal primary, soft structural rhythm, no emoji-as-icons.
    - **kineticAwwwards:** AIDA spine, gapless bento, wide 2–3 line H1, one scroll-craft Desire section.
    - **swissBrutal:** radius-0, 2px ink borders, hazard red primary, macro CAPS + mono metadata.
    Never split Style Packs / theme families in one screen.
`,_="Pick the primary archetype from intent: single-thesis screen = Marquee Hero; multiple entry points / modules = Bento Grid; tool/flow-centric = Workbench; content/docs with question path = Conversational FAQ. State the exact archetype and interaction intent before writing sections; declare 2–4 required user outcomes (create/edit/submit/update/filter/confirm etc.). When the brief is vague, lock one Style Pack (Hallmark names are aliases only) and one luminosity model; do not create per-section mini-themes or a second anonymous gray theme.",Y=a.default`
  **Functional interaction contract (mandatory):**
  - Before writing JSX, inventory every visible button, link, menu item, tab, form, row action, and toggle. Assign each one a concrete outcome: navigate or scroll, open an appropriate dialog/drawer/menu, submit validated data, mutate visible local state, change a selection/filter/view, copy/download, or trigger an honest setup/error state. Do not emit inert controls, empty handlers, or clickable-looking decoration.
  - Build the core workflow end to end, not only its resting screen. Creation and editing flows must accept input, validate it, support cancel, update visible state on success, and make the result discoverable. Delete or other destructive actions require explicit confirmation and must actually remove or update the affected record in the UI.
  - Use Shadcn \`Dialog\` for focused create/edit/detail/settings flows, \`AlertDialog\` for destructive or irreversible confirmation, and \`Drawer\` when a narrow-screen task genuinely benefits from a bottom sheet. Give every overlay a visible title and description, focus-safe controls, Escape/close behavior, a cancel path, and responsive max-height/overflow. Do not open a modal for a simple action whose visible result is already immediate and clear.
  - Mount one \`<Toaster />\` from \`sonner\` near the app root when the workflow has mutations, async completion, copy, save, publish, import, or delete actions. Import with \`import { Toaster, toast } from "sonner"\` — never from \`@/components/ui/sonner\`, \`@/components/ui/toaster\`, or \`@/components/ui/use-toast\`. Call \`toast()\` / \`toast.promise()\` for concise success or failure confirmation with terminology matching the initiating action. Keep field validation inline, keep persistent/actionable failures near the affected content, and never use a toast as the only explanation of a blocking error.
  - Buttons that represent unavailable infrastructure must be disabled or open an honest setup state; never fake authentication, payment, persistence, email, upload, or server-side success. For browser-only demos, meaningful local state is acceptable, but do not imply that it persists remotely.
  - Use semantic elements and state attributes: navigation uses real links with valid destinations, actions use \`type="button"\`, form submission uses \`type="submit"\`, toggles expose \`aria-pressed\` or their native checked state, menus/dialogs expose their Shadcn semantics, and icon-only controls have stable accessible names.
  - For any control with asynchronous behavior or important state changes, explicitly support and style hover, active, focus-visible, disabled, loading, success, and error states. Do not leave core actions visually static while behavior changes.
  - All interactive controls should remain discoverable on keyboard and pointer: enforce 44px minimum touch targets, one-line action labels, and explicit visible focus order.
  - Verify the interaction graph privately before emitting files: exercise the primary path plus cancel, invalid input, empty, loading/disabled, success, and error/retry paths; remove any control whose behavior is still undefined.
`,J="Interaction inventory: list the core workflow and every meaningful control outcome, including which create/edit/detail/settings tasks use Dialog or Drawer, which destructive actions use AlertDialog, where inline validation appears, which completed mutations warrant a toast, and how visible local state changes. No planned control may be inert.",K=a.default`
  **Theme behavior contract (mandatory whenever a theme control is rendered):**
  - A light/dark control is functional product state, never decorative. Tailwind \`dark:\` utilities activate only when an ancestor has the \`dark\` class, so changing an icon, boolean, \`data-theme\`, body class, or CSS \`color-scheme\` alone is not a working toggle. The state owner must apply \`dark\` to \`document.documentElement\` (the preview iframe's root HTML element).
  - For a two-way light/dark control, follow this exact state flow unless the existing app already has an equivalent complete theme hook/provider:
    \`\`\`tsx
    type Theme = "light" | "dark";

    const getInitialTheme = (): Theme => {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    };

    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
      const isDark = theme === "dark";
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.style.colorScheme = theme;
      localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () =>
      setTheme((current) => (current === "dark" ? "light" : "dark"));
    \`\`\`
  - Bind every rendered theme button/switch directly to that shared \`theme\` state and \`toggleTheme\` handler. Do not create separate header/settings booleans, do not mutate the DOM only once outside an effect, and do not reset the preference on unrelated renders. If the theme logic lives in \`hooks/useTheme.ts\`, output that file and import it relatively.
  - After the click, the icon/label, \`aria-pressed\` or checked state, root HTML \`dark\` class, \`document.documentElement.style.colorScheme\`, and visible surfaces must all change in the same render cycle. Before emitting files, mentally click the control twice and verify dark -> light -> dark updates the actual preview, not only the control chrome.
  - If a three-way system option is offered, persist \`"system"\`, resolve it through \`window.matchMedia("(prefers-color-scheme: dark)")\`, subscribe to OS changes only while system mode is active, and clean up the listener.
  - The control must clearly communicate its current state and next action with visible icon/text plus a dynamic \`aria-label\`, \`title\`, and \`aria-pressed\` or native checked state. It must work by keyboard and must not briefly reset when unrelated app state changes.
  - Theme the whole rendered tree, not only the page background: canvas, raised surfaces, text, muted text, borders, inputs, menus, dialogs, drawers, toasts, tooltips, tables, charts, empty/error states, focus rings, hover/selected/disabled states, and scroll/overlay treatments all need intentional light and dark pairs. Portalled Shadcn surfaces must respond through the root HTML class.
  - Use complete literal Tailwind \`dark:\` pairs on theme-defining surfaces unless the generated app explicitly defines every semantic token it uses. Audit for hard-coded white/black or gray values that become unreadable in the opposite mode, including SVG/chart fills, inline styles, translucent layers, and third-party component props.
  - If no theme control is rendered, preserve the requested or existing theme and do not add a nonfunctional toggle merely as decoration.
`,Q="Theme behavior: if the plan includes a theme control, specify one shared light/dark state owner initialized from localStorage with an OS fallback; every control must call the same toggle handler, toggle the dark class on document.documentElement, update document.documentElement.style.colorScheme, persist the choice, expose a keyboard-accessible dynamic state label, and theme portalled overlays, toasts, forms, data visualizations, and every interaction state. If there is no theme control, do not invent a decorative one.",X=a.default`
  **Design Taste contract (mandatory for distinctive UI):**

  ### Brief inference (before classes)
  - Infer page kind (product surface / landing / portfolio / editorial / redesign), vibe words, audience, and quiet constraints (a11y, regulated, trust-first). Quiet constraints override aesthetic preference.
  - Privately lock one Design Read line in planning (do not print it to the user): "Reading this as: <kind> for <audience>, with a <vibe> language, leaning <aesthetic/theme family>."
  - Anti-default: do not reach for AI-purple gradients, dark-mesh centered hero, three equal feature cards, Inter/slate corporate chrome, glass on every surface, or infinite decorative micro-loops.

  ### Taste dials (set once, then obey)
  - Lock three dials before styling: DESIGN_VARIANCE (1=symmetric … 10=asymmetric), MOTION_INTENSITY (1=static … 10=cinematic), VISUAL_DENSITY (1=airy … 10=cockpit). Baseline for marketing/portfolio: 8 / 6 / 4.
  - Map from vibe: minimal/calm/Linear → 5-6 / 3-4 / 2-3; premium/Apple-y/luxury → 7-8 / 5-7 / 3-4; playful/Awwwards/agency → 9-10 / 8-10 / 3-4; trust/public-sector → 3-4 / 2-3 / 4-5; product workbench/dashboard → 4-6 / 3-5 / 6-8; redesign-preserve → match existing / +1 motion / match density; redesign-overhaul → +2 variance / +2 motion / match density.
  - Variance > 4: prefer asymmetric, split, or offset compositions over centered hero stacks. Density > 7: prefer borders, divide-y, and negative space over boxed metric cards; use mono/tabular treatment for numbers. Motion > 4: the page must actually move (entrance, state change, or scroll reveal); if you cannot ship working motion, drop the dial rather than claiming cinematic and shipping static.

  ### Anti-slop tells (hard bans unless the brief explicitly demands them)
  - Em-dash and en-dash as separators are forbidden in visible UI copy. Use a period, comma, colon, parentheses, or a regular hyphen.
  - **Yellow/black generic combo:** \`bg-yellow-400\`/\`bg-yellow-500\` primary CTA on \`bg-black\`/\`bg-neutral-950\` canvas is the most common AI slop tell — banned unless the locked Style Pack explicitly specifies it (none do).
  - No neon outer glows, pure \`#000\`/\`#fff\` as the only palette, rainbow mesh blobs, gradient display headlines, custom cursors, or decorative status dots on every row/nav item.
  - No version badges in heroes (\`BETA\`, \`v0.6\`), no scroll cues (\`Scroll to explore\`), no decoration strips (\`TYPE / FORM / MOTION\`), no locale/weather strips, no section-number eyebrows (\`01 / Capabilities\`), no pills/labels overlaid on images, no photo-credit theater on stock imagery.
  - No div-based fake browser/phone/terminal/IDE chrome. No fabricated metrics, testimonials, customer logos, or awards.
  - No Jane Doe / Acme / Nexus names; no filler verbs: Unleash, Elevate, Empower, Seamless, Supercharge, Next-Gen, Revolutionize, "Where X meets Y", "Built for the modern team".
  - Layout family used at most once per page. Zigzag image+text splits: max two consecutive. Eyebrows (small uppercase wide-tracking labels above headlines): at most one per three sections; never on consecutive sections.
  - Split-header ban: do not put a giant left headline beside a floating right explainer paragraph as the section header; stack headline then body (max ~65ch).
  - Duplicate CTA intent ban: one label per intent across nav, hero, and footer (do not ship both "Get started" and "Try free" for the same action).
  - Marquee / kinetic text band: at most one per page. Nested card-in-card wrappers and giant rounded shells around every block are banned.

  ### Typography discipline
  - Prefer characterful available faces or expressive scale/weight/tracking on an installed stack. Do not default the whole voice to Inter, Roboto, Arial, Open Sans, or Poppins.
  - Serif display is discouraged by default. Allow serif only when the brief is genuinely editorial / luxury / publication / heritage or the brand names a serif. Never default to Fraunces or Instrument Serif as a creative crutch.
  - Headings stay roman. Emphasis uses bold/weight of the same family, not a random mixed-family italic word. If italic appears in body copy with descenders (y,g,j,p,q), keep enough line-height so glyphs are not clipped.
  - H1 discipline: prefer 2 lines, hard max 3 on desktop. Widen measure or reduce scale rather than wrapping into a wall of type. Keep one copy register per page; rewrite cute AI nonsense into plain functional language.

  ### Color and theme locks
  - Max one accent family; saturation restrained; one gray temperature (warm OR cool) for the whole app. Color Consistency Lock: the accent used in the hero is the accent used in footer, focus, and selected states.
  - Lila/AI-purple banned unless the user or brand explicitly asks for purple (then execute with intent: coherent family, not neon glow).
  - Premium-consumer / craft / luxury briefs: do not default to warm cream + brass/clay/oxblood + espresso. Rotate alternatives: Cold Luxury (silver/smoke), Forest (deep green + amber), Black and Tan, Cobalt + Cream, Olive + Brick, or mono + one saturated pop.
  - Theme Lock: one light-first, dark-first, or system-driven luminosity model for the whole screen. No mid-page accidental light/dark flips. At most one deliberate focal inverse region.
  - Shape Consistency Lock: one radius system for the page (sharp / soft / documented mixed rule for buttons vs cards). Do not mix pill nav, sharp cards, and fully rounded inputs without a stated rule.

  ### Hero and marketing composition (when the surface is landing/portfolio/promotional)
  - Hero must fit the first viewport: headline ≤ 2 lines, subtext ≤ 20 words, CTA visible without scroll, top padding not excessive (\`pt-16\`–\`pt-24\` at desktop — never floating content halfway down the screen).
  - Max four text elements in the hero: optional eyebrow OR brand strip, headline, subtext, and CTAs (1 primary + at most 1 secondary). Ban stats strips, trust logos, pricing teasers, and feature bullets inside the hero — those belong in sections below.
  - Prefer asymmetric split, editorial type-led, media-as-canvas, or workbench-preview openings over reflexive centered promise + three cards. Product apps still open on the usable surface, not a marketing shell.
  - Prefer full-viewport hero shells via \`min-h-screen\` (or an equivalent installed full-viewport pattern) rather than brittle height hacks; keep mobile address-bar jump in mind. Prefer CSS Grid over fragile flex percentage math for multi-column sections.

  ### Motion (motivated only)
  - Animate transform and opacity only. Prefer spring or exponential ease-out (roughly 200–400ms). No bounce/elastic defaults. No \`window\` scroll listeners; use Framer Motion scroll hooks, GSAP ScrollTrigger, or IntersectionObserver.
  - Each animation must serve hierarchy, storytelling, feedback, or state change — otherwise remove it. Infinite loops belong only on genuinely live product demos, not every card.
  - Isolate heavy motion in dedicated components. Continuous pointer/scroll values must not thrash React state. Grain/noise overlays stay on fixed, pointer-events-none layers.
  - Respect \`prefers-reduced-motion\`: collapse non-essential motion when reduced motion is requested. GSAP pin/scrub work (sticky stacks, horizontal pans) must pin at \`start: "top top"\` when used; do not mix GSAP timeline ownership with Framer Motion in the same leaf.

  ### Aesthetic modes (must match locked Style Pack; do not mix conflicting modes)
  - When a Style Pack is locked for a vague brief, the aesthetic mode is already chosen: swissBrutal→brutalist, cobaltMinimal→minimalist, lumenAtmospheric/softStructural→high-end, editorialSpecimen→editorial, kineticAwwwards→kinetic. Do not pick a conflicting mode.
  - **Brutalist / industrial (swissBrutal):** Swiss Industrial light paper + hazard red/ink by default (Tactical CRT only if the user asks dark terminal). Radius 0, 1–2px borders, macro CAPS + mono metadata, no soft shadows/glass/gradients. One signature move; remove the rest.
  - **Minimalist / Linear-calm (cobaltMinimal):** cool monochrome + blue signal, hairline borders, compact radii (\`rounded-md\`/\`rounded-lg\`), no pill-heavy chrome, quiet motion, flat grouping over elevated cards.
  - **High-end (lumenAtmospheric / softStructural):** instrument dark + amber OR soft double-bezel teal structuralism — not both. Floating/pill nav only when the pack allows; custom easing on entries; one kinetic primary CTA — not effects on every control.
  - **Editorial (editorialSpecimen):** asymmetric type-led composition, hairlines, stone canvas, one rose accent, restrained motion.
  - **Awwwards / kinetic (kineticAwwwards):** AIDA spine, gapless dense bento (\`N\` items → \`N\` cells), huge section breathing room, deterministic variety from the brief seed.
  - **Brandkit discipline:** one metaphor, sparse real copy, accents that recur, mockups that show identity application rather than fake dense dashboards.

  ### Redesign protocol (when editing an existing app or brand)
  - Detect preserve vs overhaul. Preserve: routes/slugs, primary nav labels, form field names, logo/wordmark, legal/consent copy, analytics IDs, and accessibility wins unless the user asks to change them.
  - Lever order: typography → spacing rhythm → color recalibration → motion → hero/opening recomposition → unsalvageable block replacement. Do not rewrite the stack for a visual polish request.
  - Optical craft: align baselines across card groups, keep CTA rows level, sentence-case headers, no "Oops!" or exclamation-mark success copy.

  ### Preflight (fail any → revise before emit)
  - Design Read + dials locked privately (not dumped into the chat); theme/color/shape locks held; zero em/en-dash separators in UI copy.
  - Hero (if marketing) viewport-fit; eyebrow ration; no zigzag×3; no duplicate CTA intent; no mid-page theme flip.
  - Serif justified or absent; premium palette not cream+brass default; one accent family throughout.
  - Motion motivated + reduced-motion path; real product content (no fake chrome/proof); section layout families varied.
  - Buttons/forms meet contrast and 44px targets; CTA labels stay one line at desktop; copy self-audited for AI-cute nonsense.
`,Z="Design Taste: before styling, privately lock one Design Read line and DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY (use the Style Pack dials when a pack is locked) without dumping them into the user reply; pick at most one aesthetic mode matching that pack; enforce anti-slop bans (em-dash, three-card hero template, fake chrome, section-number eyebrows, duplicate CTA intents); for redesigns preserve IA/nav labels/field names and modernize via type→spacing→color→motion→hero; end planning with the Design Taste preflight checklist.";e.s(["designTasteContract",0,X,"designTastePlanningRule",0,Z,"functionalInteractionContract",0,Y,"functionalInteractionPlanningRule",0,J,"premiumArchetypeAndThemeCheatSheet",0,W,"premiumArchetypeAndThemePlanningRule",0,_,"tailwindColorFidelityContract",0,O,"tailwindColorPlanningRule",0,H,"themeToggleContract",0,K,"themeTogglePlanningRule",0,Q,"typographyPlanningRule",0,V,"visualSystemCoherenceContract",0,G,"visualSystemPlanningRule",0,z],70754);var ee=e.i(676225);let et=/https?:\/\/[^\s"'<>)\]]+/gi,ea=/\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)(\?[^\s"'<>)\]]*)?$/i,eo=/\.(mp4|webm|mov|m4v|ogv|ogg)(\?[^\s"'<>)\]]*)?$/i;function er(e){let t=new Set,a=new Set;for(let o of e.matchAll(et)){let e=o[0].replace(/[),.;]+$/,"").trim();if(!(!(!e.startsWith("http")||/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(e))&&1))continue;let r=eo.test(e)||/[?&]format=(mp4|webm)/i.test(e)?"video":ea.test(e)?"image":null;"image"===r&&t.add(e),"video"===r&&a.add(e)}return{images:[...t],videos:[...a]}}let en=new Set(["about","also","app","application","build","create","for","from","make","page","that","the","this","tool","using","with","your"]),ei={aviation:["jet","jets","flight","flights","airline","aircraft"],travel:["trip","trips","concierge","itinerary"],membership:["member","members","subscribe","subscription"],writing:["writer","writers","essay","essays","newsletter"],film:["filmmaker","filmmakers","movie","movies","cinema"],automation:["automate","automated","agent","agents","workflow"],wellness:["coaching","coach","mindset","habit","habits"],course:["certificate","certificates","training","bootcamp","learn"]};function es(e){return(e.toLowerCase().match(/\b[a-z0-9]{3,}\b/g)??[]).filter(e=>!en.has(e))}function el(e,t){let a,o=e.trim();if((a=er(o.trim())).images.length>0||a.videos.length>0||y(o))return"userSpecified";let r=v(o),n=t?.hasCatalogVideo?["catalogVideo","meshGradient","noisePattern"]:["meshGradient","noisePattern"];return n[r%n.length]??"meshGradient"}let ec={catalogVideo:"Catalog video (CloudFront)",meshGradient:"Mesh gradient shader",noisePattern:"Noisy pattern background",userSpecified:"User-specified design"};function ed(){return a.default`
    ### Implement: mesh gradient
    - Import one verified shader from \`@paper-design/shaders-react\` (for example \`MeshGradient\`, \`DotOrbit\`, \`NeuroNoise\`, \`Metaballs\`, \`Warp\`, \`Swirl\`, or \`Water\`) and keep it subordinate to readable content.
    - Use as the hero/first-viewport signature: full-bleed behind content with explicit width/height via style props and a tasteful \`colors\` array matched to the subject (not generic AI purple).
    - Layer readable content above with an intentional scrim or solid panel — never illegible text on raw shader.
    - Do NOT also embed a catalog video or noise layer as the hero signature for this build.
  `}function em(e,t,o){let r=t?.find(e=>"video"===e.kind),n=t?.filter(e=>"image"===e.kind)??[],i=a.default`
    ### Implement: user-specified design
    - Follow the user's stated palette, aesthetic, media URLs, and references — do not override with catalog video or default shaders.
    - Still avoid generic yellow/black CTA combos and placeholder dashed boxes when real assets were named.
  `;if("catalogVideo"===o&&r){let e;e=n.length>0?n.slice(0,2).map(e=>`- Optional supporting image \`${e.id}\`: \`${e.url}\` — ${e.howToUse}`).join("\n"):"",i=a.default`
    ### Implement: catalog video
    - Embed \`${r.url}\` in \`<video autoPlay loop muted playsInline />\` per: ${r.howToUse}
    - Comment \`{/* visual-signature: ${r.id} */}\` above the element.
    - Preserve the video's original color and contrast. Do not dim, tint, desaturate, or recolor the whole frame merely to force it into the page theme.
    - Derive typography and accent from the video's dominant color family, not a small incidental highlight. If the catalog metadata does not name a palette and you cannot inspect a frame, use neutral white/black controls instead of inventing a saturated accent.
    - For text legibility, try placement in clean negative space first, then a localized edge gradient or compact solid/translucent text panel. Use the weakest treatment that passes contrast. A uniform full-frame scrim is a last resort and requires a clear readability need.
    - Do NOT also add MeshGradient, DotOrbit, or a noise overlay as the hero signature.
    ${e}
  `}else"meshGradient"===o?i=ed():"noisePattern"===o?i=a.default`
    ### Implement: noisy pattern background
    - Use a fixed, \`pointer-events-none\` grain/noise layer on the hero or canvas — CSS \`background-image\` with an SVG feTurbulence data-URI, or a subtle repeating noise texture at low opacity (≈3–8%).
    - Pair with solid typography and one restrained accent; the texture adds tactility, not chaos.
    - Keep contrast readable; noise must not replace foreground hierarchy.
    - Do NOT also embed a catalog video or MeshGradient as the hero signature for this build.
  `:"catalogVideo"!==o||r||(i=ed());return a.default`
    ## Visual signature

    Recommended treatment: **${ec[o]}** (\`${o}\`).
    Apply it only to a marketing/showcase surface where it strengthens the
    subject. A product surface, focused utility, or strong typographic opening
    may skip cinematic treatment entirely.

    ${i}

    - **One signature only:** never stack video, shader, and noise.
    - **Media fidelity:** preserve source color; use placement or a localized,
      minimal scrim for contrast instead of blanket tinting.
    - Couple CTAs to the dominant media palette. If unknown, use a neutral,
      high-contrast pair rather than guessing a saturated accent.
    - Supporting catalog images are optional. Never invent fake proof or use a
      dashed placeholder when a relevant real asset is available.

  `}function eu(e){return`- ${e.id} (${e.kind})
  Description: ${e.description}
  Mood: ${e.mood}
  Tags: ${e.tags.join(", ")}
  Use when: ${e.useWhen}
  How to use: ${e.howToUse}
  URL: ${e.url}`}function ep(e){if(!e||0===e.length)return"";let t=e.filter(e=>"video"===e.kind),o=e.filter(e=>"image"===e.kind),r=t.length>0?t.map(eu).join("\n\n"):"- (none)",n=o.length>0?o.map(eu).join("\n\n"):"- (none)";return a.default`
    ## Past media catalog (CloudFront — optional reference)

    Ranked showcase assets when the locked visual signature is \`catalogVideo\`,
    or when a section genuinely needs a real image/video. Not mandatory every build.

    If you use a catalog asset, preserve its native color balance. Do not apply a blanket tint, opacity reduction, or full-frame dark overlay as decoration. Solve text contrast with placement first, then a localized gradient or compact text panel. Match accents to the dominant media family; when the palette is unknown, keep controls neutral rather than inventing a warm or neon accent.

    ### Videos
    ${r}

    ### Images
    ${n}

    Use exact catalog URLs in \`src\` when embedding — no localhost, no invented links, no dashed placeholders.
  `}e.s(["buildPastMediaCatalogPromptSection",0,ep,"buildVisualSignatureDirective",0,em,"selectPastMediaCatalogForPrompt",0,function(e,t){if(0===t.length)return[];let a=[...t].map(t=>({entry:t,score:function(e,t){let a=e.toLowerCase(),o=new Set(es(e)),r=0;for(let e of t.tags){let t=e.toLowerCase();o.has(t)&&(r+=4),function(e,t){if(e.includes(t))return!0;for(let a of ei[t]??[])if(e.includes(a))return!0;return!1}(a,t)&&(r+=3)}for(let e of es(`${t.useWhen} ${t.description} ${t.mood}`))o.has(e)&&(r+=1);return"video"===t.kind&&/hero/.test(t.id)&&(r+=1),r}(e,t)})).sort((e,t)=>t.score-e.score||e.entry.id.localeCompare(t.entry.id)),o=[],r=a.find(e=>"video"===e.entry.kind);for(let e of(r&&o.push(r.entry),a))if("image"===e.entry.kind&&!o.some(t=>t.id===e.entry.id)&&(o.push(e.entry),o.length>=3))break;if(!o.some(e=>"image"===e.kind)){let e=a.find(e=>"image"===e.entry.kind);e&&o.push(e.entry)}return o.slice(0,4)},"selectVisualSignatureMode",0,el,"shouldAttachPastMediaCatalog",0,function(e){let t=e.trim();if(!t)return!0;let a=er(t);return 0===a.images.length&&0===a.videos.length}],2820);let eh=`
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
`;e.s(["importDocs",0,eh,"name",0,"Alert Dialog","usageDocs",0,"Use for destructive or irreversible confirmation."],579822);var eg=e.i(579822);let ef=`
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
`,eb=`
<Avatar>
  <AvatarImage src="https://github.com/nutlope.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
`;e.s(["importDocs",0,ef,"name",0,"Avatar","usageDocs",0,eb],554247);var ey=e.i(554247);let ev=`
import { Button } from "@/components/ui/button"
`,ew=`
<Button>A normal button</Button>
<Button variant='secondary'>Button</Button>
<Button variant='destructive'>Button</Button>
{/* Outline/secondary CTAs always need readable resting text — seeded outline includes text-foreground; still pair custom fills with matching text-* */}
<Button variant='outline'>Button</Button>
<Button variant='ghost'>Button</Button>
<Button variant='link'>Button</Button>
{/* Branded secondary / nav Login: override hover as a complete recipe, or use a native button/link with full custom classes — never leave a gray hover:text fighting the resting color. */}
<Button variant='ghost' className='text-foreground hover:bg-muted'>Log in</Button>
{/* Hero secondary: never rely on parent text-white over a light fill — use an explicit pair */}
<Button variant='outline' className='border-neutral-700 bg-transparent text-neutral-50 hover:bg-neutral-900'>Learn more</Button>
`;e.s(["importDocs",0,ev,"name",0,"Button","usageDocs",0,ew],474532);var ex=e.i(474532);let ek=`
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
 `,eS=`
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
`;e.s(["importDocs",0,ek,"name",0,"Card","usageDocs",0,eS],907418);var eA=e.i(907418);let eC=`
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
`;e.s(["importDocs",0,eC,"name",0,"Dialog","usageDocs",0,"Use for focused create, edit, detail, or settings flows."],139402);var eT=e.i(139402);let eI=`
import {
  Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter,
  DrawerHeader, DrawerTitle, DrawerTrigger,
} from "@/components/ui/drawer"
`;e.s(["importDocs",0,eI,"name",0,"Drawer","usageDocs",0,"Use when a narrow-screen workflow benefits from a sheet."],667036);var eN=e.i(667036);let eP=`
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
`;e.s(["importDocs",0,eP,"name",0,"Dropdown Menu","usageDocs",0,"Use for a compact group of real secondary actions."],490255);var eD=e.i(490255);let eM=`
import { Input } from "@/components/ui/input"
`,eR=`
<Input />
`;e.s(["importDocs",0,eM,"name",0,"Input","usageDocs",0,eR],308145);var eB=e.i(308145);let eE=`
import { Label } from "@/components/ui/label"
`,eL=`
<Label htmlFor="email">Your email address</Label>
`;e.s(["importDocs",0,eE,"name",0,"Label","usageDocs",0,eL],197671);var e$=e.i(197671);let eq=`
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
`;e.s(["importDocs",0,eq,"name",0,"Popover","usageDocs",0,"Use for lightweight contextual controls or details."],697225);var eU=e.i(697225);let ej=`
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
`,eF=`
<RadioGroup defaultValue="option-one">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <Label htmlFor="option-one">Option One</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <Label htmlFor="option-two">Option Two</Label>
  </div>
</RadioGroup>
`;e.s(["importDocs",0,ej,"name",0,"RadioGroup","usageDocs",0,eF],600711);var eO=e.i(600711);let eH=`
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
`,eG=`
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select>
`;e.s(["importDocs",0,eH,"name",0,"Select","usageDocs",0,eG],540824);var ez=e.i(540824);let eV=`
import { Switch } from "@/components/ui/switch"
`;e.s(["importDocs",0,eV,"name",0,"Switch","usageDocs",0,"Use checked and onCheckedChange for boolean settings."],686312);var eW=e.i(686312);let e_=`
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
`;e.s(["importDocs",0,e_,"name",0,"Tabs","usageDocs",0,"Use for distinct views whose selected state changes content."],823366);var eY=e.i(823366);let eJ=`
import { Textarea } from "@/components/ui/textarea"
`,eK=`
<Textarea />
`;e.s(["importDocs",0,eJ,"name",0,"Textarea","usageDocs",0,eK],589835);var eQ=e.i(589835);let eX=`
import { Toaster, toast } from "sonner"
`;e.s(["importDocs",0,eX,"name",0,"Toast notifications (sonner)","usageDocs",0,"Import Toaster and toast from the sonner package — never from @/components/ui/sonner (that path does not exist). Mount <Toaster /> near the app root and call toast() / toast.promise() for transient completion feedback."],87330);var eZ=e.i(87330);let e0=`
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
`;function e5(e,t){return{name:e,importDocs:t}}e.s(["importDocs",0,e0,"name",0,"Tooltip","usageDocs",0,"Use to clarify unfamiliar icon-only secondary controls."],391220);let e2=[eg,ey,ex,eA,eT,eN,eD,eB,e$,eU,eO,ez,eW,eY,eQ,eZ,e.i(391220),e5("Accordion",'import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"'),e5("Alert",'import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"'),e5("Badge",'import { Badge } from "@/components/ui/badge"'),e5("Breadcrumb",'import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"'),e5("Calendar",'import { Calendar } from "@/components/ui/calendar"'),e5("Carousel",'import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"'),e5("Checkbox",'import { Checkbox } from "@/components/ui/checkbox"'),e5("Collapsible",'import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"'),e5("Form",'import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"'),e5("Hover Card",'import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"'),e5("Menubar",'import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar"'),e5("Navigation Menu",'import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"'),e5("Pagination",'import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"'),e5("Progress",'import { Progress } from "@/components/ui/progress"'),e5("Resizable",'import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"'),e5("Scroll Area",'import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"'),e5("Separator",'import { Separator } from "@/components/ui/separator"'),e5("Skeleton",'import { Skeleton } from "@/components/ui/skeleton"'),e5("Slider",'import { Slider } from "@/components/ui/slider"'),e5("Table",'import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"'),e5("Toggle Group",'import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"'),e5("Toggle",'import { Toggle } from "@/components/ui/toggle"')];function e4(e,t){return e>=12||t>=6e3}function e9(e=""){return a.default`
  ## Execution contract

  ### Files and imports
  - Generate a complete React + TypeScript app rooted at 'App.tsx'. Keep trivial apps small; split substantial reusable UI, stateful regions, types, and utilities into focused files. Never emit paths under 'src/'.
  - Every import must resolve to an available package, a documented '@/components/ui/*' module, or a relative file emitted in this response. Import every referenced JSX symbol/hook/helper. Match named/default exports exactly; emit barrel files only when importing them.
  - Do not redefine 'lib/utils' or preinstalled Shadcn modules except branded 'button.tsx', 'badge.tsx', 'navigation-menu.tsx', or 'toggle.tsx' when necessary.
  - Lucide exports are limited to Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, ArrowRight. Alias collision-prone imports ('User as UserIcon', 'Calendar as CalendarIcon', 'Mail as MailIcon'). Never import 'LucideIcon', 'ArrowLeft', or invented icon names.

  ### Styling and accessibility
  - Use standard Tailwind v3 utilities only. No arbitrary bracket values or computed class fragments such as 'bg-\${color}-500'; map variants to complete literal classes.
  - A user-named color is authoritative. Preserve its Tailwind family and requested scope. Pair every surface with explicit readable foreground, border, hover, active, focus, selected, and disabled colors.
  - Normal/helper/placeholder text needs 4.5:1 contrast; large text, icons, focus rings, and component boundaries need 3:1. Controls need visible ':focus-visible' treatment and a 44px touch target.
  - Prevent horizontal overflow and two-line clickable labels at 320, 375, 414, and 768px. Mobile must reorganize around the primary task rather than shrink the desktop layout.
  - Animate transform/opacity only when motion communicates hierarchy, feedback, or state. Respect 'prefers-reduced-motion'; no bounce/elastic defaults or decorative motion everywhere.

  ### Product and interaction
  - Build the requested product surface first. An app, tool, dashboard, editor, game, or workflow opens on the usable experience, not a marketing wrapper.
  - Every visible control must have a real handler or valid destination. Implement the relevant default, hover, active/selected, focus-visible, disabled, loading, empty, error, and success states. Use inline validation; use Dialog/AlertDialog for consequential choices and Sonner only for useful transient feedback. Do not emit inert controls or empty handlers.
  - If a theme toggle exists, use one shared state owner initialized from localStorage with an OS fallback. Toggle 'document.documentElement.classList.toggle("dark", isDark)', set 'document.documentElement.style.colorScheme', persist the choice, and theme every surface/dialog/toast. Tailwind 'dark:' utilities require an ancestor 'dark' class.
  - Preserve existing routes, data flow, component ownership, copy intent, and established visual conventions unless the user asks to change them.

  ### Design method
  1. Infer one private Design Read: scope, concrete subject, audience, single job, decisive tone, and appropriate variance/motion/density. Explicit user direction outranks every inferred default.
  2. Choose structure before styling. Product tools use task-led workbench/focused flows; editorial uses document rhythm; marketing uses a subject-specific composition. Bento is only for dense comparable modules, never proof of craft. Navigation and footer may be integrated or omitted when information architecture does not need them.
  3. Lock one coherent visual system: one luminosity model, small semantic surface map, one display role, one body role (optional mono for data/code), one accent family, and one radius rule. Headings stay roman. Keep at most one focal inverse region.
  4. Ground hierarchy, copy, and any signature element in the subject's real materials and vocabulary. Spend boldness once; typography, the product surface, a meaningful live demo, media, or motion may be the signature. Do not force an effect.
  5. Prefer structure, spacing, and type over card grids and decoration. Avoid centered hero -> three equal cards -> CTA, repeated section layouts, card-in-card nesting, generic purple gradients, decorative eyebrows/numbering/dots, fake browser/device/IDE chrome, and italic heading emphasis.
  6. Use believable subject-specific sample records only to demonstrate workflows. Never fabricate metrics, testimonials, customer logos, awards, integrations, or claims. Copy uses active, concrete labels and explains how to recover from errors.
  7. Privately critique Philosophy, Hierarchy, Execution, Specificity, Restraint, and Variety. Revise any score below 3 and remove one unnecessary flourish. Do not print scores or design-planning metadata.

  ### Live APIs and persistence
  - Use native 'fetch', never axios. A selected provider or user-supplied verified endpoint contract is authoritative; a bare API name/link is not a contract. Never replace selected API data with web-search results or remembered/mock values.
  - Put API access in a typed client. Check 'response.ok', use an AbortController timeout, bounded retry/backoff with explicit attempt identifiers, validate unknown JSON with Zod or an exact type guard, and render loading/empty/actionable-error/retry/setup-required states. Never set browser-forbidden headers or expose secrets.
  - Emit 'integrations.ts' for live integrations with providerId, name, purpose, docs/base URLs, auth, requiredSecrets, CORS, and runtime metadata.
  - When approved persistence requires Supabase, import the protected client from '@/lib/supabase'; never overwrite it or substitute mock arrays/localStorage. Browser-local persistence is only for an explicitly requested prototype/offline app.

  ### Known runtime traps
  - 'useRoutes()' belongs inside '<Router>'. Import 'cn' before using it. Do not assign to read-only 'message'.
  - Shadcn Select has no 'SelectItemText'; render the label inside 'SelectItem'.
  - Use 'import { Toaster, toast } from "sonner"'; never '@/components/ui/sonner', 'toaster', or 'use-toast'.
  - Clipboard writes need a textarea/'document.execCommand("copy")' fallback.

  ## Available UI modules
  ${e2.map(e=>"- "+e.name+": "+e.importDocs).join("\n")}

  ${(0,o.buildRequestScopedCapabilityContract)(e)}

  ## Output contract
  - Return only generated source files. User-facing progress is streamed separately by the product; do not add an acknowledgment, summary, explanation, Design Read, dials, Style Pack, surface-map, critique, or nav/footer planning to this response.
  - Emit each complete file once as \`\`\`tsx{path=App.tsx} ... \`\`\`. Put exactly three backticks at the start of the line, never indent the fence, and always include a full sandbox-root-relative path. Iterations emit only changed files. 'App.tsx' uses a default export.
  - Before emitting, verify: every import resolves; export styles match; the core workflow works through cancel/invalid/success/error paths; responsive layouts do not overflow; contrast and focus pass; and the result follows the latest request without invented claims.
  `}e.s(["estimateTokens",0,function(e){return Math.ceil(e.length/4)},"getCanonicalCodingPrompt",0,e9,"shouldUseCompressedPrompt",0,e4],324219);let e1=/\b(button|input|card|modal|dropdown|tooltip|select|checkbox|switch|tabs?|chip|badge|banner|snackbar|popover|slider|date picker|avatar|component)\b/i,e3=/\b(editorial|article|story|publication|magazine|blog|document)\b/i,e6=/\b(landing|marketing|homepage|launch|waitlist|portfolio|campaign)\b/i,e8=/\b(dashboard|editor|workspace|workbench|admin|console|canvas|inspector|workflow|crm|analytics)\b/i,e7=/\b(light|dark|editorial|brutalist|minimal|luxury|playful|technical|austere|atmospheric|palette|color|colour|typography|font|layout|theme|style|animation|motion|nav|footer)\b/i,te="(?:landing(?: page)?|marketing(?: site| page)?|homepage|publication|magazine|blog|document|dashboard|editor|workspace|workbench|utility|component)",tt=[RegExp(`\\b(?:turn|convert|rebuild|redesign|restructure|transform|change)\\b[\\s\\S]{0,80}\\b(?:into|as|to)\\b[\\s\\S]{0,40}\\b${te}\\b`,"i"),RegExp(`\\bmake\\b[\\s\\S]{0,80}\\b(?:a|an)\\s+${te}\\b`,"i"),RegExp(`\\breplace\\b[\\s\\S]{0,80}\\bwith\\b[\\s\\S]{0,40}\\b(?:a|an|the)?\\s*${te}\\b`,"i")];function ta(e){return["=== EFFECTIVE BRIEF (authoritative precedence) ===\nPrecedence: latest explicit user instruction > approved specification > existing app constraints > inferred Hallmark direction > default Style Pack.",`Latest user request: ${e.latestUserRequest||"none"}`,`Approved specification: ${e.approvedSpec||"none"}`,`Original intent (context only): ${e.originalIntent||"none"}`,"Resolved Hallmark design brief:",JSON.stringify(e.design,null,2),"A Style Pack is an implementation aid only. It must never override the latest request or approved specification.\n=== END EFFECTIVE BRIEF ==="].join("\n")}e.s(["resolveEffectiveBrief",0,function(e){var t;let a=e.originalIntent?.trim()??"",o=e.latestUserRequest.trim(),r=e.appSpec,n=[r.overview.purpose,r.overview.appType,...r.features.mustHave,a].filter(Boolean).join("\n"),i=(t=!0===e.latestRequestIsInitialBuild||!n||tt.some(e=>e.test(o))?[n,o].filter(Boolean).join("\n"):n).trim().split(/\s+/).filter(Boolean).length<=30&&e1.test(t)?"component":e3.test(t)?"editorial":e6.test(t)?"marketing":e8.test(t)?"product-workbench":"focused-utility",s=function(e){switch(e){case"component":return{macrostructure:"none (component scope)",navigation:"preserve-existing",footer:"none"};case"product-workbench":return{macrostructure:"Workbench",navigation:"integrated-toolbar",footer:"none"};case"editorial":return{macrostructure:"Long Document",navigation:"editorial-masthead",footer:"colophon"};case"marketing":return{macrostructure:"Marquee Hero",navigation:"information-architecture-led",footer:"statement-or-index"};default:return{macrostructure:"Focused Single-Task",navigation:"none",footer:"none"}}}(i),l=[r.design.visualDirection,r.design.colors?.join(", "),r.design.typography,r.design.layout].filter(Boolean).join("; "),c=e7.test(o)?o:l||a||o;return{originalIntent:a,approvedSpec:[r.overview.purpose,r.features.mustHave.length?`Must-have: ${r.features.mustHave.join("; ")}`:"",r.acceptanceCriteria.length?`Acceptance: ${r.acceptanceCriteria.join("; ")}`:"",r.features.excluded?.length?`Excluded: ${r.features.excluded.join("; ")}`:""].filter(Boolean).join("\n"),latestUserRequest:o,design:{scope:i,audience:r.overview.audience?.join(", ")||"the intended end user",primaryJob:r.userFlows[0]?.description||r.overview.purpose||o||a,tone:o.match(/\b(editorial|brutalist|soft|utilitarian|luxury|playful|technical|austere|atmospheric|minimal(?:ist)?)\b/i)?.[1]??r.design.visualDirection??"purposeful and restrained",requestedLuminosity:b(c),macrostructure:s.macrostructure,stylePack:w(c),navigation:s.navigation,footer:s.footer,preserve:["existing routes","existing workflows and data handling","unaffected copy and component ownership"],avoid:["marketing hero for a product tool","three equal feature cards","fabricated proof or metrics","unrequested navigation or footer chrome"]}}},"serializeEffectiveBrief",0,ta],935874);let to=/\b(hero|landing|marketing|homepage|portfolio|showcase|campaign|cinematic|immersive|shader|webgl|3d|video background|animated background|visual signature)\b/i;a.default`
You are an expert software architect and product lead responsible for taking an idea of an app, analyzing it, and producing an implementation plan for a single page React frontend app. You are describing a plan for a multi-file React + Tailwind CSS + TypeScript app with the installed UI, data, state, form, file, canvas, and content capabilities listed below.

Don't use @chakra-ui/react and don't use @headlessui/react. Just use Shadcn UI components with Tailwind.

**CRITICAL TAILWIND RULE: Only use standard Tailwind CSS classes. NEVER use arbitrary values like bg-[#123456], w-[100px], h-[600px], or text-[14px]. These custom bracket values are NOT supported.**

Never use axios for data fetching — just use the browser/Node.js native fetch.

Guidelines:
- Focus on MVP - describe the essential set of features needed to launch. Identify and prioritize the top 2-3 critical features.
- Give a high-level overview first, then break down Features → Tasks → Subtasks (two levels of depth).
- Build the actual product surface first. Plan the app screen, tool, dashboard, game, editor, or workflow the user asked for; do not default to a marketing landing page unless the prompt explicitly asks for one.
- Be concise and direct. Skip code examples and commentary. Use external APIs only when the requested functionality needs live data and the API is safe for the selected runtime.
- For every API, specify its official documentation, base URL, auth mode, CORS compatibility, runtime, and required setup. Browser calls are allowed only for unauthenticated or publishable-key APIs with documented CORS support; secret-bearing integrations require a server boundary.
- API evidence policy: when the user supplies a documentation link but not a complete endpoint contract, the implementation must be grounded in research of that exact link rather than memory. When the user already supplies the required endpoints and explains what each does, use that contract directly without asking for redundant research. Never invent missing API behavior or silently substitute another provider/version.
- Plan for a multi-file structure where useful: a main App.tsx plus supporting components/utilities as needed.
- Every planned import must map to either an installed package, an installed Shadcn UI module, or a file the model will generate. No other libraries or frameworks are available.
${o.generatedAppCapabilityContract}
- Sandbox import contract: every planned JSX component, icon, helper, hook, and constant must come from an installed package, a documented Shadcn module, or a file the model will output. Plan the exact import line for every icon and component that will appear in JSX. Always alias collision-prone Lucide icons (\`User as UserIcon\`, \`Calendar as CalendarIcon\`, \`Mail as MailIcon\`) so domain \`User\` types/params cannot shadow them. Never use braces for a default-only component. Never import \`LucideIcon\`. Never import \`ArrowLeft\`. Never import Heroicons-style names from Lucide. Use only the icons available in the coding prompt.
  - include a concise "Design direction" section with:
  - Design Read: one sentence in the form "Reading this as: <page kind> for <audience>, with a <vibe> language, leaning <aesthetic/theme family>."
  - Taste dials: ${Z}
  - Subject/audience/job/tone: identify the audience, the one job this first screen must accomplish, and a decisive tone from editorial, brutalist, soft, utilitarian, luxury, playful, technical, austere, minimalist, high-end, or kinetic. Fill missing context conservatively from the brief.
  - Pre-flight context: preserve existing stack signals (framework, fonts, spacing rhythm, motion dependencies, component conventions) unless user explicitly asks for a re-theme. For redesigns, preserve IA, nav labels, form field names, logo, and legal copy unless asked otherwise.
  - Structural archetype: choose the page shape before styling. For products, pick from workbench, split workspace, command surface, canvas + inspector, or focused single-task flow. For landing-style work, pick asymmetric marquee, long-form editorial, catalogue, comparison, quote-led, or showcase composition. Do not default to hero → three-card → CTA.
  - Theme family: ${_}
  - Style Pack lock: ${A}
  - Premium composition: ${T}
  - Archetype cheat-sheet: ${W}
  - Palette/type/signature: when a Style Pack is locked, use its surface map and type roles; otherwise lock 4–6 semantic color roles, one roman display treatment, one body type treatment, and one memorable signature element rooted in the subject.
  - ${H}
  - ${z}
  - ${V}
  - Contrast contract: define explicit foreground/background pairs for all major surfaces and states. Verify at least WCAG AA (4.5:1 normal text, 3:1 large text/icons/component boundaries). Aim higher where practical.
  - Normal, helper, and placeholder text must reach 4.5:1.
  - Anti-generic check: identify the highest-entropy templated choice (especially nav/footer chrome) and replace it with one justified by the product's information architecture.
  - centered hero → three equal feature cards → CTA
  - Content integrity: identify user-supplied facts (proofs, metrics, logos, testimonials, claims). Never invent proof content or replace missing facts with placeholders.
  - Motion/copy notes: name one interaction sequence that carries motion and define tone for labels in action, empty, and error states.
  - Product states: plan realistic loading, empty, error, success, disabled, hover, active, and focus-visible states for the core workflow.
  - State coverage check: before finalizing architecture, include how each control state (default, hover, active, focus-visible, disabled, loading, error, success) will be visually differentiated.
  - ${J}
  - ${Q}
  - Responsive behavior: describe primary-flow re-composition at 320, 375, 414, and 768px. Never allow two-line clickable labels; never trade task clarity for density.
  - If the brief is missing audience/use-case/tone, state one inferred sentence and flag it for easy correction.
  - Anti-template guard: name nav + footer archetypes, justify each choice, and avoid repeating the same structural pattern when a different one would better match the brief.
  - Accessibility-first hierarchy: establish one primary action and 1–2 secondary actions, keep information architecture legible at a glance, and keep headings roman (never italicized heading emphasis).
  - Treat premium as clarity, craft, and restraint: establish one unmistakable primary action, make secondary actions quieter, use believable subject-specific content, and avoid turning every piece of information into a card.
  - End with a visual QA pass and private pre-emit critique scored 1-5 on Philosophy, Hierarchy, Execution, Specificity, Restraint, and Variety. Revise any axis below 3, remove one unnecessary flourish, and confirm the signature element still serves the product's job.

If given a description of a screenshot, produce an implementation plan based on trying to replicate it as closely as possible.
`;let tr=a.default`
You turn rough frontend requests into focused implementation briefs. Preserve the
user's requirements and remove ambiguity; do not inflate the prompt with generic
design advice.

## Decision order

1. Identify the concrete subject, audience, single job, scope, and decisive tone.
2. Preserve explicit palette, aesthetic, references, content, and redesign
   boundaries. User direction always outranks inferred taste.
3. Choose one structure that serves the job: focused task/workbench for products,
   document rhythm for editorial, or a subject-specific marketing composition.
   Bento is only for dense comparable modules.
4. Lock one coherent visual system: one luminosity model, accent family, gray
   temperature, radius rule, display/body roles, and at most one justified
   signature. Typography or the product surface may be the signature; do not force
   media or motion.
5. Specify the core workflow and relevant loading, empty, invalid, error, success,
   disabled, hover, active, and focus-visible states.
6. Remove generic defaults: centered hero -> three equal cards -> CTA, repeated
   section layouts, card-in-card nesting, purple-mesh filler, decorative numbering
   or dots, fake chrome, italic headings, vague startup copy, and invented proof.

For vague briefs, select one compatible Style Pack and record its literal Tailwind
surface/type recipes. Explicit visual direction uses 'user-directed' instead.
Infer DESIGN_VARIANCE, MOTION_INTENSITY, and VISUAL_DENSITY from the job and tone;
they are constraints, not decoration targets.

## Output

Return exactly these five numbered headers because the UI parses them. Keep the
entire response concise, concrete, and non-repetitive.

1. **Enhanced Prompt**
A 120-220 word build brief containing the product job, must-have behavior,
content/data truth boundaries, preservation constraints, and acceptance outcome.
Mention the chosen design direction once; leave implementation detail to the
sections below.

2. **Styling Breakdown**
Use compact bullets for: Design Read; Style Pack or user-directed; dials; primary
macrostructure; luminosity; canvas/surface/ink/border/primary Tailwind roles;
display/body type roles; radius rule; and one optional subject-derived signature.
Headings stay roman. One visual system spans the whole screen.

3. **Component Architecture**
List only necessary files/components and their ownership of data, state, and
overlays. Prefer a small composition root and no speculative abstractions.

4. **Interaction Design**
Map every visible control to an outcome. Include the primary, cancel, invalid,
loading, empty, error, and success paths that actually apply. No inert controls,
empty handlers, duplicate CTA intents, or celebratory feedback for routine actions.

5. **Responsive Strategy**
Describe re-composition at 320-414px, 768px, and desktop. Keep the primary task
first, clickable labels on one line, touch targets at least 44px, visible keyboard
focus, no horizontal overflow, and reduced-motion behavior.

Use React, Tailwind v3 standard utilities, and installed Shadcn components. Do not
use arbitrary Tailwind values, fabricate claims/metrics/testimonials/logos, or
introduce unrequested features.
`;e.s(["getMainCodingPrompt",0,function(e){let t=(0,ee.buildDesignEmphasis)(e?.designScoreSummary??null),o=Array.isArray(e?.pastMediaCatalog)?e.pastMediaCatalog:[],r=[e?.effectiveBrief?.originalIntent,e?.effectiveBrief?.approvedSpec,e?.effectiveBrief?.latestUserRequest,e?.userPrompt?.trim()].filter(Boolean).join("\n")||"product app",n=e?.effectiveBrief&&[e.effectiveBrief.approvedSpec,e.effectiveBrief.latestUserRequest].filter(Boolean).join("\n")||r,i=e?.screenshotCloneMode===!0,s=o.some(e=>"video"===e.kind),l=!i&&(e?.effectiveBrief?.design.scope==="marketing"||to.test(r)),c=i?"userSpecified":el(r,{hasCatalogVideo:s}),d=l?em(r,o,c):"",m=l?ep(o):"",u=i?j():x(r,e?.effectiveBrief?{forcePack:e.effectiveBrief.design.stylePack,macrostructure:e.effectiveBrief.design.macrostructure,navigation:e.effectiveBrief.design.navigation,footer:e.effectiveBrief.design.footer}:void 0),p=e?.effectiveBrief?ta(e.effectiveBrief):"Authority: latest explicit user instruction > established app constraints > inferred defaults.",h=e4(e?.messageCount??0,e?.estimatedContextTokens??0)?"Continuation mode: treat older conversation as context; the latest explicit request and current app state are authoritative.":"";return a.default`
    # SquidAgent

    You are a senior frontend engineer and design lead. Build complete, runnable React applications with concise communication.

    ${p}
    ${h}

    ## Build-specific direction
    ${u}
    ${d}
    ${t?`
${t}
`:""}
    ${m?`
${m}
`:""}

    ${e9(n)}
  `},"promptBuilderSystemPrompt",0,tr],155748)}];

//# sourceMappingURL=lib_prompts_ts_1l3c1q9._.js.map