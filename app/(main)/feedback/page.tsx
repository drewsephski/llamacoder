import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";

import { DashboardNavigation } from "@/components/dashboard-navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/features/auth/server/session";
import { ResearchFeedbackForm } from "@/features/feedback/components/research-feedback-form";
import { getResearchProgramState } from "@/features/feedback/server/program";
import { getUserCreditInfo } from "@/lib/billing/credits";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata = createNoIndexMetadata({
  title: "Verified User Research",
  description:
    "Share project-specific Squid feedback for manual review and research credits.",
  path: "/feedback",
});

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?callbackUrl=/feedback");

  const [{ project }, state, creditInfo] = await Promise.all([
    searchParams,
    getResearchProgramState(session.user.id),
    getUserCreditInfo(session.user.id),
  ]);
  if (!state) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation
        credits={creditInfo?.credits ?? 0}
        currentPage="Research"
        currentTier={creditInfo?.tier ?? "free"}
      />
      <main className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        {state.submission ? (
          <SubmissionStatus submission={state.submission} />
        ) : !state.emailVerified ? (
          <LockedProgram
            title="Verify your account to participate"
            body="Research credits are limited to verified Squid accounts so responses can be tied to real product activity."
            actionHref="/verify-email"
            actionLabel="Verify account"
          />
        ) : state.eligibleProjects.length === 0 ? (
          <LockedProgram
            title="Use Squid before sharing feedback"
            body="Create a project, generate a result, then preview, edit, or export it. The feedback form appears once that activity is verified."
            actionHref="/dashboard"
            actionLabel="View your projects"
          />
        ) : (
          <>
            <header className="mb-8 max-w-3xl sm:mb-10">
              <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Help shape Squid
              </h1>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Tell us where your project worked, where it broke down, and what
                would make it launch-ready.
              </p>
            </header>
            <ResearchFeedbackForm
              accountEmail={state.accountEmail}
              eligibleProjects={state.eligibleProjects}
              initialProjectId={project}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function SubmissionStatus({
  submission,
}: {
  submission: NonNullable<
    Awaited<ReturnType<typeof getResearchProgramState>>
  >["submission"];
}) {
  if (!submission) return null;

  const title =
    submission.status === "approved"
      ? "Your research reward is approved"
      : submission.status === "rejected"
        ? "Your submission was reviewed"
        : "Your feedback is in review";
  return (
    <div className="mx-auto max-w-2xl py-10 sm:py-16">
      <div className="border-l-4 border-primary pl-6 sm:pl-8">
        <CheckCircle2 className="size-9 text-primary" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          We received your project-specific feedback for{" "}
          {submission.projectTitle}
          {submission.rewardAmount
            ? ` and added ${submission.rewardAmount} credits to your account.`
            : ". Rewards are approved manually after the response and project activity are checked."}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Submitted {new Date(submission.createdAt).toLocaleDateString()} · One
          reward per user unless personally invited to participate again.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/dashboard">Return to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

function LockedProgram({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="mx-auto max-w-2xl py-10 sm:py-16">
      <div className="border-l-4 border-border pl-6 sm:pl-8">
        <LockKeyhole className="size-8 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">{body}</p>
        <Button asChild className="mt-8">
          <Link href={actionHref}>
            {actionLabel} <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
