import type { ShowcaseGame } from "@/features/gallery/showcase-games/types";

const app = String.raw`import { useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";

type Phase = "idle" | "listen" | "input" | "over";
type Difficulty = "drift" | "pulse" | "surge";
type Pad = { label: string; frequency: number; color: string; x: number; y: number; pan: number };

const PADS: Pad[] = [
  { label: "Lumen", frequency: 261.63, color: "#ff7a66", x: 50, y: 8, pan: 0 },
  { label: "Vela", frequency: 329.63, color: "#ffcd66", x: 77, y: 25, pan: 0.65 },
  { label: "Serein", frequency: 392, color: "#7de1d1", x: 77, y: 60, pan: 0.75 },
  { label: "Nadir", frequency: 493.88, color: "#6da7ff", x: 50, y: 77, pan: 0 },
  { label: "Morrow", frequency: 587.33, color: "#ae83ff", x: 23, y: 60, pan: -0.75 },
  { label: "Ember", frequency: 698.46, color: "#ff75af", x: 23, y: 25, pan: -0.65 },
];
const SPEEDS: Record<Difficulty, number> = { drift: 700, pulse: 500, surge: 330 };

function pickPad() {
  return Math.floor(Math.random() * PADS.length);
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [difficulty, setDifficulty] = useState<Difficulty>("pulse");
  const [sequence, setSequence] = useState<number[]>([]);
  const [inputIndex, setInputIndex] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [mistakePad, setMistakePad] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [sound, setSound] = useState(true);
  const audioRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);
  const phaseRef = useRef<Phase>("idle");
  const sequenceRef = useRef<number[]>([]);
  const inputIndexRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);

  useEffect(() => {
    inputIndexRef.current = inputIndex;
  }, [inputIndex]);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem("echo-chamber-best") || 0);
    setBest(Number.isFinite(saved) ? saved : 0);
    return () => timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const playTone = useCallback((index: number, duration = 0.28) => {
    if (!sound) return;
    if (!audioRef.current) audioRef.current = new AudioContext();
    const audio = audioRef.current;
    if (audio.state === "suspended") void audio.resume();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const panner = audio.createStereoPanner();
    const now = audio.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(PADS[index].frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(PADS[index].frequency * 1.008, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    panner.pan.setValueAtTime(PADS[index].pan, now);
    oscillator.connect(gain);
    gain.connect(panner);
    panner.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }, [sound]);

  const flash = useCallback((index: number, duration: number) => {
    setActivePad(index);
    playTone(index, Math.max(0.2, duration / 1000 - 0.08));
    schedule(() => setActivePad((current) => current === index ? null : current), duration);
  }, [playTone, schedule]);

  const performSequence = useCallback((nextSequence: number[]) => {
    clearTimers();
    setPhase("listen");
    phaseRef.current = "listen";
    setInputIndex(0);
    inputIndexRef.current = 0;
    const speed = SPEEDS[difficulty];
    nextSequence.forEach((padIndex, index) => {
      schedule(() => flash(padIndex, speed * 0.56), 500 + index * speed);
    });
    schedule(() => {
      setActivePad(null);
      setPhase("input");
      phaseRef.current = "input";
    }, 500 + nextSequence.length * speed);
  }, [clearTimers, difficulty, flash, schedule]);

  const begin = useCallback(() => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    void audioRef.current.resume();
    setScore(0);
    setMistakePad(null);
    const first = [pickPad()];
    setSequence(first);
    sequenceRef.current = first;
    performSequence(first);
  }, [performSequence]);

  const choosePad = useCallback((index: number) => {
    if (phaseRef.current !== "input") return;
    flash(index, 260);
    const expected = sequenceRef.current[inputIndexRef.current];
    if (index !== expected) {
      setMistakePad(index);
      setPhase("over");
      phaseRef.current = "over";
      const nextBest = Math.max(best, score);
      setBest(nextBest);
      window.localStorage.setItem("echo-chamber-best", String(nextBest));
      return;
    }

    const isRoundComplete = inputIndexRef.current === sequenceRef.current.length - 1;
    if (!isRoundComplete) {
      const nextInput = inputIndexRef.current + 1;
      setInputIndex(nextInput);
      inputIndexRef.current = nextInput;
      setScore((value) => value + 25);
      return;
    }

    const roundBonus = sequenceRef.current.length * 100;
    setScore((value) => value + roundBonus);
    setPhase("listen");
    phaseRef.current = "listen";
    const nextSequence = [...sequenceRef.current, pickPad()];
    setSequence(nextSequence);
    sequenceRef.current = nextSequence;
    schedule(() => performSequence(nextSequence), 720);
  }, [best, flash, performSequence, schedule, score]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < PADS.length) choosePad(index);
      if (event.key === "Enter" && (phaseRef.current === "idle" || phaseRef.current === "over")) begin();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [begin, choosePad]);

  const round = sequence.length;
  const statusCopy = phase === "idle" ? "Awaiting signal" : phase === "listen" ? "Listen" : phase === "input" ? "Your echo" : "Signal lost";

  return (
    <main className="chamber">
      <header className="masthead">
        <div><span className="mark">E/C</span><strong>ECHO CHAMBER</strong></div>
        <p>Spatial memory instrument <i>№ 06</i></p>
        <button type="button" className="sound-toggle" onClick={() => setSound((value) => !value)} aria-pressed={sound}>{sound ? "SOUND ON" : "SOUND OFF"}</button>
      </header>

      <section className="game-stage">
        <div className={"orbital-display phase-" + phase}>
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
          <div className="center-readout">
            <span>ROUND</span>
            <b>{String(round).padStart(2, "0")}</b>
            <em>{statusCopy}</em>
          </div>
          {PADS.map((pad, index) => (
            <button
              type="button"
              key={pad.label}
              className={"tone-pad " + (activePad === index ? "active " : "") + (mistakePad === index ? "mistake" : "")}
              style={{ left: pad.x + "%", top: pad.y + "%", "--pad-color": pad.color } as React.CSSProperties}
              onClick={() => choosePad(index)}
              disabled={phase !== "input"}
              aria-label={"Tone " + (index + 1) + ", " + pad.label}
            >
              <i><span>{index + 1}</span></i>
              <em>{pad.label}</em>
            </button>
          ))}
        </div>

        <aside className="score-panel">
          <div><span>SCORE</span><b>{String(score).padStart(5, "0")}</b></div>
          <div><span>BEST</span><b>{String(best).padStart(5, "0")}</b></div>
          <div className="sequence-meter"><span>SEQUENCE</span><div>{sequence.map((_, index) => <i key={index} className={index < inputIndex && phase === "input" ? "complete" : ""} />)}</div></div>
        </aside>
      </section>

      <footer className="console">
        <div className="difficulty" aria-label="Playback speed">
          <span>CADENCE</span>
          {(["drift", "pulse", "surge"] as Difficulty[]).map((option) => (
            <button type="button" key={option} className={difficulty === option ? "selected" : ""} onClick={() => setDifficulty(option)} disabled={phase === "listen" || phase === "input"}>{option}</button>
          ))}
        </div>
        <p>Repeat each spatial tone in order. Use the pads or keys 1—6.</p>
      </footer>

      {(phase === "idle" || phase === "over") && (
        <section className="overlay-card">
          <span>{phase === "idle" ? "CALIBRATION READY" : "PATTERN DISSOLVED"}</span>
          <h1>{phase === "idle" ? "How long can you hold an echo?" : "You held " + Math.max(0, round - 1) + " complete patterns."}</h1>
          <p>{phase === "idle" ? "Listen as the chamber places a tone in space, then return the pattern. One tone is added every round." : "The chamber has recorded your score. Re-enter when your attention is quiet."}</p>
          <button type="button" onClick={begin}>{phase === "idle" ? "ENTER THE CHAMBER" : "RECALIBRATE"}<b>↗</b></button>
        </section>
      )}
    </main>
  );
}`;

