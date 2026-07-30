import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
  copyFile,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Browser, type Page } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const launchDirectory = path.resolve(scriptDirectory, "..");
const repositoryRoot = path.resolve(launchDirectory, "..");
const rendererConfig = path.join(launchDirectory, "renderer/vite.config.ts");
const rendererPort = Number(process.env.LAUNCH_RENDERER_PORT ?? "4178");
const productPort = Number(process.env.LAUNCH_PRODUCT_PORT ?? "3188");
const rendererBaseUrl =
  process.env.LAUNCH_RENDERER_URL ?? `http://127.0.0.1:${rendererPort}`;
const productBaseUrl =
  process.env.LAUNCH_PRODUCT_BASE_URL ?? `http://localhost:${productPort}`;
const screenshotsDirectory = path.join(launchDirectory, "screenshots");
const galleryDirectory = path.join(launchDirectory, "gallery");
const thumbnailDirectory = path.join(launchDirectory, "thumbnail");
const qaDirectory = path.join(launchDirectory, "qa");
const exportDirectory = path.join(launchDirectory, "exports/product-hunt");
const temporaryDirectory = path.join(launchDirectory, ".tmp-export");

const galleryFiles = [
  "01-complete-workflow.png",
  "02-plan-mode.png",
  "03-project-aware-editing.png",
  "04-verification.png",
  "05-model-choice.png",
  "06-code-ownership.png",
  "07-real-applications.png",
  "08-founder-story.png",
] as const;

const productCaptureFiles = [
  "model-picker.png",
  "example-prompt.png",
  "example-plan.png",
  "example-files.png",
  "example-quality.png",
] as const;

type ManifestAsset = {
  id: string;
  path: string;
  format: "png" | "gif" | "svg";
  width: number;
  height: number;
  byteSize: number;
  sha256: string;
  sourceType: string;
  requiresRealProductionData: boolean;
  productionDataNote?: string;
};

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForUrl(url: string, process?: ChildProcess) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (process?.exitCode !== null && process?.exitCode !== undefined) {
      throw new Error(`Server process exited before ${url} was ready.`);
    }
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) return;
    } catch {
      // Server is still starting.
    }
    await wait(500);
  }
  throw new Error(`Timed out waiting for ${url}.`);
}

async function startRenderer(): Promise<ViteDevServer | null> {
  if (process.env.LAUNCH_RENDERER_URL) {
    await waitForUrl(rendererBaseUrl);
    return null;
  }
  const server = await createServer({
    configFile: rendererConfig,
    server: { host: "127.0.0.1", port: rendererPort, strictPort: true },
  });
  await server.listen();
  await waitForUrl(`${rendererBaseUrl}/launch-render/thumbnail`);
  return server;
}

