import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  MAX_META_DESCRIPTION_LENGTH,
  MAX_META_TITLE_LENGTH,
  createPageMetadata,
} from "@/lib/seo";

function getMdxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? getMdxFiles(entryPath)
      : entry.name.endsWith(".mdx")
        ? [entryPath]
        : [];
  });
}

function getFrontmatterValue(source: string, key: string) {
  return source.match(new RegExp(`^${key}: (.+)$`, "m"))?.[1]?.trim();
}

describe("documentation SEO", () => {
  it("keeps every docs title and description unique and within limits", () => {
    const docsDirectory = path.join(process.cwd(), "content", "docs");
    const metadata = getMdxFiles(docsDirectory).map((file) => {
      const source = readFileSync(file, "utf8");
      const title = getFrontmatterValue(source, "title");
      const description = getFrontmatterValue(source, "description");
      expect(title, file).toBeTruthy();
      expect(description, file).toBeTruthy();

      return createPageMetadata({
        title: title!,
        description: description!,
        path: `/docs/${path.relative(docsDirectory, file).replace(/(?:\/index)?\.mdx$/, "")}`,
        type: "article",
      });
    });
    const titles = metadata.map(
      (item) => (item.title as { absolute: string }).absolute,
    );
    const descriptions = metadata.map((item) => item.description as string);

    expect(new Set(titles).size).toBe(metadata.length);
    expect(new Set(descriptions).size).toBe(metadata.length);
    expect(titles.every((title) => title.length <= MAX_META_TITLE_LENGTH)).toBe(
      true,
    );
    expect(
      descriptions.every(
        (description) => description.length <= MAX_META_DESCRIPTION_LENGTH,
      ),
    ).toBe(true);
  });
});
