import { describe, expect, it, vi } from "vitest";
import {
  GENERATION_LOCK_STALE_AFTER_MS,
  recoverStaleGenerationLocks,
} from "@/lib/generation-recovery";

describe("generation recovery", () => {
  it("resets stale in-progress chats that never completed generation", async () => {
    const client = {
      chat: {
        updateMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const now = new Date("2026-07-09T12:00:00.000Z");

    await expect(
      recoverStaleGenerationLocks({ client: client as never, now }),
    ).resolves.toEqual({ recoveredLocks: 2 });

    expect(client.chat.updateMany).toHaveBeenCalledWith({
      where: {
        hasCode: false,
        generationStatus: "in_progress",
        generationStartedAt: {
          lte: new Date(now.getTime() - GENERATION_LOCK_STALE_AFTER_MS),
        },
      },
      data: {
        generationStatus: "idle",
        generationStartedAt: null,
      },
    });
  });
});
