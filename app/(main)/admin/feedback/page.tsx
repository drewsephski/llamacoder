import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CloudCog,
  CircleDollarSign,
  Database,
  ExternalLink,
  FileSpreadsheet,
  Mail,
  KeyRound,
  RefreshCw,
  UsersRound,
  XCircle,
} from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  RESEARCH_FEEDBACK_CATEGORIES,
  getResearchFeedbackRewardAmounts,
} from "@/features/feedback/contracts";
import {
  isFeedbackAdminConfigured,
  isFeedbackAdminEmail,
} from "@/features/feedback/server/admin";
import {
  retryResearchFeedbackDeliveryAction,
  reviewResearchFeedbackAction,
} from "@/features/feedback/server/admin-actions";
import { isGoogleSheetsFeedbackSyncConfigured } from "@/features/feedback/server/google-sheets";
import { isFeedbackNotificationConfigured } from "@/features/feedback/server/notification";
import { getPrisma } from "@/lib/prisma";
import { createNoIndexMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = createNoIndexMetadata({
  title: "Feedback Review",
  description: "Private review queue for Squid user-research submissions.",
  path: "/admin/feedback",
});

const filterStatuses = ["pending", "approved", "rejected", "all"] as const;
type FilterStatus = (typeof filterStatuses)[number];

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    message?: string;
    error?: string;
  }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?callbackUrl=/admin/feedback");
  if (!isFeedbackAdminConfigured()) {
    return <FeedbackAdminSetup signedInEmail={session.user.email} />;
  }
  if (!isFeedbackAdminEmail(session.user.email)) redirect("/dashboard");

  const params = await searchParams;
  const status = filterStatuses.includes(params.status as FilterStatus)
    ? (params.status as FilterStatus)
    : "pending";
  const prisma = getPrisma();
  const [submissions, pending, approved, rejected] = await Promise.all([
    prisma.researchFeedbackSubmission.findMany({
      where: status === "all" ? undefined : { status },
      orderBy: { createdAt: status === "pending" ? "asc" : "desc" },
      take: 100,
      select: {
        id: true,
        accountEmail: true,
        buildGoal: true,
        previousTools: true,
        frustration: true,
        betterThanExpected: true,
        abandonmentPoint: true,
        launchBlocker: true,
        singleImprovement: true,
        paymentIntent: true,
        monthlyPriceUsd: true,
        followUpConsent: true,
        mediaUrl: true,
        rewardTrack: true,
        activityEvidence: true,
        status: true,
        primaryCategory: true,
        rewardAmount: true,
        reviewNotes: true,
        reviewedByEmail: true,
        reviewedAt: true,
        sheetSyncStatus: true,
        sheetSyncError: true,
        notificationStatus: true,
        notificationError: true,
        createdAt: true,
        chat: { select: { id: true, title: true } },
      },
    }),
    prisma.researchFeedbackSubmission.count({ where: { status: "pending" } }),
    prisma.researchFeedbackSubmission.count({ where: { status: "approved" } }),
    prisma.researchFeedbackSubmission.count({ where: { status: "rejected" } }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border" aria-label="Admin navigation">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src="/squidagent-logo.svg"
              alt=""
              width={30}
              height={30}
              className="size-[30px]"
            />
            <span className="text-sm font-semibold">Feedback operations</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft /> Dashboard
            </Link>
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Research feedback
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Review project-linked responses, categorize the abandonment
              reason, and issue the verified credit reward.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <IntegrationState
              icon={FileSpreadsheet}
              label="Google Sheet"
              configured={isGoogleSheetsFeedbackSyncConfigured()}
            />
            <IntegrationState
              icon={Mail}
              label="Email alerts"
              configured={isFeedbackNotificationConfigured()}
            />
          </div>
        </header>

        {(params.message || params.error) && (
          <div
            role="status"
            className={cn(
              "mt-6 border-l-4 px-4 py-3 text-sm",
              params.error
                ? "border-destructive bg-destructive/5 text-destructive"
                : "border-emerald-500 bg-emerald-500/5 text-foreground",
            )}
          >
            {params.error || params.message}
          </div>
        )}

        <section className="grid border-b border-border sm:grid-cols-3">
          <Metric label="Pending review" value={pending} icon={UsersRound} />
          <Metric label="Approved" value={approved} icon={CheckCircle2} />
          <Metric label="Rejected" value={rejected} icon={XCircle} />
        </section>

        <div
          className="flex flex-wrap gap-2 py-6"
          aria-label="Feedback filters"
        >
          {filterStatuses.map((filter) => (
            <Button
              asChild
              key={filter}
              size="sm"
              variant={status === filter ? "secondary" : "ghost"}
            >
              <Link
                href={`/admin/feedback?status=${filter}`}
                aria-current={status === filter ? "page" : undefined}
              >
                {filter[0]!.toUpperCase() + filter.slice(1)}
              </Link>
            </Button>
          ))}
        </div>

        {submissions.length === 0 ? (
          <div className="border-y border-border py-16 text-center">
            <p className="font-medium">No {status} submissions</p>
            <p className="mt-2 text-sm text-muted-foreground">
              New verified responses will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {submissions.map((submission) => (
              <article
                key={submission.id}
                className="overflow-hidden rounded-xl border border-border bg-background"
              >
                <div className="grid gap-4 border-b border-border bg-muted/25 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusLabel status={submission.status} />
                      <span className="text-xs text-muted-foreground">
                        {submission.rewardTrack === "extended"
                          ? "25–40 credit track"
                          : "15 credit track"}
                      </span>
                    </div>
                    <h2 className="mt-3 truncate text-xl font-semibold tracking-tight">
                      {submission.chat.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {submission.accountEmail} · Submitted{" "}
                      {submission.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/chats/${submission.chat.id}`}
                        target="_blank"
                      >
                        Project <ExternalLink />
                      </Link>
                    </Button>
                    {submission.mediaUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={submission.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Evidence <ExternalLink />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="min-w-0 px-5 py-6 sm:px-6">
                    <dl className="grid gap-x-8 gap-y-7 md:grid-cols-2">
                      <Answer
                        label="What they tried to build"
                        value={submission.buildGoal}
                      />
                      <Answer
                        label="Previous tools"
                        value={submission.previousTools}
                      />
                      <Answer
                        label="Most confusing or frustrating"
                        value={submission.frustration}
                      />
                      <Answer
                        label="Better than expected"
                        value={submission.betterThanExpected}
                      />
                      <Answer
                        label="Closest to abandoning"
                        value={submission.abandonmentPoint}
                      />
                      <Answer
                        label="Launch blocker"
                        value={submission.launchBlocker}
                      />
                      <Answer
                        label="Single improvement"
                        value={submission.singleImprovement}
                      />
                      <Answer
                        label="Willingness to pay"
                        value={`${submission.paymentIntent} · $${submission.monthlyPriceUsd}/month`}
                      />
                    </dl>
                  </div>

                  <aside className="border-t border-border bg-muted/15 px-5 py-6 sm:px-6 lg:border-l lg:border-t-0">
                    <div className="space-y-3 text-sm">
                      <DeliveryStatus
                        label="Google Sheet"
                        status={submission.sheetSyncStatus}
                        error={submission.sheetSyncError}
                        submissionId={submission.id}
                        channel="sheet"
                      />
                      <DeliveryStatus
                        label="Email alert"
                        status={submission.notificationStatus}
                        error={submission.notificationError}
                        submissionId={submission.id}
                        channel="notification"
                      />
                      <p className="text-muted-foreground">
                        Follow-up allowed:{" "}
                        {submission.followUpConsent ? "Yes" : "No"}
                      </p>
                    </div>

                    {submission.status === "pending" ? (
                      <ReviewForm
                        submissionId={submission.id}
                        rewardTrack={submission.rewardTrack}
                      />
                    ) : (
                      <div className="mt-7 border-t border-border pt-5 text-sm">
                        <p className="font-medium">
                          {submission.status === "approved"
                            ? `${submission.rewardAmount} credits awarded`
                            : "No credits awarded"}
                        </p>
                        <p className="mt-2 text-muted-foreground">
                          {categoryLabel(submission.primaryCategory)}
                        </p>
                        {submission.reviewNotes && (
                          <p className="mt-3 leading-6 text-muted-foreground">
                            {submission.reviewNotes}
                          </p>
                        )}
                        <p className="mt-3 text-xs text-muted-foreground">
                          {submission.reviewedByEmail} ·{" "}
                          {submission.reviewedAt?.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </aside>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FeedbackAdminSetup({ signedInEmail }: { signedInEmail: string }) {
  const environmentTemplate = [
    `FEEDBACK_ADMIN_EMAILS=${signedInEmail}`,
    `FEEDBACK_NOTIFICATION_EMAILS=${signedInEmail}`,
    "GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL=<client_email from the JSON key>",
    'GOOGLE_SHEETS_PRIVATE_KEY="<private_key from the JSON key>"',
    "GOOGLE_SHEETS_SPREADSHEET_ID=<spreadsheet ID>",
    "GOOGLE_SHEETS_TAB_NAME=Feedback",
  ].join("\n");

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border" aria-label="Setup navigation">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/squidagent-logo.svg"
              alt=""
              width={30}
              height={30}
              className="size-[30px]"
            />
            <span className="text-sm font-semibold">Feedback operations</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft /> Dashboard
            </Link>
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <header className="max-w-3xl">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CloudCog className="size-5" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Connect feedback operations
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            The review queue is installed but intentionally locked until an
            administrator and delivery credentials are configured.
          </p>
        </header>

        <section className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          <SetupStep
            number="01"
            icon={KeyRound}
            title="Allow your account"
            body={`Add ${signedInEmail} to FEEDBACK_ADMIN_EMAILS. Other signed-in accounts will be redirected away from this page.`}
          />
          <SetupStep
            number="02"
            icon={FileSpreadsheet}
            title="Share the tracker"
            body="Enable the Google Sheets API, create a service account JSON key, then share the tracker with its client_email as an Editor."
          />
          <SetupStep
            number="03"
            icon={Database}
            title="Deploy and verify"
            body="Deploy the Prisma migrations and environment variables, then return here to review and award credits."
          />
        </section>

        <section className="mt-8 rounded-xl border border-border bg-muted/20 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Server environment template</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Keep the private key server-only. Never prefix these values with
                NEXT_PUBLIC_.
              </p>
            </div>
            <KeyRound className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          </div>
          <pre className="mt-5 overflow-x-auto rounded-lg bg-neutral-950 p-4 text-xs leading-6 text-neutral-100 sm:text-sm">
            <code>{environmentTemplate}</code>
          </pre>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a
              href="https://console.cloud.google.com/iam-admin/serviceaccounts"
              target="_blank"
              rel="noreferrer"
            >
              Open Google Cloud <ExternalLink />
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Return to dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function SetupStep({
  number,
  icon: Icon,
  title,
  body,
}: {
  number: string;
  icon: typeof KeyRound;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-background p-5 sm:p-6">
      <div className="flex items-center justify-between text-muted-foreground">
        <Icon className="size-5" />
        <span className="text-xs font-semibold tabular-nums">{number}</span>
      </div>
      <h2 className="mt-8 font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function IntegrationState({
  icon: Icon,
  label,
  configured,
}: {
  icon: typeof FileSpreadsheet;
  label: string;
  configured: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-4" />
      {label}: {configured ? "Connected" : "Not configured"}
    </span>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof UsersRound;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-border py-6 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      </div>
      <Icon className="size-5 text-muted-foreground" />
    </div>
  );
}

function StatusLabel({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        status === "approved"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : status === "rejected"
            ? "bg-destructive/10 text-destructive"
            : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      )}
    >
      {status}
    </span>
  );
}

function Answer({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 whitespace-pre-wrap text-sm leading-6">{value}</dd>
    </div>
  );
}

function ReviewForm({
  submissionId,
  rewardTrack,
}: {
  submissionId: string;
  rewardTrack: string;
}) {
  const rewards = getResearchFeedbackRewardAmounts(rewardTrack);
  return (
    <form
      action={reviewResearchFeedbackAction}
      className="mt-7 space-y-4 border-t border-border pt-5"
    >
      <input type="hidden" name="submissionId" value={submissionId} />
      <label className="block text-sm font-medium">
        Primary category
        <select
          name="category"
          required
          defaultValue=""
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="" disabled>
            Choose a category
          </option>
          {RESEARCH_FEEDBACK_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {categoryLabel(category)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Reviewer note
        <textarea
          name="note"
          required
          minLength={8}
          maxLength={1_000}
          rows={3}
          placeholder="Why this response qualifies or should be rejected"
          className="mt-2 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <label className="block text-sm font-medium">
        Reward
        <select
          name="rewardAmount"
          defaultValue={String(rewards[0])}
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {rewards.map((reward) => (
            <option key={reward} value={reward}>
              {reward} credits
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button type="submit" name="decision" value="approve" size="sm">
          <CircleDollarSign /> Approve
        </Button>
        <Button
          type="submit"
          name="decision"
          value="reject"
          variant="destructive"
          size="sm"
        >
          <XCircle /> Reject
        </Button>
      </div>
    </form>
  );
}

function DeliveryStatus({
  label,
  status,
  error,
  submissionId,
  channel,
}: {
  label: string;
  status: string;
  error: string | null;
  submissionId: string;
  channel: "sheet" | "notification";
}) {
  const retryable = status === "failed" || status === "disabled";
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">
          {label}: <span className="text-foreground">{status}</span>
        </span>
        {retryable && (
          <form action={retryResearchFeedbackDeliveryAction}>
            <input type="hidden" name="submissionId" value={submissionId} />
            <input type="hidden" name="channel" value={channel} />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              aria-label={`Retry ${label}`}
            >
              <RefreshCw /> Retry
            </Button>
          </form>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs leading-5 text-destructive">{error}</p>
      )}
    </div>
  );
}

function categoryLabel(category: string | null) {
  if (!category) return "Uncategorized";
  return category
    .split("_")
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
}
