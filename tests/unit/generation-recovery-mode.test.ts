import { describe, expect, it } from "vitest";

import { getGenerationRecoveryMode } from "@/features/generation/recovery";

describe("generation recovery mode", () => {
  it("restarts when the saved response contains only prose", () => {
    expect(
      getGenerationRecoveryMode(
        "I will create the application with a focused component structure.",
      ),
    ).toBe("restart");
  });

  it("restarts when a generated file fence was interrupted", () => {
    expect(
      getGenerationRecoveryMode(
        "```tsx{path=App.tsx}\nexport default function App() {",
      ),
    ).toBe("restart");
  });

  it("restores when at least one generated file was completed", () => {
    expect(
      getGenerationRecoveryMode(
        "```tsx{path=App.tsx}\nexport default function App() {}\n```",
      ),
    ).toBe("restore");
  });
});
