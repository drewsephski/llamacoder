import { getPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { renameProject } from "../actions";
import { ProjectCardActions } from "@/components/project-card-actions";
import { UnlockProgress } from "@/components/unlock-progress";
import { UpgradeBanner } from "@/components/upgrade-banner";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { 
  Plus, 
  Clock, 
  Sparkles, 
  Edit3, 
  ArrowRight,
  FolderOpen, 
  LogOut,
  Layers,
  MoreHorizontal,
  Coins,
  Check,
  Zap,
  Crown
} from "lucide-react";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { Button } from "@/components/ui/button";

// Professional model badge styles - no emojis
function getModelBadgeClass(model: string): string {
  const m = model.toLowerCase();
  if (m.includes("gpt")) return "model-gpt";
  if (m.includes("claude")) return "model-claude";
  if (m.includes("gemini")) return "model-gemini";
  if (m.includes("deepseek")) return "model-deepseek";
  if (m.includes("llama")) return "model-llama";
  return "model-default";
}

function getModelLabel(model: string): string {
  const m = model.toLowerCase();
  if (m.includes("gpt")) return "GPT";
  if (m.includes("claude")) return "Claude";
  if (m.includes("gemini")) return "Gemini";
  if (m.includes("deepseek")) return "DeepSeek";
  if (m.includes("llama")) return "Llama";
  return "AI";
}

async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let projects: any[] = [];
  let userCredits = 0;
  let totalProjects = 0;
  let hasActiveSubscription = false;
  const PROJECTS_PER_PAGE = 9;
  const FREE_PROJECT_LIMIT = 3;
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || "1", 10);

  if (session) {
    const prisma = getPrisma();
    totalProjects = await prisma.chat.count({
      where: { userId: session.user.id },
    });

    projects = await prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PROJECTS_PER_PAGE,
      take: PROJECTS_PER_PAGE,
    });

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          credits: true,
          subscription: {
            select: {
              status: true,
            },
          },
        },
      });
      userCredits = user?.credits || 0;
      hasActiveSubscription = user?.subscription?.status === "active";
    } catch (error) {
      console.error("[Dashboard] Failed to fetch user credits:", error);
      userCredits = 0;
    }
  }

  async function handleRename(formData: FormData) {
    "use server";
    const chatId = formData.get("chatId") as string;
    const newTitle = formData.get("newTitle") as string;
    await renameProject(chatId, newTitle);
    revalidatePath("/dashboard");
  }

  // Unauthenticated state
  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center">
                <img src="/squidcoder-logo.svg" alt="Squid Coder" className="h-8 w-auto" />
              </Link>
              <div className="flex items-center gap-3">
                <AnimatedThemeToggleButton variant="horizontal" />
                <Link 
                  href="/sign-in" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Button asChild>
                  <Link href="/sign-up">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex flex-col items-center justify-center px-6 py-32">
          <div className="max-w-sm w-full">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight">Sign in to continue</h1>
            <p className="mb-8 text-muted-foreground">
              Access your projects and continue building with AI
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/sign-in">
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Try Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userName = session.user.name?.split(" ")[0] || "there";
  const hasProjects = projects.length > 0;
  const totalPages = Math.ceil(totalProjects / PROJECTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center">
                <img src="/squidcoder-logo.svg" alt="Squid Coder" className="h-8 w-auto" />
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <span className="px-2 text-sm text-muted-foreground">/</span>
                <span className="text-sm font-medium">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">{userCredits}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">credits</span>
              </div>
              <AnimatedThemeToggleButton variant="horizontal" />
              <form action={async () => {
                "use server";
                redirect("/api/auth/sign-out");
              }}>
                <Button 
                  type="submit"
                  variant="ghost"
                  size="sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Welcome back</p>
              <h1 className="text-3xl font-semibold tracking-tight">
                Hi, {userName}
              </h1>
            </div>
            {!hasActiveSubscription && totalProjects >= FREE_PROJECT_LIMIT ? (
              <Button disabled className="opacity-50 cursor-not-allowed">
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

        {/* Unlock Progress */}
        <UnlockProgress projectCount={totalProjects} />

        {/* Upgrade Banner - show limit-reached when free user hits limit */}
        {!hasActiveSubscription && totalProjects >= FREE_PROJECT_LIMIT ? (
          <UpgradeBanner variant="limit-reached" messageCount={totalProjects} />
        ) : (
          <UpgradeBanner variant="dashboard" messageCount={totalProjects} />
        )}

        {/* Projects Section */}
        {!hasProjects ? (
          /* Empty State */
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Layers className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">Ready to build something amazing?</h2>
              <p className="mb-6 max-w-sm text-muted-foreground text-balance">
                Create your first app with AI. Start free with 5 credits, then upgrade to unlock GPT-5.4 and Claude Opus 4.6.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link href="/">
                    <Sparkles className="h-4 w-4" />
                    Create your first project
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/?upgrade=true">
                    <Crown className="h-4 w-4" />
                    View Premium Plans
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Free plan includes 5 starter credits for the free AI model
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium">Your projects</h2>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  !hasActiveSubscription && totalProjects >= FREE_PROJECT_LIMIT
                    ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400"
                    : "border-border bg-muted text-muted-foreground"
                }`}>
                  {hasActiveSubscription ? totalProjects : `${totalProjects}/${FREE_PROJECT_LIMIT}`}
                </span>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: any) => (
                <div
                  key={project.id}
                  className="group relative flex flex-col rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex flex-1 flex-col p-5">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getModelBadgeClass(project.model)}`}>
                          {getModelLabel(project.model)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <ProjectCardActions
                        projectId={project.id}
                        projectTitle={project.title}
                      />
                    </div>

                    {/* Title */}
                    <Link 
                      href={`/chats/${project.id}`}
                      className="mb-1"
                    >
                      <h3 className="font-medium leading-snug line-clamp-2">
                        {project.title}
                      </h3>
                    </Link>

                    {/* Meta */}
                    <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {project.quality === "high" ? "High quality" : "Fast"}
                      </span>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="border-t border-border px-5 py-3">
                    <Link
                      href={`/chats/${project.id}`}
                      className="flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span>Continue building</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Expandable Rename */}
                  <details className="border-t border-border">
                    <summary className="cursor-pointer list-none px-5 py-2.5 text-center text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                      <span className="flex items-center justify-center gap-1.5">
                        <Edit3 className="h-3 w-3" />
                        Rename
                      </span>
                    </summary>
                    <form action={handleRename} className="border-t border-border p-4 bg-muted/30">
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
                        <Button
                          type="submit"
                          size="sm"
                        >
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) =>
                    currentPage === page ? (
                      <Button key={page} variant="default" size="sm">
                        {page}
                      </Button>
                    ) : (
                      <Button key={page} variant="outline" size="sm" asChild>
                        <Link href={`/dashboard?page=${page}`}>
                          {page}
                        </Link>
                      </Button>
                    )
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
              {!hasActiveSubscription && totalProjects >= FREE_PROJECT_LIMIT ? (
                <Button disabled variant="outline" className="opacity-50 cursor-not-allowed">
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

        {/* Pricing Section */}
        <div className="mb-10">
          <h2 className="text-lg font-medium mb-6">Pricing Plans</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Free</h3>
                </div>
                <p className="text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></p>
              </div>
              <ul className="space-y-3 mb-6">
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
                Current Plan
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="rounded-xl border-2 border-primary bg-card p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                Popular
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Pro</h3>
                </div>
                <p className="text-3xl font-bold">$9<span className="text-lg font-normal text-muted-foreground">/month</span></p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>100 credits/month</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>All AI models</span>
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
              <form action="/api/stripe/checkout" method="POST">
                <input type="hidden" name="priceId" value="price_1TQySsRZE8Whwvf0U4nEsJrt" />
                <Button type="submit" className="w-full">
                  Upgrade to Pro
                </Button>
              </form>
            </div>

            {/* Pro Plus Plan */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold">Pro Plus</h3>
                </div>
                <p className="text-3xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/month</span></p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>500 credits/month</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>All AI models</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Credit rollover</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Advanced features</span>
                </li>
              </ul>
              <form action="/api/stripe/checkout" method="POST">
                <input type="hidden" name="priceId" value="price_1TQyStRZE8Whwvf0mciJwsjS" />
                <Button type="submit" variant="outline" className="w-full">
                  Get Pro Plus
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
