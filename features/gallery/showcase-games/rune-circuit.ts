import type { ShowcaseGame } from "@/features/gallery/showcase-games/types";

const app = String.raw`import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

type Direction = "N" | "E" | "S" | "W";
type Tile = { openings: Direction[]; role?: "source" | "sink" };
type Status = "playing" | "won";

const SIZE = 5;
const SOURCE = 10;
const SINK = 14;
const PATH = [10, 11, 6, 7, 8, 13, 18, 19, 14];
const DIRECTIONS: Direction[] = ["N", "E", "S", "W"];
const DELTAS: Record<Direction, [number, number]> = {
  N: [-1, 0],
  E: [0, 1],
  S: [1, 0],
  W: [0, -1],
};
const OPPOSITE: Record<Direction, Direction> = { N: "S", E: "W", S: "N", W: "E" };

const TILES: Tile[] = [
  { openings: ["E", "S"] }, { openings: ["E", "W"] }, { openings: ["N", "E", "S"] }, { openings: ["N", "W"] }, { openings: ["N", "S"] },
  { openings: ["N", "E"] }, { openings: ["S", "E"] }, { openings: ["E", "W"] }, { openings: ["W", "S"] }, { openings: ["N", "E", "W"] },
  { openings: ["E"], role: "source" }, { openings: ["W", "N"] }, { openings: ["E", "S"] }, { openings: ["N", "S"] }, { openings: ["S"], role: "sink" },
  { openings: ["N", "S", "E"] }, { openings: ["N", "W"] }, { openings: ["E", "W"] }, { openings: ["N", "E"] }, { openings: ["W", "N"] },
  { openings: ["N", "E"] }, { openings: ["N", "S"] }, { openings: ["N", "E", "W"] }, { openings: ["S", "W"] }, { openings: ["N", "S"] },
];

function rotateDirection(direction: Direction, rotation: number) {
  return DIRECTIONS[(DIRECTIONS.indexOf(direction) + rotation) % 4];
}

function getOpenings(index: number, rotations: number[]) {
  return TILES[index].openings.map((direction) => rotateDirection(direction, rotations[index]));
}

function createBoard(level: number) {
  const rotations = TILES.map((_, index) => ((index * 3 + level * 7 + (index % 4) * level) % 4));
  PATH.forEach((index, pathIndex) => {
    rotations[index] = ((level + pathIndex * 3) % 3) + 1;
  });
  return rotations;
}

function getPowered(rotations: number[]) {
  const powered = new Set<number>([SOURCE]);
  const queue = [SOURCE];

  while (queue.length > 0) {
    const index = queue.shift();
    if (index === undefined) break;
    const row = Math.floor(index / SIZE);
    const column = index % SIZE;

    for (const direction of getOpenings(index, rotations)) {
      const [rowDelta, columnDelta] = DELTAS[direction];
      const nextRow = row + rowDelta;
      const nextColumn = column + columnDelta;
      if (nextRow < 0 || nextRow >= SIZE || nextColumn < 0 || nextColumn >= SIZE) continue;
      const nextIndex = nextRow * SIZE + nextColumn;
      if (getOpenings(nextIndex, rotations).includes(OPPOSITE[direction]) && !powered.has(nextIndex)) {
        powered.add(nextIndex);
        queue.push(nextIndex);
      }
    }
  }

  return powered;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return minutes + ":" + String(seconds % 60).padStart(2, "0");
}

export default function App() {
  const [level, setLevel] = useState(1);
  const [rotations, setRotations] = useState(() => createBoard(1));
  const [history, setHistory] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<Status>("playing");
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const hintTimer = useRef<number | null>(null);
  const powered = useMemo(() => getPowered(rotations), [rotations]);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem("rune-circuit-best") || 0);
    setBest(saved > 0 ? saved : null);
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (!powered.has(SINK) || status !== "playing") return;
    setStatus("won");
    const nextBest = best === null ? moves : Math.min(best, moves);
    setBest(nextBest);
    window.localStorage.setItem("rune-circuit-best", String(nextBest));
  }, [best, moves, powered, status]);

  const rotate = useCallback((index: number, amount = 1) => {
    if (status !== "playing") return;
    setHistory((current) => [...current.slice(-29), rotations]);
    setRotations((current) => current.map((rotation, tileIndex) => tileIndex === index ? (rotation + amount + 4) % 4 : rotation));
    setMoves((value) => value + 1);
    setHintIndex(null);
  }, [rotations, status]);

  const undo = () => {
    if (history.length === 0 || status !== "playing") return;
    const previous = history[history.length - 1];
    setHistory((current) => current.slice(0, -1));
    setRotations(previous);
    setMoves((value) => Math.max(0, value - 1));
  };

  const showHint = () => {
    const firstUnpowered = PATH.find((index) => !powered.has(index));
    const target = firstUnpowered === undefined ? PATH[PATH.length - 1] : firstUnpowered;
    setHintIndex(target);
    if (hintTimer.current) window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHintIndex(null), 1600);
  };

  const startLevel = (nextLevel: number) => {
    setLevel(nextLevel);
    setRotations(createBoard(nextLevel));
    setHistory([]);
    setMoves(0);
    setSeconds(0);
    setStatus("playing");
    setHintIndex(null);
  };

  return (
    <main className="workbench">
      <header className="topbar">
        <div className="identity">
          <span className="seal">RC</span>
          <div><strong>RUNE CIRCUIT</strong><span>Archive restoration console</span></div>
        </div>
        <div className="specimen"><span>SPECIMEN</span><b>NO. {String(level).padStart(3, "0")}</b></div>
      </header>

      <section className="layout">
        <aside className="briefing">
          <span className="section-label">FIELD NOTE / {String(level).padStart(2, "0")}</span>
          <h1>Restore the current before the archive goes dark.</h1>
          <p>Rotate each ceramic rune until the cobalt current reaches the vermilion receiver. Every connection must meet edge to edge.</p>
          <div className="legend">
            <div><i className="legend-source" /><span>Origin current</span></div>
            <div><i className="legend-live" /><span>Energized rune</span></div>
            <div><i className="legend-sink" /><span>Archive receiver</span></div>
          </div>
          <div className="actions">
            <button type="button" onClick={undo} disabled={history.length === 0 || status === "won"}>↶ Undo</button>
            <button type="button" onClick={showHint} disabled={status === "won"}>Reveal fault</button>
          </div>
        </aside>

        <section className="board-wrap" aria-label="Rune circuit puzzle">
          <div className="board-frame">
            <div className="terminal source-terminal"><span>IN</span><i /></div>
            <div className="board">
              {TILES.map((tile, index) => {
                const openings = getOpenings(index, rotations);
                const isPowered = powered.has(index);
                return (
                  <button
                    type="button"
                    key={index}
                    className={"tile " + (isPowered ? "powered " : "") + (tile.role ? tile.role + " " : "") + (hintIndex === index ? "hint" : "")}
                    onClick={() => rotate(index)}
                    onContextMenu={(event) => { event.preventDefault(); rotate(index, -1); }}
                    aria-label={"Rune row " + (Math.floor(index / SIZE) + 1) + ", column " + (index % SIZE + 1) + (isPowered ? ", energized" : "")}
                  >
                    <span className="grain" />
                    {openings.map((direction) => <i key={direction} className={"arm arm-" + direction.toLowerCase()} />)}
                    <i className="node">{tile.role === "source" ? "◉" : tile.role === "sink" ? "◆" : ""}</i>
                  </button>
                );
              })}
            </div>
            <div className={"terminal sink-terminal " + (powered.has(SINK) ? "active" : "")}><i /><span>OUT</span></div>
          </div>
          <p className="board-help">CLICK TO ROTATE CLOCKWISE · RIGHT CLICK FOR COUNTERCLOCKWISE</p>
        </section>

        <aside className="telemetry">
          <div><span>MOVES</span><b>{String(moves).padStart(2, "0")}</b></div>
          <div><span>TIME</span><b>{formatTime(seconds)}</b></div>
          <div><span>BEST</span><b>{best === null ? "—" : String(best).padStart(2, "0")}</b></div>
          <div className="continuity"><span>CONTINUITY</span><b>{Math.round((powered.size / TILES.length) * 100)}%</b><i><em style={{ width: (powered.size / TILES.length) * 100 + "%" }} /></i></div>
        </aside>
      </section>

      {status === "won" && (
        <section className="success" role="dialog" aria-modal="true" aria-label="Circuit restored">
          <span>ARCHIVE ONLINE</span>
          <h2>Current restored in {moves} moves.</h2>
          <p>The next specimen uses a new rotation cipher. Your archive-best is {best} moves.</p>
          <button type="button" onClick={() => startLevel(level + 1)}>OPEN SPECIMEN {String(level + 1).padStart(3, "0")} <b>→</b></button>
        </section>
      )}
    </main>
  );
}`;

