import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import {
  MAX_AUDIT_UPLOAD_BYTES,
  MAX_GITHUB_ARCHIVE_BYTES,
  readSourceArchive,
  SourceArchiveError,
} from "@/features/source-audit/server/archive";

describe("readSourceArchive", () => {
  it("accepts a GitHub archive above the direct-upload limit while ignoring assets", async () => {
    const archive = new JSZip();
    archive.file(
      "project/package.json",
      JSON.stringify({ scripts: { build: "vite build" } }),
    );
    archive.file(
      "project/src/App.tsx",
      "export default function App(){return <main>Ready</main>}",
    );
    archive.file(
      "project/public/assets/demo.bin",
      new Uint8Array(MAX_AUDIT_UPLOAD_BYTES + 1024),
    );
    const data = await archive.generateAsync({
      type: "arraybuffer",
      compression: "STORE",
    });

    expect(data.byteLength).toBeGreaterThan(MAX_AUDIT_UPLOAD_BYTES);
    await expect(readSourceArchive(data)).rejects.toMatchObject({
      name: "SourceArchiveError",
      status: 413,
    } satisfies Partial<SourceArchiveError>);

    const { files, inspection } = await readSourceArchive(data, {
      maxArchiveBytes: MAX_GITHUB_ARCHIVE_BYTES,
    });
    expect(files.map((file) => file.path)).toEqual([
      "project/package.json",
      "project/src/App.tsx",
    ]);
    expect(inspection).toEqual({
      eligibleFiles: 2,
      inspectedFiles: 2,
      skippedFiles: 0,
    });
  });

  it("samples oversized file sets instead of rejecting the whole archive", async () => {
    const archive = new JSZip();
    archive.file(
      "project/package.json",
      JSON.stringify({ scripts: { build: "vite build" } }),
    );
    for (let index = 0; index < 605; index += 1) {
      archive.file(
        `project/src/module-${String(index).padStart(3, "0")}.ts`,
        `export const value${index} = ${index};`,
      );
    }
    const data = await archive.generateAsync({ type: "arraybuffer" });

    const result = await readSourceArchive(data);

    expect(result.files).toHaveLength(600);
    expect(result.files[0]?.path).toBe("project/package.json");
    expect(result.inspection).toEqual({
      eligibleFiles: 606,
      inspectedFiles: 600,
      skippedFiles: 6,
    });
  });
});
