import dedent from "dedent";

import { buildRequestScopedCapabilityContract } from "@/lib/generated-app-capabilities";
import shadcnDocs from "@/lib/shadcn-docs";

/** Approximate token count using the repository's 4-chars-per-token heuristic. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

const COMPRESS_THRESHOLD_TOKENS = 6000;
const COMPRESS_MESSAGE_COUNT = 12;

/**
 * Long conversations use the same canonical rules, but callers may use this
 * signal to tell the model to prioritize the latest brief over stale context.
 */
export function shouldUseCompressedPrompt(
  messageCount: number,
  estimatedContextTokens: number,
): boolean {
  return (
    messageCount >= COMPRESS_MESSAGE_COUNT ||
    estimatedContextTokens >= COMPRESS_THRESHOLD_TOKENS
  );
}

/**
 * Canonical direct-codegen contract. Keep this concise: build-specific design
 * direction is injected separately by getMainCodingPrompt().
 */
export function getCanonicalCodingPrompt(brief = ""): string {
  return dedent`
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
  ${shadcnDocs.map((component) => "- " + component.name + ": " + component.importDocs).join("\n")}

  ${buildRequestScopedCapabilityContract(brief)}

  ## Output contract
  - Return only generated source files. User-facing progress is streamed separately by the product; do not add an acknowledgment, summary, explanation, Design Read, dials, Style Pack, surface-map, critique, or nav/footer planning to this response.
  - Emit each complete file once as \`\`\`tsx{path=App.tsx} ... \`\`\`. Put exactly three backticks at the start of the line, never indent the fence, and always include a full sandbox-root-relative path. Iterations emit only changed files. 'App.tsx' uses a default export.
  - Before emitting, verify: every import resolves; export styles match; the core workflow works through cancel/invalid/success/error paths; responsive layouts do not overflow; contrast and focus pass; and the result follows the latest request without invented claims.
  `;
}

/** @deprecated The canonical prompt is already compact; retained for callers/tests. */
export function getCompressedCodingPrompt(): string {
  return getCanonicalCodingPrompt();
}
