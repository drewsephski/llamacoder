"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CircleCheck,
  LockKeyhole,
} from "lucide-react";
import { usePlausible } from "next-plausible";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CometSpinner } from "@/components/loading-ui/comet-spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { readAcquisitionAttribution } from "@/features/acquisition/contracts";
import { cn } from "@/lib/utils";

const roleOptions = [
  ["freelance_designer", "Freelance designer"],
  ["agency_owner", "Agency owner"],
  ["product_lead", "Product lead"],
  ["founder", "Founder"],
  ["developer", "Developer"],
  ["other", "Other"],
] as const;

const timelineOptions = [
  ["this_month", "This month"],
  ["next_month", "Next month"],
  ["exploring", "I am exploring"],
] as const;

const contactOptions = [
  ["email", "Email"],
  ["linkedin", "LinkedIn"],
  ["x", "X"],
] as const;

type FieldIssues = Record<string, string[] | undefined>;
type PreferredContact = (typeof contactOptions)[number][0];
type FormValues = {
  name: string;
  email: string;
  role: string;
  companyName: string;
  portfolioUrl: string;
  projectSummary: string;
  timeline: string;
  preferredContact: string;
  permissionToContact: boolean;
};
type FormValueName = keyof FormValues;

const initialValues: FormValues = {
  name: "",
  email: "",
  role: "",
  companyName: "",
  portfolioUrl: "",
  projectSummary: "",
  timeline: "",
  preferredContact: "",
  permissionToContact: false,
};

const formSteps = [
  {
    label: "Contact details",
    title: "Who should we follow up with?",
    description: "Use the details you check most often for project work.",
  },
  {
    label: "Your work",
    title: "Tell us how you work.",
    description: "This helps us understand the perspective you bring.",
  },
  {
    label: "Project brief",
    title: "What should we prototype?",
    description:
      "A rough brief is enough. Focus on the decision it should unlock.",
  },
  {
    label: "Timing and reply",
    title: "When and where should we reply?",
    description: "Choose the timing and channel that work best for you.",
  },
  {
    label: "Review",
    title: "One last confirmation.",
    description:
      "Review the essentials, then send your brief to the Squid team.",
  },
] as const;

const stepFields: ReadonlyArray<ReadonlyArray<FormValueName>> = [
  ["name", "email"],
  ["role", "companyName"],
  ["portfolioUrl", "projectSummary"],
  ["timeline", "preferredContact"],
  ["permissionToContact"],
];

const fieldStep: Partial<Record<FormValueName, number>> = {
  name: 0,
  email: 0,
  role: 1,
  companyName: 1,
  portfolioUrl: 2,
  projectSummary: 2,
  timeline: 3,
  preferredContact: 3,
  permissionToContact: 4,
};

const lastStep = formSteps.length - 1;
const fieldControlClass =
  "h-12 rounded-lg border-border/80 bg-background/60 px-4 shadow-none transition-[background-color,border-color,box-shadow] duration-200 hover:border-foreground/20 hover:bg-background focus-visible:border-primary/70 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:ring-offset-0";

const stepMotionVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 28 : -28,
  }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -20 : 20,
  }),
};

