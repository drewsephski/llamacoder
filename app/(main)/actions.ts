"use server";

// Compatibility entrypoint for older imports. Business logic belongs to the
// feature-owned action modules below; new callers should import them directly.
export {
  createAgentAssistantMessage,
  createAgentUserMessage,
} from "@/features/generation/server/agent-actions";
export {
  createFreeRepairAssistantMessage,
  createMessage,
  createPreviewRepairMessage,
  releaseReservedCreditHold,
  restoreVersionAsCheckpoint,
} from "@/features/generation/server/actions";
export {
  deleteProject,
  duplicateProject,
  renameProject,
  saveProject,
} from "@/features/projects/server/actions";
