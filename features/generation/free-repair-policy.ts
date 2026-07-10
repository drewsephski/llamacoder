type RepairPolicyMessage = {
  role: string;
  files: unknown;
};

type RepairRequestMetadata = {
  kind?: string;
  sourceMessageId?: string;
};

export const MAX_FREE_REPAIRS_PER_SOURCE_VERSION = 1;

export function assertFreeRepairAvailable(
  messages: RepairPolicyMessage[],
  sourceMessageId: string,
) {
  const repairRequestsForSource = messages.filter((message) => {
    if (message.role !== "user" || !message.files) return false;
    if (typeof message.files !== "object" || Array.isArray(message.files)) {
      return false;
    }

    const metadata = message.files as RepairRequestMetadata;
    return (
      (metadata.kind === "preview_repair_request" ||
        metadata.kind === "preview_repair") &&
      metadata.sourceMessageId === sourceMessageId
    );
  }).length;

  if (repairRequestsForSource >= MAX_FREE_REPAIRS_PER_SOURCE_VERSION) {
    throw new Error(
      "This version has already used its included preview repair. Create a new checkpoint before requesting another free repair.",
    );
  }
}
