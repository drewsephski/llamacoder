import * as shadcnComponents from "@/lib/shadcn";
import { normalizeGeneratedFiles } from "@/lib/generated-files";

export function getSandpackConfig(
  files: Array<{ path: string; content: string }>,
) {
  const sandpackFiles: Record<string, string> = { ...shadcnFiles };
  const normalizedFiles = normalizeGeneratedFiles(files);

  // Add tsconfig
  sandpackFiles["/tsconfig.json"] = `{
    "include": [
      "./**/*"
    ],
    "compilerOptions": {
      "strict": true,
      "esModuleInterop": true,
      "lib": [ "dom", "es2015" ],
      "jsx": "react-jsx",
      "baseUrl": "./",
      "paths": {
        "@/components/*": ["components/*"],
        "@/lib/*": ["lib/*"],
        "@/utils/*": ["utils/*"],
        "@/types/*": ["types/*"]
      }
    }
  }`;

  for (const file of normalizedFiles) {
    if (file.path === "App.tsx") {
      sandpackFiles["/App.generated.tsx"] = file.code;
    } else {
      sandpackFiles[`/${file.path}`] = file.code;
    }
  }

  sandpackFiles["/squid-preview-inspector.tsx"] =
    squidPreviewInspectorComponent;

  // Ensure App.tsx is the entry point, wrapping it with preview-only tooling.
  if (sandpackFiles["/App.generated.tsx"]) {
    sandpackFiles["/App.tsx"] = `import GeneratedApp from "./App.generated";
import { SquidPreviewInspector } from "./squid-preview-inspector";

export default function App() {
  return (
    <>
      <SquidPreviewInspector />
      <GeneratedApp />
    </>
  );
}`;
  } else if (normalizedFiles.length > 0) {
    const mainFile =
      normalizedFiles.find(
        (f) => f.path.endsWith(".tsx") || f.path.endsWith(".jsx"),
      ) || normalizedFiles[0];

    const importPath = mainFile.path.replace(/\.(tsx?|jsx?)$/, "");

    sandpackFiles["/App.tsx"] = `import React from 'react';
import MainComponent from './${importPath}';
import { SquidPreviewInspector } from "./squid-preview-inspector";

export default function App() {
  return (
    <>
      <SquidPreviewInspector />
      <MainComponent />
    </>
  );
}`;
  }

  return {
    template: "react-ts" as const,
    files: sandpackFiles,
    options: {
      externalResources: ["https://cdn.tailwindcss.com"],
    },
    customSetup: {
      dependencies,
    },
  };
}

