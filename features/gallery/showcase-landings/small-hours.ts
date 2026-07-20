import type { ShowcaseLanding } from "@/features/gallery/showcase-landings/types";

const tokens = String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
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
}`;

const app = String.raw`import { FormEvent, useEffect, useState } from "react";
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
}`;

const styles = String.raw`/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
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
}`;

export const smallHours: ShowcaseLanding = {
  id: "showcase-landing-small-hours",
  slug: "small-hours-table",
  title: "Small Hours — Community Table",
  description:
    "A premium hospitality concept with a letter-shaped story, tactile community notices, and a lightweight invitation flow designed for recurring dinner events.",
  prompt:
    "Create a premium responsive landing page for a fictional neighborhood supper club called Small Hours. Use a warm, playful letter-form direction: creamy paper backgrounds, pear-yellow action, sky-cyan secondary surfaces, a coral contrast accent, rounded system typography, and local mono labelling. Structure the page as an unfolding letter narrative instead of a generic conversion funnel: a dismissible announcement bar with retract-on-scroll behavior, a long-form kitchen note without first-fold pressure, three noticeboard cards, and an invitation form with validation, loading, and success states. Keep the page human-first: no stock photography, no fake proof, no remote links, no fabricated metrics, and no fake browser chrome. Include all tokens in `tokens.css`, complete interaction-state styling, responsive behavior at 320/375/414/768, and reduced-motion handling.",
  category: "Hospitality",
  accent: "oklch(86% 0.18 95)",
  thumbnailUrl: "/showcase/small-hours-table.webp",
  highlights: [
    "Letter-first narrative flow with a clear community-first tone",
    "Noticeboard cards and tactile states that feel handcrafted",
    "Invitation form with transparent validation and motion-light feedback",
  ],
  files: [
    { path: "App.tsx", content: app },
    { path: "tokens.css", content: tokens },
    { path: "styles.css", content: styles },
  ],
};