const styles = String.raw`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');

* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; overflow: hidden; }
body { background: #10101b; color: #f5f0e8; font-family: "Manrope", sans-serif; }
button { font: inherit; }
.chamber { position: relative; width: 100%; height: 100%; min-height: 600px; overflow: hidden; background: radial-gradient(circle at 50% 46%, #292745 0, #171626 36%, #0d0d17 77%); }
.chamber::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .15; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E"); mix-blend-mode: soft-light; }
.masthead { position: relative; z-index: 4; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; min-height: 70px; padding: 0 27px; border-bottom: 1px solid rgba(246,238,226,.13); }
.masthead > div { display: flex; align-items: center; gap: 11px; }.mark { display: grid; place-items: center; width: 37px; height: 37px; border: 1px solid rgba(246,238,226,.3); border-radius: 50%; font-family: "Newsreader", serif; font-style: italic; font-size: 14px; }.masthead strong { font-size: 11px; letter-spacing: .18em; }.masthead p { margin: 0; color: rgba(245,240,232,.52); font-family: "Newsreader", serif; font-size: 15px; font-style: italic; }.masthead p i { color: #ff7a66; }.sound-toggle { justify-self: end; padding: 7px 10px; border: 1px solid rgba(246,238,226,.18); background: transparent; color: rgba(245,240,232,.65); font-size: 8px; letter-spacing: .14em; cursor: pointer; }
.game-stage { position: relative; height: calc(100% - 140px); }
.orbital-display { position: absolute; left: 50%; top: 50%; width: min(72vh, 650px); aspect-ratio: 1; transform: translate(-50%, -50%); }
.orbit { position: absolute; left: 50%; top: 50%; border: 1px solid rgba(236,228,218,.11); border-radius: 50%; transform: translate(-50%, -50%); }.orbit-one { width: 95%; height: 95%; }.orbit-two { width: 67%; height: 67%; border-style: dashed; }.orbit-three { width: 39%; height: 39%; }
.orbital-display.phase-listen .orbit-two { animation: orbit-pulse 1.4s ease-in-out infinite; }
@keyframes orbit-pulse { 50% { border-color: rgba(255,205,102,.42); box-shadow: 0 0 45px rgba(255,205,102,.08); } }
.center-readout { position: absolute; z-index: 2; left: 50%; top: 50%; display: grid; justify-items: center; transform: translate(-50%, -50%); }.center-readout span { color: rgba(245,240,232,.42); font-size: 8px; letter-spacing: .22em; }.center-readout b { margin: -2px 0 -8px; font-family: "Newsreader", serif; font-size: clamp(54px, 7vw, 80px); font-weight: 400; font-variant-numeric: tabular-nums; }.center-readout em { color: #ffcd66; font-family: "Newsreader", serif; font-size: 14px; }
.tone-pad { --pad-color: #fff; position: absolute; z-index: 3; width: 82px; height: 104px; transform: translate(-50%, -50%); border: 0; background: transparent; color: rgba(245,240,232,.65); cursor: pointer; }.tone-pad i { position: relative; display: grid; place-items: center; width: 70px; height: 70px; margin: 0 auto; border: 1px solid color-mix(in srgb, var(--pad-color), transparent 48%); border-radius: 50%; background: color-mix(in srgb, var(--pad-color), transparent 89%); box-shadow: inset 0 0 0 8px rgba(12,12,22,.4); transition: transform .16s, background .16s, box-shadow .16s; }.tone-pad i::before, .tone-pad i::after { content: ""; position: absolute; inset: 8px; border: 1px solid color-mix(in srgb, var(--pad-color), transparent 72%); border-radius: 50%; }.tone-pad i::after { inset: 16px; }.tone-pad span { color: var(--pad-color); font-size: 9px; }.tone-pad em { display: block; margin-top: 7px; font-family: "Newsreader", serif; font-size: 13px; font-style: italic; }.tone-pad:not(:disabled):hover i { transform: scale(1.06); background: color-mix(in srgb, var(--pad-color), transparent 78%); }.tone-pad.active i { transform: scale(1.13); background: var(--pad-color); box-shadow: 0 0 30px color-mix(in srgb, var(--pad-color), transparent 25%), 0 0 80px color-mix(in srgb, var(--pad-color), transparent 70%); }.tone-pad.active span { color: #151421; }.tone-pad.mistake i { background: #ff3158; border-color: #ff3158; }.tone-pad:disabled { cursor: default; }.tone-pad:focus-visible { outline: 1px solid var(--pad-color); outline-offset: 5px; }
.score-panel { position: absolute; top: 50%; right: 29px; display: grid; gap: 1px; width: 135px; transform: translateY(-50%); }.score-panel > div { display: grid; gap: 2px; padding: 11px 0; border-bottom: 1px solid rgba(246,238,226,.12); }.score-panel span { color: rgba(245,240,232,.4); font-size: 7px; letter-spacing: .17em; }.score-panel b { font-family: "Newsreader", serif; font-size: 24px; font-weight: 400; font-variant-numeric: tabular-nums; }.sequence-meter div { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }.sequence-meter i { width: 5px; height: 5px; border: 1px solid rgba(245,240,232,.35); border-radius: 50%; }.sequence-meter i.complete { border-color: #7de1d1; background: #7de1d1; box-shadow: 0 0 7px #7de1d1; }
.console { position: absolute; z-index: 4; inset: auto 0 0; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; min-height: 70px; padding: 0 27px; border-top: 1px solid rgba(246,238,226,.13); background: rgba(11,11,19,.45); backdrop-filter: blur(8px); }.console > p { margin: 0; color: rgba(245,240,232,.44); font-family: "Newsreader", serif; font-size: 13px; font-style: italic; }.difficulty { display: flex; align-items: center; gap: 5px; }.difficulty > span { margin-right: 5px; color: rgba(245,240,232,.36); font-size: 7px; letter-spacing: .17em; }.difficulty button { padding: 6px 8px; border: 1px solid transparent; background: transparent; color: rgba(245,240,232,.45); font-size: 8px; text-transform: uppercase; cursor: pointer; }.difficulty button.selected { border-color: rgba(255,205,102,.42); color: #ffcd66; }.difficulty button:disabled { cursor: default; }
.overlay-card { position: absolute; z-index: 8; left: 50%; top: 51%; width: min(455px, calc(100% - 38px)); transform: translate(-50%, -50%); padding: 30px; border: 1px solid rgba(245,240,232,.22); background: rgba(18,17,30,.9); box-shadow: 0 35px 100px rgba(0,0,0,.52); backdrop-filter: blur(18px); }.overlay-card > span { color: #ffcd66; font-size: 8px; letter-spacing: .2em; }.overlay-card h1 { margin: 14px 0 10px; font-family: "Newsreader", serif; font-size: clamp(34px, 5vw, 48px); font-weight: 400; line-height: .96; letter-spacing: -.02em; }.overlay-card p { max-width: 380px; margin: 0; color: rgba(245,240,232,.57); font-size: 11px; line-height: 1.7; }.overlay-card button { display: flex; justify-content: space-between; width: 100%; margin-top: 23px; padding: 13px 14px; border: 1px solid #ffcd66; background: transparent; color: #ffcd66; font-size: 9px; letter-spacing: .14em; cursor: pointer; transition: background .2s, color .2s; }.overlay-card button:hover { background: #ffcd66; color: #141320; }.overlay-card button:focus-visible, .sound-toggle:focus-visible, .difficulty button:focus-visible { outline: 2px solid #ffcd66; outline-offset: 3px; }
@media (max-width: 780px) { .masthead { grid-template-columns: 1fr auto; padding: 0 16px; }.masthead > p { display: none; }.score-panel { top: auto; right: 16px; bottom: 12px; grid-template-columns: repeat(3, 1fr); width: 230px; transform: none; }.score-panel > div { padding: 7px; }.score-panel b { font-size: 18px; }.orbital-display { width: min(82vw, 580px); top: 46%; }.console { padding: 0 16px; grid-template-columns: 1fr; }.console > p { display: none; } }
@media (max-width: 520px) { .chamber { min-height: 540px; }.masthead { min-height: 58px; }.game-stage { height: calc(100% - 116px); }.console { min-height: 58px; }.orbital-display { width: 94vw; }.tone-pad { width: 68px; height: 84px; }.tone-pad i { width: 55px; height: 55px; }.score-panel { left: 50%; right: auto; bottom: 0; transform: translateX(-50%); }.overlay-card { padding: 25px; }.mark { width: 31px; height: 31px; }.masthead strong { font-size: 9px; } }
@media (prefers-reduced-motion: reduce) { .orbital-display.phase-listen .orbit-two { animation: none; }.tone-pad i, .overlay-card button { transition: none; } }
`;