export const shadcnFiles = {
  "/lib/utils.ts": shadcnComponents.utils,
  "/components/ui/accordion.tsx": shadcnComponents.accordian,
  "/components/ui/alert-dialog.tsx": shadcnComponents.alertDialog,
  "/components/ui/alert.tsx": shadcnComponents.alert,
  "/components/ui/avatar.tsx": shadcnComponents.avatar,
  "/components/ui/badge.tsx": shadcnComponents.badge,
  "/components/ui/breadcrumb.tsx": shadcnComponents.breadcrumb,
  "/components/ui/button.tsx": shadcnComponents.button,
  "/components/ui/calendar.tsx": shadcnComponents.calendar,
  "/components/ui/card.tsx": shadcnComponents.card,
  "/components/ui/carousel.tsx": shadcnComponents.carousel,
  "/components/ui/checkbox.tsx": shadcnComponents.checkbox,
  "/components/ui/collapsible.tsx": shadcnComponents.collapsible,
  "/components/ui/dialog.tsx": shadcnComponents.dialog,
  "/components/ui/drawer.tsx": shadcnComponents.drawer,
  "/components/ui/dropdown-menu.tsx": shadcnComponents.dropdownMenu,
  "/components/ui/input.tsx": shadcnComponents.input,
  "/components/ui/label.tsx": shadcnComponents.label,
  "/components/ui/menubar.tsx": shadcnComponents.menuBar,
  "/components/ui/navigation-menu.tsx": shadcnComponents.navigationMenu,
  "/components/ui/pagination.tsx": shadcnComponents.pagination,
  "/components/ui/popover.tsx": shadcnComponents.popover,
  "/components/ui/progress.tsx": shadcnComponents.progress,
  "/components/ui/radio-group.tsx": shadcnComponents.radioGroup,
  "/components/ui/select.tsx": shadcnComponents.select,
  "/components/ui/separator.tsx": shadcnComponents.separator,
  "/components/ui/skeleton.tsx": shadcnComponents.skeleton,
  "/components/ui/slider.tsx": shadcnComponents.slider,
  "/components/ui/switch.tsx": shadcnComponents.switchComponent,
  "/components/ui/table.tsx": shadcnComponents.table,
  "/components/ui/tabs.tsx": shadcnComponents.tabs,
  "/components/ui/textarea.tsx": shadcnComponents.textarea,
  "/components/ui/toast.tsx": shadcnComponents.toast,
  "/components/ui/toaster.tsx": shadcnComponents.toaster,
  "/components/ui/toggle-group.tsx": shadcnComponents.toggleGroup,
  "/components/ui/toggle.tsx": shadcnComponents.toggle,
  "/components/ui/tooltip.tsx": shadcnComponents.tooltip,
  "/components/ui/use-toast.tsx": shadcnComponents.useToast,
  "/components/ui/index.tsx": `
  export * from "./button"
  export * from "./card"
  export * from "./input"
  export * from "./label"
  export * from "./select"
  export * from "./textarea"
  export * from "./avatar"
  export * from "./radio-group"
  `,
  "/public/index.html": `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
  `,
};

const squidPreviewInspectorComponent = `"use client";

import { useEffect } from "react";

const PREVIEW_SOURCE = "squid-preview-inspector";
const PARENT_SOURCE = "squid-preview-parent";

export function SquidPreviewInspector() {
  useEffect(() => {
    let selectionMode = false;

    function ensureSelectionStyles() {
      if (document.getElementById("squid-preview-selection-style")) return;

      const style = document.createElement("style");
      style.id = "squid-preview-selection-style";
      style.textContent = [
        "body.squid-preview-selecting,",
        "body.squid-preview-selecting * {",
        "  cursor: crosshair !important;",
        "}",
        "body.squid-preview-selecting *:hover {",
        "  outline: 2px solid #2563eb !important;",
        "  outline-offset: 2px !important;",
        "}",
      ].join("\\n");
      document.head.appendChild(style);
    }

    function setSelectionMode(enabled: boolean) {
      selectionMode = enabled;
      ensureSelectionStyles();
      document.body?.classList.toggle("squid-preview-selecting", enabled);
    }

    function getDomPath(element: Element) {
      const segments: string[] = [];
      let current: Element | null = element;

      while (current && current !== document.body) {
        const parent: Element | null = current.parentElement;
        const tag = current.tagName.toLowerCase();
        const id = current.id ? "#" + current.id : "";
        const className =
          typeof current.className === "string" && current.className.trim()
            ? "." + current.className.trim().split(/\\s+/).slice(0, 3).join(".")
            : "";
        const index = parent
          ? Array.from(parent.children)
              .filter((child) => child.tagName === current?.tagName)
              .indexOf(current) + 1
          : 1;

        segments.unshift(tag + id + className + ":nth-of-type(" + index + ")");
        current = parent;
      }

      return segments.join(" > ");
    }

    function getSelectionAttributes(element: Element) {
      const attributeNames = [
        "type",
        "name",
        "placeholder",
        "title",
        "data-testid",
        "aria-current",
        "aria-expanded",
        "aria-pressed",
      ];
      const attributes: Record<string, string> = {};

      for (const name of attributeNames) {
        const value = element.getAttribute(name);
        if (value) attributes[name] = value.slice(0, 160);
      }

      return Object.keys(attributes).length > 0 ? attributes : undefined;
    }

    function getElementRect(element: Element) {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    }

    function serializeSelection(target: Element) {
      return {
        tagName: target.tagName.toLowerCase(),
        domPath: getDomPath(target),
        text:
          target.textContent?.replace(/\\s+/g, " ").trim().slice(0, 240) ||
          "",
        id: target.id || undefined,
        className:
          typeof target.className === "string"
            ? target.className.slice(0, 240)
            : undefined,
        role: target.getAttribute("role") || undefined,
        ariaLabel: target.getAttribute("aria-label") || undefined,
        href: target instanceof HTMLAnchorElement ? target.href : undefined,
        imageAlt:
          target instanceof HTMLImageElement ? target.alt || undefined : undefined,
        attributes: getSelectionAttributes(target),
        rect: getElementRect(target),
        html: target.outerHTML.replace(/\\s+/g, " ").trim().slice(0, 600),
      };
    }

    function postReady() {
      window.parent?.postMessage({ source: PREVIEW_SOURCE, type: "ready" }, "*");
    }

    function onMessage(event: MessageEvent) {
      const message = event.data;
      if (!message || message.source !== PARENT_SOURCE) return;

      if (message.type === "set-selection-mode") {
        setSelectionMode(Boolean(message.enabled));
      }

      if (message.type === "ping") {
        postReady();
      }
    }

    function onClick(event: MouseEvent) {
      if (!selectionMode) return;
      if (!(event.target instanceof Element)) return;

      event.preventDefault();
      event.stopPropagation();
      setSelectionMode(false);
      window.parent?.postMessage(
        {
          source: PREVIEW_SOURCE,
          type: "selected",
          selection: serializeSelection(event.target),
        },
        "*",
      );
    }

    window.addEventListener("message", onMessage);
    window.addEventListener("click", onClick, true);
    ensureSelectionStyles();
    postReady();

    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("click", onClick, true);
      document.body?.classList.remove("squid-preview-selecting");
    };
  }, []);

  return null;
}
`;

