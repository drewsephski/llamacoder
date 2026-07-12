---
format: 1920x1080
message: "Squid Agent turns an idea into a working app through a guided, visible process, then gives you the project to keep."
arc: Demo Loop with future-pacing hook
audience: founders, designers, small-business owners, and product people without a technical background
language: English
target_duration: 72s
destination: YouTube and website embed
angle: show the complete idea-to-owned-app journey in plain language
music: warm, optimistic electronic pulse with a human sense of lift and no vocals
mode: collaborative
---

## Video direction

Palette system: use the Blue Professional frame system exactly—white canvas, near-black display type, Squid blue `#326DF5` as the primary accent, blue-tinted glass surfaces, and the positive green only for verified pass states. DM Sans carries every text role. Add premium depth through fine grid fields, soft radial blue light, glass edge highlights, nested frames, and restrained specular sweeps—not generic shadows. Content frames use the slide-header and bottom progress rail; the opener and closer may use the diagonal panel, dot field, and concentric-ring atmosphere.

Motion grammar: one continuous product film with smooth long-tail settles and voiceover-paced reveals. Every named idea arrives on its spoken cue, especially through the back half of each frame. UI changes use visible cursor actions whose pointer tip lands on the exact target center at every press, same-anchor morphs, short surface transformations, depth-of-field focus pulls, and velocity-matched internal seams. No bounce. Camera movement stops once the payoff is readable.

Rhythm: Frames 1–2 create possibility and introduce the product; Frames 3–4 accelerate through planning and the visible build; Frame 5 is the deliberate trust breather; Frame 6 regains interaction energy; Frame 7 expands into ownership; Frame 8 resolves slowly and confidently. Final states hold still, with subtle bounded cursor or progress activity only when it reinforces the subject.

Negative list: no captured website or product screenshots, technical architecture diagrams, code walls, fake terminal chrome, abstract AI blobs, rainbow gradients, generic stock imagery, floating decorative cards, or tiny unreadable UI. All product imagery is purpose-built as native HTML/CSS/SVG illustration. Avoid slideshow motion, screensaver motion, infinite loops, lazy breathing, and late camera drift. Keep all load-bearing content above the bottom caption band.

## Frame 1 — Your idea should not stay an idea

- scene: A handwritten app idea lifts from a notebook and resolves into a polished app window
- voiceover: "What if your app idea did not have to stay in a notebook—or wait months to become a real app?"
- duration: 4.571s
- transition_in: cut
- status: animated
- src: compositions/frames/01-idea-to-app.html
- type: hook
- persuasion: Future pacing
- beat: possibility + curiosity
- blueprint: typewriter-reveal (Adapt)
- asset_candidates:
- focal: purpose-built app-window illustration
- roles: custom app-window illustration = foreground product payoff · notebook line and typed question = opening foreground subject · diagonal tint, dot field, and radial light = background
- sfx: pencil tick, soft interface whoosh

Adapt: keep the typed-human-thought and same-center collapse into a product payoff; replace the brand-only reveal with the real Squid prompt surface becoming the app window.
Scene 1 (0.0–2.2s): on the low-density cover treatment, “WHAT IF YOUR APP IDEA…” types beside a blinking caret using type-on with caret (`discrete-text-sequence`, `context-sensitive-cursor`); the line sits upper-left in an asymmetric 60/40 composition while a simple notebook rule occupies the lower-left.
Scene 2 (2.2–4.4s): as the narration says “stay in a notebook,” the typed line settles onto the notebook rule; “WAIT MONTHS” types on the right, then is crossed out by a cobalt marker sweep (`css-marker-patterns`). The Squid prompt card begins to resolve behind it but remains secondary.
Scene 3 (4.4–6.0s): on “real app,” the notebook and wait label collapse at one center into the full Squid interface via a same-anchor scale-swap (`scale-swap-transition`); the product window fills the center-right at hero scale and holds still for the transition.

narrativeRole: Opens in the viewer's world and turns an abstract idea into an immediate, desirable outcome.
keyMessage: A real app can start with an ordinary idea, not a technical specification.

## Frame 2 — Meet Squid Agent

- scene: The real Squid Agent prompt accepts an idea, screenshot, and website reference, then reveals a working app preview
- voiceover: "Meet Squid Agent. Describe what you want in plain English, add a screenshot or website, and watch it become a working React app."
- duration: 7.915s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/02-meet-squid.html
- type: product_intro
- persuasion: Friction reduction
- beat: relief + intrigue
- blueprint: cursor-ui-demo (Reproduce)
- asset_candidates: assets/logo-5a9e094f.svg — official blue Squid Agent mark
- focal: purpose-built Squid prompt and app-preview surface
- roles: custom prompt and app-preview surface = foreground UI · logo-5a9e094f.svg = supporting identity anchor · radial blue light and fine grid = background
- sfx: cursor arrival, three soft input clicks, result chime

