import { Suspense } from "react";
import { renameProject } from "@/features/projects/server/actions";
import { ProjectCardActions } from "@/features/projects/components/project-card-actions";
import { UpgradeBanner } from "@/features/billing/components/upgrade-banner";
import { StripeCheckoutButton } from "@/features/billing/components/stripe-checkout-button";
import { StripePortalButton } from "@/features/billing/components/stripe-portal-button";
import { CheckoutFeedback } from "@/features/billing/components/checkout-feedback";
import { DashboardNavigation } from "@/components/dashboard-navigation";
import { CREDIT_PACKS, FREE_PROJECT_LIMIT, TIERS } from "@/lib/billing";
import Link from "next/link";
import {
  Plus,
  Clock,
  Sparkles,
  Edit3,
  ArrowRight,
  Coins,
  Check,
  Zap,
  Crown,
  FileText,
  Code2,
  ShieldCheck,
  FlaskConical,
  ImagePlus,
  Blocks,
  TriangleAlert,
  Info,
  MessageSquareText,
} from "lucide-react";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/reui/alert";
import { Badge } from "@/components/reui/badge";
import { Frame, FramePanel } from "@/components/reui/frame";
import { IconStack } from "@/components/reui/icon-stack";
import { MODELS } from "@/lib/constants";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/features/projects/server/dashboard-query";
import { getResearchProgramState } from "@/features/feedback/server/program";
import { getModelBadgeClass } from "@/features/projects/model-badge";
import { z } from "zod";

const renameProjectFormSchema = z.object({
  chatId: z.string().min(1),
  newTitle: z.string().trim().min(1).max(80),
});

function getModelLabel(model: string): string {
  return MODELS.find((m) => m.value === model)?.label ?? "AI";
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const visiblePages = Array.from(
    new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]),
  )
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const items: Array<number | string> = [];

  visiblePages.forEach((page, index) => {
    const previousPage = visiblePages[index - 1];
    if (previousPage && page - previousPage > 1) {
      items.push(`ellipsis-${previousPage}`);
    }
    items.push(page);
  });

  return items;
}

