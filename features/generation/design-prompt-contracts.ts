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
  - Default to a light-first, Vercel-inspired Tailwind \`neutral\` system: \`bg-neutral-50 text-neutral-950\` for the canvas, \`bg-white\` or \`bg-neutral-100\` for raised surfaces, \`border-neutral-200\` for rules, \`text-neutral-600\` for secondary copy, and \`bg-neutral-950 text-neutral-50\` for the primary action. If the app needs dark mode, use the same family with \`bg-neutral-950\`, \`bg-neutral-900\`, \`border-neutral-800\`, and \`text-neutral-50\`.
  - In this fallback, every portalled overlay surface must be explicitly light: apply \`bg-white text-neutral-950 border-neutral-200\` to \`DialogContent\`, \`AlertDialogContent\`, drawer/sheet content, popovers, menus, and select content. Inputs, textareas, and select triggers inside them must likewise use \`bg-white text-neutral-950 border-neutral-200\`. Do not let an inherited/root \`dark\` class silently turn an otherwise unthemed overlay slate, gray, or near-black. A dark overlay is allowed only when the user requested a dark theme or a working theme control deliberately themes the entire rendered tree.
  - Use complete literal \`neutral-*\` utilities on theme-defining wrappers and controls so the fallback renders predictably. Semantic Shadcn classes may supplement components only when their resolved values remain neutral and do not reintroduce an unspecified chromatic theme.
  - Do not default to \`slate-*\`, \`purple-*\`, violet, indigo, blue, chromatic gradients, blurred color blooms, or colored shadow glows. Reserve red, amber, and emerald for small, truthful error, warning, and success states—not brand decoration.
  - “Vercel-inspired” means restrained product craft, not a clone: high-contrast neutral hierarchy, crisp one-pixel borders, compact \`rounded-md\`/\`rounded-lg\` radii, precise spacing, restrained \`shadow-sm\` elevation, concise copy, and a clear black or near-black primary action. Do not copy Vercel branding or force every product into a marketing-page structure.
  - Keep structure subject-specific and varied. The neutral fallback must not override the structural diversity, typography, accessibility, or explicit color-fidelity contracts.
  - Before finalizing an unspecified-theme build, verify that its theme-defining classes use the Tailwind \`neutral\` family and that no slate, purple, or decorative chromatic default slipped into the canvas, primary action, major surfaces, or hero.
`;

export const neutralThemePlanningRule =
  "Unspecified-theme default: when the user provides no explicit theme, palette, named color, visual reference, or aesthetic direction, plan a light-first Vercel-inspired Tailwind neutral system with neutral canvas/surfaces/ink, explicitly white overlay and form-control surfaces with neutral-950 foregrounds, crisp borders, compact radii, restrained shadow, and a near-black primary action; do not default to slate, purple, chromatic gradients, or colored glow.";

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

/**
 * Functional interaction contract.
 *
 * Generated interfaces often look complete while their controls are inert. This
 * contract makes every visible affordance part of a small, honest state machine
 * and reserves overlays and notifications for outcomes they communicate well.
 */
export const functionalInteractionContract = dedent`
  **Functional interaction contract (mandatory):**
  - Before writing JSX, inventory every visible button, link, menu item, tab, form, row action, and toggle. Assign each one a concrete outcome: navigate or scroll, open an appropriate dialog/drawer/menu, submit validated data, mutate visible local state, change a selection/filter/view, copy/download, or trigger an honest setup/error state. Do not emit inert controls, empty handlers, dead \`href="#"\` links, or clickable-looking decoration.
  - Build the core workflow end to end, not only its resting screen. Creation and editing flows must accept input, validate it, support cancel, update visible state on success, and make the result discoverable. Delete or other destructive actions require explicit confirmation and must actually remove or update the affected record in the UI.
  - Use Shadcn \`Dialog\` for focused create/edit/detail/settings flows, \`AlertDialog\` for destructive or irreversible confirmation, and \`Drawer\` when a narrow-screen task genuinely benefits from a bottom sheet. Give every overlay a visible title and description, focus-safe controls, Escape/close behavior, a cancel path, and responsive max-height/overflow. Do not open a modal for a simple action whose visible result is already immediate and clear.
  - Mount one Shadcn \`Toaster\` near the app root when the workflow has mutations, async completion, copy, save, publish, import, or delete actions. Use \`useToast\` for concise success or failure confirmation with terminology matching the initiating action. Keep field validation inline, keep persistent/actionable failures near the affected content, and never use a toast as the only explanation of a blocking error.
  - Buttons that represent unavailable infrastructure must be disabled or open an honest setup state; never fake authentication, payment, persistence, email, upload, or server-side success. For browser-only demos, meaningful local state is acceptable, but do not imply that it persists remotely.
  - Use semantic elements and state attributes: navigation uses real links with valid destinations, actions use \`type="button"\`, form submission uses \`type="submit"\`, toggles expose \`aria-pressed\` or their native checked state, menus/dialogs expose their Shadcn semantics, and icon-only controls have stable accessible names.
  - Verify the interaction graph privately before emitting files: exercise the primary path plus cancel, invalid input, empty, loading/disabled, success, and error/retry paths; remove any control whose behavior is still undefined.
`;

export const functionalInteractionPlanningRule =
  "Interaction inventory: list the core workflow and every meaningful control outcome, including which create/edit/detail/settings tasks use Dialog or Drawer, which destructive actions use AlertDialog, where inline validation appears, which completed mutations warrant a toast, and how visible local state changes. No planned control may be inert or point to a dead # link.";

/**
 * Theme behavior contract.
 *
 * Tailwind dark variants only become an application feature when a control owns
 * and applies theme state. This contract keeps the visual and behavioral halves
 * of a generated theme toggle together.
 */
export const themeToggleContract = dedent`
  **Theme behavior contract (mandatory whenever a theme control is rendered):**
  - A light/dark control is functional product state, never decorative. Initialize from a valid persisted preference, otherwise use \`window.matchMedia("(prefers-color-scheme: dark)")\`; on change, immediately toggle the \`dark\` class on \`document.documentElement\`, set \`document.documentElement.style.colorScheme\`, update React state, and persist the choice in \`localStorage\`. If a three-way system option is offered, subscribe to OS changes only while system mode is active and clean up the listener.
  - The control must clearly communicate its current state and next action with visible icon/text plus a dynamic \`aria-label\`, \`title\`, and \`aria-pressed\` or native checked state. It must work by keyboard and must not briefly reset when unrelated app state changes.
  - Theme the whole rendered tree, not only the page background: canvas, raised surfaces, text, muted text, borders, inputs, menus, dialogs, drawers, toasts, tooltips, tables, charts, empty/error states, focus rings, hover/selected/disabled states, and scroll/overlay treatments all need intentional light and dark pairs. Portalled Shadcn surfaces must respond through the root HTML class.
  - Use complete literal Tailwind \`dark:\` pairs on theme-defining surfaces unless the generated app explicitly defines every semantic token it uses. Audit for hard-coded white/black or gray values that become unreadable in the opposite mode, including SVG/chart fills, inline styles, translucent layers, and third-party component props.
  - If no theme control is rendered, preserve the requested or existing theme and do not add a nonfunctional toggle merely as decoration.
`;

export const themeTogglePlanningRule =
  "Theme behavior: if the plan includes a theme control, specify persisted light/dark state initialized from the OS, root-html class and color-scheme updates, a keyboard-accessible state label, and complete light/dark treatment for portalled overlays, toasts, forms, data visualizations, and every interaction state. If there is no theme control, do not invent a decorative one.";
