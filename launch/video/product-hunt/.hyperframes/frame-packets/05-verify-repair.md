# Frame packet: 05-verify-repair

## Project inputs

- Project: /Users/drewsepeczi/llamacoder/launch/video/product-hunt
- Design tokens: /Users/drewsepeczi/llamacoder/launch/video/product-hunt/frame.md
- RULES_DIR: /Users/drewsepeczi/.agents/skills/hyperframes-animation/rules

## Assigned storyboard block

## Frame 5 — Verify and repair

- scene: Static, runtime, and export states are separated; one unresolved item moves through a supported repair without turning untested work into a pass.
- duration: 13s
- poster: 7s
- transition_in: cut
- status: outline
- voiceover: "It checks the project, explains what passed, identifies unresolved work, and repairs supported failures."
- src: compositions/frames/05-verify-repair.html
- type: benefit_highlight
- blueprint: device-surface-showcase
- asset_candidates: assets/footage/verify-and-export.mp4, assets/product-stills/example-quality.png, assets/product-stills/04-verification.png

Use the real Quality view first. Expand into a three-lane verification model with Passed, Unresolved, and Untested labels always visible. The repair movement changes only the supported problem; the integration lane remains Untested.

- focal: assets/footage/verify-and-export.mp4
- roles: verify-and-export = cutout · example-quality = supporting · 04-verification = supporting
- sfx: status-tick, repair-confirm

Adapt `device-surface-showcase`: keep the real product surface as the device and complete one truthful quality workflow; replace a generic feature carousel with three explicitly labeled verification lanes.
Scene 1 (0.0–3.6s): the real Quality panel rises into a rule-of-thirds frame; actual recorded statuses remain unchanged as “Know what actually works.” enters above it.
Scene 2 (3.6–7.4s): static, runtime, and export lanes reveal one-by-one in a full-width strip; Passed, Unresolved, and Untested chips appear with distinct shapes and colors on the spoken cues (`dynamic-content-sequencing`).
Scene 3 (7.4–10.8s): the unresolved supported item focuses while other lanes dim; Repair presses once (`press-release-spring`) and only that row updates.
Scene 4 (10.8–13.0s): the Untested integration lane remains visibly Untested; the composition holds long enough to read the boundary.

## Selected blueprint: device-surface-showcase

# device-surface-showcase — Device / Surface Showcase

**intent**: A product surface — a device mockup or a floating browser/app window — is the hero held in frame while its screens cycle through a real flow, showcased by a camera move that ranges from a static hold to a continuous 3D push.

**roles served**

- Key_Feature (from key-feature-device-screen-tour, key-feature-floating-window-scroll, key-feature-3d-device-hand-demo): show a feature being \_experienced inside its real interface\* — the surface houses the action and its screens advance through a flow, rather than enumerating tiles or chasing a cursor across a workflow. (Note: the three founding drafts are Key_Feature and variants differ by MECHANIC, not role; the mined stepwise-flow variant widens the blueprint to Product_Intro.)
- Key_Feature (from demo-page-scroll-spotlight): the floating-window push-scroll variant carried to a spotlight climax — a real webpage rendered as a tilted 3D card coasts in (power2, like a phone held up — no spring), header keywords flare on a karaoke glow as the VO names them, the page rolls to the demoed section, and one element LIFTS off the surface (translateZ + scale) under a radial spotlight that dims the rest.
- Product_Intro (from stepwise-flow-completion): a compact end-to-end product flow — setup/auth → action → success/confirm — plays out cursorless as successive screen states inside the held surface, capped by a confirming button press; bookended by title-card beats. The surface introduces the product by \_completing its core loop\*, not by touring screens.
- Key_Feature (from `showcase-carousel`): the showcase-carousel — two surfaces in sequence (a widget card cycling brand skins, a phone frame with app screens sliding through it) gated by interstitial claim words; the screen cycle is a breadth carousel ("N brands / N apps"), not a flow.

**duration**: 5–11.3s (page-scroll-spotlight 5–9s · floating-window 7.8s · 3d-hand 7.9s · in-device approval 7.9s · stepwise-flow 8.5–9.4s · device-tour 9.6s · showcase-carousel 11.3s)

