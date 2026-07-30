# Squid Product Hunt GIFs

Run from the repository root:

```bash
pnpm launch:export-gifs
```

The command starts the isolated launch renderer, captures 120 deterministic
Playwright frames for each real Squid workflow, builds a high-quality H.264 MP4,
then exports an infinite-loop GIF, animated WebP, poster, decoded display-size
check, checksum manifest, and file-size report.

The capture routes are launch-only and use fictional fixtures. They mirror the
shipping Plan Review, question flow, screenshot import, preview device switcher,
quality report, repair, and export surfaces without requiring authentication or
loading private project data.

Output profile:

- 1270×760, matching Product Hunt's recommended gallery image dimensions
- 10 seconds per flow
- 12 captured fps; 24 fps H.264 master
- infinite-loop GIF and animated WebP
- no audio, remote requests, secrets, or personal information

`record-gifs.ts` owns deterministic browser capture and MP4/poster generation.
`export-gifs.ts` owns GIF/WebP conversion, validation, manifests, and reporting.
It also syncs each MP4 and poster to `public/launch/gifs/`, which is the landing
page's optimized playback source.
