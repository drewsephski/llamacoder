"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import type { DocsNavSection } from "@/lib/docs/navigation";
import { DocsNavigation } from "@/components/docs/docs-navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DocsMobileNavigation({
  sections,
}: {
  sections: DocsNavSection[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
            aria-label="Open documentation menu"
          >
            <Menu className="size-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="!left-0 !top-0 flex !h-dvh !w-screen !max-w-none !translate-x-0 !translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:rounded-none sm:p-0">
          <DialogTitle className="flex h-16 shrink-0 items-center border-b border-border px-5 pr-14 text-base">
            Squid Agent Docs
          </DialogTitle>
          <DialogDescription className="sr-only">
            Browse the Squid Agent documentation sections.
          </DialogDescription>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <DocsNavigation
              sections={sections}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