export const echoChamber: ShowcaseGame = {
  id: "showcase-echo-chamber",
  slug: "echo-chamber",
  title: "Echo Chamber",
  description:
    "A procedural spatial-memory instrument with synthesized stereo tones, three speeds, keyboard play, animated sequences, and persistent scores.",
  prompt:
    "Build an elegant browser memory game called Echo Chamber with React and TypeScript. Arrange six accessible tone pads in a radial spatial interface. Generate an increasingly long procedural sequence, play it back with animated light states and Web Audio oscillator tones positioned with StereoPannerNode, then validate mouse or number-key input. Include three playback speeds, a sound toggle, round and score tracking, sequence progress, failure and replay states, and a best score saved to localStorage. The art direction should feel like a nocturnal listening instrument with soft spectral colors, editorial serif typography, concentric orbital guides, responsive mobile layout, focus states, and reduced-motion support. Use no audio or image assets.",
  category: "Audio memory",
  accent: "#ffcd66",
  controls: [
    "Listen and watch while the chamber performs the sequence.",
    "Repeat it with the six pads or number keys 1–6.",
    "Choose Drift, Pulse, or Surge cadence before a run.",
  ],
  files: [
    { path: "App.tsx", content: app },
    { path: "styles.css", content: styles },
  ],
};
