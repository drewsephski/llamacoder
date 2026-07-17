import * as shadcnComponents from "@/lib/shadcn";
import { normalizeGeneratedFiles } from "@/lib/generated-files";
import {
  generatedAppDependencies,
  getRequiredGeneratedAppDependencies,
} from "@/lib/generated-app-dependencies";
import {
  buildGeneratedThemeCss,
  serializeGeneratedTailwindThemeExtension,
} from "@/lib/generated-theme";

export const dependencies = generatedAppDependencies;

export function getSandpackConfig(
  files: Array<{ path: string; content: string }>,
) {
  const normalizedFiles = normalizeGeneratedFiles(files);
  const sandpackFiles: Record<string, string> =
    getRequiredShadcnFiles(normalizedFiles);

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
      dependencies: getRequiredDependencies(sandpackFiles),
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
  "/components/ui/form.tsx": shadcnComponents.form,
  "/components/ui/hover-card.tsx": shadcnComponents.hoverCard,
  "/components/ui/input.tsx": shadcnComponents.input,
  "/components/ui/label.tsx": shadcnComponents.label,
  "/components/ui/menubar.tsx": shadcnComponents.menuBar,
  "/components/ui/navigation-menu.tsx": shadcnComponents.navigationMenu,
  "/components/ui/pagination.tsx": shadcnComponents.pagination,
  "/components/ui/popover.tsx": shadcnComponents.popover,
  "/components/ui/progress.tsx": shadcnComponents.progress,
  "/components/ui/radio-group.tsx": shadcnComponents.radioGroup,
  "/components/ui/resizable.tsx": shadcnComponents.resizable,
  "/components/ui/scroll-area.tsx": shadcnComponents.scrollArea,
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
      <script>
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: ${serializeGeneratedTailwindThemeExtension()},
          },
        };
      </script>
      <style>
${buildGeneratedThemeCss()}
      </style>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
  `,
};

const availableShadcnFiles: Record<string, string> = shadcnFiles;
const IMPORT_SOURCE_REGEX =
  /\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;

export function getRequiredShadcnFiles(
  generatedFiles: Array<{ path: string; code: string }>,
) {
  const selected: Record<string, string> = {
    "/public/index.html": shadcnFiles["/public/index.html"],
  };
  const pending: string[] = [];

  const addImports = (fromPath: string, code: string) => {
    IMPORT_SOURCE_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = IMPORT_SOURCE_REGEX.exec(code)) !== null) {
      const resolvedPath = resolveShadcnImport(fromPath, match[1]);
      if (resolvedPath && !(resolvedPath in selected)) {
        selected[resolvedPath] = availableShadcnFiles[resolvedPath];
        pending.push(resolvedPath);
      }
    }
  };

  for (const file of generatedFiles) {
    addImports(`/${file.path}`, file.code);
  }
  while (pending.length > 0) {
    const path = pending.shift();
    if (path) addImports(path, selected[path]);
  }

  return selected;
}

function resolveShadcnImport(fromPath: string, source: string) {
  let basePath: string;
  if (source.startsWith("@/")) {
    basePath = `/${source.slice(2)}`;
  } else if (source.startsWith("/")) {
    basePath = source;
  } else if (source.startsWith("./") || source.startsWith("../")) {
    const directory = fromPath.slice(0, fromPath.lastIndexOf("/"));
    basePath = normalizePath(`${directory}/${source}`);
  } else {
    return null;
  }

  const candidates = /\.[a-z]+$/i.test(basePath)
    ? [basePath]
    : [basePath, `${basePath}.tsx`, `${basePath}.ts`, `${basePath}/index.tsx`];
  return (
    candidates.find((candidate) => candidate in availableShadcnFiles) ?? null
  );
}

function normalizePath(path: string) {
  const segments: string[] = [];
  for (const segment of path.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment);
  }
  return `/${segments.join("/")}`;
}

function getRequiredDependencies(files: Record<string, string>) {
  return getRequiredGeneratedAppDependencies(Object.values(files));
}

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

    function runRuntimeTest(requestId: number) {
      const clickableElements = Array.from(
        document.querySelectorAll(
          "button, a, input, select, textarea, [role='button']",
        ),
      );
      const unnamedClickableElements = clickableElements.filter((element) => {
        const labelledBy = element.getAttribute("aria-labelledby");
        const labelledByText = labelledBy
          ? labelledBy
              .split(/\\s+/)
              .map((id) => document.getElementById(id)?.textContent || "")
              .join(" ")
          : "";
        const label =
          element.getAttribute("aria-label") ||
          labelledByText ||
          element.getAttribute("title") ||
          element.getAttribute("placeholder") ||
          element.textContent;

        return !label?.replace(/\\s+/g, " ").trim();
      }).length;
      const horizontalOverflow =
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 8;

      window.parent?.postMessage(
        {
          source: PREVIEW_SOURCE,
          type: "runtime-test-report",
          requestId,
          report: {
            status:
              unnamedClickableElements > 0 || horizontalOverflow
                ? "review"
                : "passed",
            viewport: {
              width: Math.max(1, document.documentElement.clientWidth),
              height: Math.max(1, document.documentElement.clientHeight),
            },
            clickableElements: clickableElements.length,
            unnamedClickableElements,
            horizontalOverflow,
            runtimeError: null,
            checkedAt: new Date().toISOString(),
          },
        },
        "*",
      );
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

      if (message.type === "run-runtime-test") {
        runRuntimeTest(Number(message.requestId) || 0);
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
