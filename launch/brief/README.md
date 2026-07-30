# Squid Product Hunt launch system

Status: Product Hunt thumbnail and eight-frame gallery exported and verified

Launch date: Tuesday, August 18, 2026

Product Hunt tagline: **Plan, build, verify, and export React apps**

This directory is an isolated production workspace for Squid's launch assets. It must not be imported by the production application or change product behavior. Final claims must be supported by a reproducible product state, captured UI, or an inspectable code path.

## Regenerate the complete package

From the repository root, run:

```bash
pnpm launch:export-gallery
```

The command starts the standalone Vite renderer and a local Squid server, waits for Aeonik and all layout work to settle, captures public product evidence and the launch demo applications with Playwright, renders every final composition, encodes the restrained thumbnail GIF with FFmpeg, verifies every PNG dimension, fails on missing expected files, writes SHA-256 checksums, and copies the upload-ready set to `launch/exports/product-hunt/`.

The exporter uses the Playwright Chromium binary when installed and falls back to macOS system Chrome. A running product can be supplied with `LAUNCH_PRODUCT_BASE_URL`; a running renderer can be supplied with `LAUNCH_RENDERER_URL`. The default local ports are 3188 and 4178.

## Product positioning

Squid is an AI React app builder for people who need more than an attractive first frame. It turns a rough idea, screenshot, or existing website into a planned, editable, verified React application that the user can export and own.

The core distinction is the complete path:

> Most AI app builders optimize for the first screenshot. Squid optimizes the entire path from an unclear idea to a verified React application you can own.

Primary headline: **The first prompt is only the beginning.**

Supporting headline: **From rough idea to React app you own.**

The launch should emphasize observable product outcomes: a clarified product brief, an approved plan, generated source, persistent follow-up edits, explicit quality states, recoverable versions, transparent usage, and a portable handoff.

## Target audiences

- Non-technical founders: make an unclear product idea concrete without surrendering code ownership.
- Indie hackers: move quickly while retaining editable source, repair paths, and export options.
- Developers: inspect files, select models, connect services, verify output, and continue outside Squid.
- Freelancers and agencies: turn a client brief or visual reference into a reviewable, recoverable project.
- Designers: use screenshots or websites as visual evidence and refine the generated application in context.
- Product managers: structure requirements through an interview and approve the plan before build work begins.
- Small-business owners: build a working web application from business language without learning a proprietary canvas.

## Core launch narrative

The canonical sequence is:

**Interview → Plan → Approve → Build → Refine → Verify → Export**

The story should unfold in that order. Direct Mode is a deliberate fast path beside the main narrative, not a replacement for it.

1. **Interview:** Plan Mode asks a compact set of three to five high-value product questions.
2. **Plan:** Squid translates the answers into a structured, inspectable build plan.
3. **Approve:** consequential product, design, data, and integration decisions stay visible before generation.
4. **Build:** the user chooses a model and Squid generates an editable multi-file React application from text, a screenshot, or a website reference.
5. **Refine:** follow-up edits retain project context; targeted edits, repair flows, checkpoints, and selective restoration keep iteration controlled.
6. **Verify:** static, runtime, and export checks are shown as separate states rather than compressed into one confidence claim.
7. **Export:** the user downloads a ZIP or publishes through GitHub and continues with portable source outside Squid.

Supporting proof points, used only when the corresponding product state is visible:

- Multiple selectable AI models with visible credit costs.
- API, GitHub, Vercel, and Supabase integration surfaces.
- Generation estimates and post-run receipts.
- Failed internal attempts and supported repair behavior represented accurately by the current billing contract.
- Version review, checkpoint labels, bookmarks, and selected-file restoration.
- Source export that includes runnable project configuration.

## Visual direction

