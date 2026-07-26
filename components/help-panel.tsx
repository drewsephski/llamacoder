"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  HelpCircle,
  Lightbulb,
  ListChecks,
  WandSparkles,
} from "lucide-react";

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HOW_IT_WORKS = [
  "Describe what you want to build.",
  "Pick a model and quality mode.",
  "Attach a screenshot or URL when visual accuracy matters.",
  "Build, review, then refine in chat.",
];

const USE_CASES = [
  "Prototype product ideas.",
  "Create landing pages, dashboards, forms, calculators, and tools.",
  "Convert references into editable React code.",
  "Explore UI directions quickly.",
];

const PROMPT_TIPS = [
  "Name the user, goal, screens, and key actions.",
  "Mention data, states, and edge cases.",
  "Describe layout, density, and visual tone.",
  "Iterate with small follow-up changes.",
];

const HELP_SECTIONS = [
  {
    icon: <ListChecks className="h-4 w-4" />,
    title: "How it works",
    items: HOW_IT_WORKS,
  },
  {
    icon: <WandSparkles className="h-4 w-4" />,
    title: "Good use cases",
    items: USE_CASES,
  },
  {
    icon: <Lightbulb className="h-4 w-4" />,
    title: "Better prompts",
    items: PROMPT_TIPS,
  },
];

export function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[72dvh] max-w-[22rem] gap-2 overflow-hidden p-3 sm:max-h-[min(80dvh,38rem)] sm:max-w-xl sm:gap-3 sm:p-4 md:max-w-3xl">
        <DialogHeader className="min-h-11 justify-center border-b border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <HelpCircle className="size-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <DialogTitle>Help</DialogTitle>
              <DialogDescription className="mt-0.5 line-clamp-2 text-xs sm:text-sm">
                Turn clear app ideas into editable React projects.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 gap-2 overflow-y-auto overscroll-contain px-0.5 pb-0.5 md:grid-cols-3 md:gap-3">
          {HELP_SECTIONS.map((section) => (
            <details
              key={section.title}
              className="group self-start rounded-xl border border-border/80 bg-muted/25 open:bg-muted/40"
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:cursor-default [&::-webkit-details-marker]:hidden">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm ring-1 ring-border/70">
                  {section.icon}
                </span>
                <span className="min-w-0 flex-1 truncate">{section.title}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none md:hidden" />
              </summary>
              <ul className="hidden px-2 pb-2 group-open:block md:block">
                {section.items.map((item, index) => (
                  <li
                    key={item}
                    className="flex gap-2 border-t border-border/65 px-1 py-2 text-xs leading-snug text-muted-foreground first:border-t-0"
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-semibold leading-none text-foreground ring-1 ring-border/70">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