async function startProduct(): Promise<ChildProcess | null> {
  if (process.env.LAUNCH_PRODUCT_BASE_URL) {
    await waitForUrl(`${productBaseUrl}/example`);
    return null;
  }
  const processHandle = spawn("pnpm", ["dev", "--port", String(productPort)], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      BETTER_AUTH_URL: productBaseUrl,
      NEXT_PUBLIC_APP_URL: productBaseUrl,
      NEXT_PUBLIC_BETTER_AUTH_URL: productBaseUrl,
      BETTER_AUTH_TRUSTED_ORIGINS: productBaseUrl,
      NEXT_PUBLIC_BETTER_AUTH_TRUSTED_ORIGINS: productBaseUrl,
      E2E_SKIP_EMAIL_DELIVERY: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let recentOutput = "";
  const remember = (chunk: Buffer) => {
    recentOutput = `${recentOutput}${chunk.toString()}`.slice(-8_000);
  };
  processHandle.stdout?.on("data", remember);
  processHandle.stderr?.on("data", remember);
  try {
    await waitForUrl(`${productBaseUrl}/example`, processHandle);
  } catch (error) {
    throw new Error(`${String(error)}\n${recentOutput}`);
  }
  return processHandle;
}

function resolveChromeExecutable() {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (configured && existsSync(configured)) return configured;
  const bundled = chromium.executablePath();
  if (existsSync(bundled)) return bundled;
  const systemChrome =
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (existsSync(systemChrome)) return systemChrome;
  throw new Error(
    "No Chromium executable found. Run `pnpm exec playwright install chromium` or set PLAYWRIGHT_CHROMIUM_EXECUTABLE.",
  );
}

async function waitForStableLayout(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
  await page.waitForTimeout(150);
}

async function captureRendererRoute({
  browser,
  route,
  outputPath,
  width,
  height,
  deviceScaleFactor = 1,
}: {
  browser: Browser;
  route: string;
  outputPath: string;
  width: number;
  height: number;
  deviceScaleFactor?: number;
}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${rendererBaseUrl}${route}`, { waitUntil: "networkidle" });
  await page
    .locator('[data-render-ready="true"]')
    .first()
    .waitFor({ state: "visible" });
  await waitForStableLayout(page);
  await page.screenshot({
    path: outputPath,
    type: "png",
    animations: "disabled",
  });
  await context.close();
}

async function captureProductScreenshots(browser: Browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  await page.goto(productBaseUrl, { waitUntil: "networkidle" });
  const modelTrigger = page.locator(".model-trigger").first();
  await modelTrigger.waitFor({ state: "visible" });
  await waitForStableLayout(page);
  await page.screenshot({
    path: path.join(screenshotsDirectory, "model-picker.png"),
    type: "png",
    animations: "disabled",
  });

  await page.goto(`${productBaseUrl}/example`, { waitUntil: "networkidle" });
  for (const tab of ["Prompt", "Plan", "Files", "Quality"] as const) {
    const tabButton = page.getByRole("button", {
      name: new RegExp(`^${tab}\\b`),
    });
    await tabButton.click();
    await tabButton.waitFor({ state: "visible" });
    await page.waitForFunction(
      (tabName) =>
        Array.from(
          document.querySelectorAll<HTMLButtonElement>(
            'nav[aria-label="Example workspace sections"] button',
          ),
        ).some(
          (button) =>
            button.textContent?.trim().startsWith(tabName) &&
            button.getAttribute("aria-pressed") === "true",
        ),
      tab,
    );
    await waitForStableLayout(page);
    await page.screenshot({
      path: path.join(screenshotsDirectory, `example-${tab.toLowerCase()}.png`),
      type: "png",
      animations: "disabled",
    });
  }

  await context.close();
}

async function captureDemoScreenshots(browser: Browser) {
  await captureRendererRoute({
    browser,
    route: "/launch-render/demo/fieldflow",
    outputPath: path.join(screenshotsDirectory, "fieldflow-app.png"),
    width: 1270,
    height: 760,
  });
  await captureRendererRoute({
    browser,
    route: "/launch-render/demo/fieldflow?state=updated",
    outputPath: path.join(screenshotsDirectory, "fieldflow-app-updated.png"),
    width: 1270,
    height: 760,
  });
  await captureRendererRoute({
    browser,
    route: "/launch-render/demo/launchops",
    outputPath: path.join(screenshotsDirectory, "launchops-app.png"),
    width: 1270,
    height: 760,
  });
}

async function generateAnimatedThumbnail(browser: Browser) {
  const framesDirectory = path.join(temporaryDirectory, "thumbnail-frames");
  await mkdir(framesDirectory, { recursive: true });
  for (let frame = 0; frame < 30; frame += 1) {
    await captureRendererRoute({
      browser,
      route: `/launch-render/thumbnail?frame=${frame}`,
      outputPath: path.join(
        framesDirectory,
        `frame-${String(frame).padStart(2, "0")}.png`,
      ),
      width: 240,
      height: 240,
    });
  }
  await runCommand("ffmpeg", [
    "-y",
    "-framerate",
    "12",
    "-i",
    path.join(framesDirectory, "frame-%02d.png"),
    "-filter_complex",
    "fps=12,scale=240:240:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3",
    "-loop",
    "0",
    path.join(thumbnailDirectory, "squid-product-hunt-thumbnail.gif"),
  ]);
  const gifStat = await stat(
    path.join(thumbnailDirectory, "squid-product-hunt-thumbnail.gif"),
  );
  if (gifStat.size >= 3 * 1024 * 1024) {
    throw new Error(
      `Animated thumbnail is ${gifStat.size} bytes, which exceeds Product Hunt's 3 MB limit.`,
    );
  }
}

