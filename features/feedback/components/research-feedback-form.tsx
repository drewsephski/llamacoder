"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Coins,
  FileImage,
  Info,
  Link2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EligibleResearchProject } from "@/features/feedback/contracts";
import { uploadScreenshot } from "@/lib/s3-upload-client";

const responseFields = [
  {
    name: "buildGoal",
    label: "What were you trying to build?",
    placeholder:
      "Describe the goal, who it was for, and the outcome you needed.",
    minLength: 20,
  },
  {
    name: "previousTools",
    label: "What did you use before trying Squid?",
    placeholder:
      "Another builder, an IDE, an agency, a manual workflow, or none.",
    minLength: 2,
  },
  {
    name: "frustration",
    label: "What was the most confusing or frustrating part?",
    placeholder: "Name the screen, step, error, or missing information.",
    minLength: 20,
  },
  {
    name: "betterThanExpected",
    label: "What worked better than you expected?",
    placeholder: "A result, interaction, or moment that surprised you.",
    minLength: 10,
  },
  {
    name: "abandonmentPoint",
    label: "At what point were you closest to abandoning the build?",
    placeholder: "Tell us what happened and what you did next.",
    minLength: 20,
  },
  {
    name: "launchBlocker",
    label: "What prevented the result from being usable or launch-ready?",
    placeholder: "What was missing, broken, unreliable, or not good enough?",
    minLength: 20,
  },
  {
    name: "singleImprovement",
    label: "What single improvement would make you use Squid again?",
    placeholder: "Choose the one change with the biggest impact.",
    minLength: 15,
  },
] as const;

type ResearchFeedbackFormProps = {
  accountEmail: string;
  eligibleProjects: EligibleResearchProject[];
  initialProjectId?: string;
};

type FormStatus =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "error"; message: string }
  | { state: "submitted" };