- Premium and highly technical, with generous breathing room and restrained information density.
- Strong light/dark contrast, precise borders, compact status labels, and legible code or evidence panels.
- Real Squid UI and real generated outcomes as the visual center of gravity.
- Use the squid mark as a recognition device, not a decorative character. Tentacle curves may guide sequence or connect evidence only when they improve comprehension.
- Use the production blue system and neutral surfaces. Do not introduce decorative gradients beyond the existing logo and established Squid UI language.
- Prefer product-state labels such as `PLAN APPROVED`, `RUNTIME PASSED`, or `EXPORT VERIFIED` over model logos.
- No stock imagery, fake testimonials, fake customer logos, fake metrics, or unsupported competitor claims.
- Avoid “revolutionary,” “game-changing,” and “future of AI.”

### Verified design system sources

- Semantic tokens: `app/globals.css` defines light and dark HSL variables, blue primary/accent (`217 100% 50%`), neutral surfaces, status colors, and a `0.75rem` base radius.
- Extended palette: `tailwind.config.ts` adds `#0062FF`-adjacent blue values, `brand` (`#E1E7EC`), `brand-green` (`#9FFF00`), `bg-base` (`#EDEEF5`), and orange/pink/purple support palettes.
- Homepage display treatment: `app/(main)/homepage.css` uses Aeonik for display text, tight tracking, DM Sans for body text, and system monospace for technical labels.
- Application typography: root layout loads DM Sans through `next/font`; Inter and Instrument Serif packages are present; local Aeonik regular/medium/bold, Aeonik Mono, and Aeonik Fono files live under `public/Aeonik/`.
- Primary mark: `public/squidagent-logo.svg` is a 400×400 squid/agent mark with blue-to-cyan gradients, four tentacles, a spark, and white code-bracket eyes. Matching 192px and 512px PNGs are available.
- Reusable primitives: `components/ui/` contains button, dialog, drawer, input, select, switch, textarea, tooltip, scroll area, file tree, noise texture, border glow, and related controls.
- Reusable product evidence: `components/plan-review.tsx`, `components/quality-report-panel.tsx`, `components/generation-receipt.tsx`, `components/version-diff-dialog.tsx`, `components/code-runner.tsx`, `components/code-runner-react.tsx`, and the chat workspace provide the core proof surfaces.

## Exact required dimensions

The following dimensions are production targets, not suggestions. Platform requirements should be rechecked one week before export because third-party specifications can change.

| Deliverable                               |                Dimensions | Format and constraints                                  | Basis                                                                                        |
| ----------------------------------------- | ------------------------: | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Product Hunt thumbnail                    |                   240×240 | PNG; transparent or solid neutral background            | Product Hunt recommendation                                                                  |
| Product Hunt animated thumbnail, optional |                   240×240 | GIF, under 3 MB, restrained motion                      | Product Hunt recommendation                                                                  |
| Product Hunt gallery frames 01–08         |             1270×760 each | Lossless PNG, no critical content within 48 px of edges | Required launch package                                                                      |
| Gallery contact sheet                     |                  1270×760 | Lossless PNG                                            | Generated review artifact                                                                    |
| Thumbnail recognition sheet               |                   800×360 | Lossless PNG with 240, 120, 60, and 32 px tests         | Generated review artifact                                                                    |
| Thumbnail source master                   |                   960×960 | Lossless PNG at 4× delivery resolution                  | Generated editable master                                                                    |
| Launch video master                       |                 1920×1080 | MP4, H.264, 30 fps, 60 seconds, AAC audio               | Squid production master; Product Hunt accepts a full YouTube URL rather than a direct upload |
| YouTube thumbnail                         |                 3840×2160 | PNG or JPEG, 16:9                                       | Current YouTube recommendation                                                               |
| Open Graph launch card                    |                  1200×630 | PNG                                                     | Matches current Squid metadata contract                                                      |
| X landscape post                          |                  1200×628 | PNG                                                     | Current standalone-image recommendation                                                      |
| X square post                             |                 1200×1200 | PNG                                                     | Current standalone-image recommendation                                                      |
| LinkedIn link post                        |                  1200×627 | PNG or JPEG                                             | Current LinkedIn link-preview recommendation                                                 |
| LinkedIn square post                      |                 1200×1200 | PNG or JPEG                                             | Current LinkedIn square recommendation                                                       |
| Vertical short-video cut, optional        |                 1080×1920 | MP4, H.264, 30 fps, 15–30 seconds                       | Launch distribution target                                                                   |
| Landscape micro-demo GIF                  |                  1200×675 | GIF, 12 seconds maximum, 15 fps target                  | Owned-web and organic-social fallback, not Product Hunt gallery media                        |
| Desktop product capture master            |                  1440×900 | PNG, device scale factor 1                              | Aligns with existing showcase/evaluation sources                                             |
| Tablet product capture                    |                  768×1024 | PNG, device scale factor 1                              | Responsive QA evidence                                                                       |
| Mobile product captures                   | 414×896, 375×812, 320×720 | PNG, device scale factor 1                              | Aligns with existing generation-evaluation widths                                            |