async function runCommand(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const processHandle = spawn(command, args, {
      cwd: repositoryRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    processHandle.stdout.on("data", (chunk: Buffer) => {
      output = `${output}${chunk.toString()}`.slice(-12_000);
    });
    processHandle.stderr.on("data", (chunk: Buffer) => {
      output = `${output}${chunk.toString()}`.slice(-12_000);
    });
    processHandle.on("error", reject);
    processHandle.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code}.\n${output}`));
    });
  });
}

async function generateGalleryContactSheet(browser: Browser) {
  const cards = await Promise.all(
    galleryFiles.map(async (filename, index) => {
      const data = await readFile(path.join(galleryDirectory, filename));
      return `<figure><img src="data:image/png;base64,${data.toString("base64")}" alt="Gallery ${index + 1}"/><figcaption>${String(index + 1).padStart(2, "0")} ${filename.replace(/^\d+-|\.png$/g, "").replaceAll("-", " ")}</figcaption></figure>`;
    }),
  );
  const context = await browser.newContext({
    viewport: { width: 1270, height: 760 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;padding:28px 34px;background:#eef2f6;color:#102038;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px}h1{margin:0;font-size:24px;letter-spacing:-.03em}header span{color:#60748b;font-size:12px}
    main{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}figure{margin:0;overflow:hidden;border:1px solid #cbd6e2;border-radius:10px;background:#fff;box-shadow:0 8px 20px rgba(24,47,77,.09)}img{display:block;width:100%;aspect-ratio:1270/760;object-fit:cover}figcaption{padding:10px 11px;color:#53687f;font-size:10px;text-transform:capitalize}
  </style></head><body><header><h1>Squid Product Hunt gallery</h1><span>8 final frames at 1270 × 760</span></header><main>${cards.join("")}</main></body></html>`);
  await page.screenshot({
    path: path.join(galleryDirectory, "product-hunt-gallery-contact-sheet.png"),
    type: "png",
  });
  await context.close();
}

