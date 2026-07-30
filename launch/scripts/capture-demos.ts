import { spawn } from "node:child_process";
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
const outputRoot = path.join(launchDirectory, "screenshots");
const temporaryRoot = path.join(launchDirectory, ".tmp-demo-capture");
const rendererPort = Number(process.env.LAUNCH_DEMO_PORT ?? "4179");
const baseUrl =
  process.env.LAUNCH_DEMO_URL ?? `http://127.0.0.1:${rendererPort}`;

type DemoName = "fieldflow" | "launchops" | "cinder-studio";
type CaptureAsset = {
  file: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  sha256: string;
  bytes: number;
};

type DemoSpec = {
  name: DemoName;
  routes: string[];
  homeRoute: string;
  detailRoute: string;
  interactiveRoute: string;
  prepareInteractive?: (page: Page) => Promise<void>;
  record: (page: Page) => Promise<void>;
};

const demos: DemoSpec[] = [
  {
    name: "fieldflow",
    routes: [
      "/launch-demo/fieldflow",
      "/launch-demo/fieldflow/quote",
      "/launch-demo/fieldflow/dashboard",
      "/launch-demo/fieldflow/customer",
    ],
    homeRoute: "/launch-demo/fieldflow",
    detailRoute: "/launch-demo/fieldflow/dashboard",
    interactiveRoute: "/launch-demo/fieldflow/quote?demoState=verified",
    record: async (page) => {
      await page.goto(`${baseUrl}/launch-demo/fieldflow`, {
        waitUntil: "networkidle",
      });
      await ready(page);
      await page.waitForTimeout(1800);
      await page.getByRole("button", { name: "Thu 1:30 PM" }).click();
      await page.waitForTimeout(900);
      await page.getByRole("button", { name: /Hold this time/ }).click();
      await page.waitForTimeout(2200);
      await page.goto(`${baseUrl}/launch-demo/fieldflow/dashboard`, {
        waitUntil: "networkidle",
      });
      await ready(page);
      await page.getByRole("textbox", { name: "Search leads" }).fill("Marcus");
      await page.waitForTimeout(1600);
      await page.getByRole("button", { name: /Marcus Bell/ }).click();
      await page.waitForTimeout(1200);
      await page.getByLabel("Status").selectOption("Scheduled");
      await page.waitForTimeout(2200);
      await page.waitForTimeout(2500);
    },
  },
  {
    name: "launchops",
    routes: [
      "/launch-demo/launchops/auth",
      "/launch-demo/launchops",
      "/launch-demo/launchops/project",
      "/launch-demo/launchops/verification?tab=static",
      "/launch-demo/launchops/verification?tab=runtime",
      "/launch-demo/launchops/verification?tab=export",
    ],
    homeRoute: "/launch-demo/launchops",
    detailRoute: "/launch-demo/launchops/project",
    interactiveRoute: "/launch-demo/launchops",
    prepareInteractive: async (page) => {
      await page.getByRole("row", { name: /Billing API rollout/ }).click();
      await page.getByRole("dialog").waitFor({ state: "visible" });
    },
    record: async (page) => {
      await page.goto(`${baseUrl}/launch-demo/launchops/auth`, {
        waitUntil: "networkidle",
      });
      await ready(page);
      await page.waitForTimeout(1500);
      await page.getByRole("button", { name: /Continue to LaunchOps/ }).click();
      await page.waitForTimeout(1500);
      await page.goto(`${baseUrl}/launch-demo/launchops`, {
        waitUntil: "networkidle",
      });
      await ready(page);
      await page.getByLabel("Filter by status").selectOption("Review");
      await page.waitForTimeout(1300);
      await page.getByRole("row", { name: /Billing API rollout/ }).click();
      await page.waitForTimeout(1900);
      await page.getByRole("link", { name: /Open verification/ }).click();
      await ready(page);
      await page.waitForTimeout(1100);
      await page.getByRole("button", { name: /Runtime/ }).click();
      await page.waitForTimeout(1600);
      await page.getByRole("button", { name: /Export readiness/ }).click();
      await page.waitForTimeout(1800);
      await page.waitForTimeout(2500);
    },
  },
  {
    name: "cinder-studio",
    routes: [
      "/launch-demo/cinder-studio",
      "/launch-demo/cinder-studio/project/stone-court",
      "/launch-demo/cinder-studio/contact",
    ],
    homeRoute: "/launch-demo/cinder-studio",
    detailRoute: "/launch-demo/cinder-studio/project/stone-court",
    interactiveRoute: "/launch-demo/cinder-studio/contact?demoState=verified",
    record: async (page) => {
      await page.goto(`${baseUrl}/launch-demo/cinder-studio`, {
        waitUntil: "networkidle",
      });
      await ready(page);
      await page.waitForTimeout(1700);
      await page.evaluate(() =>
        window.scrollTo({ top: 760, behavior: "smooth" }),
      );
      await page.waitForTimeout(1800);
      await page.getByRole("link", { name: /Stone Court/ }).click();
      await ready(page);
      await page.waitForTimeout(1500);
      await page.getByRole("button", { name: "Next project image" }).click();
      await page.waitForTimeout(1500);
      await page.getByRole("button", { name: "Next project image" }).click();
      await page.waitForTimeout(1600);
      await page.goto(
        `${baseUrl}/launch-demo/cinder-studio/contact?demoState=verified`,
        { waitUntil: "networkidle" },
      );
      await ready(page);
      await page.waitForTimeout(2100);
      await page.waitForTimeout(2500);
    },
  },
];

