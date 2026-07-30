---
format: 1920x1080
message: "Squid carries an unclear idea through planning, building, refinement, verification, and export into React code the user owns."
arc: "BAB with a product demo loop"
audience: "founders, developers, designers, agencies, product managers, and small-business owners"
duration: 72s
fps: 30
music: none
captions: burned-in and caption-free masters
---

## Video direction

- Palette: Squid white canvas, near-black display, #326DF5 primary action, #0062FF supporting blue, cool blue-tinted surfaces, and status colors only where the real product uses them.
- Type: Aeonik display and DM Sans body/labels, both loaded locally; large editorial headlines with restrained monospace metadata.
- Motion grammar: smooth power3 long-tail settles, VO-paced sequential reveals across the back half of each shot, velocity-matched internal seams, and deterministic GSAP timelines only.
- Rhythm: Frames 1–2 move quickly, Frame 3 earns a longer explanatory read, Frame 4 is the interaction peak, Frame 5 slows for status legibility, Frame 6 becomes a clear handoff rail, and Frame 7 holds still for the URL.
- Caption keep-out: primary content stays in the upper 83%; the lower safe band is reserved even in the clean master.
- Negative list: no bounce, lazy breathing, late slow pans, screensaver motion, front-loaded slideshow reveals, generic AI gradients, sparkles, robots, brains, magic wands, model-logo walls, fake activity, invented passes, or private data.

## Frame 1 — The first screen

- scene: A polished generated app gives way to the unresolved question of what happens after prompt one.
- duration: 5s
- poster: 2.6s
- transition_in: cut
- status: animated
- voiceover: "An impressive first screen is easy. A product that works five prompts later is not."
- src: compositions/frames/01-first-screen.html
- type: hook
- blueprint: video-text-pivot
- asset_candidates: assets/demos/fieldflow-demo.mp4, assets/product-stills/fieldflow-app-updated.png

Open cold on the familiar win, then reframe it as the beginning rather than the finish. The second title lands as the product footage recedes into an unresolved follow-up surface. No competitor UI appears.

- focal: assets/demos/fieldflow-demo.mp4
- roles: fieldflow-demo = cutout · fieldflow-app-updated = supporting
- sfx: impact-bass-1

Adapt `video-text-pivot`: keep the real video-to-type weight transfer; replace the prohibited invented hero metric with the verified editorial contrast between first screen and finished product.
Scene 1 (0.0–2.2s): FieldFlow runs in a large centered product window; “The first screen is becoming easy.” reveals above it in two chunks while the app remains the visual proof.
Scene 2 (2.2–3.6s): the product window slides left and scales down at the same anchor as a focused follow-up prompt enters right; the handoff preserves the blueprint's signature weight transfer (`scale-swap-transition`).
Scene 3 (3.6–5.0s): both yield to “Finishing the product is not.” in near-black display type with “not” underlined blue; the line holds still into the cut.

## Frame 2 — Meet Squid

- scene: The real composer moves through idea, screenshot, website URL, and API input methods.
- duration: 7s
- poster: 3.8s
- transition_in: cut
- status: animated
- voiceover: "Squid takes an idea, screenshot, or website through planning, generation, iteration, verification, and export."
- src: compositions/frames/02-meet-squid.html
- type: product_intro
- blueprint: prompt-type-submit-generate
- asset_candidates: assets/footage/composer-inputs.mp4, assets/brand/squidagent-logo.svg

Use the real captured composer as the hero surface. Four large callouts appear only when the corresponding real control is visible; the workflow rail establishes the complete promise by the end of the beat.

- focal: assets/footage/composer-inputs.mp4
- roles: composer-inputs = cutout · squidagent-logo = supporting
- sfx: click-soft

Adapt `prompt-type-submit-generate`: keep the real composer as the gravitational center and the typed input ritual; stop before generation because this beat introduces all accepted starting points.
Scene 1 (0.0–1.5s): existing Squid mark and “Start with what you have.” enter upper-left while the real composer window settles into the dominant lower-right zone.
Scene 2 (1.5–4.8s): the captured prompt types; Idea, Screenshot, Website URL, and API labels reveal one at a time beside the real corresponding controls (`dynamic-content-sequencing`), with the camera locked.
Scene 3 (4.8–7.0s): the four labels resolve into a single workflow rail — Plan → Build → Refine → Verify → Export — and hold while the real composer remains visible.

## Frame 3 — Plan Mode