function readPngDimensions(buffer: Buffer) {
  const signature = buffer.subarray(1, 4).toString("ascii");
  if (signature !== "PNG") throw new Error("Expected a PNG file.");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function manifestAsset({
  id,
  absolutePath,
  expectedWidth,
  expectedHeight,
  sourceType,
  requiresRealProductionData,
  productionDataNote,
}: {
  id: string;
  absolutePath: string;
  expectedWidth: number;
  expectedHeight: number;
  sourceType: string;
  requiresRealProductionData: boolean;
  productionDataNote?: string;
}): Promise<ManifestAsset> {
  const buffer = await readFile(absolutePath);
  const dimensions = readPngDimensions(buffer);
  if (
    dimensions.width !== expectedWidth ||
    dimensions.height !== expectedHeight
  ) {
    throw new Error(
      `${absolutePath} is ${dimensions.width}x${dimensions.height}, expected ${expectedWidth}x${expectedHeight}.`,
    );
  }
  return {
    id,
    path: path.relative(repositoryRoot, absolutePath),
    format: "png",
    width: dimensions.width,
    height: dimensions.height,
    byteSize: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    sourceType,
    requiresRealProductionData,
    ...(productionDataNote ? { productionDataNote } : {}),
  };
}

async function manifestSourceAsset({
  id,
  absolutePath,
  format,
  width,
  height,
  sourceType,
}: {
  id: string;
  absolutePath: string;
  format: "gif" | "svg";
  width: number;
  height: number;
  sourceType: string;
}): Promise<ManifestAsset> {
  const buffer = await readFile(absolutePath);
  return {
    id,
    path: path.relative(repositoryRoot, absolutePath),
    format,
    width,
    height,
    byteSize: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    sourceType,
    requiresRealProductionData: false,
  };
}

async function writeManifest() {
  const assets: ManifestAsset[] = [];
  assets.push(
    await manifestAsset({
      id: "thumbnail",
      absolutePath: path.join(
        thumbnailDirectory,
        "squid-product-hunt-thumbnail.png",
      ),
      expectedWidth: 240,
      expectedHeight: 240,
      sourceType: "coded-react-with-existing-logo",
      requiresRealProductionData: false,
    }),
  );
  assets.push(
    await manifestSourceAsset({
      id: "thumbnail-animation",
      absolutePath: path.join(
        thumbnailDirectory,
        "squid-product-hunt-thumbnail.gif",
      ),
      format: "gif",
      width: 240,
      height: 240,
      sourceType: "coded-react-frames-and-ffmpeg",
    }),
  );
  assets.push(
    await manifestSourceAsset({
      id: "thumbnail-svg-source",
      absolutePath: path.join(
        thumbnailDirectory,
        "squid-product-hunt-thumbnail.svg",
      ),
      format: "svg",
      width: 240,
      height: 240,
      sourceType: "editable-vector-with-existing-logo",
    }),
  );
  assets.push(
    await manifestAsset({
      id: "thumbnail-source",
      absolutePath: path.join(
        thumbnailDirectory,
        "squid-product-hunt-thumbnail-source-960.png",
      ),
      expectedWidth: 960,
      expectedHeight: 960,
      sourceType: "lossless-4x-react-export",
      requiresRealProductionData: false,
    }),
  );
  const galleryMetadata = [
    ["complete-workflow", "coded-composition-and-react-demo", false, ""],
    [
      "plan-mode",
      "source-backed-representative-ui",
      true,
      "Replace representative interview and approval cards with a stable authenticated Plan Mode capture when available.",
    ],
    [
      "project-aware-editing",
      "source-backed-representative-editor-and-react-demo",
      true,
      "The editor and checkpoint state are representative; replace them with a stable authenticated project-history capture.",
    ],
    [
      "verification",
      "public-example-and-honest-status-composition",
      true,
      "Runtime, export, and integration states are intentionally not marked passed; replace with current production records before claiming success.",
    ],
    [
      "model-choice",
      "real-public-trigger-and-source-backed-model-catalog",
      false,
      "",
    ],
    [
      "code-ownership",
      "public-source-capture-and-source-backed-handoff",
      true,
      "ZIP is visible in public product UI; GitHub publishing still needs a sanitized connected-account capture.",
    ],
    [
      "real-applications",
      "react-demo-apps-and-existing-showcase-capture",
      true,
      "FieldFlow and LaunchOps are reproducible launch demo applications. LaunchOps is not a production authenticated customer project.",
    ],
    [
      "founder-story",
      "existing-founder-image-and-coded-composition",
      false,
      "",
    ],
  ] as const;
  for (let index = 0; index < galleryFiles.length; index += 1) {
    const [id, sourceType, requiresRealProductionData, productionDataNote] =
      galleryMetadata[index];
    assets.push(
      await manifestAsset({
        id,
        absolutePath: path.join(galleryDirectory, galleryFiles[index]),
        expectedWidth: 1270,
        expectedHeight: 760,
        sourceType,
        requiresRealProductionData,
        productionDataNote,
      }),
    );
  }
  assets.push(
    await manifestAsset({
      id: "gallery-contact-sheet",
      absolutePath: path.join(
        galleryDirectory,
        "product-hunt-gallery-contact-sheet.png",
      ),
      expectedWidth: 1270,
      expectedHeight: 760,
      sourceType: "generated-review-sheet",
      requiresRealProductionData: false,
    }),
  );
  assets.push(
    await manifestAsset({
      id: "thumbnail-contact-sheet",
      absolutePath: path.join(
        thumbnailDirectory,
        "squid-product-hunt-thumbnail-contact-sheet.png",
      ),
      expectedWidth: 800,
      expectedHeight: 360,
      sourceType: "generated-size-test",
      requiresRealProductionData: false,
    }),
  );

  for (const filename of productCaptureFiles) {
    if (!existsSync(path.join(screenshotsDirectory, filename))) {
      throw new Error(`Missing required product capture: ${filename}`);
    }
  }

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    renderer: "launch/renderer",
    command: "pnpm launch:export-gallery",
    exactContent: true,
    sourcePreservation: true,
    assetCount: assets.length,
    assets,
  };
  await writeFile(
    path.join(qaDirectory, "asset-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}

async function copyExports() {
  const files = [
    ...galleryFiles.map((filename) => path.join(galleryDirectory, filename)),
    path.join(galleryDirectory, "product-hunt-gallery-contact-sheet.png"),
    path.join(thumbnailDirectory, "squid-product-hunt-thumbnail.png"),
    path.join(
      thumbnailDirectory,
      "squid-product-hunt-thumbnail-source-960.png",
    ),
    path.join(
      thumbnailDirectory,
      "squid-product-hunt-thumbnail-contact-sheet.png",
    ),
    path.join(thumbnailDirectory, "squid-product-hunt-thumbnail.gif"),
    path.join(thumbnailDirectory, "squid-product-hunt-thumbnail.svg"),
    path.join(qaDirectory, "asset-manifest.json"),
  ];
  for (const source of files) {
    if (!existsSync(source))
      throw new Error(`Missing expected export: ${source}`);
    await copyFile(source, path.join(exportDirectory, path.basename(source)));
  }
}

async function main() {
  await Promise.all(
    [
      screenshotsDirectory,
      galleryDirectory,
      thumbnailDirectory,
      qaDirectory,
      exportDirectory,
      temporaryDirectory,
    ].map((directory) => mkdir(directory, { recursive: true })),
  );
  await rm(path.join(screenshotsDirectory, "chat-follow-up.png"), {
    force: true,
  });

  let renderer: ViteDevServer | null = null;
  let product: ChildProcess | null = null;
  let browser: Browser | null = null;
  try {
    renderer = await startRenderer();
    product = await startProduct();
    browser = await chromium.launch({
      executablePath: resolveChromeExecutable(),
      headless: true,
    });

    await captureProductScreenshots(browser);
    await captureDemoScreenshots(browser);

    await captureRendererRoute({
      browser,
      route: "/launch-render/thumbnail",
      outputPath: path.join(
        thumbnailDirectory,
        "squid-product-hunt-thumbnail.png",
      ),
      width: 240,
      height: 240,
    });
    await captureRendererRoute({
      browser,
      route: "/launch-render/thumbnail",
      outputPath: path.join(
        thumbnailDirectory,
        "squid-product-hunt-thumbnail-source-960.png",
      ),
      width: 240,
      height: 240,
      deviceScaleFactor: 4,
    });
    await captureRendererRoute({
      browser,
      route: "/launch-render/contact/thumbnail",
      outputPath: path.join(
        thumbnailDirectory,
        "squid-product-hunt-thumbnail-contact-sheet.png",
      ),
      width: 800,
      height: 360,
    });
    await generateAnimatedThumbnail(browser);

    for (let index = 0; index < galleryFiles.length; index += 1) {
      await captureRendererRoute({
        browser,
        route: `/launch-render/gallery/${index + 1}`,
        outputPath: path.join(galleryDirectory, galleryFiles[index]),
        width: 1270,
        height: 760,
      });
    }
    await generateGalleryContactSheet(browser);
    const manifest = await writeManifest();
    await copyExports();
    process.stdout.write(
      `Exported ${manifest.assetCount} verified PNG assets plus SVG and GIF sources to ${path.relative(repositoryRoot, exportDirectory)}.\n`,
    );
  } finally {
    await browser?.close();
    await renderer?.close();
    if (product && product.exitCode === null) product.kill("SIGTERM");
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.stack : String(error)}\n`,
  );
  process.exitCode = 1;
});
