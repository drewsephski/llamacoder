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
import { IconTile } from "@/components/reui/icon-tile";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Compass,
  Sparkles,
} from "lucide-react";

const ONBOARDING_STORAGE_KEY = "squid_onboarding_completed_v1";

const ONBOARDING_STEPS = [
  {
    id: "describe",
    title: "Describe the prototype",
    description:
      "Start with who it is for, the one job the first screen must do, and the interaction you want to test.",
    bullets: [
      "Name the audience and primary workflow.",
      "Mention the screens and states that make the idea believable.",
      "Attach a screenshot or URL when visual accuracy matters.",
    ],
    icon: Sparkles,
  },
  {
    id: "build",
    title: "Build first, then react",
    description:
      "Squid moves directly into a working React preview by default. Use Plan first only when the scope is genuinely unclear.",
    bullets: [
      "Direct mode gets the prototype on screen immediately.",
      "Plan first asks consequential questions before generating.",
      "You can refine the working result in chat either way.",
    ],
    icon: Compass,
  },
  {
    id: "promote",
    title: "Share it, then make it real",
    description:
      "Share the prototype or export its source. Connect databases and external services only when the idea is ready for them.",
    bullets: [
      "Iterate in chat with small follow-up requests.",
      "Check the responsive preview before sharing.",
      "Promote the prototype without rebuilding from scratch.",
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
            <IconTile variant="soft" size="default">
              <StepIcon className="h-5 w-5 text-primary" aria-hidden="true" />
            </IconTile>
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

        <Stepper
          value={stepIndex + 1}
          onValueChange={(value) => setStepIndex(value - 1)}
          aria-label="Onboarding progress"
          indicators={{ completed: <Check className="size-3.5" /> }}
        >
          <StepperNav>
            {ONBOARDING_STEPS.map((candidate, index) => (
              <StepperItem key={candidate.id} step={index + 1}>
                <StepperTrigger
                  aria-label={`Go to step ${index + 1}: ${candidate.title}`}
                >
                  <StepperIndicator>{index + 1}</StepperIndicator>
                  <span className="sr-only sm:not-sr-only sm:block sm:text-left">
                    <StepperTitle>
                      {candidate.id.charAt(0).toUpperCase() + candidate.id.slice(1)}
                    </StepperTitle>
                    <StepperDescription>Step {index + 1}</StepperDescription>
                  </span>
                </StepperTrigger>
                {index < ONBOARDING_STEPS.length - 1 ? (
                  <StepperSeparator />
                ) : null}
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>

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
