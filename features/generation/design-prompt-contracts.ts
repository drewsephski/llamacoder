import dedent from "dedent";
import {
  stylePackContract,
  stylePackPlanningRule,
} from "@/features/generation/style-packs";
import {
  premiumCompositionContract,
  premiumCompositionPlanningRule,
} from "@/features/generation/premium-composition-contract";

export { stylePackContract, stylePackPlanningRule };
export { premiumCompositionContract, premiumCompositionPlanningRule };
export {
  selectStylePackId,
  hasExplicitAestheticDirection,
  inferSubjectBucket,
  hashBriefSeed,
  getStylePack,
  formatStylePackPreflight,
  buildActiveStylePackDirective,
  STYLE_PACKS,
  STYLE_PACK_IDS,
} from "@/features/generation/style-packs";
export type {
  StylePackId,
  StylePack,
  SubjectBucket,
} from "@/features/generation/style-packs";

export const tailwindColorFidelityContract = dedent`
  **Explicit color fidelity contract (mandatory):**
  - A color named by the user is a hard visual requirement, not loose inspiration. Preserve the exact Tailwind family: \`purple\` stays \`purple\`, not violet, indigo, fuchsia, white, or gray.
  - Match the requested scope. “Make the app purple” changes the root canvas and principal surfaces into a coherent set of purple shades; “make this button purple” changes that control. Never reduce a whole-app color request to a tiny accent.
  - Use complete, literal, static Tailwind v3 utilities in emitted source, such as \`bg-purple-950 text-purple-50 border-purple-800 hover:bg-purple-900 focus-visible:ring-purple-400\` or \`bg-purple-100 text-purple-950\`. The examples illustrate valid class form; choose shades that fit the requested tone and contrast needs.
  - Never construct Tailwind class names with interpolation, concatenation, partial fragments, or runtime data (for example, never use \`bg-\${color}-500\`). Tailwind cannot reliably discover those classes. If variants are data-driven, map each variant to complete literal class strings.
  - Semantic classes such as \`bg-background\` and \`bg-primary\` are allowed when the user did not name a concrete color, or when the generated output explicitly defines those tokens to the requested hue. Otherwise use literal palette utilities so the requested color is guaranteed to render.
  - Keep foreground, border, hover, active, focus-visible, selected, and disabled colors in a deliberate compatible scale. If contrast fails, adjust the shade within the requested family; do not replace the requested colored surface with white or gray.
  - On edits, replace conflicting legacy \`bg-*\`, \`text-*\`, \`border-*\`, gradient, and dark-mode color classes in the requested scope. Do not append competing utilities and rely on class order to decide which color wins.
  - Before finalizing, inspect the emitted files and verify that the requested literal color family appears on the intended elements, no later class overrides it, and the visible result still satisfies the contrast contract.
`;

export const tailwindColorPlanningRule =
  "Explicit color fidelity: when the user names a color, record the exact standard Tailwind family and whether it is the canvas, surface, primary, or accent role. Preserve that family in implementation; do not substitute a neighboring hue, a semantic token with an unknown value, or a white/gray fallback.";

/**
 * Unspecified-theme default — Style Pack lock (replaces anonymous Vercel-neutral SaaS).
 * Full pack catalog and class recipes live in style-packs.ts.
 */
export const neutralThemeDefaultContract = stylePackContract;

/** @deprecated Prefer stylePackPlanningRule — alias retained for import stability. */
export const neutralThemePlanningRule = stylePackPlanningRule;

export const unspecifiedThemeStylePackContract = stylePackContract;
/**
 * Visual-system coherence contract.
 *
 * A palette can contain individually valid colors and still fail as a system.
 * This contract makes the model decide surface roles, luminosity, emphasis, and
 * data-visualization treatment together before it writes component classes.
 */
export const visualSystemCoherenceContract = dedent`
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
  - Before emitting files, run a surface audit: list each unique \`bg-*\` role used by a major region, identify its direct foreground and muted foreground, and fix any unpaired, mixed-luminosity, duplicate-emphasis, or low-contrast combination. If the screen still looks like disconnected light and dark themes stitched together, revise the whole role map rather than patching one text class.
`;

