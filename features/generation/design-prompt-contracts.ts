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