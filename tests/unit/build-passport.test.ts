import { describe, expect, it } from "vitest";

import { buildBuildPassport } from "@/features/verification/build-passport";

const checkedAt = "2026-08-01T16:00:00.000Z";

function message() {
  return {
    id: "message_1",
    content: "Built the prototype",
    files: [
      {
        path: "App.tsx",
        language: "tsx",
        code: "export default function App(){return <main><button>Save</button></main>}",
      },
    ],
    createdAt: new Date("2026-08-01T15:00:00.000Z"),
    chat: {
      id: "chat_1",
      title: "Field Notes",
      prompt: "Build a field notes prototype",
    },
  };
}

function runtime(status: "passed" | "review" | "failed" = "passed") {
  return {
    status,
    createdAt: new Date(checkedAt),
    report: {
      messageId: "message_1",
      status,
      viewport: { width: 1440, height: 900 },
      clickableElements: 1,
      unnamedClickableElements: 0,
      horizontalOverflow: false,
      runtimeError: status === "failed" ? "Preview crashed" : null,
      checkedAt,
    },
  };
}

function exported(status: "verified" | "warning" | "failed" = "verified") {
  return {
    status,
    createdAt: new Date(checkedAt),
    fileCount: 18,
    report: {
      checks: [
        {
          name: "Entry point",
          status: status === "failed" ? "failed" : "passed",
          message: "App.tsx and main.tsx are present.",
        },
      ],
    },
  };
}

describe("buildBuildPassport", () => {
  it("marks a revision verified only when source, runtime, and export evidence pass", () => {
    const passport = buildBuildPassport({
      message: message(),
      runtimeEvidence: runtime(),
      exportEvidence: exported(),
      generatedAt: new Date(checkedAt),
    });

    expect(passport.schema).toBe("squid.build-passport.v1");
    expect(passport.overallStatus).toBe("verified");
    expect(passport.checks.map((check) => check.status)).toEqual([
      "passed",
      "passed",
      "passed",
      "not_applicable",
    ]);
    expect(passport.project.messageId).toBe("message_1");
  });

  it("keeps missing evidence explicit instead of treating it as passed", () => {
    const passport = buildBuildPassport({
      message: message(),
      runtimeEvidence: null,
      exportEvidence: null,
    });

    expect(passport.overallStatus).toBe("review");
    expect(
      passport.checks.find((check) => check.id === "runtime")?.status,
    ).toBe("not_run");
    expect(passport.checks.find((check) => check.id === "export")?.status).toBe(
      "not_run",
    );
    expect(passport.limitations).toContain(
      "No portable export was verified for this revision.",
    );
  });

  it("fails closed when persisted runtime evidence failed", () => {
    const passport = buildBuildPassport({
      message: message(),
      runtimeEvidence: runtime("failed"),
      exportEvidence: exported(),
    });

    expect(passport.overallStatus).toBe("failed");
  });
});
