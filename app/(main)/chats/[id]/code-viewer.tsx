"use client";

import CloseIcon from "@/components/icons/close-icon";
import RefreshIcon from "@/components/icons/refresh";
import {
  AlertTriangle,
  CheckCircle2,
  DownloadIcon,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  extractAllCodeBlocks,
  generateIntelligentFilename,
  getExtensionForLanguage,
  toTitleCase,
} from "@/lib/utils";
import {
  attachGeneratedFilesStats,
  buildGeneratedFilesQualityReport,
  normalizeGeneratedFiles,
  readGeneratedFilesStats,
  type GeneratedFile,
} from "@/lib/generated-files";
import {
  dependencies as sandpackDependencies,
  shadcnFiles,
} from "@/lib/sandpack-config";
import { useState, useEffect } from "react";
import type { Chat, Message } from "./page";
import { Share } from "./share";
import { StickToBottom } from "use-stick-to-bottom";
import JSZip from "jszip";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const CodeRunner = dynamic(() => import("@/components/code-runner"), {
  ssr: false,
});
const SyntaxHighlighter = dynamic(
  () => import("@/components/syntax-highlighter"),
  {
    ssr: false,
  },
);

export default function CodeViewer({
  chat,
  streamText,
  message,
  onMessageChange,
  activeTab,
  onTabChange,
  onClose,
  onRequestFix,
  onRestore,
  isSaved,
  isSaving,
  isCheckingSession,
  onSave,
}: {
  chat: Chat;
  streamText: string;
  message?: Message;
  onMessageChange: (v: Message) => void;
  activeTab: string;
  onTabChange: (v: "code" | "preview") => void;
  onClose: () => void;
  onRequestFix: (e: string) => void;
  onRestore: (
    message: Message | undefined,
    oldVersion: number,
    newVersion: number,
  ) => void;
  isSaved: boolean;
  isSaving: boolean;
  isCheckingSession: boolean;
  onSave: () => void;
}) {
  const streamAllFiles = normalizeGeneratedFiles(
    extractAllCodeBlocks(streamText),
  );

  // Extract the latest (possibly partial) code fence from the stream text
  function extractLatestStreamBlock(
    input: string,
  ): { code: string; language: string; path: string } | undefined {
    if (!input) return undefined;
    const lines = input.split("\n");
    const codeFenceRegex = /^```([^\n]*)$/;

    let openTag: string | null = null;
    let codeBuffer: string[] = [];
    let latestComplete:
      | { code: string; language: string; path: string }
      | undefined;

    for (const line of lines) {
      const match = line.match(codeFenceRegex);
      if (match && !openTag) {
        // Opening a fence
        openTag = match[1] || "";
        codeBuffer = [];
      } else if (match && openTag) {
        // Closing the fence
        const { language, path } = parseTag(openTag);
        latestComplete = { code: codeBuffer.join("\n"), language, path };
        openTag = null;
        codeBuffer = [];
      } else if (openTag) {
        codeBuffer.push(line);
      }
    }

    // If an open fence remains at end, return it as partial; else return latest complete
    if (openTag) {
      const { language, path } = parseTag(openTag);
      const normalized = normalizeGeneratedFiles([
        { code: codeBuffer.join("\n"), language, path },
      ])[0];
      return normalized
        ? {
            code: normalized.code,
            language: normalized.language,
            path: normalized.path,
          }
        : undefined;
    }
    if (!latestComplete) return undefined;
    const normalized = normalizeGeneratedFiles([latestComplete])[0];
    return normalized
      ? {
          code: normalized.code,
          language: normalized.language,
          path: normalized.path,
        }
      : undefined;
  }

  function parseTag(tag: string) {
    const raw = tag || "";
    const langMatch = raw.match(/^([A-Za-z0-9]+)/);
    const language = langMatch ? langMatch[1] : "text";
    const pathMatch = raw.match(/(?:\{\s*)?path\s*=\s*([^}\s]+)(?:\s*\})?/);
    const filenameMatch = raw.match(
      /(?:\{\s*)?filename\s*=\s*([^}\s]+)(?:\s*\})?/,
    );
    const path = pathMatch
      ? pathMatch[1]
      : filenameMatch
        ? filenameMatch[1]
        : `file.${getExtensionForLanguage(language)}`;
    return { language, path };
  }

  const latestStreamBlock = extractLatestStreamBlock(streamText);

  // Merge stream files with latest partial if necessary
  let mergedStreamFiles = [...streamAllFiles];
  if (latestStreamBlock) {
    const existingIdx = mergedStreamFiles.findIndex(
      (f) => f.path === latestStreamBlock.path,
    );
    if (existingIdx !== -1) {
      mergedStreamFiles[existingIdx] = {
        code: latestStreamBlock.code,
        language: latestStreamBlock.language,
        path: latestStreamBlock.path,
        fullMatch: "",
      };
    } else {
      mergedStreamFiles.push({
        code: latestStreamBlock.code,
        language: latestStreamBlock.language,
        path: latestStreamBlock.path,
        fullMatch: "",
      });
    }
  }
  attachGeneratedFilesStats(
    mergedStreamFiles,
    readGeneratedFilesStats(streamAllFiles),
  );

  // Utility to merge base files with overlay files (overlay wins on conflicts)
  function mergeFiles(base: GeneratedFile[], overlay: GeneratedFile[]) {
    const map = new Map<string, GeneratedFile>();
    base.forEach((f) => map.set(f.path, f));
    overlay.forEach((f) => map.set(f.path, f));
    const merged = Array.from(map.values());
    const baseStats = readGeneratedFilesStats(base);
    const overlayStats = readGeneratedFilesStats(overlay);

    return attachGeneratedFilesStats(merged, {
      protectedPathsBlocked:
        baseStats.protectedPathsBlocked + overlayStats.protectedPathsBlocked,
    });
  }

  // Helper to get files from a message (JSON field or extract from content)
  const getFilesFromMessage = (msg: Message) => {
    // extractAllCodeBlocks is needed for legacy 1 file apps
    return normalizeGeneratedFiles(
      ((msg.files as any[]) || []).length > 0
        ? (msg.files as any[])
        : extractAllCodeBlocks(msg.content),
    );
  };

  // Since each message now contains cumulative files, simplify the logic
  const assistantMessages = chat.messages.filter(
    (m) => m.role === "assistant" && getFilesFromMessage(m).length > 0,
  );

  // Effective files:
  // - While streaming: use the last message's cumulative files overlaid with streamed partials
  // - When displaying a message: use that message's cumulative files directly
  const files = streamText
    ? (() => {
        const lastMessage = assistantMessages.at(-1);
        const baseFiles = lastMessage ? getFilesFromMessage(lastMessage) : [];
        return mergeFiles(baseFiles, mergedStreamFiles);
      })()
    : message
      ? getFilesFromMessage(message)
      : [];

  // Prefer the latest streamed file while streaming; otherwise, App.tsx or first tsx
  const mainFile =
    latestStreamBlock && streamText
      ? files.find((f) => f.path === latestStreamBlock.path) || files.at(-1)
      : files.find((f) => f.path === "App.tsx") ||
        files.find((f) => f.path.endsWith(".tsx")) ||
        files[0];
  const language = mainFile ? mainFile.language : "";

  // Generate app title for display
  const generateAppTitle = (fileList: typeof files) => {
    if (fileList.length === 1) {
      return generateIntelligentFilename(fileList[0].code, fileList[0].language)
        .name;
    }

    // For multiple files, look for App.tsx or main component
    const appFile = fileList.find(
      (f) => f.path === "App.tsx" || f.path.endsWith("App.tsx"),
    );
    if (appFile) {
      const appMatch = appFile.code.match(
        /function\s+(\w+App|\w+Component|\w+)/,
      );
      if (appMatch) {
        return toTitleCase(appMatch[1].replace(/(App|Component)$/, ""));
      }
    }

    // Fallback: use the first file's name
    const firstFile = fileList[0];
    if (firstFile) {
      const name =
        firstFile.path
          .split("/")
          .pop()
          ?.replace(/\.\w+$/, "") || "App";
      return toTitleCase(name.replace(/(App|Component)$/, ""));
    }

    return "App";
  };

  const appTitle = generateAppTitle(files);
  const qualityReport = buildGeneratedFilesQualityReport(files);
  const qualityWarningCount =
    qualityReport.diagnostics.length +
    qualityReport.accessibilityWarnings.length;

  const allAssistantMessages = assistantMessages.some(
    (m) => m.id === message?.id,
  )
    ? assistantMessages
    : message && getFilesFromMessage(message).length > 0
      ? [...assistantMessages, message]
      : assistantMessages;
  const reversedAllAssistantMessages = allAssistantMessages.slice().reverse();
  const currentVersionIndex =
    streamAllFiles.length > 0
      ? allAssistantMessages.length
      : message && allAssistantMessages.some((m) => m.id === message.id)
        ? allAssistantMessages.map((m) => m.id).indexOf(message.id)
        : allAssistantMessages.length - 1;
  const currentVersion =
    (chat.assistantMessagesCountBefore || 0) + currentVersionIndex;

  const [refresh, setRefresh] = useState(0);
  const disabledControls = !!streamText || files.length === 0;
  const selectValue = disabledControls
    ? undefined
    : (allAssistantMessages.length - 1 - currentVersionIndex).toString();

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleDownloadFiles = async () => {
    if (files.length === 0) return;

    const zip = new JSZip();
    const appTitle = generateAppTitle(files);
    const packageName =
      appTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "squid-generated-app";

    // Add each generated file to the zip
    files.forEach((file) => {
      zip.file(file.path, file.code);
    });

    for (const [path, content] of Object.entries(shadcnFiles)) {
      if (path === "/public/index.html") continue;

      const exportPath = path.replace(/^\//, "");
      if (!files.some((file) => file.path === exportPath)) {
        zip.file(exportPath, content);
      }
    }

    if (!files.some((file) => file.path === "main.tsx")) {
      zip.file(
        "main.tsx",
        [
          'import React from "react";',
          'import { createRoot } from "react-dom/client";',
          'import App from "./App";',
          'import "./styles.css";',
          "",
          'createRoot(document.getElementById("root")!).render(',
          "  <React.StrictMode>",
          "    <App />",
          "  </React.StrictMode>,",
          ");",
        ].join("\n"),
      );
    }

    if (!files.some((file) => file.path === "styles.css")) {
      zip.file(
        "styles.css",
        [
          "@tailwind base;",
          "@tailwind components;",
          "@tailwind utilities;",
          "",
          ":root {",
          "  --background: 0 0% 100%;",
          "  --foreground: 222.2 84% 4.9%;",
          "  --card: 0 0% 100%;",
          "  --card-foreground: 222.2 84% 4.9%;",
          "  --popover: 0 0% 100%;",
          "  --popover-foreground: 222.2 84% 4.9%;",
          "  --primary: 221.2 83.2% 53.3%;",
          "  --primary-foreground: 210 40% 98%;",
          "  --secondary: 210 40% 96.1%;",
          "  --secondary-foreground: 222.2 47.4% 11.2%;",
          "  --muted: 210 40% 96.1%;",
          "  --muted-foreground: 215.4 16.3% 46.9%;",
          "  --accent: 210 40% 96.1%;",
          "  --accent-foreground: 222.2 47.4% 11.2%;",
          "  --destructive: 0 84.2% 60.2%;",
          "  --destructive-foreground: 210 40% 98%;",
          "  --border: 214.3 31.8% 91.4%;",
          "  --input: 214.3 31.8% 91.4%;",
          "  --ring: 221.2 83.2% 53.3%;",
          "  --radius: 0.5rem;",
          "}",
          "",
          ".dark {",
          "  --background: 222.2 84% 4.9%;",
          "  --foreground: 210 40% 98%;",
          "  --card: 222.2 84% 4.9%;",
          "  --card-foreground: 210 40% 98%;",
          "  --popover: 222.2 84% 4.9%;",
          "  --popover-foreground: 210 40% 98%;",
          "  --primary: 217.2 91.2% 59.8%;",
          "  --primary-foreground: 222.2 47.4% 11.2%;",
          "  --secondary: 217.2 32.6% 17.5%;",
          "  --secondary-foreground: 210 40% 98%;",
          "  --muted: 217.2 32.6% 17.5%;",
          "  --muted-foreground: 215 20.2% 65.1%;",
          "  --accent: 217.2 32.6% 17.5%;",
          "  --accent-foreground: 210 40% 98%;",
          "  --destructive: 0 62.8% 30.6%;",
          "  --destructive-foreground: 210 40% 98%;",
          "  --border: 217.2 32.6% 17.5%;",
          "  --input: 217.2 32.6% 17.5%;",
          "  --ring: 224.3 76.3% 48%;",
          "}",
          "",
          "* {",
          "  border-color: hsl(var(--border));",
          "}",
          "",
          "body {",
          "  margin: 0;",
          "  min-width: 320px;",
          "  min-height: 100vh;",
          "}",
        ].join("\n"),
      );
    }

    zip.file(
      "index.html",
      [
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="UTF-8" />',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        `    <title>${appTitle}</title>`,
        "  </head>",
        "  <body>",
        '    <div id="root"></div>',
        '    <script type="module" src="/main.tsx"></script>',
        "  </body>",
        "</html>",
      ].join("\n"),
    );

    zip.file(
      "package.json",
      JSON.stringify(
        {
          name: packageName,
          version: "0.1.0",
          private: true,
          type: "module",
          scripts: {
            dev: "vite --host 0.0.0.0",
            build: "tsc --noEmit && vite build",
            preview: "vite preview",
            typecheck: "tsc --noEmit",
          },
          dependencies: inferPackageDependencies(files),
          devDependencies: {
            "@types/node": "latest",
            "@vitejs/plugin-react": "latest",
            autoprefixer: "latest",
            postcss: "latest",
            tailwindcss: "latest",
            typescript: "latest",
            vite: "latest",
          },
        },
        null,
        2,
      ),
    );

    zip.file(
      "README.md",
      [
        `# ${appTitle}`,
        "",
        "Generated by Squid.",
        "",
        "## Run locally",
        "",
        "```bash",
        "pnpm install",
        "pnpm dev",
        "```",
        "",
        "## Included artifacts",
        "",
        "- `squid-manifest.json`: generated file manifest and export metadata.",
        "- `squid-quality-report.json`: import, file, and accessibility diagnostics.",
        "- `vercel.json`, `netlify.toml`, and `wrangler.toml`: starter deploy config.",
        "",
        "The quality report is a smoke check, not a substitute for a full production review.",
      ].join("\n"),
    );

    zip.file(
      "squid-manifest.json",
      JSON.stringify(
        {
          appTitle,
          exportedAt: new Date().toISOString(),
          source: "Squid",
          files: files.map((file) => ({
            path: file.path,
            language: file.language,
            bytes: new Blob([file.code]).size,
          })),
        },
        null,
        2,
      ),
    );

    zip.file(
      "squid-quality-report.json",
      JSON.stringify(qualityReport, null, 2),
    );
    zip.file(
      "tsconfig.json",
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2020",
            useDefineForClassFields: true,
            lib: ["DOM", "DOM.Iterable", "ES2020"],
            allowJs: false,
            skipLibCheck: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            module: "ESNext",
            moduleResolution: "Node",
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: "react-jsx",
            baseUrl: ".",
            paths: {
              "@/*": ["./*"],
            },
          },
          include: ["**/*.ts", "**/*.tsx"],
        },
        null,
        2,
      ),
    );
    zip.file(
      "vite.config.ts",
      [
        'import { defineConfig } from "vite";',
        'import react from "@vitejs/plugin-react";',
        'import path from "node:path";',
        "",
        "export default defineConfig({",
        "  plugins: [react()],",
        "  resolve: {",
        '    alias: { "@": path.resolve(__dirname, ".") },',
        "  },",
        "});",
      ].join("\n"),
    );
    zip.file(
      "tailwind.config.ts",
      [
        'import type { Config } from "tailwindcss";',
        "",
        "export default {",
        '  content: ["./index.html", "./**/*.{ts,tsx}"],',
        "  theme: {",
        "    extend: {",
        "      colors: {",
        '        border: "hsl(var(--border))",',
        '        input: "hsl(var(--input))",',
        '        ring: "hsl(var(--ring))",',
        '        background: "hsl(var(--background))",',
        '        foreground: "hsl(var(--foreground))",',
        "        primary: {",
        '          DEFAULT: "hsl(var(--primary))",',
        '          foreground: "hsl(var(--primary-foreground))",',
        "        },",
        "        secondary: {",
        '          DEFAULT: "hsl(var(--secondary))",',
        '          foreground: "hsl(var(--secondary-foreground))",',
        "        },",
        "        destructive: {",
        '          DEFAULT: "hsl(var(--destructive))",',
        '          foreground: "hsl(var(--destructive-foreground))",',
        "        },",
        "        muted: {",
        '          DEFAULT: "hsl(var(--muted))",',
        '          foreground: "hsl(var(--muted-foreground))",',
        "        },",
        "        accent: {",
        '          DEFAULT: "hsl(var(--accent))",',
        '          foreground: "hsl(var(--accent-foreground))",',
        "        },",
        "        popover: {",
        '          DEFAULT: "hsl(var(--popover))",',
        '          foreground: "hsl(var(--popover-foreground))",',
        "        },",
        "        card: {",
        '          DEFAULT: "hsl(var(--card))",',
        '          foreground: "hsl(var(--card-foreground))",',
        "        },",
        "      },",
        '      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },',
        "    },",
        "  },",
        '  plugins: [require("tailwindcss-animate")],',
        "} satisfies Config;",
      ].join("\n"),
    );
    zip.file(
      "postcss.config.js",
      [
        "export default {",
        "  plugins: {",
        "    tailwindcss: {},",
        "    autoprefixer: {},",
        "  },",
        "};",
      ].join("\n"),
    );
    zip.file(
      "vercel.json",
      JSON.stringify(
        { rewrites: [{ source: "/(.*)", destination: "/" }] },
        null,
        2,
      ),
    );
    zip.file(
      "netlify.toml",
      [
        "[build]",
        '  command = "pnpm build"',
        '  publish = "dist"',
        "",
        "[[redirects]]",
        '  from = "/*"',
        '  to = "/index.html"',
        "  status = 200",
      ].join("\n"),
    );
    zip.file(
      "wrangler.toml",
      [`name = "${packageName}"`, 'pages_build_output_dir = "dist"'].join("\n"),
    );

    // Generate the zip file
    const content = await zip.generateAsync({ type: "blob" });

    const filename = `${appTitle.replace(/[^a-zA-Z0-9]/g, "-")}-squidagent.zip`;

    // Create a download link and trigger the download
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Files downloaded!", {
      description: `${files.length} source files plus export metadata downloaded as ${filename}`,
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="inline-flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={onClose}
          >
            <CloseIcon className="size-5" />
          </Button>
          <span className="hidden md:block">{appTitle}</span>
          {!disabledControls && (
            <Select
              value={selectValue}
              onValueChange={(value) =>
                onMessageChange(reversedAllAssistantMessages[parseInt(value)])
              }
              disabled={disabledControls}
            >
              <SelectTrigger className="h-[38px] w-16 text-sm font-semibold !outline-none !ring-0 !ring-transparent">
                <SelectValue>{`v${currentVersion + 1}`}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {reversedAllAssistantMessages.map((msg, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        v
                        {(chat.assistantMessagesCountBefore || 0) +
                          (allAssistantMessages.length - 1 - i) +
                          1}
                      </span>
                      <span className="text-xs text-white">
                        {timeAgo(msg.createdAt)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {currentVersionIndex < allAssistantMessages.length - 1 && message && (
            <Button
              size="sm"
              onClick={() =>
                onRestore(
                  message,
                  currentVersion + 1,
                  (chat.assistantMessagesCountBefore || 0) +
                    allAssistantMessages.length +
                    1,
                )
              }
            >
              Restore
            </Button>
          )}
          {!disabledControls && (
            <div
              className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium md:inline-flex ${
                qualityReport.status === "passed"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              }`}
              title={
                qualityReport.status === "passed"
                  ? "Generated imports resolved with no basic warnings."
                  : `${qualityWarningCount} quality warning${qualityWarningCount === 1 ? "" : "s"} found.`
              }
            >
              {qualityReport.status === "passed" ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <AlertTriangle className="size-3.5" />
              )}
              Quality {qualityReport.status === "passed" ? "passed" : "review"}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          {!isSaved && (
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving || isCheckingSession}
              className={!chat.userId ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isSaving
                ? "Saving..."
                : isCheckingSession
                  ? "Loading..."
                  : !chat.userId
                    ? "Sign Up to Save"
                    : "Save"}
            </Button>
          )}
          {isSaved && (
            <span className="rounded-md bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400">
              Saved
            </span>
          )}
          <div className="inline-flex items-center rounded-xl border border-border/60 bg-muted/30 p-1">
            <button
              onClick={() => onTabChange("code")}
              disabled={disabledControls}
              className={`h-8 w-20 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "code"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Code
            </button>
            <button
              onClick={() => onTabChange("preview")}
              disabled={disabledControls}
              className={`h-8 w-20 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "preview"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        {activeTab === "code" ? (
          <StickToBottom
            className="relative flex-1 overflow-hidden *:!h-[inherit]"
            resize="smooth"
            initial={false}
          >
            <StickToBottom.Content>
              <SyntaxHighlighter
                files={files.map((f) => ({
                  path: f.path,
                  content: f.code,
                  language: f.language,
                }))}
                activePath={
                  streamText
                    ? latestStreamBlock?.path || files.at(-1)?.path
                    : undefined
                }
                disableSelection={!!streamText}
                isStreaming={!!streamText}
              />
            </StickToBottom.Content>
          </StickToBottom>
        ) : (
          <>
            {files.length > 0 && (
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <CodeRunner
                  onRequestFix={onRequestFix}
                  language={language}
                  files={files.map((f) => ({ path: f.path, content: f.code }))}
                  key={refresh}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-4">
        <div className="inline-flex min-w-0 items-center gap-2.5 text-sm">
          <Share
            message={
              disabledControls
                ? undefined
                : message && streamAllFiles.length === 0
                  ? message
                  : undefined
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefresh((r) => r + 1)}
            disabled={disabledControls}
          >
            <RefreshIcon className="size-3" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadFiles}
            disabled={disabledControls}
            title="Download files"
            className="hidden md:inline-flex"
          >
            <DownloadIcon className="size-3" />
            Export
          </Button>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {!disabledControls && (
            <div className="hidden min-w-0 items-center gap-2 lg:flex">
              <ShieldCheck className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">
                {qualityReport.filesGenerated} files,{" "}
                {qualityReport.importsResolved} imports resolved
                {qualityWarningCount > 0
                  ? `, ${qualityWarningCount} warnings`
                  : ", no warnings"}
              </span>
            </div>
          )}
          <span className="md:hidden">{chat.model}</span>
        </div>
      </div>
    </>
  );
}

function inferPackageDependencies(
  files: Array<{ code: string }>,
): Record<string, string> {
  const source = files.map((file) => file.code).join("\n");
  const dependencies: Record<string, string> = {
    ...sandpackDependencies,
    "class-variance-authority": "latest",
    clsx: "latest",
    "lucide-react": "latest",
    react: "latest",
    "react-dom": "latest",
    "tailwind-merge": "latest",
  };

  if (source.includes("framer-motion"))
    dependencies["framer-motion"] = "latest";
  if (source.includes("recharts")) dependencies.recharts = "latest";
  if (source.includes("@radix-ui/react-")) {
    dependencies["@radix-ui/react-slot"] = "latest";
  }

  return dependencies;
}
