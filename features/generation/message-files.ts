import type { ProjectMessage } from "@/features/projects/contracts";
import {
  normalizeGeneratedFiles,
  parseStoredGeneratedFiles,
  type GeneratedFile,
} from "@/lib/generated-files";
import { extractAllCodeBlocks } from "@/lib/utils";

export function getMessageGeneratedFiles(
  message: Pick<ProjectMessage, "content" | "files">,
): GeneratedFile[] {
  const storedFiles = parseStoredGeneratedFiles(message.files);

  return normalizeGeneratedFiles(
    storedFiles.length > 0
      ? storedFiles
      : extractAllCodeBlocks(message.content),
  );
}
