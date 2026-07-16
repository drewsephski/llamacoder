import type { ShowcaseGame } from "@/features/gallery/showcase-games/types";

const app = String.raw`import { useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";

type Phase = "intro" | "running" | "over";
type Point = { x: number; y: number };
type Salvage = Point & { radius: number; spin: number; value: number };
type Mine = Point & { radius: number; pulse: number; driftX: number; driftY: number };
type Particle = Point & { vx: number; vy: number; life: number; color: string };
type Hud = { score: number; combo: number; shield: number; energy: number; time: number };

const INITIAL_HUD: Hud = { score: 0, combo: 1, shield: 3, energy: 100, time: 45 };

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function wrap(value: number, limit: number) {
  if (value < -30) return limit + 30;
  if (value > limit + 30) return -30;
  return value;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<Phase>("intro");
  const [phase, setPhase] = useState<Phase>("intro");
  const [runId, setRunId] = useState(0);
  const [hud, setHud] = useState<Hud>(INITIAL_HUD);
  const [best, setBest] = useState(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem("orbital-salvage-best") || 0);
    setBest(Number.isFinite(saved) ? saved : 0);
  }, []);

  const begin = useCallback(() => {
    setHud(INITIAL_HUD);
    setPhase("running");
    setRunId((value) => value + 1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 1;
    let height = 1;
    let animationFrame = 0;
    let previousTime = performance.now();
    let hudClock = 0;
    let elapsed = 0;
    let salvageClock = 0;
    let mineClock = 0;
    let score = 0;
    let combo = 1;
    let shield = 3;
    let energy = 100;
    let ended = false;
    const player = { x: 300, y: 300, vx: 0, vy: 0, rotation: 0 };
    const pointer = { x: 0, y: 0, active: false };
    const keys = new Set<string>();
    const salvage: Salvage[] = [];
    const mines: Mine[] = [];
    const particles: Particle[] = [];
    const stars: Array<Point & { alpha: number; size: number }> = [];
    const trail: Point[] = [];

    function resize() {
      const rectangle = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rectangle.width);
      height = Math.max(1, rectangle.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      player.x = Math.min(player.x, width * 0.85);
      player.y = Math.min(player.y, height * 0.85);
      if (stars.length === 0) {
        for (let index = 0; index < 120; index += 1) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            alpha: randomBetween(0.15, 0.75),
            size: randomBetween(0.5, 1.7),
          });
        }
      }
    }

    function addSalvage() {
      salvage.push({
        x: randomBetween(70, Math.max(71, width - 70)),
        y: randomBetween(70, Math.max(71, height - 70)),
        radius: randomBetween(11, 17),
        spin: Math.random() * Math.PI,
        value: Math.random() > 0.78 ? 250 : 100,
      });
    }

    function addMine() {
      const edge = Math.floor(Math.random() * 4);
      const positions = [
        { x: -20, y: Math.random() * height },
        { x: width + 20, y: Math.random() * height },
        { x: Math.random() * width, y: -20 },
        { x: Math.random() * width, y: height + 20 },
      ];
      const position = positions[edge];
      const angle = Math.atan2(height / 2 - position.y, width / 2 - position.x);
      const speed = randomBetween(24, 48) + elapsed * 0.5;
      mines.push({
        x: position.x,
        y: position.y,
        radius: randomBetween(15, 23),
        pulse: Math.random() * Math.PI,
        driftX: Math.cos(angle) * speed,
        driftY: Math.sin(angle) * speed,
      });
    }

    function burst(x: number, y: number, color: string, count: number) {
      for (let index = 0; index < count; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = randomBetween(35, 155);
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: randomBetween(0.35, 0.9),
          color,
        });
      }
    }

    function endGame() {
      if (ended) return;
      ended = true;
      phaseRef.current = "over";
      const nextBest = Math.max(best, score);
      setBest(nextBest);
      window.localStorage.setItem("orbital-salvage-best", String(nextBest));
      setHud({ score, combo, shield, energy, time: Math.max(0, 45 - elapsed) });
      setPhase("over");
    }

    function onKeyDown(event: KeyboardEvent) {
      keys.add(event.key.toLowerCase());
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      keys.delete(event.key.toLowerCase());
    }

    function setPointer(event: PointerEvent) {
      const rectangle = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rectangle.left;
      pointer.y = event.clientY - rectangle.top;
    }

    function onPointerDown(event: PointerEvent) {
      pointer.active = true;
      setPointer(event);
      canvas.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event: PointerEvent) {
      if (pointer.active) setPointer(event);
    }

    function onPointerUp() {
      pointer.active = false;
    }

    function update(delta: number) {
      if (phaseRef.current !== "running") return;
      elapsed += delta;
      salvageClock += delta;
      mineClock += delta;

      let inputX = 0;
      let inputY = 0;
      if (keys.has("a") || keys.has("arrowleft")) inputX -= 1;
      if (keys.has("d") || keys.has("arrowright")) inputX += 1;
      if (keys.has("w") || keys.has("arrowup")) inputY -= 1;
      if (keys.has("s") || keys.has("arrowdown")) inputY += 1;
      if (pointer.active) {
        const distance = Math.hypot(pointer.x - player.x, pointer.y - player.y);
        if (distance > 12) {
          inputX += (pointer.x - player.x) / distance;
          inputY += (pointer.y - player.y) / distance;
        }
      }

      const boosting = (keys.has(" ") || keys.has("shift")) && energy > 1;
      const thrust = boosting ? 250 : 155;
      const inputLength = Math.hypot(inputX, inputY) || 1;
      if (inputX !== 0 || inputY !== 0) {
        player.vx += (inputX / inputLength) * thrust * delta;
        player.vy += (inputY / inputLength) * thrust * delta;
      }
      if (boosting && (inputX !== 0 || inputY !== 0)) energy = Math.max(0, energy - 35 * delta);
      else energy = Math.min(100, energy + 16 * delta);

      const drag = Math.pow(0.52, delta);
      player.vx *= drag;
      player.vy *= drag;
      const speed = Math.hypot(player.vx, player.vy);
      const maxSpeed = boosting ? 310 : 205;
      if (speed > maxSpeed) {
        player.vx = (player.vx / speed) * maxSpeed;
        player.vy = (player.vy / speed) * maxSpeed;
      }
      player.x = wrap(player.x + player.vx * delta, width);
      player.y = wrap(player.y + player.vy * delta, height);
      if (speed > 4) player.rotation = Math.atan2(player.vy, player.vx);
      trail.unshift({ x: player.x, y: player.y });
      if (trail.length > 18) trail.pop();

      if (salvageClock > Math.max(0.7, 1.45 - elapsed * 0.01)) {
        salvageClock = 0;
        if (salvage.length < 7) addSalvage();
      }
      if (mineClock > Math.max(0.8, 2.35 - elapsed * 0.025)) {
        mineClock = 0;
        addMine();
      }

      for (let index = salvage.length - 1; index >= 0; index -= 1) {
        const item = salvage[index];
        item.spin += delta * 1.8;
        if (Math.hypot(item.x - player.x, item.y - player.y) < item.radius + 12) {
          score += item.value * combo;
          combo = Math.min(8, combo + 1);
          burst(item.x, item.y, item.value > 100 ? "#ffd166" : "#7df9ff", 18);
          salvage.splice(index, 1);
        }
      }

      for (let index = mines.length - 1; index >= 0; index -= 1) {
        const mine = mines[index];
        mine.x += mine.driftX * delta;
        mine.y += mine.driftY * delta;
        mine.pulse += delta * 3;
        if (Math.hypot(mine.x - player.x, mine.y - player.y) < mine.radius + 11) {
          shield -= 1;
          combo = 1;
          burst(mine.x, mine.y, "#ff4d6d", 30);
          mines.splice(index, 1);
          if (shield <= 0) endGame();
        } else if (mine.x < -100 || mine.x > width + 100 || mine.y < -100 || mine.y > height + 100) {
          mines.splice(index, 1);
        }
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.vx *= Math.pow(0.1, delta);
        particle.vy *= Math.pow(0.1, delta);
        particle.life -= delta;
        if (particle.life <= 0) particles.splice(index, 1);
      }

      hudClock += delta;
      if (hudClock > 0.08) {
        hudClock = 0;
        setHud({ score, combo, shield, energy, time: Math.max(0, 45 - elapsed) });
      }
      if (elapsed >= 45) endGame();
    }

    function draw(time: number) {
      context.clearRect(0, 0, width, height);
      const background = context.createRadialGradient(width * 0.35, height * 0.3, 0, width * 0.5, height * 0.5, Math.max(width, height));
      background.addColorStop(0, "#142f4a");
      background.addColorStop(0.45, "#071725");
      background.addColorStop(1, "#02060d");
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      context.strokeStyle = "rgba(92, 179, 196, 0.07)";
      context.lineWidth = 1;
      const grid = 56;
      const driftX = (time * 0.008) % grid;
      for (let x = driftX; x < width; x += grid) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = driftX; y < height; y += grid) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      stars.forEach((star, index) => {
        context.globalAlpha = star.alpha * (0.75 + Math.sin(time * 0.001 + index) * 0.25);
        context.fillStyle = "#d8fbff";
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;

      trail.forEach((point, index) => {
        const alpha = (1 - index / trail.length) * 0.3;
        context.fillStyle = "rgba(88, 239, 255, " + alpha + ")";
        context.beginPath();
        context.arc(point.x, point.y, Math.max(1, 7 - index * 0.3), 0, Math.PI * 2);
        context.fill();
      });

      salvage.forEach((item) => {
        context.save();
        context.translate(item.x, item.y);
        context.rotate(item.spin);
        context.shadowBlur = 22;
        context.shadowColor = item.value > 100 ? "#ffd166" : "#62eaf5";
        context.strokeStyle = item.value > 100 ? "#ffd166" : "#8ff7ff";
        context.lineWidth = 3;
        context.strokeRect(-item.radius * 0.65, -item.radius * 0.65, item.radius * 1.3, item.radius * 1.3);
        context.rotate(Math.PI / 4);
        context.strokeRect(-item.radius * 0.42, -item.radius * 0.42, item.radius * 0.84, item.radius * 0.84);
        context.restore();
      });

      mines.forEach((mine) => {
        context.save();
        context.translate(mine.x, mine.y);
        context.shadowBlur = 22 + Math.sin(mine.pulse) * 8;
        context.shadowColor = "#ff345f";
        context.fillStyle = "#3c0b19";
        context.strokeStyle = "#ff5575";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(0, 0, mine.radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        for (let spike = 0; spike < 8; spike += 1) {
          context.rotate(Math.PI / 4);
          context.beginPath();
          context.moveTo(mine.radius - 2, 0);
          context.lineTo(mine.radius + 8, 0);
          context.stroke();
        }
        context.restore();
      });

      particles.forEach((particle) => {
        context.globalAlpha = Math.max(0, particle.life * 1.5);
        context.fillStyle = particle.color;
        context.fillRect(particle.x - 2, particle.y - 2, 4, 4);
      });
      context.globalAlpha = 1;

      context.save();
      context.translate(player.x, player.y);
      context.rotate(player.rotation);
      context.shadowBlur = 28;
      context.shadowColor = "#6cf5ff";
      context.fillStyle = "#dfffff";
      context.strokeStyle = "#5fe9f5";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(17, 0);
      context.lineTo(-10, -10);
      context.lineTo(-5, 0);
      context.lineTo(-10, 10);
      context.closePath();
      context.fill();
      context.stroke();
      if (phaseRef.current === "running") {
        context.fillStyle = "#ffb45c";
        context.beginPath();
        context.moveTo(-7, -4);
        context.lineTo(-18 - Math.random() * 9, 0);
        context.lineTo(-7, 4);
        context.fill();
      }
      context.restore();
    }

    function frame(time: number) {
      const delta = Math.min(0.033, (time - previousTime) / 1000);
      previousTime = time;
      update(delta);
      draw(time);
      animationFrame = requestAnimationFrame(frame);
    }

    resize();
    player.x = width / 2;
    player.y = height / 2;
    if (phaseRef.current === "running") {
      for (let index = 0; index < 4; index += 1) addSalvage();
      addMine();
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    animationFrame = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [best, runId]);

  return (
    <main className="game-shell">
      <canvas ref={canvasRef} className="space-canvas" aria-label="Orbital Salvage game field" />
      <header className="game-header">
        <div className="brand-block">
          <span className="eyebrow">DEEP SPACE RECOVERY UNIT</span>
          <strong>ORBITAL / SALVAGE</strong>
        </div>
        <div className="mission-clock">
          <span>MISSION WINDOW</span>
          <b>{hud.time.toFixed(1)}</b>
        </div>
      </header>

      <section className="hud" aria-live="polite">
        <div><span>RECOVERED</span><b>{String(hud.score).padStart(6, "0")}</b></div>
        <div><span>CHAIN</span><b className="cyan">×{hud.combo}</b></div>
        <div><span>HULL</span><b>{"◆".repeat(Math.max(0, hud.shield))}{"◇".repeat(Math.max(0, 3 - hud.shield))}</b></div>
      </section>

      <div className="energy-meter" aria-label={"Boost energy " + Math.round(hud.energy) + " percent"}>
        <span>THRUST</span>
        <div><i style={{ width: hud.energy + "%" }} /></div>
      </div>

      <div className="control-hint">WASD / ARROWS TO STEER · HOLD SPACE TO BURN · TOUCH + DRAG</div>

      {phase !== "running" && (
        <section className="mission-card">
          <span className="card-kicker">{phase === "intro" ? "INCOMING CONTRACT" : "RECOVERY COMPLETE"}</span>
          <h1>{phase === "intro" ? "Pull the lost cores out of a collapsing orbit." : String(hud.score).padStart(6, "0") + " credits banked"}</h1>
          <p>{phase === "intro" ? "Chain recoveries to multiply their value. Red proximity mines will strip your hull and reset the chain." : "Your best recovery is " + String(best).padStart(6, "0") + ". The debris field adapts every run."}</p>
          <button type="button" onClick={begin}>{phase === "intro" ? "BEGIN SALVAGE" : "RUN IT AGAIN"}<span>↗</span></button>
        </section>
      )}
    </main>
  );
}`;

