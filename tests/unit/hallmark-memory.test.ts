import { describe, expect, it } from "vitest";
import {
  getRecentStylePackIds,
  pickDiversifiedPack,
  themeNameToStylePackId,
  appendHallmarkLogEntry,
  readHallmarkLog,
} from "@/features/generation/hallmark-memory";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

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

  it("appends log entries newest-first and trims to 20", () => {
    const dir = mkdtempSync(join(tmpdir(), "hallmark-log-"));
    try {
      appendHallmarkLogEntry(
        {
          date: "2026-07-25",
          theme: "cobaltMinimal",
          brief: "first",
          stylePack: "cobaltMinimal",
        },
        dir,
      );
      appendHallmarkLogEntry(
        {
          date: "2026-07-26",
          theme: "lumenAtmospheric",
          brief: "second",
          stylePack: "lumenAtmospheric",
        },
        dir,
      );

      const log = readHallmarkLog(dir);
      expect(log).toHaveLength(2);
      expect(log[0]?.brief).toBe("second");
      expect(log[1]?.brief).toBe("first");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