export const visualSystemPlanningRule =
  "Visual-system coherence: define a compact surface-role map with explicit foregrounds, choose one screen-wide luminosity model, allow at most one focal inverse region, name one optional subject-derived accent and its jobs, describe hierarchy without a uniform card grid, and specify explicit chart axis/grid/tooltip/legend colors whenever data visualization is present.";

/**
 * Typography fidelity contract.
 *
 * Mirrors the color-fidelity contract's discipline (lock it once, reuse it
 * everywhere, never improvise mid-render) but applied to font roles instead
 * of colors. Generic, unlocked typography is one of the most common ways
 * generated UIs read as templated rather than designed.
 */
export const tailwindTypographyFidelityContract = dedent`
  **Typography fidelity contract (mandatory):**
  - Lock exactly one display role and one body role before writing any component, then reuse those two font treatments for every heading and every paragraph in the app. Add a third utility role only when data, code, or captions genuinely need a distinct monospace/tabular treatment — never as decoration.
  - Never reference a font family that is not actually imported/installed in the generated app. If a specific characterful face cannot be confirmed available, build character through scale, weight, tracking, and case on a real, available face rather than naming an aspirational font that will silently fall back.
  - Avoid leaning on Inter, Roboto, Arial, system-ui, Open Sans, or Poppins as the page's only voice. If a system/default sans is the body face, pair it with a display face that carries genuine character so the page doesn't read as generic SaaS defaults.
  - Headings and display type are always roman — never italicized, and never with a single italic emphasis word inside an otherwise upright heading. Reserve italics, if used at all, for inline emphasis inside running body copy.
  - Build hierarchy with explicit levels (primary headings, secondary labels, supporting microcopy) and clear reading rhythm before tweaking color. Avoid typographic effects that do not increase meaning.
  - Once a size/weight/tracking combination is chosen for a heading level (h1, h2, card title, label, etc.), reuse that exact combination for every instance of that level. Do not vary heading treatment ad hoc from section to section.
  - On edits, replace conflicting legacy font-family, font-weight, and tracking utilities in the requested scope rather than layering new type classes on top of old ones.
`;

export const typographyPlanningRule =
  "Typography fidelity: lock exactly one display role and one body role for the whole app before writing components; add a third utility role only if data/captions require it, never introduce it as decoration, and never italicize headings.";

/**
 * Structural diversity contract.
 *
 * The single highest-leverage difference between output that looks
 * "generated" and output that looks "designed" is usually not color or
 * font choice — it's whether the page shape, nav, and footer are the same
 * as every other AI-built page. This contract makes navigation and footer
 * explicit structural decisions (not filler chrome) and requires visible
 * variety across apps built in the same session, so a builder generating
 * many apps back-to-back doesn't converge on one templated silhouette.
 */
export const structuralDiversityContract = dedent`
  **Structural diversity contract (mandatory):**
  - Treat navigation and footer as structural decisions tied to the information architecture, not filler chrome to fill out a template. Before building either, silently pick and justify an archetype against the subject:
    - Nav options: minimal two-item mark (only when there truly are ~2 destinations), dense inline-link bar with a filled primary action, floating pill/chip nav, side-rail nav, a visible search/command trigger for search- or docs-heavy products, an editorial masthead, an edge-aligned nav, an announcement-banner-plus-retracting-nav pairing, or a nav folded directly into a workbench/toolbar for tool-shaped products that have no separate marketing chrome at all.
    - Footer options: a single statement line with minimal links and no sitemap, a compact utility/status bar (version, links, environment) for tools and dashboards, a colophon-style dense block for editorial or documentation contexts, a multi-column index only when the product is genuinely a docs root or hub with that many real destinations, or no separate footer when the product is a full-height application shell where a footer would just push content off-screen.
  - For every nav archetype, define one centered chrome shell first: a predictable max-width container (usually \`max-w-6xl\` to \`max-w-7xl\`) with \`mx-auto\` and symmetric horizontal padding, then place the nav inside it. Centering is the default baseline even when links are left- or right-biased.
  - Before finalizing any nav, log the shell plan in prose as a preflight: selected max-width, horizontal padding, mobile collapse behavior at 320/375/414/768, and whether links are centered, edge-biased, or split inside that shell.
  - Mobile behavior must preserve centered structure, not drift: at 320, 375, 414, and 768px collapse dense navs into safe touch-size layouts, stack when needed, and keep the shell centered with equal side gutters.
  - Default away from "wordmark-left + three or four generic links + button-right" nav and "four-column link grid + social row + tiny copyright" footer. These are the most recognizable templated patterns; reach for them only when the brief's actual information architecture has that many top-level destinations to justify them.
  - Within a single build session, do not repeat the same page archetype, nav treatment, and dominant accent hue as the immediately preceding app generated in this conversation, unless the user is iterating on that same app or explicitly asks to match it. Vary at least one of those three axes so consecutive apps read as distinct products, not reskins of one template.
  - Confirm mobile nav/footer density at 320, 375, 414, and 768px so navigation and legal/support links do not crowd or disappear while preserving core task accessibility.
  - This contract governs structure and chrome; it never overrides the color fidelity contract, the typography fidelity contract, or any explicit user requirement.
`;

