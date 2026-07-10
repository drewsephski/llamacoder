import type { ReactNode } from "react";
import type { Folder, Node, Root } from "fumadocs-core/page-tree";

export type DocsNavItem = {
  title: string;
  href: string;
};

export type DocsNavSection = {
  title: string;
  items: DocsNavItem[];
};

function nodeLabel(value: ReactNode, fallback: string) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function collectFolderItems(folder: Folder): DocsNavItem[] {
  const items: DocsNavItem[] = [];

  if (folder.index) {
    items.push({
      title: nodeLabel(folder.index.name, "Overview"),
      href: folder.index.url,
    });
  }

  for (const child of folder.children) {
    if (child.type === "page") {
      items.push({
        title: nodeLabel(child.name, child.url),
        href: child.url,
      });
    } else if (child.type === "folder") {
      items.push(...collectFolderItems(child));
    }
  }

  return items;
}

export function buildDocsNavigation(tree: Root): DocsNavSection[] {
  const overview: DocsNavItem[] = [];
  const sections: DocsNavSection[] = [];

  for (const node of tree.children as Node[]) {
    if (node.type === "page") {
      overview.push({
        title: nodeLabel(node.name, node.url),
        href: node.url,
      });
      continue;
    }

    if (node.type === "folder") {
      const items = collectFolderItems(node);
      if (items.length > 0) {
        sections.push({
          title: nodeLabel(node.name, "Guides"),
          items,
        });
      }
    }
  }

  return overview.length > 0
    ? [{ title: "Start here", items: overview }, ...sections]
    : sections;
}
