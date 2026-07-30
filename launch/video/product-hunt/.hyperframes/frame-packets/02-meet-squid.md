# Frame packet: 02-meet-squid

## Project inputs

- Project: /Users/drewsepeczi/llamacoder/launch/video/product-hunt
- Design tokens: /Users/drewsepeczi/llamacoder/launch/video/product-hunt/frame.md
- RULES_DIR: /Users/drewsepeczi/.agents/skills/hyperframes-animation/rules

## Assigned storyboard block

## Frame 2 — Meet Squid

- scene: The real composer moves through idea, screenshot, website URL, and API input methods.
- duration: 7s
- poster: 3.8s
- transition_in: cut
- status: outline
- voiceover: "Squid takes an idea, screenshot, or website through planning, generation, iteration, verification, and export."
- src: compositions/frames/02-meet-squid.html
- type: product_intro
- blueprint: prompt-type-submit-generate
- asset_candidates: assets/footage/composer-inputs.mp4, assets/brand/squidagent-logo.svg

Use the real captured composer as the hero surface. Four large callouts appear only when the corresponding real control is visible; the workflow rail establishes the complete promise by the end of the beat.

- focal: assets/footage/composer-inputs.mp4
- roles: composer-inputs = cutout · squidagent-logo = supporting
- sfx: soft-interface-tick

Adapt `prompt-type-submit-generate`: keep the real composer as the gravitational center and the typed input ritual; stop before generation because this beat introduces all accepted starting points.
Scene 1 (0.0–1.5s): existing Squid mark and “Start with what you have.” enter upper-left while the real composer window settles into the dominant lower-right zone.
Scene 2 (1.5–4.8s): the captured prompt types; Idea, Screenshot, Website URL, and API labels reveal one at a time beside the real corresponding controls (`dynamic-content-sequencing`), with the camera locked.
Scene 3 (4.8–7.0s): the four labels resolve into a single workflow rail — Plan → Build → Refine → Verify → Export — and hold while the real composer remains visible.

## Selected blueprint: prompt-type-submit-generate

# prompt-type-submit-generate — Prompt, Submit, Generate