- scene: A vague prompt becomes targeted questions, a structured plan, and explicit approval.
- duration: 14s
- poster: 8s
- transition_in: push-slide LEFT 0.4s
- status: animated
- voiceover: "In Plan Mode, Squid asks the product questions your first prompt usually misses, then creates a structured plan for approval."
- src: compositions/frames/03-plan-mode.html
- type: feature_showcase
- blueprint: spatial-pan-stations
- asset_candidates: assets/footage/prompt-to-plan.mp4, assets/product-stills/example-prompt.png, assets/product-stills/example-plan.png

The captured Prompt and Plan panels are the evidence anchors. Three representative product questions are explicitly framed as the questions Plan Mode resolves, not as a fabricated authenticated session. End on the real approved plan and a restrained approval confirmation.

- focal: assets/footage/prompt-to-plan.mp4
- roles: prompt-to-plan = cutout · example-prompt = supporting · example-plan = supporting
- sfx: click-soft, whoosh-short

Adapt `spatial-pan-stations`: keep the sequential station traversal; replace the wide historical timeline with a product-thinking rail anchored by real Prompt and Plan captures.
Scene 1 (0.0–3.8s): real Prompt panel enters upper-left in an asymmetric 60/40 layout; the vague request highlights on the spoken cue while only the first question marker appears on the right.
Scene 2 (3.8–8.4s): three question cards traverse left-to-right one at a time — customer, workflow, success condition — via pan/focus-lock (`viewport-change`), each landing as the narration says “questions”; three depth layers, no fabricated answers.
Scene 3 (8.4–11.8s): a velocity-matched horizontal seam hands the prompt surface to the real structured Plan panel; plan steps reveal sequentially down the page (`dynamic-content-sequencing`).
Scene 4 (11.8–14.0s): the approval control and “Ask before generating.” lock into a held read; one interface tick, then stillness.

## Frame 4 — Build and keep building

- scene: The generated app runs, accepts a focused edit, and keeps its existing interactions.
- duration: 15s
- poster: 8.5s
- transition_in: crossfade
- status: animated
- voiceover: "Squid builds the React application, retains the project context, and applies focused changes without forcing you to start over."
- src: compositions/frames/04-build-iterate.html
- type: feature_showcase
- blueprint: cursor-ui-demo
- asset_candidates: assets/footage/build-and-iterate.mp4, assets/product-stills/fieldflow-app.png, assets/product-stills/fieldflow-app-updated.png

The real public example footage proves the app is interactive. A before/after FieldFlow state then shows one focused project-aware change while the surrounding product remains stable; a checkpoint marker appears without claiming an unrecorded restoration event.

- focal: assets/footage/build-and-iterate.mp4
- roles: build-and-iterate = cutout · fieldflow-app = supporting · fieldflow-app-updated = supporting
- sfx: click-soft, ping

Adapt `cursor-ui-demo`: keep the real cursor-led workflow and result state; use captured interaction for the first cycle and a deterministic before/after surface for the focused edit.
Scene 1 (0.0–5.0s): the real public app fills a large upper safe-area window; the cursor moves a task at recorded speed, establishing that the generated app already works.
Scene 2 (5.0–8.0s): the timer starts and command surface opens as the narration reaches project context; the frame remains focused on the app, not explanatory chrome.
Scene 3 (8.0–12.5s): cut-the-curve seam to FieldFlow before state; a selected-element outline and focused follow-up request enter on separate cues, then the updated state scale-swaps at the same anchor (`scale-swap-transition`).
Scene 4 (12.5–15.0s): surrounding layout remains fixed while the changed element is emphasized; a factual “Checkpoint saved” marker appears and the result holds.

## Frame 5 — Verify and repair

- scene: Static, runtime, and export states are separated; one unresolved item moves through a supported repair without turning untested work into a pass.
- duration: 13s
- poster: 7s
- transition_in: cut
- status: animated
- voiceover: "It checks the project, explains what passed, identifies unresolved work, and repairs supported failures."
- src: compositions/frames/05-verify-repair.html
- type: benefit_highlight
- blueprint: device-surface-showcase
- asset_candidates: assets/footage/verify-and-export.mp4, assets/product-stills/example-quality.png, assets/product-stills/04-verification.png

Use the real Quality view first. Expand into a three-lane verification model with Passed, Unresolved, and Untested labels always visible. The repair movement changes only the supported problem; the integration lane remains Untested.

