import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Browser, type Page } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const launchDirectory = path.resolve(scriptDirectory, "..");
export const repositoryRoot = path.resolve(launchDirectory, "..");
export const gifOutputDirectory = path.join(launchDirectory, "gifs");
export const gifTemporaryDirectory = path.join(
  launchDirectory,
  ".tmp-gif-capture",
);

const rendererConfig = path.join(launchDirectory, "renderer/vite.config.ts");
const rendererPort = Number(process.env.LAUNCH_GIF_PORT ?? "4180");
const rendererBaseUrl =
  process.env.LAUNCH_GIF_RENDERER_URL ?? `http://127.0.0.1:${rendererPort}`;

export const GIF_WIDTH = 1270;
export const GIF_HEIGHT = 760;
export const CAPTURE_FPS = 12;
export const FRAME_COUNT = 120;

export type GifSpec = {
  name: "plan-mode" | "screenshot-to-app" | "verify-and-export";
  label: string;
  posterFrame: number;
  auditFrames: number[];
  cursorAudits: Array<{ frame: number; target: string }>;
};

export const gifSpecs: GifSpec[] = [
  {
    name: "plan-mode",
    label: "Plan before building",
    posterFrame: 78,
    auditFrames: [0, 36, 70, 101],
    cursorAudits: [
      { frame: 27, target: "plan-send" },
      { frame: 36, target: "plan-answer-one" },
      { frame: 53, target: "plan-answer-two" },
      { frame: 98, target: "plan-approve" },
    ],
  },
  {
    name: "screenshot-to-app",
    label: "Screenshot to editable React app",
    posterFrame: 92,
    auditFrames: [0, 25, 58, 92],
    cursorAudits: [
      { frame: 22, target: "screenshot-upload" },
      { frame: 34, target: "screenshot-generate" },
      { frame: 81, target: "screenshot-mobile" },
    ],
  },
  {
    name: "verify-and-export",
    label: "Verify, repair, and export",
    posterFrame: 96,
    auditFrames: [0, 24, 61, 96],
    cursorAudits: [
      { frame: 18, target: "nav-quality" },
      { frame: 39, target: "verify-repair" },
      { frame: 80, target: "verify-export" },
      { frame: 96, target: "verify-zip" },
      { frame: 103, target: "verify-github" },
    ],
  },
];

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForUrl(url: string) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await wait(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function startRenderer(): Promise<ViteDevServer | null> {
  if (process.env.LAUNCH_GIF_RENDERER_URL) {
    await waitForUrl(rendererBaseUrl);
    return null;
  }
  const server = await createServer({
    configFile: rendererConfig,
    server: { host: "127.0.0.1", port: rendererPort, strictPort: true },
  });
  await server.listen();
  await waitForUrl(`${rendererBaseUrl}/launch-render/gif/plan-mode`);
  return server;
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

export async function runCommand(command: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const processHandle = spawn(command, args, {
      cwd: repositoryRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    processHandle.stdout.on("data", (chunk: Buffer) => {
      stdout = `${stdout}${chunk.toString()}`.slice(-20_000);
    });
    processHandle.stderr.on("data", (chunk: Buffer) => {
      stderr = `${stderr}${chunk.toString()}`.slice(-20_000);
    });
    processHandle.on("error", reject);
    processHandle.on("exit", (code) => {
      if (code === 0) resolve(stdout);
      else
        reject(
          new Error(
            `${command} exited with ${code}\n${[stdout, stderr].filter(Boolean).join("\n")}`,
          ),
        );
    });
  });
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function waitForStablePage(page: Page) {
  await page.locator('[data-render-ready="true"]').waitFor({
    state: "visible",
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
}

async function setFrame(page: Page, frame: number) {
  await page.evaluate((nextFrame) => {
    if (!window.__launchGifSetFrame) {
      throw new Error("Launch GIF frame controller is not ready.");
    }
    window.__launchGifSetFrame(nextFrame);
  }, frame);
  await page.waitForFunction(
    (expected) =>
      document
        .querySelector("[data-gif-frame]")
        ?.getAttribute("data-gif-frame") === String(expected),
    frame,
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

async function auditRenderedFrame(page: Page, spec: GifSpec, frame: number) {
  const result = await page.evaluate(
    ({ width, height }) => {
      const root = document.querySelector<HTMLElement>(".launch-gif-root");
      if (!root) return { error: "Missing GIF root", critical: [] };
      const rootRect = root.getBoundingClientRect();
      const overflow = {
        x: root.scrollWidth - root.clientWidth,
        y: root.scrollHeight - root.clientHeight,
      };
      const critical = Array.from(
        root.querySelectorAll<HTMLElement>("[data-critical-copy]"),
      )
        .filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          let opacity = Number(style.opacity || "1");
          for (
            let parent = element.parentElement;
            parent && parent !== root;
            parent = parent.parentElement
          ) {
            opacity *= Number(getComputedStyle(parent).opacity || "1");
          }
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            opacity > 0.1 &&
            rect.width > 1 &&
            rect.height > 1
          );
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            text: element.textContent?.trim() ?? "",
            fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
            clipped:
              rect.left < rootRect.left - 1 ||
              rect.top < rootRect.top - 1 ||
              rect.right > rootRect.right + 1 ||
              rect.bottom > rootRect.bottom + 1,
          };
        });
      return {
        error:
          Math.round(rootRect.width) === width &&
          Math.round(rootRect.height) === height
            ? null
            : `Root measured ${rootRect.width}x${rootRect.height}`,
        overflow,
        critical,
      };
    },
    { width: GIF_WIDTH, height: GIF_HEIGHT },
  );

  if (result.error)
    throw new Error(`${spec.name} frame ${frame}: ${result.error}`);
  if (result.overflow && (result.overflow.x > 1 || result.overflow.y > 1)) {
    throw new Error(
      `${spec.name} frame ${frame} overflows by ${result.overflow.x}px × ${result.overflow.y}px`,
    );
  }
  if (!result.critical.length) {
    throw new Error(
      `${spec.name} frame ${frame} has no visible critical copy.`,
    );
  }
  for (const copy of result.critical) {
    if (copy.clipped) {
      throw new Error(`${spec.name} frame ${frame} clips “${copy.text}”.`);
    }
    if (copy.fontSize < 18) {
      throw new Error(
        `${spec.name} frame ${frame} renders critical copy “${copy.text}” at ${copy.fontSize}px.`,
      );
    }
  }
}

async function auditCursorAlignment(page: Page, spec: GifSpec, frame: number) {
  const expected = spec.cursorAudits.find((audit) => audit.frame === frame);
  if (!expected) return;
  const result = await page.evaluate((targetName) => {
    const root = document.querySelector<HTMLElement>(".launch-gif-app");
    const cursor = document.querySelector<HTMLElement>(".launch-gif-cursor");
    const target = root?.querySelector<HTMLElement>(
      `[data-cursor-target="${targetName}"]`,
    );
    if (!root || !cursor || !target) {
      return { error: `Missing cursor or target ${targetName}`, distance: 0 };
    }
    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const cursorX = rootRect.left + Number.parseFloat(cursor.style.left);
    const cursorY = rootRect.top + Number.parseFloat(cursor.style.top);
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    return {
      error:
        cursor.dataset.cursorTarget === targetName
          ? null
          : `Cursor declares ${cursor.dataset.cursorTarget ?? "no target"}`,
      distance: Math.hypot(cursorX - targetX, cursorY - targetY),
    };
  }, expected.target);

  if (result.error) {
    throw new Error(`${spec.name} frame ${frame}: ${result.error}.`);
  }
  if (result.distance > 2) {
    throw new Error(
      `${spec.name} frame ${frame}: cursor misses ${expected.target} by ${result.distance.toFixed(1)}px.`,
    );
  }
}

async function recordSpec(browser: Browser, spec: GifSpec) {
  const frameDirectory = path.join(gifTemporaryDirectory, spec.name);
  await rm(frameDirectory, { recursive: true, force: true });
  await mkdir(frameDirectory, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: GIF_WIDTH, height: GIF_HEIGHT },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = collectErrors(page);
  await page.goto(`${rendererBaseUrl}/launch-render/gif/${spec.name}`, {
    waitUntil: "networkidle",
  });
  await waitForStablePage(page);

  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    await setFrame(page, frame);
    if (spec.auditFrames.includes(frame)) {
      await auditRenderedFrame(page, spec, frame);
    }
    await auditCursorAlignment(page, spec, frame);
    await page.screenshot({
      path: path.join(
        frameDirectory,
        `frame-${String(frame).padStart(3, "0")}.png`,
      ),
      type: "png",
      animations: "disabled",
    });
  }

  await context.close();
  if (errors.length) {
    throw new Error(
      `${spec.name} emitted browser errors:\n${errors.join("\n")}`,
    );
  }

  const mp4Path = path.join(gifOutputDirectory, `${spec.name}.mp4`);
  await runCommand("ffmpeg", [
    "-y",
    "-framerate",
    String(CAPTURE_FPS),
    "-start_number",
    "0",
    "-i",
    path.join(frameDirectory, "frame-%03d.png"),
    "-vf",
    "fps=24",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "17",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    mp4Path,
  ]);

  const posterPath = path.join(gifOutputDirectory, `${spec.name}-poster.png`);
  await copyFile(
    path.join(
      frameDirectory,
      `frame-${String(spec.posterFrame).padStart(3, "0")}.png`,
    ),
    posterPath,
  );

  return { spec, frameDirectory, mp4Path, posterPath };
}

export async function recordGifSources() {
  await mkdir(gifOutputDirectory, { recursive: true });
  await mkdir(gifTemporaryDirectory, { recursive: true });
  const server = await startRenderer();
  const browser = await chromium.launch({
    executablePath: resolveChromeExecutable(),
    headless: true,
  });
  try {
    const recordings = [];
    for (const spec of gifSpecs) {
      process.stdout.write(`Recording ${spec.name}…\n`);
      recordings.push(await recordSpec(browser, spec));
    }
    return recordings;
  } finally {
    await browser.close();
    await server?.close();
  }
}

const invokedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  recordGifSources().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