**intent**: The AI-era demo shot — a `[prompt / query / command]` types character-by-character into a REAL product input (chat composer, search bar, terminal prompt, URL bar, sidebar assistant) and the machine answers: status theater into a streaming answer / agent action log / diff cards / chart / generated artifact — or the clip cuts at the submit and the ask itself is the show. The keyboard is the actor and the product is the responder. Distinct from `typewriter-reveal` (a line typed as bare typography on an empty field — no product surface, nothing answers) and from `cursor-ui-demo` (a cursor clicking a reconstructed UI through states — there the pointer drives every change; here any cursor work only primes the input or lands the submit, and every state change after that is the machine's own doing).

**roles served**

- Hook (from `app-window-push-in-prompt-typing`): when the opener is "watch me ask" — typed headline beat(s), ONE eased push-in lands tight on the product's input, the prompt types and the clip ends at / just after submission (sub-shape A).
- Hook (from `typed-command-output-scroll`): when the demo loop ITSELF is the hook — command in, output builds and scrolls, and a second command / retype starts before the cut, ending mid-action (sub-shapes B/C with the restart ending).
- Product_Intro (from `prompt-typing-composer`): when the first look at the product IS its composer — a brand beat opens onto the input surface, a long prompt types with hovers / attachments / dropdown picks, and the camera steers gently toward the input or the confirming control (sub-shape A, occasionally running through to an agent-log payoff).
- Product_Intro (from `search-query-walkthrough`): when the product is introduced through its search affordance — a short `[query]` types with a blinking caret, autocomplete / results populate LIVE, and a confirm click settles the result state (sub-shape C, search skin).
- Key_Feature (from `prompt-type-submit-generate`): when the capability is demoed as ONE prompt→response round trip — submit into thinking/status states, then a streaming answer, action-log rows with brand icons, green diff cards, a chart drawing itself, or an instant generated-app reveal (sub-shapes A/B/C — the family's widest role).
- CTA (from `install-command-end-card`): the install-command end card — the closing `[headline]` DEMOTES (shrinks, grays, lifts) to make room for a `[terminal pill]` that springs in and stretches wide, the `[install command]` types out with a blinking cursor, flanking metadata and a `[tool-icon row]` pop in, and the finished card holds long. No submit, no response — the typed command IS the ask (sub-shape A, terminal skin).

**duration**: 5.2–12s (A prompt-as-hook 5.2–12s, incl. the ~7.4s CTA end card; B full generate loop 5.45–11.9s; C instant-result surface 5.7–11.9s — a long-form family: most members run 7–12s because the response needs room to arrive)

**shot structure** (a `[product input]` on/inside a `[product surface — app window, web page, terminal, browser chrome, sidebar]` over `[bg color]`; the input is the gravitational center — the camera makes at most one or two purposeful moves toward or away from it and is otherwise LOCKED; typing is character-by-character behind a visible caret, and response content arrives progressively, never dumped; three folded sub-shapes — **(A) prompt-as-hook**: the clip ends at / just after the submit (or mid-word), the ask is the show; **(B) full generate loop**: submit → status theater → the output builds block by block; **(C) instant-result surface**: the machine answers with a finished surface, often re-queried before the cut)

- **Scene 0 (optional, 0.0–~2s) — lead-in beat.** ONE establishing move before the input owns the shot: a `[headline]` types on centered and clears; a `[title card]` hard-cuts away; a brand beat (`[logo/mascot]` centered, `[serif title]` building in word groups, logo shrinking-and-rising to dock top-center); an `[orb / mark]` forms with a glowing rim; the `[app window]` flies in with motion blur and settles; or a full-frame `[thumbnail grid]` parts at its vertical centerline to clear the stage. Keep it ≤2s — the input is the star.
  - _Variant — Hook_: typed headline beats carry the intro — "[Introducing X]" types on, holds, is replaced by the `[tagline]` typing in the identical style; the typing register is established before the product ever appears.
  - _Variant — Key_Feature_: the capability claim types as a bare title ("[Run a task across multiple models.]") then hard-cuts to the surface — or skip Scene 0 entirely and open on the live surface mid-workflow.
  - _Variant — CTA_: the `[closing line]` types on in two steps ("[Designed.] [Not generated.]") and holds — it will demote in Scene 2.

- **Scene 1 (~1–3s) — the input takes focus.** The `[product input]` arrives or is primed: a `[pill bar]` EXPANDS sideways from the mark/chip; a `[prompt palette / card]` SPRINGS in at center with a soft shadow; ONE smooth eased/accelerating push-in crops tight onto the composer inside the `[app window]` (headline chrome slides out of frame); a `[⌘K search modal]` springs to center while the page blurs behind it; a cursor clicks a `[menu row / Assistant button]` and the prompt block appears; or a `[✕ clear button]` empties the previous query back to `[placeholder]`. Optional composer ritual (pick 1–2, before or during typing): an `[attachment]` drags in and settles in a tray below the input; a `[model / option dropdown]` opens beneath the selector, rows hover-highlight, a checkmark lands and the toolbar label updates.
  - _Variant — Product_Intro_: the ritual is the introduction — a `[chip grid]` fades in and the cursor arcs across 2–3 hover highlights before clicking the one that opens the composer; the affordances are the tour.
  - _Variant — Key_Feature_: the surface already carries an old `[query]` and its previous `[result panel]` — clearing it says "this is a working tool, not a mockup".

- **Scene 2 (~2–6s) — the prompt types (the engine).** The `[prompt text]` types rapidly character-by-character behind a blinking caret; the input card GROWS downward / wraps as text fills, pushing footer controls and attachments down; a typed `[token]` may convert into an inline `[brand pill]` mid-typing (`[@browser]` → a colored `[Browser]` chip, typing continues around it); the camera may run ONE slow continuous push-in toward the input, decelerating to a near-hold on the typed ask. Sub-shape (A) may END here — cut mid-word with the caret blinking, or held on the finished prompt.
  - _Variant — Hook (A)_: the typed ask is the cliffhanger — end on the completed prompt, or on the submit click as the interface DIMS at the cut.
  - _Variant — Product_Intro (A)_: the camera dives toward the bottom input while `[option pills]` cascade in above it; the prompt is still mid-word at the cut — the product is introduced as something you talk to.
  - _Variant — CTA (A, install end card)_: the Scene-0 headline DEMOTES — scales ~50%, desaturates to gray, lifts upward — as a small `[$ chip]` spring-pops below and STRETCHES horizontally into a wide `[terminal pill]`; the `[install command]` types out inside it; a faint `[repo link]` and a "[Works with]" label fade in quietly; a row of `[tool icons]` pops in one after another with soft spring scale; the finished composition holds long, only the caret blinking.

- **Scene 3 (~4–7s) — submit + machine theater.** The `[submit control]` is clicked (cursor glide + press dip; the button may have MORPHED state on first keystroke — waveform → up-arrow — and may flip to a `[stop]` control while streaming) or the retype implies enter. The surface answers instantly with a working state: prior content VANISHES (chip grid gone, panel collapses to its slim header, whole layout swaps); then the theater — `[status phrases]` cross-dissolve with a left-to-right shimmer sweep ("[Thinking]" → "[Modeling…]" → "[Planning…]"), a `[spinner]` rotates over a loading strip, a row of `[loading cards]` lines up, or a `[checklist]` populates and its items flip one by one to green checks with strikethrough while a `[status heading]` flips tense ("[Using X]" → "[Used X]").
  - _Variant — (A) status-flare exit_: end the clip ON the theater — "[Generating…]" / the rotating spinner — the flare is the button; the answer is left to the imagination.

- **Scene 4 (rest) — the answer arrives.** Choose by sub-shape:
  - **Sub-shape B (full generate loop)**: the output BUILDS progressively, each block pushing content down — `[answer text]` streams paragraph by paragraph; `[action-log rows]` pop in sequentially, each with a `[brand icon]`; `[diff cards]` expand with green-highlight added lines; `[chart lines]` draw staggered left-to-right from a shared origin; an `[ASCII / summary table]` draws in; live counters tick; the surface auto-scrolls vertically to follow the newest line (page, terminal, or in-card scroll) — often under ONE slow continuous push-in on the result window.
  - **Sub-shape C (instant-result surface)**: the machine answers with a finished surface — the matching `[result / article]` renders in place; `[autocomplete chips]` stagger-pop below the bar WHILE the query types (the machine answers every keystroke), then a hover fills the `[Search button]` solid and a click confirms; the `[generated page]` rises as a rounded card and SCROLLS continuously beneath the pinned prompt; a blur-whip resolves onto the `[artifact window]` and a tab click FLIPS code → preview; or a zoom-out reveals the prompt pill was inside a full `[workspace]` where the `[content]` rewrites itself live.

- **Scene 5 (final beat) — resolve.** Diverges by role and sub-shape:
  - _Variant — Key_Feature (hold)_: HOLD on the completed output — chart finished, diff cards + `[action buttons]` fully rendered; no fade-out, no blank end frame.
  - _Variant — Product_Intro (confirm)_: the cursor lands the confirming click (`[Create PR]` / `[Generate]` / `[Search]`) as the clip ends, or extras fade and a final push-in leaves the clean end state; one member hard-cuts to a minimal `[end card]` — the submit button alone at dead center with a settle pop.
  - _Variant — Hook (restart — the signature)_: a SECOND `[prompt / command]` starts typing at a fresh prompt line, or the query BACKSPACES-AND-RETYPES and the output swaps wholesale to `[result 2]` — the clip ends MID-ACTION, mid-scroll or mid-word: the loop is endless, and that is the point.
  - _Variant — CTA_: the end card from Scene 2 simply holds to the last frame; the blinking cursor is the only motion.

**motion vocabulary**: character-by-character typing with blinking caret / block cursor; typed-headline beats replacing each other; input pill grows / wraps downward into a multi-line box; prompt palette / card springs in; pill bar expands sideways from a mark or chip; orb formation with glowing rim; typed token → inline brand-pill morph mid-typing; placeholder clear; ✕-click query clear; backspace-and-retype query swap; attachment drag-in and tray settle; dropdown open + row hover-highlight + checkmark select + toolbar label update; chip-grid hover dance; cursor glide / arc with hover highlight fills; click press dip; submit-button state morph (waveform→up-arrow, submit→stop); hover fill-state swap on a Search button; content vanish / panel collapse / layout swap on submit; status-phrase cross-dissolves with left-to-right shimmer sweep; pulsing "Thinking"; spinner rotation; loading strip; animated trailing dots; loading model-card row; status-heading tense flip (Using→Used); checklist squares flipping to green checks with strikethrough; action-log rows popping in sequentially with brand icons; streaming text blocks pushing content down; green-highlight diff cards expanding; staggered left-to-right chart line-draws; ASCII / summary table draw-in; count-up ticker; vertical output scroll (page / terminal / in-card) following the newest line; generated page rising as a rounded card and scrolling beneath a pinned prompt; autocomplete chips rapid stagger-pop; code↔preview instant flip on tab click; blur-whip transition; prompt jumps to a heading on submit; zoom-out reveal from prompt pill to full UI window; single eased / accelerating push-in landing on the input; slow continuous push-in on the result window; window fly-in with motion blur; zoom + pan cropping browser chrome; ⌘K modal spring-in with background blur; full-frame grid parting at the vertical centerline; headline demotion (scale-down + desaturate + lift); chip horizontal-stretch into a wide terminal pill; quiet low-contrast metadata fade-ins; sequential spring pop-ins of an icon row; second prompt typing at the cut; interface dim / fade at the cut; long static end hold with blinking cursor.

**rule mapping**

- character-by-character typing, placeholder clear, backspace-and-retype, second prompt at the cut, typed-headline beats → `discrete-text-sequence` (typing / typos / holds / backspace) backed by `gsap-effects` (typewriter recipe)
- blinking caret / block cursor (persisting through holds) → `context-sensitive-cursor`
- prompt / status / output phrase windows, script-driven beat durations → `dynamic-content-sequencing`
- input card grows downward / wraps as text fills → `anchored-layout-expand` (top-anchored downward growth, stepped at wrap boundaries)
- typed token → inline brand-pill morph mid-typing → composition: `scale-swap-transition` (token→chip swap at the conversion threshold) + `card-morph-anchor` (the reflow around the chip)
- prompt palette / modal / dropdown springs in; loading cards, log rows, diff cards, autocomplete chips, icon rows arriving staggered → `spring-pop-entrance` (single hero or staggered group)
- pill bar expands sideways from a mark; chip stretches into a wide terminal pill → `card-morph-anchor` (container morph)
- cursor glide to a control, press, ripple → `cursor-click-ripple`; the press dip + recovery → `press-release-spring` (or `physics-press-reaction` for cursor+button compressed together)
- hover highlight fills, Search-button instant solid fill, UI keyword accents → `asr-keyword-glow` (static-timeline glow variant) or `press-release-spring` (color-transition variation)
- attachment drag-in with cursor → `context-sensitive-cursor` (pointer↔grab) + `spring-pop-entrance` (tray settle)
- content vanish / layout swap / panel collapse on submit; code↔preview instant flip → `scale-swap-transition` (paired same-center swap) or a hard `tl.set` state swap via `discrete-text-sequence` semantics
- prompt jumps to a heading on submit → FLIP reposition — see `hyperframes-keyframes` (FLIP); the travel itself via `nudge-curve` (slow-fast-slow group slide)
- status-phrase cross-dissolves with shimmer sweep → `discrete-text-sequence` (phrase swaps) + `ambient-glow-bloom` (Shimmer sweep variation — single-pass traveling sheen, clipped to the text)
- spinner rotation, animated trailing dots, pulsing loader glyphs → `svg-icon-enrichment` (rotating / pulsing internal SVG elements); the bounded "Thinking" pulse → `sine-wave-loop` (finite repeats — this pulse PERFORMS status, it is not idle wobble)
- checklist state flips, status-heading tense flip, status-pill swaps → `discrete-text-sequence` (discrete state stepping); the checkmark stamp → `svg-path-draw` or `spring-pop-entrance`
- streaming text blocks / log rows pushing content down → `dynamic-content-sequencing` (per-block windows) + `spring-pop-entrance` (per-row arrival)
- vertical output scroll following the newest line (page / terminal / in-card) → composition: content translateY keyed to the same timeline as the content windows + a matched `viewport-change` counter-pan when the frame itself travels
- generated page as a rounded card whose internal content scrolls → `3d-page-scroll` (flat variant — internal scroll of a page card)
- staggered chart line-draws → `svg-path-draw` (stroke-dashoffset, staggered starts)
- count-up ticker / live counters → `counting-dynamic-scale`; result bars / fills → `stat-bars-and-fills`
- single eased push-in landing on the input; slow continuous push-in on the result → `multi-phase-camera` (push phase) with the destination framed via `coordinate-target-zoom`
- zoom-out reveal from prompt pill to full workspace; zoom + pan cropping chrome → `viewport-change` (composite pan+scale on the `.world` wrapper)
- window fly-in with motion blur; blur-whip transition → `motion-blur-streak`
- ⌘K modal with background blur → `depth-of-field-blur` (blur the page plane, keep the modal sharp) + `spring-pop-entrance`
- full-frame grid parting at the vertical centerline → `center-outward-expansion` (halves glide outward in lockstep)
- orb formation with glowing rim → `ambient-glow-bloom` + `spring-pop-entrance`
- headline demotion (scale-down + desaturate + lift) → `gsap-effects` (plain composite tween; no dedicated rule needed)
- interface dim at the cut, hard cut to a minimal end card, end mid-word / mid-scroll → exit conventions, no rule needed
- long static end hold with only the caret blinking → `context-sensitive-cursor` (the blink is the sanctioned residual motion)

**camera modifier** (the camera always serves the ask or the answer; many members are fully camera-static — typing, submit theater, and streaming carry the shot)

- ONE smooth eased / accelerating push-in that lands tight on the input and LOCKS (Hook, Product_Intro) → `multi-phase-camera` (push) + `coordinate-target-zoom` (target the input) — the defining move of the "watch me ask" opener.
- ONE slow continuous push-in running under the typing or under the output build, decelerating to a near-hold (Product_Intro, Key_Feature) → `multi-phase-camera` — gives the response weight without stealing from it.
- ONE zoom-out reveal — the prompt pill turns out to live inside a full workspace (Key_Feature, sub-shape C) → `viewport-change` (pull-back) — the inverse move; the ask was closer to the product than you thought.
- Entry-only flourishes: window fly-in with motion blur (`motion-blur-streak`), zoom + pan cropping browser chrome (`viewport-change`) — both settle before typing starts.
- Never more than two real viewport moves per shot; the frame is LOCKED during submit theater and streaming (the content scrolls, the camera does not).

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
