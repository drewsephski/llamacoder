import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { getEntitlementTier, type TierKey } from "@/lib/billing";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardNavigation } from "@/components/dashboard-navigation";
import { Badge } from "@/components/reui/badge";
import { UsageLedger } from "@/features/billing/components/usage-ledger";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata = createNoIndexMetadata({
  title: "Usage Ledger",
  description:
    "Review Squid generation credit estimates, actual charges, refunds, and credit history.",
  path: "/dashboard/usage",
});

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
  const currentTier: TierKey = getEntitlementTier(user?.subscription ?? null);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation
        credits={user?.credits ?? 0}
        currentPage="Usage"
        currentTier={currentTier}
      />

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Usage ledger
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every successful generation records its model, phase, estimate,
            actual charge, refund amount, and linked project. Failed initial
            generations are not charged.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4 sm:p-5">
            <h2 className="font-semibold">Generation charges</h2>
          </div>
          {generationLogs.length === 0 ? (
            <EmptyState text="No successful generations have been charged yet." />
          ) : (
            <UsageLedger
              rows={generationLogs.map((log) => ({
                id: log.id,
                createdAt: log.createdAt.toISOString(),
                chatId: log.chatId,
                projectTitle: log.chatId
                  ? (chatTitleById.get(log.chatId) ?? "Project")
                  : null,
                modelId: log.modelId,
                phase: log.phase ?? "generation",
                estimatedCredits: log.estimatedCredits ?? log.creditsUsed,
                actualCredits: log.actualCredits ?? log.creditsUsed,
                refundedCredits: log.refundedCredits,
                status: log.status,
              }))}
            />
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4 sm:p-5">
            <h2 className="font-semibold">Credit history</h2>
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
                  <Badge
                    variant={row.amount >= 0 ? "success-light" : "secondary"}
                    radius="full"
                    className="justify-self-end font-semibold tabular-nums"
                  >
                    {row.amount > 0 ? "+" : ""}
                    {row.amount}
                  </Badge>
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