export async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; session_id?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const {
    currentPage,
    hasActiveSubscription,
    monthlyAllowance,
    projects,
    session,
    subscriptionCredits,
    tier: currentTier,
    totalPages,
    totalProjects,
    userCredits,
  } = await getDashboardData({
    checkoutSessionId: resolvedSearchParams.session_id,
    page: resolvedSearchParams.page,
  });
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const creditPackEntries = Object.entries(CREDIT_PACKS) as [
    keyof typeof CREDIT_PACKS,
    (typeof CREDIT_PACKS)[keyof typeof CREDIT_PACKS],
  ][];

  async function handleRename(formData: FormData) {
    "use server";
    const { chatId, newTitle } = renameProjectFormSchema.parse(
      Object.fromEntries(formData),
    );
    await renameProject(chatId, newTitle);
  }

  if (!session) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }

  const researchState = await getResearchProgramState(session.user.id);
  const researchProject = researchState?.eligibleProjects[0];

  const userName = session.user.name?.split(" ")[0] || "there";
  const creditScale = hasActiveSubscription
    ? Math.max(monthlyAllowance, 1)
    : TIERS.free.monthlyCredits;
  const creditBarValue = hasActiveSubscription
    ? subscriptionCredits
    : userCredits;
  const hasProjects = projects.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <CheckoutFeedback />
      </Suspense>
      <DashboardNavigation
        credits={userCredits}
        currentPage="Dashboard"
        currentTier={currentTier}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Welcome back
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Hi, {userName}
              </h1>
            </div>
            {!hasActiveSubscription && totalProjects >= FREE_PROJECT_LIMIT ? (
              <Button
                disabled
                className="min-h-11 cursor-not-allowed opacity-50 sm:min-h-10"
              >
                <Plus data-icon="inline-start" />
                Limit Reached
              </Button>
            ) : (
              <Button asChild className="min-h-11 sm:min-h-10">
                <Link href="/">
                  <Plus data-icon="inline-start" />
                  New Project
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Milestones Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Your Progress</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Frame spacing="xs" className="bg-muted/30">
              <FramePanel className="p-4 shadow-none sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Projects Created
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      !hasActiveSubscription &&
                      totalProjects >= FREE_PROJECT_LIMIT
                        ? "text-red-600 dark:text-red-400"
                        : ""
                    }`}
                  >
                    {hasActiveSubscription
                      ? totalProjects
                      : `${totalProjects}/${FREE_PROJECT_LIMIT}`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all ${
                      !hasActiveSubscription &&
                      totalProjects >= FREE_PROJECT_LIMIT
                        ? "bg-red-500"
                        : "bg-primary"
                    }`}
                    style={{
                      width: `${hasActiveSubscription ? 100 : (totalProjects / FREE_PROJECT_LIMIT) * 100}%`,
                    }}
                  />
                </div>
              </FramePanel>
            </Frame>
            <Frame spacing="xs" className="bg-muted/30">
              <FramePanel className="p-4 shadow-none sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">
                      Available Credits
                    </span>
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="-my-2 hidden sm:inline-flex"
                            aria-label="How available credits work"
                          >
                            <Info aria-hidden="true" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="start"
                          sideOffset={8}
                          className="max-w-64"
                        >
                          <p className="text-pretty leading-relaxed">
                            Free accounts receive {TIERS.free.monthlyCredits}{" "}
                            starter credits after email verification.
                            Generations charge only after a version saves
                            successfully. See Usage for the full ledger.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">{userCredits}</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{
                      width: `${Math.min((creditBarValue / creditScale) * 100, 100)}%`,
                    }}
                  />
                </div>
              </FramePanel>
            </Frame>
          </div>
        </div>

        {researchProject && !researchState?.submission && (
          <Frame spacing="xs" className="mb-8 bg-info/10">
            <FramePanel className="p-0 shadow-none">
              <Alert
                variant="info"
                className="border-0 bg-transparent px-4 py-4 sm:grid-cols-[1rem_1fr_auto] sm:px-5"
              >
                <MessageSquareText />
                <AlertTitle>Help improve Squid and earn 15 credits</AlertTitle>
                <AlertDescription className="max-w-2xl">
                  Tell us what worked, what broke, and what would make your
                  project launch-ready. Honest criticism is encouraged.
                </AlertDescription>
                <AlertAction>
                  <Button asChild variant="outline" className="shrink-0">
                    <Link href={`/feedback?project=${researchProject.id}`}>
                      Share feedback <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </AlertAction>
              </Alert>
            </FramePanel>
          </Frame>
        )}

        {/* Upgrade Banner - show limit-reached when free user hits limit */}
        {!hasActiveSubscription && totalProjects >= FREE_PROJECT_LIMIT ? (
          <UpgradeBanner variant="limit-reached" messageCount={totalProjects} />
        ) : hasProjects ? (
          <UpgradeBanner variant="dashboard" messageCount={totalProjects} />
        ) : null}

        {/* Projects Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-medium">Your Projects</h2>
            <Badge
              radius="full"
              variant={
                !hasActiveSubscription && totalProjects >= FREE_PROJECT_LIMIT
                  ? "destructive-light"
                  : "secondary"
              }
            >
              {hasActiveSubscription
                ? totalProjects
                : `${totalProjects}/${FREE_PROJECT_LIMIT}`}
            </Badge>
          </div>
          {!hasProjects ? (
            /* Empty State */
            <Frame spacing="sm" className="bg-muted/30">
              <FramePanel className="p-0 shadow-none">
                <Empty className="border-0 px-6 py-12 sm:py-16">
                  <EmptyHeader>
                    <EmptyMedia>
                      <IconStack
                        aria-hidden="true"
                        className="w-22 h-24 text-primary"
                      >
                        <Blocks className="size-5 text-primary" />
                      </IconStack>
                    </EmptyMedia>
                    <EmptyTitle className="text-xl">
                      Choose how to start
                    </EmptyTitle>
                    <EmptyDescription>
                      Begin with a proven brief, a visual reference, or a
                      project you can remix.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent className="w-full max-w-3xl gap-3 sm:grid sm:grid-cols-3">
                    <Button
                      asChild
                      className="h-auto w-full justify-start gap-3 p-4 text-left"
                    >
                      <Link href="/?starter=kanban-board">
                        <Blocks data-icon="inline-start" />
                        <span>
                          <span className="block">Start from a template</span>
                          <span className="mt-0.5 block text-xs font-normal opacity-75">
                            Prefill a complete brief
                          </span>
                        </span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="h-auto w-full justify-start gap-3 p-4 text-left"
                    >
                      <Link href="/?import=screenshot">
                        <ImagePlus data-icon="inline-start" />
                        <span>
                          <span className="block">Import a screenshot</span>
                          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                            Recreate a visual reference
                          </span>
                        </span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="h-auto w-full justify-start gap-3 p-4 text-left"
                    >
                      <Link href="/#built-with-squid">
                        <Sparkles data-icon="inline-start" />
                        <span>
                          <span className="block">Remix an example</span>
                          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                            Explore public projects
                          </span>
                        </span>
                      </Link>
                    </Button>
                  </EmptyContent>
                  <Link
                    href="/?upgrade=true"
                    className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    Compare plans and pricing
                  </Link>
                </Empty>
              </FramePanel>
            </Frame>
          ) : (
            <>
              {/* Projects Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Frame
                    key={project.id}
                    spacing="xs"
                    className="group h-full bg-muted/30 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm"
                  >
                    <FramePanel className="flex h-full flex-col p-0 shadow-none">
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        {/* Header */}
                        <div className="mb-4 flex items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span
                              className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getModelBadgeClass(project.model)}`}
                            >
                              {getModelLabel(project.model)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Updated{" "}
                              {new Date(project.lastActivityAt).toLocaleString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                          <ProjectCardActions
                            projectId={project.id}
                            projectTitle={project.title}
                          />
                        </div>

                        {/* Title */}
                        <Link href={`/chats/${project.id}`} className="mb-1">
                          <h3 className="line-clamp-2 font-medium leading-snug">
                            {project.title}
                          </h3>
                        </Link>

                        {/* Meta */}
                        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {project.quality === "high"
                                ? "High quality"
                                : "Fast"}
                            </span>
                          </div>
                          {/* Status Badge */}
                          {project.plan && !project.hasCode && (
                            <Badge variant="info-light" radius="full">
                              <FileText className="h-3 w-3" />
                              <span>Planned</span>
                            </Badge>
                          )}
                          {project.hasCode && (
                            <Badge variant="secondary" radius="full">
                              <Code2 className="h-3 w-3" />
                              <span>Generated</span>
                            </Badge>
                          )}
                          {project.verification.staticChecks === "passed" && (
                            <Badge variant="success-light" radius="full">
                              <Check className="h-3 w-3" />
                              <span>Static checks passed</span>
                            </Badge>
                          )}
                          {project.verification.staticChecks === "warnings" && (
                            <Badge variant="warning-light" radius="full">
                              <TriangleAlert className="h-3 w-3" />
                              <span>Static warnings</span>
                            </Badge>
                          )}
                          {project.verification.runtime === "passed" && (
                            <Badge variant="info-light" radius="full">
                              <FlaskConical className="h-3 w-3" />
                              <span>Runtime verified</span>
                            </Badge>
                          )}
                          {project.verification.export === "verified" && (
                            <Badge variant="success-light" radius="full">
                              <ShieldCheck className="h-3 w-3" />
                              <span>Export verified</span>
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="border-t border-border px-5 py-3">
                        <Link
                          href={`/chats/${project.id}`}
                          className="flex items-center justify-between rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <span>Continue building</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>

                      {/* Expandable Rename */}
                      <details className="border-t border-border">
                        <summary className="cursor-pointer list-none px-5 py-2.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                          <span className="flex items-center justify-center gap-1.5">
                            <Edit3 className="h-3 w-3" />
                            Rename
                          </span>
                        </summary>
                        <form
                          action={handleRename}
                          className="border-t border-border bg-muted/30 p-4"
                        >
                          <input
                            type="hidden"
                            name="chatId"
                            value={project.id}
                          />
                          <div className="flex flex-col gap-2 min-[420px]:flex-row">
                            <input
                              type="text"
                              name="newTitle"
                              placeholder="New title..."
                              defaultValue={project.title}
                              className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                              required
                            />
                            <Button type="submit" size="sm">
                              Save
                            </Button>
                          </div>
                        </form>
                      </details>
                    </FramePanel>
                  </Frame>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  {currentPage === 1 ? (
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard?page=${currentPage - 1}`}>
                        Previous
                      </Link>
                    </Button>
                  )}
                  <span className="px-2 text-sm text-muted-foreground sm:hidden">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="hidden items-center gap-1 sm:flex">
                    {paginationItems.map((item) =>
                      typeof item === "string" ? (
                        <span
                          key={item}
                          className="px-1 text-sm text-muted-foreground"
                          aria-hidden="true"
                        >
                          …
                        </span>
                      ) : currentPage === item ? (
                        <Button key={item} variant="default" size="sm">
                          {item}
                        </Button>
                      ) : (
                        <Button key={item} variant="outline" size="sm" asChild>
                          <Link href={`/dashboard?page=${item}`}>{item}</Link>
                        </Button>
                      ),
                    )}
                  </div>
                  {currentPage === totalPages ? (
                    <Button variant="outline" size="sm" disabled>
                      Next
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard?page=${currentPage + 1}`}>
                        Next
                      </Link>
                    </Button>
                  )}
                </div>
              )}

              {/* Bottom CTA */}
              <div className="mt-12 flex items-center justify-center">
                {!hasActiveSubscription &&
                totalProjects >= FREE_PROJECT_LIMIT ? (
                  <Button
                    disabled
                    variant="outline"
                    className="cursor-not-allowed opacity-50"
                  >
                    <Plus data-icon="inline-start" />
                    Limit Reached
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <Link href="/">
                      <Plus data-icon="inline-start" />
                      Start another project
                    </Link>
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Pricing Section */}
        <div className="mx-auto mb-10 max-w-5xl">
          <div className="mb-6">
            <h2 className="text-lg font-medium">Pricing Plans</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Free Plan */}
            <Frame spacing="xs" className="h-full bg-muted/30">
              <FramePanel className="flex h-full flex-col p-6 shadow-none">
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Free</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    $0
                    <span className="text-lg font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                </div>
                <ul className="mb-6 flex-1 space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>5 starter credits</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Free AI model only</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Community support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" disabled>
                  {currentTier === "free" ? "Current Plan" : "Included"}
                </Button>
              </FramePanel>
            </Frame>

            {/* Pro Plan */}
            <Frame
              spacing="xs"
              className="h-full border-primary bg-primary/10 shadow-sm"
            >
              <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                <Badge radius="full">Popular</Badge>
              </div>
              <FramePanel className="flex h-full flex-col p-6 shadow-none">
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Pro</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    $9
                    <span className="text-lg font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                </div>
                <ul className="mb-6 flex-1 space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>100 credits/month</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Rollover up to 200</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Starter, Efficient, and Advanced models</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Advanced features</span>
                  </li>
                </ul>
                {currentTier === "pro" ? (
                  <StripePortalButton variant="outline" className="w-full">
                    Manage subscription
                  </StripePortalButton>
                ) : currentTier === "pro_plus" ? (
                  <Button disabled variant="outline" className="w-full">
                    Included in Pro Plus
                  </Button>
                ) : (
                  <StripeCheckoutButton
                    checkout={{ plan: "pro" }}
                    className="w-full"
                  >
                    Upgrade to Pro
                  </StripeCheckoutButton>
                )}
              </FramePanel>
            </Frame>

            {/* Pro Plus Plan */}
            <Frame spacing="xs" className="h-full bg-muted/30">
              <FramePanel className="flex h-full flex-col p-6 shadow-none">
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-semibold">Pro Plus</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    $29
                    <span className="text-lg font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                </div>
                <ul className="mb-6 flex-1 space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>500 credits/month</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>All models, including Premium</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Credit rollover up to 1,000</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Advanced features</span>
                  </li>
                </ul>
                {currentTier === "pro_plus" ? (
                  <StripePortalButton variant="outline" className="w-full">
                    Manage subscription
                  </StripePortalButton>
                ) : (
                  <StripeCheckoutButton
                    checkout={{ plan: "pro_plus" }}
                    variant="outline"
                    className="w-full"
                  >
                    {currentTier === "pro"
                      ? "Upgrade to Pro Plus"
                      : "Get Pro Plus"}
                  </StripeCheckoutButton>
                )}
              </FramePanel>
            </Frame>
          </div>
        </div>

        {/* Credit Packs Section */}
        <div className="mx-auto mb-10 max-w-5xl">
          <div className="mb-6">
            <div>
              <h2 className="text-lg font-medium">Credit Packs</h2>
              <p className="text-sm text-muted-foreground">
                One-time packs for smarter models. Purchased credits never
                expire.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {creditPackEntries.map(([key, pack]) => {
              const isPopular = "popular" in pack && pack.popular;
              const isBestValue = "bestValue" in pack && pack.bestValue;

              return (
                <Frame
                  key={key}
                  spacing="xs"
                  className={`h-full ${
                    isBestValue || isPopular
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "bg-muted/30"
                  }`}
                >
                  {(isBestValue || isPopular) && (
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                      <Badge radius="full">
                        {isBestValue ? "Best Value" : "Most Popular"}
                      </Badge>
                    </div>
                  )}
                  <FramePanel className="flex h-full flex-col p-6 shadow-none">
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Coins className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">{pack.label}</h3>
                      </div>
                      <p className="text-3xl font-bold">${pack.price}</p>
                    </div>
                    <ul className="mb-6 flex-1 space-y-3">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{pack.credits} credits</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Works with all smarter models</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>No subscription required</span>
                      </li>
                    </ul>
                    <StripeCheckoutButton
                      checkout={{ pack: key }}
                      variant={isPopular ? "default" : "outline"}
                      className="w-full"
                    >
                      Buy Credits
                    </StripeCheckoutButton>
                  </FramePanel>
                </Frame>
              );
            })}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
