# Squid design intelligence

Distilled concepts from **Hallmark** and **design-taste-frontend** skills, compiled into Squid's generation pipeline.

## Runtime modules

| Module | Purpose |
| --- | --- |
| `features/generation/design-intelligence.ts` | Genres, macrostructures, taste dials, anti-slop rules, pre-emit critique axes |
| `features/generation/screenshot-clone.ts` | Hallmark `study`-style DNA extraction, clone intent detection, fidelity codegen contract |
| `features/generation/style-packs.ts` | 12 Hallmark-themed Style Packs (Cobalt, Lumen, Specimen, …) with surface maps and scaffolds |
| `features/generation/design-prompt-contracts.ts` | Full prompt contracts (`designTasteContract`, structural diversity, typography fidelity, …) |
| `features/generation/hallmark-memory.ts` | Reads/writes `.hallmark/log.json` for pack and macrostructure diversification |

## Key concepts wired into Squid

### Hallmark (original builds)

- **Macrostructures** — 21 named page shapes (Marquee Hero, Bento Grid, Workbench, …); avoid Specimen fall-through and hero→3-cards→CTA defaults.
- **Genres** — editorial · modern-minimal · atmospheric · playful; route Style Pack clusters.
- **Style Packs** — complete aesthetic worlds: surface map, fonts, nav/footer archetypes, composition scaffold, hard bans.
- **Diversification** — consecutive builds differ on paper band, display style, or accent hue; nav/footer archetypes rotate.
- **Pre-emit critique** — Philosophy, Hierarchy, Execution, Specificity, Restraint, Variety (1–5 each; revise if &lt;3).
- **Slop gates** — no fake metrics, fake browser chrome, em-dash copy, italic headings, section-number eyebrows, duplicate CTAs.

### design-taste-frontend (original builds)

- **Design Read** — infer page kind, audience, vibe before styling.
- **Taste dials** — DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY (default 8/6/4 for marketing).
- **Anti-slop tells** — AI purple mesh, yellow/black CTAs, Inter-only, three equal cards, marquee spam.
- **Hero discipline** — viewport-fit, ≤4 text elements, subtext ≤20 words, trust logos below hero.
- **Preflight matrix** — contrast, eyebrow ration, zigzag cap, one accent family, shape consistency.

### Screenshot clone (Hallmark `study` + image-to-code)

When a user attaches a screenshot (especially via **clone a site**):

1. **Direct multimodal codegen** — the screenshot is attached as an `image` part on the last user message; the coding model sees the pixels directly (no text-only intermediary).
2. **Clone intent** — default fidelity lock; inspiration-only when user says "inspired by" / "don't copy".
3. **Codegen** uses `screenshotCloneMode` — suspends Style Pack rotation; fidelity contract tells the model to read layout/colors/copy from the attached image.
4. **Model routing** — text-only models (e.g. DeepSeek V4 Flash) auto-route to `google/gemini-3-flash-preview` for screenshot builds.
5. **Memory** — `.hallmark/log.json` records `studied-DNA (screenshot-direct)` entries.

Optional: `screenshotCloneVisionPrompt` remains available for a separate DNA extraction pass if re-enabled later.

## Source skills (not loaded at runtime)

Human-editable references live under `.agents/skills/`:

- `design-taste-frontend`, `design-taste-frontend-v1`
- `image-to-code`, `imagegen-frontend-web`
- `high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui`

When updating taste rules, distill changes into the TypeScript modules above — Squid does not read `SKILL.md` files during generation.

## Extending

1. Add pack definitions in `style-packs.ts` and map Hallmark theme names in `hallmark-memory.ts`.
2. Extend `designTasteContract` or `UNIVERSAL_ANTI_SLOP_RULES` for new hard bans.
3. For richer clone fidelity, consider multimodal codegen (pass image to coding model) or image-to-code's generate-then-implement loop.
