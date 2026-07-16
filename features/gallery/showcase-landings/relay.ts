import type { ShowcaseLanding } from "@/features/gallery/showcase-landings/types";

const tokens = String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
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
}`;

const app = String.raw`import { useEffect, useMemo, useRef, useState } from "react";
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
}`;

const styles = String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
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
}`;

export const relay: ShowcaseLanding = {
  id: "showcase-landing-relay",
  slug: "relay-release-evidence",
  title: "Relay",
  description:
    "A precise release-evidence workspace that leads with a working product surface, live policy context, and an accessible command menu.",
  prompt:
    "Build a premium responsive landing page for a fictional developer tool called Relay, a release-evidence workspace that keeps code changes, policy decisions, and verification notes in one reviewable record. Use a modern-minimal Cobalt art direction: cool engineered near-white paper, electric cobalt as the only signal accent, a condensed system-sans display, neutral system body, local system-mono labels, ruler-drawn hairlines, tight radii, and one graphite verification band. Structure the page as a Workbench guided by real product surfaces—not a hero plus three feature cards. Include a dense three-section navigation, a fully functional accessible command search with Cmd/Ctrl+K, Esc, arrow navigation, focus management, and filtering; an interactive changed-file surface where selecting a file swaps its diff and evidence note; a three-stage evidence walkthrough; a sample check action with staggered loading and success states and a real elapsed-time readout; a sticky CTA; and a single-line footer. Do not use fake browser chrome, gradients, stock imagery, fabricated metrics, logos, testimonials, external links, or remote font imports. Put all OKLCH design tokens and font families in tokens.css, style all eight interaction states, support 320/375/414/768 widths with overflow-x clip, and respect reduced motion.",
  category: "Developer tool",
  accent: "oklch(58% 0.2 256)",
  thumbnailUrl: "/showcase/relay-release-evidence.webp",
  highlights: [
    "Workbench structure led by an interactive, per-file release surface",
    "Keyboard-accessible command search with digit-jump shortcuts and live state",
    "Cobalt design system with layered elevation and a single graphite verification beat",
  ],
  files: [
    { path: "App.tsx", content: app },
    { path: "tokens.css", content: tokens },
    { path: "styles.css", content: styles },
  ],
};