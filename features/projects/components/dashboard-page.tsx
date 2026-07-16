import { renameProject } from "@/features/projects/server/actions";
import { ProjectCardActions } from "@/features/projects/components/project-card-actions";
import { UpgradeBanner } from "@/features/billing/components/upgrade-banner";
import { DashboardSignOutButton } from "@/components/dashboard-sign-out-button";
import { DashboardCreditsButton } from "@/components/dashboard-credits-button";
import { CREDIT_PACKS, FREE_PROJECT_LIMIT } from "@/lib/billing";
import Link from "next/link";
import {
  Plus,
  Clock,
  Sparkles,
  Edit3,
  ArrowRight,
  Layers,
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
} from "lucide-react";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { MODELS } from "@/lib/constants";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/features/projects/server/dashboard-query";
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
    projects,
    session,
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

  const userName = session.user.name?.split(" ")[0] || "there";
  const hasProjects = projects.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center">
                <Image
                  src="/squidagent-logo.svg"
                  alt="Squid Agent"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              </Link>
              <div className="hidden items-center gap-1 md:flex">
                <span className="px-2 text-sm text-muted-foreground">/</span>
                <span className="text-sm font-medium">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DashboardCreditsButton
                credits={userCredits}
                currentTier={currentTier}
              />
              <Button asChild variant="ghost" size="sm">
                <Link href="/gallery">Gallery</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/usage">Usage</Link>
              </Button>
              <AnimatedThemeToggleButton variant="horizontal" />
              <DashboardSignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Welcome back
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                Hi, {userName}
              </h1>
            </div>
            {!hasActiveSubscription && totalProjects >= FREE_PROJECT_LIMIT ? (
              <Button disabled className="cursor-not-allowed opacity-50">
                <Plus className="h-4 w-4" />
                Limit Reached
              </Button>
            ) : (
              <Button asChild>
                <Link href="/">
                  <Plus className="h-4 w-4" />
                  New Project
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Milestones Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-medium">Your Progress</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
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
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Available Credits
                </span>
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">{userCredits}</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{
                    width: `${hasActiveSubscription ? 100 : Math.min((userCredits / 100) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Banner - show limit-reached when free user hits limit */}
        {!hasActiveSubscription && totalProjects >= FREE_PROJECT_LIMIT ? (
          <UpgradeBanner variant="limit-reached" messageCount={totalProjects} />
        ) : hasProjects ? (
          <UpgradeBanner variant="dashboard" messageCount={totalProjects} />
        ) : null}

        {/* Projects Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-medium">Your Projects</h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                !hasActiveSubscription && totalProjects >= FREE_PROJECT_LIMIT
                  ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {hasActiveSubscription
                ? totalProjects
                : `${totalProjects}/${FREE_PROJECT_LIMIT}`}
            </span>
          </div>
          {!hasProjects ? (
            /* Empty State */
            <div className="rounded-2xl border border-border bg-card">
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Layers className="h-7 w-7 text-muted-foreground" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">
                  Choose how to start
                </h2>
                <p className="mb-6 max-w-sm text-balance text-muted-foreground">
                  Begin with a proven brief, a visual reference, or a project
                  you can remix.
                </p>
                <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-3">
                  <Button
                    asChild
                    className="h-auto justify-start gap-3 p-4 text-left"
                  >
                    <Link href="/?starter=kanban-board">
                      <Blocks className="h-5 w-5 shrink-0" />
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
                    className="h-auto justify-start gap-3 p-4 text-left"
                  >
                    <Link href="/?import=screenshot">
                      <ImagePlus className="h-5 w-5 shrink-0" />
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
                    className="h-auto justify-start gap-3 p-4 text-left"
                  >
                    <Link href="/#built-with-squid">
                      <Sparkles className="h-5 w-5 shrink-0" />
                      <span>
                        <span className="block">Remix an example</span>
                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                          Explore public projects
                        </span>
                      </span>
                    </Link>
                  </Button>
                </div>
                <Link
                  href="/?upgrade=true"
                  className="mt-5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Compare plans and pricing
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Projects Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group relative flex flex-col rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="flex flex-1 flex-col p-5">
                      {/* Header */}
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getModelBadgeClass(project.model)}`}
                          >
                            {getModelLabel(project.model)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(project.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
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
                          <div className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-blue-600 dark:text-blue-400">
                            <FileText className="h-3 w-3" />
                            <span>Planned</span>
                          </div>
                        )}
                        {project.hasCode && (
                          <div className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-foreground">
                            <Code2 className="h-3 w-3" />
                            <span>Generated</span>
                          </div>
                        )}
                        {project.verification.staticChecks === "passed" && (
                          <div className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-blue-600 dark:text-blue-400">
                            <Check className="h-3 w-3" />
                            <span>Static checks passed</span>
                          </div>
                        )}
                        {project.verification.staticChecks === "warnings" && (
                          <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-300">
                            <TriangleAlert className="h-3 w-3" />
                            <span>Static warnings</span>
                          </div>
                        )}
                        {project.verification.runtime === "passed" && (
                          <div className="flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-violet-600 dark:text-violet-400">
                            <FlaskConical className="h-3 w-3" />
                            <span>Runtime verified</span>
                          </div>
                        )}
                        {project.verification.export === "verified" && (
                          <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Export verified</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="border-t border-border px-5 py-3">
                      <Link
                        href={`/chats/${project.id}`}
                        className="flex items-center justify-between text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span>Continue building</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    {/* Expandable Rename */}
                    <details className="border-t border-border">
                      <summary className="cursor-pointer list-none px-5 py-2.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50">
                        <span className="flex items-center justify-center gap-1.5">
                          <Edit3 className="h-3 w-3" />
                          Rename
                        </span>
                      </summary>
                      <form
                        action={handleRename}
                        className="border-t border-border bg-muted/30 p-4"
                      >
                        <input type="hidden" name="chatId" value={project.id} />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="newTitle"
                            placeholder="New title..."
                            defaultValue={project.title}
                            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            required
                          />
                          <Button type="submit" size="sm">
                            Save
                          </Button>
                        </div>
                      </form>
                    </details>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
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
                  <div className="flex items-center gap-1">
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
                    <Plus className="h-4 w-4" />
                    Limit Reached
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <Link href="/">
                      <Plus className="h-4 w-4" />
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
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Crown className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-medium">Pricing Plans</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-xl border border-border bg-card p-6">
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
              <ul className="mb-6 space-y-3">
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
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-xl border-2 border-primary bg-card p-6">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Popular
              </div>
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
              <ul className="mb-6 space-y-3">
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
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              ) : currentTier === "pro_plus" ? (
                <Button disabled variant="outline" className="w-full">
                  Included in Pro Plus
                </Button>
              ) : (
                <form action="/api/stripe/checkout" method="POST">
                  <input type="hidden" name="plan" value="pro" />
                  <Button type="submit" className="w-full">
                    Upgrade to Pro
                  </Button>
                </form>
              )}
            </div>

            {/* Pro Plus Plan */}
            <div className="rounded-xl border border-border bg-card p-6">
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
              <ul className="mb-6 space-y-3">
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
                <Button disabled variant="outline" className="w-full">
                  Current Plan
                </Button>
              ) : (
                <form action="/api/stripe/checkout" method="POST">
                  <input type="hidden" name="plan" value="pro_plus" />
                  <Button type="submit" variant="outline" className="w-full">
                    {currentTier === "pro"
                      ? "Upgrade to Pro Plus"
                      : "Get Pro Plus"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Credit Packs Section */}
        <div className="mx-auto mb-10 max-w-5xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Coins className="h-4 w-4 text-primary" />
            </div>
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
                <div
                  key={key}
                  className={`relative rounded-xl border bg-card p-6 ${
                    isBestValue || isPopular
                      ? "border-2 border-primary"
                      : "border-border"
                  }`}
                >
                  {(isBestValue || isPopular) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      {isBestValue ? "Best Value" : "Most Popular"}
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">{pack.label}</h3>
                    </div>
                    <p className="text-3xl font-bold">${pack.price}</p>
                  </div>
                  <ul className="mb-6 space-y-3">
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
                  <form action="/api/stripe/credits-checkout" method="POST">
                    <input type="hidden" name="pack" value={key} />
                    <Button
                      type="submit"
                      variant={isPopular ? "default" : "outline"}
                      className="w-full"
                    >
                      Buy Credits
                    </Button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
