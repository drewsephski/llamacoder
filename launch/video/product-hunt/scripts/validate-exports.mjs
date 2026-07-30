import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectDir = resolve(import.meta.dirname, "..");
const qaDir = resolve(projectDir, "qa");
const expectedDuration = 72;
const expected = [
  "squid-product-hunt-launch-captioned.mp4",
  "squid-product-hunt-launch-clean.mp4",
];

function probe(relativePath) {
  const output = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration,size,bit_rate:stream=codec_name,width,height,r_frame_rate,pix_fmt", "-of", "json", resolve(projectDir, relativePath)],
    { encoding: "utf8" },
  );
  return JSON.parse(output);
}

const results = [];
for (const file of expected) {
  const metadata = probe(file);
  const stream = metadata.streams?.find((entry) => entry.codec_name === "h264");
  const duration = Number(metadata.format?.duration);
  const errors = [];

  if (!stream) errors.push("video codec is not H.264");
  if (stream?.width !== 1920 || stream?.height !== 1080) errors.push("dimensions are not 1920x1080");
  if (stream?.r_frame_rate !== "30/1") errors.push(`frame rate is ${stream?.r_frame_rate ?? "missing"}, expected 30/1`);
  if (Math.abs(duration - expectedDuration) > 0.25) errors.push(`duration is ${duration}s, expected ${expectedDuration}s`);
  if (Number(metadata.format?.size) < 5_000_000) errors.push("file is unexpectedly small");

  results.push({ file, passed: errors.length === 0, errors, metadata });
}

const thumbnail = resolve(projectDir, "squid-product-hunt-video-thumbnail.png");
const thumbnailMetadata = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name,width,height", "-of", "json", thumbnail], { encoding: "utf8" }),
);
const thumbnailStream = thumbnailMetadata.streams?.[0];
const thumbnailErrors = [];
if (thumbnailStream?.codec_name !== "png") thumbnailErrors.push("thumbnail is not PNG");
if (thumbnailStream?.width !== 1920 || thumbnailStream?.height !== 1080) thumbnailErrors.push("thumbnail dimensions are not 1920x1080");
results.push({ file: "squid-product-hunt-video-thumbnail.png", passed: thumbnailErrors.length === 0, errors: thumbnailErrors, metadata: thumbnailMetadata });

await mkdir(qaDir, { recursive: true });
await writeFile(resolve(qaDir, "validation.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`);

const failures = results.filter((result) => !result.passed);
if (failures.length > 0) {
  throw new Error(failures.map((failure) => `${failure.file}: ${failure.errors.join(", ")}`).join("\n"));
}

const summary = results.map((result) => `${result.file}: passed`).join("\n");
console.log(summary);
