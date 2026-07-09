import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { auth } from "@/lib/auth";
import { buildExportBundle, getExportFilename } from "@/lib/export-bundle";
import { normalizeGeneratedFiles } from "@/lib/generated-files";
import { getPrisma } from "@/lib/prisma";
import { extractAllCodeBlocks } from "@/lib/utils";
import { headers } from "next/headers";

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

  const files = normalizeGeneratedFiles(
    Array.isArray(message.files) && message.files.length > 0
      ? (message.files as any[])
      : extractAllCodeBlocks(message.content),
  );

  if (files.length === 0) return null;

  return { message, files };
}

async function assertExportAccess(chatUserId: string | null) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (chatUserId && session?.user.id !== chatUserId) {
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
  const { messageId } = await params;
  const exportable = await getExportableMessage(messageId);

  if (!exportable) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Exportable generated app not found" },
      { status: 404 },
    );
  }

  const requestUrl = new URL(_request.url);
  const isStarterDownload = requestUrl.searchParams.get("starter") === "1";

  if (isStarterDownload) {
    return createZipResponse(
      buildStarterBundle({
        appTitle: exportable.message.chat.title,
        prompt: exportable.message.chat.prompt,
        messageId: exportable.message.id,
        requestUrl,
      }),
      `${exportable.message.chat.title.replace(/[^a-zA-Z0-9]/g, "-")}-squid-starter.zip`,
    );
  }

  const access = await assertExportAccess(exportable.message.chat.userId);
  if (!access.ok) return access.response;

  const bundle = buildExportBundle(exportable.files);
  return createZipResponse(bundle.files, getExportFilename(bundle.appTitle));
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
  requestUrl,
}: {
  appTitle: string;
  prompt: string;
  messageId: string;
  requestUrl: URL;
}) {
  const origin = requestUrl.origin;
  const shareUrl = `${origin}/share/v2/${messageId}`;
  const remixUrl = `${origin}/?ref=${messageId}`;

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

  return NextResponse.json({
    artifactId: artifact.id,
    appTitle: bundle.appTitle,
    status: bundle.verificationReport.status,
    manifest: bundle.manifest,
    report: bundle.verificationReport,
    downloadUrl: `/api/export/${messageId}`,
  });
}
