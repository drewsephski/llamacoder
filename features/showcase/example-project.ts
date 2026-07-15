import type { GeneratedFile } from "@/lib/generated-files";

export const EXAMPLE_PROJECT_PROMPT =
  "Build a premium global delivery workspace with an interactive Kanban board, an active-task focus timer, live Chicago weather, and reference currency conversion powered by public APIs.";

export const EXAMPLE_PROJECT_PLAN = [
  "Create a responsive command-center layout with a delivery map, working command menu, and contextual live-data rail.",
  "Make Kanban work interactive with drag and drop, keyboard-friendly move controls, filtering, and quick task creation.",
  "Add a drift-resistant focus timer tied to the team’s current priority.",
  "Fetch browser-safe weather from Open-Meteo and central-bank reference rates from Frankfurter v2 in parallel.",
  "Provide honest loading, refresh, attribution, fallback, focus, and responsive states so the exported app remains usable.",
];

export const EXAMPLE_PROJECT_FILES: GeneratedFile[] = [
  {
    path: "App.tsx",
    language: "tsx",
    fullMatch: "",
    code: `import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, Command, LayoutDashboard, Search, Settings2, Users, Wifi, X } from "lucide-react";

import { Board } from "./components/Board";
import { CurrencyCard } from "./components/CurrencyCard";
import { FocusTimer } from "./components/FocusTimer";
import { WeatherCard } from "./components/WeatherCard";
import { seedTasks, type Task } from "./data/tasks";
import "./styles.css";

const commandItems = [
  { label: "Open delivery board", detail: "Workspace", icon: LayoutDashboard },
  { label: "Review team handoffs", detail: "People", icon: Users },
  { label: "Open workspace settings", detail: "System", icon: Settings2 },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const commandInput = useRef<HTMLInputElement>(null);
  const completed = useMemo(() => tasks.filter((task) => task.status === "done").length, [tasks]);
  const activeCount = useMemo(() => tasks.filter((task) => task.status === "active").length, [tasks]);
  const activeTask = tasks.find((task) => task.status === "active")?.title ?? "Plan the next milestone";
  const progress = Math.round((completed / Math.max(tasks.length, 1)) * 100);
  const visibleCommands = commandItems.filter((item) => item.label.toLowerCase().includes(commandQuery.trim().toLowerCase()));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!commandOpen) return;
    const frame = window.requestAnimationFrame(() => commandInput.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [commandOpen]);

  return (
    <main className="workspace-shell">
      <header className="topbar">
        <a className="wordmark" href="#workspace" aria-label="Waypoint home">
          <span className="wordmark-mark" aria-hidden="true">W</span>
          <span><strong>Waypoint</strong><small>Atlas delivery ledger</small></span>
        </a>

        <button className="command-pill" type="button" onClick={() => setCommandOpen(true)} aria-label="Open command menu">
          <Search aria-hidden="true" />
          <span>Find a task or action</span>
          <kbd>⌘ K</kbd>
        </button>

        <div className="topbar-actions">
          <div className="presence" aria-label="Three teammates online">
            {[
              ["DA", "Drew"],
              ["MS", "Mina"],
              ["JL", "Jon"],
            ].map(([initials, name]) => <span key={initials} title={name}>{initials}</span>)}
          </div>
          <span className="sync-state"><Wifi aria-hidden="true" /> Live sync</span>
          <button className="icon-button" type="button" aria-label="Notifications"><Bell aria-hidden="true" /><span className="notification-dot" /></button>
        </div>
      </header>

      <div className="workspace" id="workspace">
        <section className="orientation" aria-labelledby="workspace-heading">
          <div className="orientation-copy">
            <p className="route-line"><span>Chicago</span><span>London</span><span>Tokyo</span></p>
            <h1 id="workspace-heading">Three desks. One launch ledger.</h1>
            <p>Decisions, delivery, time, weather, and reference rates—held in one operating view for the Atlas launch.</p>
          </div>

          <dl className="delivery-index" aria-label="Launch delivery status">
            <div><dt>Closed</dt><dd>{completed}<span>/{tasks.length}</span></dd></div>
            <div><dt>In motion</dt><dd>{activeCount}</dd></div>
            <div><dt>Delivery</dt><dd>{progress}<span>%</span></dd></div>
            <div className="delivery-progress" aria-hidden="true"><span style={{ transform: "scaleX(" + progress / 100 + ")" }} /></div>
          </dl>
        </section>

        <div className="map-legend" aria-label="Workspace map legend">
          <span><i className="legend-mark legend-work" /> Work ledger</span>
          <span><i className="legend-mark legend-live" /> Live public data</span>
          <span><i className="legend-mark legend-focus" /> Current focus</span>
        </div>

        <section className="operations-map" aria-label="Atlas launch operations map">
          <div className="map-board"><Board tasks={tasks} onChange={setTasks} /></div>
          <aside className="signal-rail" aria-label="Live planning signals">
            <FocusTimer task={activeTask} />
            <WeatherCard />
            <CurrencyCard />
          </aside>
        </section>
      </div>

      {commandOpen ? (
        <div className="command-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false); }}>
          <section className="command-menu" role="dialog" aria-modal="true" aria-labelledby="command-heading">
            <div className="command-field">
              <Command aria-hidden="true" />
              <label htmlFor="command-search" id="command-heading">Search Waypoint</label>
              <input ref={commandInput} id="command-search" value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Type a task or action…" />
              <button className="icon-button" type="button" onClick={() => setCommandOpen(false)} aria-label="Close command menu"><X aria-hidden="true" /></button>
            </div>
            <div className="command-results">
              <p>Suggested actions</p>
              {visibleCommands.map((item) => {
                const Icon = item.icon;
                return <button key={item.label} type="button" onClick={() => setCommandOpen(false)}><Icon aria-hidden="true" /><span><strong>{item.label}</strong><small>{item.detail}</small></span><Check aria-hidden="true" /></button>;
              })}
              {visibleCommands.length === 0 ? <div className="command-empty">No matching action. Try “board” or “settings”.</div> : null}
            </div>
            <footer className="command-footer"><span><kbd>esc</kbd> close</span><span><kbd>↵</kbd> open</span></footer>
          </section>
        </div>
      ) : null}
    </main>
  );
}`,
  },
  {
    path: "components/Board.tsx",
    language: "tsx",
    fullMatch: "",
    code: `import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, GripVertical, Plus, Search } from "lucide-react";

import type { Status, Task } from "../data/tasks";

const columns: { id: Status; label: string; note: string }[] = [
  { id: "backlog", label: "Ready", note: "Clear to start" },
  { id: "active", label: "In motion", note: "Work in progress" },
  { id: "done", label: "Shipped", note: "Closed this cycle" },
];

export function Board({ tasks, onChange }: { tasks: Task[]; onChange: (tasks: Task[]) => void }) {
  const [query, setQuery] = useState("");
  const [newTask, setNewTask] = useState("");
  const [activeColumn, setActiveColumn] = useState<Status>("backlog");
  const visibleTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? tasks.filter((task) => (task.title + " " + task.label).toLowerCase().includes(normalized)) : tasks;
  }, [query, tasks]);

  const move = (taskId: number, status: Status) => {
    onChange(tasks.map((task) => (task.id === taskId ? { ...task, status } : task)));
    setActiveColumn(status);
  };

  const addTask = (event: FormEvent) => {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    onChange(tasks.concat({ id: Date.now(), title, label: "New request", priority: "medium", owner: "YO", status: "backlog", estimate: "30m" }));
    setNewTask("");
    setActiveColumn("backlog");
  };

  const drop = (event: DragEvent<HTMLElement>, status: Status) => {
    event.preventDefault();
    const taskId = Number(event.dataTransfer.getData("text/task-id"));
    if (Number.isFinite(taskId)) move(taskId, status);
  };

  return (
    <section className="board" aria-labelledby="board-heading">
      <header className="board-header">
        <div><h2 id="board-heading">Delivery board</h2><p>Drag on desktop. Use move controls everywhere.</p></div>
        <label className="filter-field"><Search aria-hidden="true" /><span className="sr-only">Filter tasks</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find work" /></label>
      </header>

      <form className="quick-add" onSubmit={addTask}>
        <label><span>Next outcome</span><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Name the work that moves the launch…" /></label>
        <button type="submit" disabled={!newTask.trim()}><Plus aria-hidden="true" /> Add task</button>
      </form>

      <div className="mobile-column-tabs" role="group" aria-label="Board columns">
        {columns.map((column) => <button key={column.id} type="button" aria-pressed={activeColumn === column.id} onClick={() => setActiveColumn(column.id)}>{column.label}<span>{visibleTasks.filter((task) => task.status === column.id).length}</span></button>)}
      </div>

      <div className="board-columns">
        {columns.map((column, columnIndex) => {
          const items = visibleTasks.filter((task) => task.status === column.id);
          return (
            <section key={column.id} className={(activeColumn === column.id ? "board-column is-visible" : "board-column") + " column-" + column.id} aria-labelledby={column.id + "-heading"} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, column.id)}>
              <header><span className="column-signal" aria-hidden="true" /><div><h3 id={column.id + "-heading"}>{column.label}</h3><p>{column.note}</p></div><strong>{items.length}</strong></header>
              <div className="task-list">
                {items.map((task) => (
                  <article key={task.id} className="task-card" draggable onDragStart={(event) => event.dataTransfer.setData("text/task-id", String(task.id))}>
                    <div className="task-card-top"><span className={"priority priority-" + task.priority}>{task.priority}</span><GripVertical aria-hidden="true" /></div>
                    <h4>{task.title}</h4><p>{task.label}</p>
                    <footer><span className="owner">{task.owner}</span><span className="estimate">{task.estimate}</span><div className="move-controls">
                      {columnIndex > 0 ? <button type="button" onClick={() => move(task.id, columns[columnIndex - 1].id)} aria-label={"Move " + task.title + " left"}><ArrowLeft aria-hidden="true" /></button> : null}
                      {columnIndex < columns.length - 1 ? <button type="button" onClick={() => move(task.id, columns[columnIndex + 1].id)} aria-label={"Move " + task.title + " right"}><ArrowRight aria-hidden="true" /></button> : null}
                    </div></footer>
                  </article>
                ))}
                {items.length === 0 ? <div className="empty-column"><strong>No matching work.</strong><span>Change the filter or add an outcome.</span></div> : null}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}`,
  },
  {
    path: "components/FocusTimer.tsx",
    language: "tsx",
    fullMatch: "",
    code: `import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, TimerReset } from "lucide-react";

const SESSION_SECONDS = 25 * 60;

export function FocusTimer({ task }: { task: string }) {
  const [seconds, setSeconds] = useState(SESSION_SECONDS);
  const [running, setRunning] = useState(false);
  const endsAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const update = () => {
      if (endsAt.current === null) return;
      const next = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setSeconds(next);
      if (next === 0) setRunning(false);
    };
    const timer = window.setInterval(update, 250);
    update();
    return () => window.clearInterval(timer);
  }, [running]);

  const toggle = () => {
    if (running) {
      if (endsAt.current !== null) setSeconds(Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000)));
      setRunning(false);
      return;
    }
    endsAt.current = Date.now() + seconds * 1000;
    setRunning(true);
  };

  const reset = () => { setRunning(false); setSeconds(SESSION_SECONDS); endsAt.current = null; };
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  const progress = (SESSION_SECONDS - seconds) / SESSION_SECONDS;

  return (
    <section className="signal-card focus-card" aria-labelledby="focus-heading" data-state={running ? "active" : "ready"}>
      <header><span className="signal-icon"><TimerReset aria-hidden="true" /></span><div><h2 id="focus-heading">Current priority</h2><p>{running ? "Focus block running" : "25 minute focus block"}</p></div><span className="state-chip"><i />{running ? "Live" : "Ready"}</span></header>
      <p className="focus-task">{task}</p>
      <div className="timer-row"><p className="timer-value">{minutes}<span>:</span>{remainder}</p><div className="signal-actions"><button className="primary-icon-button" type="button" onClick={toggle} aria-label={running ? "Pause focus timer" : "Start focus timer"}>{running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button><button className="icon-button" type="button" onClick={reset} aria-label="Reset focus timer"><RotateCcw aria-hidden="true" /></button></div></div>
      <div className="timer-progress" aria-hidden="true"><span style={{ transform: "scaleX(" + progress + ")" }} /></div>
    </section>
  );
}`,
  },
  {
    path: "components/WeatherCard.tsx",
    language: "tsx",
    fullMatch: "",
    code: `import { useCallback, useEffect, useState } from "react";
import { CloudSun, RefreshCw, Wind } from "lucide-react";

import { fetchJsonWithRetry } from "../lib/public-api";

type Weather = { temperature: number; apparent: number; wind: number; code: number; high: number; low: number; unit: string; windUnit: string };
const sampleWeather: Weather = { temperature: 76, apparent: 78, wind: 9, code: 2, high: 82, low: 67, unit: "°F", windUnit: "mph" };
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function describe(code: number) { if (code === 0) return "Clear"; if (code <= 3) return "Partly cloudy"; if (code <= 48) return "Low visibility"; if (code <= 67) return "Rain nearby"; if (code <= 77) return "Snow nearby"; return "Showers possible"; }

export function WeatherCard() {
  const [weather, setWeather] = useState<Weather>(sampleWeather);
  const [state, setState] = useState<"loading" | "live" | "sample">("loading");
  const refresh = useCallback(async () => {
    setState("loading");
    try {
      const data = await fetchJsonWithRetry("https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=1");
      if (!isRecord(data) || !isRecord(data.current) || !isRecord(data.current_units) || !isRecord(data.daily) || !Array.isArray(data.daily.temperature_2m_max) || !Array.isArray(data.daily.temperature_2m_min)) throw new Error("Weather response changed");
      const current = data.current; const units = data.current_units; const daily = data.daily;
      if (typeof current.temperature_2m !== "number" || typeof current.apparent_temperature !== "number" || typeof current.weather_code !== "number" || typeof current.wind_speed_10m !== "number" || typeof daily.temperature_2m_max[0] !== "number" || typeof daily.temperature_2m_min[0] !== "number") throw new Error("Weather fields are unavailable");
      setWeather({ temperature: current.temperature_2m, apparent: current.apparent_temperature, wind: current.wind_speed_10m, code: current.weather_code, high: daily.temperature_2m_max[0], low: daily.temperature_2m_min[0], unit: typeof units.temperature_2m === "string" ? units.temperature_2m : "°F", windUnit: typeof units.wind_speed_10m === "string" ? units.wind_speed_10m : "mph" });
      setState("live");
    } catch { setWeather(sampleWeather); setState("sample"); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <section className="signal-card weather-card" aria-labelledby="weather-heading" data-state={state}>
      <header><span className="signal-icon"><CloudSun aria-hidden="true" /></span><div><h2 id="weather-heading">Chicago conditions</h2><p>{state === "sample" ? "Sample—API unavailable" : state === "loading" ? "Refreshing Open-Meteo…" : "Live from Open-Meteo"}</p></div><button className="icon-button refresh-button" type="button" onClick={() => void refresh()} aria-label="Refresh Chicago weather" data-state={state}><RefreshCw aria-hidden="true" /></button></header>
      <div className="weather-reading"><p>{Math.round(weather.temperature)}<span>{weather.unit}</span></p><dl><div><dt>High / low</dt><dd>{Math.round(weather.high)}° / {Math.round(weather.low)}°</dd></div><div><dt>Feels like</dt><dd>{Math.round(weather.apparent)}°</dd></div></dl></div>
      <footer><span>{describe(weather.code)}</span><span><Wind aria-hidden="true" />{Math.round(weather.wind)} {weather.windUnit}</span></footer>
    </section>
  );
}`,
  },
  {
    path: "components/CurrencyCard.tsx",
    language: "tsx",
    fullMatch: "",
    code: `import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, RefreshCw, TrendingUp } from "lucide-react";

import { fetchJsonWithRetry } from "../lib/public-api";

type Quote = "EUR" | "GBP" | "JPY";
type RateRow = { date: string; base: string; quote: string; rate: number };
const sampleRates: Record<Quote, number> = { EUR: 0.86, GBP: 0.74, JPY: 147.2 };
function isRateRow(value: unknown): value is RateRow { return typeof value === "object" && value !== null && typeof (value as RateRow).date === "string" && typeof (value as RateRow).base === "string" && typeof (value as RateRow).quote === "string" && typeof (value as RateRow).rate === "number"; }

export function CurrencyCard() {
  const [amount, setAmount] = useState("1000");
  const [quote, setQuote] = useState<Quote>("EUR");
  const [rates, setRates] = useState(sampleRates);
  const [rateDate, setRateDate] = useState("Reference rate");
  const [state, setState] = useState<"loading" | "live" | "sample">("loading");
  const refresh = useCallback(async () => {
    setState("loading");
    try {
      const data = await fetchJsonWithRetry("https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR,GBP,JPY");
      if (!Array.isArray(data)) throw new Error("Rate response changed");
      const rows = data.filter(isRateRow);
      if (rows.length < 3) throw new Error("Rate response changed");
      const next = { ...sampleRates };
      rows.forEach((row) => { if (row.quote === "EUR" || row.quote === "GBP" || row.quote === "JPY") next[row.quote] = row.rate; });
      setRates(next); setRateDate(rows[0]?.date ?? "Latest"); setState("live");
    } catch { setRates(sampleRates); setRateDate("Sample rate"); setState("sample"); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const converted = useMemo(() => { const numericAmount = Number(amount); return Number.isFinite(numericAmount) ? numericAmount * rates[quote] : 0; }, [amount, quote, rates]);

  return (
    <section className="signal-card currency-card" aria-labelledby="currency-heading" data-state={state}>
      <header><span className="signal-icon"><TrendingUp aria-hidden="true" /></span><div><h2 id="currency-heading">Currency reference</h2><p>{state === "sample" ? "Sample—API unavailable" : state === "loading" ? "Refreshing Frankfurter…" : rateDate + " · Frankfurter"}</p></div><button className="icon-button refresh-button" type="button" onClick={() => void refresh()} aria-label="Refresh exchange rates" data-state={state}><RefreshCw aria-hidden="true" /></button></header>
      <div className="conversion-inputs"><label><span>From USD</span><input aria-label="Amount in US dollars" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><ArrowRight aria-hidden="true" /><label><span>To</span><select aria-label="Target currency" value={quote} onChange={(event) => setQuote(event.target.value as Quote)}><option>EUR</option><option>GBP</option><option>JPY</option></select></label></div>
      <div className="conversion-result"><span>Reference value</span><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: quote, maximumFractionDigits: quote === "JPY" ? 0 : 2 }).format(converted)}</strong></div>
    </section>
  );
}`,
  },
  {
    path: "lib/public-api.ts",
    language: "ts",
    fullMatch: "",
    code: `const MAX_RETRIES = 1;
const REQUEST_TIMEOUT_MS = 6500;
function wait(milliseconds: number) { return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds)); }
function isJsonValue(value: unknown): boolean { if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return true; if (Array.isArray(value)) return value.every(isJsonValue); if (typeof value === "object") return Object.values(value).every(isJsonValue); return false; }
export async function fetchJsonWithRetry(url: string, attempt = 0): Promise<unknown> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("Public API returned HTTP " + response.status);
    const payload: unknown = await response.json();
    if (!isJsonValue(payload)) throw new Error("Public API returned invalid JSON");
    return payload;
  } catch (error) {
    if (attempt < MAX_RETRIES) { await wait(350 * (attempt + 1)); return fetchJsonWithRetry(url, attempt + 1); }
    throw error;
  } finally { window.clearTimeout(timeout); }
}`,
  },
  {
    path: "data/tasks.ts",
    language: "ts",
    fullMatch: "",
    code: `export type Status = "backlog" | "active" | "done";
export type Priority = "high" | "medium" | "low";
export type Task = { id: number; title: string; label: string; priority: Priority; owner: string; status: Status; estimate: string };
export const seedTasks: Task[] = [
  { id: 1, title: "Lock the launch narrative", label: "Go-to-market", priority: "high", owner: "DA", status: "backlog", estimate: "45m" },
  { id: 2, title: "Map partner handoff states", label: "Operations", priority: "medium", owner: "MS", status: "backlog", estimate: "30m" },
  { id: 3, title: "Prototype live API cards", label: "Product design", priority: "high", owner: "JL", status: "active", estimate: "1h" },
  { id: 4, title: "Verify mobile board controls", label: "Quality", priority: "medium", owner: "DA", status: "active", estimate: "25m" },
  { id: 5, title: "Publish pricing decision log", label: "Finance", priority: "low", owner: "MS", status: "done", estimate: "20m" },
  { id: 6, title: "Confirm launch-week owners", label: "Planning", priority: "medium", owner: "JL", status: "done", estimate: "15m" },
];`,
  },
  {
    path: "tokens.css",
    language: "css",
    fullMatch: "",
    code: `/* Hallmark · tokens · theme: Coral · paper: light · display: geometric-sans · accent: warm */
@import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap");
:root {
  --color-paper: oklch(97% 0.012 62);
  --color-paper-raised: oklch(99% 0.008 62);
  --color-paper-muted: oklch(94% 0.014 62);
  --color-ink: oklch(19% 0.018 45);
  --color-ink-soft: oklch(39% 0.018 45);
  --color-ink-muted: oklch(52% 0.016 45);
  --color-rule: oklch(84% 0.018 58);
  --color-rule-strong: oklch(69% 0.025 52);
  --color-accent: oklch(61% 0.19 31);
  --color-accent-dark: oklch(47% 0.16 31);
  --color-accent-soft: oklch(92% 0.045 31);
  --color-focus: oklch(48% 0.17 31);
  --color-positive: oklch(52% 0.12 154);
  --color-positive-soft: oklch(93% 0.035 154);
  --color-warning: oklch(62% 0.13 78);
  --color-warning-soft: oklch(94% 0.04 78);
  --color-info: oklch(52% 0.11 232);
  --color-info-soft: oklch(94% 0.03 232);
  --color-overlay: oklch(19% 0.018 45 / 0.52);
  --color-selection: oklch(61% 0.19 31 / 0.2);
  --font-display: "Geist", "Avenir Next", sans-serif;
  --font-body: "Geist", "Avenir Next", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
  --space-3xs: 0.125rem;
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;
  --text-xs: 0.7rem;
  --text-sm: 0.82rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.75rem;
  --text-display: clamp(2.4rem, 5vw, 4.8rem);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;
  --rule-hairline: 1px;
  --rule-strong: 2px;
  --radius-xs: 0.25rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.875rem;
  --radius-pill: 999px;
  --shadow-whisper: 0 1px 2px oklch(19% 0.018 45 / 0.06);
  --z-sticky: 200;
  --z-modal: 400;
}`,
  },
  {
    path: "styles.css",
    language: "css",
    fullMatch: "",
    code: `/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Map / Diagram · genre: modern-minimal · theme: Coral · tone: technical editorial · anchor hue: coral · nav: N13 · footer: none · enrichment: none */
@import "./tokens.css";
* { box-sizing: border-box; }
html, body { overflow-x: clip; background: var(--color-paper); }
body { margin: 0; min-width: 0; color: var(--color-ink); font-family: var(--font-body); font-size: var(--text-base); }
button, input, select { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; }
svg { width: 1em; height: 1em; stroke-width: 1.8; }
::selection { background: var(--color-selection); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

.workspace-shell { min-height: 100vh; background: var(--color-paper); }
.topbar { position: sticky; top: 0; z-index: var(--z-sticky); display: grid; grid-template-columns: minmax(12rem, .8fr) minmax(18rem, 1.2fr) minmax(12rem, .8fr); align-items: center; gap: var(--space-lg); min-height: 4.5rem; padding: var(--space-sm) var(--space-lg); border-bottom: var(--rule-hairline) solid var(--color-rule); background: var(--color-paper-raised); }
.wordmark { display: inline-flex; align-items: center; gap: var(--space-sm); width: fit-content; color: var(--color-ink); text-decoration: none; white-space: nowrap; }
.wordmark-mark { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border-radius: 50%; background: var(--color-ink); color: var(--color-paper-raised); font-family: var(--font-mono); font-size: var(--text-sm); font-weight: 600; }
.wordmark strong, .wordmark small { display: block; }
.wordmark strong { font-family: var(--font-display); font-size: var(--text-sm); letter-spacing: -0.02em; }
.wordmark small { margin-top: var(--space-3xs); color: var(--color-ink-muted); font-size: var(--text-xs); }
.command-pill { justify-self: center; display: flex; width: min(100%, 28rem); min-height: 2.75rem; align-items: center; gap: var(--space-sm); padding: 0 var(--space-xs) 0 var(--space-md); border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-pill); background: var(--color-paper); color: var(--color-ink-muted); text-align: left; transition: transform var(--dur-micro) var(--ease-out), border-color var(--dur-short) var(--ease-out); }
.command-pill:hover { border-color: var(--color-rule-strong); transform: translateY(-1px); }
.command-pill:active { transform: translateY(0); }
.command-pill span { flex: 1; white-space: nowrap; }
.command-pill kbd, .command-footer kbd { border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-xs); background: var(--color-paper-raised); padding: var(--space-2xs) var(--space-xs); color: var(--color-ink-soft); font-family: var(--font-mono); font-size: var(--text-xs); }
.topbar-actions { display: flex; align-items: center; justify-content: flex-end; gap: var(--space-sm); }
.presence { display: flex; padding-left: var(--space-xs); }
.presence span { display: grid; width: 2rem; height: 2rem; place-items: center; margin-left: calc(var(--space-xs) * -1); border: var(--rule-strong) solid var(--color-paper-raised); border-radius: 50%; background: var(--color-paper-muted); color: var(--color-ink-soft); font-family: var(--font-mono); font-size: var(--text-xs); }
.sync-state { display: inline-flex; align-items: center; gap: var(--space-xs); color: var(--color-positive); font-size: var(--text-sm); white-space: nowrap; }
.icon-button, .primary-icon-button { display: grid; width: 2.75rem; height: 2.75rem; place-items: center; border-radius: 50%; transition: transform var(--dur-micro) var(--ease-out), background-color var(--dur-short) var(--ease-out), color var(--dur-short) var(--ease-out); }
.icon-button { border: var(--rule-hairline) solid var(--color-rule); background: var(--color-paper-raised); color: var(--color-ink-soft); }
.icon-button:hover { background: var(--color-paper-muted); color: var(--color-ink); transform: translateY(-1px); }
.icon-button:active, .primary-icon-button:active { transform: translateY(0); }
.primary-icon-button { border: var(--rule-hairline) solid var(--color-ink); background: var(--color-ink); color: var(--color-paper-raised); }
.primary-icon-button:hover { background: var(--color-accent-dark); border-color: var(--color-accent-dark); transform: translateY(-1px); }
.notification-dot { position: absolute; width: .4rem; height: .4rem; margin: -1.2rem 0 0 1.1rem; border: var(--rule-hairline) solid var(--color-paper-raised); border-radius: 50%; background: var(--color-accent); }

.workspace { width: min(100%, 108rem); margin: 0 auto; padding: var(--space-xl) var(--space-lg) var(--space-2xl); }
.orientation { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(20rem, .55fr); gap: var(--space-2xl); align-items: end; padding: var(--space-lg) 0 var(--space-xl); border-bottom: var(--rule-hairline) solid var(--color-rule-strong); }
.orientation-copy { min-width: 0; }
.route-line { display: flex; align-items: center; gap: var(--space-sm); margin: 0 0 var(--space-lg); color: var(--color-ink-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
.route-line span { display: inline-flex; align-items: center; gap: var(--space-sm); white-space: nowrap; }
.route-line span:not(:last-child)::after { content: "→"; color: var(--color-accent); }
.orientation h1 { max-width: 15ch; min-width: 0; margin: 0; font-family: var(--font-display); font-size: var(--text-display); font-style: normal; font-weight: 700; line-height: .96; letter-spacing: -.055em; overflow-wrap: anywhere; }
.orientation-copy > p:last-child { max-width: 62ch; margin: var(--space-lg) 0 0; color: var(--color-ink-soft); line-height: 1.65; }
.delivery-index { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0; border-top: var(--rule-hairline) solid var(--color-rule); border-bottom: var(--rule-hairline) solid var(--color-rule); }
.delivery-index div:not(.delivery-progress) { min-width: 0; padding: var(--space-md); border-left: var(--rule-hairline) solid var(--color-rule); }
.delivery-index div:first-child { border-left: 0; }
.delivery-index dt { color: var(--color-ink-muted); font-size: var(--text-xs); }
.delivery-index dd { margin: var(--space-xs) 0 0; font-family: var(--font-mono); font-size: var(--text-xl); font-weight: 600; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.delivery-index dd span { color: var(--color-ink-muted); font-size: var(--text-sm); }
.delivery-progress { grid-column: 1 / -1; height: var(--space-2xs); overflow: hidden; background: var(--color-paper-muted); }
.delivery-progress span, .timer-progress span { display: block; width: 100%; height: 100%; transform-origin: left center; background: var(--color-accent); transition: transform var(--dur-long) var(--ease-out); }
.map-legend { display: flex; flex-wrap: wrap; gap: var(--space-lg); padding: var(--space-md) 0; color: var(--color-ink-muted); font-size: var(--text-xs); }
.map-legend span { display: inline-flex; align-items: center; gap: var(--space-xs); white-space: nowrap; }
.legend-mark { width: .5rem; height: .5rem; border-radius: 50%; background: var(--color-ink-soft); }
.legend-live { background: var(--color-info); }
.legend-focus { background: var(--color-accent); }
.operations-map { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(18rem, 23rem); gap: var(--space-lg); min-width: 0; }
.operations-map::after { content: ""; position: absolute; top: var(--space-xl); right: calc(23rem + var(--space-sm)); bottom: var(--space-xl); border-left: var(--rule-hairline) dashed var(--color-rule-strong); pointer-events: none; }
.map-board, .signal-rail { min-width: 0; }
.signal-rail { display: grid; align-content: start; gap: var(--space-md); }

.board { min-width: 0; border-top: var(--rule-strong) solid var(--color-ink); background: var(--color-paper-raised); box-shadow: var(--shadow-whisper); }
.board-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-lg); padding: var(--space-lg); border-bottom: var(--rule-hairline) solid var(--color-rule); }
.board h2, .signal-card h2 { margin: 0; font-family: var(--font-display); font-style: normal; font-weight: 700; letter-spacing: -.025em; }
.board h2 { font-size: var(--text-lg); }
.board-header p, .signal-card header p { margin: var(--space-2xs) 0 0; color: var(--color-ink-muted); font-size: var(--text-xs); line-height: 1.5; }
.filter-field { position: relative; display: flex; align-items: center; min-width: 13rem; }
.filter-field svg { position: absolute; left: var(--space-sm); color: var(--color-ink-muted); }
.filter-field input { width: 100%; min-height: 2.75rem; padding: 0 var(--space-md) 0 2.25rem; border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-pill); background: var(--color-paper); color: var(--color-ink); }
.quick-add { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: var(--space-sm); padding: var(--space-sm) var(--space-lg); border-bottom: var(--rule-hairline) solid var(--color-rule); background: var(--color-paper-muted); }
.quick-add label, .conversion-inputs label { display: grid; gap: var(--space-2xs); color: var(--color-ink-muted); font-size: var(--text-xs); }
.quick-add input { width: 100%; min-height: 2.75rem; border: 0; border-bottom: var(--rule-hairline) solid var(--color-rule-strong); background: transparent; color: var(--color-ink); }
.quick-add button { display: inline-flex; min-height: 2.75rem; align-items: center; gap: var(--space-xs); padding: 0 var(--space-md); border: var(--rule-hairline) solid var(--color-ink); border-radius: var(--radius-pill); background: var(--color-ink); color: var(--color-paper-raised); font-weight: 600; white-space: nowrap; transition: transform var(--dur-micro) var(--ease-out), background-color var(--dur-short) var(--ease-out); }
.quick-add button:hover { background: var(--color-accent-dark); transform: translateY(-1px); }
.quick-add button:active { transform: translateY(0); }
.quick-add button:disabled { border-color: var(--color-rule); background: var(--color-rule); color: var(--color-ink-muted); transform: none; }
.mobile-column-tabs { display: none; }
.board-columns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); min-width: 0; }
.board-column { min-width: 0; min-height: 32rem; padding: var(--space-md); border-left: var(--rule-hairline) solid var(--color-rule); background: var(--color-paper); }
.board-column:first-child { border-left: 0; }
.board-column > header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-sm); padding: 0 var(--space-2xs) var(--space-md); }
.column-signal { width: .55rem; height: .55rem; border-radius: 50%; background: var(--color-ink-muted); }
.column-active .column-signal { background: var(--color-accent); }
.column-done .column-signal { background: var(--color-positive); }
.board-column h3 { margin: 0; font-size: var(--text-sm); }
.board-column header p { margin: var(--space-3xs) 0 0; color: var(--color-ink-muted); font-size: var(--text-xs); }
.board-column header strong { display: grid; width: 1.75rem; height: 1.75rem; place-items: center; border: var(--rule-hairline) solid var(--color-rule); border-radius: 50%; font-family: var(--font-mono); font-size: var(--text-xs); }
.task-list { display: grid; gap: var(--space-sm); }
.task-card { padding: var(--space-md); border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-sm); background: var(--color-paper-raised); transition: transform var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out); }
.task-card:hover, .task-card:focus-within { border-color: var(--color-rule-strong); transform: translateY(-2px); }
.task-card:active { transform: translateY(0); }
.task-card-top, .task-card footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-xs); }
.task-card-top > svg { color: var(--color-ink-muted); cursor: grab; }
.priority { padding: var(--space-2xs) var(--space-xs); border-radius: var(--radius-pill); font-family: var(--font-mono); font-size: var(--text-xs); }
.priority-high { background: var(--color-accent-soft); color: var(--color-accent-dark); }
.priority-medium { background: var(--color-warning-soft); color: var(--color-ink-soft); }
.priority-low { background: var(--color-paper-muted); color: var(--color-ink-soft); }
.task-card h4 { min-height: 2.8em; margin: var(--space-md) 0 var(--space-2xs); font-size: var(--text-sm); line-height: 1.4; }
.task-card > p { margin: 0; color: var(--color-ink-muted); font-size: var(--text-xs); }
.task-card footer { margin-top: var(--space-md); padding-top: var(--space-sm); border-top: var(--rule-hairline) solid var(--color-rule); }
.owner { display: grid; width: 1.75rem; height: 1.75rem; place-items: center; border-radius: 50%; background: var(--color-ink); color: var(--color-paper-raised); font-family: var(--font-mono); font-size: var(--text-xs); }
.estimate { margin-right: auto; color: var(--color-ink-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
.move-controls { display: flex; gap: var(--space-2xs); }
.move-controls button { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border: 0; border-radius: 50%; background: transparent; color: var(--color-ink-muted); }
.move-controls button:hover { background: var(--color-paper-muted); color: var(--color-ink); }
.empty-column { display: grid; min-height: 8rem; place-content: center; gap: var(--space-xs); border: var(--rule-hairline) dashed var(--color-rule-strong); color: var(--color-ink-muted); text-align: center; }
.empty-column strong { color: var(--color-ink-soft); font-size: var(--text-sm); }
.empty-column span { font-size: var(--text-xs); }

.signal-card { position: relative; padding: var(--space-lg); border-top: var(--rule-strong) solid var(--color-ink); background: var(--color-paper-raised); box-shadow: var(--shadow-whisper); }
.signal-card > header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-sm); }
.signal-card h2 { font-size: var(--text-sm); }
.signal-icon { display: grid; width: 2.25rem; height: 2.25rem; place-items: center; border-radius: 50%; background: var(--color-paper-muted); color: var(--color-ink-soft); }
.state-chip { display: inline-flex; align-items: center; gap: var(--space-xs); color: var(--color-ink-muted); font-family: var(--font-mono); font-size: var(--text-xs); white-space: nowrap; }
.state-chip i { width: .45rem; height: .45rem; border-radius: 50%; background: var(--color-rule-strong); }
.focus-card[data-state="active"] .state-chip { color: var(--color-accent-dark); }
.focus-card[data-state="active"] .state-chip i { background: var(--color-accent); }
.focus-task { min-height: 3.2rem; margin: var(--space-lg) 0; font-size: var(--text-base); font-weight: 600; line-height: 1.5; }
.timer-row, .weather-reading, .weather-card footer { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-md); }
.timer-value { margin: 0; font-family: var(--font-mono); font-size: clamp(2rem, 4vw, 3.25rem); font-weight: 600; letter-spacing: -.08em; font-variant-numeric: tabular-nums; }
.timer-value span { color: var(--color-accent); }
.signal-actions { display: flex; gap: var(--space-xs); }
.timer-progress { height: var(--space-2xs); margin-top: var(--space-lg); overflow: hidden; background: var(--color-paper-muted); }
.weather-card { border-top-color: var(--color-info); }
.weather-reading { margin-top: var(--space-xl); }
.weather-reading > p { margin: 0; font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 700; letter-spacing: -.07em; line-height: 1; font-variant-numeric: tabular-nums; }
.weather-reading > p span { margin-left: var(--space-2xs); color: var(--color-info); font-size: var(--text-base); }
.weather-reading dl { display: grid; gap: var(--space-xs); margin: 0; text-align: right; }
.weather-reading dl div { display: grid; gap: var(--space-3xs); }
.weather-reading dt { color: var(--color-ink-muted); font-size: var(--text-xs); }
.weather-reading dd { margin: 0; font-family: var(--font-mono); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }
.weather-card footer { align-items: center; margin-top: var(--space-lg); padding-top: var(--space-sm); border-top: var(--rule-hairline) solid var(--color-rule); color: var(--color-ink-soft); font-size: var(--text-xs); }
.weather-card footer span:last-child { display: inline-flex; align-items: center; gap: var(--space-xs); }
.refresh-button[data-state="loading"] svg { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.currency-card { border-top-color: var(--color-positive); }
.conversion-inputs { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: end; gap: var(--space-xs); margin-top: var(--space-lg); }
.conversion-inputs > svg { margin-bottom: var(--space-sm); color: var(--color-ink-muted); }
.conversion-inputs input, .conversion-inputs select { width: 100%; min-height: 2.75rem; padding: 0 var(--space-sm); border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-xs); background: var(--color-paper); color: var(--color-ink); font-family: var(--font-mono); font-size: var(--text-sm); }
.conversion-result { display: grid; gap: var(--space-xs); margin-top: var(--space-md); padding: var(--space-md); background: var(--color-positive-soft); }
.conversion-result span { color: var(--color-ink-muted); font-size: var(--text-xs); }
.conversion-result strong { font-family: var(--font-mono); font-size: var(--text-lg); font-variant-numeric: tabular-nums; }

.command-layer { position: fixed; inset: 0; z-index: var(--z-modal); display: grid; place-items: start center; padding: 12vh var(--space-md) var(--space-md); background: var(--color-overlay); animation: layer-in var(--dur-short) var(--ease-out) both; }
.command-menu { width: min(100%, 38rem); overflow: hidden; border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-md); background: var(--color-paper-raised); box-shadow: var(--shadow-whisper); animation: menu-in var(--dur-short) var(--ease-out) both; }
.command-field { display: grid; grid-template-columns: auto auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-sm); padding: var(--space-md); border-bottom: var(--rule-hairline) solid var(--color-rule); }
.command-field label { color: var(--color-ink-muted); font-size: var(--text-xs); white-space: nowrap; }
.command-field input { min-width: 0; min-height: 2.75rem; border: 0; background: transparent; color: var(--color-ink); outline: 0; }
.command-results { padding: var(--space-sm); }
.command-results > p { margin: var(--space-xs) var(--space-sm); color: var(--color-ink-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
.command-results > button { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-sm); width: 100%; min-height: 3.75rem; padding: var(--space-sm); border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-ink); text-align: left; }
.command-results > button:hover, .command-results > button:focus-visible { background: var(--color-paper-muted); }
.command-results > button span, .command-results > button strong, .command-results > button small { display: block; min-width: 0; }
.command-results > button strong { font-size: var(--text-sm); }
.command-results > button small { margin-top: var(--space-2xs); color: var(--color-ink-muted); font-size: var(--text-xs); }
.command-results > button > svg:last-child { color: var(--color-accent); opacity: 0; }
.command-results > button:hover > svg:last-child, .command-results > button:focus-visible > svg:last-child { opacity: 1; }
.command-empty { padding: var(--space-xl) var(--space-md); color: var(--color-ink-muted); text-align: center; }
.command-footer { display: flex; justify-content: flex-end; gap: var(--space-lg); padding: var(--space-sm) var(--space-md); border-top: var(--rule-hairline) solid var(--color-rule); color: var(--color-ink-muted); font-size: var(--text-xs); }
@keyframes layer-in { from { opacity: 0; } }
@keyframes menu-in { from { opacity: 0; transform: translateY(-.5rem) scale(.98); } }

button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible { outline: var(--rule-strong) solid var(--color-focus); outline-offset: var(--space-2xs); }
input:hover, select:hover { border-color: var(--color-rule-strong); }
input:disabled, select:disabled { background: var(--color-paper-muted); color: var(--color-ink-muted); cursor: not-allowed; }
[data-state="sample"] .refresh-button { color: var(--color-warning); }
[data-state="live"] .refresh-button { color: var(--color-positive); }

@media (max-width: 78rem) {
  .orientation { grid-template-columns: minmax(0, 1fr) minmax(18rem, .65fr); gap: var(--space-xl); }
  .operations-map { grid-template-columns: minmax(0, 1fr); }
  .operations-map::after { display: none; }
  .signal-rail { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 56rem) {
  .topbar { grid-template-columns: minmax(0, 1fr) auto; }
  .command-pill { grid-column: 1 / -1; grid-row: 2; justify-self: stretch; width: 100%; }
  .orientation { grid-template-columns: minmax(0, 1fr); }
  .delivery-index { max-width: 34rem; }
  .signal-rail { grid-template-columns: minmax(0, 1fr); }
  .board-columns { grid-template-columns: minmax(0, 1fr); }
  .board-column { display: none; min-height: 24rem; border-left: 0; }
  .board-column.is-visible { display: block; }
  .mobile-column-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-bottom: var(--rule-hairline) solid var(--color-rule); }
  .mobile-column-tabs button { display: flex; min-width: 0; min-height: 3rem; align-items: center; justify-content: center; gap: var(--space-xs); border: 0; border-left: var(--rule-hairline) solid var(--color-rule); background: var(--color-paper-raised); color: var(--color-ink-muted); font-size: var(--text-xs); white-space: nowrap; }
  .mobile-column-tabs button:first-child { border-left: 0; }
  .mobile-column-tabs button[aria-pressed="true"] { background: var(--color-accent-soft); color: var(--color-accent-dark); }
  .mobile-column-tabs span { font-family: var(--font-mono); }
}
@media (max-width: 40rem) {
  .topbar { padding: var(--space-sm) var(--space-md); }
  .wordmark small, .sync-state, .presence { display: none; }
  .command-pill span { overflow: hidden; text-overflow: ellipsis; }
  .workspace { padding: var(--space-lg) var(--space-md) var(--space-xl); }
  .orientation { padding-top: var(--space-md); }
  .orientation h1 { font-size: clamp(2.35rem, 13vw, 3.5rem); }
  .orientation-copy > p:last-child { font-size: var(--text-sm); }
  .route-line { gap: var(--space-xs); }
  .delivery-index { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .delivery-index div:not(.delivery-progress) { padding: var(--space-sm) var(--space-xs); }
  .delivery-index dd { font-size: var(--text-lg); }
  .map-legend { gap: var(--space-sm); }
  .board-header { align-items: stretch; flex-direction: column; }
  .filter-field { min-width: 0; width: 100%; }
  .quick-add { grid-template-columns: minmax(0, 1fr); }
  .quick-add button { justify-content: center; }
  .task-card { padding: var(--space-sm); }
  .signal-card { padding: var(--space-md); }
  .conversion-inputs { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); }
  .command-layer { align-items: stretch; padding: 0; }
  .command-menu { width: 100%; min-height: 100svh; border: 0; border-radius: 0; }
  .command-field { grid-template-columns: auto minmax(0, 1fr) auto; }
  .command-field label { display: none; }
  .command-footer { margin-top: auto; }
}
@media (max-width: 23.5rem) {
  .topbar-actions .icon-button { display: none; }
  .route-line span { font-size: .65rem; }
  .map-legend span { font-size: .65rem; }
  .conversion-inputs { grid-template-columns: minmax(0, 1fr); }
  .conversion-inputs > svg { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 150ms !important; animation-iteration-count: 1 !important; transition-duration: 150ms !important; }
  .refresh-button[data-state="loading"] svg { animation-duration: 1.4s !important; animation-iteration-count: infinite !important; }
}`,
  },
];