**shot structure** One product surface — a `[device mockup]` or a `[floating browser/app window]` — is the persistent hero on a `[styled backdrop: gradient / radial / stylized 3D void]`; its `[screens/sections]` cycle through a real `[product flow]` while a showcase camera (static-hold, push-in→zoom-out, or one continuous push) presents it. Each screen state holds ~1.0–1.5s.

- Scene 1 (0.0–~1.5s): The surface ESTABLISHES — it `[slides in from an edge / drifts in from a tilt / dissolves from a full-frame title card]` and settles, with a `[accent shape or backdrop]` resolving behind it; the first `[screen]` is visible. The showcase camera begins (see variants).
- Scene 2 (~1.5–~Xs): The surface is OPERATED on its own face — a `[tap/select/scroll]` triggers the first screen advance: old content `[pushes out / scrolls up]`, new `[screen/section]` `[pulls up / pushes in from the side]`; concurrently a `[label / header word / side headline]` updates. The camera continues its move.
- Scene 3+ (~Xs–end, repeat for `[2–4 screen beats]`): The surface ADVANCES through successive `[screens/sections]`, each a discrete swap or scroll synced to the surface's flow, while the secondary copy `[swaps out-up / in-up]` or stays marked to hold reading position. HOLDS on the final `[screen]` (or, for one variant, blooms out — see variant).

- Variant — static-tour (key-feature-device-screen-tour, 9.6s): a `[device mockup]` slides in from off-screen and settles (ease-out); an `[accent-color shape]` scales up behind it (spring overshoot). Camera STAYS STATIC the entire clip — all motion is element/UI-level: a tap COMPRESSES a button (95%→100%), the UI scrolls/transitions to the next view (old pushes out, new pulls up), and a `[side headline]` SWAPS beside the device (old slides up + fades, new slides up + in) per screen. Holds on the final screen. No camera move, no cursor.
- Variant — floating-window (key-feature-floating-window-scroll, 7.8s): OPENS on a full-frame `[title card]` (a small `[icon]` draws in at center, `[feature name]` below; holds ~2s), which DISSOLVES to a `[macOS-style browser/app window]` floating on a `[vivid gradient]` (traffic-lights + `[URL pill]` + tabs; left nav, central content, right `[sidebar]`). Camera PUSHES IN on a `[target region/sidebar]` (active item highlighted `[accent]`, a cursor drifts down the list), then ZOOMS BACK OUT to re-frame the whole window while the content SCROLLS through `[sections]`; the `[highlighted item]` stays marked. One push-in→zoom-out arc, gated by the title-card opener.
- Variant — 3d-hand (key-feature-3d-device-hand-demo, 7.9s): FULLY 3D — a `[3D device]` drifts in a `[stylized 3D void / bloom + particles]`, opening tilted and self-rotating to face the lens nearly flat as ONE CONTINUOUS forward camera push begins (no cuts). A glossy `[3D hand]` rises from the bottom-foreground and GESTURE-DRIVES the surface: it swipes to scroll a `[picker/sidebar panel]` of `[option cards]` and taps `[option]` (while a `[header word]` letter-flips in place); the selection APPLIES — a `[new layout]` grows from center to fill the device face, nav flips, a `[marquee]` scrolls horizontally; the hand swipes again to scroll the page upward through `[sections]`, then drifts out. The camera never stops pushing; the bright device face keeps growing toward the lens until it BLOOMS into a `[light]` wash — a zoom-through "portal" exit that fills the frame.
- Variant — stepwise-flow (Product_Intro, 8.5–9.4s; in-device Key_Feature sub-mode 7.9s): CURSORLESS end-to-end flow — the surface completes `[setup/auth → action → success]` as a narrative arc. Opens on a `[title card]` that fades in/out on an ambient gradient (or a typed `[command]` running character-by-character on a terminal field). The `[flow surface]` arrives (phone mock slides up oversized and settles / bordered log panel replaces the command) and step 1 completes via rapid sequential pops — `[OTP digits]` fill boxes left-to-right capped by a green check, or `[log steps]` pop top-down with highlighted tokens, ending on a trailing-dots waiting state. State advances laterally (old content slides out left, new in from right, chrome persists) or via a dark-to-light scene swap into a white `[detail/confirm card]` whose elements stagger in. COMMIT: the `[CTA button]` is pressed (press dip / spinner "Processing") and a `[success state]` renders with check bullets — in the in-device sub-mode the commit runs a biometric ritual: dim overlay, `[squircle]` spring-pops, a ring draws around an icon, the icon morphs to a checkmark and holds; a slight camera push-in fires ONLY at the state transition (camera punctuates the commit, then re-locks). EXIT: the surface leaves and closing `[title cards]` pop in and ease smaller — the surface exits before the coda instead of holding. Camera otherwise static. For this variant the persistent hero is the FLOW, not one surface: a terminal panel may hand off wholesale to a confirm card.
- Variant — showcase-carousel (Key_Feature, 11.3s): TWO surfaces in sequence on a slowly drifting `[pastel mesh gradient]`, static camera, gated by centered interstitial `[claim words]` (fade in with gentle scale-up, fade out). Act 1: a white `[widget card]` scales in, flips/morphs into a tilted vertical widget and CYCLES `[N brand skins]` (~0.8s each) — one shared layout, per-skin content and accent swaps — while a large `[brand logo]` crossfades below per flip; the widget scales away. Act 2: a `[phone frame]` enters oversized and tilted, settles upright at center; full `[app screens]` slide left through it (~1s each), holding on the last. The screen cycle is a breadth carousel, not a flow — no taps, no cursor, no camera.

