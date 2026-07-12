"use client";

import CloseIcon from "@/components/icons/close-icon";
import RefreshIcon from "@/components/icons/refresh";
import {
  DownloadIcon,
  ExternalLink,
  FlaskConical,
  Loader2,
  MousePointer2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { SiNetlify } from "react-icons/si";
import { toast } from "sonner";
import { Vercel } from "@/logos/vercel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  normalizeGeneratedFiles,
  readGeneratedFilesStats,
  type GeneratedFile,
} from "@/lib/generated-files";
import { buildExportBundle, getExportFilename } from "@/lib/export-bundle";
import {
  buildTargetedPreviewEditPrompt,
  type PreviewElementSelection,
} from "@/lib/targeted-preview-edit";
import { useState, useEffect, useMemo } from "react";
import type { Chat, Message } from "./page";
import { Share } from "./share";
import { StickToBottom } from "use-stick-to-bottom";
import JSZip from "jszip";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { QualityReportPanel } from "@/components/quality-report-panel";
import { SelectedElementEditTray } from "@/components/selected-element-edit-tray";
import { ProjectIntegrationsPanel } from "@/features/integrations/components/project-integrations-panel";

const CodeRunner = dynamic(() => import("@/components/code-runner"), {
  ssr: false,
});
const SyntaxHighlighter = dynamic(
  () => import("@/components/syntax-highlighter"),
  {
    ssr: false,
  },
);

function parseCodeFenceTag(tag: string) {
  const langMatch = tag.match(/^([A-Za-z0-9]+)/);
  const language = langMatch ? langMatch[1] : "text";
  const pathMatch = tag.match(/(?:\{\s*)?path\s*=\s*([^}\s]+)(?:\s*\})?/);
  const filenameMatch = tag.match(
    /(?:\{\s*)?filename\s*=\s*([^}\s]+)(?:\s*\})?/,
  );
  const path = pathMatch
    ? pathMatch[1]
    : filenameMatch
      ? filenameMatch[1]
      : `file.${getExtensionForLanguage(language)}`;

  return { language, path };
}

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
      openTag = match[1] || "";
      codeBuffer = [];
    } else if (match && openTag) {
      const { language, path } = parseCodeFenceTag(openTag);
      latestComplete = { code: codeBuffer.join("\n"), language, path };
      openTag = null;
      codeBuffer = [];
    } else if (openTag) {
      codeBuffer.push(line);
    }
  }

  const candidate = openTag
    ? {
        code: codeBuffer.join("\n"),
        ...parseCodeFenceTag(openTag),
      }
    : latestComplete;
  if (!candidate) return undefined;

  const normalized = normalizeGeneratedFiles([candidate])[0];
  return normalized
    ? {
        code: normalized.code,
        language: normalized.language,
        path: normalized.path,
      }
    : undefined;
}

function mergeFiles(base: GeneratedFile[], overlay: GeneratedFile[]) {
  const filesByPath = new Map<string, GeneratedFile>();
  base.forEach((file) => filesByPath.set(file.path, file));
  overlay.forEach((file) => filesByPath.set(file.path, file));
  const baseStats = readGeneratedFilesStats(base);
  const overlayStats = readGeneratedFilesStats(overlay);

  return attachGeneratedFilesStats(Array.from(filesByPath.values()), {
    protectedPathsBlocked:
      baseStats.protectedPathsBlocked + overlayStats.protectedPathsBlocked,
  });
}

