import { extractAllCodeBlocks } from "@/lib/utils";

export type GenerationRecoveryMode = "restore" | "restart";

/**
 * A persisted response is only directly restorable when it contains at least
 * one completed generated-file fence. Replaying prose or a truncated fence
 * would only send the same invalid output back through finalization.
 */
export function getGenerationRecoveryMode(
  partialText: string,
): GenerationRecoveryMode {
  return extractAllCodeBlocks(partialText).length > 0 ? "restore" : "restart";
}
