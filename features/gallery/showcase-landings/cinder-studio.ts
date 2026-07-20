import type { ShowcaseLanding } from "@/features/gallery/showcase-landings/types";

const tokens = String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Marquee Hero · genre: atmospheric · theme: Lumen Night Foundry · tone: luxury-technical · anchor hue: molten brass · nav: N5 · footer: Ft5 · enrichment: E5 Tier-A CSS apparatus · contrast: pass (40–41) · mobile: pass (34, 49–57) */
:root {
  --color-paper: oklch(13% 0.014 265);
  --color-paper-2: oklch(17% 0.016 265);
  --color-paper-3: oklch(21% 0.018 265);
  --color-ink: oklch(95% 0.008 78);
  --color-ink-2: oklch(84% 0.012 76);
  --color-muted: oklch(70% 0.016 68);
  --color-rule: oklch(34% 0.018 265);
  --color-rule-2: oklch(48% 0.025 68);
  --color-accent: oklch(76% 0.17 50);
  --color-accent-2: oklch(68% 0.16 18);
  --color-accent-ink: oklch(15% 0.018 265);
  --color-focus: oklch(82% 0.18 88);
  --color-success: oklch(76% 0.12 145);
  --color-error: oklch(70% 0.17 25);
  --color-transparent: transparent;
  --color-glow-warm: oklch(80% 0.16 50 / 0.4);
  --color-glow-amber: oklch(82% 0.13 72 / 0.34);
  --color-glow-neutral: oklch(88% 0.055 92 / 0.28);
  --color-paper-emit: oklch(76% 0.17 50 / 0.045);
  --color-beam-warm: oklch(82% 0.16 50 / 0.28);
  --color-beam-amber: oklch(86% 0.12 72 / 0.24);
  --color-beam-neutral: oklch(91% 0.045 92 / 0.2);
  --color-blueprint: oklch(95% 0.008 262 / 0.04);
  --color-nav: oklch(17% 0.016 265 / 0.82);
  --font-display: 'Iowan Old Style', 'Baskerville', serif;
  --font-body: 'Avenir Next', 'Avenir', sans-serif;
  --font-mono: 'SFMono-Regular', 'Menlo', monospace;
  --space-3xs: 0.125rem;
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --space-4xl: 9rem;
  --text-xs: 0.7rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-md: 1.25rem;
  --text-lg: 1.5625rem;
  --text-xl: 1.953rem;
  --text-2xl: 2.441rem;
  --text-display: clamp(3.4rem, 7vw, 5.5rem);
  --text-display-s: clamp(2.75rem, 5vw, 5.25rem);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-press: 100ms;
  --dur-short: 180ms;
  --dur-medium: 320ms;
  --dur-long: 600ms;
  --dur-pulse: 4s;
  --rule-hair: 1px;
  --rule-strong: 2px;
  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-pill: 999px;
  --shadow-nav: 0 12px 40px oklch(6% 0.012 265 / 0.32);
  --shadow-depth: 0 30px 80px oklch(6% 0.012 265 / 0.42);
  --shadow-filament: 0 0 18px var(--glow-color);
}`;

const app = String.raw`import { useMemo, useState } from "react";
import "./tokens.css";
import "./styles.css";

const fixtures = [
  { id: "arc", number: "01", name: "arc", kind: "floor light", material: "brushed brass · linen", note: "a low arc that keeps the source out of sight." },
  { id: "fold", number: "02", name: "fold", kind: "wall light", material: "oxide red · opal glass", note: "a wall plane folded once to turn light inward." },
  { id: "coil", number: "03", name: "coil", kind: "table light", material: "blackened steel · paper", note: "a compact pool of light for late pages." },
  { id: "column", number: "04", name: "column", kind: "pendant", material: "cast ceramic · brass", note: "a narrow downlight with a hand-finished edge." },
] as const;

const temperatures = [
  { id: "warm", value: "2200 k", note: "ember" },
  { id: "amber", value: "2700 k", note: "evening" },
  { id: "neutral", value: "3000 k", note: "linen" },
] as const;

