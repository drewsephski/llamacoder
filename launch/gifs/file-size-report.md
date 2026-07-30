# Squid Product Hunt GIF file-size report

Generated at 2026-07-30T15:12:40.571Z by `pnpm launch:export-gifs`.

Profile: 1270×760, 10 seconds, 12 captured frames per second. MP4 masters are H.264 at 24 fps; GIF and WebP alternatives loop infinitely.

GIF encoder: ffmpeg palettegen/paletteuse. Animated WebP encoder: img2webp.

| Flow | MP4 | GIF | WebP | WebP savings vs GIF |
| --- | ---: | ---: | ---: | ---: |
| Plan before building | 259.5 KB | 1.72 MB | 442.5 KB | 75% |
| Screenshot to editable React app | 301.8 KB | 2.26 MB | 507.4 KB | 78% |
| Verify, repair, and export | 277.3 KB | 2.06 MB | 453.5 KB | 78% |

## Readability and privacy gates

- Critical on-screen labels are at least 18 px and remain inside the 1270×760 frame.
- Each exported GIF is decoded at 6.5 seconds into its matching `*-display-check.png` for native-size visual review.
- All names, projects, screenshots, files, and verification results are deterministic fictional fixtures.
- The capture routes perform no network calls beyond the local renderer and expose no account, project, or provider credentials.
