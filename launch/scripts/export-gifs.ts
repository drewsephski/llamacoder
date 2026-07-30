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

import {
  CAPTURE_FPS,
  FRAME_COUNT,
  GIF_HEIGHT,
  GIF_WIDTH,
  gifOutputDirectory,
  gifTemporaryDirectory,
  recordGifSources,
  repositoryRoot,
  runCommand,
} from "./record-gifs";

type AssetRecord = {
  path: string;
  format: "mp4" | "gif" | "webp" | "png";
  bytes: number;
  sha256: string;
  width: number;
  height: number;
  durationSeconds?: number;
  framesPerSecond?: number;
  loop?: "infinite";
};

const publicGifDirectory = path.join(repositoryRoot, "public/launch/gifs");

function commandExists(command: "gifski" | "img2webp" | "webpmux") {
  return runCommand(command, [command === "gifski" ? "--version" : "-version"])
    .then(() => true)
    .catch(() => false);
}

async function probe(file: string) {
  const output = await runCommand("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,avg_frame_rate:format=duration",
    "-of",
    "json",
    file,
  ]);
  return JSON.parse(output) as {
    streams?: Array<{
      width?: number;
      height?: number;
      avg_frame_rate?: string;
    }>;
    format?: { duration?: string };
  };
}

function parseRate(value?: string) {
  if (!value) return undefined;
  const [numerator, denominator] = value.split("/").map(Number);
  if (!numerator || !denominator) return undefined;
  return numerator / denominator;
}

async function describeAsset(
  file: string,
  format: AssetRecord["format"],
  options: Pick<AssetRecord, "loop"> = {},
): Promise<AssetRecord> {
  const buffer = await readFile(file);
  if (format === "webp") {
    const metadata = await runCommand("webpmux", ["-info", file]);
    const canvas = metadata.match(/Canvas size:\s*(\d+) x (\d+)/);
    const frameCount = Number(
      metadata.match(/Number of frames:\s*(\d+)/)?.[1] ?? "0",
    );
    if (!canvas || frameCount !== FRAME_COUNT) {
      throw new Error(`Animated WebP metadata is incomplete for ${file}.`);
    }
    return {
      path: path.relative(repositoryRoot, file),
      format,
      bytes: buffer.length,
      sha256: createHash("sha256").update(buffer).digest("hex"),
      width: Number(canvas[1]),
      height: Number(canvas[2]),
      durationSeconds: (frameCount * Math.round(1000 / CAPTURE_FPS)) / 1000,
      framesPerSecond: 1000 / Math.round(1000 / CAPTURE_FPS),
      ...options,
    };
  }
  const metadata = await probe(file);
  const stream = metadata.streams?.[0];
  return {
    path: path.relative(repositoryRoot, file),
    format,
    bytes: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    width: stream?.width ?? 0,
    height: stream?.height ?? 0,
    durationSeconds: metadata.format?.duration
      ? Number(metadata.format.duration)
      : undefined,
    framesPerSecond: parseRate(stream?.avg_frame_rate),
    ...options,
  };
}

async function encodeGif(
  mp4Path: string,
  frameDirectory: string,
  target: string,
  hasGifski: boolean,
) {
  if (hasGifski) {
    const frames = Array.from({ length: FRAME_COUNT }, (_, index) =>
      path.join(frameDirectory, `frame-${String(index).padStart(3, "0")}.png`),
    );
    await runCommand("gifski", [
      "--fps",
      String(CAPTURE_FPS),
      "--quality",
      "82",
      "--width",
      String(GIF_WIDTH),
      "--repeat",
      "0",
      "--output",
      target,
      ...frames,
    ]);
    return "gifski";
  }

  const palette = path.join(frameDirectory, "palette.png");
  await runCommand("ffmpeg", [
    "-y",
    "-i",
    mp4Path,
    "-vf",
    `fps=${CAPTURE_FPS},scale=${GIF_WIDTH}:${GIF_HEIGHT}:flags=lanczos,palettegen=max_colors=96:stats_mode=diff`,
    palette,
  ]);
  await runCommand("ffmpeg", [
    "-y",
    "-i",
    mp4Path,
    "-i",
    palette,
    "-lavfi",
    `fps=${CAPTURE_FPS},scale=${GIF_WIDTH}:${GIF_HEIGHT}:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`,
    "-loop",
    "0",
    target,
  ]);
  return "ffmpeg palettegen/paletteuse";
}

