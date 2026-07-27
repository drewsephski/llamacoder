import { describe, expect, it } from "vitest";

import {
  getResearchFeedbackRewardAmounts,
  researchFeedbackReviewSchema,
  researchFeedbackSubmissionSchema,
} from "@/features/feedback/contracts";
import {
  RESEARCH_FEEDBACK_SHEET_HEADERS,
  buildResearchFeedbackSheetRow,
  isGoogleSheetsFeedbackSyncConfigured,
} from "@/features/feedback/server/google-sheets";
import { getResearchFeedbackActivityEvidence } from "@/features/feedback/server/program";

const generatedMessage = {
  content: "",
  files: [
    {
      path: "App.tsx",
      code: "export default function App() { return <main />; }",
      language: "tsx",
    },
  ],
};

const validSubmission = {
  projectId: "project_1",
  buildGoal: "I was building a launch page for a new developer tool.",
  previousTools: "I previously used an IDE and a static site template.",
  frustration:
    "The first preview did not explain why one of the interactions failed.",
  betterThanExpected:
    "The generated visual hierarchy was much stronger than expected.",
  abandonmentPoint:
    "I nearly stopped after the second edit changed an unrelated section.",
  launchBlocker:
    "The export still needed a reliable mobile navigation interaction.",
  singleImprovement:
    "Make follow-up edits stay tightly scoped to the requested component.",
  paymentIntent: "maybe",
  monthlyPriceUsd: 20,
  followUpConsent: true,
  mediaUrl: "https://example.com/recording",
  honestyConfirmed: true,
};

describe("verified research feedback", () => {
  it("requires generated work plus preview, edit, or export evidence", () => {
    expect(
      getResearchFeedbackActivityEvidence({
        hasCode: true,
        assistantMessages: [generatedMessage],
        runtimeVerificationCount: 0,
        exportCount: 0,
      }),
    ).toMatchObject({
      generatedVersions: 1,
      previewed: false,
      edited: false,
      exported: false,
      qualifies: false,
    });

    expect(
      getResearchFeedbackActivityEvidence({
        hasCode: true,
        assistantMessages: [generatedMessage],
        runtimeVerificationCount: 1,
        exportCount: 0,
      }).qualifies,
    ).toBe(true);
    expect(
      getResearchFeedbackActivityEvidence({
        hasCode: true,
        assistantMessages: [generatedMessage, generatedMessage],
        runtimeVerificationCount: 0,
        exportCount: 0,
      }).qualifies,
    ).toBe(true);
    expect(
      getResearchFeedbackActivityEvidence({
        hasCode: true,
        assistantMessages: [generatedMessage],
        runtimeVerificationCount: 0,
        exportCount: 1,
      }).qualifies,
    ).toBe(true);
  });

  it("accepts a specific project-based response", () => {
    expect(
      researchFeedbackSubmissionSchema.safeParse(validSubmission).success,
    ).toBe(true);
  });

  it("rejects low-effort answers, invalid evidence links, and missing honesty confirmation", () => {
    const parsed = researchFeedbackSubmissionSchema.safeParse({
      ...validSubmission,
      frustration: "bad",
      mediaUrl: "not a link",
      honestyConfirmed: false,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      expect(fields.frustration).toBeDefined();
      expect(fields.mediaUrl).toBeDefined();
      expect(fields.honestyConfirmed).toBeDefined();
    }
  });

  it("keeps standard and extended reward choices distinct", () => {
    expect(getResearchFeedbackRewardAmounts("standard")).toEqual([15]);
    expect(getResearchFeedbackRewardAmounts("extended")).toEqual([25, 40]);
    expect(
      researchFeedbackReviewSchema.safeParse({
        submissionId: "feedback_1",
        decision: "approve",
        category: "editing_difficulty",
        rewardAmount: 20,
        note: "Specific evidence was verified.",
      }).success,
    ).toBe(false);
  });

  it("builds a stable sheet row keyed by submission id", () => {
    const row = buildResearchFeedbackSheetRow(
      {
        id: "feedback_1",
        userId: "user_1",
        accountEmail: "user@example.com",
        projectId: "project_1",
        projectTitle: "Launch site",
        buildGoal: validSubmission.buildGoal,
        previousTools: validSubmission.previousTools,
        frustration: validSubmission.frustration,
        betterThanExpected: validSubmission.betterThanExpected,
        abandonmentPoint: validSubmission.abandonmentPoint,
        launchBlocker: validSubmission.launchBlocker,
        singleImprovement: validSubmission.singleImprovement,
        paymentIntent: validSubmission.paymentIntent,
        monthlyPriceUsd: validSubmission.monthlyPriceUsd,
        followUpConsent: true,
        mediaUrl: validSubmission.mediaUrl,
        rewardTrack: "extended",
        activityEvidence: {
          generatedVersions: 2,
          previewed: true,
          edited: true,
          exported: false,
          qualifies: true,
        },
        status: "pending",
        primaryCategory: null,
        rewardAmount: null,
        reviewedByEmail: null,
        reviewNotes: null,
        reviewedAt: null,
        createdAt: new Date("2026-07-27T12:00:00.000Z"),
      },
      "https://squidagent.app/",
      new Date("2026-07-27T12:05:00.000Z"),
    );

    expect(row).toHaveLength(RESEARCH_FEEDBACK_SHEET_HEADERS.length);
    expect(row[0]).toBe("feedback_1");
    expect(row[5]).toBe("https://squidagent.app/chats/project_1");
    expect(row[22]).toBe("pending");
  });

  it("reports partial Google Sheets configuration as disconnected", () => {
    expect(
      isGoogleSheetsFeedbackSyncConfigured({
        ...process.env,
        GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL:
          "squid-feedback@example-project.iam.gserviceaccount.com",
        GOOGLE_SHEETS_PRIVATE_KEY: undefined,
        GOOGLE_SHEETS_SPREADSHEET_ID: undefined,
      }),
    ).toBe(false);
  });
});
