import CodeRunnerReact from "./code-runner-react";
import type { PreviewElementSelection } from "@/lib/targeted-preview-edit";
import type { RuntimeVerificationReport } from "@/features/generation/runtime-verification";
import type { SupabaseBrowserRuntimeState } from "@/features/integrations/supabase-browser-runtime";
import type { PreviewLifecycle } from "./preview-status-overlay";

export default function CodeRunner({
  language,
  code,
  files,
  onRequestFix,
  onPreviewHealthChange,
  onPreviewLifecycleChange,
  onPreviewSelection,
  previewSelectionMode,
  previewTestNonce,
  onPreviewTestReport,
  supabaseRuntime,
  showStatusOverlay,
}: {
  language?: string;
  code?: string;
  files?: Array<{ path: string; content: string }>;
  onRequestFix?: (e: string) => void;
  onPreviewHealthChange?: (health: {
    status: "working" | "error";
    error?: string;
  }) => void;
  onPreviewLifecycleChange?: (lifecycle: PreviewLifecycle) => void;
  onPreviewSelection?: (selection: PreviewElementSelection) => void;
  previewSelectionMode?: boolean;
  previewTestNonce?: number;
  onPreviewTestReport?: (
    report: Omit<RuntimeVerificationReport, "messageId">,
  ) => void;
  supabaseRuntime?: SupabaseBrowserRuntimeState;
  showStatusOverlay?: boolean;
}) {
  const actualFiles =
    files || (code ? [{ path: "App.tsx", content: code }] : []);
  return (
    <CodeRunnerReact
      files={actualFiles}
      onRequestFix={onRequestFix}
      onPreviewHealthChange={onPreviewHealthChange}
      onPreviewLifecycleChange={onPreviewLifecycleChange}
      onPreviewSelection={onPreviewSelection}
      previewSelectionMode={previewSelectionMode}
      previewTestNonce={previewTestNonce}
      onPreviewTestReport={onPreviewTestReport}
      supabaseRuntime={supabaseRuntime}
      showStatusOverlay={showStatusOverlay}
    />
  );
}
