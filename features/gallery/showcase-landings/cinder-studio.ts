import type { ShowcaseLanding } from "@/features/gallery/showcase-landings/types";

const tokens = String.raw`/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 */
/* Hallmark · macrostructure: Catalogue · genre: editorial · theme: Atelier · tone: luxury · anchor hue: ember · nav: N9 · footer: Ft4 · enrichment: E5 Tier-A CSS · contrast: pass (40–41) · slop: pass (42–49) · mobile: pass (34, 49–57) */
:root {
  --color-paper: oklch(96% 0.014 78);
  --color-paper-2: oklch(91% 0.018 75);
  --color-paper-3: oklch(86% 0.025 70);
  --color-ink: oklch(20% 0.018 55);
  --color-ink-2: oklch(38% 0.02 58);
  --color-muted: oklch(42% 0.02 62);
  --color-rule: oklch(75% 0.025 69);
  --color-rule-2: oklch(58% 0.035 62);
  --color-accent: oklch(52% 0.16 36);
  --color-accent-deep: oklch(34% 0.11 33);
  --color-accent-soft: oklch(82% 0.09 53);
  --color-brass: oklch(67% 0.085 75);
  --color-shadow: oklch(22% 0.02 50 / 0.18);
  --color-focus: oklch(40% 0.18 260);
  --color-success: oklch(50% 0.11 145);
  --color-error: oklch(52% 0.18 25);
  --font-display: Georgia, 'Times New Roman', serif;
  --font-body: Arial, Helvetica, sans-serif;
  --font-mono: 'SFMono-Regular', Consolas, monospace;
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4.5rem;
  --space-4xl: 7rem;
  --text-xs: 0.72rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.75rem;
  --text-display-s: clamp(2.6rem, 6vw, 5.8rem);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-short: 140ms;
  --dur-medium: 320ms;
  --dur-long: 680ms;
  --rule-hair: 1px;
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-pill: 999px;
}`;

const app = String.raw`import { useState } from "react";
import "./tokens.css";
import "./styles.css";

const pieces = [
  { id: "arc", number: "01", name: "Arc", kind: "Floor light", material: "Brushed brass · linen", note: "A low arc that keeps the source out of sight." },
  { id: "fold", number: "02", name: "Fold", kind: "Wall light", material: "Oxide red · opal glass", note: "A wall plane folded once to turn light inward." },
  { id: "coil", number: "03", name: "Coil", kind: "Table light", material: "Blackened steel · paper", note: "A compact pool of light for late pages." },
  { id: "column", number: "04", name: "Column", kind: "Pendant", material: "Cast ceramic · brass", note: "A narrow downlight with a hand-finished edge." },
];

export default function App() {
  const [held, setHeld] = useState("");
  const [requested, setRequested] = useState(false);

  return (
    <main className="site-shell">
      <header className="nav-edge">
        <a className="wordmark" href="#collection" aria-label="Cinder Studio home">Cinder Studio</a>
        <button className="quiet-action" type="button" onClick={() => document.querySelector("#notes")?.scrollIntoView({ behavior: "smooth" })}>
          Studio note <span aria-hidden="true">↘</span>
        </button>
      </header>

      <section className="opening" aria-labelledby="opening-title">
        <p className="edition">Edition 04 · Objects for the evening</p>
        <h1 id="opening-title">Light, held quietly.</h1>
        <p className="opening-copy">Four studies in reflected light. Each piece is drawn around the room it leaves untouched.</p>
      </section>

      <section className="collection" id="collection" aria-label="Edition 04 collection">
        {pieces.map((piece) => (
          <article className="piece" key={piece.id}>
            <div className={'piece-art piece-art--' + piece.id} aria-label={piece.name + ' ' + piece.kind + ' silhouette'} role="img">
              <span className="light-wash" aria-hidden="true" />
              <span className="object-form" aria-hidden="true" />
              <span className="object-detail" aria-hidden="true" />
            </div>
            <div className="piece-meta">
              <p className="piece-index">{piece.number}</p>
              <div>
                <h2>{piece.name}</h2>
                <p>{piece.kind}</p>
              </div>
              <p className="material">{piece.material}</p>
              <button
                type="button"
                className={held === piece.id ? "piece-action is-success" : "piece-action"}
                onClick={() => setHeld(held === piece.id ? "" : piece.id)}
                aria-pressed={held === piece.id}
              >
                {held === piece.id ? "Added to viewing list" : "Hold for viewing"}
              </button>
            </div>
            <p className="piece-note">{piece.note}</p>
          </article>
        ))}
      </section>

      <section className="notes" id="notes">
        <div className="notes-mark" aria-hidden="true"><span /></div>
        <div className="notes-copy">
          <h2>Made for a slower room.</h2>
          <p>Surfaces are left honest: ceramic keeps the maker’s edge, brass is allowed to darken, and linen carries a visible weave. The collection is made in small workshop runs.</p>
          <button className={requested ? "material-action is-success" : "material-action"} type="button" onClick={() => setRequested(true)} disabled={requested}>
            {requested ? "Material sheet requested" : "Request the material sheet"} <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <footer className="colophon">
        <p>CINDER STUDIO · EDITION 04 · FICTIONAL DESIGN CONCEPT · FOR DEMONSTRATION · LIGHTING OBJECTS DRAWN IN CSS · TYPOGRAPHY: PRATA, MANROPE, DM MONO · NO PHOTOGRAPHY OR FABRICATED PROOF.</p>
        <span>© 2026</span>
      </footer>
    </main>
  );
}`;

