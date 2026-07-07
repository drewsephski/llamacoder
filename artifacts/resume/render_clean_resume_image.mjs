import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const input = join(__dirname, "clean_resume_image.html");
const output = join(__dirname, "Drew_Sepeczi_Clean_Resume.png");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1700, height: 2200 },
  deviceScaleFactor: 1,
});

await page.goto(`file://${input}`, { waitUntil: "networkidle" });
await page.screenshot({
  path: output,
  fullPage: false,
  type: "png",
});

await browser.close();
console.log(output);
