import dedent from "dedent";

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

export const neutralThemeDefaultContract = dedent`
  **Unspecified-theme default (mandatory):**
  - Apply this fallback to every new app when the user has not explicitly supplied a theme, palette, named color, visual reference, or aesthetic direction. Explicit user direction always wins. For edits to an existing app, preserve its established theme unless the user asks to restyle or recolor it.
  - Default to a light-first, Vercel-inspired Tailwind \`neutral\` system: \`bg-neutral-50 text-neutral-950\` for the canvas, \`bg-white\` or \`bg-neutral-100\` for raised surfaces, \`border-neutral-200\` for rules, \`text-neutral-600\` for secondary copy, and \`bg-neutral-950 text-neutral-50\` for the primary action. Use a dark neutral system with \`bg-neutral-950\`, \`bg-neutral-900\`, \`border-neutral-800\`, and \`text-neutral-50\` only when the user requests dark mode or the app includes a complete working theme control.
  - In this fallback, every portalled overlay surface must be explicitly light: apply \`bg-white text-neutral-950 border-neutral-200\` to \`DialogContent\`, \`AlertDialogContent\`, drawer/sheet content, popovers, menus, and select content. Inputs, textareas, and select triggers inside them must likewise use \`bg-white text-neutral-950 border-neutral-200\`. Do not let an inherited/root \`dark\` class silently turn an otherwise unthemed overlay slate, gray, or near-black. A dark overlay is allowed only when the user requested a dark theme or a working theme control deliberately themes the entire rendered tree.
  - Use complete literal \`neutral-*\` utilities on theme-defining wrappers and controls so the fallback renders predictably. Semantic Shadcn classes may supplement components only when their resolved values remain neutral and do not reintroduce an unspecified chromatic theme.
  - Do not default to \`slate-*\`, \`purple-*\`, violet, indigo, blue, chromatic gradients, blurred color blooms, or colored shadow glows. Red and amber remain truthful error/warning colors. One restrained, subject-derived accent family may support the primary action, selected navigation, focus, or a key data series when it adds meaning; if the subject offers no honest cue, stay neutral. Never distribute several decorative accent hues around the interface.
  - “Vercel-inspired” means restrained product craft, not a clone: high-contrast neutral hierarchy, crisp one-pixel borders, compact \`rounded-md\`/\`rounded-lg\` radii, precise spacing, restrained \`shadow-sm\` elevation, concise copy, and a clear black or near-black primary action. Do not copy Vercel branding or force every product into a marketing-page structure.
  - Keep structure subject-specific and varied. The neutral fallback must not override the structural diversity, typography, accessibility, or explicit color-fidelity contracts.
  - Before finalizing an unspecified-theme build, verify that its theme-defining classes use the Tailwind \`neutral\` family and that no slate, purple, or decorative chromatic default slipped into the canvas, primary action, major surfaces, or hero.
`;

export const neutralThemePlanningRule =
  "Unspecified-theme default: when the user provides no explicit theme, palette, named color, visual reference, or aesthetic direction, plan a light-first Vercel-inspired Tailwind neutral system with neutral canvas/surfaces/ink, explicitly white overlay and form-control surfaces with neutral-950 foregrounds, crisp borders, compact radii, restrained shadow, and a near-black primary action; do not default to slate, purple, chromatic gradients, or colored glow.";

/**
 * Visual-system coherence contract.
 *
 * A palette can contain individually valid colors and still fail as a system.
 * This contract makes the model decide surface roles, luminosity, emphasis, and
 * data-visualization treatment together before it writes component classes.
 */
