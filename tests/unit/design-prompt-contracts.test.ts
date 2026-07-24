import { describe, expect, test } from "vitest";
import {
  tailwindColorFidelityContract,
  visualSystemCoherenceContract,
} from "@/features/generation/design-prompt-contracts";

describe("design-prompt-contracts", () => {
  test("exports mandatory color and surface contracts", () => {
    expect(tailwindColorFidelityContract).toContain("Tailwind");
    expect(tailwindColorFidelityContract.length).toBeGreaterThan(100);
    expect(visualSystemCoherenceContract).toContain("surface");
    expect(visualSystemCoherenceContract.length).toBeGreaterThan(100);
  });
});
