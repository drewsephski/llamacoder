"use client";

import JSZip from "jszip";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { GeneratedFile } from "@/lib/generated-files";
import { buildExportBundle, getExportFilename } from "@/lib/export-bundle";
import {
  exportVerificationResponseSchema,
  type ExportVerificationStatus,
} from "@/features/projects/contracts";
import { fetchJson } from "@/features/shared/client/http";
import { getErrorMessage } from "@/features/shared/errors";

export function useProjectExport({
  appTitle,
  files,
  messageId,
}: {
  appTitle: string;
  files: GeneratedFile[];
  messageId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<ExportVerificationStatus | null>(null);

  const download = useCallback(async () => {
    if (files.length === 0) return;

    const zip = new JSZip();
    const bundle = buildExportBundle(files);

    if (messageId) {
      setIsVerifying(true);
      try {
        const result = await fetchJson(
          `/api/export/${messageId}`,
          exportVerificationResponseSchema,
          { method: "POST" },
        );
        setVerificationStatus(result.status);
        toast.success("Export verified by Squid", {
          description: `Status: ${result.status}`,
        });
      } catch (error: unknown) {
        toast.warning("Export downloaded without saved verification", {
          description: getErrorMessage(
            error,
            "Unable to persist verification.",
          ),
        });
      } finally {
        setIsVerifying(false);
      }
    }

    for (const file of bundle.files) {
      zip.file(file.path, file.content);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const filename = getExportFilename(bundle.appTitle || appTitle);
    const url = URL.createObjectURL(content);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    toast.success("Files downloaded!", {
      description: `${files.length} source files plus export metadata downloaded as ${filename}`,
    });
    setIsOpen(false);
  }, [appTitle, files, messageId]);

  const openDeployProvider = useCallback((provider: "vercel" | "netlify") => {
    const isVercel = provider === "vercel";
    window.open(
      isVercel ? "https://vercel.com/new" : "https://app.netlify.com/start",
      "_blank",
      "noopener,noreferrer",
    );
    toast.info(`Opened ${isVercel ? "Vercel" : "Netlify"}`, {
      description:
        "Download the repo from Squid, then import it into the deploy provider.",
    });
  }, []);

  return {
    download,
    isOpen,
    isVerifying,
    openDeployProvider,
    setIsOpen,
    verificationStatus,
  };
}