export const visualSystemCoherenceContract = dedent`
  **Visual system coherence contract (mandatory):**
  - Before writing JSX, lock a compact surface-role map and reuse it everywhere. For the unspecified light theme, use: canvas = \`bg-neutral-50 text-neutral-950\`; primary surface = \`bg-white text-neutral-950 border-neutral-200\`; subdued surface = \`bg-neutral-100 text-neutral-700 border-neutral-200\`; inverse surface = \`bg-neutral-950 text-neutral-50 border-neutral-800\`; and one optional subject-derived accent role with its own explicit high-contrast foreground. Do not improvise new surface/foreground pairs component by component.
  - Choose one luminosity model for the screen. The unspecified-theme default is light. Do not create visual drama by dropping a collection of near-black cards into an otherwise white app shell. An inverse surface is an exception reserved for at most one genuinely focal region or primary action area on a screen; it is not the default treatment for metric cards, tables, charts, side panels, or every content section.
  - Every surface-setting wrapper must set its own foreground, and every nested override must remain compatible. Dark neutral surfaces use \`text-neutral-50\`/\`text-neutral-100\` for primary content and \`text-neutral-300\`/\`text-neutral-400\` for secondary content; light surfaces use \`text-neutral-950\`/\`text-neutral-900\` and \`text-neutral-600\`/\`text-neutral-700\`. Never place \`text-neutral-950\`, \`text-neutral-900\`, or low-opacity black on \`bg-neutral-950\`/\`bg-neutral-900\`; never place white or very pale text on white/neutral-50. Do not use opacity as a substitute for choosing a readable foreground.
  - Build hierarchy with composition before color. Give the screen one dominant work area, then group supporting information with spacing, alignment, dividers, and typography. Do not render a uniform army of same-sized, same-colored cards. Dashboard metrics should normally sit on light surfaces or in one grouped summary band; charts, activity rows, and support content should not all receive the same heavy container treatment.
  - Make information hierarchy readable at a glance: primary values and task titles receive the strongest contrast, supporting labels remain comfortably legible, and metadata recedes without becoming faint. Reserve uppercase plus wide tracking for short tertiary labels only; never use it for essential instructions or as the only distinction between every dashboard section. Use tabular numerals for aligned quantitative data when available.
  - A neutral foundation is not a lifeless interface. When the subject provides a natural cue, choose exactly one restrained accent family and use it consistently for the most important action, selected state, focus treatment, and/or primary data series. Keep most surface area neutral, keep status colors semantic, and never use weak gray text on the accent.
  - Data visualization inherits the screen's luminosity model. Explicitly style every chart title, value, axis label, tick, grid line, legend, tooltip, annotation, and empty/loading state for its actual background; never rely on a chart library's default or inherited text color. Use the accent for the primary series, quieter neutrals for scaffolding, and ensure the data—not the container—is the highest-contrast element.
  - Use elevation sparingly: prefer a one-pixel border and spacing for ordinary grouping, \`shadow-sm\` for truly raised controls or overlays, and no large shadow on every panel. Radius, border, shadow, and padding choices must communicate hierarchy instead of repeating one generic card recipe.
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
  - Default away from "wordmark-left + three or four generic links + button-right" nav and "four-column link grid + social row + tiny copyright" footer. These are the most recognizable templated patterns; reach for them only when the brief's actual information architecture has that many top-level destinations to justify them.
  - Within a single build session, do not repeat the same page archetype, nav treatment, and dominant accent hue as the immediately preceding app generated in this conversation, unless the user is iterating on that same app or explicitly asks to match it. Vary at least one of those three axes so consecutive apps read as distinct products, not reskins of one template.
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
  - For work with dense operations, choose a work-first shell (`workbench-shell` + toolbar + canvas/panel + contextual side rail) rather than a hero-first card shell.
  - For **Bento Grid**, use explicit tile spans (`span-2x2`, `span-2x1`, `span-1x2`, `span-1x1`) on a `bento` container so shape is deliberate.
  - For all screen-level variants, avoid the per-section mini-theme pattern. Name one theme family and one global luminosity model unless the brief explicitly asks for a contrast inversion.
  - Theme routing:
    - Creative / portfolio / luxury directions -> ornamental but purposeful visual signature (motion + texture + contrast pivots).
    - Technical / data-heavy / workflows -> utilitarian minimal, high-legibility tones with restrained ornamentation.
    - Editorial / content-led -> rhythm-first hierarchy and low-motion polish.
  - If the user explicitly states a tone, lock it. If silent, infer one stable tone from subject and audience.
  - Reject multi-theme surfaces. One screen should have one primary theme family and one consistent surface map.
`;

export const premiumArchetypeAndThemeCheatSheet = dedent`
  **Premium archetype + component cheat-sheet (plan-ready):**
  - **Bento Grid:** use for comparable modules, service tiles, dashboards with equal priority cards.
    - `bento` = container.
    - `span-2x2` = anchor tile.
    - `span-2x1` = wide tile.
    - `span-1x2` = tall tile.
    - `span-1x1` = regular tile.
  - **Marquee Hero:** use for one thesis, one narrative, one primary action.
  - **Workbench:** use `workbench-shell`, `toolbar`, `canvas`, `inspector`, and `activity` regions.
  - **Conversational FAQ:** use question cards, answer progression, and clear next-step affordances.
  - **Theme families (default behavior):** Creative/portfolio/luxury, technical/workflow, editorial/content. Pick one family and apply it everywhere.
  - **Hallmark-compatible theme catalog (for tone-rich but disciplined projects):**
    Specimen, Atelier, Brutal, Newsprint, Studio, Manifesto, Terminal, Midnight, Almanac, Garden, Riso, Sport, Bloom, Coral, Cobalt, Aurora, Editorial, Carnival, Lumen, Hum.
    Use one family unless the brief explicitly requests custom tone work; never split theme families in one screen.
`;

export const premiumArchetypeAndThemePlanningRule =
  "Pick the primary archetype from intent: single-thesis screen = Marquee Hero; multiple entry points / modules = Bento Grid; tool/flow-centric = Workbench; content/docs with question path = Conversational FAQ. State the exact archetype and interaction intent before writing sections; declare 2–4 required user outcomes (create/edit/submit/update/filter/confirm etc.). Commit to one theme family and one luminosity model for the screen unless user explicitly requests change; do not create per-section mini-themes.";

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
