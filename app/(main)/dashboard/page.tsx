import { getPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { renameProject } from "../actions";
import { ProjectCardActions } from "@/components/project-card-actions";
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
  Coins
} from "lucide-react";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";

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

async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let projects: any[] = [];
  let userCredits = 0;

  if (session) {
    const prisma = getPrisma();
    projects = await prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });
    userCredits = user?.credits || 0;
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
                <Link 
                  href="/sign-up" 
                  className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
                >
                  Get Started
                </Link>
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
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userName = session.user.name?.split(" ")[0] || "there";
  const hasProjects = projects.length > 0;

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
                redirect("/api/auth/signout");
              }}>
                <button 
                  type="submit"
                  className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Welcome back</p>
              <h1 className="text-3xl font-semibold tracking-tight">
                Hi, {userName}
              </h1>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors glow-electric"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        </div>

        {/* Projects Section */}
        {!hasProjects ? (
          /* Empty State */
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Layers className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">No projects yet</h2>
              <p className="mb-8 max-w-sm text-muted-foreground text-balance">
                Turn your ideas into working apps. Describe what you want to build and let AI handle the code.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Create your first project
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium">Your projects</h2>
                <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {projects.length}
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
                      <h3 className="font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
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
                        <button
                          type="submit"
                          className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </details>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 flex items-center justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Plus className="h-4 w-4" />
                Start another project
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
