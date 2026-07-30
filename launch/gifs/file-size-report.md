# Squid Product Hunt GIF file-size report

Generated at 2026-07-30T18:29:45.795Z by `pnpm launch:export-gifs`.

Profile: 1270×760, 10 seconds, 12 captured frames per second. MP4 masters are H.264 at 24 fps; GIF and WebP alternatives loop infinitely.

GIF encoder: ffmpeg palettegen/paletteuse. Animated WebP encoder: img2webp.

| Flow                             |      MP4 |     GIF |     WebP | WebP savings vs GIF |
| -------------------------------- | -------: | ------: | -------: | ------------------: |
| Plan before building             | 304.3 KB | 2.18 MB | 517.1 KB |                 77% |
| Screenshot to editable React app | 334.6 KB | 2.49 MB | 570.5 KB |                 78% |
| Verify, repair, and export       | 331.9 KB | 2.30 MB | 525.6 KB |                 78% |

## Readability and privacy gates

- Critical on-screen labels are at least 18 px and remain inside the 1270×760 frame.
- Every click is anchored to its rendered control and must land within 2 px during capture.
- Each exported GIF is decoded at 6.5 seconds into its matching `*-display-check.png` for native-size visual review.
- All names, projects, screenshots, files, and verification results are deterministic fictional fixtures.
- The capture routes perform no network calls beyond the local renderer and expose no account, project, or provider credentials.
