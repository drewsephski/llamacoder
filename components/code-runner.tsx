import CodeRunnerReact from "./code-runner-react";
import type { PreviewElementSelection } from "@/lib/targeted-preview-edit";
import type { RuntimeVerificationReport } from "@/features/generation/runtime-verification";
import type { SupabaseBrowserRuntimeState } from "@/features/integrations/supabase-browser-runtime";

export default function CodeRunner({
  language,
  code,
  files,
  onRequestFix,
  onPreviewHealthChange,
  onPreviewSelection,
  previewSelectionMode,
  previewTestNonce,
  onPreviewTestReport,
  supabaseRuntime,
}: {
  language?: string;
  code?: string;
  files?: Array<{ path: string; content: string }>;
  onRequestFix?: (e: string) => void;
  onPreviewHealthChange?: (health: {
    status: "working" | "error";
    error?: string;
  }) => void;
  onPreviewSelection?: (selection: PreviewElementSelection) => void;
  previewSelectionMode?: boolean;
  previewTestNonce?: number;
  onPreviewTestReport?: (
    report: Omit<RuntimeVerificationReport, "messageId">,
  ) => void;
  supabaseRuntime?: SupabaseBrowserRuntimeState;
}) {
  const actualFiles =
    files || (code ? [{ path: "App.tsx", content: code }] : []);
  return (
    <CodeRunnerReact
      files={actualFiles}
      onRequestFix={onRequestFix}
      onPreviewHealthChange={onPreviewHealthChange}
      onPreviewSelection={onPreviewSelection}
      previewSelectionMode={previewSelectionMode}
      previewTestNonce={previewTestNonce}
      onPreviewTestReport={onPreviewTestReport}
      supabaseRuntime={supabaseRuntime}
    />
  );
}
