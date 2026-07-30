# Squid Product Hunt launch video

This is the reproducible 72-second, 1920×1080, 30 FPS launch composition for Squid. It is product-first: the public Squid composer and example project are recorded with Playwright, then combined with the deterministic FieldFlow, LaunchOps, and Cinder Studio demos. HyperFrames provides the editable HTML/GSAP scene system, timeline assembly, captions, audio mix, and H.264 rendering.

## Final outputs

- `squid-product-hunt-launch-captioned.mp4` — H.264 master with burned captions
- `squid-product-hunt-launch-clean.mp4` — H.264 caption-free master
- `squid-product-hunt-video-thumbnail.png` — 1920×1080 lossless thumbnail
- `SCENE_MANIFEST.json` — scene timing and evidence map
- `VOICEOVER.md` — final narration script
- `SHOT_LIST.md` — editorial and capture plan
- `qa/validation.json` — machine-readable codec, dimensions, frame-rate, duration, and file-size checks

## Regenerate

From the repository root:

```bash
pnpm launch:export-video
```

The export command restores source-video mounts after HyperFrames hoists them, rebuilds captions, assembles transitions, runs the full composition check, renders both masters at CRF 17, creates the thumbnail, and validates every output.

To refresh public product recordings first:

```bash
cd launch/video/product-hunt
npm run capture
```

The capture script starts the local Squid application unless `SQUID_VIDEO_PRODUCT_URL` is supplied, uses a 1440×900 viewport, loads fonts, hides development overlays, adds a normalized visible cursor, performs deterministic interactions, rejects console errors, and exports H.264 source clips at 30 FPS. Public `/` and `/example` routes avoid authentication and private data.

## Evidence boundaries

- Composer, project preview, files, quality panel, ZIP handoff, and the three showcase apps use real captured application UI.
- The three Plan Mode questions are representative, source-backed interview states because a public authenticated Plan Mode session is not available to deterministic capture.
- The repair beat changes only the supported runtime issue. The external integration remains visibly `Untested`.
- GitHub, local editor, and deployment are shown as continuation options, not as completed publishes or deployments.
- The narration does not claim every generated project is production-ready.
- No customer data, API keys, private administration screens, fake usage metrics, commercial music, or third-party competitor interfaces appear.

## Source layout

- `compositions/frames/` — seven editable scene compositions
- `compositions/captions.html` — burned-caption layer
- `assets/footage/` — deterministic public Squid recordings
- `assets/demos/` — deterministic showcase-app recordings
- `assets/voice/` and `assets/sfx/` — narration and locally licensed interface sounds
- `scripts/capture-product.mjs` — Playwright capture automation
- `scripts/restore-frame-videos.mjs` — reproducible HyperFrames hoist repair
- `scripts/export.mjs` — complete build and render pipeline
- `scripts/validate-exports.mjs` — delivery validation

The composition uses bundled Aeonik, Aeonik Mono, and Instrument Serif files, so rendering does not depend on remote fonts. There is intentionally no music bed.