export const structuralDiversityPlanningRule =
  "Structural diversity: name a nav archetype and a footer archetype (or an explicit, justified absence of a footer) as deliberate choices tied to the information architecture, avoiding the generic wordmark+links+button nav and four-column footer defaults unless the brief genuinely has that many destinations, and varying structure from the immediately preceding app generated in this session.";

export const premiumArchetypeAndThemeContract = dedent`
  **Premium archetype and theme contract (mandatory):**
  - Use this dispatch model before choosing layout:
    - **Bento Grid**: multiple comparable actions/features/modules (usually 6+) with at least 2 valid entry paths.
    - **Marquee Hero**: one clear thesis or promise-first goal with one featured action.
    - **Workbench / split-workspace**: tool-like, state-heavy, command-driven, create/edit/apply/delete workflows.
    - **Conversational FAQ**: sequential question-answer tasks where interaction is gated by answers.
    - **Long Document / editorial**: one long-form narrative product, policy, or case text is the job.
  - Pick one primary macrostructure and name it explicitly. Do not switch archetype midway through building the same screen.
  - For work with dense operations, choose a work-first shell ('workbench-shell' + toolbar + canvas/panel + contextual side rail) rather than a hero-first card shell.
  - For **Bento Grid**, use explicit tile spans ('span-2x2', 'span-2x1', 'span-1x2', 'span-1x1') on a 'bento' container so shape is deliberate.
  - For all screen-level variants, avoid per-section theme changes. Use one theme family and one global luminosity model unless the brief explicitly asks for contrast inversion.
  - Keep motion meaningful: one intentional signature transition for engagement and one confirmation/feedback motion; avoid utility-level effects on every element.
  - Header/nav baseline for all profiles: centered shell, explicit width rhythm, and visible baseline alignment (\`max-w\` + \`mx-auto\` + balanced padding) so nav chrome never drifts toward one edge.
  - If the user does not provide a brand palette or aesthetic direction, do **not** invent a second theme system here — lock one Style Pack from the Unspecified-theme Style Pack contract (Hallmark names are pack aliases: Cobalt→cobaltMinimal, Lumen→lumenAtmospheric, Specimen→editorialSpecimen, Brutal→swissBrutal, Carnival→kineticAwwwards, Hum→softStructural). Emit the STYLE_PACK preflight and use that pack's literal surface map.
  - Theme routing when the user IS explicit (or after a pack is locked):
    - Creative / portfolio / luxury directions -> ornamental but purposeful visual signature (motion + texture + contrast pivots) within the locked pack.
    - Technical / data-heavy / workflows -> utilitarian minimal, high-legibility tones with restrained ornamentation.
    - Editorial / content-led -> rhythm-first hierarchy and low-motion polish.
    - If the user explicitly states a tone, lock it. If silent, the Style Pack router already chose; do not override it with anonymous gray SaaS.
  - Hallmark style profile selection (maps 1:1 to Style Packs — never a competing default):
    - Editorial / Specimen → editorialSpecimen pack.
    - Modern-minimal / Cobalt → cobaltMinimal pack.
    - Atmospheric / Lumen → lumenAtmospheric pack.
    - Playful / Hum → softStructural pack.
    - Kinetic / Carnival → kineticAwwwards pack.
    - Brutal / Swiss Industrial → swissBrutal pack.
  - Brutal tone mechanics (when swissBrutal or user asks brutalist):
    - Use a raw, edge-driven register: heavy borders, sharp section edges, strong density contrasts, minimal decorative ornament.
    - Prefer slab / condensed display behavior, tracked caps only when they add intent, no unnecessary rounded corners on primary containers.
    - Keep motion strict and explicit: at most three intentional motion primitives on the page, no elastic/bouncy easings by default, and no universal hover choreography.
    - Require one bold signature element and remove all decorative extras.
  - Reject multi-theme surfaces. One screen should have one primary Style Pack / theme family and one consistent surface map.
`;
export const premiumArchetypeAndThemeCheatSheet = dedent`
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
`;
export const premiumArchetypeAndThemePlanningRule =
  "Pick the primary archetype from intent: single-thesis screen = Marquee Hero; multiple entry points / modules = Bento Grid; tool/flow-centric = Workbench; content/docs with question path = Conversational FAQ. State the exact archetype and interaction intent before writing sections; declare 2–4 required user outcomes (create/edit/submit/update/filter/confirm etc.). When the brief is vague, lock one Style Pack (Hallmark names are aliases only) and one luminosity model; do not create per-section mini-themes or a second anonymous gray theme.";
