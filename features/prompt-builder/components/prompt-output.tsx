"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Copy,
  Check,
  RefreshCw,
  Wand2,
  Palette,
  Puzzle,
  MousePointerClick,
  MessageSquare,
} from "lucide-react";
import type { EnhancedPromptResult } from "../hooks/use-prompt-builder";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PromptOutputProps {
  result: EnhancedPromptResult | null;
  isLoading: boolean;
  onCopy: (text: string) => void;
  onRefine: () => void;
}

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

type OutputTab = "enhanced" | "styling" | "components" | "interactions";

const TABS: { id: OutputTab; label: string; icon: React.ElementType }[] = [
  { id: "enhanced", label: "Enhanced Prompt", icon: Wand2 },
  { id: "styling", label: "Styling", icon: Palette },
  { id: "components", label: "Components", icon: Puzzle },
  { id: "interactions", label: "Interactions", icon: MousePointerClick },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CopyButton({
  text,
  onCopy,
}: {
  text: string;
  onCopy: (t: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    onCopy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </Button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-1">
      {/* Tab skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
      {/* Code block skeleton */}
      <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
        <div className="space-y-2">
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
        <MessageSquare className="h-6 w-6 text-muted-foreground/60" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        Your enhanced prompt will appear here
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Describe what you want to build above, or pick a quick start
      </p>
    </div>
  );
}

function TabContent({ text }: { text: string }) {
  if (!text) {
    return (
      <p className="py-4 text-sm italic leading-relaxed text-muted-foreground">
        No content available for this section.
      </p>
    );
  }

  // Render text with basic markdown-style formatting
  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        // Bold headers
        if (/^\*\*[^*]+\*\*$/.test(trimmed) || /^[^*]+:$/.test(trimmed)) {
          return (
            <h4 key={i} className="pt-3 text-sm font-semibold text-foreground">
              {trimmed.replace(/\*\*/g, "")}
            </h4>
          );
        }

        // List items
        if (/^[-•*]\s/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2 pl-1 text-sm leading-relaxed">
              <span className="mt-0.5 text-muted-foreground/50">•</span>
              <span className="text-foreground/90">
                {renderInlineFormatting(trimmed.replace(/^[-•*]\s/, ""))}
              </span>
            </div>
          );
        }

        // Numbered items
        if (/^\d+[.)]\s/.test(trimmed)) {
          const numMatch = trimmed.match(/^(\d+[.)])\s(.*)/);
          if (numMatch) {
            return (
              <div key={i} className="flex gap-2 pl-1 text-sm leading-relaxed">
                <span className="shrink-0 font-mono text-xs text-muted-foreground/70">
                  {numMatch[1]}
                </span>
                <span className="text-foreground/90">
                  {renderInlineFormatting(numMatch[2])}
                </span>
              </div>
            );
          }
        }

        // Code snippets
        if (/^`[^`]+`$/.test(trimmed)) {
          return (
            <code
              key={i}
              className="block rounded-md border border-border/40 bg-muted/40 px-3 py-2 font-mono text-xs text-foreground/80"
            >
              {trimmed.replace(/`/g, "")}
            </code>
          );
        }

        // Inline code
        if (trimmed.includes("`")) {
          return (
            <p key={i} className="text-sm leading-relaxed text-foreground/90">
              {renderInlineFormatting(trimmed)}
            </p>
          );
        }

        return (
          <p key={i} className="text-sm leading-relaxed text-foreground/90">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineFormatting(text: string): React.ReactNode {
  // Simple inline code highlighting
  const parts = text.split(/(`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded border border-border/40 bg-muted/40 px-1 py-0.5 font-mono text-xs"
        >
          {part.replace(/`/g, "")}
        </code>
      );
    }
    // Bold text
    const boldParts = part.split(/(\*\*[^*]+\*\*)/);
    return boldParts.map((bp, j) => {
      if (bp.startsWith("**") && bp.endsWith("**")) {
        return (
          <strong key={`${i}-${j}`} className="font-semibold text-foreground">
            {bp.replace(/\*\*/g, "")}
          </strong>
        );
      }
      return bp;
    });
  });
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PromptOutput({
  result,
  isLoading,
  onCopy,
  onRefine,
}: PromptOutputProps) {
  const [activeTab, setActiveTab] = useState<OutputTab>("enhanced");

  const currentContent = result
    ? result[activeTab === "enhanced" ? "enhanced" : activeTab]
    : "";

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!result) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {/* Section divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Enhanced Output
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-muted/40 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasContent =
            tab.id === "enhanced"
              ? Boolean(result?.enhanced)
              : Boolean(result?.[tab.id as keyof EnhancedPromptResult]);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={!hasContent}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                !hasContent && "cursor-not-allowed opacity-40",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <ScrollArea className="h-[280px] sm:h-[320px]">
        <div className="pr-4">
          <TabContent text={currentContent} />
        </div>
      </ScrollArea>

      {/* Action bar */}
      <div className="flex items-center gap-2 border-t border-border/30 pt-3">
        <CopyButton text={currentContent} onCopy={onCopy} />
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefine}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refine
        </Button>
      </div>
    </div>
  );
}
