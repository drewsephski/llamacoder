module.exports=[982283,e=>{"use strict";let a=[{id:"showcase-landing-cinder-studio",slug:"cinder-studio",title:"Cinder Studio — Atelier Edition",description:"A premium atmospheric concept for an architectural lighting atelier: dark luxury, cinematic interaction rhythms, and a calm, instrument-driven showcase of fixture craftsmanship.",prompt:"Create a premium responsive landing page for a fictional architectural lighting studio called Cinder Studio. Use an atmospheric luxury direction inspired by an optical laboratory: cool-violet near-black canvas, molten-brass glow, classical upright serif for hierarchy, refined humanist sans for body copy, and mono fixture labels. Structure the page as a marquee-style studio thesis: a live light chamber in the hero, interactive fixture controls, material-led storytelling, a restrained ledger for four fixtures, and a quiet statement footer. Keep interactions subtle: one-click fixture switching, three light temperatures, and one stateful action for material requests. Never add fabricated metrics, testimonials, remote links, stock imagery, or fake UI chrome. Ensure full keyboard focus support, reduced-motion parity, responsive behavior at 320/375/414/768, and all styling tokens in `tokens.css` using OKLCH variables.",category:"Atmospheric luxury studio",accent:"oklch(76% 0.17 50)",thumbnailUrl:"/showcase/cinder-studio.webp",thumbnailWidth:1440,thumbnailHeight:900,highlights:["Atmospheric studio layout without a generic hero-only pattern","Interactive light chamber with fixture presets and temperature tuning","Local typography and tokenized CSS for a high-end tactile atmosphere"],files:[{path:"App.tsx",content:String.raw`import { useMemo, useState } from "react";
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
}`},{path:"tokens.css",content:String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
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
}`},{path:"styles.css",content:String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
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
}`}]},{id:"showcase-landing-relay",slug:"relay-release-evidence",title:"Relay — Release Workbench",description:"A premium engineering landing for a release workbench that places verification, policy, and decision context into one trustworthy review surface.",prompt:"Build a premium responsive landing page for a fictional developer tool called Relay, a release workbench that keeps code changes, policy decisions, and verification notes in one reviewable record. Use a modern-minimal Cobalt art direction: cool engineered near-white paper, electric cobalt as the primary signal, condensed system-sans display, neutral system body, local system-mono labels, hairline rhythm, and graphite verification discipline. Structure as a Workbench driven by real surfaces, not a generic hero and card stack: three navigable sections, a keyboard-first command palette (Cmd/Ctrl+K, Esc, arrows, jump by digits), a per-file evidence surface, timed check simulation, and a focused review footer. Never use remote links, fake chrome, invented testimonials, fabricated performance claims, gradients, or stock visuals. Keep all tokens in `tokens.css`, style every interaction state, support 320/375/414/768, and include reduced-motion behavior.",category:"Developer tooling",accent:"oklch(58% 0.2 256)",thumbnailUrl:"/showcase/relay-release-evidence.webp",thumbnailWidth:1440,thumbnailHeight:900,highlights:["Workbench-first layout built from the product surface itself","Keyboard-first command search and file-context switching","Verification pipeline section with staged states and elapsed-time feedback"],files:[{path:"App.tsx",content:String.raw`import { useEffect, useMemo, useRef, useState } from "react";
import "./tokens.css";
import "./styles.css";

const commands = [
  { label: "Open release evidence", group: "Navigate", target: "#evidence" },
  { label: "Review policy checks", group: "Navigate", target: "#checks" },
  { label: "Read verification notes", group: "Navigate", target: "#verification" },
];

const files = [
  {
    name: "checkout.ts",
    state: "Changed",
    detail: "Payment confirmation path",
    diff: [
      { type: "minus", code: "return redirect('/complete')" },
      { type: "plus", code: "return verifiedRedirect(order)" },
      { type: "plus", code: "audit.record('checkout_confirmed')" },
    ],
    note: "The confirmation route now records the same order state used by the receipt view.",
  },
  {
    name: "route.test.ts",
    state: "Passed",
    detail: "Regression coverage",
    diff: [
      { type: "plus", code: "expect(audit.entries).toContain('checkout_confirmed')" },
    ],
    note: "A new assertion locks the audit event to the confirmation path so a regression fails loudly.",
  },
  {
    name: "release.yml",
    state: "Changed",
    detail: "Deployment policy",
    diff: [
      { type: "minus", code: "require_review: false" },
      { type: "plus", code: "require_review: true" },
      { type: "plus", code: "evidence: checkout-audit" },
    ],
    note: "Payment-path changes now require attached evidence before the release can merge.",
  },
];

const checks = [
  { id: "01", label: "Type contract", successLabel: "PASS" },
  { id: "02", label: "Regression coverage", successLabel: "PASS" },
  { id: "03", label: "Rollback note", successLabel: "ATTACHED" },
];

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState(files[0].name);
  const [checkState, setCheckState] = useState("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [queuedMinutes, setQueuedMinutes] = useState(2);
  const searchRef = useRef<HTMLInputElement>(null);
  const runStartRef = useRef(0);

  const filtered = commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()));
  const activeFile = files.find((file) => file.name === selectedFileName) || files[0];
  const plusCount = useMemo(() => activeFile.diff.filter((line) => line.type === "plus").length, [activeFile]);
  const minusCount = useMemo(() => activeFile.diff.filter((line) => line.type === "minus").length, [activeFile]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const start = Date.now() - 132000;
    const tick = () => setQueuedMinutes(Math.max(2, Math.floor((Date.now() - start) / 60000)));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
      if (!paletteOpen) return;
      if (event.key === "Escape") setPaletteOpen(false);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((value) => Math.min(value + 1, Math.max(0, filtered.length - 1)));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((value) => Math.max(0, value - 1));
      }
      if (event.key === "Enter" && filtered[active]) {
        event.preventDefault();
        document.querySelector(filtered[active].target)?.scrollIntoView({ behavior: "smooth" });
        setPaletteOpen(false);
      }
      const asDigit = Number(event.key);
      if (asDigit >= 1 && asDigit <= filtered.length) {
        event.preventDefault();
        document.querySelector(filtered[asDigit - 1].target)?.scrollIntoView({ behavior: "smooth" });
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, filtered, paletteOpen]);

  useEffect(() => {
    if (paletteOpen) window.setTimeout(() => searchRef.current?.focus(), 0);
  }, [paletteOpen]);

  const runChecks = () => {
    setCheckState("loading");
    runStartRef.current = Date.now();
    window.setTimeout(() => {
      setElapsedMs(Date.now() - runStartRef.current);
      setCheckState("success");
    }, 900);
  };

  const openCommand = (index: number) => {
    const command = filtered[index];
    if (!command) return;
    document.querySelector(command.target)?.scrollIntoView({ behavior: "smooth" });
    setPaletteOpen(false);
  };

  return (
    <main className="relay-shell">
      <header className={scrolled ? "nav-bar is-scrolled" : "nav-bar"}>
        <a className="brand" href="#top">Relay<span>/</span></a>
        <nav className="nav-center" aria-label="Primary">
          <a href="#evidence">Evidence</a>
          <a href="#checks">Policy</a>
          <a href="#verification">Verification</a>
        </nav>
        <div className="nav-actions">
          <button className="command-trigger" type="button" onClick={() => setPaletteOpen(true)} aria-haspopup="dialog">
            <span>Search</span><kbd>⌘K</kbd>
          </button>
          <a className="button button--primary" href="#evidence">Open sample</a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="machine-label"><span /> RELEASE REVIEW WORKSPACE</p>
          <h1>Release evidence, in one view.</h1>
          <p>Relay gathers the code change, policy decision, and verification note into one reviewable record before a deployment moves forward.</p>
          <div className="hero-links">
            <a className="button button--primary" href="#evidence">Inspect the release</a>
            <a className="text-link" href="#verification">See the evidence model <span aria-hidden="true">→</span></a>
          </div>
        </div>

        <figure className="release-surface" id="evidence" aria-label="Relay release evidence workspace">
          <figcaption>
            <span>REL-204 / CHECKOUT-COPY</span>
            <span className="figcaption-time">Queued {queuedMinutes}m ago</span>
            <span className="status status--review">REVIEW READY</span>
          </figcaption>
          <div className="surface-grid">
            <aside className="file-list" aria-label="Changed files">
              <p>CHANGE SET</p>
              {files.map((file) => (
                <button key={file.name} type="button" className={selectedFileName === file.name ? "file-row is-active" : "file-row"} onClick={() => setSelectedFileName(file.name)}>
                  <span className="file-row-name">{file.name}</span>
                  <span className={file.state === "Passed" ? "state-pill state-pill--pass" : "state-pill state-pill--changed"}>{file.state}</span>
                </button>
              ))}
            </aside>
            <div className="diff-view">
              <div className="diff-head">
                <span>{activeFile.name}</span>
                <span className="diff-stat">
                  <em className="diff-plus">+{plusCount}</em>
                  <em className="diff-minus">−{minusCount}</em>
                </span>
              </div>
              {activeFile.diff.map((line, index) => (
                <div key={activeFile.name + index} className={line.type === "plus" ? "code-line code-line--plus" : "code-line code-line--minus"}>
                  <i>{line.type === "plus" ? "+" : "−"}</i><code>{line.code}</code>
                </div>
              ))}
              <div className="evidence-note"><span>WHY IT CHANGED</span><p>{activeFile.note}</p></div>
            </div>
            <aside className="review-panel">
              <p>DECISION</p>
              <div className="decision"><span className="decision-mark">✓</span><div><strong>Policy satisfied</strong><small>Required evidence is attached.</small></div></div>
              <dl><div><dt>Owner</dt><dd>Checkout team</dd></div><div><dt>Scope</dt><dd>Confirmation path</dd></div><div><dt>Rollback</dt><dd>Available</dd></div></dl>
            </aside>
          </div>
        </figure>
      </section>

      <section className="walkthrough" id="checks">
        <div className="section-intro reveal"><p className="machine-label">WORKBENCH / POLICY</p><h2>Read the decision, not a dashboard.</h2></div>
        <div className="walkthrough-grid">
          <article className="reveal"><span className="step-mark">01</span><span className="step-kicker">INPUT</span><h3>Change context</h3><p>Files, owners, and the release intent stay attached to the decision.</p></article>
          <article className="reveal"><span className="step-mark">02</span><span className="step-kicker">RULE</span><h3>Review policy</h3><p>Each requirement names the evidence it expects and the reason it exists.</p></article>
          <article className="reveal"><span className="step-mark">03</span><span className="step-kicker">OUTPUT</span><h3>Release record</h3><p>The final record shows what passed, what changed, and who can revisit it.</p></article>
        </div>
      </section>

      <section className="verification" id="verification">
        <div className="verification-copy reveal">
          <p className="machine-label">VERIFICATION / LIVE SAMPLE</p>
          <h2>Make the release explain itself.</h2>
          <p>Run the sample policy check to update this release record. The interaction is local to this concept preview.</p>
          <button className={"button button--verify is-" + checkState} type="button" onClick={runChecks} disabled={checkState === "loading"} aria-live="polite">
            {checkState === "loading" ? "Running checks…" : checkState === "success" ? "Checks complete" : "Run sample checks"}
          </button>
          <p className="verify-meta">
            {checkState === "success" ? "Ran in " + (elapsedMs / 1000).toFixed(1) + "s" : "Local check environment · resets on reload"}
          </p>
        </div>
        <div className="verification-log reveal" aria-label="Verification output">
          {checks.map((check, index) => (
            <div key={check.id} className="check-row" data-state={checkState} style={{ transitionDelay: (index * 110) + "ms" }}>
              <span>{check.id}</span>
              <p>{check.label}</p>
              <div className="check-track"><div className="check-fill" /></div>
              <strong>{checkState === "success" ? check.successLabel : "READY"}</strong>
            </div>
          ))}
        </div>
      </section>

      <aside className="sticky-cta">
        <p><span className="live-dot" aria-hidden="true" /><strong>Relay is a fictional product concept.</strong> Explore the interaction, then build your own version.</p>
        <a className="button button--primary" href="#top">Review from the top</a>
      </aside>

      <footer className="footer-line"><span>Relay / release evidence</span><span>Fictional concept · 2026</span><a href="#top">Back to top</a></footer>

      <div className={paletteOpen ? "command-menu is-open" : "command-menu"} aria-hidden={!paletteOpen}>
        <button className="command-backdrop" type="button" onClick={() => setPaletteOpen(false)} aria-label="Close command menu" />
        <section className="command-panel" role="dialog" aria-modal="true" aria-label="Search Relay">
          <div className="command-input"><span aria-hidden="true">⌕</span><input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} placeholder="Search this release…" aria-label="Search commands" /><kbd>ESC</kbd></div>
          <p className="command-group">NAVIGATE · {filtered.length}</p>
          <div className="command-results">
            {filtered.length > 0 ? filtered.map((command, index) => (
              <button key={command.label} type="button" className={index === active ? "command-item is-active" : "command-item"} onMouseEnter={() => setActive(index)} onClick={() => openCommand(index)}>
                <span className="command-item-index">{index + 1}</span>
                <span className="command-item-label">{command.label}</span>
                <small>{command.group}</small>
              </button>
            )) : <p className="command-empty">No matching release view.</p>}
          </div>
          <footer><span>↑↓ move</span><span>↵ open</span><span>1–9 jump</span><span>esc close</span></footer>
        </section>
      </div>
    </main>
  );
}`},{path:"tokens.css",content:String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Workbench · genre: modern-minimal · theme: Cobalt · tone: technical · anchor hue: electric cobalt · nav: N1b · footer: Ft2 · enrichment: E4 CSS product surfaces · contrast: pass (40–41) · slop: pass (42–49) · mobile: pass (34, 49–57) · enhancement-pass: same tokens, deeper elevation + motion system */
:root {
  --color-paper: oklch(98.5% 0.004 250);
  --color-paper-2: oklch(96% 0.008 250);
  --color-paper-3: oklch(92% 0.012 252);
  --color-ink: oklch(24% 0.02 258);
  --color-ink-2: oklch(34% 0.018 257);
  --color-ink-3: oklch(52% 0.02 254);
  --color-muted: oklch(43% 0.022 255);
  --color-rule: oklch(87% 0.012 252);
  --color-rule-2: oklch(72% 0.025 254);
  --color-accent: oklch(58% 0.2 256);
  --color-accent-strong: oklch(49% 0.215 256);
  --color-accent-soft: oklch(92% 0.04 255);
  --color-accent-ink: oklch(99% 0.002 250);
  --color-graphite: oklch(20% 0.016 260);
  --color-graphite-2: oklch(25% 0.02 260);
  --color-graphite-3: oklch(30% 0.022 260);
  --color-graphite-text: oklch(93% 0.012 250);
  --color-graphite-muted: oklch(78% 0.025 253);
  --color-success: oklch(65% 0.16 150);
  --color-success-soft: oklch(92% 0.05 150);
  --color-error: oklch(58% 0.19 25);
  --color-warning: oklch(74% 0.15 78);
  --color-backdrop: oklch(12% 0.02 260 / 0.58);
  --color-shadow: oklch(24% 0.02 258 / 0.12);
  --color-shadow-strong: oklch(22% 0.02 258 / 0.22);
  --color-focus: oklch(43% 0.22 256);
  --font-display: 'Arial Narrow', Arial, sans-serif;
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
  --text-lg: 1.2rem;
  --text-xl: 1.75rem;
  --text-display-s: clamp(2.8rem, 6vw, 5.6rem);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-short: 140ms;
  --dur-medium: 280ms;
  --dur-long: 600ms;
  --dur-xlong: 900ms;
  --rule-hair: 1px;
  --radius-sm: 0.375rem;
  --radius-md: 0.625rem;
  --radius-pill: 999px;
  --shadow-sm: 0 1px 2px var(--color-shadow);
  --shadow-md: 0 18px 42px var(--color-shadow);
  --shadow-lg: 0 30px 70px var(--color-shadow-strong), 0 2px 10px var(--color-shadow);
}`},{path:"styles.css",content:String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Workbench · genre: modern-minimal · theme: Cobalt · tone: technical · anchor hue: electric cobalt · nav: N1b · footer: Ft2 · enrichment: E4 CSS product surfaces · contrast: pass (40–41) · slop: pass (42–49) · mobile: pass (34, 49–57) · enhancement-pass: same tokens, deeper elevation + motion system */
* { box-sizing: border-box; }
html, body, #root { width: 100%; min-height: 100%; margin: 0; overflow-x: clip; }
html { scroll-behavior: smooth; }
body { background: var(--color-paper); color: var(--color-ink-2); font-family: var(--font-body); }
button, input, a { font: inherit; }
button, a { color: inherit; }
a { text-decoration: none; }
.relay-shell { min-height: 100%; background: var(--color-paper); }
.nav-bar { position: sticky; top: 0; z-index: 20; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; min-height: 68px; padding: 0 clamp(var(--space-md), 4vw, var(--space-2xl)); border-bottom: var(--rule-hair) solid var(--color-rule); background: color-mix(in oklch, var(--color-paper) 92%, transparent); backdrop-filter: blur(12px); transition: box-shadow var(--dur-medium) var(--ease-out), border-color var(--dur-medium) var(--ease-out); }
.nav-bar.is-scrolled { border-color: var(--color-rule-2); box-shadow: var(--shadow-sm); }
.brand { justify-self: start; color: var(--color-ink); font-family: var(--font-display); font-size: var(--text-lg); font-weight: 600; letter-spacing: -0.04em; white-space: nowrap; }
.brand span { color: var(--color-accent); }
.nav-center { display: flex; gap: var(--space-xs); }
.nav-center a { display: inline-flex; align-items: center; min-height: 44px; padding: var(--space-sm); color: var(--color-muted); font-size: var(--text-sm); line-height: 1; white-space: nowrap; position: relative; }
.nav-center a::after { content: ""; position: absolute; left: var(--space-sm); right: var(--space-sm); bottom: 12px; height: 1.5px; background: var(--color-accent); transform: scaleX(0); transform-origin: left; transition: transform var(--dur-medium) var(--ease-out); }
.nav-center a:hover { color: var(--color-ink); }
.nav-center a:hover::after { transform: scaleX(1); }
.nav-center a:active, .brand:active, .text-link:active, .footer-line a:active { transform: translateY(1px); }
.nav-actions { justify-self: end; display: flex; align-items: center; gap: var(--space-sm); }
.command-trigger { display: flex; align-items: center; gap: var(--space-lg); min-height: 40px; padding: var(--space-xs) var(--space-sm); border: var(--rule-hair) solid var(--color-rule); border-radius: var(--radius-sm); background: var(--color-paper-2); color: var(--color-muted); cursor: pointer; transition: border-color var(--dur-short) var(--ease-out), box-shadow var(--dur-short) var(--ease-out); }
kbd { font-family: var(--font-mono); font-size: var(--text-xs); }
.button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: var(--space-sm) var(--space-md); border: var(--rule-hair) solid var(--color-rule-2); border-radius: var(--radius-sm); cursor: pointer; font-weight: 500; white-space: nowrap; transition: transform var(--dur-short) var(--ease-out), background-color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out), color var(--dur-short) var(--ease-out), box-shadow var(--dur-short) var(--ease-out); }
.button--primary { border-color: var(--color-accent); background: var(--color-accent); color: var(--color-accent-ink); }
.button:hover, .command-trigger:hover { border-color: var(--color-accent); }
.button--primary:hover { background: var(--color-accent-strong); box-shadow: var(--shadow-sm); }
.button:active, .command-trigger:active { transform: translateY(1px); }
.button:focus-visible, .command-trigger:focus-visible, .nav-center a:focus-visible, .brand:focus-visible, .text-link:focus-visible, .file-row:focus-visible, .command-item:focus-visible, input:focus-visible, .footer-line a:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 3px; }
.button:disabled { cursor: wait; opacity: 0.7; }
.button.is-loading { cursor: progress; }
.button.is-error { border-color: var(--color-error); color: var(--color-error); }
.button.is-success { border-color: var(--color-success); background: var(--color-success); color: var(--color-graphite); }
.hero { display: grid; grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1.28fr); gap: clamp(var(--space-xl), 5vw, var(--space-4xl)); align-items: center; min-height: 780px; padding: var(--space-3xl) 0 var(--space-4xl) clamp(var(--space-md), 4vw, var(--space-2xl)); overflow-x: clip; }
.hero-copy { max-width: 520px; }
.machine-label { display: flex; align-items: center; gap: var(--space-xs); margin: 0; color: var(--color-muted); font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: 0.06em; }
.machine-label span { width: 8px; height: 8px; background: var(--color-accent); }
.hero h1 { min-width: 0; margin: var(--space-lg) 0; color: var(--color-ink); font-family: var(--font-display); font-size: var(--text-display-s); font-style: normal; font-weight: 500; letter-spacing: -0.055em; line-height: 0.98; overflow-wrap: anywhere; }
.hero-copy > p:not(.machine-label) { max-width: 50ch; margin: 0; font-size: var(--text-md); line-height: 1.75; }
.hero-links { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-lg); margin-top: var(--space-xl); }
.text-link { min-height: 44px; display: inline-flex; align-items: center; gap: var(--space-sm); color: var(--color-ink); text-decoration: underline; text-decoration-color: var(--color-rule-2); text-underline-offset: 2px; white-space: nowrap; }
.release-surface { width: calc(100% + 8vw); min-width: 0; margin: 0; border: var(--rule-hair) solid var(--color-rule-2); border-radius: var(--radius-md) 0 0 var(--radius-md); background: var(--color-paper); box-shadow: var(--shadow-md); overflow: hidden; transition: box-shadow var(--dur-long) var(--ease-out), transform var(--dur-long) var(--ease-spring); }
.release-surface:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
.release-surface > figcaption { display: flex; justify-content: space-between; align-items: center; gap: var(--space-md); padding: var(--space-md); border-bottom: var(--rule-hair) solid var(--color-rule); font-family: var(--font-mono); font-size: var(--text-xs); }
.figcaption-time { color: var(--color-muted); }
.status { padding: var(--space-2xs) var(--space-xs); border-radius: var(--radius-sm); }
.status--review { background: var(--color-accent-soft); color: var(--color-accent); }
.surface-grid { display: grid; grid-template-columns: minmax(150px, 0.62fr) minmax(280px, 1.35fr) minmax(180px, 0.8fr); min-height: 430px; }
.file-list, .review-panel { padding: var(--space-lg); background: var(--color-paper-2); }
.file-list { border-right: var(--rule-hair) solid var(--color-rule); }
.review-panel { border-left: var(--rule-hair) solid var(--color-rule); }
.file-list > p, .review-panel > p, .evidence-note > span { margin: 0 0 var(--space-md); color: var(--color-muted); font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.06em; }
.file-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); width: 100%; padding: var(--space-sm); border: 0; border-left: 2px solid transparent; background: transparent; text-align: left; cursor: pointer; transition: background-color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out); }
.file-row-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; font-family: var(--font-mono); font-size: var(--text-xs); }
.file-row:hover { background: var(--color-paper-3); }
.file-row:active { transform: translateY(1px); }
.file-row:disabled { cursor: not-allowed; opacity: 0.45; }
.file-row.is-active, .file-row.is-success { border-left-color: var(--color-accent); background: var(--color-accent-soft); }
.file-row.is-error { border-left-color: var(--color-error); }
.file-row.is-loading { cursor: progress; opacity: 0.72; }
.state-pill { flex: none; padding: 0.15rem var(--space-xs); border-radius: var(--radius-pill); font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.04em; }
.state-pill--changed { background: var(--color-accent-soft); color: var(--color-accent); }
.state-pill--pass { background: var(--color-success-soft); color: var(--color-success); }
.diff-view { min-width: 0; padding: var(--space-lg); overflow: hidden; }
.diff-head { display: flex; justify-content: space-between; align-items: center; gap: var(--space-sm); padding-bottom: var(--space-md); border-bottom: var(--rule-hair) solid var(--color-rule); font-family: var(--font-mono); font-size: var(--text-xs); }
.diff-stat { display: flex; gap: var(--space-sm); font-style: normal; }
.diff-plus { color: var(--color-success); }
.diff-minus { color: var(--color-error); }
.code-line { display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: var(--space-sm); margin-top: var(--space-lg); color: var(--color-error); font-family: var(--font-mono); font-size: var(--text-xs); }
.code-line--plus { color: var(--color-success); }
.code-line--minus { color: var(--color-error); }
.code-line code { min-width: 0; overflow-wrap: anywhere; }
.evidence-note { margin-top: var(--space-2xl); padding: var(--space-lg); border-left: 2px solid var(--color-accent); background: var(--color-paper-2); }
.evidence-note p { margin: 0; font-size: var(--text-sm); line-height: 1.65; }
.decision { display: flex; gap: var(--space-sm); align-items: flex-start; padding: var(--space-md); border: var(--rule-hair) solid var(--color-rule); background: var(--color-paper); }
.decision-mark { display: grid; place-items: center; width: 24px; height: 24px; background: var(--color-success-soft); color: var(--color-success); font-weight: 600; }
.decision strong, .decision small { display: block; }
.decision small { margin-top: var(--space-2xs); color: var(--color-muted); line-height: 1.4; }
.review-panel dl { display: grid; gap: var(--space-sm); margin: var(--space-xl) 0 0; }
.review-panel dl div { display: flex; justify-content: space-between; gap: var(--space-sm); padding-bottom: var(--space-sm); border-bottom: var(--rule-hair) solid var(--color-rule); font-size: var(--text-xs); }
.review-panel dt { color: var(--color-muted); }
.review-panel dd { margin: 0; text-align: right; }
.walkthrough { padding: var(--space-4xl) clamp(var(--space-md), 4vw, var(--space-2xl)); border-top: var(--rule-hair) solid var(--color-rule); }
.section-intro { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); max-width: 820px; }
.section-intro h2 { min-width: 0; max-width: 17ch; margin: 0; color: var(--color-ink); font-family: var(--font-display); font-size: clamp(2.2rem, 4.5vw, 4.8rem); font-style: normal; font-weight: 500; letter-spacing: -0.05em; line-height: 1; overflow-wrap: anywhere; }
.walkthrough-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: var(--space-3xl); border-top: var(--rule-hair) solid var(--color-rule); border-bottom: var(--rule-hair) solid var(--color-rule); }
.walkthrough article { min-width: 0; padding: var(--space-xl); transition: background-color var(--dur-medium) var(--ease-out); }
.walkthrough article:hover { background: var(--color-paper-2); }
.walkthrough article + article { border-left: var(--rule-hair) solid var(--color-rule); }
.step-mark { display: inline-grid; place-items: center; width: 30px; height: 30px; margin-bottom: var(--space-md); border: var(--rule-hair) solid var(--color-rule-2); border-radius: var(--radius-pill); color: var(--color-accent); font-family: var(--font-mono); font-size: 0.68rem; }
.step-kicker { display: block; margin: 0 0 var(--space-sm); color: var(--color-muted); font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.06em; }
.walkthrough h3 { margin: 0; color: var(--color-ink); font-family: var(--font-display); font-size: var(--text-lg); font-style: normal; font-weight: 500; }
.walkthrough article p:last-child { margin: var(--space-md) 0 0; color: var(--color-muted); font-size: var(--text-sm); line-height: 1.7; }
.verification { display: grid; grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr); gap: var(--space-3xl); padding: var(--space-4xl) clamp(var(--space-md), 4vw, var(--space-2xl)); background: var(--color-graphite); color: var(--color-graphite-text); }
.verification .machine-label { color: var(--color-graphite-muted); }
.verification h2 { min-width: 0; margin: var(--space-lg) 0; font-family: var(--font-display); font-size: clamp(2.2rem, 5vw, 5rem); font-style: normal; font-weight: 500; letter-spacing: -0.05em; line-height: 0.98; overflow-wrap: anywhere; }
.verification-copy > p:not(.machine-label):not(.verify-meta) { max-width: 48ch; color: var(--color-graphite-muted); line-height: 1.7; }
.button--verify { margin-top: var(--space-lg); border-color: var(--color-accent); background: transparent; color: var(--color-graphite-text); }
.button--verify:hover { background: var(--color-accent); color: var(--color-accent-ink); }
.button--verify:focus-visible { outline-color: var(--color-graphite-text); }
.button--verify.is-success { background: var(--color-success); border-color: var(--color-success); color: var(--color-graphite); }
.verify-meta { margin: var(--space-sm) 0 0; color: var(--color-graphite-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
.verification-log { border-top: var(--rule-hair) solid var(--color-graphite-muted); }
.check-row { display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(72px, 140px) auto; gap: var(--space-lg); align-items: center; padding: var(--space-lg) 0; border-bottom: var(--rule-hair) solid var(--color-graphite-2); font-family: var(--font-mono); transition: transform var(--dur-medium) var(--ease-out); }
.check-row span:first-child { color: var(--color-graphite-muted); }
.check-row p { margin: 0; }
.check-row strong { color: var(--color-graphite-muted); font-size: var(--text-xs); transition: color var(--dur-short) var(--ease-out); }
.check-row[data-state='success'] strong { color: var(--color-success); }
.check-track { position: relative; height: 3px; border-radius: var(--radius-pill); background: var(--color-graphite-3); overflow: hidden; }
.check-fill { position: absolute; inset: 0; width: 0%; background: var(--color-accent); transition: width var(--dur-xlong) var(--ease-out), background-color var(--dur-short) var(--ease-out); }
.check-row[data-state='loading'] .check-fill { width: 65%; }
.check-row[data-state='success'] .check-fill { width: 100%; background: var(--color-success); }
.sticky-cta { position: sticky; bottom: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; gap: var(--space-lg); padding: var(--space-md) clamp(var(--space-md), 4vw, var(--space-2xl)); border-top: var(--rule-hair) solid var(--color-rule-2); background: color-mix(in oklch, var(--color-paper) 94%, transparent); backdrop-filter: blur(14px); }
.sticky-cta p { display: flex; align-items: center; gap: var(--space-sm); margin: 0; font-size: var(--text-sm); }
.live-dot { flex: none; width: 7px; height: 7px; border-radius: var(--radius-pill); background: var(--color-success); }
.footer-line { display: flex; justify-content: space-between; align-items: center; gap: var(--space-lg); padding: var(--space-xl) clamp(var(--space-md), 4vw, var(--space-2xl)); border-top: var(--rule-hair) solid var(--color-rule); font-family: var(--font-mono); font-size: var(--text-xs); }
.footer-line a { text-decoration: underline; text-underline-offset: 2px; white-space: nowrap; }
.reveal { opacity: 0; transform: translateY(16px); transition: opacity var(--dur-long) var(--ease-out), transform var(--dur-long) var(--ease-out); }
.reveal.is-visible { opacity: 1; transform: none; }
.command-menu { position: fixed; inset: 0; z-index: 50; visibility: hidden; opacity: 0; transition: opacity var(--dur-short) var(--ease-out), visibility var(--dur-short) var(--ease-out); }
.command-menu.is-open { visibility: visible; opacity: 1; }
.command-backdrop { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: var(--color-backdrop); cursor: default; }
.command-backdrop:focus-visible { outline: 3px solid var(--color-focus); outline-offset: -6px; }
.command-backdrop:active { opacity: 0.98; }
.command-backdrop:disabled { cursor: not-allowed; opacity: 0.55; }
.command-panel { position: absolute; top: 12vh; left: 50%; width: min(580px, calc(100vw - var(--space-xl))); transform: translate(-50%, -8px); border: var(--rule-hair) solid var(--color-rule-2); border-radius: var(--radius-md); background: var(--color-paper); box-shadow: var(--shadow-lg); overflow: hidden; transition: transform var(--dur-medium) var(--ease-spring); }
.command-menu.is-open .command-panel { transform: translate(-50%, 0); }
.command-input { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: var(--space-sm); align-items: center; padding: var(--space-md); border-bottom: var(--rule-hair) solid var(--color-rule); }
.command-input input { min-width: 0; min-height: 44px; border: 0; background: transparent; color: var(--color-ink); outline: 0; }
.command-input input:hover { background: var(--color-paper-2); }
.command-input input:disabled { opacity: 0.5; }
.command-input input[aria-invalid='true'] { color: var(--color-error); }
.command-input input[data-state='success'] { color: var(--color-success); }
.command-group { margin: 0; padding: var(--space-md) var(--space-md) var(--space-xs); color: var(--color-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
.command-results { padding: 0 var(--space-xs) var(--space-xs); }
.command-item { display: flex; align-items: center; gap: var(--space-sm); width: 100%; min-height: 46px; padding: var(--space-sm); border: 0; border-radius: var(--radius-sm); background: transparent; cursor: pointer; text-align: left; transition: background-color var(--dur-short) var(--ease-out); }
.command-item-index { flex: none; display: grid; place-items: center; width: 20px; height: 20px; border: var(--rule-hair) solid var(--color-rule-2); border-radius: var(--radius-sm); color: var(--color-muted); font-family: var(--font-mono); font-size: 0.62rem; }
.command-item-label { flex: 1; min-width: 0; }
.command-item:hover, .command-item.is-active { background: var(--color-accent-soft); }
.command-item:hover .command-item-index, .command-item.is-active .command-item-index { border-color: var(--color-accent); color: var(--color-accent); }
.command-item:active { transform: translateY(1px); }
.command-item:disabled { cursor: not-allowed; opacity: 0.45; }
.command-item.is-loading { cursor: progress; }
.command-item.is-error { color: var(--color-error); }
.command-item.is-success { color: var(--color-success); }
.command-item small { flex: none; color: var(--color-muted); }
.command-empty { padding: var(--space-lg); color: var(--color-muted); text-align: center; }
.command-panel > footer { display: flex; flex-wrap: wrap; gap: var(--space-lg); padding: var(--space-sm) var(--space-md); border-top: var(--rule-hair) solid var(--color-rule); color: var(--color-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
@media (max-width: 900px) {
  .nav-bar { grid-template-columns: minmax(0, 1fr) auto; }
  .nav-center { display: none; }
  .hero { grid-template-columns: minmax(0, 1fr); min-height: auto; padding: var(--space-4xl) clamp(var(--space-md), 4vw, var(--space-2xl)); }
  .release-surface { width: 100%; border-radius: var(--radius-md); }
  .surface-grid { grid-template-columns: minmax(140px, 0.5fr) minmax(0, 1.5fr); }
  .review-panel { grid-column: 1 / -1; border-top: var(--rule-hair) solid var(--color-rule); border-left: 0; }
  .review-panel dl { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .verification { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 700px) {
  .command-trigger span { display: none; }
  .section-intro, .walkthrough-grid { grid-template-columns: minmax(0, 1fr); }
  .walkthrough article + article { border-top: var(--rule-hair) solid var(--color-rule); border-left: 0; }
  .surface-grid { grid-template-columns: minmax(0, 1fr); }
  .file-list { border-right: 0; border-bottom: var(--rule-hair) solid var(--color-rule); }
  .file-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .file-list > p { grid-column: 1 / -1; }
  .file-row { flex-direction: column; align-items: flex-start; gap: var(--space-2xs); }
  .review-panel dl { grid-template-columns: minmax(0, 1fr); }
  .sticky-cta { align-items: flex-start; flex-direction: column; }
  .footer-line { align-items: flex-start; flex-direction: column; }
}
@media (max-width: 480px) {
  .check-track { display: none; }
  .check-row { grid-template-columns: auto minmax(0, 1fr) auto; }
}
@media (max-width: 420px) {
  .nav-actions { gap: var(--space-xs); }
  .nav-actions .button { padding-inline: var(--space-sm); font-size: var(--text-xs); }
  .hero { padding-top: var(--space-3xl); }
  .hero h1 { font-size: clamp(2.6rem, 14vw, 4rem); }
  .hero-links { align-items: flex-start; flex-direction: column; }
  .file-list { grid-template-columns: minmax(0, 1fr); }
  .file-list > p { grid-column: auto; }
  .release-surface > figcaption { align-items: flex-start; flex-direction: column; }
  .command-panel { top: 0; width: 100%; height: 100dvh; border: 0; border-radius: 0; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; transition-delay: 0ms !important; }
  .reveal { opacity: 1; transform: none; }
}`}]},{id:"showcase-landing-small-hours",slug:"small-hours-table",title:"Small Hours — Community Table",description:"A premium hospitality concept with a letter-shaped story, tactile community notices, and a lightweight invitation flow designed for recurring dinner events.",prompt:"Create a premium responsive landing page for a fictional neighborhood supper club called Small Hours. Use a warm, playful letter-form direction: creamy paper backgrounds, pear-yellow action, sky-cyan secondary surfaces, a coral contrast accent, rounded system typography, and local mono labelling. Structure the page as an unfolding letter narrative instead of a generic conversion funnel: a dismissible announcement bar with retract-on-scroll behavior, a long-form kitchen note without first-fold pressure, three noticeboard cards, and an invitation form with validation, loading, and success states. Keep the page human-first: no stock photography, no fake proof, no remote links, no fabricated metrics, and no fake browser chrome. Include all tokens in `tokens.css`, complete interaction-state styling, responsive behavior at 320/375/414/768, and reduced-motion handling.",category:"Hospitality",accent:"oklch(86% 0.18 95)",thumbnailUrl:"/showcase/small-hours-table.webp",thumbnailWidth:1440,thumbnailHeight:900,highlights:["Letter-first narrative flow with a clear community-first tone","Noticeboard cards and tactile states that feel handcrafted","Invitation form with transparent validation and motion-light feedback"],files:[{path:"App.tsx",content:String.raw`import { FormEvent, useEffect, useState } from "react";
import "./tokens.css";
import "./styles.css";

const notes = [
  { day: "THURSDAY", title: "Long-table supper", copy: "One shared menu, passed by hand, with a seat kept open for somebody new.", tone: "pear" },
  { day: "SATURDAY", title: "Market breakfast", copy: "Coffee, warm bread, and whatever the growers carried in that morning.", tone: "cyan" },
  { day: "SUNDAY", title: "Leftover lunch", copy: "A small, unplanned table built from the good parts still in the fridge.", tone: "coral" },
];

export default function App() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [compact, setCompact] = useState(false);
  const [status, setStatus] = useState("idle");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let previous = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      setCompact(current > 48 && current > previous);
      previous = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    window.setTimeout(() => setStatus("success"), 850);
  };

  return (
    <main className={bannerVisible ? "site" : "site banner-dismissed"}>
      <header className={compact && bannerVisible ? "nav is-compact" : "nav"}>
        {bannerVisible && (
          <div className="announcement">
            <p>The autumn table list is open. <a href="#join">Add your name <span aria-hidden="true">→</span></a></p>
            <button type="button" onClick={() => setBannerVisible(false)} aria-label="Dismiss announcement">×</button>
          </div>
        )}
        <div className="nav-row">
          <a className="brand" href="#letter">Small Hours <span aria-hidden="true">●</span></a>
          <nav aria-label="Primary"><a href="#notes">Table notes</a><a href="#join">Join the list</a></nav>
        </div>
      </header>

      <section className="letter" id="letter" aria-labelledby="letter-title">
        <div className="postmark" aria-hidden="true">SH<br />26</div>
        <p className="date-line">A NOTE FROM THE KITCHEN · EARLY AUTUMN</p>
        <h1 id="letter-title">Hello, neighbor.</h1>
        <div className="prose">
          <p>Small Hours is a dinner that happens once in a while, in a borrowed room, around one long table.</p>
          <p>There is no private corner and no perfect place setting. The bread arrives whole. The plates never quite match. You may sit beside an old friend or somebody you have not met yet.</p>
          <p>We made it for the part of the week that deserves more time than it usually gets.</p>
        </div>
        <div className="plate-character" role="img" aria-label="A smiling plate carrying a pea">
          <span className="plate-face" aria-hidden="true" />
          <span className="pea" aria-hidden="true" />
        </div>
      </section>

      <div className="letter-break" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span></div>

      <section className="notes" id="notes" aria-labelledby="notes-title">
        <div className="notes-heading"><p>FROM THE NOTICEBOARD</p><h2 id="notes-title">Three ways we gather.</h2></div>
        <div className="note-stack">
          {notes.map((note, index) => (
            <article className={'note note--' + note.tone} key={note.title}>
              <span className="note-number">0{index + 1}</span>
              <div><p>{note.day}</p><h3>{note.title}</h3><p className="note-copy">{note.copy}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="join" id="join" aria-labelledby="join-title">
        <div className="join-copy"><p>THE TABLE LIST</p><h2 id="join-title">Come when the room feels right.</h2><p>Leave an email and we will send the next invitation. No weekly campaign, no manufactured urgency.</p></div>
        <form className={'join-form is-' + status} onSubmit={submit} noValidate>
          <label htmlFor="email">Your email address</label>
          <div className="form-row">
            <input id="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); if (status !== "idle") setStatus("idle"); }} placeholder="you@example.com" aria-invalid={status === "error"} disabled={status === "loading" || status === "success"} data-state={status} />
            <button className="button" type="submit" disabled={status === "loading" || status === "success"}>
              {status === "loading" ? "Adding…" : status === "success" ? "You’re on the list" : "Add my name"}
            </button>
          </div>
          <p className="form-message" aria-live="polite">{status === "error" ? "Add a complete email address and try again." : status === "success" ? "Thank you. The next note will come from the kitchen." : "One note per table. Leave whenever you like."}</p>
        </form>
      </section>

      <footer className="letter-close">
        <p className="signoff">See you after sunset,<br /><strong>Small Hours</strong></p>
        <p className="postscript">P.S. This is a fictional dining-club concept made to demonstrate a letter-shaped landing page.</p>
        <div className="footer-meta"><span>Kitchen notes · 2026</span><a href="#join">Join the list</a></div>
      </footer>
    </main>
  );
}`},{path:"tokens.css",content:String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Letter · genre: playful · theme: Hum · tone: warm playful · anchor hue: pear multi-accent · nav: N12 · footer: Ft6 · enrichment: E6 CSS character · contrast: pass (40–41) · slop: pass (42–49) · mobile: pass (34, 49–57) */
:root {
  --color-paper: oklch(97% 0.012 95);
  --color-paper-2: oklch(94% 0.016 95);
  --color-paper-3: oklch(91% 0.02 95);
  --color-ink: oklch(20% 0.012 250);
  --color-ink-2: oklch(36% 0.015 250);
  --color-muted: oklch(42% 0.025 250);
  --color-rule: oklch(78% 0.025 95);
  --color-accent: oklch(86% 0.18 95);
  --color-accent-ink: oklch(20% 0.012 250);
  --color-accent-deep: oklch(64% 0.18 95);
  --color-accent-cast: oklch(76% 0.2 95 / 0.45);
  --color-accent-2: oklch(66% 0.18 235);
  --color-accent-2-deep: oklch(46% 0.16 238);
  --color-accent-2-soft: oklch(91% 0.055 235);
  --color-accent-3: oklch(68% 0.24 18);
  --color-accent-3-deep: oklch(48% 0.19 18);
  --color-accent-3-soft: oklch(91% 0.045 18);
  --color-mint: oklch(80% 0.16 150);
  --color-mint-deep: oklch(48% 0.12 150);
  --color-lavender: oklch(74% 0.16 305);
  --color-white: oklch(99% 0.004 95);
  --color-focus: oklch(40% 0.2 265);
  --color-error: oklch(58% 0.2 24);
  --color-success: oklch(50% 0.13 150);
  --color-shadow: oklch(20% 0.012 250 / 0.14);
  --font-display: 'Trebuchet MS', Arial, sans-serif;
  --font-body: 'Trebuchet MS', Arial, sans-serif;
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
  --text-display-s: clamp(2.8rem, 8vw, 6.8rem);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-short: 140ms;
  --dur-medium: 300ms;
  --dur-long: 620ms;
  --rule-hair: 1px;
  --radius-sm: 0.75rem;
  --radius-md: 1.25rem;
  --radius-lg: 2rem;
  --radius-pill: 999px;
}`},{path:"styles.css",content:String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Letter · genre: playful · theme: Hum · tone: warm playful · anchor hue: pear multi-accent · nav: N12 · footer: Ft6 · enrichment: E6 CSS character · contrast: pass (40–41) · slop: pass (42–49) · mobile: pass (34, 49–57) */
* { box-sizing: border-box; }
html, body, #root { width: 100%; min-height: 100%; margin: 0; overflow-x: clip; }
html { scroll-behavior: smooth; }
body { background: var(--color-paper); color: var(--color-ink); font-family: var(--font-body); }
button, input, a { font: inherit; }
button, a { color: inherit; }
a { text-underline-offset: 4px; }
.site { min-height: 100%; padding-top: 96px; background: var(--color-paper); }
.site.banner-dismissed { padding-top: 64px; }
.nav { position: fixed; inset: 0 0 auto; z-index: 20; transform: translateY(0); transition: transform var(--dur-medium) var(--ease-out); }
.nav.is-compact { transform: translateY(-32px); }
.announcement { display: flex; align-items: center; justify-content: center; min-height: 32px; padding: 0 clamp(var(--space-md), 4vw, var(--space-2xl)); background: var(--color-accent); color: var(--color-accent-ink); }
.announcement p { margin: 0 auto; padding-left: 36px; font-size: var(--text-sm); font-weight: 500; text-align: center; }
.announcement a { white-space: nowrap; }
.announcement button { display: grid; place-items: center; width: 36px; height: 36px; border: 0; border-radius: 50%; background: transparent; cursor: pointer; font-size: var(--text-lg); transition: transform var(--dur-short) var(--ease-out), background-color var(--dur-short) var(--ease-out); }
.announcement button:hover { transform: rotate(8deg); }
.announcement button:active { transform: rotate(8deg) translateY(2px); }
.announcement button:disabled { cursor: not-allowed; opacity: 0.45; }
.announcement button.is-loading { cursor: progress; }
.announcement button.is-error { color: var(--color-error); }
.announcement button.is-success { color: var(--color-success); }
.announcement button:focus-visible, .brand:focus-visible, nav a:focus-visible, .button:focus-visible, .footer-meta a:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 3px; }
.join-form input:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 1px; }
.nav-row { display: flex; align-items: center; justify-content: space-between; min-height: 64px; padding: 0 clamp(var(--space-md), 4vw, var(--space-2xl)); border-bottom: 2px solid var(--color-ink); background: var(--color-paper); }
.brand { font-weight: 700; letter-spacing: -0.04em; text-decoration: none; white-space: nowrap; }
.brand span { color: var(--color-accent-3); }
.nav-row nav { display: flex; gap: var(--space-lg); }
.nav-row nav a { min-height: 44px; display: inline-flex; align-items: center; font-size: var(--text-sm); font-weight: 600; white-space: nowrap; }
.nav-row nav a:hover { color: var(--color-accent-2-deep); }
.brand:active, .nav-row nav a:active, .footer-meta a:active { transform: translateY(1px); }
.letter { position: relative; width: min(880px, calc(100% - 2rem)); margin: 0 auto; padding: var(--space-3xl) clamp(var(--space-lg), 7vw, var(--space-4xl)) var(--space-4xl); }
.date-line, .notes-heading > p, .join-copy > p { margin: 0; font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: 0.07em; }
.letter h1 { min-width: 0; max-width: 8ch; margin: var(--space-xl) 0; font-family: var(--font-display); font-size: var(--text-display-s); font-style: normal; font-weight: 600; letter-spacing: -0.055em; line-height: 0.95; overflow-wrap: anywhere; }
.prose { max-width: 54ch; }
.prose p { margin: 0 0 var(--space-lg); color: var(--color-ink-2); font-size: clamp(var(--text-md), 2.1vw, var(--text-lg)); line-height: 1.75; }
.postmark { position: absolute; top: var(--space-3xl); right: var(--space-xl); display: grid; place-items: center; width: 72px; aspect-ratio: 1; border: 2px solid var(--color-accent-3); border-radius: 50%; color: var(--color-accent-3-deep); font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600; line-height: 1.35; text-align: center; transform: rotate(7deg); }
.plate-character { position: absolute; right: 8%; bottom: 8%; width: 132px; aspect-ratio: 1; border: 10px solid var(--color-white); border-radius: 50%; background: var(--color-accent-2-soft); box-shadow: 0 8px 0 var(--color-accent-2-deep), 0 16px 28px var(--color-shadow); transform: rotate(-7deg); }
.plate-face::before, .plate-face::after { position: absolute; top: 42%; width: 8px; height: 12px; content: ''; border-radius: var(--radius-pill); background: var(--color-ink); animation: blink 4s var(--ease-in-out) infinite; }
.plate-face::before { left: 34%; }
.plate-face::after { right: 34%; }
.plate-face { position: absolute; inset: 0; }
.plate-face span { display: none; }
.plate-character::before { position: absolute; left: 50%; bottom: 29%; width: 32px; height: 14px; content: ''; border-bottom: 3px solid var(--color-ink); border-radius: 50%; transform: translateX(-50%); }
.plate-character::after { position: absolute; right: -19px; top: 42%; width: 34px; height: 9px; content: ''; border-radius: var(--radius-pill); background: var(--color-accent-3); transform-origin: left center; animation: wave 2.8s var(--ease-in-out) infinite; }
.pea { position: absolute; left: 18%; top: 19%; width: 22px; aspect-ratio: 1; border-radius: 50%; background: var(--color-mint); box-shadow: inset -4px -5px 0 var(--color-mint-deep); }
@keyframes blink { 0%, 45%, 49%, 100% { transform: scaleY(1); } 47% { transform: scaleY(0.12); } }
@keyframes wave { 0%, 100% { transform: rotate(-12deg); } 50% { transform: rotate(18deg); } }
.letter-break { display: flex; justify-content: center; gap: var(--space-xl); padding: var(--space-xl); color: var(--color-accent-3); }
.letter-break span:nth-child(2) { color: var(--color-accent-2); transform: translateY(4px); }
.letter-break span:nth-child(3) { color: var(--color-accent); }
.notes { padding: var(--space-4xl) clamp(var(--space-md), 4vw, var(--space-2xl)); background: var(--color-paper-2); }
.notes-heading { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); max-width: 920px; margin: 0 auto; }
.notes-heading h2, .join h2 { min-width: 0; margin: 0; font-family: var(--font-display); font-size: clamp(2.5rem, 6vw, 6rem); font-style: normal; font-weight: 600; letter-spacing: -0.055em; line-height: 0.98; overflow-wrap: anywhere; }
.note-stack { display: grid; gap: var(--space-lg); max-width: 920px; margin: var(--space-3xl) auto 0; }
.note { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--space-xl); padding: var(--space-xl); border: 2px solid var(--color-ink); border-radius: var(--radius-lg); box-shadow: 0 6px 0 var(--color-ink); transition: transform var(--dur-medium) var(--ease-out), box-shadow var(--dur-medium) var(--ease-out), background-color var(--dur-medium) var(--ease-out); }
.note:nth-child(2) { transform: rotate(1deg); }
.note:nth-child(3) { transform: rotate(-1deg); }
.note:hover { transform: translateY(-4px) rotate(0); }
.note--pear, .note--cyan, .note--coral { background: var(--color-paper); }
.note--pear { border-color: var(--color-accent-deep); }
.note--cyan { border-color: var(--color-accent-2-deep); }
.note--coral { border-color: var(--color-accent-3-deep); }
.note-number { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; font-family: var(--font-mono); font-size: var(--text-sm); }
.note--pear .note-number { background: var(--color-accent); color: var(--color-accent-ink); }
.note--cyan .note-number { background: var(--color-accent-2); color: var(--color-ink); }
.note--coral .note-number { background: var(--color-accent-3); color: var(--color-ink); }
.note p, .note h3 { margin: 0; }
.note div > p:first-child { font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: 0.07em; }
.note h3 { min-width: 0; margin-top: var(--space-xs); font-size: clamp(1.5rem, 3vw, 2.4rem); font-style: normal; line-height: 1.05; overflow-wrap: anywhere; }
.note-copy { max-width: 48ch; margin-top: var(--space-md) !important; color: var(--color-ink-2); line-height: 1.65; }
.join { display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); gap: var(--space-3xl); padding: var(--space-4xl) clamp(var(--space-md), 4vw, var(--space-2xl)); }
.join-copy > p:last-child { max-width: 48ch; margin: var(--space-lg) 0 0; color: var(--color-ink-2); line-height: 1.7; }
.join-form { align-self: end; padding: var(--space-xl); border: 2px solid var(--color-ink); border-radius: var(--radius-lg); background: var(--color-white); box-shadow: 0 8px 0 var(--color-accent-2); }
.join-form label { display: block; margin-bottom: var(--space-sm); font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: 0.05em; }
.form-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-sm); }
.join-form input { min-width: 0; min-height: 50px; padding: var(--space-sm) var(--space-md); border: var(--rule-hair) solid var(--color-ink); border-radius: var(--radius-pill); outline: 2px solid transparent; outline-offset: 1px; background: var(--color-paper); color: var(--color-ink); transition: background-color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out); }
.join-form input:hover { background: var(--color-paper-2); }
.join-form input:disabled { cursor: not-allowed; opacity: 0.62; }
.join-form input[data-state='loading'] { cursor: progress; }
.join-form input[aria-invalid='true'] { border-color: var(--color-error); color: var(--color-error); }
.join-form input[data-state='success'] { border-color: var(--color-success); color: var(--color-success); }
.button { min-height: 50px; padding: var(--space-sm) var(--space-lg); border: 0; border-radius: var(--radius-pill); background: var(--color-accent); color: var(--color-accent-ink); box-shadow: 0 4px 0 var(--color-accent-deep), 0 6px 12px var(--color-accent-cast); cursor: pointer; font-weight: 600; white-space: nowrap; transform: translateY(0); transition: transform var(--dur-short) var(--ease-out), box-shadow var(--dur-short) var(--ease-out), background-color var(--dur-short) var(--ease-out); }
.button:hover { transform: translateY(-2px); }
.button:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--color-accent-deep), 0 2px 6px var(--color-accent-cast); }
.button:disabled { cursor: not-allowed; opacity: 0.62; transform: none; }
.join-form.is-loading .button { cursor: progress; }
.join-form.is-error .button { background: var(--color-accent-3); box-shadow: 0 4px 0 var(--color-accent-3-deep), 0 6px 12px var(--color-shadow); }
.join-form.is-success { border-color: var(--color-success); box-shadow: 0 8px 0 var(--color-mint); }
.join-form.is-success .button { background: var(--color-mint); box-shadow: 0 4px 0 var(--color-mint-deep), 0 6px 12px var(--color-shadow); }
.form-message { min-height: 1.4em; margin: var(--space-md) 0 0; color: var(--color-muted); font-size: var(--text-sm); }
.join-form.is-error .form-message { color: var(--color-error); }
.join-form.is-success .form-message { color: var(--color-success); }
.letter-close { max-width: 860px; margin: 0 auto; padding: var(--space-4xl) clamp(var(--space-lg), 7vw, var(--space-4xl)); }
.signoff { margin: 0; font-size: clamp(1.8rem, 4vw, 3rem); line-height: 1.45; }
.signoff strong { color: var(--color-accent-2-deep); }
.postscript { max-width: 58ch; margin: var(--space-xl) 0; color: var(--color-muted); line-height: 1.7; }
.footer-meta { display: flex; justify-content: space-between; align-items: center; gap: var(--space-lg); padding-top: var(--space-lg); border-top: 2px solid var(--color-ink); font-family: var(--font-mono); font-size: var(--text-xs); }
.footer-meta a { white-space: nowrap; }
@media (max-width: 760px) {
  .notes-heading, .join { grid-template-columns: minmax(0, 1fr); }
  .letter { padding-top: var(--space-3xl); }
  .plate-character { position: relative; right: auto; bottom: auto; margin: var(--space-2xl) 0 0 auto; }
  .note { grid-template-columns: minmax(0, 1fr); gap: var(--space-sm); }
  .form-row { grid-template-columns: minmax(0, 1fr); }
  .button { width: 100%; }
}
@media (max-width: 520px) {
  .site { padding-top: 94px; }
  .nav.is-compact { transform: translateY(-30px); }
  .announcement { min-height: 30px; }
  .announcement p { max-width: calc(100% - 34px); padding-left: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .announcement button { width: 34px; height: 34px; }
  .nav-row { min-height: 64px; }
  .nav-row nav a:first-child { display: none; }
  .letter h1 { font-size: clamp(2.8rem, 17vw, 4.6rem); }
  .postmark { position: static; margin: 0 0 var(--space-xl) auto; }
  .note { padding: var(--space-lg); }
  .footer-meta { align-items: flex-start; flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; }
}`}]}];e.s(["getShowcaseLanding",0,function(e){return a.find(a=>a.slug===e)??null},"getShowcaseLandingSummaries",0,function(e=""){let r=e.trim().toLowerCase();return a.filter(e=>!r||[e.title,e.description,e.category].some(e=>e.toLowerCase().includes(r))).map(({id:e,slug:a,title:r,description:t,category:o,accent:i,thumbnailUrl:n,thumbnailWidth:s,thumbnailHeight:l})=>({id:e,slug:a,title:r,description:t,category:o,accent:i,thumbnailUrl:n,thumbnailWidth:s,thumbnailHeight:l}))}],982283)}];

//# sourceMappingURL=features_gallery_showcase-landings_index_ts_1cov58a._.js.map