/**
 * Functional interaction contract.
 *
 * Generated interfaces often look complete while their controls are inert. This
 * contract makes every visible affordance part of a small, honest state machine
 * and reserves overlays and notifications for outcomes they communicate well.
 */
export const functionalInteractionContract = dedent`
  **Functional interaction contract (mandatory):**
  - Before writing JSX, inventory every visible button, link, menu item, tab, form, row action, and toggle. Assign each one a concrete outcome: navigate or scroll, open an appropriate dialog/drawer/menu, submit validated data, mutate visible local state, change a selection/filter/view, copy/download, or trigger an honest setup/error state. Do not emit inert controls, empty handlers, or clickable-looking decoration.
  - Build the core workflow end to end, not only its resting screen. Creation and editing flows must accept input, validate it, support cancel, update visible state on success, and make the result discoverable. Delete or other destructive actions require explicit confirmation and must actually remove or update the affected record in the UI.
  - Use Shadcn \`Dialog\` for focused create/edit/detail/settings flows, \`AlertDialog\` for destructive or irreversible confirmation, and \`Drawer\` when a narrow-screen task genuinely benefits from a bottom sheet. Give every overlay a visible title and description, focus-safe controls, Escape/close behavior, a cancel path, and responsive max-height/overflow. Do not open a modal for a simple action whose visible result is already immediate and clear.
  - Mount one Shadcn \`Toaster\` near the app root when the workflow has mutations, async completion, copy, save, publish, import, or delete actions. Use \`useToast\` for concise success or failure confirmation with terminology matching the initiating action. Keep field validation inline, keep persistent/actionable failures near the affected content, and never use a toast as the only explanation of a blocking error.
  - Buttons that represent unavailable infrastructure must be disabled or open an honest setup state; never fake authentication, payment, persistence, email, upload, or server-side success. For browser-only demos, meaningful local state is acceptable, but do not imply that it persists remotely.
  - Use semantic elements and state attributes: navigation uses real links with valid destinations, actions use \`type="button"\`, form submission uses \`type="submit"\`, toggles expose \`aria-pressed\` or their native checked state, menus/dialogs expose their Shadcn semantics, and icon-only controls have stable accessible names.
  - For any control with asynchronous behavior or important state changes, explicitly support and style hover, active, focus-visible, disabled, loading, success, and error states. Do not leave core actions visually static while behavior changes.
  - All interactive controls should remain discoverable on keyboard and pointer: enforce 44px minimum touch targets, one-line action labels, and explicit visible focus order.
  - Verify the interaction graph privately before emitting files: exercise the primary path plus cancel, invalid input, empty, loading/disabled, success, and error/retry paths; remove any control whose behavior is still undefined.
`;

export const functionalInteractionPlanningRule =
  "Interaction inventory: list the core workflow and every meaningful control outcome, including which create/edit/detail/settings tasks use Dialog or Drawer, which destructive actions use AlertDialog, where inline validation appears, which completed mutations warrant a toast, and how visible local state changes. No planned control may be inert.";

