import { loadEnvConfig } from "@next/env";

import {
  RESEARCH_FEEDBACK_CATEGORIES,
  researchFeedbackReviewSchema,
  researchFeedbackCategorySchema,
} from "../features/feedback/contracts";

loadEnvConfig(process.cwd());

function readOption(args: string[], name: string) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function listPending() {
  const { getPrisma } = await import("../lib/prisma");
  const prisma = getPrisma();
  try {
    const submissions = await prisma.researchFeedbackSubmission.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
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
        primaryCategory: true,
        createdAt: true,
        chat: { select: { id: true, title: true } },
      },
    });
    console.log(JSON.stringify(submissions, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

async function summarizeFeedback() {
  const { getPrisma } = await import("../lib/prisma");
  const prisma = getPrisma();
  try {
    const [pending, categories, paymentIntent] = await Promise.all([
      prisma.researchFeedbackSubmission.count({
        where: { status: "pending" },
      }),
      prisma.researchFeedbackSubmission.groupBy({
        by: ["primaryCategory"],
        where: { primaryCategory: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { primaryCategory: "desc" } },
      }),
      prisma.researchFeedbackSubmission.groupBy({
        by: ["paymentIntent"],
        _count: { _all: true },
        _avg: { monthlyPriceUsd: true },
      }),
    ]);

    console.log(
      JSON.stringify(
        {
          pending,
          categories: categories.map((row) => ({
            category: row.primaryCategory,
            submissions: row._count._all,
          })),
          paymentIntent: paymentIntent.map((row) => ({
            intent: row.paymentIntent,
            submissions: row._count._all,
            averageMonthlyPriceUsd: row._avg.monthlyPriceUsd,
          })),
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function review(args: string[]) {
  const submissionId = readOption(args, "--submission-id")?.trim();
  const rawAmount = readOption(args, "--approve");
  const reject = args.includes("--reject");
  const note = readOption(args, "--note")?.trim();
  const amount = rawAmount ? Number(rawAmount) : undefined;
  const category = researchFeedbackCategorySchema.safeParse(
    readOption(args, "--category")?.trim(),
  );

  if (!submissionId) throw new Error("--submission-id is required.");
  if (Boolean(rawAmount) === reject) {
    throw new Error("Use exactly one of --approve <15|25|40> or --reject.");
  }
  if (!note) throw new Error("--note is required for the review audit trail.");
  if (!category.success) {
    throw new Error(
      `--category is required. Use one of: ${RESEARCH_FEEDBACK_CATEGORIES.join(", ")}.`,
    );
  }

  const parsed = researchFeedbackReviewSchema.safeParse({
    submissionId,
    decision: reject ? "reject" : "approve",
    category: category.data,
    rewardAmount: reject ? undefined : amount,
    note,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

  const { reviewResearchFeedback } = await import(
    "../features/feedback/server/review"
  );
  const { getPrisma } = await import("../lib/prisma");
  try {
    const result = await reviewResearchFeedback({
      reviewerEmail:
        process.env.FEEDBACK_REVIEWER_EMAIL?.trim() || "cli-reviewer",
      input: parsed.data,
    });
    if (!result.success) throw new Error(result.message);
    console.log(JSON.stringify({ submissionId, ...result }, null, 2));
  } finally {
    await getPrisma().$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--list")) {
    await listPending();
    return;
  }
  if (args.includes("--summary")) {
    await summarizeFeedback();
    return;
  }
  await review(args);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Review failed.");
  process.exitCode = 1;
});
