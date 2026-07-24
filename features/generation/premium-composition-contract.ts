import dedent from "dedent";

/**
 * Premium composition craft — the gap between "enhanced prompt" output and
 * flat normal builds. Forces mixed-cell instrument layouts, hairline bentos,
 * and motivated stagger motion using legal Tailwind v3 (no arbitrary brackets).
 */
export const premiumCompositionContract = dedent`
  **Premium composition contract (mandatory for distinctive product UI):**

  Enhanced-quality builds win because they ship *crafted modules*, not color swaps on three equal cards. Normal codegen must match that craft.

  ### Hard composition rules
  - Ban the lazy module: three (or four) equal \`icon + h3 + paragraph\` cards in one row. If you catch yourself building that, replace it with a mixed-cell board from the locked Style Pack scaffold.
  - Prefer a **hairline bento** for tool/API/dashboard/product modules: \`grid grid-cols-1 md:grid-cols-12 gap-px bg-neutral-200 border border-neutral-200 rounded-xl overflow-hidden\` (use the pack's border family: stone/neutral dark rails as appropriate). Cells are solid surfaces (\`bg-white\` or pack surface) with \`p-8\`, spanning \`md:col-span-6\`, \`md:col-span-4\`, etc. — uneven spans are required.
  - Mix cell *jobs* inside one board: at least two of { live data/stream table, regional/metric readout, short capability copy, inverse CLI/terminal panel }. Same-job cells only are a fail.
  - Instrument labels: \`text-xs font-mono uppercase tracking-widest\` + muted ink + small allowlisted Lucide icon (\`h-4 w-4\`). Use these sparingly as cell headers — not as section-number eyebrows.
  - Section rhythm: marketing/content sections use \`py-24\` / \`py-32 md:py-48\`; product boards sit in \`max-w-7xl mx-auto px-6\`.
  - Motion: for any multi-cell board, use Framer Motion stagger — parent \`variants\` with \`staggerChildren\`, children \`whileInView\` / parent \`whileInView="show"\` + \`viewport={{ once: true }}\`, animate \`opacity\` + \`y\` only. Respect \`prefers-reduced-motion\` by skipping stagger when reduced. Define variants in the same file or a tiny local constant — do not leave motion decorative and unused.
  - CLI / inverse panels are real product surfaces (\`bg-neutral-950 text-neutral-300 font-mono text-xs rounded-md p-3\`), not fake macOS window chrome with traffic lights.
  - Use standard type sizes only: \`text-xs\`, \`text-sm\`, \`text-base\`, \`text-lg\`, \`text-3xl\`, \`text-5xl\`, \`text-7xl\` — never \`text-[13px]\` or other arbitrary brackets. Prefer \`neutral-*\` / pack families over \`slate-*\` unless the user asked for slate.
  - Status colors stay semantic: emerald for success/HIT, amber for warn/MISS, red for error — never rainbow decoration.

  ### Preflight (fail any → revise)
  - Is there at least one mixed-span board or double-bezel/asymmetric opening from the locked pack scaffold?
  - Are cell spans uneven (not 4+4+4 or 3+3+3 equals)?
  - Does motion actually run on the board (variants wired), or is it static?
  - Did you avoid three equal icon cards?
  - Are all classes standard Tailwind (no arbitrary brackets)?
`;

export const premiumCompositionPlanningRule =
  "Premium composition: plan at least one mixed-cell hairline bento or pack scaffold (uneven md:col-span values, instrument mono labels, optional inverse CLI cell, Framer stagger whileInView); forbid three equal icon+heading+paragraph cards as the primary module pattern.";