/**
 * Theme behavior contract.
 *
 * Tailwind dark variants only become an application feature when a control owns
 * and applies theme state. This contract keeps the visual and behavioral halves
 * of a generated theme toggle together.
 */
export const themeToggleContract = dedent`
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
`;

export const themeTogglePlanningRule =
  "Theme behavior: if the plan includes a theme control, specify one shared light/dark state owner initialized from localStorage with an OS fallback; every control must call the same toggle handler, toggle the dark class on document.documentElement, update document.documentElement.style.colorScheme, persist the choice, expose a keyboard-accessible dynamic state label, and theme portalled overlays, toasts, forms, data visualizations, and every interaction state. If there is no theme control, do not invent a decorative one.";

/**
 * Design Taste contract.
 *
 * Distills distinctive principles from the design-taste / UI skill suite
 * (anti-slop dials, aesthetic modes, hero discipline, motion motivation,
 * redesign protocol) into rules compatible with Squid's sandbox:
 * Lucide-limited icons, framer-motion, and Tailwind v3 without arbitrary values.
 */
export const designTasteContract = dedent`
  **Design Taste contract (mandatory for distinctive UI):**

  ### Brief inference (before classes)
  - Infer page kind (product surface / landing / portfolio / editorial / redesign), vibe words, audience, and quiet constraints (a11y, regulated, trust-first). Quiet constraints override aesthetic preference.
  - State one Design Read line in planning: "Reading this as: <kind> for <audience>, with a <vibe> language, leaning <aesthetic/theme family>."
  - Anti-default: do not reach for AI-purple gradients, dark-mesh centered hero, three equal feature cards, Inter/slate corporate chrome, glass on every surface, or infinite decorative micro-loops.

  ### Taste dials (set once, then obey)
  - Lock three dials before styling: DESIGN_VARIANCE (1=symmetric … 10=asymmetric), MOTION_INTENSITY (1=static … 10=cinematic), VISUAL_DENSITY (1=airy … 10=cockpit). Baseline for marketing/portfolio: 8 / 6 / 4.
  - Map from vibe: minimal/calm/Linear → 5-6 / 3-4 / 2-3; premium/Apple-y/luxury → 7-8 / 5-7 / 3-4; playful/Awwwards/agency → 9-10 / 8-10 / 3-4; trust/public-sector → 3-4 / 2-3 / 4-5; product workbench/dashboard → 4-6 / 3-5 / 6-8; redesign-preserve → match existing / +1 motion / match density; redesign-overhaul → +2 variance / +2 motion / match density.
  - Variance > 4: prefer asymmetric, split, or offset compositions over centered hero stacks. Density > 7: prefer borders, divide-y, and negative space over boxed metric cards; use mono/tabular treatment for numbers. Motion > 4: the page must actually move (entrance, state change, or scroll reveal); if you cannot ship working motion, drop the dial rather than claiming cinematic and shipping static.

  ### Anti-slop tells (hard bans unless the brief explicitly demands them)
  - Em-dash and en-dash as separators are forbidden in visible UI copy. Use a period, comma, colon, parentheses, or a regular hyphen.
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
  - Design Read + dials stated; theme/color/shape locks held; zero em/en-dash separators in UI copy.
  - Hero (if marketing) viewport-fit; eyebrow ration; no zigzag×3; no duplicate CTA intent; no mid-page theme flip.
  - Serif justified or absent; premium palette not cream+brass default; one accent family throughout.
  - Motion motivated + reduced-motion path; real product content (no fake chrome/proof); section layout families varied.
  - Buttons/forms meet contrast and 44px targets; CTA labels stay one line at desktop; copy self-audited for AI-cute nonsense.
`;

export const designTastePlanningRule =
  "Design Taste: before styling, write one Design Read line and lock DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY (use the Style Pack dials when a pack is locked); pick at most one aesthetic mode matching that pack; enforce anti-slop bans (em-dash, three-card hero template, fake chrome, section-number eyebrows, duplicate CTA intents); for redesigns preserve IA/nav labels/field names and modernize via type→spacing→color→motion→hero; end planning with the Design Taste preflight checklist.";
