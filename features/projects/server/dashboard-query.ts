import "server-only";

import type { Chat } from "@prisma/client";

import { getCurrentSession } from "@/features/auth/server/session";
import { getPrisma } from "@/lib/prisma";
import { normalizeTier, type TierKey } from "@/lib/billing/config";
import { reconcileCheckoutSessionForUser } from "@/lib/billing/stripe-fulfillment";

const PROJECTS_PER_PAGE = 9;

export type DashboardData = {
  currentPage: number;
  hasActiveSubscription: boolean;
  projects: Chat[];
  session: Awaited<ReturnType<typeof getCurrentSession>>;
  tier: TierKey;
  totalPages: number;
  totalProjects: number;
  userCredits: number;
};

export async function getDashboardData({
  checkoutSessionId,
  page,
}: {
  checkoutSessionId?: string;
  page?: string;
}): Promise<DashboardData> {
  const session = await getCurrentSession();
  const parsedPage = Number.parseInt(page || "1", 10);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  if (!session) {
    return {
      currentPage,
      hasActiveSubscription: false,
      projects: [],
      session: null,
      tier: "free",
      totalPages: 0,
      totalProjects: 0,
      userCredits: 0,
    };
  }

  const prisma = getPrisma();
  if (checkoutSessionId) {
    try {
      await reconcileCheckoutSessionForUser({
        checkoutSessionId,
        userId: session.user.id,
      });
    } catch (error) {
      console.error("[Dashboard] Failed to reconcile checkout session:", error);
    }
  }

  const [totalProjects, projects, user] = await Promise.all([
    prisma.chat.count({ where: { userId: session.user.id } }),
    prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PROJECTS_PER_PAGE,
      take: PROJECTS_PER_PAGE,
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        credits: true,
        subscription: { select: { status: true, tier: true } },
      },
    }),
  ]);

  const hasActiveSubscription = user?.subscription?.status === "active";
  return {
    currentPage,
    hasActiveSubscription,
    projects,
    session,
    tier: hasActiveSubscription
      ? normalizeTier(user?.subscription?.tier)
      : "free",
    totalPages: Math.ceil(totalProjects / PROJECTS_PER_PAGE),
    totalProjects,
    userCredits: user?.credits || 0,
  };
}
