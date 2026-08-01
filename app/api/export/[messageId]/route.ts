import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { auth } from "@/lib/auth";
import { buildExportBundle, getExportFilename } from "@/lib/export-bundle";
import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { getPrisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { recordOperationalEvent } from "@/lib/observability";
import { getErrorMessage } from "@/features/shared/errors";
import {
  canAccessPublicArtifact,
  resolvePublicArtifact,
} from "@/features/public-artifacts/server/access";
import { getBuildPassportForMessage } from "@/features/verification/server/build-passport";

type RouteContext = {
  params: Promise<{ messageId: string }>;
};

async function getExportableMessage(messageId: string) {
  const prisma = getPrisma();
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { chat: true },
  });

  if (!message) return null;

  const files = getMessageGeneratedFiles(message);

  if (files.length === 0) return null;

  return { message, files };
}

async function assertExportAccess(chatUserId: string | null) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!chatUserId || session?.user.id !== chatUserId) {
    return {
      ok: false as const,
      session,
      response: NextResponse.json(
        { error: "FORBIDDEN", message: "You can only export your own project" },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, session };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { messageId: reference } = await params;
    const requestUrl = new URL(_request.url);
    const isStarterDownload = requestUrl.searchParams.get("starter") === "1";

    if (isStarterDownload) {
      const artifact = await resolvePublicArtifact(reference);
      if (artifact && canAccessPublicArtifact(artifact, "starter_download")) {
        const files = getMessageGeneratedFiles(artifact.message);
        if (files.length === 0) {
          return NextResponse.json(
            {
              error: "NOT_FOUND",
              message: "Exportable generated app not found",
            },
            { status: 404 },
          );
        }

        return createZipResponse(
          buildStarterBundle({
            appTitle: artifact.message.chat.title,
            prompt: artifact.message.chat.prompt,
            messageId: artifact.message.id,
            publicReference: artifact.token ?? artifact.message.id,
            requestUrl,
          }),
          `${artifact.message.chat.title.replace(/[^a-zA-Z0-9]/g, "-")}-squid-starter.zip`,
        );
      }
    }

    const exportable = await getExportableMessage(reference);

    if (!exportable) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Exportable generated app not found" },
        { status: 404 },
      );
    }

    const access = await assertExportAccess(exportable.message.chat.userId);
    if (!access.ok) return access.response;

    if (access.session?.user.id) {
      const rateLimit = await consumeRateLimit({
        userId: access.session.user.id,
        operation: "export",
        limit: 20,
        windowMs: 10 * 60 * 1000,
      });

      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: "Too many export requests. Please try again shortly." },
          { status: 429 },
        );
      }
    }

    if (isStarterDownload) {
      return createZipResponse(
        buildStarterBundle({
          appTitle: exportable.message.chat.title,
          prompt: exportable.message.chat.prompt,
          messageId: exportable.message.id,
          publicReference: exportable.message.id,
          requestUrl,
        }),
        `${exportable.message.chat.title.replace(/[^a-zA-Z0-9]/g, "-")}-squid-starter.zip`,
      );
    }

    const bundle = buildExportBundle(exportable.files);
    const passport = await getBuildPassportForMessage(exportable.message);
    return createZipResponse(
      [
        ...bundle.files,
        {
          path: "squid-build-passport.json",
          content: JSON.stringify(passport, null, 2),
        },
      ],
      getExportFilename(bundle.appTitle),
    );
  } catch (error: unknown) {
    await recordOperationalEvent({
      name: "export_failed",
      level: "error",
      operation: "export_download",
      status: "error",
      error,
    });

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to export project") },
      { status: 500 },
    );
  }
}

async function createZipResponse(
  files: Array<{ path: string; content: string }>,
  filename: string,
) {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  const content = await zip.generateAsync({ type: "arraybuffer" });

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function buildStarterBundle({
  appTitle,
  prompt,
  messageId,
  publicReference,
  requestUrl,
}: {
  appTitle: string;
  prompt: string;
  messageId: string;
  publicReference: string;
  requestUrl: URL;
}) {
  const origin = requestUrl.origin;
  const shareUrl = `${origin}/share/v2/${publicReference}`;
  const remixUrl = `${origin}/?ref=${publicReference}`;

  return [
    {
      path: "README.md",
      content: [
        `# ${appTitle} starter`,
        "",
        "This starter was shared from Squid Agent.",
        "",
        "It intentionally does not include the full generated source. Open the shared app to remix it or create your own version.",
        "",
        `- Shared app: ${shareUrl}`,
        `- Remix in Squid: ${remixUrl}`,
      ].join("\n"),
    },
    {
      path: "squid-starter.json",
      content: JSON.stringify(
        {
          appTitle,
          prompt,
          messageId,
          publicReference,
          shareUrl,
          remixUrl,
          source: "Squid",
          kind: "share_starter",
        },
        null,
        2,
      ),
    },
  ];
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const { messageId } = await params;
    const exportable = await getExportableMessage(messageId);

    if (!exportable) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Exportable generated app not found" },
        { status: 404 },
      );
    }

    const access = await assertExportAccess(exportable.message.chat.userId);
    if (!access.ok) return access.response;

    if (access.session?.user.id) {
      const rateLimit = await consumeRateLimit({
        userId: access.session.user.id,
        operation: "export",
        limit: 20,
        windowMs: 10 * 60 * 1000,
      });

      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: "Too many export requests. Please try again shortly." },
          { status: 429 },
        );
      }
    }

    const prisma = getPrisma();
    const bundle = buildExportBundle(exportable.files);
    const artifact = await prisma.exportArtifact.create({
      data: {
        messageId: exportable.message.id,
        chatId: exportable.message.chatId,
        userId: access.session?.user.id ?? exportable.message.chat.userId,
        appTitle: bundle.appTitle,
        status: bundle.verificationReport.status,
        fileCount: bundle.manifest.files.length,
        manifest: bundle.manifest,
        report: bundle.verificationReport,
      },
    });
    const passport = await getBuildPassportForMessage(exportable.message);

    return NextResponse.json({
      artifactId: artifact.id,
      appTitle: bundle.appTitle,
      status: bundle.verificationReport.status,
      manifest: bundle.manifest,
      report: bundle.verificationReport,
      passport,
      downloadUrl: `/api/export/${messageId}`,
    });
  } catch (error: unknown) {
    await recordOperationalEvent({
      name: "export_failed",
      level: "error",
      operation: "export_artifact",
      status: "error",
      error,
    });

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to create export artifact") },
      { status: 500 },
    );
  }
}