export function DesignPartnerSection() {
  const plausible = usePlausible();
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [issues, setIssues] = useState<FieldIssues>({});
  const [values, setValues] = useState<FormValues>(initialValues);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [preferredContact, setPreferredContact] =
    useState<PreferredContact>("email");

  function updateValue<Name extends FormValueName>(
    name: Name,
    value: FormValues[Name],
  ) {
    setValues((current) => ({ ...current, [name]: value }));
    setIssues((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function showStepIssues(step: number) {
    const nextStepIssues = validateStep(step, values);
    if (Object.keys(nextStepIssues).length === 0) return false;

    setIssues((current) => {
      const next = { ...current };
      for (const field of stepFields[step]) delete next[field];
      return { ...next, ...nextStepIssues };
    });
    focusField(Object.keys(nextStepIssues)[0]);
    return true;
  }

  function goToNextStep() {
    if (showStepIssues(currentStep)) return;
    setMessage(null);
    setDirection(1);
    setCurrentStep((step) => Math.min(step + 1, lastStep));
  }

  function goToPreviousStep() {
    setMessage(null);
    setDirection(-1);
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (currentStep < lastStep) {
      goToNextStep();
      return;
    }
    if (showStepIssues(currentStep)) return;

    const formData = new FormData(event.currentTarget);
    setStatus("submitting");
    setMessage(null);
    setIssues({});

    const response = await fetch("/api/design-partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        website: formData.get("website"),
        attribution: readAcquisitionAttribution({
          url: new URL(window.location.href),
          referrer: document.referrer,
        }),
      }),
    }).catch(() => null);

    if (!response) {
      setStatus("idle");
      setMessage("We could not submit the application. Please try again.");
      return;
    }

    const result = (await response.json().catch(() => null)) as {
      message?: string;
      issues?: FieldIssues;
    } | null;
    if (!response.ok) {
      setStatus("idle");
      const nextIssues = result?.issues ?? {};
      setIssues(nextIssues);
      setMessage(
        result?.message ??
          "Some details need your attention. Review the fields marked below.",
      );
      const firstFieldName = Object.keys(nextIssues)[0];
      if (firstFieldName) {
        const nextStep = fieldStep[firstFieldName as FormValueName];
        if (nextStep !== undefined) {
          setDirection(nextStep < currentStep ? -1 : 1);
          setCurrentStep(nextStep);
        }
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() => {
            document
              .getElementById("design-partner-form-error")
              ?.scrollIntoView?.({
                behavior: "smooth",
                block: "center",
              });
            document
              .getElementById(firstFieldName)
              ?.focus({ preventScroll: true });
          }),
        );
      }
      return;
    }

    plausible("Design Partner Application Submitted", {
      props: {
        role: values.role || "unknown",
        timeline: values.timeline || "unknown",
      },
    });
    if (contactOptions.some(([value]) => value === values.preferredContact)) {
      setPreferredContact(values.preferredContact as PreferredContact);
    }
    setStatus("success");
  }

  return (
    <section
      id="design-partner-program"
      aria-labelledby="design-partner-heading"
      className="relative isolate z-10 scroll-mt-28 overflow-x-clip border-y border-border/70 bg-background px-3 py-14 sm:px-6 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_24%,hsl(var(--primary)/0.08),transparent_28%),linear-gradient(to_bottom,hsl(var(--muted)/0.28),transparent_42%)] dark:bg-[radial-gradient(circle_at_72%_24%,hsl(var(--primary)/0.12),transparent_30%),linear-gradient(to_bottom,hsl(var(--muted)/0.22),transparent_44%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent"
      />

      <div className="mx-auto grid w-full min-w-0 max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start lg:gap-16 xl:gap-20">
        <div className="min-w-0 px-1 lg:sticky lg:top-28 lg:self-start lg:px-0">
          <p className="font-mono-jb text-xs font-semibold uppercase tracking-[0.16em] text-[#0062FF] dark:text-[#0CA8FF]">
            Design partner program
          </p>
          <h2
            id="design-partner-heading"
            className="mt-4 max-w-xl text-balance font-display text-4xl leading-[1.02] tracking-[-0.035em] text-foreground sm:text-5xl"
          >
            Turn a real brief into something your client can click.
          </h2>
          <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-muted-foreground">
            We are inviting a small group of designers, agency owners, product
            leads, and founders to build one real prototype directly with the
            Squid team.
          </p>

          <ol className="mt-9 max-w-lg border-y border-border/80">
            {[
              "One focused working session with the Squid team",
              "A shareable React prototype and portable source code",
              "No charge for the first prototype",
              "Candid feedback is required; positive feedback is not",
            ].map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-4 border-b border-border/65 py-3.5 text-sm leading-6 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className="font-mono-jb w-6 shrink-0 pt-px text-[11px] font-semibold tabular-nums text-primary"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ol>

          <p className="mt-7 max-w-lg border-l-2 border-primary/30 pl-4 text-sm leading-6 text-muted-foreground">
            This is a research partnership, not a promise of ongoing agency
            services. We select briefs where a prototype can create a useful
            decision quickly.
          </p>
        </div>

        <div className="relative min-w-0 max-w-full overflow-hidden rounded-2xl border border-border/80 bg-background/90 p-4 shadow-[0_28px_90px_-48px_hsl(var(--primary)/0.55)] backdrop-blur-sm sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
          />
          {status === "success" ? (
            <article
              aria-live="polite"
              className="relative isolate flex min-h-[500px] flex-col overflow-hidden rounded-xl bg-muted/30 p-5 sm:p-8"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-[#0062FF]/10 blur-3xl dark:bg-[#0CA8FF]/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#0062FF]/60 to-transparent dark:via-[#0CA8FF]/60"
              />

              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full border border-[#0062FF]/20 bg-[#0062FF]/10 text-[#0062FF] dark:border-[#0CA8FF]/25 dark:bg-[#0CA8FF]/10 dark:text-[#0CA8FF]">
                  <CircleCheck className="size-5" aria-hidden="true" />
                </span>
                <p className="font-mono-jb text-xs font-semibold uppercase tracking-[0.14em] text-[#0062FF] dark:text-[#0CA8FF]">
                  Application received
                </p>
              </div>

              <div className="mt-10 max-w-xl sm:mt-12">
                <h3 className="max-w-lg font-display text-3xl leading-[1.05] tracking-tight text-foreground sm:text-4xl">
                  Your brief is in. We’ll take it from here.
                </h3>
                <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
                  The Squid team will review the project and reach out if a
                  focused prototype can help move the decision forward.
                </p>
              </div>

              <ol className="mt-9 grid gap-px overflow-hidden rounded-lg border border-border/70 bg-border/70 sm:grid-cols-2">
                <li className="bg-background/90 p-5">
                  <span className="font-mono-jb text-xs text-muted-foreground">
                    01
                  </span>
                  <h4 className="mt-4 text-sm font-semibold text-foreground">
                    We review the brief
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    We look for a clear decision a working prototype can unlock.
                  </p>
                </li>
                <li className="bg-background/90 p-5">
                  <span className="font-mono-jb text-xs text-muted-foreground">
                    02
                  </span>
                  <h4 className="mt-4 text-sm font-semibold text-foreground">
                    We follow up directly
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    If it is a fit, we’ll contact you via{" "}
                    {getContactLabel(preferredContact)} to plan the session.
                  </p>
                </li>
              </ol>

              <div className="mt-auto flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-muted-foreground">
                  No additional action is needed.
                </p>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/gallery">
                    See what Squid can build
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </article>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex min-h-[540px] min-w-0 flex-col"
            >
              <div className="border-b border-border/70 pb-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-foreground">
                    Application progress
                  </p>
                  <p className="font-mono-jb text-[11px] tabular-nums text-muted-foreground">
                    {String(currentStep + 1).padStart(2, "0")} /{" "}
                    {String(formSteps.length).padStart(2, "0")}
                  </p>
                </div>

                <ol
                  role="progressbar"
                  aria-label="Application progress"
                  aria-valuemin={1}
                  aria-valuemax={formSteps.length}
                  aria-valuenow={currentStep + 1}
                  className="mt-4 grid grid-cols-5 gap-1.5"
                >
                  {formSteps.map((step, index) => (
                    <li key={step.label}>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "block h-1 rounded-full bg-muted transition-[background-color,opacity] duration-300",
                          index <= currentStep && "bg-primary",
                          index < currentStep && "opacity-45",
                        )}
                      />
                      <span className="sr-only">
                        {step.label}
                        {index === currentStep ? ", current" : ""}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-primary">
                    {formSteps[currentStep].label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    About 3 minutes
                  </p>
                </div>
              </div>

              {message ? (
                <div
                  id="design-partner-form-error"
                  role="alert"
                  className="mt-6 flex scroll-mt-24 items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm leading-6 text-foreground"
                >
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0 text-destructive"
                    aria-hidden="true"
                  />
                  <p>{message}</p>
                </div>
              ) : null}

              <div
                data-slot="design-partner-step-viewport"
                className="relative -mx-2 min-h-[340px] flex-1 overflow-hidden px-2 py-7 sm:min-h-[350px]"
              >
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={stepMotionVariants}
                    initial={reduceMotion ? "center" : "enter"}
                    animate="center"
                    exit={reduceMotion ? "center" : "exit"}
                    transition={{
                      duration: reduceMotion ? 0 : 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="min-w-0"
                  >
                    <header className="mb-7">
                      <h3
                        id={`design-partner-step-${currentStep}`}
                        className="max-w-lg text-balance font-display text-3xl leading-[1.08] tracking-[-0.025em] text-foreground"
                      >
                        {formSteps[currentStep].title}
                      </h3>
                      <p className="mt-3 max-w-lg text-pretty text-sm leading-6 text-muted-foreground">
                        {formSteps[currentStep].description}
                      </p>
                    </header>

                    <WizardStep
                      step={currentStep}
                      values={values}
                      issues={issues}
                      onValueChange={updateValue}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="sr-only" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} />
              </div>

              <footer className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-5">
                {currentStep > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={goToPreviousStep}
                    disabled={status === "submitting"}
                    className="active:translate-y-px"
                  >
                    <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                    Back
                  </Button>
                ) : (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <LockKeyhole className="size-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">
                      Your answers stay private.
                    </span>
                    <span className="sr-only sm:hidden">
                      Your answers stay private.
                    </span>
                  </p>
                )}

                {currentStep < lastStep ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={goToNextStep}
                    className="active:translate-y-px"
                  >
                    Continue
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    disabled={status === "submitting"}
                    className="min-w-40 active:translate-y-px"
                  >
                    {status === "submitting" ? (
                      <CometSpinner
                        data-icon="inline-start"
                        aria-hidden="true"
                      />
                    ) : (
                      <ArrowRight data-icon="inline-start" aria-hidden="true" />
                    )}
                    {status === "submitting"
                      ? "Submitting"
                      : "Apply to partner"}
                  </Button>
                )}
              </footer>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function getContactLabel(value: PreferredContact) {
  return contactOptions.find(([option]) => option === value)?.[1] ?? "email";
}

function WizardStep({
  step,
  values,
  issues,
  onValueChange,
}: {
  step: number;
  values: FormValues;
  issues: FieldIssues;
  onValueChange: <Name extends FormValueName>(
    name: Name,
    value: FormValues[Name],
  ) => void;
}) {
  if (step === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Field label="Name" name="name" issues={issues} required>
          <Input
            id="name"
            value={values.name}
            onChange={(event) => onValueChange("name", event.target.value)}
            autoComplete="name"
            minLength={2}
            maxLength={120}
            aria-invalid={Boolean(issues.name)}
            aria-describedby={issues.name ? "name-error" : undefined}
            className={fieldControlClass}
            required
          />
        </Field>
        <Field label="Work email" name="email" issues={issues} required>
          <Input
            id="email"
            value={values.email}
            onChange={(event) => onValueChange("email", event.target.value)}
            type="email"
            autoComplete="email"
            maxLength={320}
            aria-invalid={Boolean(issues.email)}
            aria-describedby={issues.email ? "email-error" : undefined}
            className={fieldControlClass}
            required
          />
        </Field>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex flex-col gap-6">
        <Field label="Your role" name="role" issues={issues} required>
          <EnhancedSelectField
            id="role"
            value={values.role}
            onValueChange={(value) => onValueChange("role", value)}
            options={roleOptions}
            placeholder="Choose the closest match"
            invalid={Boolean(issues.role)}
          />
        </Field>
        <Field
          label="Company or studio"
          name="companyName"
          issues={issues}
          hint="Optional"
        >
          <Input
            id="companyName"
            value={values.companyName}
            onChange={(event) =>
              onValueChange("companyName", event.target.value)
            }
            autoComplete="organization"
            maxLength={160}
            aria-invalid={Boolean(issues.companyName)}
            aria-describedby={
              issues.companyName ? "companyName-error" : "companyName-hint"
            }
            className={fieldControlClass}
          />
        </Field>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex flex-col gap-6">
        <Field
          label="Portfolio or company URL"
          name="portfolioUrl"
          issues={issues}
          hint="Optional, but useful for context"
        >
          <Input
            id="portfolioUrl"
            value={values.portfolioUrl}
            onChange={(event) =>
              onValueChange("portfolioUrl", event.target.value)
            }
            type="url"
            inputMode="url"
            placeholder="https://"
            maxLength={2048}
            aria-invalid={Boolean(issues.portfolioUrl)}
            aria-describedby={
              issues.portfolioUrl ? "portfolioUrl-error" : "portfolioUrl-hint"
            }
            className={fieldControlClass}
          />
        </Field>
        <Field
          label="What would you like to prototype?"
          name="projectSummary"
          issues={issues}
          hint={
            <>
              <span>
                Include the audience, the decision to unlock, and any deadline.
              </span>
              <span className="font-mono-jb shrink-0 tabular-nums text-foreground/70">
                {values.projectSummary.length.toLocaleString()} / 1,500
              </span>
            </>
          }
          required
        >
          <Textarea
            id="projectSummary"
            value={values.projectSummary}
            onChange={(event) =>
              onValueChange("projectSummary", event.target.value)
            }
            rows={7}
            minLength={40}
            maxLength={1500}
            placeholder="For example: a reviewable onboarding prototype that helps our client choose a direction before the next stakeholder session."
            aria-invalid={Boolean(issues.projectSummary)}
            aria-describedby={
              issues.projectSummary
                ? "projectSummary-error"
                : "projectSummary-hint"
            }
            className="resize-none rounded-lg border-border/80 bg-background/60 p-4 text-base leading-7 shadow-none transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-muted-foreground/55 hover:border-foreground/20 hover:bg-background focus-visible:border-primary/70 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:ring-offset-0"
            required
          />
        </Field>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="flex flex-col gap-6">
        <Field label="Project timing" name="timeline" issues={issues} required>
          <EnhancedSelectField
            id="timeline"
            value={values.timeline}
            onValueChange={(value) => onValueChange("timeline", value)}
            options={timelineOptions}
            placeholder="Choose a timeframe"
            invalid={Boolean(issues.timeline)}
          />
        </Field>
        <Field
          label="Preferred reply"
          name="preferredContact"
          issues={issues}
          required
        >
          <EnhancedSelectField
            id="preferredContact"
            value={values.preferredContact}
            onValueChange={(value) => onValueChange("preferredContact", value)}
            options={contactOptions}
            placeholder="Choose a reply channel"
            invalid={Boolean(issues.preferredContact)}
          />
        </Field>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/70 sm:grid-cols-3">
        {[
          ["Role", getOptionLabel(roleOptions, values.role)],
          ["Timing", getOptionLabel(timelineOptions, values.timeline)],
          [
            "Reply via",
            getOptionLabel(contactOptions, values.preferredContact),
          ],
        ].map(([label, value]) => (
          <div key={label} className="bg-muted/25 p-4">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1.5 text-sm font-medium text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <Field
        label="Permission to contact"
        name="permissionToContact"
        issues={issues}
        required
      >
        <label
          htmlFor="permissionToContact"
          className={cn(
            "flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-muted/25 p-4 text-sm leading-6 text-muted-foreground transition-colors hover:bg-muted/40",
            issues.permissionToContact && "border-destructive/60",
          )}
        >
          <input
            id="permissionToContact"
            type="checkbox"
            checked={values.permissionToContact}
            onChange={(event) =>
              onValueChange("permissionToContact", event.target.checked)
            }
            aria-invalid={Boolean(issues.permissionToContact)}
            aria-describedby={
              issues.permissionToContact
                ? "permissionToContact-error"
                : undefined
            }
            className="mt-1 size-4 shrink-0 rounded border-border accent-primary"
            required
          />
          <span>
            Squid Agent may contact me about this application and the proposed
            working session.
          </span>
        </label>
      </Field>
    </div>
  );
}

function EnhancedSelectField({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  invalid,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
  placeholder: string;
  invalid: boolean;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        id={id}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className="h-12 rounded-lg border-border/80 bg-background/60 px-4 text-base shadow-none transition-[background-color,border-color,box-shadow] duration-200 hover:border-foreground/20 hover:bg-background focus:ring-4 focus:ring-primary/15 focus:ring-offset-0 data-[state=open]:border-primary/70 data-[state=open]:bg-background"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="rounded-xl border-border/80 bg-popover/95 p-1 shadow-[0_20px_60px_-28px_hsl(var(--primary)/0.4)] backdrop-blur-md"
      >
        <SelectGroup>
          {options.map(([optionValue, label]) => (
            <SelectItem
              key={optionValue}
              value={optionValue}
              className="cursor-pointer rounded-lg py-3 pl-9 pr-3 text-sm focus:bg-accent"
            >
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function getOptionLabel(
  options: ReadonlyArray<readonly [string, string]>,
  value: string,
) {
  return options.find(([option]) => option === value)?.[1] ?? "Not selected";
}

function validateStep(step: number, values: FormValues): FieldIssues {
  const nextIssues: FieldIssues = {};

  if (step === 0) {
    const name = values.name.trim();
    const email = values.email.trim();
    if (name.length < 2) {
      nextIssues.name = ["Name must be at least 2 characters."];
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextIssues.email = ["Enter a valid email address."];
    }
  }

  if (step === 1 && !values.role) {
    nextIssues.role = ["Choose your role."];
  }

  if (step === 2) {
    const url = values.portfolioUrl.trim();
    if (url) {
      try {
        const parsedUrl = new URL(url);
        if (
          !(["http:", "https:"] as const).includes(
            parsedUrl.protocol as "http:" | "https:",
          )
        ) {
          nextIssues.portfolioUrl = ["Use a valid http or https URL."];
        }
      } catch {
        nextIssues.portfolioUrl = ["Use a valid http or https URL."];
      }
    }
    const summaryLength = values.projectSummary.trim().length;
    if (summaryLength < 40) {
      nextIssues.projectSummary = [
        "Add a little more detail, at least 40 characters.",
      ];
    }
  }

  if (step === 3) {
    if (!values.timeline) {
      nextIssues.timeline = ["Choose the project timing."];
    }
    if (!values.preferredContact) {
      nextIssues.preferredContact = ["Choose how you would like us to reply."];
    }
  }

  if (step === 4 && !values.permissionToContact) {
    nextIssues.permissionToContact = [
      "Confirm that we may contact you about this application.",
    ];
  }

  return nextIssues;
}

function focusField(fieldName: string) {
  window.requestAnimationFrame(() => {
    document.getElementById(fieldName)?.focus({ preventScroll: true });
  });
}

function Field({
  label,
  name,
  issues,
  hint,
  required = false,
  children,
}: {
  label: string;
  name: string;
  issues: FieldIssues;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  const issue = issues[name]?.[0];
  return (
    <div
      className={cn(
        "min-w-0",
        issue &&
          "[&_input]:border-red-500/70 [&_select]:border-red-500/70 [&_textarea]:border-red-500/70",
      )}
      data-field-error={issue ? "true" : undefined}
    >
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      <div className="mt-2 min-w-0">{children}</div>
      {hint && !issue ? (
        <div
          id={`${name}-hint`}
          className="mt-2 flex flex-col gap-1 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-start sm:justify-between sm:gap-4"
        >
          {hint}
        </div>
      ) : null}
      {issue ? (
        <p
          id={`${name}-error`}
          className="mt-2 text-sm leading-5 text-destructive"
        >
          {issue}
        </p>
      ) : null}
    </div>
  );
}
