import { describe, expect, it } from "vitest";
import { developerCodeGenPrompt } from "@/features/generation/agent-prompts";
import { buildGeneratedFilesRepairPrompt } from "@/lib/generated-files";
import { getMainCodingPrompt, softwareArchitectPrompt } from "@/lib/prompts";
import { dependencies } from "@/lib/sandpack-config";

describe("generated app dependencies", () => {
  it("pins the complete generated-app capability set", () => {
    expect(dependencies).toMatchObject({
      "react-dnd": "16.0.1",
      "react-dnd-html5-backend": "16.0.1",
      "react-dnd-touch-backend": "16.0.1",
      "react-hook-form": "7.81.0",
      zod: "4.4.3",
      "@hookform/resolvers": "5.4.0",
      "@tanstack/react-query": "5.101.2",
      zustand: "5.0.14",
      "@tanstack/react-table": "8.21.3",
      "react-resizable-panels": "4.12.2",
      "react-dropzone": "17.0.0",
      "@xyflow/react": "12.11.2",
      "react-markdown": "10.1.0",
      "remark-gfm": "4.0.1",
      "fuse.js": "7.5.0",
      "react-colorful": "5.8.0",
      "qrcode.react": "4.2.0",
    });
  });

  it("exposes every capability to direct, plan, and repair generation", () => {
    const prompts = [
      getMainCodingPrompt(),
      softwareArchitectPrompt,
      developerCodeGenPrompt,
    ];
    const packageNames = [
      "react-dnd-touch-backend",
      "react-hook-form",
      "@hookform/resolvers/zod",
      "@tanstack/react-query",
      "zustand",
      "@tanstack/react-table",
      "@/components/ui/resizable",
      "react-dropzone",
      "@xyflow/react",
      "react-markdown",
      "remark-gfm",
      "fuse.js",
      "react-colorful",
      "qrcode.react",
    ];

    for (const prompt of prompts) {
      for (const packageName of packageNames) {
        expect(prompt).toContain(packageName);
      }
    }

    const repairPrompt = buildGeneratedFilesRepairPrompt("bad", [], []);
    expect(repairPrompt).toContain("QueryClientProvider");
    expect(repairPrompt).toContain("@xyflow/react/dist/style.css");
    expect(repairPrompt).toContain("File dropzones select local files only");
  });
});
