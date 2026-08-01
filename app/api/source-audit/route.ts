import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { consumeRateLimit } from "@/features/security/server/rate-limit";
import { analyzeSourceBundle } from "@/features/source-audit/analyze";
import {
  fetchPublicGitHubArchive,
  MAX_AUDIT_ARCHIVE_BYTES,
  readSourceArchive,
  SourceArchiveError,
} from "@/features/source-audit/server/archive";

const githubRequestSchema = z.object({
  githubUrl: z.string().trim().url().max(300),
});

export async function POST(request: NextRequest) {
  try {
    const subject =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";
    const rateLimit = await consumeRateLimit({
      userId: `source-audit:${subject}`,
      operation: "source_audit",
      limit: 8,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: "Audit limit reached. Try again later.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    let archive: ArrayBuffer;
    let source: { kind: "zip" | "github"; label: string };

    if (contentType.includes("application/json")) {
      const parsed = githubRequestSchema.safeParse(
        await request.json().catch(() => null),
      );
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "INVALID_REQUEST",
            message: "Enter a valid public GitHub repository URL.",
          },
          { status: 400 },
        );
      }
      const github = await fetchPublicGitHubArchive(parsed.data.githubUrl);
      archive = github.data;
      source = { kind: "github", label: github.label };
    } else {
      const declaredLength = Number(
        request.headers.get("content-length") ?? "0",
      );
      if (declaredLength > MAX_AUDIT_ARCHIVE_BYTES + 256_000) {
        throw new SourceArchiveError(
          "Upload is larger than the 4 MB limit.",
          413,
        );
      }
      const formData = await request.formData();
      const file = formData.get("archive");
      if (
        !(file instanceof File) ||
        !file.name.toLowerCase().endsWith(".zip")
      ) {
        return NextResponse.json(
          {
            error: "INVALID_REQUEST",
            message: "Choose a ZIP archive to audit.",
          },
          { status: 400 },
        );
      }
      if (file.size > MAX_AUDIT_ARCHIVE_BYTES) {
        throw new SourceArchiveError(
          "Archive is larger than the 4 MB limit.",
          413,
        );
      }
      archive = await file.arrayBuffer();
      source = { kind: "zip", label: file.name };
    }

    const files = await readSourceArchive(archive);
    const report = analyzeSourceBundle({ files, source });
    return NextResponse.json(
      { report },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof SourceArchiveError) {
      return NextResponse.json(
        { error: "AUDIT_REJECTED", message: error.message },
        { status: error.status },
      );
    }
    console.error("[Source Audit] Failed:", error);
    return NextResponse.json(
      { error: "AUDIT_FAILED", message: "Squid could not audit this project." },
      { status: 500 },
    );
  }
}