Current external references:

- Product Hunt posting requirements: <https://help.producthunt.com/en/articles/479557-how-to-post-a-product>
- X creative specifications: <https://business.x.com/en/help/campaign-setup/creative-ad-specifications>
- LinkedIn image requirements: <https://www.linkedin.com/help/linkedin/answer/a521928>
- YouTube custom-thumbnail requirements: <https://support.google.com/youtube/answer/72431>

## Asset inventory

### Product Hunt gallery

Eight verified 1270×760 frames, in upload order:

1. `gallery/01-complete-workflow.png` — the complete promise, rough prompt, FieldFlow outcome, and Interview → Plan → Build → Verify → Export sequence.
2. `gallery/02-plan-mode.png` — representative three-question interview, structured plan, and approval action, explicitly labeled as representative.
3. `gallery/03-project-aware-editing.png` — source-backed representative project editor, focused follow-up, before/after FieldFlow output, and checkpoint action.
4. `gallery/04-verification.png` — real public Quality view plus separate passed, unresolved, and untested states. Runtime, export, and integration are not presented as passed.
5. `gallery/05-model-choice.png` — real public model trigger plus a catalog generated from the current `MODELS`, Plan Mode compatibility, and billing credit ranges in repository source.
6. `gallery/06-code-ownership.png` — real public Files view with ZIP, GitHub, deployment, and local-editor handoff paths.
7. `gallery/07-real-applications.png` — runnable FieldFlow and LaunchOps React launch demos plus the existing Cinder Studio Squid showcase capture, each with one outcome sentence and provenance.
8. `gallery/08-founder-story.png` — the approved maker quote and a product-focused founder card. No portrait is used because the repository does not contain a verified real founder photograph.

`gallery/product-hunt-gallery-contact-sheet.png` is the generated eight-frame review sheet.

### Thumbnail

- `thumbnail/squid-product-hunt-thumbnail.png` — static 240×240 primary thumbnail.
- `thumbnail/squid-product-hunt-thumbnail-source-960.png` — lossless 4× source master.
- `thumbnail/squid-product-hunt-thumbnail.svg` — editable vector source using the existing Squid mark.
- `thumbnail/squid-product-hunt-thumbnail.gif` — restrained 240×240 animated version under 3 MB.
- `thumbnail/squid-product-hunt-thumbnail-contact-sheet.png` — recognition tests at 240, 120, 60, and 32 px.

### Product screenshots

Raw, uncomposited captures should be retained for auditability:

- Homepage builder with Plan/Direct control and model picker.
- Screenshot or website-reference input state.
- Three-to-five-question interview.
- Structured plan awaiting approval.
- Active generation/build stream.
- Completed interactive preview and file tree.
- Persistent follow-up edit.
- Version review/checkpoint/restore dialog.
- Quality report with static, runtime, and export states.
- Export dialog for ZIP and GitHub/provider handoff.
- Generation receipt and authenticated usage ledger.
- Public `/example` project across Prompt, Plan, Preview, Files, and Quality tabs.

