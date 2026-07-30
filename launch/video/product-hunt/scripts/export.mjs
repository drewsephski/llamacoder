import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectDir = resolve(import.meta.dirname, "..");
const launchSkill = "/Users/drewsepeczi/.agents/skills/product-launch-video/scripts";
const hyperframes = "hyperframes@0.7.84";

function run(command, args) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  execFileSync(command, args, { cwd: projectDir, stdio: "inherit", env: process.env });
}

run("node", ["scripts/restore-frame-videos.mjs"]);
run("node", [`${launchSkill}/captions.mjs`, "build", "--storyboard", "./STORYBOARD.md", "--audio-meta", "./audio_meta.json", "--hyperframes", ".", "--out", "./caption_groups.json"]);
run("node", [`${launchSkill}/assemble-index.mjs`, "--storyboard", "./STORYBOARD.md", "--audio-meta", "./audio_meta.json", "--hyperframes", ".", "--out", "./index.html"]);
run("node", [`${launchSkill}/transitions.mjs`, "inject", "--storyboard", "./STORYBOARD.md", "--index", "./index.html", "--hyperframes", "."]);
run("node", [`${launchSkill}/transitions.mjs`, "verify", "--index", "./index.html"]);
run("npm", ["run", "check"]);

const captionedIndex = await readFile(resolve(projectDir, "index.html"), "utf8");
await writeFile(resolve(projectDir, "index.captioned.source"), captionedIndex);

const renderArgs = ["--yes", hyperframes, "render", ".", "--fps", "30", "--quality", "high", "--format", "mp4", "--video-frame-format", "png", "--crf", "17", "--workers", "auto", "--strict", "--skill", "product-launch-video"];
run("npx", [...renderArgs, "--output", "squid-product-hunt-launch-captioned.mp4"]);

run("node", ["scripts/set-caption-mode.mjs", "clean"]);

try {
  run("npx", [...renderArgs, "--output", "squid-product-hunt-launch-clean.mp4"]);
} finally {
  run("node", ["scripts/set-caption-mode.mjs", "captioned"]);
}

run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", "71.5", "-i", "squid-product-hunt-launch-clean.mp4", "-frames:v", "1", "-compression_level", "9", "-y", "squid-product-hunt-video-thumbnail.png"]);
run("node", ["scripts/validate-exports.mjs"]);

console.log("\nSquid Product Hunt video package exported and validated.");