const styles = String.raw`@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; overflow: hidden; }
body { background: #02060d; font-family: "IBM Plex Mono", monospace; }
button { font: inherit; }
.game-shell { position: relative; width: 100%; height: 100%; min-height: 520px; overflow: hidden; color: #dffcff; user-select: none; }
.space-canvas { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; }
.game-shell::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, transparent 0 3px, rgba(116,245,255,.018) 3px 4px); mix-blend-mode: screen; }
.game-header { position: absolute; inset: 0 0 auto 0; z-index: 2; display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 28px; border-bottom: 1px solid rgba(142,239,246,.14); background: linear-gradient(180deg, rgba(2,6,13,.76), transparent); pointer-events: none; }
.brand-block { display: grid; gap: 5px; }
.brand-block .eyebrow, .mission-clock span, .hud span, .energy-meter span { color: #7da4af; font-size: 9px; letter-spacing: .19em; }
.brand-block strong { font-family: "Chakra Petch", sans-serif; font-size: 18px; letter-spacing: .08em; }
.mission-clock { display: grid; justify-items: end; gap: 2px; }
.mission-clock b { font-family: "Chakra Petch", sans-serif; color: #ffd166; font-size: 28px; font-variant-numeric: tabular-nums; }
.hud { position: absolute; z-index: 2; top: 105px; left: 28px; display: grid; min-width: 188px; border-left: 1px solid rgba(121,231,239,.32); pointer-events: none; }
.hud > div { display: flex; justify-content: space-between; align-items: baseline; gap: 28px; padding: 7px 0 7px 13px; border-bottom: 1px solid rgba(121,231,239,.09); }
.hud b { font-family: "Chakra Petch", sans-serif; font-size: 15px; letter-spacing: .06em; }
.hud .cyan { color: #7df9ff; }
.energy-meter { position: absolute; z-index: 2; top: 105px; right: 28px; width: 150px; text-align: right; pointer-events: none; }
.energy-meter div { height: 4px; margin-top: 7px; background: rgba(115,159,171,.2); overflow: hidden; transform: skewX(-22deg); }
.energy-meter i { display: block; height: 100%; background: linear-gradient(90deg, #5bcbd6, #d8ffff); box-shadow: 0 0 12px #79f5ff; transition: width .08s linear; }
.control-hint { position: absolute; z-index: 2; left: 50%; bottom: 20px; transform: translateX(-50%); white-space: nowrap; color: rgba(195,234,239,.56); font-size: 9px; letter-spacing: .15em; pointer-events: none; }
.mission-card { position: absolute; z-index: 4; left: 50%; top: 52%; width: min(480px, calc(100% - 40px)); transform: translate(-50%, -50%); padding: 30px; border: 1px solid rgba(126,235,243,.35); background: linear-gradient(145deg, rgba(8,25,39,.92), rgba(2,9,16,.96)); box-shadow: 0 26px 90px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.025); backdrop-filter: blur(14px); }
.mission-card::before, .mission-card::after { content: ""; position: absolute; width: 28px; height: 28px; border-color: #79f4ff; }
.mission-card::before { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
.mission-card::after { right: -1px; bottom: -1px; border-right: 2px solid; border-bottom: 2px solid; }
.card-kicker { color: #ffd166; font-size: 9px; letter-spacing: .22em; }
.mission-card h1 { max-width: 390px; margin: 15px 0 12px; font-family: "Chakra Petch", sans-serif; font-size: clamp(28px, 4vw, 45px); line-height: .98; letter-spacing: -.03em; text-transform: uppercase; }
.mission-card p { max-width: 410px; margin: 0; color: #9bb4bb; font-size: 12px; line-height: 1.7; }
.mission-card button { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 25px; padding: 13px 15px; border: 0; background: #dffcff; color: #031018; font-size: 11px; font-weight: 600; letter-spacing: .14em; cursor: pointer; transition: background .2s, transform .2s; }
.mission-card button:hover { background: #ffd166; transform: translateY(-1px); }
.mission-card button:focus-visible { outline: 2px solid #ffd166; outline-offset: 3px; }
.mission-card button span { font-size: 17px; }
@media (max-width: 640px) {
  .game-header { padding: 17px; }
  .brand-block strong { font-size: 15px; }
  .mission-clock b { font-size: 22px; }
  .hud { top: 82px; left: 17px; min-width: 165px; }
  .energy-meter { top: 84px; right: 17px; width: 95px; }
  .control-hint { bottom: 12px; font-size: 7px; letter-spacing: .08em; }
  .mission-card { padding: 24px; }
}
@media (prefers-reduced-motion: reduce) { .mission-card button, .energy-meter i { transition: none; } }
`;

export const orbitalSalvage: ShowcaseGame = {
  id: "showcase-orbital-salvage",
  slug: "orbital-salvage",
  title: "Orbital Salvage",
  description:
    "A momentum-driven recovery run with procedural hazards, particles, combo scoring, touch controls, and a persistent high score.",
  prompt:
    "Build a polished browser game called Orbital Salvage in React and TypeScript. Use a responsive HTML canvas with inertia-based ship controls, keyboard and touch steering, boost energy, collectible salvage cores, escalating proximity mines, particle effects, combo scoring, a 45-second mission timer, game-over and replay states, and a high score saved to localStorage. Give it a technical deep-space recovery interface with crisp telemetry, strong accessibility, and reduced-motion support. Do not use image assets or a game engine.",
  category: "Canvas arcade",
  accent: "#7df9ff",
  thumbnailUrl: "/showcase/orbital-salvage.webp",
  controls: [
    "Steer with WASD or the arrow keys.",
    "Hold Space or Shift to burn boost energy.",
    "On touch screens, press and drag toward your target.",
  ],
  files: [
    { path: "App.tsx", content: app },
    { path: "styles.css", content: styles },
  ],
};
