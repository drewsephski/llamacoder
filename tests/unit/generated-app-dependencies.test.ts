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
      three: "0.177.0",
      "@types/three": "0.177.0",
      "@react-three/fiber": "9.6.1",
      "@react-three/drei": "10.7.7",
      "@react-three/postprocessing": "3.0.4",
      postprocessing: "6.39.3",
      leva: "0.10.1",
      "@paper-design/shaders-react": "0.0.77",
      sonner: "2.0.7",
      "react-leaflet": "5.0.0",
      leaflet: "1.9.4",
      "@types/leaflet": "1.9.21",
      "react-syntax-highlighter": "15.8.0",
      "react-intersection-observer": "9.16.0",
      cmdk: "1.1.1",
      "hls.js": "1.6.16",
      "@uiw/react-md-editor": "4.0.6",
      "@use-gesture/react": "10.3.1",
      "react-countup": "6.5.3",
      "react-resizable": "3.0.4",
      "@types/react-resizable": "3.0.8",
      "@tanstack/react-virtual": "3.14.7",
      jspdf: "4.2.1",
      "@react-pdf/renderer": "4.5.1",
      howler: "2.2.4",
      "react-arborist": "3.15.0",
      "@supabase/supabase-js": "2.110.8",
      "@supabase/ssr": "0.12.3",
      "react-masonry-css": "1.0.16",
      "yet-another-react-lightbox": "3.32.1",
      "@tsparticles/react": "4.3.2",
      "@tsparticles/engine": "4.3.2",
      "@tsparticles/slim": "4.3.2",
      "react-parallax": "3.5.2",
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
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/postprocessing",
      "@paper-design/shaders-react",
      "leva",
      "sonner",
      "react-leaflet",
      "leaflet",
      "react-syntax-highlighter",
      "react-intersection-observer",
      "cmdk",
      "hls.js",
      "@uiw/react-md-editor",
      "@use-gesture/react",
      "react-countup",
      "react-resizable",
      "@tanstack/react-virtual",
      "jspdf",
      "@react-pdf/renderer",
      "howler",
      "react-arborist",
      "react-masonry-css",
      "yet-another-react-lightbox",
      "@tsparticles/react",
      "@tsparticles/slim",
      "react-parallax",
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