Every screenshot filename must include route/state, viewport, commit SHA, and capture date in its manifest even if the exported filename is shorter.

### Social

- Launch announcement cards for X and LinkedIn.
- A seven-step workflow card.
- A verification/ownership proof card.
- An Open Graph card aligned with the Product Hunt narrative.
- Optional vertical video cut and launch-day reminder card.

### Video and GIFs

- `video/squid-product-hunt-60s.mp4` — 60-second primary story.
- `video/squid-product-hunt-captions.vtt` — complete captions.
- `video/squid-product-hunt-poster.png` — YouTube/poster frame.
- `gifs/interview-to-plan.gif`, `gifs/refine-to-verify.gif`, and `gifs/export-handoff.gif` — short supporting demonstrations created only from recorded product behavior.

### Copy

The copy directory will hold the Product Hunt description, maker comment, gallery captions, video script, social variants, accessibility alt text, and a claim-to-evidence ledger. No final copy is generated in this initial task.

## Existing product routes and demo sources

### Public and capture-safe without authentication

- `/` — production homepage builder, model selection, Plan/Direct entry, screenshot input, prompt templates, and public navigation.
- `/example` — deterministic Waypoint project with Prompt, Plan, Preview, Files, Quality, and source-download views; explicitly states no account is required.
- `/gallery` — public project and curated-showcase gallery; session is optional.
- `/gallery/cinder-studio/preview`, `/gallery/relay-release-evidence/preview`, `/gallery/small-hours-table/preview` — curated generated landing examples.
- `/gallery/orbital-salvage/preview`, `/gallery/rune-circuit/preview`, `/gallery/echo-chamber/preview` — interactive generated game examples with Playwright interaction coverage.
- `/axon`, `/axion-studio`, `/cozypaws`, `/design-rocket-certificates`, `/forma`, `/jack`, `/mindloop`, `/mentality`, `/prisma`, `/questly`, `/rivr`, `/sentinel`, `/skyelite`, `/terraelix`, `/velorah` — public generated showcase routes.
- `/supabase` — a technical integration walkthrough using Aeonik and explicit workflow states.
- `/launch` — existing noindex launch landing route, currently useful only as a source reference because its video dependency is missing and its narrative predates this brief.
- `app/(main)/__chat-panel-qa` contains useful source-backed QA content, but the underscore-prefixed route segment is not a public capture route and resolves to 404. It is not used as product evidence.

### Authentication or data barriers

- `/dashboard` and `/dashboard/usage` require a valid Better Auth session for meaningful project and ledger state. The proxy redirects users without a session cookie, and server code validates session-backed data.
- `/chats/[id]` requires both a session cookie at the proxy and a real project record; model, follow-up, receipt, version, restore, integration, verification, and export states depend on the selected project/message history.
- GitHub publishing requires a connected GitHub integration and must be captured with repository/account secrets and personally identifying data hidden.
- Real runtime and export verification require the relevant project message, database records, and environment configuration.
- The synthetic launch API is not a screenshot surface; it requires a bearer secret and checks database/provider health.

Use a dedicated launch-capture account and a deterministic seed project. Do not automate sign-in with a personal production account, store session cookies in Git, or fabricate protected states in post-production.

## Existing capture, test, and media tooling