const meterBars = Array.from({ length: 56 }, (_, index) => index % 9);

export default function App() {
  const [fixtureId, setFixtureId] = useState<(typeof fixtures)[number]["id"]>("arc");
  const [temperatureId, setTemperatureId] = useState<(typeof temperatures)[number]["id"]>("amber");
  const [held, setHeld] = useState<Set<string>>(() => new Set());
  const [requested, setRequested] = useState(false);

  const fixture = useMemo(() => fixtures.find((item) => item.id === fixtureId) || fixtures[0], [fixtureId]);
  const temperature = temperatures.find((item) => item.id === temperatureId) || temperatures[1];

  const viewFixture = (id: (typeof fixtures)[number]["id"]) => {
    setFixtureId(id);
    document.querySelector("#top")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleHold = (id: string) => {
    setHeld((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main className="cinder-shell">
      <nav className="nav-pill" aria-label="primary">
        <a className="wordmark" href="#top">cinder</a>
        <div className="nav-links">
          <a href="#collection">fixtures</a>
          <a href="#materials">materials</a>
        </div>
        <button type="button" className="nav-action" onClick={() => document.querySelector("#collection")?.scrollIntoView({ behavior: "smooth" })}>
          edition 04 <span aria-hidden="true">↓</span>
        </button>
      </nav>

      <section className={'hero temperature--' + temperatureId + ' fixture--' + fixtureId} id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="machine-label">EDITION 04 · OPTICAL STUDY</p>
          <h1 id="hero-title">light, made to <em>disappear.</em></h1>
          <p className="hero-index">cinder studio / objects for the evening</p>
        </div>

        <figure className="apparatus" aria-labelledby="apparatus-caption">
          <div className="apparatus-field" aria-hidden="true">
            <span className="mount" />
            <span className="cable" />
            <span className="fixture-body"><i /></span>
            <span className="beam" />
            <span className="beam-floor" />
            <span className="callout callout--name">{fixture.number} · {fixture.name.toUpperCase()}</span>
            <span className="callout callout--material">{fixture.material.toUpperCase()}</span>
            <span className="callout callout--temperature">{temperature.value.toUpperCase()} · {temperature.note.toUpperCase()}</span>
          </div>
          <figcaption id="apparatus-caption">
            <span>light chamber / live study</span>
            <span aria-live="polite">{fixture.kind} · {temperature.value}</span>
          </figcaption>
          <div className="temperature-controls" aria-label="light temperature">
            {temperatures.map((item) => (
              <button
                key={item.id}
                type="button"
                className={temperatureId === item.id ? "temperature-button is-active" : "temperature-button"}
                aria-pressed={temperatureId === item.id}
                onClick={() => setTemperatureId(item.id)}
              >
                <span>{item.value}</span>
                <small>{item.note}</small>
              </button>
            ))}
          </div>
        </figure>
      </section>

      <aside className="meter" aria-label="edition 04 light readout">
        <p>BEAM · {temperature.value.toUpperCase()}</p>
        <div className="meter-bars" aria-hidden="true">
          {meterBars.map((height, index) => <span className={'meter-bar meter-bar--' + height} key={index} />)}
        </div>
        <p>{fixture.name.toUpperCase()} · ACTIVE</p>
      </aside>

      <section className="collection" id="collection" aria-labelledby="collection-title">
        <header className="collection-intro">
          <h2 id="collection-title">four fixtures.<br />one quiet room.</h2>
          <p>each study begins with what the room should feel like after the object is forgotten.</p>
        </header>

        <div className="fixture-ledger">
          {fixtures.map((item) => {
            const isHeld = held.has(item.id);
            const isActive = fixtureId === item.id;
            return (
              <article className={isActive ? "fixture-row is-active" : "fixture-row"} key={item.id}>
                <p className="fixture-number">{item.number}</p>
                <div className="fixture-title">
                  <h3>{item.name}</h3>
                  <p>{item.kind}</p>
                </div>
                <p className="fixture-material">{item.material}</p>
                <p className="fixture-note">{item.note}</p>
                <div className="fixture-actions">
                  <button type="button" className="text-action" onClick={() => viewFixture(item.id)}>
                    {isActive ? "in chamber" : "view in chamber"}
                  </button>
                  <button
                    type="button"
                    className={isHeld ? "hold-action is-success" : "hold-action"}
                    aria-pressed={isHeld}
                    onClick={() => toggleHold(item.id)}
                  >
                    {isHeld ? "held for viewing" : "hold for viewing"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="material-note" id="materials" aria-labelledby="materials-title">
        <div className="material-statement">
          <p className="machine-label">SURFACES · LEFT HONEST</p>
          <h2 id="materials-title">the room should remember the light, not the fixture.</h2>
        </div>
        <div className="material-copy">
          <p>ceramic keeps the maker’s edge, brass is allowed to darken, and linen carries a visible weave. the collection is imagined in small workshop runs.</p>
          <button
            className={requested ? "material-action is-success" : "material-action"}
            type="button"
            onClick={() => setRequested(true)}
            disabled={requested}
          >
            {requested ? "material sheet requested" : "request material sheet"}
          </button>
        </div>
      </section>

      <footer className="statement-footer">
        <p>less object.<br />more atmosphere.</p>
        <div className="footer-meta">
          <span className="wordmark">cinder studio</span>
          <span>edition 04 · fictional design concept · no external links</span>
          <span>2026</span>
        </div>
      </footer>
    </main>
  );
}`;

const styles = String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Marquee Hero · genre: atmospheric · theme: Lumen Night Foundry · tone: luxury-technical · anchor hue: molten brass · nav: N5 · footer: Ft5 · enrichment: E5 Tier-A CSS apparatus · contrast: pass (40–41) · slop: pass (42–49) · mobile: pass (34, 49–57) */
* { box-sizing: border-box; }
html, body, #root { width: 100%; min-height: 100%; margin: 0; overflow-x: clip; }
html { scroll-behavior: smooth; }
body { background: var(--color-paper); color: var(--color-ink); font-family: var(--font-body); font-size: var(--text-base); }
button, a { color: inherit; font: inherit; }
button { border: 0; }
a { text-decoration: none; }
.cinder-shell { min-height: 100%; background: var(--color-paper); color: var(--color-ink); text-transform: lowercase; }
.machine-label, .fixture-number, .hero-index, .meter, .apparatus figcaption, .callout { font-family: var(--font-mono); text-transform: uppercase; }
.nav-pill { position: fixed; z-index: 200; inset: var(--space-md) auto auto 50%; display: flex; align-items: center; gap: var(--space-md); width: max-content; max-width: calc(100% - (2 * var(--space-md))); min-height: 52px; padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-md); border: var(--rule-hair) solid var(--color-rule); border-radius: var(--radius-pill); background: var(--color-nav); box-shadow: var(--shadow-nav); backdrop-filter: blur(14px) saturate(110%); transform: translateX(-50%); }
.wordmark { font-family: var(--font-display); font-size: var(--text-md); font-weight: 400; letter-spacing: -0.025em; white-space: nowrap; }
.nav-links { display: none; align-items: center; gap: var(--space-md); }
.nav-links a, .nav-action { font-size: var(--text-sm); white-space: nowrap; }
.nav-links a { color: var(--color-ink-2); }
.nav-action, .temperature-button, .text-action, .hold-action, .material-action { min-height: 44px; cursor: pointer; transition: background-color var(--dur-short) var(--ease-out), color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out), transform var(--dur-press) var(--ease-out), opacity var(--dur-short) var(--ease-out); }
.nav-action { display: inline-flex; align-items: center; gap: var(--space-xs); padding-inline: var(--space-md); border-radius: var(--radius-pill); background: var(--color-ink); color: var(--color-accent-ink); }
.nav-action span { color: var(--color-accent-2); }
.hero { --beam-color: var(--color-beam-amber); --glow-color: var(--color-glow-amber); display: grid; grid-template-columns: minmax(0, 1fr); align-items: end; gap: var(--space-2xl); min-height: max(760px, 100svh); padding: var(--space-3xl) clamp(var(--space-md), 5vw, var(--space-3xl)) var(--space-2xl); background: linear-gradient(var(--color-blueprint) var(--rule-hair), var(--color-transparent) var(--rule-hair)) 0 0 / 48px 48px, linear-gradient(90deg, var(--color-blueprint) var(--rule-hair), var(--color-transparent) var(--rule-hair)) 0 0 / 48px 48px, radial-gradient(ellipse 36% 44% at 77% 48%, var(--glow-color), var(--color-transparent) 72%), var(--color-paper); }
.hero.temperature--warm { --beam-color: var(--color-beam-warm); --glow-color: var(--color-glow-warm); }
.hero.temperature--neutral { --beam-color: var(--color-beam-neutral); --glow-color: var(--color-glow-neutral); }
.hero-copy { align-self: end; min-width: 0; padding-block-end: var(--space-lg); }
.machine-label { margin: 0 0 var(--space-lg); color: var(--color-muted); font-size: var(--text-xs); letter-spacing: 0.12em; }
.hero h1 { min-width: 0; max-width: 10ch; margin: 0; font-family: var(--font-display); font-size: var(--text-display); font-style: normal; font-weight: 400; letter-spacing: -0.055em; line-height: 0.88; overflow-wrap: anywhere; }
.hero h1 em { position: relative; color: var(--color-accent-2); font-style: normal; white-space: nowrap; }
.hero h1 em::after { position: absolute; inset: auto 0.04em 0.02em; height: var(--rule-hair); content: ''; background: var(--color-accent-2); transform-origin: left; animation: underline-in var(--dur-medium) var(--ease-out) 900ms backwards; }
.hero-index { margin: var(--space-xl) 0 0; color: var(--color-muted); font-size: var(--text-xs); letter-spacing: 0.08em; }
.apparatus { align-self: end; width: min(100%, 520px); margin: 0 auto; }
.apparatus-field { position: relative; min-height: 430px; isolation: isolate; }
.mount, .cable, .fixture-body, .beam, .beam-floor { position: absolute; display: block; }
.mount { z-index: 4; inset: 4% auto auto 50%; width: 64px; height: 8px; border-radius: var(--radius-pill); background: var(--color-rule-2); transform: translateX(-50%); }
.cable { z-index: 3; inset: 4% auto auto 50%; width: var(--rule-hair); height: 25%; background: var(--color-rule-2); }
.fixture-body { z-index: 4; inset: 28% auto auto 50%; width: 108px; height: 124px; border: var(--rule-hair) solid var(--color-rule-2); border-radius: 52% 52% 20% 20%; background: var(--color-paper-3); box-shadow: inset 0 -24px 44px var(--glow-color), var(--shadow-depth); transform: translateX(-50%); transition: transform var(--dur-medium) var(--ease-in-out); }
.fixture-body::before { position: absolute; inset: auto 12% -6px; height: 12px; content: ''; border-radius: var(--radius-pill); background: var(--color-accent); box-shadow: var(--shadow-filament); animation: filament-pulse var(--dur-pulse) var(--ease-in-out) infinite; }
.fixture-body i { position: absolute; inset: 20% 28%; border: var(--rule-hair) solid var(--color-rule-2); border-radius: 50%; }
.fixture--fold .fixture-body { border-radius: var(--radius-sm); transform: translateX(-50%) skewX(-8deg); }
.fixture--coil .fixture-body { width: 124px; height: 124px; border-radius: 50%; background: var(--color-transparent); border-width: 14px; }
.fixture--column .fixture-body { width: 66px; height: 156px; border-radius: 45% 45% 14% 14%; }
.beam { z-index: 2; inset: 57% auto auto 50%; width: 62%; height: 31%; background: linear-gradient(to bottom, var(--beam-color), var(--color-transparent)); clip-path: polygon(43% 0, 57% 0, 100% 100%, 0 100%); filter: blur(6px); opacity: 0.78; transform: translateX(-50%); transition: opacity var(--dur-medium) var(--ease-out); }
.beam-floor { z-index: 1; inset: auto auto 4% 50%; width: 70%; height: 18px; border-radius: 50%; background: var(--beam-color); filter: blur(12px); transform: translateX(-50%); }
.callout { position: absolute; z-index: 5; display: flex; align-items: center; gap: var(--space-xs); color: var(--color-muted); font-size: 0.625rem; letter-spacing: 0.08em; white-space: nowrap; }
.callout::before { width: clamp(30px, 7vw, 92px); height: var(--rule-hair); content: ''; background: var(--color-rule-2); }
.callout--name { inset: 24% auto auto 0; }
.callout--material { inset: 43% 0 auto auto; flex-direction: row-reverse; }
.callout--temperature { inset: auto auto 15% 4%; }
.apparatus figcaption { display: flex; justify-content: space-between; gap: var(--space-md); padding-block: var(--space-sm); border-block: var(--rule-hair) solid var(--color-rule); color: var(--color-muted); font-size: 0.625rem; letter-spacing: 0.08em; }
.temperature-controls { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.temperature-button { display: grid; gap: var(--space-2xs); min-width: 0; padding: var(--space-sm); border-inline-end: var(--rule-hair) solid var(--color-rule); background: var(--color-paper); color: var(--color-muted); text-align: start; }
.temperature-button:last-child { border-inline-end: 0; }
.temperature-button span { font-family: var(--font-mono); font-size: var(--text-xs); white-space: nowrap; }
.temperature-button small { font-size: var(--text-sm); }
.temperature-button.is-active { background: var(--color-paper-3); color: var(--color-ink); }
.meter { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-lg); min-height: 52px; padding: var(--space-sm) clamp(var(--space-md), 5vw, var(--space-3xl)); border-block: var(--rule-hair) solid var(--color-rule); background: linear-gradient(var(--color-blueprint) var(--rule-hair), var(--color-transparent) var(--rule-hair)) 0 0 / 32px 32px, var(--color-paper-2); color: var(--color-muted); font-size: 0.625rem; letter-spacing: 0.08em; }
.meter p { margin: 0; white-space: nowrap; }
.meter-bars { display: flex; align-items: center; gap: 2px; height: 24px; }
.meter-bar { flex: 1; min-width: 1px; background: var(--color-accent); opacity: 0.42; }
.meter-bar--0, .meter-bar--8 { height: 12%; }
.meter-bar--1, .meter-bar--7 { height: 26%; }
.meter-bar--2, .meter-bar--6 { height: 42%; }
.meter-bar--3, .meter-bar--5 { height: 68%; }
.meter-bar--4 { height: 100%; opacity: 0.76; }
.collection { display: grid; gap: var(--space-3xl); padding: var(--space-4xl) clamp(var(--space-md), 5vw, var(--space-3xl)); }
.collection-intro { display: grid; gap: var(--space-lg); align-items: end; }
.collection-intro h2, .material-statement h2, .statement-footer > p { min-width: 0; margin: 0; font-family: var(--font-display); font-style: normal; font-weight: 400; letter-spacing: -0.04em; overflow-wrap: anywhere; }
.collection-intro h2 { max-width: 11ch; font-size: var(--text-display-s); line-height: 0.96; }
.collection-intro > p { max-width: 44ch; margin: 0; color: var(--color-ink-2); font-size: var(--text-md); line-height: 1.55; }
.fixture-ledger { border-top: var(--rule-hair) solid var(--color-rule); }
.fixture-row { display: grid; grid-template-columns: auto minmax(0, 0.8fr); gap: var(--space-md); padding-block: var(--space-xl); border-bottom: var(--rule-hair) solid var(--color-rule); }
.fixture-row.is-active { background: linear-gradient(90deg, var(--color-paper-emit, var(--color-paper-2)), var(--color-transparent)); }
.fixture-number, .fixture-title p, .fixture-material, .fixture-note { margin: 0; }
.fixture-number { padding-top: var(--space-xs); color: var(--color-accent); font-size: var(--text-xs); }
.fixture-title h3 { margin: 0; font-family: var(--font-display); font-size: var(--text-2xl); font-style: normal; font-weight: 400; letter-spacing: -0.035em; }
.fixture-title p, .fixture-material { margin-top: var(--space-2xs); color: var(--color-muted); }
.fixture-material { grid-column: 2; font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; }
.fixture-note { grid-column: 2; max-width: 42ch; color: var(--color-ink-2); line-height: 1.6; }
.fixture-actions { grid-column: 2; display: flex; flex-wrap: wrap; gap: var(--space-sm); }
.text-action, .hold-action, .material-action { padding-inline: var(--space-md); border: var(--rule-hair) solid var(--color-rule-2); border-radius: var(--radius-pill); background: var(--color-transparent); color: var(--color-ink-2); white-space: nowrap; }
.text-action { border-color: var(--color-transparent); text-decoration: underline; text-decoration-color: var(--color-rule-2); text-underline-offset: 0.35em; }
.hold-action.is-success, .material-action.is-success { border-color: var(--color-success); color: var(--color-success); }
.material-note { display: grid; gap: var(--space-2xl); padding: var(--space-3xl) clamp(var(--space-md), 5vw, var(--space-3xl)) var(--space-4xl); background: var(--color-paper-2); color: var(--color-ink); }
.material-statement h2 { max-width: 15ch; font-size: clamp(2.5rem, 6vw, 5.4rem); line-height: 1; }
.material-copy { align-self: end; max-width: 44ch; }
.material-copy p { margin: 0 0 var(--space-xl); color: var(--color-ink-2); font-size: var(--text-md); line-height: 1.65; }
.material-action { color: var(--color-ink); }
.statement-footer { padding: var(--space-4xl) clamp(var(--space-md), 5vw, var(--space-3xl)) var(--space-xl); }
.statement-footer > p { max-width: 14ch; font-size: clamp(3rem, 8vw, 7rem); line-height: 0.9; }
.footer-meta { display: grid; gap: var(--space-md); margin-top: var(--space-3xl); padding-top: var(--space-lg); border-top: var(--rule-hair) solid var(--color-rule); color: var(--color-muted); font-size: var(--text-xs); }
.nav-links a:focus-visible, .nav-action:focus-visible, .wordmark:focus-visible, .temperature-button:focus-visible, .text-action:focus-visible, .hold-action:focus-visible, .material-action:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 3px; }
.nav-action:active, .temperature-button:active, .text-action:active, .hold-action:active, .material-action:active { transform: translateY(1px); }
.nav-action:disabled, .temperature-button:disabled, .text-action:disabled, .hold-action:disabled, .material-action:disabled { cursor: not-allowed; opacity: 0.55; }
.nav-action.is-loading, .temperature-button.is-loading, .text-action.is-loading, .hold-action.is-loading, .material-action.is-loading { cursor: progress; opacity: 0.72; }
.nav-action.is-error, .temperature-button.is-error, .text-action.is-error, .hold-action.is-error, .material-action.is-error { border-color: var(--color-error); color: var(--color-error); }
@media (hover: hover) and (pointer: fine) {
  .nav-links a:hover, .wordmark:hover { color: var(--color-accent); }
  .nav-action:hover { background: var(--color-accent); color: var(--color-accent-ink); }
  .temperature-button:hover { background: var(--color-paper-3); color: var(--color-ink); }
  .text-action:hover { color: var(--color-accent); text-decoration-color: var(--color-accent); }
  .hold-action:hover, .material-action:hover { border-color: var(--color-accent); color: var(--color-accent); }
}
@media (min-width: 40rem) {
  .nav-links { display: flex; }
  .hero { grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr); align-items: center; padding-block-end: var(--space-4xl); }
  .apparatus { margin-inline-end: 0; }
  .collection-intro { grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); }
  .fixture-row { grid-template-columns: auto minmax(0, 0.7fr) minmax(0, 0.9fr); align-items: start; }
  .fixture-material, .fixture-note, .fixture-actions { grid-column: 3; }
  .material-note { grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr); }
  .footer-meta { grid-template-columns: auto minmax(0, 1fr) auto; align-items: baseline; }
  .footer-meta span:nth-child(2) { text-align: center; }
}
@media (min-width: 60rem) {
  .fixture-row { grid-template-columns: auto minmax(0, 0.7fr) minmax(0, 0.75fr) minmax(0, 0.85fr) auto; gap: var(--space-lg); }
  .fixture-material, .fixture-note, .fixture-actions { grid-column: auto; }
  .fixture-actions { justify-content: flex-end; flex-wrap: nowrap; }
}
@media (max-width: 39.99rem) {
  .nav-pill { inset-block-start: var(--space-sm); }
  .nav-action { padding-inline: var(--space-sm); }
  .hero { min-height: 860px; padding-top: calc(var(--space-3xl) + var(--space-md)); }
  .hero h1 { max-width: 9ch; font-size: clamp(3.2rem, 17vw, 5.2rem); }
  .apparatus-field { min-height: 360px; }
  .callout--material { inset-inline-end: var(--space-2xs); }
  .meter { grid-template-columns: minmax(0, 1fr); gap: var(--space-xs); }
  .meter-bars { grid-row: 1; }
  .meter p { white-space: normal; }
  .meter p:last-child { display: none; }
  .temperature-button { min-height: 58px; }
  .fixture-actions { align-items: flex-start; }
  .statement-footer { padding-top: var(--space-3xl); }
}
@media (pointer: coarse) {
  .nav-links a, .nav-action, .temperature-button, .text-action, .hold-action, .material-action { min-height: 48px; }
}
@keyframes underline-in {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes filament-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.88; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; }
}`;

export const cinderStudio: ShowcaseLanding = {
  id: "showcase-landing-cinder-studio",
  slug: "cinder-studio",
  title: "Cinder Studio — Atelier Edition",
  description:
    "A premium atmospheric concept for an architectural lighting atelier: dark luxury, cinematic interaction rhythms, and a calm, instrument-driven showcase of fixture craftsmanship.",
  prompt:
    "Create a premium responsive landing page for a fictional architectural lighting studio called Cinder Studio. Use an atmospheric luxury direction inspired by an optical laboratory: cool-violet near-black canvas, molten-brass glow, classical upright serif for hierarchy, refined humanist sans for body copy, and mono fixture labels. Structure the page as a marquee-style studio thesis: a live light chamber in the hero, interactive fixture controls, material-led storytelling, a restrained ledger for four fixtures, and a quiet statement footer. Keep interactions subtle: one-click fixture switching, three light temperatures, and one stateful action for material requests. Never add fabricated metrics, testimonials, remote links, stock imagery, or fake UI chrome. Ensure full keyboard focus support, reduced-motion parity, responsive behavior at 320/375/414/768, and all styling tokens in `tokens.css` using OKLCH variables.",
  category: "Atmospheric luxury studio",
  accent: "oklch(76% 0.17 50)",
  thumbnailUrl: "/showcase/cinder-studio.webp",
  highlights: [
    "Atmospheric studio layout without a generic hero-only pattern",
    "Interactive light chamber with fixture presets and temperature tuning",
    "Local typography and tokenized CSS for a high-end tactile atmosphere",
  ],
  files: [
    { path: "App.tsx", content: app },
    { path: "tokens.css", content: tokens },
    { path: "styles.css", content: styles },
  ],
};
