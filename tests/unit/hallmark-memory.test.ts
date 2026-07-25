import { describe, expect, it } from "vitest";
import {
  getRecentStylePackIds,
  pickDiversifiedPack,
  themeNameToStylePackId,
} from "@/features/generation/hallmark-memory";

describe("hallmark memory", () => {
  it("maps Hallmark theme names to Style Pack ids", () => {
    expect(themeNameToStylePackId("Lumen")).toBe("lumenAtmospheric");
    expect(themeNameToStylePackId("Cobalt")).toBe("cobaltMinimal");
    expect(themeNameToStylePackId("Brutal")).toBe("swissBrutal");
    expect(themeNameToStylePackId("Terminal")).toBe("terminalPhosphor");
    expect(themeNameToStylePackId("Garden")).toBe("gardenBotanical");
    expect(themeNameToStylePackId("Midnight")).toBe("midnightCool");
  });

  it("extracts recent pack ids from log entries", () => {
    const recent = getRecentStylePackIds(
      [
        { date: "2026-07-16", theme: "Lumen" },
        { date: "2026-07-15", theme: "Cobalt" },
        { date: "2026-07-14", theme: "Hum" },
      ],
      3,
    );
    expect(recent).toEqual([
      "lumenAtmospheric",
      "cobaltMinimal",
      "softStructural",
    ]);
  });

  it("picks a diversified pack using seed among non-recent candidates", () => {
    const candidates = [
      "cobaltMinimal",
      "terminalPhosphor",
      "midnightCool",
    ] as const;
    const pick = pickDiversifiedPack(candidates, ["cobaltMinimal"], 7);
    expect(pick).not.toBe("cobaltMinimal");
    expect(candidates).toContain(pick);
  });
});