**motion vocabulary** surface establish (edge slide-in + settle / tilt drift-in + self-rotate-to-camera / title-card dissolve); accent shape spring behind surface; element-level screen-cycling (scroll-swap, push-in-from-side, scale-swap); button tap-compress; staggered side-headline reveal + copy swap (out-up / in-up); in-place header-word letter-flip; floating browser-window-on-gradient idle float; full-frame title-card opener (icon draw-in + label); camera push-IN on a region; camera zoom-OUT re-frame; content scroll-through; one continuous 3D camera-follow push (no cuts); 3D device drift + self-rotate; stylized-environment bloom/particles; 3D-hand entrance + swipe-scroll + tap (gesture-driven); picker-panel slide-in; template-apply grow-from-center; horizontal marquee scroll; gesture-driven page scroll; zoom-through bloom/portal exit; static-hold (no camera) as the floor of the camera range. Stepwise-flow additions: title-card bookends (fade-in/out opener; closers pop in then ease smaller); typed terminal command with prompt chevron; sequential top-down log pops with sub-line reveals; animated trailing-dots wait state; sequential digit pops left-to-right + green check confirm; lateral screen slide with persistent chrome; dark-to-light scene swap; staggered card element build-in (fade + slide-up); button press dip + fill flip; spinner processing state; success check-bullet reveal; notification banner spring-in with overshoot; lockscreen fade/blur-away as a card expands to fill the device face; commit-synced micro push-in; dim overlay; squircle spring pop; circular ring draw; icon morph to checkmark; surface exit before a title coda. Showcase-carousel additions: interstitial claim-word gate; brand-skin cycling with per-flip logo crossfade; card flip/morph into a tilted widget; oversized-tilted surface entry settling upright; fast slide-left screen carousel inside a static frame; drifting mesh-gradient backdrop.

**rule mapping** (per motion verb → backing rule, or flagged special)