export const dependencies = {
  "lucide-react": "latest",
  recharts: "2.9.0",
  "react-router-dom": "latest",
  "@radix-ui/react-accordion": "^1.2.0",
  "@radix-ui/react-alert-dialog": "^1.1.1",
  "@radix-ui/react-aspect-ratio": "^1.1.0",
  "@radix-ui/react-avatar": "^1.1.0",
  "@radix-ui/react-checkbox": "^1.1.1",
  "@radix-ui/react-collapsible": "^1.1.0",
  "@radix-ui/react-dialog": "^1.1.1",
  "@radix-ui/react-dropdown-menu": "^2.1.1",
  "@radix-ui/react-hover-card": "^1.1.1",
  "@radix-ui/react-label": "^2.1.0",
  "@radix-ui/react-menubar": "^1.1.1",
  "@radix-ui/react-navigation-menu": "^1.2.0",
  "@radix-ui/react-popover": "^1.1.1",
  "@radix-ui/react-progress": "^1.1.0",
  "@radix-ui/react-radio-group": "^1.2.0",
  "@radix-ui/react-select": "^2.1.1",
  "@radix-ui/react-separator": "^1.1.0",
  "@radix-ui/react-slider": "^1.2.0",
  "@radix-ui/react-slot": "^1.1.0",
  "@radix-ui/react-switch": "^1.1.0",
  "@radix-ui/react-tabs": "^1.1.0",
  "@radix-ui/react-toast": "^1.2.1",
  "@radix-ui/react-toggle": "^1.1.0",
  "@radix-ui/react-toggle-group": "^1.1.0",
  "@radix-ui/react-tooltip": "^1.1.2",
  "class-variance-authority": "^0.7.0",
  clsx: "^2.1.1",
  "date-fns": "^3.6.0",
  "embla-carousel-react": "^8.1.8",
  "react-day-picker": "^8.10.1",
  "tailwind-merge": "^2.4.0",
  "tailwindcss-animate": "^1.0.7",
  "framer-motion": "^11.15.0",
  "react-dnd": "latest",
  "react-dnd-html5-backend": "latest",
  vaul: "^0.9.1",
};
