import "server-only";

import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { IntegrationServiceError } from "@/features/integrations/server/service";
import { buildExportBundle } from "@/lib/export-bundle";
import { getPrisma } from "@/lib/prisma";

export async function getProjectExportBundle({
  projectId,
  messageId,
  userId,
}: {
  projectId: string;
  messageId: string;
  userId: string;
}) {
  const message = await getPrisma().message.findFirst({
    where: { id: messageId, chatId: projectId, chat: { userId } },
  });
  if (!message) {
    throw new IntegrationServiceError(
      "VERSION_NOT_FOUND",
      "The selected generated version was not found.",
      404,
    );
  }
  const files = getMessageGeneratedFiles(message);
  if (files.length === 0) {
    throw new IntegrationServiceError(
      "VERSION_NOT_EXPORTABLE",
      "The selected version does not contain generated files.",
      409,
    );
  }
  const bundle = buildExportBundle(files);
  if (bundle.verificationReport.status === "failed") {
    throw new IntegrationServiceError(
      "EXPORT_VERIFICATION_FAILED",
      "Fix the export verification errors before publishing or deploying.",
      409,
    );
  }
  return bundle;
}
