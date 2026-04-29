"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Lightbulb, Sparkles, Code2, Zap } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLE_BRIEFS = [
  {
    icon: <Code2 className="h-5 w-5" />,
    title: "Build a Todo App",
    description:
      "Create a React todo app with add, delete, and complete functionality",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Weather Dashboard",
    description:
      "Build a weather dashboard that shows forecasts for multiple cities",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Landing Page",
    description:
      "Design a modern landing page with hero section, features, and CTA",
  },
];

const TIPS = [
  "Be specific in your prompts - describe the features you want",
  "Start with simple projects to understand the AI's capabilities",
  "Use 'High Quality' mode for more complex applications",
  "You can iterate by asking follow-up questions to refine the code",
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [showTips, setShowTips] = useState(false);

  const handleBriefClick = (brief: (typeof EXAMPLE_BRIEFS)[0]) => {
    onClose();
    // In a real implementation, this would populate the input field
    console.log("Selected brief:", brief.title);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Welcome to Squid Coder</DialogTitle>
          <DialogDescription className="mt-2">
            Build apps with AI in seconds. Here's how to get started:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Example Briefs */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="font-medium">Try these example projects</h3>
            </div>
            <div className="space-y-2">
              {EXAMPLE_BRIEFS.map((brief, index) => (
                <button
                  key={index}
                  onClick={() => handleBriefClick(brief)}
                  className="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-accent hover:bg-accent/20"
                  aria-label={`Try example project: ${brief.title}`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {brief.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{brief.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {brief.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              aria-expanded={showTips}
              aria-controls="tips-list"
            >
              <Lightbulb className="h-4 w-4" />
              {showTips ? "Hide tips" : "Show tips for better results"}
            </button>
            {showTips && (
              <ul id="tips-list" className="mt-3 space-y-2" role="list">
                {TIPS.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Start Building</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