Reproduce: use the cursor-driven first-look structure; the reconstructed prompt surface responds to plain text, a screenshot chip, and a website chip before revealing the result.
Scene 1 (0.0–1.8s): the official Squid mark self-draws (`svg-path-draw`) beside “MEET SQUID AGENT,” while the prompt window establishes centered in a layered-depth composition; a custom cobalt cursor enters from the lower-right.
Scene 2 (1.8–4.2s): on “describe what you want,” the cursor clicks the prompt and types “Build a simple booking app” using cursor click + ripple and discrete typing (`cursor-click-ripple`, `discrete-text-sequence`); the camera makes one short focus-lock move toward the field (`coordinate-target-zoom`).
Scene 3 (4.2–6.1s): as “screenshot or website” is spoken, two reference chips arrive sequentially beneath the prompt through dynamic content sequencing (`dynamic-content-sequencing`); the cursor taps each and both switch to the cobalt selected state.
Scene 4 (6.1–8.0s): on “working React app,” the cursor presses BUILD, the prompt card morphs into a clean app-preview window (`card-morph-anchor`), and a small “PROJECT READY” pill appears; camera settles and the result holds.

narrativeRole: Names the product and explains what goes in and what comes out without internal architecture vocabulary.
keyMessage: Plain language and visual references become a working React application.

## Frame 3 — A plan before the build

- scene: Squid researches current information, asks three compact questions, and presents a plan with an approval button
- voiceover: "Squid can research current information, ask the few questions that matter, and turn your answers into a clear plan. Nothing builds until you approve it."
- duration: 9.718s
- transition_in: crossfade
- status: animated
- src: compositions/frames/03-plan-first.html
- type: feature_showcase
- persuasion: Risk reversal
- beat: clarity + control
- blueprint: cursor-ui-demo (Adapt)
- asset_candidates:
- focal: purpose-built guided-planning cockpit
- roles: custom prompt card = supporting entry surface · research source strip, question cards, plan card, approval button = foreground workflow · white canvas and fine grid = background
- sfx: search sweep, three question ticks, approval click

Adapt: keep the cursor-driven end-to-end workflow and final press; change the interaction targets into research, compact questions, a readable plan, and explicit approval.
Scene 1 (0.0–2.5s): the prompt surface shifts to the left 40% while a “CHECKING CURRENT SOURCES” strip draws across the right with three source markers arriving on cue (`svg-path-draw`, `dynamic-content-sequencing`); the cursor follows the active source without moving the camera.
Scene 2 (2.5–5.2s): as the narration says “few questions,” three compact question cards replace the source strip one at a time through same-anchor scale-swaps (`scale-swap-transition`); the cursor selects one answer per card and the progress rail advances.
Scene 3 (5.2–7.8s): on “clear plan,” the cards condense into a single large plan sheet with three plain-language sections—WHAT YOU’RE BUILDING, KEY SCREENS, HOW IT SHOULD FEEL—using a card morph-anchor (`card-morph-anchor`) in an asymmetric 60/40 frame.
Scene 4 (7.8–10.0s): “NOTHING BUILDS YET” holds above the plan until the cursor reaches APPROVE PLAN; on “approve it,” cursor and button compress together (`physics-press-reaction`) and the state changes to APPROVED. Motion stops on the green check.

narrativeRole: Shows that Squid collaborates before spending time or credits, so the viewer stays in control of consequential choices.
keyMessage: Squid researches and plans with the user, then waits for explicit approval.

## Frame 4 — Watch the app come together

- scene: An approved plan becomes a live preview while pages, interactions, and project files arrive in sync
- voiceover: "Approve the plan, and Squid builds in front of you—pages, interactions, and the real project files, all coming together."
- duration: 7.837s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/04-visible-build.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: momentum + excitement
- blueprint: device-surface-showcase (Adapt)
- asset_candidates:
- focal: purpose-built generated-app showcase
- roles: custom booking surface = foreground final preview · custom portfolio surface = supporting page state · custom campaign surface = supporting page state · file rail = supporting project proof · luminous blue stage = background
- sfx: build pulse, three page reveals, file creation ticks

