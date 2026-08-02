module.exports=[179409,985643,468249,a=>{"use strict";var b=a.i(254185),c=a.i(75681),d=a.i(391262),e=a.i(231191);let f=c.z.object({v:c.z.literal(1),snapshotAt:c.z.string().datetime(),publishedAt:c.z.string().datetime(),id:c.z.string().min(1).max(128),direction:c.z.enum(["after","before"]),query:c.z.string().max(80),remixable:c.z.boolean(),sort:c.z.enum(["newest","oldest"])}),g={id:!0,chatId:!0,userId:!0,slug:!0,title:!0,description:!0,allowRemixes:!0,publishedAt:!0,messageId:!0,thumbnailUrl:!0,thumbnailStatus:!0,thumbnailCapturedMessageId:!0,chat:{select:{prompt:!0}},user:{select:{name:!0,image:!0}}};function h(a){return Buffer.from(JSON.stringify(a)).toString("base64url")}function i({row:a,snapshotAt:b,direction:c,query:d,remixable:e,sort:f}){return h({v:1,snapshotAt:b.toISOString(),publishedAt:a.publishedAt.toISOString(),id:a.id,direction:c,query:d,remixable:e,sort:f})}async function j({query:a,remixable:b,sort:c,cursor:d="",viewerId:k}){let l=(0,e.getPrisma)(),m=function(a){if(!a)return null;try{let b=JSON.parse(Buffer.from(a,"base64url").toString("utf8")),c=f.safeParse(b);return c.success?c.data:null}catch{return null}}(d),n=m?.query===a&&m.remixable===b&&m.sort===c?m:null,o=n?new Date(n.snapshotAt):new Date,p=n?.direction??"after",q="oldest"===c?"asc":"desc",r="before"===p?"asc"===q?"desc":"asc":q,s=[];if(a&&s.push({OR:[{title:{contains:a,mode:"insensitive"}},{description:{contains:a,mode:"insensitive"}},{user:{name:{contains:a,mode:"insensitive"}}}]}),n){let a=new Date(n.publishedAt),b="after"===p,c="asc"===q&&b||"desc"===q&&!b;s.push({OR:[{publishedAt:c?{gt:a}:{lt:a}},{publishedAt:a,id:c?{gt:n.id}:{lt:n.id}}]})}let t={isPublished:!0,publishedAt:{lte:o},...b?{allowRemixes:!0}:{},...s.length>0?{AND:s}:{}},u=await l.galleryPublication.findMany({where:t,orderBy:[{publishedAt:r},{id:r}],select:g,take:13}),v=u.length>12,w=u.slice(0,12);"before"===p&&w.reverse();let x=w[0],y=w.at(-1),z=x?n&&("after"===p||v)?i({row:x,snapshotAt:o,direction:"before",query:a,remixable:b,sort:c}):null:n?.direction==="after"?h({...n,direction:"before"}):null,A=y?"before"===p&&n||v?i({row:y,snapshotAt:o,direction:"after",query:a,remixable:b,sort:c}):null:n?.direction==="before"?h({...n,direction:"after"}):null;return{projects:w.map(a=>{let b;return b="ready"===a.thumbnailStatus&&a.thumbnailCapturedMessageId===a.messageId&&!!a.thumbnailUrl,{id:a.id,ownerChatId:a.userId===k?a.chatId:null,slug:a.slug,title:a.title,description:a.description,generationPrompt:a.chat.prompt,allowRemixes:a.allowRemixes,publishedAt:a.publishedAt,thumbnailUrl:b?`/api/gallery/${encodeURIComponent(a.id)}/thumbnail?v=${encodeURIComponent(a.messageId)}`:null,thumbnailStatus:b?"ready":"failed"===a.thumbnailStatus?"failed":"pending",creator:{name:a.user.name??"Squid creator",image:a.user.image}}}),previousCursor:z,nextCursor:A}}let k=(0,b.cache)(async a=>{let b=(0,e.getPrisma)(),c=await b.galleryPublication.findFirst({where:{slug:a,isPublished:!0},include:{chat:!0,message:!0,user:{select:{name:!0,image:!0}},publicArtifact:!0}});if(!c||c.publicArtifact&&"ACTIVE"!==c.publicArtifact.status)return null;let f=(0,d.getMessageGeneratedFiles)(c.message);return 0===f.length?null:{publication:c,files:f}});a.s(["getGalleryProjects",0,j,"getPublicGalleryProject",0,k],179409);let l=[{id:"showcase-orbital-salvage",slug:"orbital-salvage",title:"Orbital Salvage",description:"A momentum-driven recovery run with procedural hazards, particles, combo scoring, touch controls, and a persistent high score.",prompt:"Build a polished browser game called Orbital Salvage in React and TypeScript. Use a responsive HTML canvas with inertia-based ship controls, keyboard and touch steering, boost energy, collectible salvage cores, escalating proximity mines, particle effects, combo scoring, a 45-second mission timer, game-over and replay states, and a high score saved to localStorage. Give it a technical deep-space recovery interface with crisp telemetry, strong accessibility, and reduced-motion support. Do not use image assets or a game engine.",category:"Canvas arcade",accent:"#7df9ff",thumbnailUrl:"/showcase/orbital-salvage.webp",thumbnailWidth:960,thumbnailHeight:600,controls:["Steer with WASD or the arrow keys.","Hold Space or Shift to burn boost energy.","On touch screens, press and drag toward your target."],files:[{path:"App.tsx",content:String.raw`import { useCallback, useEffect, useRef, useState } from "react";
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
}`},{path:"styles.css",content:String.raw`@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

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
`}]},{id:"showcase-rune-circuit",slug:"rune-circuit",title:"Rune Circuit",description:"A ceramic circuit-routing puzzle with real connectivity logic, undo history, hints, level progression, timers, and saved best scores.",prompt:"Create a sophisticated React and TypeScript puzzle game called Rune Circuit. Render a responsive 5 by 5 grid of rotatable circuit tiles. Calculate power propagation using edge-to-edge connectivity and breadth-first search from a source to a receiver. Include clockwise and counterclockwise rotation, undo history, a limited visual hint, move and time tracking, best moves in localStorage, a completion dialog, and progressively re-scrambled levels. Art-direct it as a tactile ceramic archive-restoration instrument using an ivory, cobalt, and vermilion palette, editorial typography, subtle grain, keyboard focus states, and reduced-motion support. Use no image assets.",category:"Logic puzzle",accent:"#b3422d",thumbnailUrl:"/showcase/rune-circuit.webp",thumbnailWidth:960,thumbnailHeight:600,controls:["Click a rune to rotate it clockwise.","Right-click a rune to rotate it counterclockwise.","Use Undo or Reveal fault when the circuit stalls."],files:[{path:"App.tsx",content:String.raw`import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
}`},{path:"styles.css",content:String.raw`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');

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
`}]},{id:"showcase-echo-chamber",slug:"echo-chamber",title:"Echo Chamber",description:"A procedural spatial-memory instrument with synthesized stereo tones, three speeds, keyboard play, animated sequences, and persistent scores.",prompt:"Build an elegant browser memory game called Echo Chamber with React and TypeScript. Arrange six accessible tone pads in a radial spatial interface. Generate an increasingly long procedural sequence, play it back with animated light states and Web Audio oscillator tones positioned with StereoPannerNode, then validate mouse or number-key input. Include three playback speeds, a sound toggle, round and score tracking, sequence progress, failure and replay states, and a best score saved to localStorage. The art direction should feel like a nocturnal listening instrument with soft spectral colors, editorial serif typography, concentric orbital guides, responsive mobile layout, focus states, and reduced-motion support. Use no audio or image assets.",category:"Audio memory",accent:"#ffcd66",thumbnailUrl:"/showcase/echo-chamber.webp",thumbnailWidth:960,thumbnailHeight:600,controls:["Listen and watch while the chamber performs the sequence.","Repeat it with the six pads or number keys 1–6.","Choose Drift, Pulse, or Surge cadence before a run."],files:[{path:"App.tsx",content:String.raw`import { useCallback, useEffect, useRef, useState } from "react";
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
}`},{path:"styles.css",content:String.raw`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap');

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
`}]}];a.s(["getShowcaseGame",0,function(a){return l.find(b=>b.slug===a)??null},"getShowcaseGameSummaries",0,function(a=""){let b=a.trim().toLowerCase();return l.filter(a=>!b||[a.title,a.description,a.category].some(a=>a.toLowerCase().includes(b))).map(({id:a,slug:b,title:c,description:d,category:e,accent:f,thumbnailUrl:g,thumbnailWidth:h,thumbnailHeight:i})=>({id:a,slug:b,title:c,description:d,category:e,accent:f,thumbnailUrl:g,thumbnailWidth:h,thumbnailHeight:i}))}],985643);let m=[{id:"showcase-landing-cinder-studio",slug:"cinder-studio",title:"Cinder Studio — Atelier Edition",description:"A premium atmospheric concept for an architectural lighting atelier: dark luxury, cinematic interaction rhythms, and a calm, instrument-driven showcase of fixture craftsmanship.",prompt:"Create a premium responsive landing page for a fictional architectural lighting studio called Cinder Studio. Use an atmospheric luxury direction inspired by an optical laboratory: cool-violet near-black canvas, molten-brass glow, classical upright serif for hierarchy, refined humanist sans for body copy, and mono fixture labels. Structure the page as a marquee-style studio thesis: a live light chamber in the hero, interactive fixture controls, material-led storytelling, a restrained ledger for four fixtures, and a quiet statement footer. Keep interactions subtle: one-click fixture switching, three light temperatures, and one stateful action for material requests. Never add fabricated metrics, testimonials, remote links, stock imagery, or fake UI chrome. Ensure full keyboard focus support, reduced-motion parity, responsive behavior at 320/375/414/768, and all styling tokens in `tokens.css` using OKLCH variables.",category:"Atmospheric luxury studio",accent:"oklch(76% 0.17 50)",thumbnailUrl:"/showcase/cinder-studio.webp",thumbnailWidth:1440,thumbnailHeight:900,highlights:["Atmospheric studio layout without a generic hero-only pattern","Interactive light chamber with fixture presets and temperature tuning","Local typography and tokenized CSS for a high-end tactile atmosphere"],files:[{path:"App.tsx",content:String.raw`import { useMemo, useState } from "react";
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
}`}]}];a.s(["getShowcaseLanding",0,function(a){return m.find(b=>b.slug===a)??null},"getShowcaseLandingSummaries",0,function(a=""){let b=a.trim().toLowerCase();return m.filter(a=>!b||[a.title,a.description,a.category].some(a=>a.toLowerCase().includes(b))).map(({id:a,slug:b,title:c,description:d,category:e,accent:f,thumbnailUrl:g,thumbnailWidth:h,thumbnailHeight:i})=>({id:a,slug:b,title:c,description:d,category:e,accent:f,thumbnailUrl:g,thumbnailWidth:h,thumbnailHeight:i}))}],468249)}];

//# sourceMappingURL=features_gallery_server_queries_ts_0vmjlrn._.js.map