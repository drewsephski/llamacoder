import "server-only";

import { buildBuildPassport } from "@/features/verification/build-passport";
import { getPrisma } from "@/lib/prisma";

type PassportMessage = Parameters<typeof buildBuildPassport>[0]["message"];

export async function getBuildPassportForMessage(message: PassportMessage) {
  const prisma = getPrisma();
  const [runtimeEvidence, exportEvidence] = await Promise.all([
    prisma.runtimeVerification.findFirst({
      where: { messageId: message.id },
      orderBy: { createdAt: "desc" },
      select: { status: true, report: true, createdAt: true },
    }),
    prisma.exportArtifact.findFirst({
      where: { messageId: message.id },
      orderBy: { createdAt: "desc" },
      select: {
        status: true,
        report: true,
        fileCount: true,
        createdAt: true,
      },
    }),
  ]);

  return buildBuildPassport({ message, runtimeEvidence, exportEvidence });
}