Adapt: keep the persistent floating product window and screen cycling; pair the generated previews with a synchronized, human-readable project-file rail rather than a technical code wall.
Scene 1 (0.0–2.0s): an “APPROVED PLAN” pill presses into a large floating app window centered at 60% width; a restrained build pulse travels along the bottom progress rail while the first Phoenix preview coasts in on a smooth long-tail settle.
Scene 2 (2.0–4.8s): on “builds in front of you,” the window cycles Phoenix → PortfolioOS using a short internal push cut (`scale-swap-transition`, velocity-matched seam); a side headline updates from PAGE 1 to PAGE 2 on the same spoken cue.
Scene 3 (4.8–7.3s): as “pages, interactions” is spoken, PortfolioOS changes to the Slotflow dashboard and two controls visibly respond inside the reconstructed surface; the window remains the hero and the camera stays static.
Scene 4 (7.3–10.0s): on “real project files,” a slim file rail assembles beside the preview—APP, PAGES, COMPONENTS, STYLES—one item per cue (`center-outward-expansion` short-path variant); preview and rail lock together under “WORKING APP,” then hold.

narrativeRole: Delivers the central product proof by showing the result and its underlying project taking shape together.
keyMessage: Squid creates a usable interface and a real multi-file project, not just a static picture.

## Frame 5 — Quality you can see

- scene: The finished preview shifts aside as a simple quality panel checks broken pieces, missing files, and accessibility basics
- voiceover: "Then it checks for broken pieces, missing files, and basic accessibility problems—and shows you what passed before you move on."
- duration: 8.751s
- transition_in: crossfade
- status: animated
- src: compositions/frames/05-visible-quality.html
- type: benefit_highlight
- persuasion: Trust through visible evidence
- beat: reassurance + confidence
- blueprint: video-text-pivot (Adapt)
- asset_candidates:
- focal: purpose-built product dashboard and verification scanner
- roles: custom dashboard illustration = supporting finished result · quality checklist = foreground trust proof · verified badge = foreground payoff · white canvas and scan field = background
- sfx: diagnostic sweep, three restrained check ticks, verified chime

Adapt: keep the signature weight transfer from product proof to a hero statement; replace the video/stat pair with the finished app sliding aside for an understandable quality checklist.
Scene 1 (0.0–2.0s): the finished Slotflow app sits centered in a tinted surface under “YOUR APP LOOKS READY”; a single diagnostic sweep crosses it from left to right while the camera remains static.
Scene 2 (2.0–5.8s): as each risk is named, the app slides to the left 42% and three large checklist rows fill the vacated right side—BROKEN PIECES, MISSING FILES, ACCESSIBILITY BASICS—revealed sequentially through dynamic content sequencing (`dynamic-content-sequencing`).
Scene 3 (5.8–8.3s): each row resolves from checking to a green check in order; off-focus content softens briefly while “WHAT PASSED” grows at center-right (`depth-of-field-blur`, `counting-dynamic-scale` used as a nonnumeric scale emphasis).
Scene 4 (8.3–10.0s): the checklist and app condense into one calm “QUALITY: VISIBLE” card with a VERIFIED pill (`scale-swap-transition`); this is the deliberate still trust beat, held without drift.

narrativeRole: Translates technical diagnostics into a plain promise: the viewer can see whether the result holds together.
keyMessage: Quality checks are visible and understandable before handoff.

## Frame 6 — Change one thing, keep the rest

- scene: A cursor selects one headline, requests a change, and updates only that element while the rest of the app remains fixed
- voiceover: "Want a change? Select one part, say what should be different, and Squid updates the right place while keeping everything else intact."
- duration: 7.889s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/06-focused-edit.html
- type: feature_showcase
- persuasion: Loss aversion and control
- beat: ease + empowerment
- blueprint: cursor-ui-demo (Reproduce)
- asset_candidates:
- focal: purpose-built editable launch-page illustration
- roles: custom launch-page illustration = foreground editable app surface · selection outline and edit tray = foreground interaction · preserved-layout indicators = supporting proof · white canvas and blue light = background
- sfx: selection click, typing ticks, focused update whoosh

Reproduce: perform one specific editing workflow end to end and land on the preserved result.
Scene 1 (0.0–2.0s): the Phoenix page establishes as a large floating window; a custom cursor enters and the headline receives a cobalt selection outline on “want a change?” (`cursor-click-ripple`).
Scene 2 (2.0–4.2s): on “select one part,” a compact edit tray anchors beside the selected headline while the rest of the interface dims slightly through selective focus (`depth-of-field-blur`); the camera makes one short zoom-to-target and stops.
Scene 3 (4.2–6.8s): the cursor types “Make this headline warmer and more inviting” (`discrete-text-sequence`), then presses UPDATE; the button gives one tactile press (`press-release-spring`).
Scene 4 (6.8–8.7s): the selected headline swaps to its revised state at the same anchor (`scale-swap-transition`); a thin comparison bracket proves the surrounding navigation, image, and CTA have not moved.
Scene 5 (8.7–10.0s): “ONE CHANGE · EVERYTHING ELSE INTACT” reveals across the upper third, then the selection outline and page hold still.

