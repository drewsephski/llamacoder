"use client";

import ArrowRightIcon from "@/components/icons/arrow-right";
import { Macbook } from "@/components/ui/animated-3d-mac-book-air";
import {
  CheckIcon,
  ChevronDownIcon,
  Code2,
  FileCode2,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const productWorkflowSteps = [
  {
    label: "Prompt",
    title: "Enter a product idea",
    detail: "Describe the app, paste a URL, or attach a screenshot.",
    icon: Sparkles,
  },
  {
    label: "Interview",
    title: "Answer clarification questions",
    detail: "Squid asks only the decisions that change architecture or scope.",
    icon: MessageSquare,
  },
  {
    label: "Plan",
    title: "Review the generated plan",
    detail: "Approve the structured spec before any code is written.",
    icon: FileCode2,
  },
  {
    label: "Build",
    title: "Watch files appear",
    detail:
      "React components, routes, and logic land in an inspectable workspace.",
    icon: Code2,
  },
  {
    label: "Preview",
    title: "See the app render live",
    detail:
      "The running preview updates as Squid completes each generation pass.",
    icon: CheckIcon,
  },
  {
    label: "Repair",
    title: "Recover from runtime errors",
    detail:
      "Squid detects preview failures and attempts automatic repair loops.",
    icon: ShieldCheck,
  },
  {
    label: "Ship",
    title: "Deploy or export the project",
    detail:
      "Publish to GitHub, deploy to Vercel, or download every source file.",
    icon: Rocket,
  },
] as const;

export function ProductWorkflowDemo() {
  const reduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const step = productWorkflowSteps[activeStep];
  const StepIcon = step.icon;

  useEffect(() => {
    if (reduceMotion) return;

    const timeout = window.setTimeout(() => {
      setActiveStep((current) => (current + 1) % productWorkflowSteps.length);
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, [activeStep, reduceMotion]);

  function handleSelectStep(index: number) {
    setActiveStep(index);
  }

  function handlePreviousStep() {
    setActiveStep(
      (current) =>
        (current - 1 + productWorkflowSteps.length) %
        productWorkflowSteps.length,
    );
  }

  function handleNextStep() {
    setActiveStep((current) => (current + 1) % productWorkflowSteps.length);
  }

  return (
    <section
      aria-labelledby="product-workflow-demo-heading"
      className="relative z-10 w-full px-4 pb-2 pt-2 sm:px-6 sm:pb-4"
      data-testid="product-workflow-demo"
    >
      <div className="mx-auto w-full max-w-6xl border-y border-border/60 py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0062FF] dark:text-[#0CA8FF]">
              See Squid in action
            </p>
            <h2
              id="product-workflow-demo-heading"
              className="mt-3 font-display text-3xl leading-[1.02] tracking-tight text-foreground sm:text-4xl"
            >
              From prompt to working app.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Squid is not a one-shot generator. It interviews, plans, builds,
              verifies, repairs, and prepares your project to ship.
            </p>

            <article
              className="product-demo-step mt-6 rounded-[22px] border border-border/70 bg-background/85 p-5 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.65)] backdrop-blur sm:p-6"
              aria-live={reduceMotion ? undefined : "polite"}
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-[#0062FF] dark:text-[#0CA8FF]">
                  {String(activeStep + 1).padStart(2, "0")} /{" "}
                  {String(productWorkflowSteps.length).padStart(2, "0")}
                </span>
                <span className="flex size-9 items-center justify-center rounded-full bg-blue-500 text-white shadow-md shadow-blue-500/20">
                  <StepIcon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.detail}
              </p>
            </article>

            <div className="mt-4 flex flex-wrap gap-2">
              {productWorkflowSteps.map((workflowStep, index) => (
                <button
                  key={workflowStep.label}
                  type="button"
                  aria-pressed={index === activeStep}
                  aria-label={`${workflowStep.label}, step ${index + 1}`}
                  onClick={() => handleSelectStep(index)}
                  className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-[color,border-color,background-color] hover:border-blue-500/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 data-[active=true]:border-blue-500/35 data-[active=true]:bg-blue-500 data-[active=true]:text-white"
                  data-active={index === activeStep}
                >
                  {workflowStep.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Previous demo step"
              >
                <ChevronDownIcon className="size-4 rotate-90" />
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Next demo step"
              >
                <ChevronDownIcon className="size-4 -rotate-90" />
              </button>
              <Link
                href="/example"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Explore live example
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-[260px] items-center justify-center sm:min-h-[320px]">
            <div className="relative h-[220px] w-full max-w-md">
              <Macbook
                className="scale-125 sm:scale-150"
                screenImageSrc="/macbook-squid-home.webp"
                screenImageAlt="Squid Agent workspace showing plan, files, preview, and quality report"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
