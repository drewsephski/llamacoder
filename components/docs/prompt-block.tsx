"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function Prompt({
  title = "Prompt",
  text,
}: {
  title?: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text.trim());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <figure className="not-prose my-7 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border bg-muted/45 px-4 py-3">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          aria-label={`Copy ${title.toLowerCase()}`}
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="whitespace-pre-wrap p-4 font-mono text-[13px] leading-6 text-foreground">
        {text.trim()}
      </pre>
    </figure>
  );
}
