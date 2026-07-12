"use client";

import { MousePointer2, X } from "lucide-react";
import { usePlausible } from "next-plausible";

import { Button } from "@/components/ui/button";
import type { PreviewElementSelection } from "@/lib/targeted-preview-edit";

export function SelectedElementEditTray({
  selection,
  instruction,
  disabled,
  onInstructionChange,
  onApply,
  onCancel,
}: {
  selection: PreviewElementSelection;
  instruction: string;
  disabled: boolean;
  onInstructionChange: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
}) {
  const plausible = usePlausible();
  const selector = selection.id
    ? `${selection.tagName.toLowerCase()}#${selection.id}`
    : selection.domPath || selection.tagName.toLowerCase();
  const breadcrumb = [selection.role, selection.ariaLabel || selection.text]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      className="border-t border-blue-500/25 bg-background/95 px-3 py-3 shadow-[0_-12px_28px_rgba(0,0,0,0.08)] backdrop-blur md:px-4"
      aria-label="Edit selected element"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-end">
        <div className="min-w-0 md:w-64">
          <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <MousePointer2 className="size-3.5 text-blue-500" /> Selected
            element
          </p>
          <p
            className="mt-1 truncate font-mono text-xs text-blue-600 dark:text-blue-300"
            title={selector}
          >
            {selector}
          </p>
          {breadcrumb && (
            <p
              className="mt-1 truncate text-xs text-muted-foreground"
              title={breadcrumb}
            >
              {breadcrumb}
            </p>
          )}
        </div>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Describe the selected element edit</span>
          <input
            autoFocus
            type="text"
            value={instruction}
            onChange={(event) => onInstructionChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && instruction.trim()) {
                event.preventDefault();
                plausible("Targeted Edit Applied", { props: { selector } });
                onApply();
              }
              if (event.key === "Escape") onCancel();
            }}
            placeholder="Describe exactly what should change…"
            disabled={disabled}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          />
        </label>
        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1 md:flex-none"
            disabled={disabled || instruction.trim().length === 0}
            onClick={() => {
              plausible("Targeted Edit Applied", { props: { selector } });
              onApply();
            }}
          >
            Apply edit
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 md:flex-none"
            onClick={() => {
              plausible("Targeted Edit Cancelled", { props: { selector } });
              onCancel();
            }}
          >
            <X className="size-3.5" /> Clear
          </Button>
        </div>
      </div>
    </section>
  );
}