function chromeExecutable() {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (configured && existsSync(configured)) return configured;
  const bundled = chromium.executablePath();
  if (existsSync(bundled)) return bundled;
  const system = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (existsSync(system)) return system;
  throw new Error("No Chromium executable found for demo capture.");
}

async function waitForUrl(url: string) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Renderer is starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function startRenderer(): Promise<ViteDevServer | null> {
  if (process.env.LAUNCH_DEMO_URL) {
    await waitForUrl(baseUrl);
    return null;
  }
  const server = await createServer({
    configFile: rendererConfig,
    server: { host: "127.0.0.1", port: rendererPort, strictPort: true },
  });
  await server.listen();
  await waitForUrl(`${baseUrl}/launch-demo/fieldflow`);
  return server;
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function ready(page: Page) {
  await page
    .locator('[data-render-ready="true"]')
    .first()
    .waitFor({ state: "visible" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve, reject) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener(
                "error",
                () => reject(new Error(`Image failed: ${image.src}`)),
                { once: true },
              );
            }),
      ),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  await page.waitForTimeout(120);
}

async function screenshot(
  browser: Browser,
  route: string,
  target: string,
  viewport: { width: number; height: number },
  prepare?: (page: Page) => Promise<void>,
) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = collectErrors(page);
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await ready(page);
  await prepare?.(page);
  await ready(page);
  await page.screenshot({ path: target, type: "png", animations: "disabled" });
  await context.close();
  if (errors.length)
    throw new Error(`${route} emitted console errors:\n${errors.join("\n")}`);
}

async function probeStates(browser: Browser, spec: DemoSpec) {
  for (const state of [
    "default",
    "loading",
    "error",
    "empty",
    "verified",
    "mobile",
  ]) {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = collectErrors(page);
    await page.goto(`${baseUrl}${spec.homeRoute}?demoState=${state}`, {
      waitUntil: "networkidle",
    });
    await ready(page);
    await context.close();
    if (errors.length)
      throw new Error(
        `${spec.name} ${state} emitted console errors:\n${errors.join("\n")}`,
      );
  }
}

async function probeRoutes(browser: Browser, spec: DemoSpec) {
  const viewports = [
    { width: 1440, height: 900 },
    { width: 375, height: 812 },
  ];
  for (const route of spec.routes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const errors = collectErrors(page);
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      await ready(page);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      await context.close();
      if (errors.length) {
        throw new Error(
          `${spec.name} ${route} emitted console errors:\n${errors.join("\n")}`,
        );
      }
      if (overflow > 1) {
        throw new Error(
          `${spec.name} ${route} overflows the ${viewport.width}px viewport by ${overflow}px`,
        );
      }
    }
  }
}