const styles = String.raw`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');

:root { color-scheme: light; }
* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; }
body { background: #e7e1d5; color: #132a36; font-family: "DM Mono", monospace; }
button { font: inherit; }
.workbench { position: relative; min-height: 100%; overflow: hidden; background: #e7e1d5; background-image: radial-gradient(rgba(22,48,59,.06) .7px, transparent .7px); background-size: 6px 6px; }
.workbench::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, rgba(255,255,255,.45), transparent 26%, transparent 74%, rgba(101,74,48,.08)); }
.topbar { position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: center; min-height: 76px; padding: 14px 28px; border-bottom: 1px solid rgba(32,58,68,.23); }
.identity { display: flex; align-items: center; gap: 12px; }
.identity .seal { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid #163c4a; border-radius: 50%; font-family: "Instrument Serif", serif; font-size: 20px; }
.identity div { display: grid; gap: 2px; }
.identity strong { font-size: 12px; letter-spacing: .17em; }
.identity div span, .specimen span, .section-label, .telemetry span { color: #6e7776; font-size: 8px; letter-spacing: .17em; text-transform: uppercase; }
.specimen { display: grid; justify-items: end; gap: 3px; }
.specimen b { color: #b3422d; font-size: 12px; }
.layout { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(210px, 1fr) minmax(410px, 650px) minmax(125px, .58fr); align-items: center; gap: 34px; min-height: calc(100vh - 76px); padding: 32px clamp(24px, 4vw, 64px); }
.briefing h1 { max-width: 310px; margin: 16px 0; font-family: "Instrument Serif", serif; font-size: clamp(35px, 4vw, 55px); font-weight: 400; line-height: .95; letter-spacing: -.025em; }
.briefing > p { max-width: 330px; margin: 0; color: #5f6c6b; font-size: 11px; line-height: 1.75; }
.legend { display: grid; gap: 10px; margin-top: 28px; padding-top: 19px; border-top: 1px solid rgba(32,58,68,.2); }
.legend div { display: flex; align-items: center; gap: 10px; color: #4d5e60; font-size: 9px; }
.legend i { width: 18px; height: 3px; }
.legend-source { background: #b3422d; }.legend-live { background: #146b86; }.legend-sink { border: 1px solid #b3422d; }
.actions { display: flex; gap: 8px; margin-top: 24px; }
.actions button { padding: 9px 11px; border: 1px solid rgba(30,61,72,.32); background: transparent; color: #183b47; font-size: 9px; cursor: pointer; }
.actions button:hover:not(:disabled) { background: #143c4a; color: #f6f0e5; }
.actions button:focus-visible, .tile:focus-visible, .success button:focus-visible { outline: 2px solid #b3422d; outline-offset: 3px; }
.actions button:disabled { opacity: .35; cursor: default; }
.board-wrap { display: grid; justify-items: center; }
.board-frame { position: relative; width: min(56vh, 530px); min-width: 380px; padding: 19px; border: 1px solid rgba(24,56,66,.32); background: rgba(240,235,224,.82); box-shadow: 0 28px 70px rgba(49,42,30,.15), inset 0 0 0 7px rgba(25,63,73,.035); }
.board-frame::before { content: "ARCHIVE CONDUIT ARRAY / 5×5"; position: absolute; top: 5px; left: 50%; transform: translateX(-50%); color: #77807e; font-size: 6px; letter-spacing: .17em; white-space: nowrap; }
.board { display: grid; grid-template-columns: repeat(5, 1fr); aspect-ratio: 1; border-top: 1px solid rgba(28,59,67,.16); border-left: 1px solid rgba(28,59,67,.16); }
.tile { position: relative; aspect-ratio: 1; overflow: hidden; border: 0; border-right: 1px solid rgba(28,59,67,.16); border-bottom: 1px solid rgba(28,59,67,.16); background: #efeade; color: #1c5668; cursor: pointer; transition: background .24s, box-shadow .24s; }
.tile:hover { background: #f7f3e9; z-index: 2; }
.tile .grain { position: absolute; inset: 6px; border: 1px solid rgba(33,66,75,.08); border-radius: 50%; background: radial-gradient(circle at 36% 30%, rgba(255,255,255,.8), transparent 26%), radial-gradient(circle, rgba(37,66,72,.07) 1px, transparent 1px); background-size: auto, 7px 7px; }
.arm { position: absolute; z-index: 2; display: block; background: #879294; box-shadow: inset 0 0 0 1px rgba(31,55,61,.16); transition: background .25s, box-shadow .25s; }
.arm-n, .arm-s { left: calc(50% - 4px); width: 8px; height: 50%; }.arm-n { top: 0; }.arm-s { bottom: 0; }
.arm-e, .arm-w { top: calc(50% - 4px); width: 50%; height: 8px; }.arm-e { right: 0; }.arm-w { left: 0; }
.node { position: absolute; z-index: 3; left: 50%; top: 50%; display: grid; place-items: center; width: 24px; height: 24px; transform: translate(-50%, -50%); border: 2px solid #788587; border-radius: 50%; background: #e8e2d6; color: #a53426; font-style: normal; font-size: 11px; transition: all .25s; }
.tile.powered .arm { background: #176d86; box-shadow: 0 0 11px rgba(16,112,139,.34), inset 0 0 0 1px #0c5267; }
.tile.powered .node { border-color: #176d86; background: #dff3f2; box-shadow: 0 0 18px rgba(16,112,139,.28); }
.tile.source .arm, .tile.source .node { background: #b3422d; border-color: #8d2e1e; color: #fff4e8; box-shadow: 0 0 16px rgba(179,66,45,.35); }
.tile.sink .node { color: #b3422d; border-color: #b3422d; }
.tile.sink.powered .node { background: #b3422d; color: #fff4e8; box-shadow: 0 0 25px rgba(179,66,45,.45); }
.tile.hint { z-index: 4; animation: fault 1s ease-in-out infinite; }
@keyframes fault { 0%,100% { box-shadow: inset 0 0 0 2px #b3422d; } 50% { box-shadow: inset 0 0 0 5px rgba(179,66,45,.3); } }
.terminal { position: absolute; top: 50%; display: flex; align-items: center; gap: 6px; color: #a43c29; font-size: 7px; letter-spacing: .15em; }
.terminal i { display: block; width: 20px; height: 2px; background: #a43c29; }.source-terminal { left: -34px; transform: translateY(-50%); }.sink-terminal { right: -38px; transform: translateY(-50%); }.sink-terminal.active { color: #176d86; }.sink-terminal.active i { background: #176d86; box-shadow: 0 0 12px #176d86; }
.board-help { margin: 14px 0 0; color: #7d817b; font-size: 7px; letter-spacing: .13em; }
.telemetry { align-self: stretch; display: flex; flex-direction: column; justify-content: center; border-left: 1px solid rgba(30,61,72,.2); }
.telemetry > div { display: grid; gap: 5px; padding: 15px 0 15px 18px; border-bottom: 1px solid rgba(30,61,72,.15); }
.telemetry b { font-family: "Instrument Serif", serif; font-size: 25px; font-weight: 400; font-variant-numeric: tabular-nums; }
.continuity i { height: 3px; background: rgba(25,62,72,.15); }.continuity em { display: block; height: 100%; background: #176d86; transition: width .3s; }
.success { position: fixed; z-index: 10; left: 50%; top: 50%; width: min(440px, calc(100% - 36px)); transform: translate(-50%, -50%); padding: 31px; border: 1px solid #173e49; background: #f3eee3; box-shadow: 0 30px 100px rgba(38,30,18,.35); }
.success > span { color: #b3422d; font-size: 8px; letter-spacing: .2em; }.success h2 { margin: 13px 0 9px; font-family: "Instrument Serif", serif; font-size: 38px; font-weight: 400; line-height: 1; }.success p { color: #687270; font-size: 10px; line-height: 1.7; }.success button { display: flex; justify-content: space-between; width: 100%; margin-top: 22px; padding: 13px; border: 0; background: #153e4b; color: white; font-size: 9px; letter-spacing: .13em; cursor: pointer; }
@media (max-width: 900px) { .layout { grid-template-columns: 1fr; padding-top: 28px; }.briefing { display: none; }.telemetry { align-self: auto; flex-direction: row; border: 0; }.telemetry > div { flex: 1; padding: 10px; border: 1px solid rgba(30,61,72,.15); }.board-frame { width: min(65vh, 520px); }.workbench { overflow: auto; } }
@media (max-width: 520px) { .topbar { padding: 11px 15px; }.layout { padding: 20px 16px; gap: 18px; }.board-frame { min-width: 0; width: calc(100vw - 54px); padding: 12px; }.node { width: 19px; height: 19px; }.arm-n,.arm-s { left: calc(50% - 3px); width: 6px; }.arm-e,.arm-w { top: calc(50% - 3px); height: 6px; }.telemetry span { letter-spacing: .08em; }.board-help { text-align: center; line-height: 1.5; } }
@media (prefers-reduced-motion: reduce) { .tile, .arm, .node, .continuity em { transition: none; }.tile.hint { animation: none; box-shadow: inset 0 0 0 3px #b3422d; } }
`;

export const runeCircuit: ShowcaseGame = {
  id: "showcase-rune-circuit",
  slug: "rune-circuit",
  title: "Rune Circuit",
  description:
    "A ceramic circuit-routing puzzle with real connectivity logic, undo history, hints, level progression, timers, and saved best scores.",
  prompt:
    "Create a sophisticated React and TypeScript puzzle game called Rune Circuit. Render a responsive 5 by 5 grid of rotatable circuit tiles. Calculate power propagation using edge-to-edge connectivity and breadth-first search from a source to a receiver. Include clockwise and counterclockwise rotation, undo history, a limited visual hint, move and time tracking, best moves in localStorage, a completion dialog, and progressively re-scrambled levels. Art-direct it as a tactile ceramic archive-restoration instrument using an ivory, cobalt, and vermilion palette, editorial typography, subtle grain, keyboard focus states, and reduced-motion support. Use no image assets.",
  category: "Logic puzzle",
  accent: "#b3422d",
  controls: [
    "Click a rune to rotate it clockwise.",
    "Right-click a rune to rotate it counterclockwise.",
    "Use Undo or Reveal fault when the circuit stalls.",
  ],
  files: [
    { path: "App.tsx", content: app },
    { path: "styles.css", content: styles },
  ],
};
