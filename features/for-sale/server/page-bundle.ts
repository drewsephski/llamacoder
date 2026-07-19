import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { buildExportBundle } from "@/lib/export-bundle";
import { getShowcaseLanding } from "@/features/gallery/showcase-landings";
import type { ForSaleProduct } from "@/features/for-sale/types";
import { getLanguageOfFile } from "@/lib/utils";

type BundleFile = { path: string; content: string | Buffer };
const sourceExtensions = [".ts", ".tsx", ".js", ".jsx", ".css", ".json"];
const importPattern = /(?:from\s*|import\s*(?:\(\s*)?)["']([^"']+)["']/g;
const cssImportPattern = /@import\s+(?:url\()?['"]([^'"]+)['"]/g;
const publicAssetPattern =
  /["'(]((?:\/[A-Za-z0-9_@.,+~%\-/]+)\.(?:png|jpe?g|webp|svg|gif|avif|mp4|webm|woff2?|ttf|otf))["')]/gi;

function resolveSource(
  projectRoot: string,
  importer: string,
  specifier: string,
) {
  const unresolved = specifier.startsWith("@/")
    ? path.join(projectRoot, specifier.slice(2))
    : specifier.startsWith(".")
      ? path.resolve(path.dirname(importer), specifier)
      : null;
  if (!unresolved) return null;

  const candidates = [
    unresolved,
    ...sourceExtensions.map((extension) => `${unresolved}${extension}`),
    ...sourceExtensions.map((extension) =>
      path.join(unresolved, `index${extension}`),
    ),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function outputPath(projectRoot: string, sourcePath: string, entryDir: string) {
  if (sourcePath.startsWith(`${entryDir}${path.sep}`)) {
    return path.join("app", path.relative(entryDir, sourcePath));
  }
  return path.relative(projectRoot, sourcePath);
}

function buildCuratedRouteBundle(product: ForSaleProduct): BundleFile[] {
  if (!product.entryFile)
    throw new Error(`Missing entry file for ${product.key}`);
  const projectRoot = path.resolve(/* turbopackIgnore: true */ process.cwd());
  const entryPath = path.join(projectRoot, product.entryFile);
  const entryDir = path.dirname(entryPath);
  const queue = [entryPath];
  const visited = new Set<string>();
  const files: BundleFile[] = [];
  const publicAssets = new Set<string>();
  const packageNames = new Set(["next", "react", "react-dom"]);

  const recordPackage = (specifier: string) => {
    if (
      specifier.startsWith(".") ||
      specifier.startsWith("@/") ||
      specifier.startsWith("/") ||
      specifier.includes("://")
    )
      return;
    const segments = specifier.split("/");
    packageNames.add(
      specifier.startsWith("@") ? segments.slice(0, 2).join("/") : segments[0],
    );
  };

  while (queue.length > 0) {
    const sourcePath = queue.shift();
    if (!sourcePath || visited.has(sourcePath)) continue;
    visited.add(sourcePath);
    const content = readFileSync(sourcePath, "utf8");
    files.push({
      path: outputPath(projectRoot, sourcePath, entryDir),
      content,
    });

    for (const match of content.matchAll(importPattern)) {
      recordPackage(match[1]);
      const dependency = resolveSource(projectRoot, sourcePath, match[1]);
      if (dependency && !visited.has(dependency)) queue.push(dependency);
    }
    for (const match of content.matchAll(publicAssetPattern)) {
      publicAssets.add(match[1].slice(1));
    }
  }

  const globalsPath = path.join(projectRoot, "app/globals.css");
  const globals = readFileSync(globalsPath, "utf8");
  files.push({ path: "app/globals.css", content: globals });
  for (const match of globals.matchAll(publicAssetPattern)) {
    publicAssets.add(match[1].slice(1));
  }
  for (const match of globals.matchAll(cssImportPattern))
    recordPackage(match[1]);

  for (const asset of publicAssets) {
    const sourcePath = path.join(projectRoot, "public", asset);
    if (existsSync(sourcePath)) {
      files.push({
        path: path.join("public", asset),
        content: readFileSync(sourcePath),
      });
    }
  }

  const rootPackage = JSON.parse(
    readFileSync(path.join(projectRoot, "package.json"), "utf8"),
  ) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const dependencies = Object.fromEntries(
    [...packageNames].map((name) => {
      const version = rootPackage.dependencies?.[name];
      if (!version) throw new Error(`Missing package version for ${name}`);
      return [name, version];
    }),
  );
  files.push(
    {
      path: "app/layout.tsx",
      content: `import type { ReactNode } from "react";\nimport "./globals.css";\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return <html lang="en"><body>{children}</body></html>;\n}\n`,
    },
    {
      path: "package.json",
      content: JSON.stringify(
        {
          name: `squid-${product.key}`,
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
          },
          dependencies,
          devDependencies: {
            typescript: rootPackage.devDependencies?.typescript,
            "@types/node": rootPackage.devDependencies?.["@types/node"],
            "@types/react": rootPackage.devDependencies?.["@types/react"],
            "@types/react-dom":
              rootPackage.devDependencies?.["@types/react-dom"],
            postcss: rootPackage.devDependencies?.postcss,
            tailwindcss: rootPackage.devDependencies?.tailwindcss,
            "@tailwindcss/typography":
              rootPackage.devDependencies?.["@tailwindcss/typography"],
            "tailwindcss-animate":
              rootPackage.devDependencies?.["tailwindcss-animate"],
          },
        },
        null,
        2,
      ),
    },
    {
      path: "tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "ES2017",
            lib: ["dom", "dom.iterable", "esnext"],
            strict: true,
            noEmit: true,
            module: "esnext",
            moduleResolution: "bundler",
            jsx: "preserve",
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./*"] },
          },
          include: [
            "next-env.d.ts",
            "**/*.ts",
            "**/*.tsx",
            ".next/types/**/*.ts",
          ],
          exclude: ["node_modules"],
        },
        null,
        2,
      ),
    },
    {
      path: "next-env.d.ts",
      content:
        '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n',
    },
    {
      path: "postcss.config.mjs",
      content: "export default { plugins: { tailwindcss: {} } };\n",
    },
    {
      path: "tailwind.config.ts",
      content: readFileSync(
        path.join(projectRoot, "tailwind.config.ts"),
        "utf8",
      ),
    },
    {
      path: "next.config.mjs",
      content:
        'export default { images: { remotePatterns: [{ protocol: "https", hostname: "**" }] } };\n',
    },
    {
      path: "README.md",
      content: `# ${product.name}\n\nStandalone React/Next.js source licensed through Squid Agent.\n\n## Run\n\n\`\`\`bash\npnpm install\npnpm dev\n\`\`\`\n`,
    },
  );

  return files;
}

export function buildPurchasedPageBundle(
  product: ForSaleProduct,
): BundleFile[] {
  if (product.route.startsWith("/gallery/")) {
    const landing = getShowcaseLanding(product.key);
    if (!landing) throw new Error(`Missing showcase source for ${product.key}`);
    return buildExportBundle(
      landing.files.map((file) => ({
        path: file.path,
        code: file.content,
        language: getLanguageOfFile(file.path),
      })),
    ).files;
  }
  return buildCuratedRouteBundle(product);
}
