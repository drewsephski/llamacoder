"use client";

import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PromptPills } from "./prompt-pills";
import { PromptOutput } from "./prompt-output";
import { usePromptBuilder } from "../hooks/use-prompt-builder";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, Check, Clock, Trash2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PromptBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsePrompt?: (prompt: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PromptBuilderModal({
  open,
  onOpenChange,
  onUsePrompt,
}: PromptBuilderModalProps) {
  const {
    userPrompt,
    setUserPrompt,
    isLoading,
    result,
    error,
    enhance,
    refine,
    history,
    clearHistory,
  } = usePromptBuilder();

  const handlePillSelect = useCallback(
    (prompt: string) => {
      setUserPrompt(prompt);
    },
    [setUserPrompt],
  );

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback: select the text
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    });
  }, []);

  const handleUsePrompt = useCallback(() => {
    if (result?.enhanced && onUsePrompt) {
      onUsePrompt(result.enhanced);
      onOpenChange(false);
    }
  }, [result, onUsePrompt, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="workspace"
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0"
      >
        {/* Header */}
        <DialogHeader className="border-b border-border/40 px-5 py-4 sm:px-6">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            Prompt Builder
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Describe your vision and let AI craft a detailed, ready-to-use
            prompt for code generation.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-4 px-5 py-5 sm:px-6">
            {/* Quick Start Pills */}
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-muted-foreground">
                Quick Start
              </label>
              <PromptPills onSelect={handlePillSelect} />
            </div>

            {/* Input area */}
            <div className="space-y-2.5">
              <label
                htmlFor="prompt-builder-input"
                className="text-xs font-medium text-muted-foreground"
              >
                What do you want to build?
              </label>
              <Textarea
                id="prompt-builder-input"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Describe what you want to build... e.g., a dashboard with real-time charts, a landing page for a health app, a pricing comparison table..."
                rows={4}
                className="resize-none border-border/60 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus-visible:border-primary/40"
              />
            </div>

            {/* Enhance button */}
            <Button
              onClick={enhance}
              disabled={!userPrompt.trim() || isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Enhance Prompt
                </>
              )}
            </Button>

            {/* Error state */}
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Output */}
            <PromptOutput
              result={result}
              isLoading={isLoading}
              onCopy={handleCopy}
              onRefine={refine}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-5 py-3 sm:px-6">
          {/* History */}
          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground/70">
                {history.length} previous{history.length !== 1 ? "s" : ""}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-6 gap-1 px-2 text-xs text-muted-foreground/60 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            </div>
          )}

          {/* Use prompt CTA */}
          <Button
            onClick={handleUsePrompt}
            disabled={!result?.enhanced}
            className={cn(
              "ml-auto gap-2",
              result?.enhanced && "bg-primary shadow-sm",
            )}
          >
            <Check className="h-4 w-4" />
            Use This Prompt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