- `@playwright/test` 1.61.1 is installed and configured in `playwright.config.ts` for Chromium, traces on first retry, an isolated `.next-e2e` build directory, and an overridable `E2E_BASE_URL`.
- Existing browser suites cover the public example, showcase games, homepage, authentication, docs, and the authenticated launch flow.
- `scripts/run-generation-evals.ts` already defines five responsive screenshot widths: 1440, 768, 414, 375, and 320.
- Gallery code includes preview readiness messages, screenshot capture helpers, thumbnail upload/storage, and persisted thumbnail status.
- Website-reference capture exists through client screenshot utilities and the ScreenshotOne integration, but it is not a substitute for capturing authenticated Squid UI.
- FFmpeg 8.1.2 is available on the current workstation at `/opt/homebrew/bin/ffmpeg`, with H.264, HEVC, VP9, AV1, and VideoToolbox support. It is not pinned in the repository, so the scripts must perform a version/capability check.
- No repository dependency or configuration was found for Puppeteer, Storybook, or Remotion.
- The Playwright Chromium binary is currently missing from the local Playwright cache even though the package is installed. The launch exporter has a verified system-Chrome fallback on macOS.

## Existing analytics

- Root layout installs Plausible for `squidagent.app` and Ahrefs Web Analytics.
- Existing Plausible events include `Project Created`, `Prompt Started`, `First Build Completed`, `Build Failed`, `Screenshot Import Opened`, `Quality Report Opened`, `Generation Receipt Expanded`, `Targeted Edit Applied`, and related starter/template selection events.
- No dedicated Product Hunt attribution or launch-page conversion event was found in this audit.
- Launch links should eventually use a consistent UTM contract and existing funnel events. Any launch-specific event addition is a production behavior change and is explicitly out of scope for this initial task.

## Existing launch-related files

- `app/launch/page.tsx` — noindex launch landing page.
- `tests/e2e/launch-flow.spec.ts` — authenticated generation/export launch-flow coverage.
- `app/api/synthetic/launch/route.ts` — secret-protected provider/database synthetic check.
- `docs/launch/product-hunt-gallery.md` — older six-frame gallery outline whose referenced `videos/.../screenshots` files are absent.
- `public/diagrams/squid-agent-7-step.html` — existing coded seven-step architecture/journey diagram.
- `tests/e2e/example-workspace.spec.ts` — no-account public proof flow.
- `public/showcase/` and `features/gallery/showcase-*` — real example imagery and generated project sources.

## Asset production architecture

The implemented system has five isolated layers:

1. **Evidence capture:** `launch/scripts/export-gallery.ts` opens the public homepage and `/example` workspace with Playwright and retains lossless masters in `launch/screenshots/`.
2. **Runnable examples:** `launch/renderer/src/demo-apps.tsx` contains FieldFlow and LaunchOps as real React compositions with dedicated launch-render routes.
3. **Composition:** `launch/renderer/` is a standalone Vite/React renderer that reuses the production logo, local Aeonik files, source model catalog, billing credit ranges, Cinder Studio capture, and Squid's neutral/blue visual system. It is outside the production Next.js route tree.
4. **Motion and derivatives:** the same thumbnail React source renders static and frame-addressable states; FFmpeg encodes the GIF from 30 lossless PNG frames.
5. **QA and export:** the script checks dimensions from PNG headers, enforces expected-file presence, writes checksums and provenance to `launch/qa/asset-manifest.json`, generates both contact sheets, and copies upload-ready files to `launch/exports/product-hunt/`.

Renderer routes are `/launch-render/thumbnail`, `/launch-render/contact/thumbnail`, `/launch-render/gallery/1` through `/launch-render/gallery/8`, `/launch-render/demo/fieldflow`, `/launch-render/demo/fieldflow?state=updated`, and `/launch-render/demo/launchops`.

## Production order

1. Repository and brand audit — complete.
2. Claim-safe copy and evidence mapping — complete for this Product Hunt visual set.
3. Standalone renderer and runnable demo applications — complete.
4. Public product evidence capture — complete for homepage model selection and `/example` Files/Quality views.
5. Thumbnail, animation, eight gallery frames, contact sheets, manifest, and exports — complete.
6. Replace the four representative/authenticated states listed below when a dedicated capture account and deterministic project are available.
7. Re-run `pnpm launch:export-gallery`, review the contact sheets, and upload files from `launch/exports/product-hunt/` in filename order.
8. Re-capture or re-approve any state affected by product changes before August 18, 2026.

