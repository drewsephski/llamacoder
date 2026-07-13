import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { normalizeTier, type TierKey } from "@/lib/billing";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Coins, FileText, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCreditsButton } from "@/components/dashboard-credits-button";
import { DashboardSignOutButton } from "@/components/dashboard-sign-out-button";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";

export const metadata: Metadata = {
  title: "Usage Ledger",
  description:
    "Review Squid generation credit estimates, actual charges, refunds, and credit history.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UsagePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in?callbackUrl=/dashboard/usage");
  }

  const prisma = getPrisma();
  const [user, generationLogs, creditHistory] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        credits: true,
        subscription: {
          select: {
            status: true,
            tier: true,
          },
        },
      },
    }),
    prisma.generationLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.creditHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const chatIds = Array.from(
    new Set(
      [...generationLogs, ...creditHistory]
        .map((row) => row.chatId)
        .filter((chatId): chatId is string => Boolean(chatId)),
    ),
  );
  const chats = chatIds.length
    ? await prisma.chat.findMany({
        where: {
          id: { in: chatIds },
          userId: session.user.id,
        },
        select: {
          id: true,
          title: true,
        },
      })
    : [];
  const chatTitleById = new Map(chats.map((chat) => [chat.id, chat.title]));
  const currentTier: TierKey =
    user?.subscription?.status === "active"
      ? normalizeTier(user.subscription.tier)
      : "free";

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <div className="hidden items-center gap-1 md:flex">
                <span className="px-2 text-sm text-muted-foreground">/</span>
                <span className="text-sm font-medium">Usage</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DashboardCreditsButton
                credits={user?.credits ?? 0}
                currentTier={currentTier}
              />
              <AnimatedThemeToggleButton variant="horizontal" />
              <DashboardSignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <header className="mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ReceiptText className="h-5 w-5 text-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Usage ledger
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every successful generation records its model, phase, estimate,
            actual charge, refund amount, and linked project. Failed initial
            generations are not charged.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Generation charges</h2>
            </div>
          </div>
          {generationLogs.length === 0 ? (
            <EmptyState text="No successful generations have been charged yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Project</th>
                    <th className="px-5 py-3 font-medium">Model</th>
                    <th className="px-5 py-3 font-medium">Phase</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Estimate
                    </th>
                    <th className="px-5 py-3 text-right font-medium">Actual</th>
                    <th className="px-5 py-3 text-right font-medium">Refund</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {generationLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-5 py-4 text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        {log.chatId ? (
                          <Link
                            href={`/chats/${log.chatId}`}
                            className="font-medium hover:underline"
                          >
                            {chatTitleById.get(log.chatId) ?? "Project"}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </td>
                      <td className="max-w-[180px] truncate px-5 py-4 text-muted-foreground">
                        {log.modelId}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {formatLabel(log.phase ?? "generation")}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        {log.estimatedCredits ?? log.creditsUsed}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        {log.actualCredits ?? log.creditsUsed}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        {log.refundedCredits}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                          {formatLabel(log.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <h2 className="font-semibold">Credit history</h2>
            </div>
          </div>
          {creditHistory.length === 0 ? (
            <EmptyState text="No credit purchases, grants, refunds, or usage records yet." />
          ) : (
            <div className="divide-y divide-border">
              {creditHistory.map((row) => (
                <div
                  key={row.id}
                  className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1fr_auto_auto]"
                >
                  <div>
                    <div className="font-medium">
                      {row.description ?? formatLabel(row.type)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDate(row.createdAt)}
                      {row.chatId
                        ? ` · ${chatTitleById.get(row.chatId) ?? "Project"}`
                        : ""}
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    {formatLabel(row.type)}
                  </div>
                  <div
                    className={`text-right font-semibold tabular-nums ${
                      row.amount >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {row.amount > 0 ? "+" : ""}
                    {row.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-5 py-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatLabel(value: string) {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
