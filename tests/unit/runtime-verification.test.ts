import { describe, expect, it } from "vitest";

import { runtimeVerificationReportSchema } from "@/features/generation/runtime-verification";

describe("runtime verification report", () => {
  it("accepts version-specific browser evidence", () => {
    expect(
      runtimeVerificationReportSchema.parse({
        messageId: "message_1",
        status: "passed",
        viewport: { width: 390, height: 844 },
        clickableElements: 4,
        unnamedClickableElements: 0,
        horizontalOverflow: false,
        runtimeError: null,
        checkedAt: "2026-07-12T21:00:00.000Z",
      }),
    ).toMatchObject({ status: "passed", messageId: "message_1" });
  });

  it("rejects impossible viewport evidence", () => {
    expect(
      runtimeVerificationReportSchema.safeParse({
        messageId: "message_1",
        status: "passed",
        viewport: { width: 0, height: 844 },
        clickableElements: 0,
        unnamedClickableElements: 0,
        horizontalOverflow: false,
        runtimeError: null,
        checkedAt: "2026-07-12T21:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});