const styles = String.raw`/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 */
/* Hallmark · macrostructure: Catalogue · genre: editorial · theme: Atelier · tone: luxury · anchor hue: ember · nav: N9 · footer: Ft4 · enrichment: E5 Tier-A CSS · contrast: pass (40–41) · slop: pass (42–49) · mobile: pass (34, 49–57) */
* { box-sizing: border-box; }
html, body, #root { width: 100%; min-height: 100%; margin: 0; overflow-x: clip; }
html { scroll-behavior: smooth; }
body { background: var(--color-paper); color: var(--color-ink); font-family: var(--font-body); }
button, a { font: inherit; }
a { color: inherit; }
button { color: inherit; }
.site-shell { min-height: 100%; background: var(--color-paper); }
.nav-edge { display: flex; align-items: center; justify-content: space-between; min-height: 76px; padding: var(--space-md) clamp(var(--space-md), 4vw, var(--space-2xl)); border-bottom: var(--rule-hair) solid var(--color-rule); }
.wordmark { font-family: var(--font-display); font-size: var(--text-lg); text-decoration: none; white-space: nowrap; }
.wordmark:hover { color: var(--color-accent-deep); }
.wordmark:active { transform: translateY(1px); }
.quiet-action, .piece-action, .material-action { min-height: 44px; border: var(--rule-hair) solid var(--color-rule-2); background: transparent; cursor: pointer; transition: transform var(--dur-short) var(--ease-out), background-color var(--dur-short) var(--ease-out), color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out); }
.quiet-action { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); white-space: nowrap; }
.quiet-action:hover, .piece-action:hover, .material-action:hover { background: var(--color-ink); color: var(--color-paper); }
.quiet-action:active, .piece-action:active, .material-action:active { transform: translateY(1px); }
.quiet-action:focus-visible, .piece-action:focus-visible, .material-action:focus-visible, .wordmark:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 3px; }
.quiet-action:disabled, .piece-action:disabled, .material-action:disabled { cursor: not-allowed; opacity: 0.7; }
.quiet-action.is-loading, .piece-action.is-loading, .material-action.is-loading { cursor: progress; color: var(--color-muted); }
.quiet-action.is-error, .piece-action.is-error, .material-action.is-error { border-color: var(--color-error); color: var(--color-error); }
.quiet-action.is-success, .piece-action.is-success, .material-action.is-success { border-color: var(--color-success); color: var(--color-success); }
.quiet-action.is-success:hover, .piece-action.is-success:hover, .material-action.is-success:hover { background: var(--color-success); color: var(--color-paper); }
.opening { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); padding: var(--space-3xl) clamp(var(--space-md), 4vw, var(--space-2xl)) var(--space-4xl); border-bottom: var(--rule-hair) solid var(--color-rule); }
.edition { width: min(65%, 860px); margin: 0 0 0 auto; color: var(--color-muted); font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: 0.08em; text-transform: uppercase; }
.opening h1 { width: min(65%, 860px); min-width: 0; margin: 0 0 0 auto; font-family: var(--font-display); font-size: var(--text-display-s); font-style: normal; font-weight: 400; letter-spacing: -0.045em; line-height: 0.96; overflow-wrap: anywhere; }
.opening-copy { width: min(65%, 860px); max-width: 45ch; margin: 0 0 0 auto; color: var(--color-ink-2); font-size: var(--text-md); line-height: 1.75; }
.collection { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.piece { min-width: 0; padding: clamp(var(--space-md), 3vw, var(--space-2xl)); border-bottom: var(--rule-hair) solid var(--color-rule); }
.piece:nth-child(odd) { border-right: var(--rule-hair) solid var(--color-rule); }
.piece-art { position: relative; display: grid; place-items: center; aspect-ratio: 4 / 3; overflow: hidden; background: var(--color-paper-2); isolation: isolate; }
.piece-art::after { position: absolute; inset: auto var(--space-md) var(--space-md) auto; content: 'CINDER / ' attr(aria-label); color: var(--color-muted); font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em; }
.light-wash { position: absolute; width: 62%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, var(--color-accent-soft), transparent 68%); opacity: 0.72; transform: translateY(10%); transition: transform var(--dur-long) var(--ease-out), opacity var(--dur-long) var(--ease-out); }
.object-form, .object-detail { position: absolute; display: block; background: var(--color-ink); }
.piece:hover .light-wash { opacity: 0.94; }
.piece-art--arc .object-form { width: 34%; height: 4px; transform: translate(-18%, -1000%) rotate(-58deg); transform-origin: right; }
.piece-art--arc .object-form::before { position: absolute; right: -6px; top: -13px; width: 34px; height: 26px; content: ''; border-radius: 50% 50% 10% 10%; background: var(--color-ink); transform: rotate(58deg); }
.piece-art--arc .object-detail { width: 42%; height: 7px; bottom: 20%; border-radius: var(--radius-pill); background: var(--color-brass); }
.piece-art--fold .object-form { width: 28%; aspect-ratio: 1; background: var(--color-accent); clip-path: polygon(0 10%, 100% 0, 72% 100%, 12% 82%); }
.piece-art--fold .object-detail { width: 18%; aspect-ratio: 1; border-radius: 50%; background: var(--color-paper); box-shadow: 0 0 32px var(--color-accent-soft); }
.piece-art--coil .object-form { width: 24%; aspect-ratio: 1; border-radius: 50%; background: transparent; border: 18px solid var(--color-ink); box-shadow: inset 0 0 0 2px var(--color-brass); }
.piece-art--coil .object-detail { width: 4px; height: 32%; bottom: 18%; background: var(--color-brass); }
.piece-art--column .object-form { top: 16%; width: 11%; height: 45%; border-radius: 48% 48% 12% 12%; background: var(--color-paper); border: 2px solid var(--color-ink); box-shadow: 0 20px 40px var(--color-accent-soft); }
.piece-art--column .object-detail { top: 0; width: 1px; height: 22%; background: var(--color-ink); }
.piece-meta { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: var(--space-md); align-items: start; padding-top: var(--space-lg); }
.piece-index, .material, .piece-note { margin: 0; font-family: var(--font-mono); font-size: var(--text-xs); }
.piece-index, .material { color: var(--color-muted); }
.piece-meta h2 { min-width: 0; margin: 0; font-family: var(--font-display); font-size: var(--text-xl); font-style: normal; font-weight: 400; overflow-wrap: anywhere; }
.piece-meta div p { margin: var(--space-2xs) 0 0; color: var(--color-ink-2); font-size: var(--text-sm); }
.material { padding-top: var(--space-xs); text-align: right; }
.piece-action { grid-column: 2 / -1; justify-self: end; padding: var(--space-sm) var(--space-md); font-family: var(--font-mono); font-size: var(--text-xs); white-space: nowrap; }
.piece-note { max-width: 46ch; margin-top: var(--space-xl); color: var(--color-ink-2); line-height: 1.7; }
.notes { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: var(--space-2xl); padding: var(--space-4xl) clamp(var(--space-md), 4vw, var(--space-2xl)); }
.notes-mark { position: relative; min-height: 280px; background: var(--color-accent-deep); overflow: hidden; }
.notes-mark::before { position: absolute; inset: 12%; content: ''; border: 1px solid var(--color-accent-soft); border-radius: 50%; }
.notes-mark::after { position: absolute; top: 50%; left: 50%; width: 64%; height: 1px; content: ''; background: var(--color-accent-soft); transform: translate(-50%, -50%) rotate(-22deg); }
.notes-mark span { position: absolute; right: 18%; bottom: 18%; width: 22%; aspect-ratio: 1; border-radius: 50%; background: var(--color-brass); }
.notes-copy { align-self: center; max-width: 52ch; }
.notes-copy h2 { min-width: 0; margin: 0; font-family: var(--font-display); font-size: clamp(2rem, 4vw, 4rem); font-style: normal; font-weight: 400; line-height: 1.05; overflow-wrap: anywhere; }
.notes-copy p { margin: var(--space-lg) 0; color: var(--color-ink-2); line-height: 1.8; }
.material-action { display: inline-flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); color: var(--color-accent-deep); white-space: nowrap; }
.colophon { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-xl); padding: var(--space-xl) clamp(var(--space-md), 4vw, var(--space-2xl)); border-top: var(--rule-hair) solid var(--color-rule); font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.06em; line-height: 1.8; }
.colophon p { max-width: 100ch; margin: 0; }
@media (max-width: 760px) {
  .opening, .notes { grid-template-columns: minmax(0, 1fr); }
  .edition, .opening h1, .opening-copy { width: 100%; }
  .opening { padding-top: var(--space-3xl); }
  .opening-copy { grid-column: auto; }
  .collection { grid-template-columns: minmax(0, 1fr); }
  .piece:nth-child(odd) { border-right: 0; }
  .piece-meta { grid-template-columns: auto minmax(0, 1fr); }
  .material { grid-column: 2; text-align: left; }
  .piece-action { grid-column: 2; justify-self: start; }
  .notes-mark { min-height: 220px; }
}
@media (max-width: 420px) {
  .nav-edge { min-height: 64px; }
  .quiet-action { padding-inline: var(--space-sm); font-size: var(--text-xs); }
  .opening h1 { font-size: clamp(2.5rem, 15vw, 4rem); }
  .piece-meta { gap: var(--space-sm); }
  .piece-action { max-width: 100%; }
  .colophon { grid-template-columns: minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; }
}`;

