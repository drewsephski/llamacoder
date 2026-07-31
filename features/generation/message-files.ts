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
  if (
    message.files &&
    typeof message.files === "object" &&
    !Array.isArray(message.files) &&
    "kind" in message.files &&
    message.files.kind === "agent_response"
  ) {
    // Conversational answers may legitimately contain example code fences.
    // Their explicit metadata owns the classification; never reinterpret those
    // snippets as generated application artifacts on refresh or export.
    return [];
  }

  const storedFiles = parseStoredGeneratedFiles(message.files);

  return normalizeGeneratedFiles(
    storedFiles.length > 0
      ? storedFiles
      : extractAllCodeBlocks(message.content),
  );
}