narrativeRole: Removes the fear that one follow-up request will destroy a good result.
keyMessage: Squid supports focused, non-destructive changes.

## Frame 7 — Keep what you made

- scene: The approved app branches into share, remix, and download, then opens into a complete project bundle with instructions and reports
- voiceover: "When it feels right, share it, remix it, or download the complete project—with the code, setup instructions, and quality report included."
- duration: 9.587s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/07-own-the-project.html
- type: benefit_highlight
- persuasion: Ownership and risk reversal
- beat: confidence + freedom
- blueprint: grid-card-assemble (Adapt)
- asset_candidates:
- focal: purpose-built finished-project artifact
- roles: custom finished-app illustration = supporting result · share, remix, download actions = foreground choice rail · project bundle contents = foreground ownership proof · white canvas and connection field = background
- sfx: three output clicks, bundle unfold, ownership resolve

Adapt: keep the accumulating benefit array; begin with the finished app, branch into three actions, then assemble the complete-project contents as the ownership proof.
Scene 1 (0.0–2.4s): the PortfolioOS app holds centered with a small “READY TO KEEP” pill; three connector stems begin drawing from its lower edge (`svg-path-draw`) but their destinations remain hidden.
Scene 2 (2.4–5.6s): SHARE, REMIX, and DOWNLOAD arrive one per spoken cue into a three-column action rail (`center-outward-expansion` short-path variant); each receives a restrained cobalt click state as it is named.
Scene 3 (5.6–8.8s): DOWNLOAD becomes the focal action and unfolds into four large bundle cards—CODE, SETUP, QUALITY REPORT, DEPLOY CONFIG—assembling sequentially into a 2×2 grid (`grid-card-assemble`, `dynamic-content-sequencing`).
Scene 4 (8.8–11.0s): the app and bundle pull into one balanced 60/40 ownership frame; “THE COMPLETE PROJECT” resolves above them and the bottom rail reaches 100%. Everything holds still on “included.”

narrativeRole: Lands the product's differentiation: the result leaves the platform as a useful, self-describing project.
keyMessage: The viewer can share, remix, inspect, and download the complete project.

## Frame 8 — From idea to app you keep

- scene: The journey condenses into the Squid Agent mark and a single Start Building button at squidagent.app
- voiceover: "From first idea to an app you can keep. That is Squid Agent. Start building at squidagent.app."
- duration: 7.053s
- transition_in: crossfade
- status: animated
- src: compositions/frames/08-start-building.html
- type: cta
- persuasion: Identity and direct action
- beat: satisfaction + motivation
- blueprint: cta-morph-press (Reproduce)
- asset_candidates: assets/logo-5a9e094f.svg — official blue Squid Agent mark
- focal: assets/logo-5a9e094f.svg
- roles: logo-5a9e094f.svg = foreground identity anchor · CTA button and URL = foreground action · diagonal blue tint, dot field, concentric rings = background atmosphere
- sfx: soft logo resolve, cursor approach, final click

Reproduce: keep the centered identity-to-action morph and human-aimed click; extend the hold so the product promise and URL both read cleanly.
Scene 1 (0.0–2.0s): the official Squid mark self-draws at center (`svg-path-draw`) while “FROM FIRST IDEA” and “TO AN APP YOU KEEP” reveal above and below it on separate spoken cues (`dynamic-content-sequencing`); concentric blue-tint rings settle behind the mark.
Scene 2 (2.0–3.5s): on “Squid Agent,” the promise and mark condense at the same center into one solid blue START BUILDING button (`scale-swap-transition`); `squidagent.app` appears beneath as the stable URL rail.
Scene 3 (3.5–5.2s): a custom cursor approaches from off-stage on a decelerating path and lands slightly off-center on the button; the camera remains static.
Scene 4 (5.2–7.0s): cursor and CTA compress together and release (`physics-press-reaction`), sending one bounded ripple through the concentric rings (`cursor-click-ripple`); the clicked state and URL hold to the end.

narrativeRole: Distills the whole journey into one memorable promise and one clear next action.
keyMessage: Squid Agent turns an idea into an app the viewer can keep.
