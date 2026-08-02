"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CircleCheck,
  Loader2,
} from "lucide-react";
import { usePlausible } from "next-plausible";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function DesignPartnerSection() {
  const plausible = usePlausible();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [issues, setIssues] = useState<FieldIssues>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("submitting");
    setMessage(null);
    setIssues({});

    const response = await fetch("/api/design-partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        role: formData.get("role"),
        companyName: formData.get("companyName"),
        portfolioUrl: formData.get("portfolioUrl"),
        projectSummary: formData.get("projectSummary"),
        timeline: formData.get("timeline"),
        preferredContact: formData.get("preferredContact"),
        permissionToContact: formData.get("permissionToContact") === "on",
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
        });
      }
      return;
    }

    plausible("Design Partner Application Submitted", {
      props: {
        role: String(formData.get("role") ?? "unknown"),
        timeline: String(formData.get("timeline") ?? "unknown"),
      },
    });
    form.reset();
    setStatus("success");
  }

  return (
    <section
      id="design-partner-program"
      aria-labelledby="design-partner-heading"
      className="relative z-10 scroll-mt-28 overflow-x-clip border-y border-border/70 bg-muted/25 px-3 py-14 sm:px-6 sm:py-24"
    >
      <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
        <div className="min-w-0 px-1 lg:sticky lg:top-24 lg:self-start lg:px-0">
          <p className="font-mono-jb text-xs font-semibold uppercase tracking-[0.16em] text-[#0062FF] dark:text-[#0CA8FF]">
            Design partner program
          </p>
          <h2
            id="design-partner-heading"
            className="mt-4 max-w-xl font-display text-4xl leading-[1.02] tracking-tight text-foreground sm:text-5xl"
          >
            Turn a real brief into something your client can click.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
            We are inviting a small group of designers, agency owners, product
            leads, and founders to build one real prototype directly with the
            Squid team.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "One focused working session with the Squid team",
              "A shareable React prototype and portable source code",
              "No charge for the first prototype",
              "Candid feedback is required; positive feedback is not",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0062FF]/10 text-[#0062FF] dark:text-[#0CA8FF]">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-lg border-l-2 border-border pl-4 text-sm leading-6 text-muted-foreground">
            This is a research partnership, not a promise of ongoing agency
            services. We select briefs where a prototype can create a useful
            decision quickly.
          </p>
        </div>

        <div className="min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-background p-4 shadow-sm sm:rounded-2xl sm:p-8">
          {status === "success" ? (
            <div className="flex min-h-[520px] flex-col items-start justify-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CircleCheck className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                Your brief is in.
              </h3>
              <p className="mt-3 max-w-md leading-7 text-muted-foreground">
                We will review the project and contact you if it is a strong fit
                for an upcoming working session.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="min-w-0">
              {message ? (
                <div
                  id="design-partner-form-error"
                  role="alert"
                  className="mb-6 flex scroll-mt-24 items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-foreground"
                >
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400"
                    aria-hidden="true"
                  />
                  <p>{message}</p>
                </div>
              ) : null}

              <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                <Field label="Name" name="name" issues={issues} required>
                  <Input id="name" name="name" autoComplete="name" required />
                </Field>
                <Field label="Work email" name="email" issues={issues} required>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </Field>
                <Field label="Your role" name="role" issues={issues} required>
                  <SelectField id="role" name="role" options={roleOptions} />
                </Field>
                <Field
                  label="Company or studio"
                  name="companyName"
                  issues={issues}
                >
                  <Input
                    id="companyName"
                    name="companyName"
                    autoComplete="organization"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    label="Portfolio or company URL"
                    name="portfolioUrl"
                    issues={issues}
                  >
                    <Input
                      id="portfolioUrl"
                      name="portfolioUrl"
                      type="url"
                      inputMode="url"
                      placeholder="https://"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="What would you like to prototype?"
                    name="projectSummary"
                    issues={issues}
                    hint="Include the audience, the decision this prototype should unlock, and any deadline."
                    required
                  >
                    <Textarea
                      id="projectSummary"
                      name="projectSummary"
                      rows={6}
                      minLength={40}
                      maxLength={1500}
                      required
                    />
                  </Field>
                </div>
                <Field
                  label="Project timing"
                  name="timeline"
                  issues={issues}
                  required
                >
                  <SelectField
                    id="timeline"
                    name="timeline"
                    options={timelineOptions}
                  />
                </Field>
                <Field
                  label="Preferred reply"
                  name="preferredContact"
                  issues={issues}
                  required
                >
                  <SelectField
                    id="preferredContact"
                    name="preferredContact"
                    options={contactOptions}
                  />
                </Field>
              </div>

              <div className="sr-only" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} />
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted-foreground">
                <input
                  name="permissionToContact"
                  type="checkbox"
                  required
                  className="mt-1 size-4 rounded border-border accent-[#0062FF]"
                />
                <span>
                  Squid Agent may contact me about this application and the
                  proposed working session.
                </span>
              </label>
              {issues.permissionToContact?.[0] ? (
                <p className="mt-2 text-sm text-destructive">
                  {issues.permissionToContact[0]}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                disabled={status === "submitting"}
                className="mt-7 w-full rounded-xl sm:w-auto"
              >
                {status === "submitting" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight className="size-4" aria-hidden="true" />
                )}
                {status === "submitting" ? "Submitting" : "Apply to partner"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
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
  hint?: string;
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
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>
      ) : null}
      {issue ? (
        <p className="mt-2 text-sm leading-5 text-red-600 dark:text-red-400">
          {issue}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  id,
  name,
  options,
}: {
  id: string;
  name: string;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue=""
      required
      className="flex h-10 w-full min-w-0 max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <option value="" disabled>
        Select one
      </option>
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
