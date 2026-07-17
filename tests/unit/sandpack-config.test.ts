import { describe, expect, it } from "vitest";

import { getSandpackConfig } from "@/lib/sandpack-config";

describe("getSandpackConfig", () => {
  it("includes only the shadcn files required by generated imports", () => {
    const config = getSandpackConfig([
      {
        path: "App.tsx",
        content: `import { Button } from "@/components/ui/button";

export default function App() {
  return <Button>Launch</Button>;
}`,
      },
    ]);

    expect(config.files["/components/ui/button.tsx"]).toBeDefined();
    expect(config.files["/lib/utils.ts"]).toBeDefined();
    expect(config.files["/components/ui/accordion.tsx"]).toBeUndefined();
    expect(config.files["/public/index.html"]).toBeDefined();
    expect(config.files["/public/index.html"]).toContain(
      'tailwind.config = { darkMode: "class" }',
    );
    expect(config.customSetup.dependencies["@radix-ui/react-slot"]).toBe(
      "^1.1.0",
    );
    expect(config.customSetup.dependencies.recharts).toBeUndefined();
  });

  it("does not send unused component-library source to Sandpack", () => {
    const config = getSandpackConfig([
      {
        path: "App.tsx",
        content: "export default function App() { return <main>Hello</main>; }",
      },
    ]);

    expect(
      Object.keys(config.files).filter((path) =>
        path.startsWith("/components/ui/"),
      ),
    ).toEqual([]);
  });

  it("installs generated-app capabilities only when source imports them", () => {
    const config = getSandpackConfig([
      {
        path: "App.tsx",
        content: [
          'import { useForm } from "react-hook-form";',
          'import { zodResolver } from "@hookform/resolvers/zod";',
          'import { QueryClient } from "@tanstack/react-query";',
          'import { create } from "zustand";',
          'import Markdown from "react-markdown";',
          'import remarkGfm from "remark-gfm";',
          'import "@xyflow/react/dist/style.css";',
          'const loadFlow = () => import("@xyflow/react");',
          "export default function App() { return <Markdown remarkPlugins={[remarkGfm]}>Hello</Markdown>; }",
          "void useForm; void zodResolver; void QueryClient; void create; void loadFlow;",
        ].join("\n"),
      },
    ]);

    expect(config.customSetup.dependencies).toMatchObject({
      "react-hook-form": "7.81.0",
      "@hookform/resolvers": "5.4.0",
      "@tanstack/react-query": "5.101.2",
      zustand: "5.0.14",
      "react-markdown": "10.1.0",
      "remark-gfm": "4.0.1",
      "@xyflow/react": "12.11.2",
    });
    expect(config.customSetup.dependencies["qrcode.react"]).toBeUndefined();
  });

  it("injects form, resizable, and scroll-area wrappers with transitive dependencies", () => {
    const config = getSandpackConfig([
      {
        path: "App.tsx",
        content: [
          'import { Form } from "@/components/ui/form";',
          'import { ResizablePanelGroup } from "@/components/ui/resizable";',
          'import { ScrollArea } from "@/components/ui/scroll-area";',
          "export default function App() { return <Form><ResizablePanelGroup><ScrollArea /></ResizablePanelGroup></Form>; }",
        ].join("\n"),
      },
    ]);

    expect(config.files["/components/ui/form.tsx"]).toBeDefined();
    expect(config.files["/components/ui/resizable.tsx"]).toBeDefined();
    expect(config.files["/components/ui/scroll-area.tsx"]).toBeDefined();
    expect(config.files["/components/ui/label.tsx"]).toBeDefined();
    expect(config.customSetup.dependencies).toMatchObject({
      "react-hook-form": "7.81.0",
      "@radix-ui/react-label": "^2.1.0",
      "@radix-ui/react-slot": "^1.1.0",
      "react-resizable-panels": "4.12.2",
      "@radix-ui/react-scroll-area": "^1.2.10",
      "lucide-react": "0.563.0",
    });
  });
});