## Dependencies

- Node.js 20.19 or newer and the existing pnpm lockfile.
- Current repository dependencies, especially React, Next.js, Tailwind CSS, `tsx`, JSZip, and Playwright.
- Playwright Chromium for version 1.61.1 or macOS system Chrome.
- FFmpeg with H.264/AAC encoding and optional GIF palette generation.
- A local or preview Squid deployment pinned to a known commit.
- Required application environment for Better Auth, database access, generation, preview, export verification, and selected integrations.
- A dedicated capture account and seeded project with no personal or secret data.
- A Product Hunt personal maker account, draft access, and a YouTube account for the launch video.
- Final approval for Product Hunt copy, maker comment, public pricing/credit language, and any GitHub publishing state shown.

## Open risks

- Plan Mode's interview and approval frame is source-backed and representative, not an authenticated production capture.
- The project-aware editor and checkpoint/restoration frame is source-backed and representative, not an authenticated project-history capture.
- Runtime, export, and external-integration verification remain intentionally unresolved or untested in the visual. Current production records are required before any of those states can be changed to passed.
- GitHub publishing is shown as a supported handoff path, not a completed publish. A sanitized connected-account capture is still required for completion evidence.
- FieldFlow and LaunchOps are reproducible launch demo applications. LaunchOps is not presented as a production customer project or proof of live authentication.
- The repository does not contain a verified real founder photograph, so the founder frame intentionally uses a product-focused card.
- The public model trigger hydrates and captures correctly, but its dropdown did not open reliably under Playwright. The frame combines the real trigger with the current source catalog and credit logic instead of changing production behavior.
- The standalone launch renderer uses a very subtle radial wash already consistent with Squid's existing logo/UI treatment; no generic decorative imagery is introduced.
- Platform requirements may change before launch and should be rechecked one week before August 18, 2026.

## What can be generated entirely from code

- Product Hunt thumbnail and optional restrained hover animation.
- Gallery opener, workflow diagram, closing/ownership frame, labels, chrome, and screenshot framing.
- Social announcement, workflow, verification, and Open Graph layouts.
- Video title card, seven-step interstitials, lower thirds, captions, transitions, and end card.
- GIF encoding, resizing, palette generation, contact sheets, checksums, and manifests.
- Dimension, file-size, safe-area, filename, and missing-evidence QA.

Code-generated assets may use only verified copy, tokens, logo geometry, and source-backed claims. They may not recreate a product state that was not actually captured.

## What requires real product state or screenshots

- Plan Mode's authenticated three-to-five-question interview.
- Approved structured plan and revision state from a real project.
- Direct Mode and selectable model UI with current pricing/credit badges.
- Screenshot and website-reference ingestion.
- Live generation stream and completed multi-file application.
- Persistent follow-up editing and targeted edits.
- Repair status and any no-charge receipt language.
- Version history, checkpoint labeling, bookmarking, diff, and restoration.
- Static, runtime, and export verification states.
- Generation estimate, receipt, and usage ledger.
- ZIP download and GitHub/provider publishing handoff.
- Any integration connection or capability state.

The current package does not claim the unavailable states above. Replacement captures must come from a known commit and a named demo project, preserve unedited source masters, and be traceable through `launch/qa/asset-manifest.json` before publication.

## Final file locations

- Editable React renderer: `launch/renderer/`
- Export pipeline: `launch/scripts/export-gallery.ts`
- Raw public and demo captures: `launch/screenshots/`
- Final gallery PNGs: `launch/gallery/`
- Thumbnail PNG, 4× source, SVG, GIF, and recognition sheet: `launch/thumbnail/`
- Checksummed manifest: `launch/qa/asset-manifest.json`
- Upload-ready copy of the entire Product Hunt package: `launch/exports/product-hunt/`
