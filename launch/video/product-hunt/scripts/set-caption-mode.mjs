import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectDir = resolve(import.meta.dirname, "..");
const mode = process.argv[2];
if (!new Set(["captioned", "clean"]).has(mode)) {
  throw new Error("Usage: node scripts/set-caption-mode.mjs <captioned|clean>");
}

const captioned = await readFile(resolve(projectDir, "index.captioned.source"), "utf8");
const output = mode === "clean"
  ? captioned.replace('id="el-captions"', 'id="el-captions" style="display: none"')
  : captioned;

if (mode === "clean" && output === captioned) {
  throw new Error("Could not locate the captions composition in the assembled source.");
}

await writeFile(resolve(projectDir, "index.html"), output);
if (mode === "clean") {
  await writeFile(resolve(projectDir, "index.clean.source"), output);
}
console.log(`Caption mode: ${mode}`);
