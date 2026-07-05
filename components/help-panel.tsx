"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Lightbulb, ListChecks, WandSparkles } from "lucide-react";

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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DialogTitle>Help</DialogTitle>
                <DialogDescription className="mt-1">
                  Squid turns clear app ideas into editable React projects.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-3 md:grid-cols-3">
          {HELP_SECTIONS.map((section) => (
            <section key={section.title} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {section.icon}
                </div>
                <h3 className="text-sm font-medium">{section.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {section.items.map((item, index) => (
                  <li
                    key={item}
                    className="flex gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-xs text-muted-foreground"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium leading-none text-foreground">
                      {index + 1}
                    </span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex justify-end border-t pt-3">
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
