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
