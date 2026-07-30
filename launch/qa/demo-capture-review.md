# Launch demo capture review

Reviewed: July 30, 2026

## Result

FieldFlow, LaunchOps, and Cinder Studio passed the automated capture gate and a manual visual review. The demos are isolated under the launch renderer and do not add application routes to the production Next.js runtime.

## Automated checks

- TypeScript: `pnpm typecheck` passed.
- Focused ESLint: launch demo sources, renderer routing, and capture script passed.
- Browser console: no page errors or error-level console messages in captured routes.
- Route coverage: all 13 documented demo routes passed at 1440 by 900 and 375 by 812 with no horizontal overflow.
- Deterministic states: `default`, `loading`, `error`, `empty`, `verified`, and `mobile` loaded for all three demos.
- Still exports: desktop 1440 by 900, mobile 375 by 812, feature 1440 by 900, and interactive 1440 by 900 for each demo.
- Recordings: three H.264 MP4 files at 1280 by 720 and 12 seconds each.
- Manifests: file presence, PNG dimensions, MP4 duration, byte size, and SHA-256 checksums verified.

The repository-wide `pnpm lint` gate still fails on the pre-existing `react-hooks/set-state-in-effect` error in `features/generation/client/generation-handoff-context.tsx:72`, plus unrelated warnings in existing production files. The focused launch lint and standalone type check pass.

## Visual review

- FieldFlow: reviewed public value proposition, mobile quick quote, lead dashboard, and confirmed appointment state. Copy, controls, and dashboard detail remain legible without cropped critical content.
- LaunchOps: reviewed desktop and mobile dashboard, real demo-source tree, detail drawer, and static, runtime, and export evidence sequence. Sample data and mocked integrations remain explicitly labeled.
- Cinder Studio: reviewed desktop and mobile hero, Stone Court detail, contact confirmation, and representative recording frames. Local generated images load at full resolution and preserve the intended crop.

## Evidence boundaries

- All people, companies, projects, and activity records are fictional fixtures.
- FieldFlow booking and LaunchOps integration states do not call external services.
- LaunchOps verification states describe deterministic sample evidence, not production telemetry.
- Cinder Studio contact confirmation is local and sends no message.

## Source imagery

Cinder Studio uses three original architectural studies generated for this demo with the built-in image generation tool. The prompt set requested original, unbranded, text-free concrete and coastal architectural scenes at restrained editorial aspect ratios. Source assets live in `launch/demo-projects/cinder-studio/assets`.

## Regeneration

Run `pnpm launch:capture-demos` from the repository root. If Playwright reports a missing recording encoder, run `pnpm exec playwright install ffmpeg` once and repeat the capture command.
