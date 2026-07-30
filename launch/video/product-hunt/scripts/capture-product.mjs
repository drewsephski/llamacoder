import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const repositoryRoot = path.resolve(projectRoot, "../../..");
const outputDirectory = path.join(projectRoot, "assets/footage");
const temporaryDirectory = path.join(projectRoot, ".capture-tmp");
const productPort = Number(process.env.SQUID_VIDEO_PRODUCT_PORT ?? "3191");
const productBaseUrl =
  process.env.SQUID_VIDEO_PRODUCT_URL ?? `http://localhost:${productPort}`;

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForUrl(url, processHandle) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (processHandle?.exitCode !== null && processHandle?.exitCode !== undefined) {
      throw new Error(`Product server exited before ${url} was ready.`);
    }
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) return;
    } catch {
      // The product server is still starting.
    }
    await wait(400);
  }
  throw new Error(`Timed out waiting for ${url}.`);
}

async function startProduct() {
  if (process.env.SQUID_VIDEO_PRODUCT_URL) {
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
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  const remember = (chunk) => {
    output = `${output}${chunk.toString()}`.slice(-12_000);
  };
  processHandle.stdout.on("data", remember);
  processHandle.stderr.on("data", remember);
  try {
    await waitForUrl(`${productBaseUrl}/example`, processHandle);
  } catch (error) {
    throw new Error(`${String(error)}\n${output}`);
  }
  return processHandle;
}

function chromeExecutable() {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (configured && existsSync(configured)) return configured;
  const bundled = chromium.executablePath();
  if (existsSync(bundled)) return bundled;
  const system = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (existsSync(system)) return system;
  throw new Error("No Chromium executable is available for product capture.");
}

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const processHandle = spawn(command, args, {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    processHandle.stdout.on("data", (chunk) => {
      output = `${output}${chunk.toString()}`.slice(-12_000);
    });
    processHandle.stderr.on("data", (chunk) => {
      output = `${output}${chunk.toString()}`.slice(-12_000);
    });
    processHandle.on("error", reject);
    processHandle.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code}\n${output}`));
    });
  });
}

async function stable(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await page.waitForTimeout(200);
}

async function preparePage(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `
      nextjs-portal, [data-nextjs-toast], [data-next-badge-root] { display: none !important; }
      html { scroll-behavior: auto !important; }
      * { caret-color: transparent !important; }
      #squid-video-cursor {
        position: fixed; left: 0; top: 0; z-index: 2147483647;
        width: 28px; height: 28px; border: 2px solid #0062ff; border-radius: 999px;
        background: rgba(255,255,255,.88); box-shadow: 0 5px 18px rgba(0,98,255,.24);
        pointer-events: none; transform: translate3d(-60px,-60px,0);
        transition: transform 420ms cubic-bezier(.2,.8,.2,1), box-shadow 160ms ease, background 160ms ease;
      }
      #squid-video-cursor::after { content: ""; position: absolute; inset: 9px; border-radius: 50%; background: #0062ff; }
      #squid-video-cursor.is-clicking { background: rgba(0,98,255,.18); box-shadow: 0 0 0 12px rgba(0,98,255,.12); }
    `,
  });
  await page.evaluate(() => {
    document.querySelector("#squid-video-cursor")?.remove();
    const cursor = document.createElement("div");
    cursor.id = "squid-video-cursor";
    document.body.append(cursor);
  });
  await stable(page);
}

async function moveCursor(page, locator, { click = false, position } = {}) {
  await locator.waitFor({ state: "visible" });
  const box = await locator.boundingBox();
  if (!box) throw new Error("Cursor target has no visible bounding box.");
  const x = position?.x ?? box.x + box.width / 2;
  const y = position?.y ?? box.y + box.height / 2;
  await page.evaluate(
    ({ x, y }) => {
      const cursor = document.querySelector("#squid-video-cursor");
      if (cursor instanceof HTMLElement) {
        cursor.style.transform = `translate3d(${x - 14}px, ${y - 14}px, 0)`;
      }
    },
    { x, y },
  );
  await page.waitForTimeout(520);
  if (!click) return;
  await page.evaluate(() =>
    document.querySelector("#squid-video-cursor")?.classList.add("is-clicking"),
  );
  await locator.click();
  await page.waitForTimeout(180);
  await page.evaluate(() =>
    document.querySelector("#squid-video-cursor")?.classList.remove("is-clicking"),
  );
}

function collectErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => {
    if (error.message.startsWith("Hydration failed because the server rendered HTML didn't match the client")) {
      return;
    }
    errors.push(`pageerror: ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (text.includes("/_next/webpack-hmr") && text.includes("WebSocket connection")) {
      return;
    }
    errors.push(`console: ${text}`);
  });
  return errors;
}

