import { describe, expect, it } from "vitest";

import { getSandpackConfig } from "@/lib/sandpack-config";

describe("getSandpackConfig", () => {
  it("injects a protected Supabase runtime and stable client adapter", () => {
    const config = getSandpackConfig(
      [
        {
          path: "App.tsx",
          content:
            'import { supabase } from "@/lib/supabase"; export default function App() { return <main>{supabase ? "Ready" : "Missing"}</main>; }',
        },
      ],
      {
        status: "ready",
        config: {
          url: "https://project-one.supabase.co",
          publishableKey: "sb_publishable_project-one",
        },
      },
    );
    const runtime = config.files["/squid-runtime/supabase.ts"];
    const adapter = config.files["/lib/supabase.ts"];

    expect(runtime).toMatchObject({ hidden: true, readOnly: true });
    expect(adapter).toMatchObject({ hidden: true, readOnly: true });
    expect(typeof runtime === "object" ? runtime.code : runtime).toBe(
      'export const url = "https://project-one.supabase.co";\n' +
        'export const publishableKey = "sb_publishable_project-one";\n',
    );
    expect(typeof adapter === "object" ? adapter.code : adapter).toContain(
      'import { createClient } from "@supabase/supabase-js"',
    );
    expect(config.customSetup.dependencies["@supabase/supabase-js"]).toBe(
      "2.110.8",
    );
  });

  it("fails clearly without serializing rejected Supabase configuration", () => {
    const config = getSandpackConfig(
      [
        {
          path: "App.tsx",
          content: 'import { supabase } from "@/lib/supabase"; void supabase;',
        },
      ],
      { status: "invalid_browser_key" },
    );
    const runtime = config.files["/squid-runtime/supabase.ts"];
    const runtimeCode = typeof runtime === "object" ? runtime.code : runtime;
    const serializedFiles = JSON.stringify(config.files);

    expect(runtimeCode).toContain("invalid or privileged API key was rejected");
    expect(serializedFiles).not.toMatch(
      /managementAccessToken|refreshToken|oauthClientSecret|databasePassword|sb_secret_|service_role/,
    );
  });

  it("refreshes injected values when the connected project changes", () => {
    const files = [
      {
        path: "App.tsx",
        content: 'import { supabase } from "@/lib/supabase"; void supabase;',
      },
    ];
    const first = getSandpackConfig(files, {
      status: "ready",
      config: {
        url: "https://project-one.supabase.co",
        publishableKey: "sb_publishable_one",
      },
    });
    const second = getSandpackConfig(files, {
      status: "ready",
      config: {
        url: "https://project-two.supabase.co",
        publishableKey: "sb_publishable_two",
      },
    });
    const firstRuntime = first.files["/squid-runtime/supabase.ts"];
    const secondRuntime = second.files["/squid-runtime/supabase.ts"];

    expect(
      typeof firstRuntime === "object" ? firstRuntime.code : firstRuntime,
    ).toContain("project-one");
    expect(
      typeof secondRuntime === "object" ? secondRuntime.code : secondRuntime,
    ).toContain("project-two");
  });

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
    const seededButton =
      typeof config.files["/components/ui/button.tsx"] === "string"
        ? config.files["/components/ui/button.tsx"]
        : config.files["/components/ui/button.tsx"]?.code;
    expect(seededButton).toContain("hover:bg-accent");
    expect(seededButton).not.toContain("hover:text-gray-900");
    expect(seededButton).not.toContain("hover:bg-gray-100");
    expect(config.files["/lib/utils.ts"]).toBeDefined();
    expect(config.files["/components/ui/accordion.tsx"]).toBeUndefined();
    expect(config.files["/public/index.html"]).toBeDefined();
    expect(config.files["/App.tsx"]).toContain(
      'import "./squid-preview-theme"',
    );
    expect(config.files["/squid-preview-theme.ts"]).toContain(
      'darkMode: "class"',
    );
    expect(config.files["/squid-preview-theme.ts"]).toContain(
      '"foreground": "hsl(var(--foreground))"',
    );
    expect(config.files["/squid-preview-theme.ts"]).toContain(".dark {");
    expect(config.files["/squid-preview-theme.ts"]).toContain(
      "--foreground: 0 0% 98%;",
    );
    expect(config.files["/squid-preview-theme.ts"]).toContain(
      'styleId = "squid-generated-theme"',
    );
    expect(config.customSetup.dependencies["@radix-ui/react-slot"]).toBe(
      "^1.1.0",
    );
    expect(config.customSetup.dependencies.recharts).toBeUndefined();
  });

  it("lets a generated Button override the seeded shadcn Button", () => {
    const customButton =
      "export function Button() { return <button type='button'>Branded</button>; }";
    const config = getSandpackConfig([
      {
        path: "App.tsx",
        content: `import { Button } from "@/components/ui/button";

export default function App() {
  return <Button />;
}`,
      },
      {
        path: "components/ui/button.tsx",
        content: customButton,
      },
    ]);

    expect(config.files["/components/ui/button.tsx"]).toBe(customButton);
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
    expect(config.files["/squid-runtime/supabase.ts"]).toBeUndefined();
    expect(config.files["/lib/supabase.ts"]).toBeUndefined();
    expect(
      config.customSetup.dependencies["@supabase/supabase-js"],
    ).toBeUndefined();
  });

  it("keeps announcing readiness for previews that compile slowly", () => {
    const config = getSandpackConfig([
      {
        path: "App.tsx",
        content: "export default function App() { return <main>Hello</main>; }",
      },
    ]);
    const inspector = config.files["/squid-preview-inspector.tsx"] as string;

    expect(inspector).toContain("const READY_ANNOUNCEMENT_TIMEOUT_MS = 60_000");
    expect(inspector).toContain(
      "readyAnnouncementTimer = window.setInterval(postReady, 500)",
    );
    expect(inspector).toContain('message.type === "ready-ack"');
    expect(inspector).toContain("window.clearInterval(readyAnnouncementTimer)");
  });

  it("keeps dialog and form primitives on theme-aware semantic pairs", () => {
    const config = getSandpackConfig([
      {
        path: "App.tsx",
        content: [
          'import { AlertDialogContent } from "@/components/ui/alert-dialog";',
          'import { DialogContent } from "@/components/ui/dialog";',
          'import { Input } from "@/components/ui/input";',
          'import { SelectTrigger } from "@/components/ui/select";',
          'import { Textarea } from "@/components/ui/textarea";',
          "export default function App() {",
          "  return <><DialogContent /><AlertDialogContent /><Input /><SelectTrigger /><Textarea /></>;",
          "}",
        ].join("\n"),
      },
    ]);

    const dialog = config.files["/components/ui/dialog.tsx"] as string;
    const alertDialog = config.files[
      "/components/ui/alert-dialog.tsx"
    ] as string;
    const input = config.files["/components/ui/input.tsx"] as string;
    const select = config.files["/components/ui/select.tsx"] as string;
    const textarea = config.files["/components/ui/textarea.tsx"] as string;

    expect(dialog).toContain(
      "border border-border bg-background p-6 text-foreground",
    );
    expect(alertDialog).toContain(
      "border border-border bg-background p-6 text-foreground",
    );
    expect(input).toContain("border-input bg-background");
    expect(input).toContain("text-foreground");
    expect(select).toContain("border-input bg-background");
    expect(select).toContain("bg-popover text-popover-foreground");
    expect(textarea).toContain("border-input bg-background");
    expect(textarea).toContain("text-foreground");
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
