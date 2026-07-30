import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectDir = resolve(import.meta.dirname, "..");
const marker = "    <!-- approved frame video hoisted by assemble-index -->";

const definitions = [
  {
    file: "compositions/frames/01-first-screen.html",
    id: "01-first-screen-product-video",
    html: `    <video id="01-first-screen-product-video" data-frame-video="approved" data-start="0" data-duration="5" data-track-index="1" data-frame-video-x="390" data-frame-video-y="210" data-frame-video-width="1140" data-frame-video-height="642" data-frame-video-fit="cover" src="assets/demos/fieldflow-demo.mp4" poster="assets/product-stills/fieldflow-app-updated.png" muted playsinline preload="auto"></video>`,
  },
  {
    file: "compositions/frames/02-meet-squid.html",
    id: "frame-02-meet-squid-video",
    html: `    <video id="frame-02-meet-squid-video" data-frame-video="approved" data-start="0" data-duration="7" data-track-index="1" data-frame-video-x="515" data-frame-video-y="78" data-frame-video-width="1350" data-frame-video-height="800" data-frame-video-fit="cover" src="assets/footage/composer-inputs.mp4" muted playsinline preload="auto"></video>`,
  },
  {
    file: "compositions/frames/04-build-iterate.html",
    id: "04-build-iterate-video",
    html: `    <video id="04-build-iterate-video" data-frame-video="approved" data-start="0" data-duration="8" data-track-index="1" data-frame-video-x="350" data-frame-video-y="90" data-frame-video-width="1220" data-frame-video-height="738" data-frame-video-fit="cover" src="assets/footage/build-and-iterate.mp4" muted playsinline preload="auto"></video>`,
  },
  {
    file: "compositions/frames/05-verify-repair.html",
    id: "05-verify-repair-video",
    html: `    <video id="05-verify-repair-video" data-frame-video="approved" data-start="0.9" data-duration="12.1" data-track-index="2" data-frame-video-x="112" data-frame-video-y="247" data-frame-video-width="894" data-frame-video-height="559" data-frame-video-fit="cover" src="assets/footage/verify-and-export.mp4" poster="assets/product-stills/example-quality.png" aria-label="Recorded Squid Agent verification workflow" muted playsinline preload="auto"></video>`,
  },
  {
    file: "compositions/frames/06-own-the-code.html",
    id: "f06-own-the-code-video",
    html: `    <video id="f06-own-the-code-video" data-frame-video="approved" data-start="0" data-duration="4.75" data-track-index="2" data-frame-video-x="94" data-frame-video-y="170" data-frame-video-width="1265" data-frame-video-height="602" data-frame-video-fit="cover" src="assets/footage/verify-and-export.mp4" muted playsinline preload="auto"></video>`,
  },
  {
    file: "compositions/frames/07-close.html",
    id: "f07-close-video-fieldflow",
    html: `    <video id="f07-close-video-fieldflow" data-frame-video="approved" data-start="0" data-duration="6" data-track-index="1" data-frame-video-x="218" data-frame-video-y="474" data-frame-video-width="440" data-frame-video-height="248" data-frame-video-fit="cover" src="assets/demos/fieldflow-demo.mp4" muted playsinline preload="auto"></video>`,
  },
  {
    file: "compositions/frames/07-close.html",
    id: "f07-close-video-launchops",
    html: `    <video id="f07-close-video-launchops" data-frame-video="approved" data-start="0" data-duration="6" data-track-index="2" data-frame-video-x="740" data-frame-video-y="474" data-frame-video-width="440" data-frame-video-height="248" data-frame-video-fit="cover" src="assets/demos/launchops-demo.mp4" muted playsinline preload="auto"></video>`,
  },
  {
    file: "compositions/frames/07-close.html",
    id: "f07-close-video-cinder",
    html: `    <video id="f07-close-video-cinder" data-frame-video="approved" data-start="0" data-duration="6" data-track-index="3" data-frame-video-x="1262" data-frame-video-y="474" data-frame-video-width="440" data-frame-video-height="248" data-frame-video-fit="cover" src="assets/demos/cinder-studio-demo.mp4" muted playsinline preload="auto"></video>`,
  },
];

for (const definition of definitions) {
  const filePath = resolve(projectDir, definition.file);
  let source = await readFile(filePath, "utf8");

  const escapedId = definition.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`<video[^>]+id=["']${escapedId}["']`).test(source)) {
    continue;
  }

  if (!source.includes(marker)) {
    throw new Error(`Cannot restore ${definition.id}: hoist marker missing from ${definition.file}`);
  }

  source = source.replace(marker, definition.html);
  await writeFile(filePath, source);
}

console.log(`Ensured ${definitions.length} approved frame videos.`);
