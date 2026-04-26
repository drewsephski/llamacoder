"use client";

import {
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react/unstyled";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { getSandpackConfig } from "@/lib/sandpack-config";

export default function ReactCodeRunner({
  files,
  onRequestFix,
}: {
  files: Array<{ path: string; content: string }>;
  onRequestFix?: (e: string) => void;
}) {
  const filesKey = files.map((f) => f.path + f.content).join("");
  return (
    <SandpackProvider
      key={filesKey}
      className="relative h-full w-full [&_.sp-preview-container]:flex [&_.sp-preview-container]:h-full [&_.sp-preview-container]:w-full [&_.sp-preview-container]:grow [&_.sp-preview-container]:flex-col [&_.sp-preview-container]:justify-center [&_.sp-preview-iframe]:grow"
      {...getSandpackConfig(files)}
    >
      <SandpackPreview
        showNavigator={false}
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
        showRestartButton={false}
        showOpenNewtab={false}
        className="h-full w-full"
      />
      {onRequestFix && <ErrorMessage onRequestFix={onRequestFix} />}
    </SandpackProvider>
  );
}

function ErrorMessage({ onRequestFix }: { onRequestFix: (e: string) => void }) {
  const { sandpack } = useSandpack();
  const [didCopy, setDidCopy] = useState(false);

  if (!sandpack.error) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 text-base backdrop-blur-sm">
      <div className="max-w-[400px] rounded-md bg-destructive p-4 text-destructive-foreground shadow-xl">
        <p className="text-lg font-medium">Error</p>

        <p className="mt-4 line-clamp-[10] overflow-x-auto whitespace-pre font-mono text-xs">
          {sandpack.error.message}
        </p>

        <div className="mt-8 flex justify-between gap-4">
          <button
            onClick={async () => {
              if (!sandpack.error) return;

              setDidCopy(true);
              await window.navigator.clipboard.writeText(
                sandpack.error.message,
              );
              await new Promise((resolve) => setTimeout(resolve, 2000));
              setDidCopy(false);
            }}
            className="rounded border border-destructive/30 px-2.5 py-1.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/10"
          >
            {didCopy ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
          </button>
          <button
            onClick={() => {
              if (!sandpack.error) return;
              onRequestFix(sandpack.error.message);
            }}
            className="rounded bg-background px-2.5 py-1.5 text-sm font-medium text-foreground border border-border hover:bg-muted"
          >
            Try to fix
          </button>
        </div>
      </div>
    </div>
  );
}