- screen-cycling — UI scrolls/sections scroll inside the surface (device-tour, floating-window scroll, 3d-hand page scroll) → `3d-page-scroll` (webpage/app as a tilted card whose content `translateY`-scrolls to sections; primary mechanic for the surface's screen flow)
- floating-window establish + the surface presented as a tilted/floating UI card → `3d-page-scroll` (the tilt/perspective framing) + `css-3d-transforms` (perspective/`translateZ` depth)
- screen / side-copy state swaps (discrete screen states; side headline content swapping per beat) → `discrete-text-sequence`
- side-headline reveal (staggered fade + slide-up) → `discrete-text-sequence`
- in-place header-word letter-flip (3d-hand) → `hacker-flip-3d`
- screen swap as a coordinated shrink-out / pop-in between two screen states → `scale-swap-transition`
- template-apply "new layout grows from center to fill the face" (3d-hand) → `center-outward-expansion` (clustered-at-center → expand to fill)
- the surface morphing between states / title-card→window dissolve as the eye-anchor transition → `card-morph-anchor`
- button tap-compress (95%→100% press feedback) → `press-release-spring` (or `physics-press-reaction` for a heavier press)
- floating-window cursor click on the highlighted list item → `cursor-click-ripple`
- accent-highlight pop on the active sidebar/list item → `asr-keyword-glow` (accent glow on the focused item)
- drifting cursor down the sidebar list (floating-window) → `camera-cursor-tracking` (flat-cursor drift; pairs with the push-in)
- floating browser-window idle float / 3D device drift-breathe → `sine-wave-loop`
- 3D device drift + self-rotate-to-camera + perspective depth (3d-hand) → `css-3d-transforms` (CSS-3D) **or** `3d.md` technique (true Three.js/R3F device); see camera modifier
- horizontal `[marquee]` scroll (3d-hand) → `viewport-change` (PAN mode on the marquee strip) — _thin fit; a literal CSS-marquee/translateX loop is closer to a `gsap-effects`/CSS recipe than a named motion rule_
- 3D-hand entrance + swipe + tap as the interaction DRIVER (gesture input that scrolls/selects) → **flagged special — needs a heavier capability beyond the rule library (R3F/Three.js + WebGL), NOT a motion-shape rule.** The 3D hand model + WebGL bloom have a _technique_ backing (`3d.md` — R3F, `useGLTF` HandModel, `--gl=swiftshader` for the shader/bloom), but no motion-shape rule models a 3D hand as the swipe-to-scroll / tap-to-select gesture protocol. `context-sensitive-cursor` / `camera-cursor-tracking` only model a flat typing/pointer cursor, not a 3D gesturing hand.
- zoom-through bloom / portal exit (3d-hand) → **flagged special — needs a heavier capability beyond the rule library (WebGL), NOT a named transition rule.** Capability is `techniques.md` → WebGL shader (via `3d.md` headless WebGL: `--gl=swiftshader --concurrency=1`), but no named transition rule covers a bloom/portal fly-through.
- typed terminal command / non-linear log text (stepwise-flow) → `discrete-text-sequence` (typing + threshold state replacement) with `dynamic-content-sequencing` computing each step's window from content length
- sequential top-down log pops / OTP digit pops left-to-right / staggered confirm-card build-in → `spring-pop-entrance` (staggered group form; low overshoot for log lines)
- trailing-dots wait state → `sine-wave-loop` (finite repeats; step the opacity of 3 dots on a shared phase)
- lateral screen slide with persistent chrome → the existing screen-cycling mapping (`3d-page-scroll` translateX form inside the clipped surface); chrome sits outside the sliding layer
- notification banner spring-in / squircle pop (in-device) → `spring-pop-entrance`
- lockscreen fade/blur-away + card expands to fill the device face → `card-morph-anchor` (uniform-scale container morph — never tween width/height) + `depth-of-field-blur` (the blur-away)
- commit-synced micro push-in (camera punctuates the Approve/tap, then re-locks) → `multi-phase-camera` (single short push phase placed at the state transition)
- button press dip + fill flip / Approve press-down spring-back → `press-release-spring` (already mapped; the fill flip is its color-transition variation)
- spinner processing state → `svg-icon-enrichment` (rotating internal element with explicit SVG center)
- success check bullets / biometric ring draw → `svg-path-draw` (check strokes; ring rotated −90° to start at 12 o'clock) + `spring-pop-entrance` for the bullet pops
- icon morph to checkmark (biometric ritual) → **flagged special — SVG path morph, see hyperframes-keyframes (morph)**; no motion-shape rule models it — mechanics live in `techniques.md` / the keyframes skill, same tier as the blueprint's existing WebGL flags
- interstitial claim-word gate (fade + gentle scale-up, then out) → `gsap-effects` (plain fade/scale chord; deliberately quieter than `kinetic-beat-slam`)
- brand-skin cycling with per-flip logo crossfade → `discrete-text-sequence` (whole-state content replacement at thresholds) + `scale-swap-transition` where a flip reads as shrink-out/pop-in; the card→tilted-widget flip/morph → `card-morph-anchor` + `css-3d-transforms`
- drifting mesh-gradient backdrop → `sine-wave-loop` (very-low-amplitude position/hue drift on gradient blobs)

**camera modifier**: The showcase camera spans a RANGE keyed by variant, all on a single content-wrapping virtual camera (`viewport-change`):

- static-tour → NO camera move (`viewport-change` held at scale 1, or omitted); all motion is element-level. This is the floor of the range and what distinguishes the device-tour from the rest.
- floating-window → a two-phase push-in → zoom-out arc → `multi-phase-camera` (e.g. dramatic-reveal 1.1→1.0→0.95 feel): push IN on the `[sidebar/region]` via `coordinate-target-zoom` (off-center target = scale + counter-translate), then `multi-phase-camera` zooms back OUT to re-frame the whole window while content scrolls.
- 3d-hand → ONE continuous forward push (no cuts) → `multi-phase-camera` in steady-push mode (1.0→1.03→1.06… plus its sine micro-drift) layered over `css-3d-transforms`/`3d.md` so the device self-rotates-to-lens during the push; the push runs unbroken into the bloom/portal exit (exit itself is the WebGL-shader flagged special above). Across all three: `viewport-change` is the base virtual-camera primitive; `multi-phase-camera` sequences the push/zoom phases (and supplies the always-on micro-drift that keeps even the "static" tour from feeling dead); `coordinate-target-zoom` aims the push at off-center screen detail.

**Overflow (pan/scroll surfaces — required for a clean `check`):** a panned or scrolled surface deliberately moves content PAST the edges of its framing card. Clip it at the card (`overflow: hidden` on the card/window) AND mark the moving inner layer (the `.world` / surface wrapper holding the screenshot + any markers/labels) with `data-layout-allow-overflow` — otherwise `check` reports `text_box_overflow` / `container_overflow` errors for the parts that scroll off (e.g. a marker label panned off the left edge). The card clips them visually; the attribute tells the layout audit it's intentional, not a layout bug.

## Selected motion rule: dynamic-content-sequencing

---
name: dynamic-content-sequencing
description: Auto-calculate timeline start/end times from content length + per-item duration config — longer content gets more screen time without hardcoded numbers.
metadata:
  tags: timeline, sequencing, dynamic, duration, content-aware, utility
---

# Dynamic Content Sequencing

A utility pattern (not a motion rule in itself) for scenes that show a SEQUENCE of items (cards, phrases, stats): each item's duration is computed from its content length + per-item config, and the sequencer assigns absolute start/end times automatically — no hardcoded offsets per item. Distinct from [discrete-text-sequence](discrete-text-sequence.md) (one text element changing states) — this rule swaps between distinct content blocks.

## How It Works

A content array of `{ eyebrow, title, body, speedFactor, hold }` entries is reduced once at build time into a flat `TIMELINE` of `{ …entry, start, end }` — duration per entry is `BASE_DURATION + body.length × SEC_PER_CHAR + hold`, so longer text earns more reading time. A single linear driver's `onUpdate` reverse-searches the active entry and swaps the DOM **only on transitions** (a `lastTitle` guard — per-frame `textContent` writes flicker in render); an optional progress bar fills 0→100% across the whole run.

## Recipe

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="display">
  <div class="eyebrow" id="eyebrow"></div>
  <div class="title" id="title"></div>
  <div class="body" id="body"></div>
  <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
</div>
```

```css
.body {
  min-height: 160px; /* reserve space — content height varies; without this, layout jumps */
}
.progress-fill {
  height: 100%;
  width: 0%;
}
```

```js
// N entries, each with its own pacing (optionally a speedFactor multiplier);
// the final entry uses a larger hold (closing beat).
const CONTENT = [
  { eyebrow: "{eyebrow1}", title: "{title1}", body: "{body1}", hold: HOLD_MID },
  // …
  { eyebrow: "{eyebrowN}", title: "{titleN}", body: "{bodyN}", hold: HOLD_FINAL },
];

// Pre-compute absolute start/end ONCE — never in onUpdate.
let cumulative = 0;
const TIMELINE = CONTENT.map((entry) => {
  const dur = BASE_DURATION + entry.body.length * SEC_PER_CHAR + entry.hold;
  const start = cumulative;
  cumulative += dur;
  return { ...entry, start, end: cumulative };
});

function entryAt(time) {
  for (let i = TIMELINE.length - 1; i >= 0; i--) {
    if (time >= TIMELINE[i].start) return TIMELINE[i];
  }
  return TIMELINE[0];
}

const eyebrowEl = document.getElementById("eyebrow");
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");
const progressEl = document.getElementById("progress-fill");

const TOTAL_DURATION = cumulative + TAIL_PAD;
const driver = { t: 0 };
let lastTitle = "";

tl.to(
  driver,
  {
    t: TOTAL_DURATION,
    duration: TOTAL_DURATION,
    ease: "none",
    onUpdate: () => {
      const entry = entryAt(driver.t);
      // Swap content only on transitions — no per-frame DOM thrash
      if (entry.title !== lastTitle) {
        eyebrowEl.textContent = entry.eyebrow;
        titleEl.textContent = entry.title;
        bodyEl.textContent = entry.body;
        lastTitle = entry.title;
      }
      progressEl.style.width = `${(driver.t / TOTAL_DURATION) * 100}%`;
    },
  },
  0,
);
```

## Variations

- **Crossfade between items** — return BOTH adjacent entries during an overlap window (`time ≥ e.start − overlap && time ≤ e.end + overlap`, overlap ≈ 0.3s) and render them with opacities computed from distance to the boundary.
- **Per-item motion variation** — map an `entry.style` key to an existing rule per chapter (e.g. `3d-text-depth-layers` → `hacker-flip-3d` → `counting-dynamic-scale`); the sequencer only orchestrates timing.
- **Auto-extend composition duration** — you can set `data-duration` from the computed `TOTAL_DURATION` in script, but HF reads `data-duration` at composition load and setting it after init may not take effect — author the duration manually from a rough total.

### Accelerating cadence (geometric hold decay)

For rhetorical escalation — "everyone says…", a roll-call, a praise flurry — the beat grid itself accelerates: early entries hold ~1s (read speed), then windows shrink geometrically into a ~0.15–0.3s flurry, braking on an emphasis state before the resolve. The acceleration is pre-computed into the same flat `TIMELINE` — still content-driven, still deterministic, no speed-up tween anywhere:

```js
// Geometric decay on the hold, clamped at a flurry floor; the brake state holds longest.
const HOLDS = CONTENT.map((entry, i) => Math.max(FLURRY_FLOOR, HOLD_START * Math.pow(DECAY, i)));
HOLDS[CONTENT.length - 1] = HOLD_FINAL;

let cumulative = 0;
const TIMELINE = CONTENT.map((entry, i) => {
  // Past ~0.5s states are glanced as motion texture, not read —
  // drop the per-char term or you never reach flurry speed.
  const readable = HOLDS[i] >= READ_THRESHOLD;
  const dur = HOLDS[i] + (readable ? entry.body.length * SEC_PER_CHAR : 0);
  const start = cumulative;
  cumulative += dur;
  return { ...entry, start, end: cumulative };
});
```

Worked example — **praise-chip flurry**: ~16 short quotes hard-cut through a chip beside a pinned wordmark. First 3 states at `HOLD_START = 1.0` (each reads fully); `DECAY = 0.8` shrinks every following window until `FLURRY_FLOOR = 0.2` catches it (≈12 states over ~2.5s — a churn of acclaim, individually glanced); the longest phrase takes `HOLD_FINAL ≈ 1.6` as the brake before the closing lockup.

Values: `HOLD_START` 0.8–1.2s; `DECAY` 0.75–0.88 (higher = longer runway before the flurry bites); `FLURRY_FLOOR` 0.15–0.3s (below ~0.15s swaps strobe); `READ_THRESHOLD` ~0.5s; brake ≥ 4× the floor or the stop doesn't register as a beat. The 3–6 entry guidance relaxes here — 12–18 states are legal precisely because flurry states aren't individually read. The hard-cut discipline (`lastTitle` guard, instant swaps) is what lets 0.2s states render clean.

## Values

| token         | range                 | notes                                                                                                                 |
| ------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| BASE_DURATION | 0.6–1.5s              | minimum per entry regardless of length — even one-word entries get read time                                          |
| SEC_PER_CHAR  | 0.03–0.06 s/char      | ≈17–33 chars/sec; uniform across the sequence so the pace reads as one engine; lean high for wide-character languages |
| HOLD_MID      | 0.5–1.0s              | dwell on a non-final entry; `< HOLD_FINAL`                                                                            |
| HOLD_FINAL    | 1.0–2.0s              | climax dwell — must exceed HOLD_MID by a clear margin so the close reads as a beat                                    |
| SPEED_FACTOR  | 0.5–2.0 (default 1.0) | per-entry only; if every entry shares a factor, fold it into SEC_PER_CHAR                                             |
| TAIL_PAD      | 0.0–1.0s              | quiet beat after the last entry; prefer 0 when the next composition owns the breath                                   |
| CONTENT N     | 3–6 entries           | <3 isn't a sequence; >6 drags (accelerating cadence relaxes this — see above)                                         |

Reference: `../../examples/messaging-multi-phrase.html`.

## Critical Constraints

- **Pre-compute the TIMELINE once at build** — never recompute in `onUpdate`; the reverse search over the flat array is the whole per-frame cost.
- **DOM swap only on entry transition** (`lastTitle`/key guard) — per-frame `textContent` assignment flickers in HF render.
- **`min-height` on the body element** — without reservation, downstream elements (progress bar, brand) jitter as content height varies.
- **Sequential only** — for parallel tracks use a different reduction.
- **Titles fit one line at the chosen size; bodies fit inside `min-height` after wrapping.**

## See also

`discrete-text-sequence` (per-entry typewriter on the body) · `context-sensitive-cursor` (cursor color per chapter) · `vertical-spring-ticker` (animated word swap instead of hard cut) · `scale-swap-transition` (visual morph between entries).

## Selected motion rule: press-release-spring

---
name: press-release-spring
description: Tactile button press with linear compression, spring-based elastic recovery, and layered visual feedback (shadow shrink + release burst + background glow).
metadata:
  tags: spring, press, interaction, button, physics, glow, burst, ui
---

# Press-Release Spring Chain

Separates input (linear compression) from output (spring recovery) to create tactile feel: the overshoot is a natural byproduct of the spring config, not manually coded, with secondary motion (shadow shrink, release burst, background glow) layered on the same trigger frame. This is a **reaction on an element already resting on screen** — an arrival that springs in from nothing is [spring-pop-entrance.md](spring-pop-entrance.md); add a visible cursor actor and it becomes [physics-press-reaction.md](physics-press-reaction.md).

Two phases split at the **release**:

1. **Press**: linear ease → compression (`scale: 1 → PRESS_SCALE`, shadow shrinks). Linear, not spring — the dip must read as instant/tactile, not squishy.
2. **Release**: `back.out(BOUNCE_FACTOR)` spring back to 1.0. Optional burst glow ring expands behind the button; optional environmental glow fades in.

State continuity is critical: the release tween's start value MUST equal the press tween's end value, or the spring snaps to a different position. GSAP threads this automatically when both tweens target the same property at **adjacent positions** — `RELEASE_START = PRESS_START + PRESS_DUR`; a gap or overlap breaks it.

## Recipe

```html
<div class="press-stage">
  <div class="bg-glow" id="bg-glow"></div>
  <!-- Burst sits BEHIND the button (z-index 1 vs 2), same footprint, blurred
       radial gradient, opacity 0. bg-glow is a full-stage radial at negative
       inset so it extends past the stage edges. -->
  <div class="burst" id="burst"></div>
  <button class="btn" id="btn">{buttonLabel}</button>
</div>
```

```js
// Phase 1 — press (linear compression)
tl.to(
  "#btn",
  { scale: PRESS_SCALE, boxShadow: "{btnPressedShadow}", duration: PRESS_DUR, ease: "power1.in" },
  PRESS_START,
);

// Phase 2 — release (spring back; start scale == PRESS_SCALE by adjacency)
tl.to(
  "#btn",
  {
    scale: 1,
    boxShadow: "{btnRestShadow}",
    duration: RELEASE_DUR,
    ease: `back.out(${BOUNCE_FACTOR})`,
  },
  RELEASE_START,
);

// Phase 3 — burst glow pops behind the button, then fades
tl.fromTo(
  "#burst",
  { scale: 1, opacity: 0 },
  {
    scale: BURST_PEAK_SCALE,
    opacity: BURST_PEAK_OPACITY,
    duration: BURST_GROW_DUR,
    ease: "power2.out",
  },
  RELEASE_START,
);
tl.to("#burst", { opacity: 0, duration: BURST_FADE_DUR, ease: "power2.in" }, BURST_FADE_START);

// Phase 4 — environmental glow fades in after release
tl.to(
  "#bg-glow",
  { opacity: BG_GLOW_PEAK_OPACITY, duration: BG_GLOW_FADE_DUR, ease: "power2.out" },
  RELEASE_START,
);
```

## Variations

- **Subtle press** (status save / muted CTA): `PRESS_SCALE` ~0.96, `BOUNCE_FACTOR` ~1.4, burst scale/opacity reduced.
- **Dramatic press** (hero CTA / "ship it"): `PRESS_SCALE` ~0.88, `BOUNCE_FACTOR` ~2.5, burst maxed.
- **Color shift during press** — darken mid-press, return on release; interpolated `backgroundColor` at the same timeline positions as the scale tweens. Same state-continuity rule.
- **State change at release** (approve / confirm) — instead of returning to the rest color, swap to `{successColor}` at `RELEASE_START` and pop a checkmark via a separate `back.out(CHECK_BOUNCE)` tween (1.4–2.0, firmer than the button's bounce — a punctuating "stamp"; pop 0.3–0.6 s) at the same position. The button is now terminal — no further presses expected.

## Values

| token                | range                                      | notes                                                                                      |
| -------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| button footprint     | ≥ 3–5% of canvas area                      | a 320×68 button at 1080p is ~1% and the press reads as visually insignificant              |
| PRESS_SCALE          | 0.88 dramatic · 0.92 default · 0.96 subtle | never <0.85 (broken) or >0.98 (no perceptible dip)                                         |
| PRESS_DUR            | 0.10–0.30 s                                | shorter = snappier; must be shorter than `RELEASE_DUR` (input faster than spring recovery) |
| RELEASE_DUR          | 0.40–0.90 s                                | shorter = tight pop; longer = loose, wobbly settle                                         |
| BOUNCE_FACTOR        | 1.4 soft · 2.0 firm · 2.8 cartoony         | or `elastic.out(amplitude, period)` for a rubbery oscillation instead of one overshoot     |
| RELEASE_START        | `= PRESS_START + PRESS_DUR`                | adjacency = automatic state continuity                                                     |
| BURST_PEAK_SCALE     | 3 subtle · 6 default · 8 max               | beyond ~8 the radial gradient pixelates visibly                                            |
| BURST_PEAK_OPACITY   | 0.4–1.0                                    | grow ≈ fade, 0.4–0.7 s each; blur 40–100 px (hard ring → ambient haze)                     |
| BG_GLOW_PEAK_OPACITY | 0.1 subtle · 0.25 default · 0.45 max       | higher washes the whole composition; fade-in 0.6–1.0 s; inset −300…−500 px at 1080p        |

Color tokens: pressed surface darker than rest; rest shadow large + diffuse, pressed small + tight (the button "sinks toward the surface"); burst gradient darker + more saturated than `{btnBg}` — same-color glow looks washed out; bg glow a low-opacity tint of the button's hue family.

## Critical Constraints

- **State continuity** — release start value exactly equals press end value; enforced by same-property adjacency at `RELEASE_START = PRESS_START + PRESS_DUR`.
- **Linear press, spring release** — both spring → squishy; both linear → mechanical, no overshoot punch.
- **Anchor compression on center** (`transform-origin: 50% 50%`) or the button collapses asymmetrically.
- **Burst behind, not in front** — burst `z-index: 1`, button `z-index: 2`; in front it occludes the button at peak opacity.
- **Don't tween `boxShadow` and `filter` on the same element** — they compete in the layout pipeline; shadow on the button, blur on the separate burst layer.
- **Climax dwell** — after the burst peak + reveal, the composition must run ≥ 1 s more (≥ 2 s for dramatic variants); a reveal at `t = DURATION − 0.2 s` reads as "flashed and gone."

## See also

`spring-pop-entrance` (the ENTRANCE counterpart — arrival, not reaction) · `physics-press-reaction` (this press with a visible cursor actor) · `cursor-click-ripple` (the cursor click that triggers the press) · `sine-wave-loop` (idle micro-float BEFORE the press) · `center-outward-expansion` (badge burst synced to the release).