export function ResearchFeedbackForm({
  accountEmail,
  eligibleProjects,
  initialProjectId,
}: ResearchFeedbackFormProps) {
  const defaultProjectId = eligibleProjects.some(
    (project) => project.id === initialProjectId,
  )
    ? initialProjectId!
    : eligibleProjects[0]!.id;
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [status, setStatus] = useState<FormStatus>({ state: "idle" });
  const selectedProject = useMemo(
    () => eligibleProjects.find((project) => project.id === projectId)!,
    [eligibleProjects, projectId],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "submitting" });

    const formData = new FormData(event.currentTarget);
    try {
      let mediaUrl = String(formData.get("mediaUrl") ?? "").trim();
      if (screenshot) {
        const uploaded = await uploadScreenshot(screenshot);
        mediaUrl = uploaded.url;
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          buildGoal: formData.get("buildGoal"),
          previousTools: formData.get("previousTools"),
          frustration: formData.get("frustration"),
          betterThanExpected: formData.get("betterThanExpected"),
          abandonmentPoint: formData.get("abandonmentPoint"),
          launchBlocker: formData.get("launchBlocker"),
          singleImprovement: formData.get("singleImprovement"),
          paymentIntent: formData.get("paymentIntent"),
          monthlyPriceUsd: Number(formData.get("monthlyPriceUsd")),
          followUpConsent: formData.get("followUpConsent") === "yes",
          mediaUrl,
          honestyConfirmed: formData.get("honestyConfirmed") === "on",
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok) {
        throw new Error(payload?.message || "Feedback could not be submitted.");
      }
      setStatus({ state: "submitted" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Feedback could not be submitted.",
      });
    }
  }

  if (status.state === "submitted") {
    return (
      <div className="mx-auto max-w-2xl py-10 sm:py-16">
        <div className="border-l-4 border-emerald-500 pl-6 sm:pl-8">
          <CheckCircle2 className="size-9 text-emerald-600" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Thanks. Your feedback is in review.
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            We saved your response for {selectedProject.title}. Rewards are
            approved manually after account activity and answer quality are
            checked.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Positive feedback is never required. If you agreed to follow-up, we
            may email you with a question or an invitation to an interview.
          </p>
          <Button asChild variant="outline" className="mt-8">
            <a href="/dashboard">Return to dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  const isSubmitting = status.state === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12"
    >
      <div className="order-2 min-w-0 lg:order-1">
        <div className="grid gap-4 border-y border-border py-5 sm:grid-cols-3">
          <EligibilityItem label="Account verified" />
          <EligibilityItem label="Project generated" />
          <EligibilityItem
            label={
              selectedProject.previewed
                ? "Previewed"
                : selectedProject.edited
                  ? "Follow-up edit made"
                  : "Exported"
            }
          />
        </div>

        <section className="border-b border-border py-8">
          <SectionHeading number="01" title="Your project" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Account email" htmlFor="accountEmail">
              <Input
                id="accountEmail"
                value={accountEmail}
                readOnly
                aria-readonly="true"
                className="h-11 bg-muted/40"
              />
            </Field>
            <Field label="Eligible Squid project" htmlFor="projectId">
              <select
                id="projectId"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {eligibleProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="border-b border-border py-8">
          <SectionHeading number="02" title="What happened" />
          <div className="mt-7 space-y-7">
            {responseFields.map((field) => (
              <Field key={field.name} label={field.label} htmlFor={field.name}>
                <Textarea
                  id={field.name}
                  name={field.name}
                  required
                  minLength={field.minLength}
                  maxLength={2_000}
                  placeholder={field.placeholder}
                  className="min-h-28 resize-y leading-6"
                />
              </Field>
            ))}
          </div>
        </section>

        <section className="py-8">
          <SectionHeading number="03" title="Value and follow-up" />
          <div className="mt-7 space-y-8">
            <fieldset>
              <legend className="text-sm font-medium">
                Would you pay to continue using Squid?
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <RadioOption name="paymentIntent" value="yes" label="Yes" />
                <RadioOption
                  name="paymentIntent"
                  value="maybe"
                  label="Maybe, depending on price"
                />
                <RadioOption name="paymentIntent" value="no" label="No" />
              </div>
            </fieldset>

            <Field
              label="What would you reasonably pay per month?"
              htmlFor="monthlyPriceUsd"
              description="Enter 0 if you would not pay for the product as it works today."
            >
              <div className="relative max-w-xs">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="monthlyPriceUsd"
                  name="monthlyPriceUsd"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={10_000}
                  step={1}
                  required
                  className="h-11 pl-7"
                  placeholder="20"
                />
              </div>
            </Field>

            <fieldset>
              <legend className="text-sm font-medium">
                Can I contact you with follow-up questions?
              </legend>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                This may include an interview or case-study invitation. Nothing
                is published without separate approval.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <RadioOption
                  name="followUpConsent"
                  value="yes"
                  label="Yes, you can contact me"
                />
                <RadioOption name="followUpConsent" value="no" label="No" />
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Optional screenshot"
                htmlFor="screenshot"
                description="PNG, JPEG, or WebP up to 6 MB. Do not include secrets or client data."
              >
                <label className="flex min-h-24 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-input px-4 py-3 transition-colors hover:border-primary/60 hover:bg-muted/25">
                  <FileImage className="size-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 text-sm">
                    <span className="block font-medium">
                      {screenshot ? screenshot.name : "Choose an image"}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {screenshot ? "Selected for upload" : "Optional evidence"}
                    </span>
                  </span>
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) =>
                      setScreenshot(event.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </Field>
              <Field
                label="Optional recording or screenshot link"
                htmlFor="mediaUrl"
                description="A shareable Loom, CloudApp, Drive, or direct link."
              >
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                  <Input
                    id="mediaUrl"
                    name="mediaUrl"
                    type="url"
                    className="h-11 pl-10"
                    placeholder="https://"
                  />
                </div>
              </Field>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/20 p-4">
              <input
                type="checkbox"
                name="honestyConfirmed"
                required
                className="mt-0.5 size-4 shrink-0 accent-primary"
              />
              <span>
                <span className="block text-sm font-medium">
                  I confirm this is my own honest experience using Squid.
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  Do not include passwords, API keys, private customer data, or
                  other sensitive information.
                </span>
              </span>
            </label>

            {status.state === "error" && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {status.message}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="min-h-12 sm:min-w-48"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" /> Submitting…
                  </>
                ) : (
                  "Submit for review"
                )}
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                Responses and rewards are reviewed manually.
              </p>
            </div>
          </div>
        </section>
      </div>

      <aside className="order-1 lg:sticky lg:top-24 lg:order-2 lg:self-start">
        <div className="border-t-2 border-primary pt-6">
          <h2 className="text-lg font-semibold">Why we&apos;re asking</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your project-specific feedback helps decide what to fix before
            another major feature is built.
          </p>

          <div className="mt-7 border-y border-border py-6">
            <RewardRow
              amount="15 credits"
              body="For a thoughtful 3–5 minute response."
            />
            <div className="my-5 h-px bg-border" />
            <RewardRow
              amount="25–40 credits"
              body="For detailed feedback plus a short recording or willingness to join an interview or case study."
            />
          </div>

          <div className="py-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <h2 className="font-semibold">Program policy</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Credits are provided for honest, thoughtful feedback after account
              and project activity are verified. Positive feedback is not
              required. One reward per user unless personally invited to
              participate again.
            </p>
            <div className="mt-5 flex gap-3 rounded-lg border border-primary/25 bg-primary/5 p-4">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-xs leading-5 text-muted-foreground">
                Generic, copied, or AI-generated responses are not approved.
                Rewards are never conditional on a positive or public review.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}

function EligibilityItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="flex size-5 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-600">
        <Check className="size-3" strokeWidth={2.5} />
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xs text-primary">{number}</span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  description,
  children,
}: {
  label: string;
  htmlFor: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {description && (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function RadioOption({
  name,
  value,
  label,
}: {
  name: string;
  value: string;
  label: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-input px-3 py-2 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
      <input
        type="radio"
        name={name}
        value={value}
        required
        className="size-4 shrink-0 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

function RewardRow({ amount, body }: { amount: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Coins className="size-4" />
      </div>
      <div>
        <div className="font-semibold text-primary">{amount}</div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