async function recordClip(browser, name, prepare, perform) {
  const rawDirectory = path.join(temporaryDirectory, name);
  await mkdir(rawDirectory, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: rawDirectory, size: { width: 1440, height: 900 } },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = collectErrors(page);
  const video = page.video();
  const openedAt = Date.now();
  await prepare(page);
  const trimStart = Math.max(0, (Date.now() - openedAt) / 1000 - 0.15);
  await page.waitForTimeout(500);
  await perform(page);
  await page.waitForTimeout(700);
  await context.close();
  if (!video) throw new Error(`Playwright did not create a video for ${name}.`);
  if (errors.length) throw new Error(`${name} emitted browser errors:\n${errors.join("\n")}`);
  const raw = path.join(rawDirectory, `${name}.webm`);
  await video.saveAs(raw);
  const output = path.join(outputDirectory, `${name}.mp4`);
  await run("ffmpeg", [
    "-y",
    "-ss",
    trimStart.toFixed(3),
    "-i",
    raw,
    "-vf",
    "fps=30,scale=1440:900:flags=lanczos",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "17",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    output,
  ]);
  return output;
}

async function main() {
  await rm(outputDirectory, { recursive: true, force: true });
  await rm(temporaryDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await mkdir(temporaryDirectory, { recursive: true });
  let productProcess = null;
  let browser = null;
  try {
    productProcess = await startProduct();
    browser = await chromium.launch({ executablePath: chromeExecutable(), headless: true });

    await recordClip(
      browser,
      "composer-inputs",
      (page) => preparePage(page, productBaseUrl),
      async (page) => {
        const prompt = page.locator('textarea[name="prompt"]');
        await moveCursor(page, prompt, { click: true });
        await prompt.pressSequentially(
          "Build a quoting and scheduling app for a local service business.",
          { delay: 24 },
        );
        await page.waitForTimeout(700);
        const planMode = page.getByRole("button", { name: /Plan mode disabled/i });
        await moveCursor(page, planMode, { click: true });
        await page.waitForTimeout(650);
        const attach = page.getByLabel("Attach image");
        await moveCursor(page, attach);
        await page.waitForTimeout(700);
        const integrations = page.getByRole("button", { name: /Integrations/i }).first();
        await moveCursor(page, integrations, { click: true });
        await page.waitForTimeout(900);
        await page.keyboard.press("Escape");
        const url = page.getByPlaceholder("https://example.com");
        await url.scrollIntoViewIfNeeded();
        await moveCursor(page, url, { click: true });
        await url.fill("https://northline.example.test");
        await page.waitForTimeout(900);
      },
    );

    await recordClip(
      browser,
      "prompt-to-plan",
      (page) => preparePage(page, `${productBaseUrl}/example`),
      async (page) => {
        const promptTab = page.getByRole("button", { name: /^Prompt\b/ });
        await moveCursor(page, promptTab, { click: true });
        await page.waitForTimeout(1800);
        const planTab = page.getByRole("button", { name: /^Plan\b/ });
        await moveCursor(page, planTab, { click: true });
        await page.getByText(/Approved build plan/i).first().waitFor({ state: "visible" });
        await page.waitForTimeout(2600);
      },
    );

    await recordClip(
      browser,
      "build-and-iterate",
      (page) => preparePage(page, `${productBaseUrl}/example`),
      async (page) => {
        const previewTab = page.getByRole("button", { name: /^Preview\b/ });
        await moveCursor(page, previewTab, { click: true });
        const preview = page.frameLocator(".sp-preview-iframe");
        const moveTask = preview.getByRole("button", {
          name: "Move Lock the launch narrative right",
        });
        await moveCursor(page, moveTask, { click: true });
        await page.waitForTimeout(1100);
        const timer = preview.getByRole("button", { name: "Start focus timer" });
        await moveCursor(page, timer, { click: true });
        await page.waitForTimeout(1200);
        const command = preview.getByRole("button", { name: "Open command menu" });
        await moveCursor(page, command, { click: true });
        await page.waitForTimeout(1300);
        const close = preview.getByRole("button", { name: "Close command menu" });
        await moveCursor(page, close, { click: true });
        await page.waitForTimeout(1000);
      },
    );

    await recordClip(
      browser,
      "verify-and-export",
      (page) => preparePage(page, `${productBaseUrl}/example`),
      async (page) => {
        const qualityTab = page.getByRole("button", { name: /^Quality\b/ });
        await moveCursor(page, qualityTab, { click: true });
        await page.getByText("Static checks passed", { exact: true }).waitFor({ state: "visible" });
        await page.waitForTimeout(2200);
        const filesTab = page.getByRole("button", { name: /^Files\b/ });
        await moveCursor(page, filesTab, { click: true });
        const file = page.getByRole("button", { name: "components/Board.tsx" });
        await moveCursor(page, file, { click: true });
        await page.getByText(/export function Board/).waitFor({ state: "visible" });
        await page.waitForTimeout(1800);
        const download = page.getByRole("button", { name: /Download source/i });
        const downloadEvent = page.waitForEvent("download");
        await moveCursor(page, download, { click: true });
        await downloadEvent;
        await page.waitForTimeout(1200);
      },
    );

    process.stdout.write(`Captured four clean Squid product clips in ${outputDirectory}\n`);
  } finally {
    await browser?.close();
    productProcess?.kill("SIGTERM");
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
