import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

import {
  createObjectStorageClient,
  getObjectStorageConfig,
  getObjectStorageUrl,
} from "../lib/object-storage";
import { getPrisma } from "../lib/prisma";

loadEnvConfig(process.cwd());

function option(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const captureDirectory = option("--capture-dir");
  const backupDirectory = option("--backup-dir");
  if (!captureDirectory || !backupDirectory) {
    throw new Error(
      "Provide --capture-dir and --backup-dir. Defaults to dry run; add --apply to migrate.",
    );
  }
  const apply = process.argv.includes("--apply");
  const prisma = getPrisma();
  const config = getObjectStorageConfig("NEON_GALLERY_BUCKET");
  const client = createObjectStorageClient(config);

  try {
    const manifest = z
      .array(z.object({ id: z.string(), messageId: z.string() }))
      .parse(
        JSON.parse(
          await readFile(
            path.join(captureDirectory, "gallery-before.json"),
            "utf8",
          ),
        ),
      );
    const rows = await prisma.galleryPublication.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        slug: true,
        messageId: true,
        thumbnailUrl: true,
        thumbnailStatus: true,
        thumbnailCapturedMessageId: true,
        thumbnailError: true,
        thumbnailUpdatedAt: true,
      },
      orderBy: { id: "asc" },
    });
    await mkdir(backupDirectory, { recursive: true, mode: 0o700 });
    const backupPath = path.join(
      backupDirectory,
      `gallery-before-${Date.now()}.json`,
    );
    await writeFile(backupPath, JSON.stringify(rows, null, 2), {
      mode: 0o600,
      flag: "wx",
    });
    console.log(`Saved ${rows.length} publication records to ${backupPath}`);

    let migrated = 0;
    let alreadyMigrated = 0;
    let failed = 0;
    for (const row of rows) {
      if (
        row.thumbnailUrl?.startsWith(
          `${config.endpoint}/${encodeURIComponent(config.bucket)}/`,
        )
      ) {
        alreadyMigrated++;
        continue;
      }
      try {
        // The capture manifest is the pre-migration database snapshot. Match
        // message IDs so a capture can never replace a newer published revision.
        if (
          !manifest.some(
            (entry) => entry.id === row.id && entry.messageId === row.messageId,
          )
        ) {
          throw new Error("Published revision changed after capture snapshot.");
        }
        const body = await readFile(
          path.join(captureDirectory, `${row.id}.jpg`),
        );
        if (
          body.length < 4 ||
          body.length > 800_000 ||
          body[0] !== 0xff ||
          body[1] !== 0xd8
        ) {
          throw new Error("Capture must be a nonempty JPEG under 800 KB.");
        }
        if (!apply) {
          console.log(`Ready: ${row.slug} (${body.length} bytes)`);
          continue;
        }
        const key = `squid-gallery/${row.id}/${row.messageId}-${randomUUID()}.jpg`;
        await client.send(
          new PutObjectCommand({
            Bucket: config.bucket,
            Key: key,
            Body: body,
            ContentType: "image/jpeg",
            CacheControl: "public, max-age=31536000, immutable",
          }),
        );
        // Verify the bytes before repointing the database. Failed uploads or
        // concurrent republishes leave the previous record untouched.
        const object = await client.send(
          new GetObjectCommand({ Bucket: config.bucket, Key: key }),
        );
        const downloaded = await object.Body?.transformToByteArray();
        if (!downloaded || !body.equals(Buffer.from(downloaded))) {
          throw new Error(
            "Uploaded capture failed byte-for-byte verification.",
          );
        }
        const result = await prisma.galleryPublication.updateMany({
          where: {
            id: row.id,
            messageId: row.messageId,
            thumbnailUrl: row.thumbnailUrl,
            isPublished: true,
          },
          data: {
            thumbnailUrl: getObjectStorageUrl(config, key),
            thumbnailStatus: "ready",
            thumbnailCapturedMessageId: row.messageId,
            thumbnailError: null,
            thumbnailUpdatedAt: new Date(),
          },
        });
        if (result.count !== 1)
          throw new Error(
            "Publication changed during migration; record was not modified.",
          );
        migrated++;
        console.log(`Migrated: ${row.slug}`);
      } catch (error) {
        failed++;
        console.error(
          `${row.slug}: ${error instanceof Error ? error.message : "Migration failed"}`,
        );
      }
    }
    console.log(
      JSON.stringify({
        apply,
        total: rows.length,
        migrated,
        alreadyMigrated,
        failed,
      }),
    );
    if (failed) process.exitCode = 1;
  } finally {
    client.destroy();
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Gallery storage migration failed.",
  );
  process.exitCode = 1;
});