export default function CodeViewer({
  chat,
  streamText,
  message,
  onMessageChange,
  activeTab,
  onTabChange,
  onClose,
  onRequestFix,
  onPreviewHealthChange,
  onRequestTargetedEdit,
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
  activeTab: "code" | "preview";
  onTabChange: (v: "code" | "preview") => void;
  onClose: () => void;
  onRequestFix: (e: string) => void;
  onPreviewHealthChange?: (health: {
    status: "working" | "error";
    error?: string;
  }) => void;
  onRequestTargetedEdit: (prompt: string) => void;
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
  const streamAllFiles = useMemo(
    () => normalizeGeneratedFiles(extractAllCodeBlocks(streamText)),
    [streamText],
  );

  const latestStreamBlock = useMemo(
    () => extractLatestStreamBlock(streamText),
    [streamText],
  );

  // Merge stream files with latest partial if necessary
  const mergedStreamFiles = useMemo(() => {
    const merged = [...streamAllFiles];
    if (latestStreamBlock) {
      const existingIndex = merged.findIndex(
        (file) => file.path === latestStreamBlock.path,
      );
      const streamedFile = { ...latestStreamBlock, fullMatch: "" };
      if (existingIndex === -1) merged.push(streamedFile);
      else merged[existingIndex] = streamedFile;
    }
    return attachGeneratedFilesStats(
      merged,
      readGeneratedFilesStats(streamAllFiles),
    );
  }, [latestStreamBlock, streamAllFiles]);

  // Since each message now contains cumulative files, simplify the logic
  const assistantMessages = useMemo(
    () =>
      chat.messages.filter(
        (m) => m.role === "assistant" && getMessageGeneratedFiles(m).length > 0,
      ),
    [chat.messages],
  );

  // Effective files:
  // - While streaming: use the last message's cumulative files overlaid with streamed partials
  // - When displaying a message: use that message's cumulative files directly
  const files = useMemo(
    () =>
      streamText
        ? (() => {
            const lastMessage = assistantMessages.at(-1);
            const baseFiles = lastMessage
              ? getMessageGeneratedFiles(lastMessage)
              : [];
            return mergeFiles(baseFiles, mergedStreamFiles);
          })()
        : message
          ? getMessageGeneratedFiles(message)
          : [],
    [assistantMessages, mergedStreamFiles, message, streamText],
  );

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
  const exportBundle = useMemo(() => buildExportBundle(files), [files]);
  const qualityReport = exportBundle.qualityReport;
  const qualityWarningCount =
    qualityReport.diagnostics.length +
    qualityReport.accessibilityWarnings.length;
  const [isVerifyingExport, setIsVerifyingExport] = useState(false);
  const [verifiedExportStatus, setVerifiedExportStatus] = useState<
    "verified" | "warning" | "failed" | null
  >(message?.generationReceipt?.exportVerification ?? null);
  const [previewSelectionMode, setPreviewSelectionMode] = useState(false);
  const [previewSelection, setPreviewSelection] =
    useState<PreviewElementSelection | null>(null);
  const [previewEditInstruction, setPreviewEditInstruction] = useState("");
  const [previewTestNonce, setPreviewTestNonce] = useState(0);
  const [previewTestReport, setPreviewTestReport] = useState<string | null>(
    null,
  );
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  useEffect(() => {
    setVerifiedExportStatus(
      message?.generationReceipt?.exportVerification ?? null,
    );
  }, [message?.generationReceipt?.exportVerification, message?.id]);

  const allAssistantMessages = useMemo(
    () =>
      assistantMessages.some((m) => m.id === message?.id)
        ? assistantMessages
        : message && getMessageGeneratedFiles(message).length > 0
          ? [...assistantMessages, message]
          : assistantMessages,
    [assistantMessages, message],
  );
  const reversedAllAssistantMessages = useMemo(
    () => allAssistantMessages.slice().reverse(),
    [allAssistantMessages],
  );
  const assistantMessageIndex = useMemo(
    () =>
      new Map(
        allAssistantMessages.map((assistantMessage, index) => [
          assistantMessage.id,
          index,
        ]),
      ),
    [allAssistantMessages],
  );
  const currentVersionIndex =
    streamAllFiles.length > 0
      ? allAssistantMessages.length
      : message && allAssistantMessages.some((m) => m.id === message.id)
        ? (assistantMessageIndex.get(message.id) ?? -1)
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
    const bundle = buildExportBundle(files);

    if (message?.id) {
      setIsVerifyingExport(true);
      try {
        const response = await fetch(`/api/export/${message.id}`, {
          method: "POST",
        });
        const data = await response.json().catch(() => null);

        if (response.ok) {
          setVerifiedExportStatus(data.status);
          toast.success("Export verified by Squid", {
            description: `Status: ${data.status}`,
          });
        } else {
          toast.warning("Export downloaded without saved verification", {
            description: data?.message || "Unable to persist verification.",
          });
        }
      } finally {
        setIsVerifyingExport(false);
      }
    }

    for (const file of bundle.files) {
      zip.file(file.path, file.content);
    }

    // Generate the zip file
    const content = await zip.generateAsync({ type: "blob" });
    const filename = getExportFilename(bundle.appTitle);

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

  const handleTargetedEdit = () => {
    if (!previewSelection || !previewEditInstruction.trim()) return;

    onRequestTargetedEdit(
      buildTargetedPreviewEditPrompt({
        appTitle,
        instruction: previewEditInstruction,
        selection: previewSelection,
        files,
      }),
    );
    setPreviewSelection(null);
    setPreviewSelectionMode(false);
    setPreviewEditInstruction("");
  };

  const openDeployProvider = (provider: "vercel" | "netlify") => {
    const providerName = provider === "vercel" ? "Vercel" : "Netlify";
    const providerUrl =
      provider === "vercel"
        ? "https://vercel.com/new"
        : "https://app.netlify.com/start";

    window.open(providerUrl, "_blank", "noopener,noreferrer");
    toast.info(`Opened ${providerName}`, {
      description:
        "Download the repo from Squid, then import it into the deploy provider.",
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
                      {msg.changeSummary && (
                        <span className="max-w-48 truncate text-xs text-muted-foreground">
                          {msg.changeSummary}
                        </span>
                      )}
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
            <QualityReportPanel
              report={qualityReport}
              exportStatus={verifiedExportStatus}
            />
          )}
          {chat.userId && <ProjectIntegrationsPanel projectId={chat.id} />}
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
              type="button"
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
              type="button"
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
                  onPreviewHealthChange={onPreviewHealthChange}
                  onPreviewSelection={(selection) => {
                    setPreviewSelection(selection);
                    setPreviewSelectionMode(false);
                    toast.success("Element selected", {
                      description: "Describe the edit, then apply it.",
                    });
                  }}
                  previewSelectionMode={previewSelectionMode}
                  previewTestNonce={previewTestNonce}
                  onPreviewTestReport={(report) => {
                    setPreviewTestReport(report);
                    toast.success("Preview test complete");
                  }}
                  language={language}
                  files={files.map((f) => ({ path: f.path, content: f.code }))}
                  key={refresh}
                />
              </div>
            )}
          </>
        )}
      </div>

      {previewSelection && (
        <SelectedElementEditTray
          selection={previewSelection}
          instruction={previewEditInstruction}
          disabled={disabledControls}
          onInstructionChange={setPreviewEditInstruction}
          onApply={handleTargetedEdit}
          onCancel={() => {
            setPreviewSelection(null);
            setPreviewSelectionMode(false);
            setPreviewEditInstruction("");
          }}
        />
      )}

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
            variant={previewSelectionMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActivePreviewTab(onTabChange);
              setPreviewSelectionMode((value) => !value);
            }}
            disabled={disabledControls}
            title="Select an element in the preview"
            className="hidden md:inline-flex"
          >
            <MousePointer2 className="size-3" />
            Select
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActivePreviewTab(onTabChange);
              setPreviewTestNonce((value) => value + 1);
            }}
            disabled={disabledControls}
            className="hidden md:inline-flex"
          >
            <FlaskConical className="size-3" />
            Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportDialogOpen(true)}
            disabled={disabledControls || isVerifyingExport}
            title="Export project"
            className="hidden md:inline-flex"
          >
            {isVerifyingExport ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <DownloadIcon className="size-3" />
            )}
            {isVerifyingExport ? "Verifying" : "Export"}
          </Button>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {!disabledControls && (
            <div className="hidden min-w-0 items-center gap-2 lg:flex">
              <ShieldCheck
                className={`size-3.5 shrink-0 ${
                  verifiedExportStatus === "verified"
                    ? "text-emerald-500"
                    : "text-primary"
                }`}
              />
              <span className="truncate">
                {verifiedExportStatus
                  ? `Verified by Squid: ${verifiedExportStatus}`
                  : previewTestReport ||
                    `${qualityReport.filesGenerated} files, ${qualityReport.importsResolved} imports resolved${
                      qualityWarningCount > 0
                        ? `, ${qualityWarningCount} warnings`
                        : ", no warnings"
                    }`}
              </span>
            </div>
          )}
          <span className="md:hidden">{chat.model}</span>
        </div>
      </div>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Export {appTitle}</DialogTitle>
            <DialogDescription>
              Download a verified source bundle or open a deploy provider. The
              export includes Vite, Tailwind, Vercel, Netlify, and Workers
              config files.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                1 · Verify and download
              </p>
              <button
                type="button"
                onClick={handleDownloadFiles}
                disabled={disabledControls || isVerifyingExport}
                className="group flex w-full items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {isVerifyingExport ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <DownloadIcon className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-foreground">
                    {isVerifyingExport
                      ? "Verifying export"
                      : "Verify & download ZIP"}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    Saves source, package scripts, quality report, and deploy
                    configs.
                  </span>
                </span>
              </button>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                2 · Import the repository
              </p>
              {!verifiedExportStatus && (
                <p className="mb-2 text-xs text-amber-700 dark:text-amber-300">
                  Verify and download the bundle before opening a provider.
                </p>
              )}
              {verifiedExportStatus === "failed" && (
                <p className="mb-2 text-xs text-red-700 dark:text-red-300">
                  Export verification failed. Resolve the reported issues before
                  deploying.
                </p>
              )}
              {verifiedExportStatus === "warning" && (
                <p className="mb-2 text-xs text-amber-700 dark:text-amber-300">
                  Verification completed with warnings. Review the quality
                  report before deploying.
                </p>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => openDeployProvider("vercel")}
                  disabled={
                    disabledControls ||
                    isVerifyingExport ||
                    !verifiedExportStatus ||
                    verifiedExportStatus === "failed"
                  }
                  className="group flex w-full items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-blue-500/50 hover:bg-blue-500/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                    <Vercel className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      Deploy to Vercel
                      <ExternalLink className="size-3.5 text-muted-foreground transition-colors group-hover:text-blue-500" />
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      Opens Vercel import. Use the downloaded repo; it includes
                      `vercel.json` for SPA routing.
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openDeployProvider("netlify")}
                  disabled={
                    disabledControls ||
                    isVerifyingExport ||
                    !verifiedExportStatus ||
                    verifiedExportStatus === "failed"
                  }
                  className="group flex w-full items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                    <SiNetlify className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      Deploy to Netlify
                      <ExternalLink className="size-3.5 text-muted-foreground transition-colors group-hover:text-emerald-500" />
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      Opens Netlify import. Use the downloaded repo; it includes
                      `netlify.toml` with the build and redirect settings.
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/25 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                3 · Confirm build settings and deploy
              </p>
              <p className="mt-2 text-sm text-foreground">
                Build command:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5">
                  pnpm build
                </code>
                {" · "}Output directory:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5">dist</code>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function setActivePreviewTab(onTabChange: (value: "code" | "preview") => void) {
  onTabChange("preview");
}
