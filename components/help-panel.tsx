"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { HelpCircle, BookOpen, MessageSquare, ExternalLink } from "lucide-react";

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HELP_SECTIONS = [
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: "Documentation",
    items: [
      { label: "Getting Started Guide", href: "#", description: "Learn the basics of Squid Coder" },
      { label: "Prompting Tips", href: "#", description: "Write better prompts for better results" },
      { label: "API Reference", href: "#", description: "Technical documentation for developers" },
    ],
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Support",
    items: [
      { label: "Community Discord", href: "#", description: "Join our community for help" },
      { label: "GitHub Issues", href: "#", description: "Report bugs or request features" },
      { label: "Contact Support", href: "#", description: "Get help from our team" },
    ],
  },
];

const QUICK_TIPS = [
  "Use specific, detailed descriptions for your prompts",
  "Include UI/UX requirements for better visual results",
  "Specify frameworks (React, Vue, etc.) if you have a preference",
  "Iterate by asking follow-up questions to refine the output",
  "Use 'High Quality' mode for complex, production-ready apps",
];

export function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Help & Resources</DialogTitle>
                <DialogDescription className="mt-1">
                  Find documentation, support, and tips to get the most out of Squid Coder
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Tips */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Quick Tips
            </h3>
            <ul className="space-y-2">
              {QUICK_TIPS.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Sections */}
          <div className="grid gap-6 md:grid-cols-2">
            {HELP_SECTIONS.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {section.icon}
                  </div>
                  <h3 className="font-medium">{section.title}</h3>
                </div>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <a
                      key={itemIndex}
                      href={item.href}
                      className="block p-3 rounded-lg border border-border bg-card hover:bg-accent/20 hover:border-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