- focal: assets/footage/verify-and-export.mp4
- roles: verify-and-export = cutout · example-quality = supporting · 04-verification = supporting
- sfx: click-soft, chime

Adapt `device-surface-showcase`: keep the real product surface as the device and complete one truthful quality workflow; replace a generic feature carousel with three explicitly labeled verification lanes.
Scene 1 (0.0–3.6s): the real Quality panel rises into a rule-of-thirds frame; actual recorded statuses remain unchanged as “Know what actually works.” enters above it.
Scene 2 (3.6–7.4s): static, runtime, and export lanes reveal one-by-one in a full-width strip; Passed, Unresolved, and Untested chips appear with distinct shapes and colors on the spoken cues (`dynamic-content-sequencing`).
Scene 3 (7.4–10.8s): the unresolved supported item focuses while other lanes dim; Repair presses once (`press-release-spring`) and only that row updates.
Scene 4 (10.8–13.0s): the Untested integration lane remains visibly Untested; the composition holds long enough to read the boundary.

## Frame 6 — Own the code

- scene: Real React source moves through ZIP export, GitHub publishing, local editing, and deployment handoff.
- duration: 12s
- poster: 6.5s
- transition_in: push-slide LEFT 0.4s
- status: animated
- voiceover: "Inspect every file, publish to GitHub, export the source, and continue wherever you choose."
- src: compositions/frames/06-own-the-code.html
- type: benefit_highlight
- blueprint: spatial-pan-stations
- asset_candidates: assets/footage/verify-and-export.mp4, assets/product-stills/example-files.png, assets/product-stills/06-code-ownership.png

Start inside the real file tree and React source. Continue along a four-step handoff rail. Show GitHub as a supported publish destination, ZIP as an actual source export action, and local editor/deployment as continuation paths rather than completed deployments.

- focal: assets/footage/verify-and-export.mp4
- roles: verify-and-export = cutout · example-files = supporting · 06-code-ownership = supporting
- sfx: click-soft, ping

Adapt `spatial-pan-stations`: keep the wide traversal and focused station landings; stations are ownership paths, not chronological claims of completed publishing.
Scene 1 (0.0–3.4s): the real Files view fills the left 70%; React source and the file tree focus sequentially as “Inspect every file” lands.
Scene 2 (3.4–6.5s): the real Download source action presses, then hands off through a velocity-matched seam to a four-station rail.
Scene 3 (6.5–10.0s): ZIP export, GitHub publishing, local editor, and deployment handoff stations focus one at a time with pan/focus-lock (`viewport-change`); labels use “Export,” “Publish,” “Continue,” and “Handoff,” never “Deployed.”
Scene 4 (10.0–12.0s): the rail resolves into “Your React code leaves with you.” and holds with the actual source tree still visible.

## Frame 7 — Plan. Build. Verify. Export.

- scene: The Squid mark resolves above the three deterministic showcase applications and squidagent.app.
- duration: 6s
- poster: 3.4s
- transition_in: crossfade
- status: animated
- voiceover: "Squid is live. Build your first application and tell me where the workflow should go next."
- src: compositions/frames/07-close.html
- type: cta
- blueprint: logo-assemble-lockup
- asset_candidates: assets/brand/squidagent-logo.svg, assets/demos/fieldflow-demo.mp4, assets/demos/launchops-demo.mp4, assets/demos/cinder-studio-demo.mp4

Resolve the seven-stage story into the four-word launch line. The demo strip proves range without invented customer logos or metrics. Finish on squidagent.app inside the mobile-safe title area.

- focal: assets/brand/squidagent-logo.svg
- roles: squidagent-logo = cutout · fieldflow-demo = supporting · launchops-demo = supporting · cinder-studio-demo = supporting
- sfx: chime

Adapt `logo-assemble-lockup`: keep the parts-arrive lockup and long static close; use the three real demo surfaces as the arriving parts rather than invented logo geometry.
Scene 1 (0.0–2.8s): three showcase videos enter as an equal-width triptych, one at a time — FieldFlow, LaunchOps, Cinder Studio — with short outcome labels and no metrics.
Scene 2 (2.8–4.4s): the triptych scales down as the existing Squid mark draws/settles above it; “Plan. Build. Verify. Export.” reveals word-by-word (`dynamic-content-sequencing`).
Scene 3 (4.4–6.0s): `squidagent.app` wipes in below the lockup; all motion resolves to a dead-static mobile-safe hold.