async function recordDemo(
  browser: Browser,
  spec: DemoSpec,
  outputDirectory: string,
) {
  const videoDirectory = path.join(temporaryRoot, spec.name);
  await mkdir(videoDirectory, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: videoDirectory, size: { width: 1280, height: 720 } },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const errors = collectErrors(page);
  const video = page.video();
  await spec.record(page);
  await context.close();
  if (!video)
    throw new Error(`Video capture was not available for ${spec.name}`);
  const rawVideo = path.join(videoDirectory, `${spec.name}.webm`);
  await video.saveAs(rawVideo);
  if (errors.length)
    throw new Error(
      `${spec.name} recording emitted console errors:\n${errors.join("\n")}`,
    );
  const target = path.join(outputDirectory, "demo-recording.mp4");
  await run("ffmpeg", [
    "-y",
    "-i",
    rawVideo,
    "-t",
    "12",
    "-vf",
    "fps=30,scale=1280:720:flags=lanczos",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    target,
  ]);
  return target;
}

async function run(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const processHandle = spawn(command, args, {
      cwd: repositoryRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    processHandle.stdout.on(
      "data",
      (chunk: Buffer) =>
        (output = `${output}${chunk.toString()}`.slice(-10_000)),
    );
    processHandle.stderr.on(
      "data",
      (chunk: Buffer) =>
        (output = `${output}${chunk.toString()}`.slice(-10_000)),
    );
    processHandle.on("error", reject);
    processHandle.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} exited with ${code}\n${output}`)),
    );
  });
}

function pngDimensions(buffer: Buffer) {
  if (buffer.subarray(1, 4).toString("ascii") !== "PNG")
    throw new Error("Expected PNG output");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function duration(file: string) {
  const result = await new Promise<string>((resolve, reject) => {
    const processHandle = spawn(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        file,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let value = "";
    processHandle.stdout.on(
      "data",
      (chunk: Buffer) => (value += chunk.toString()),
    );
    processHandle.on("exit", (code) =>
      code === 0
        ? resolve(value.trim())
        : reject(new Error(`ffprobe failed for ${file}`)),
    );
  });
  return Number(result);
}

async function describeAsset(file: string): Promise<CaptureAsset> {
  const buffer = await readFile(file);
  const result: CaptureAsset = {
    file: path.relative(repositoryRoot, file),
    sha256: createHash("sha256").update(buffer).digest("hex"),
    bytes: buffer.length,
  };
  if (file.endsWith(".png")) Object.assign(result, pngDimensions(buffer));
  if (file.endsWith(".mp4")) result.durationSeconds = await duration(file);
  return result;
}

async function contactSheet(outputDirectory: string) {
  const target = path.join(outputDirectory, "contact-sheet.png");
  await run("ffmpeg", [
    "-y",
    "-i",
    path.join(outputDirectory, "desktop-home.png"),
    "-i",
    path.join(outputDirectory, "mobile-home.png"),
    "-i",
    path.join(outputDirectory, "feature-detail.png"),
    "-i",
    path.join(outputDirectory, "interactive-state.png"),
    "-filter_complex",
    "[0:v]scale=600:375:force_original_aspect_ratio=decrease,pad=600:375:(ow-iw)/2:(oh-ih)/2:#e9eef3[a];[1:v]scale=600:375:force_original_aspect_ratio=decrease,pad=600:375:(ow-iw)/2:(oh-ih)/2:#e9eef3[b];[2:v]scale=600:375:force_original_aspect_ratio=decrease,pad=600:375:(ow-iw)/2:(oh-ih)/2:#e9eef3[c];[3:v]scale=600:375:force_original_aspect_ratio=decrease,pad=600:375:(ow-iw)/2:(oh-ih)/2:#e9eef3[d];[a][b][c][d]xstack=inputs=4:layout=0_0|600_0|0_375|600_375:fill=#e9eef3[out]",
    "-map",
    "[out]",
    "-frames:v",
    "1",
    target,
  ]);
  return target;
}

async function recordingContactSheet(outputDirectory: string) {
  const recording = path.join(outputDirectory, "demo-recording.mp4");
  const target = path.join(outputDirectory, "recording-contact-sheet.png");
  await run("ffmpeg", [
    "-y",
    "-ss",
    "2",
    "-i",
    recording,
    "-ss",
    "6",
    "-i",
    recording,
    "-ss",
    "10",
    "-i",
    recording,
    "-filter_complex",
    "[0:v]scale=400:225:flags=lanczos[a];[1:v]scale=400:225:flags=lanczos[b];[2:v]scale=400:225:flags=lanczos[c];[a][b][c]xstack=inputs=3:layout=0_0|400_0|800_0[out]",
    "-map",
    "[out]",
    "-frames:v",
    "1",
    target,
  ]);
  return target;
}

async function captureDemo(browser: Browser, spec: DemoSpec) {
  const outputDirectory = path.join(outputRoot, spec.name);
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await screenshot(
    browser,
    spec.homeRoute,
    path.join(outputDirectory, "desktop-home.png"),
    { width: 1440, height: 900 },
  );
  await screenshot(
    browser,
    spec.homeRoute,
    path.join(outputDirectory, "mobile-home.png"),
    { width: 375, height: 812 },
  );
  await screenshot(
    browser,
    spec.detailRoute,
    path.join(outputDirectory, "feature-detail.png"),
    { width: 1440, height: 900 },
  );
  await screenshot(
    browser,
    spec.interactiveRoute,
    path.join(outputDirectory, "interactive-state.png"),
    { width: 1440, height: 900 },
    spec.prepareInteractive,
  );
  await recordDemo(browser, spec, outputDirectory);
  await contactSheet(outputDirectory);
  await recordingContactSheet(outputDirectory);
  const sourceDirectory = path.join(
    launchDirectory,
    "demo-projects",
    spec.name,
  );
  for (const file of ["README.md", "captions.json", "demo.json"])
    await copyFile(
      path.join(sourceDirectory, file),
      path.join(outputDirectory, file),
    );
  await probeStates(browser, spec);
  await probeRoutes(browser, spec);

  const files = [
    "desktop-home.png",
    "mobile-home.png",
    "feature-detail.png",
    "interactive-state.png",
    "contact-sheet.png",
    "recording-contact-sheet.png",
    "demo-recording.mp4",
  ];
  const assets = await Promise.all(
    files.map((file) => describeAsset(path.join(outputDirectory, file))),
  );
  for (const asset of assets) {
    if (
      asset.file.endsWith("desktop-home.png") ||
      asset.file.endsWith("feature-detail.png") ||
      asset.file.endsWith("interactive-state.png")
    ) {
      if (asset.width !== 1440 || asset.height !== 900)
        throw new Error(`${asset.file} has incorrect desktop dimensions`);
    }
    if (
      asset.file.endsWith("mobile-home.png") &&
      (asset.width !== 375 || asset.height !== 812)
    )
      throw new Error(`${asset.file} has incorrect mobile dimensions`);
    if (
      asset.durationSeconds &&
      (asset.durationSeconds < 10 || asset.durationSeconds > 15)
    )
      throw new Error(
        `${asset.file} duration ${asset.durationSeconds}s is outside 10-15 seconds`,
      );
  }
  const manifest = {
    schemaVersion: 1,
    demo: spec.name,
    capturedAt: new Date().toISOString(),
    baseUrl,
    routes: {
      home: spec.homeRoute,
      detail: spec.detailRoute,
      interactive: spec.interactiveRoute,
    },
    verifiedRoutes: spec.routes,
    verifiedViewports: [
      { width: 1440, height: 900 },
      { width: 375, height: 812 },
    ],
    testedStates: [
      "default",
      "loading",
      "error",
      "empty",
      "verified",
      "mobile",
    ],
    assets,
  };
  await writeFile(
    path.join(outputDirectory, "capture-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}

async function main() {
  await mkdir(outputRoot, { recursive: true });
  await rm(temporaryRoot, { recursive: true, force: true });
  await mkdir(temporaryRoot, { recursive: true });
  let server: ViteDevServer | null = null;
  let browser: Browser | null = null;
  try {
    server = await startRenderer();
    browser = await chromium.launch({
      executablePath: chromeExecutable(),
      headless: true,
    });
    const manifests = [];
    for (const spec of demos) manifests.push(await captureDemo(browser, spec));
    await writeFile(
      path.join(outputRoot, "demo-capture-manifest.json"),
      `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), demos: manifests }, null, 2)}\n`,
    );
    process.stdout.write(
      `Captured ${manifests.length} launch demos with verified screenshots and recordings.\n`,
    );
  } finally {
    await browser?.close();
    await server?.close();
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.stack : String(error)}\n`,
  );
  process.exitCode = 1;
});
