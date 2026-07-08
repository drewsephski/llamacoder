import { describe, expect, it } from "vitest";
import { getMainCodingPrompt, softwareArchitectPrompt } from "@/lib/prompts";
import { dependencies } from "@/lib/sandpack-config";

describe("generated app dependencies", () => {
  it("makes React DnD available to generated previews and prompts", () => {
    expect(dependencies).toMatchObject({
      "react-dnd": "latest",
      "react-dnd-html5-backend": "latest",
    });

    const prompt = getMainCodingPrompt();

    expect(prompt).toContain("React DnD");
    expect(prompt).toContain('from `react-dnd`');
    expect(prompt).toContain('from `react-dnd-html5-backend`');
    expect(softwareArchitectPrompt).toContain("React DnD");
    expect(softwareArchitectPrompt).toContain("react-dnd-html5-backend");
  });
});
