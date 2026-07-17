import {
  formatGeneratedFilesMarkdown,
  type GeneratedFile,
} from "@/lib/generated-files";
import { z } from "zod";

export type PreviewElementSelection = {
  tagName: string;
  domPath: string;
  text: string;
  id?: string;
  className?: string;
  role?: string;
  ariaLabel?: string;
  href?: string;
  imageAlt?: string;
  attributes?: Record<string, string>;
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  html?: string;
};

export const previewElementSelectionSchema: z.ZodType<PreviewElementSelection> =
  z.object({
    tagName: z.string(),
    domPath: z.string(),
    text: z.string(),
    id: z.string().optional(),
    className: z.string().optional(),
    role: z.string().optional(),
    ariaLabel: z.string().optional(),
    href: z.string().optional(),
    imageAlt: z.string().optional(),
    attributes: z.record(z.string(), z.string()).optional(),
    rect: z
      .object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
    html: z.string().optional(),
  });

export function formatPreviewElementSelection(
  selection: PreviewElementSelection,
) {
  const attributes = selection.attributes
    ? Object.entries(selection.attributes)
        .map(([name, value]) => `${name}="${value}"`)
        .join(" ")
    : "";

  return [
    `Tag: ${selection.tagName}`,
    `Path: ${selection.domPath}`,
    selection.id ? `ID: ${selection.id}` : null,
    selection.className ? `Classes: ${selection.className}` : null,
    selection.role ? `Role: ${selection.role}` : null,
    selection.ariaLabel ? `ARIA label: ${selection.ariaLabel}` : null,
    selection.href ? `Href: ${selection.href}` : null,
    selection.imageAlt ? `Image alt: ${selection.imageAlt}` : null,
    attributes ? `Attributes: ${attributes}` : null,
    selection.rect
      ? `Bounds: ${Math.round(selection.rect.width)}x${Math.round(
          selection.rect.height,
        )} at ${Math.round(selection.rect.x)},${Math.round(selection.rect.y)}`
      : null,
    selection.text ? `Text: ${selection.text}` : null,
    selection.html ? `HTML: ${selection.html}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildTargetedPreviewEditPrompt({
  appTitle,
  instruction,
  selection,
  files,
}: {
  appTitle: string;
  instruction: string;
  selection: PreviewElementSelection;
  files: GeneratedFile[];
}) {
  const trimmedInstruction = instruction.trim();
  const selectedElementContext = formatPreviewElementSelection(selection);
  const fileList = files.map((file) => `- ${file.path}`).join("\n");

  return `Edit the selected preview element in "${appTitle}".

User requested edit:
${trimmedInstruction}

Selected element context:
${selectedElementContext}

Current selected version files:
${fileList}

Use the source files below as the source of truth for the currently previewed version. Apply the requested edit to the selected element or the component that renders it, and preserve unrelated behavior and layout.

Requirements:
- Return complete updated source files in fenced code blocks using \`\`\`tsx{path=App.tsx} format.
- Keep existing generated file paths unless the edit genuinely requires a new file.
- Preserve unrelated components, copy, state, imports, and interactions.
- If the selected DOM path maps to repeated content, update the intended repeated item or shared component consistently.
- For visual requests, make the concrete className/style/component changes needed to render the edit.
- If the user names a color, preserve that exact Tailwind family and use complete literal static utilities (for example, a purple request uses \`bg-purple-*\`/\`text-purple-*\`, never violet, indigo, a computed \`bg-\${color}-*\`, or an unresolved semantic token).
- Replace conflicting existing background, text, border, gradient, and dark-mode color utilities on the edited element. Do not append a second color class and rely on class order. Pair the new surface with a readable foreground and visible interaction states.

Current source:
${formatGeneratedFilesMarkdown(files)}`;
}