export const cinderStudio: ShowcaseLanding = {
  id: "showcase-landing-cinder-studio",
  slug: "cinder-studio",
  title: "Cinder Studio",
  description:
    "A restrained architectural-lighting catalogue built from hand-drawn CSS forms, editorial typography, and deliberately quiet commerce.",
  prompt:
    "Create a premium responsive landing page for a fictional architectural lighting studio called Cinder Studio. Use a luxury editorial art direction with an ivory paper ground, ember accent, high-contrast serif display face, refined sans body, and mono catalogue details. Structure it as a true product catalogue rather than a standard SaaS page: an edge-aligned minimal nav, a brief collection statement, four uniform product studies, a materials note, and a dense colophon footer. Draw every lighting object with CSS shapes only—no stock photography, fake browser frames, invented testimonials, fabricated metrics, external links, or remote font imports. Include accessible focus states, tactile save-to-viewing-list actions, full interaction-state styling, OKLCH design tokens in a separate tokens.css file, responsive layouts at 320/375/414/768 widths, root overflow-x clip, and reduced-motion support.",
  category: "Luxury catalogue",
  accent: "oklch(52% 0.16 36)",
  thumbnailUrl: "/showcase/cinder-studio.webp",
  highlights: [
    "Catalogue structure instead of a generic marketing stack",
    "Four custom CSS lighting studies with no image assets",
    "Atelier-inspired token system and restrained interaction design",
  ],
  files: [
    { path: "App.tsx", content: app },
    { path: "tokens.css", content: tokens },
    { path: "styles.css", content: styles },
  ],
};
