"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardCheck, Compass, Sparkles } from "lucide-react";

const ONBOARDING_STORAGE_KEY = "squid_onboarding_completed_v1";

const ONBOARDING_STEPS = [
  {
    id: "describe",
    title: "Describe the product",
    description:
      "Start with who it is for, the one job the first screen must do, and any must-have data or actions.",
    bullets: [
      "Name the audience and primary workflow.",
      "Mention screens, states, and edge cases you care about.",
      "Attach a screenshot or URL when visual accuracy matters.",
    ],
    icon: Sparkles,
  },
  {
    id: "plan",
    title: "Plan first, then build",
    description:
      "Use Plan mode when scope is fuzzy. Squid turns the idea into an approved plan before generating code.",
    bullets: [
      "Plan mode interviews you, then waits for approval.",
      "Build fast skips straight to code when the prompt is already clear.",
      "You can switch modes before starting a project.",
    ],
    icon: Compass,
  },
  {
    id: "ship",
    title: "Preview, refine, export",
    description:
      "Every saved version runs in a live preview. Repair broken previews for free, then export verified source code.",
    bullets: [
      "Iterate in chat with small follow-up requests.",
      "Check runtime verification before handoff.",
      "Export ZIP or publish to GitHub when you are ready.",
    ],
    icon: ClipboardCheck,
  },
] as const;

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

function getOnboardingStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function hasCompletedOnboarding() {
  const storage = getOnboardingStorage();
  if (!storage) return false;
  return storage.getItem(ONBOARDING_STORAGE_KEY) === "1";
}

export function markOnboardingCompleted() {
  const storage = getOnboardingStorage();
  storage?.setItem(ONBOARDING_STORAGE_KEY, "1");
}

export function OnboardingWizard({
  isOpen,
  onClose,
  onComplete,
}: OnboardingWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = ONBOARDING_STEPS[stepIndex];
  const StepIcon = step.icon;
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  function handleClose() {
    setStepIndex(0);
    onClose();
  }

  function handleSkip() {
    markOnboardingCompleted();
    handleClose();
  }

  function handleNext() {
    if (isLastStep) {
      markOnboardingCompleted();
      onComplete?.();
      handleClose();
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function handleBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <StepIcon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Step {stepIndex + 1} of {ONBOARDING_STEPS.length}
              </p>
              <DialogTitle>{step.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {step.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ol className="flex gap-2" aria-label="Onboarding progress">
          {ONBOARDING_STEPS.map((candidate, index) => (
            <li
              key={candidate.id}
              className={`h-1.5 flex-1 rounded-full ${
                index <= stepIndex ? "bg-primary" : "bg-muted"
              }`}
              aria-hidden="true"
            />
          ))}
        </ol>

        <ul className="space-y-2 py-1">
          {step.bullets.map((bullet) => (
            <li
              key={bullet}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground"
            >
              {bullet}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <Button type="button" variant="ghost" size="sm" onClick={handleSkip}>
            Skip tour
          </Button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
              >
                Back
              </Button>
            ) : null}
            <Button type="button" size="sm" onClick={handleNext}>
              {isLastStep ? (
                <>
                  Start building
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