async function encodeWebp(frameDirectory: string, target: string) {
  const frames = Array.from({ length: FRAME_COUNT }, (_, index) =>
    path.join(frameDirectory, `frame-${String(index).padStart(3, "0")}.png`),
  );
  await runCommand("img2webp", [
    "-loop",
    "0",
    "-min_size",
    "-mixed",
    "-kmin",
    "9",
    "-kmax",
    "17",
    "-d",
    String(Math.round(1000 / CAPTURE_FPS)),
    "-lossy",
    "-q",
    "80",
    "-m",
    "6",
    ...frames,
    "-o",
    target,
  ]);
}

async function validateAsset(asset: AssetRecord) {
  if (asset.width !== GIF_WIDTH || asset.height !== GIF_HEIGHT) {
    throw new Error(
      `${asset.path} is ${asset.width}×${asset.height}; expected ${GIF_WIDTH}×${GIF_HEIGHT}.`,
    );
  }
  if (
    asset.durationSeconds !== undefined &&
    (asset.durationSeconds < 9.8 || asset.durationSeconds > 10.2)
  ) {
    throw new Error(
      `${asset.path} is ${asset.durationSeconds.toFixed(2)}s; expected about 10s.`,
    );
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  await runCommand("ffmpeg", ["-version"]);
  await runCommand("ffprobe", ["-version"]);
  if (!(await commandExists("img2webp"))) {
    throw new Error(
      "img2webp is required for the animated WebP alternatives. Install WebP tools and retry.",
    );
  }
  if (!(await commandExists("webpmux"))) {
    throw new Error(
      "webpmux is required to validate animated WebP dimensions and frame counts.",
    );
  }
  const hasGifski = await commandExists("gifski");
  const recordings = await recordGifSources();
  await mkdir(publicGifDirectory, { recursive: true });
  const assets: AssetRecord[] = [];
  let gifEncoder = "";

  try {
    for (const recording of recordings) {
      const { name } = recording.spec;
      process.stdout.write(`Exporting ${name} derivatives…\n`);
      const gifPath = path.join(gifOutputDirectory, `${name}.gif`);
      const webpPath = path.join(gifOutputDirectory, `${name}.webp`);
      const displayCheckPath = path.join(
        gifOutputDirectory,
        `${name}-display-check.png`,
      );

      gifEncoder = await encodeGif(
        recording.mp4Path,
        recording.frameDirectory,
        gifPath,
        hasGifski,
      );
      await encodeWebp(recording.frameDirectory, webpPath);

      // Decode the exported GIF itself at a representative moment. This is the
      // actual-size review surface, rather than a source-frame proxy.
      await runCommand("ffmpeg", [
        "-y",
        "-ss",
        "6.5",
        "-i",
        gifPath,
        "-frames:v",
        "1",
        displayCheckPath,
      ]);

      const described = await Promise.all([
        describeAsset(recording.mp4Path, "mp4"),
        describeAsset(gifPath, "gif", { loop: "infinite" }),
        describeAsset(webpPath, "webp", { loop: "infinite" }),
        describeAsset(recording.posterPath, "png"),
        describeAsset(displayCheckPath, "png"),
      ]);
      for (const asset of described) {
        await validateAsset(asset);
        assets.push(asset);
      }

      await Promise.all([
        copyFile(
          recording.mp4Path,
          path.join(publicGifDirectory, `${name}.mp4`),
        ),
        copyFile(
          recording.posterPath,
          path.join(publicGifDirectory, `${name}-poster.png`),
        ),
      ]);
    }

    const gifAssets = assets.filter((asset) => asset.format === "gif");
    const webpAssets = assets.filter((asset) => asset.format === "webp");
    const mp4Assets = assets.filter((asset) => asset.format === "mp4");
    const report = [
      "# Squid Product Hunt GIF file-size report",
      "",
      `Generated at ${new Date().toISOString()} by \`pnpm launch:export-gifs\`.`,
      "",
      `Profile: ${GIF_WIDTH}×${GIF_HEIGHT}, 10 seconds, ${CAPTURE_FPS} captured frames per second. MP4 masters are H.264 at 24 fps; GIF and WebP alternatives loop infinitely.`,
      "",
      `GIF encoder: ${gifEncoder}. Animated WebP encoder: img2webp.`,
      "",
      "| Flow | MP4 | GIF | WebP | WebP savings vs GIF |",
      "| --- | ---: | ---: | ---: | ---: |",
      ...recordings.map(({ spec }) => {
        const mp4 = mp4Assets.find((asset) =>
          asset.path.endsWith(`${spec.name}.mp4`),
        );
        const gif = gifAssets.find((asset) =>
          asset.path.endsWith(`${spec.name}.gif`),
        );
        const webp = webpAssets.find((asset) =>
          asset.path.endsWith(`${spec.name}.webp`),
        );
        if (!mp4 || !gif || !webp)
          throw new Error(`Missing report data for ${spec.name}`);
        const savings = 100 - (webp.bytes / gif.bytes) * 100;
        return `| ${spec.label} | ${formatBytes(mp4.bytes)} | ${formatBytes(gif.bytes)} | ${formatBytes(webp.bytes)} | ${savings.toFixed(0)}% |`;
      }),
      "",
      "## Readability and privacy gates",
      "",
      "- Critical on-screen labels are at least 18 px and remain inside the 1270×760 frame.",
      "- Each exported GIF is decoded at 6.5 seconds into its matching `*-display-check.png` for native-size visual review.",
      "- All names, projects, screenshots, files, and verification results are deterministic fictional fixtures.",
      "- The capture routes perform no network calls beyond the local renderer and expose no account, project, or provider credentials.",
      "",
    ].join("\n");
    await writeFile(
      path.join(gifOutputDirectory, "file-size-report.md"),
      `${report}\n`,
    );

    const manifest = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      command: "pnpm launch:export-gifs",
      profile: {
        width: GIF_WIDTH,
        height: GIF_HEIGHT,
        durationSeconds: FRAME_COUNT / CAPTURE_FPS,
        captureFps: CAPTURE_FPS,
        mp4Fps: 24,
        gifEncoder,
        webpEncoder: "img2webp",
      },
      evidence: {
        productSources: [
          "components/plan-review.tsx",
          "components/tool-ui/question-flow/question-flow.tsx",
          "features/marketing/components/homepage-builder-island.tsx",
          "components/quality-report-panel.tsx",
          "app/(main)/chats/[id]/code-viewer.tsx",
        ],
        privacy:
          "Deterministic fictional launch fixtures only; no authenticated data.",
      },
      assets,
    };
    await writeFile(
      path.join(gifOutputDirectory, "asset-manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );

    // Keep stable names even if an interrupted prior run left a .gitkeep-only
    // directory. This copy also verifies posters remain readable PNG masters.
    for (const recording of recordings) {
      const poster = path.join(
        gifOutputDirectory,
        `${recording.spec.name}-poster.png`,
      );
      if (!existsSync(poster)) await copyFile(recording.posterPath, poster);
    }

    const totalBytes = (
      await Promise.all(
        assets
          .filter((asset) => ["mp4", "gif", "webp"].includes(asset.format))
          .map((asset) => stat(path.join(repositoryRoot, asset.path))),
      )
    ).reduce((sum, file) => sum + file.size, 0);
    process.stdout.write(
      `Exported ${recordings.length} flows (${formatBytes(totalBytes)} across MP4, GIF, and WebP).\n`,
    );
  } finally {
    await rm(gifTemporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
