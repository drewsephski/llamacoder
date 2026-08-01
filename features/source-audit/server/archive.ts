import "server-only";

import JSZip from "jszip";

import type { AuditableSourceFile } from "@/features/source-audit/contracts";

export const MAX_AUDIT_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_GITHUB_ARCHIVE_BYTES = 25 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 12 * 1024 * 1024;
const MAX_FILE_BYTES = 750 * 1024;
const MAX_FILES = 600;
const ALLOWED_FILE_PATTERN =
  /(?:^|\/)(?:\.env\.example|[^/]+\.(?:[cm]?[jt]sx?|css|scss|json|html|md|toml|ya?ml|lock))$/i;
const IGNORED_SEGMENT_PATTERN =
  /(?:^|\/)(?:node_modules|\.git|\.next|dist|build|coverage|public\/assets)(?:\/|$)/i;

export async function readSourceArchive(
  data: ArrayBuffer,
  {
    maxArchiveBytes = MAX_AUDIT_UPLOAD_BYTES,
  }: { maxArchiveBytes?: number } = {},
) {
  if (data.byteLength === 0 || data.byteLength > maxArchiveBytes) {
    throw new SourceArchiveError(
      `Archive must be a non-empty ZIP no larger than ${formatMegabytes(maxArchiveBytes)} MB.`,
      413,
    );
  }

  let archive: JSZip;
  try {
    archive = await JSZip.loadAsync(data);
  } catch {
    throw new SourceArchiveError(
      "The uploaded file is not a readable ZIP.",
      400,
    );
  }

  const entries = Object.values(archive.files).filter(
    (entry) =>
      !entry.dir &&
      isSafePath(entry.name) &&
      ALLOWED_FILE_PATTERN.test(entry.name) &&
      !IGNORED_SEGMENT_PATTERN.test(entry.name),
  );
  if (entries.length === 0) {
    throw new SourceArchiveError(
      "No supported web project files were found in the ZIP.",
      400,
    );
  }
  const files: AuditableSourceFile[] = [];
  let extractedBytes = 0;
  const prioritizedEntries = entries.toSorted(
    (left, right) =>
      getEntryPriority(left.name) - getEntryPriority(right.name) ||
      left.name.localeCompare(right.name),
  );
  for (const entry of prioritizedEntries) {
    if (files.length >= MAX_FILES) break;
    const declaredSize = getDeclaredUncompressedSize(entry);
    if (declaredSize > MAX_FILE_BYTES) continue;
    if (
      declaredSize > 0 &&
      extractedBytes + declaredSize > MAX_UNCOMPRESSED_BYTES
    ) {
      continue;
    }
    const content = await entry.async("string");
    const bytes = new TextEncoder().encode(content).byteLength;
    if (
      bytes > MAX_FILE_BYTES ||
      extractedBytes + bytes > MAX_UNCOMPRESSED_BYTES
    )
      continue;
    extractedBytes += bytes;
    files.push({ path: entry.name, content, bytes });
  }

  if (files.length === 0) {
    throw new SourceArchiveError(
      "The supported files in this archive are too large to inspect safely.",
      413,
    );
  }
  return {
    files,
    inspection: {
      eligibleFiles: entries.length,
      inspectedFiles: files.length,
      skippedFiles: entries.length - files.length,
    },
  };
}

export async function fetchPublicGitHubArchive(value: string) {
  const parsed = parseGitHubRepository(value);
  const repoResponse = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "Squid-Source-Audit",
      },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    },
  );
  if (!repoResponse.ok) {
    throw new SourceArchiveError(
      "That public GitHub repository could not be read.",
      repoResponse.status === 404 ? 404 : 502,
    );
  }
  const repository = (await repoResponse.json()) as {
    default_branch?: unknown;
  };
  if (typeof repository.default_branch !== "string") {
    throw new SourceArchiveError(
      "GitHub did not return a default branch.",
      502,
    );
  }
  const archiveResponse = await fetch(
    `https://codeload.github.com/${parsed.owner}/${parsed.repo}/zip/refs/heads/${encodeURIComponent(repository.default_branch)}`,
    {
      headers: { "User-Agent": "Squid-Source-Audit" },
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    },
  );
  if (!archiveResponse.ok || !archiveResponse.body) {
    throw new SourceArchiveError(
      "GitHub could not create a repository ZIP.",
      502,
    );
  }
  const data = await readBoundedResponse(archiveResponse);
  return {
    data,
    label: `${parsed.owner}/${parsed.repo}`,
  };
}

async function readBoundedResponse(response: Response) {
  const contentLength = Number(response.headers.get("content-length") ?? "0");
  if (contentLength > MAX_GITHUB_ARCHIVE_BYTES) {
    throw new SourceArchiveError(
      `Repository ZIP is larger than ${formatMegabytes(MAX_GITHUB_ARCHIVE_BYTES)} MB.`,
      413,
    );
  }
  const reader = response.body?.getReader();
  if (!reader)
    throw new SourceArchiveError("GitHub returned an empty ZIP.", 502);
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_GITHUB_ARCHIVE_BYTES) {
      await reader.cancel();
      throw new SourceArchiveError(
        `Repository ZIP is larger than ${formatMegabytes(MAX_GITHUB_ARCHIVE_BYTES)} MB.`,
        413,
      );
    }
    chunks.push(value);
  }
  const output = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output.buffer;
}

function parseGitHubRepository(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new SourceArchiveError("Enter a complete public GitHub URL.", 400);
  }
  if (url.protocol !== "https:" || url.hostname !== "github.com") {
    throw new SourceArchiveError(
      "Only public github.com repositories are supported.",
      400,
    );
  }
  const [owner, rawRepo] = url.pathname.split("/").filter(Boolean);
  const repo = rawRepo?.replace(/\.git$/i, "");
  const segmentPattern = /^[A-Za-z0-9_.-]{1,100}$/;
  if (
    !owner ||
    !repo ||
    !segmentPattern.test(owner) ||
    !segmentPattern.test(repo)
  ) {
    throw new SourceArchiveError(
      "Enter a GitHub repository URL, not a file URL.",
      400,
    );
  }
  return { owner, repo };
}

function isSafePath(path: string) {
  return (
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !path.split("/").includes("..") &&
    !path.includes("\0")
  );
}

function getDeclaredUncompressedSize(entry: JSZip.JSZipObject) {
  const internal = entry as JSZip.JSZipObject & {
    _data?: { uncompressedSize?: unknown };
  };
  return typeof internal._data?.uncompressedSize === "number"
    ? internal._data.uncompressedSize
    : 0;
}

function getEntryPriority(path: string) {
  const normalized = path.toLowerCase();
  const basename = normalized.split("/").at(-1) ?? normalized;
  if (
    basename === "package.json" ||
    basename === ".env.example" ||
    /^(?:pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?)$/.test(
      basename,
    )
  ) {
    return 0;
  }
  if (
    /(?:^|\/)(?:src\/main\.[jt]sx?|src\/app\.[jt]sx?|app\/page\.tsx|pages\/index\.tsx|index\.html)$/.test(
      normalized,
    )
  ) {
    return 1;
  }
  if (/\.[cm]?[jt]sx?$/.test(normalized)) return 2;
  if (/\.(?:css|scss|html)$/.test(normalized)) return 3;
  return 4;
}

function formatMegabytes(bytes: number) {
  return bytes / (1024 * 1024);
}

export class SourceArchiveError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "SourceArchiveError";
  }
}
