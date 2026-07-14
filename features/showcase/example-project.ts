import type { GeneratedFile } from "@/lib/generated-files";

export const EXAMPLE_PROJECT_PROMPT =
  "Build a premium global delivery workspace with an interactive Kanban board, an active-task focus timer, live Chicago weather, and reference currency conversion powered by public APIs.";

export const EXAMPLE_PROJECT_PLAN = [
  "Create a responsive command-center layout with an icon rail, delivery board, and contextual live-data column.",
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
    code: `import { useMemo, useState } from "react";
import { Bell, Command, LayoutDashboard, Search, Settings2, Sparkles, Users } from "lucide-react";

import { Board } from "./components/Board";
import { CurrencyCard } from "./components/CurrencyCard";
import { FocusTimer } from "./components/FocusTimer";
import { WeatherCard } from "./components/WeatherCard";
import { seedTasks, type Task } from "./data/tasks";
import "./styles.css";

const navItems = [
  { label: "Delivery board", icon: LayoutDashboard, active: true },
  { label: "Team", icon: Users },
  { label: "Automations", icon: Sparkles },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const completed = useMemo(
    () => tasks.filter((task) => task.status === "done").length,
    [tasks],
  );
  const activeTask = tasks.find((task) => task.status === "active")?.title ?? "Plan the next milestone";

  return (
    <main className="min-h-screen bg-[#eef2f7] text-[#111827]">
      <div className="mx-auto min-h-screen max-w-[1600px] lg:grid lg:grid-cols-[72px_minmax(0,1fr)]">
        <aside className="flex items-center justify-between bg-[#111a2c] px-4 py-3 text-white lg:flex-col lg:px-0 lg:py-5">
          <button aria-label="Open command menu" className="grid size-10 place-items-center rounded-2xl bg-white text-[#111a2c] shadow-lg shadow-black/20 transition hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#8aa3ff]">
            <Command className="size-5" />
          </button>
          <nav aria-label="Workspace" className="flex gap-2 lg:flex-col">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  aria-label={item.label}
                  aria-current={item.active ? "page" : undefined}
                  className={"grid size-10 place-items-center rounded-xl transition focus:outline-none focus:ring-2 focus:ring-[#8aa3ff] " + (item.active ? "bg-[#3157d5] text-white shadow-lg shadow-[#3157d5]/30" : "text-slate-400 hover:bg-white/10 hover:text-white")}
                >
                  <Icon className="size-[18px]" />
                </button>
              );
            })}
          </nav>
          <button aria-label="Workspace settings" className="hidden size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#8aa3ff] lg:grid">
            <Settings2 className="size-[18px]" />
          </button>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur md:px-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2" aria-label="Three teammates online">
                  {["DA", "MS", "JL"].map((initials, index) => (
                    <span key={initials} className={"grid size-8 place-items-center rounded-full border-2 border-white text-[10px] font-bold " + ["bg-[#dbeafe] text-[#1d4ed8]", "bg-[#fef3c7] text-[#b45309]", "bg-[#d1fae5] text-[#047857]"][index]}>{initials}</span>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3157d5]">Waypoint / Atlas launch</p>
                  <p className="text-sm font-semibold text-slate-900">Tuesday delivery desk</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="relative hidden sm:block">
                  <span className="sr-only">Search workspace</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input className="h-10 w-48 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#3157d5] focus:bg-white focus:ring-4 focus:ring-[#3157d5]/10" placeholder="Search workspace" />
                </label>
                <button aria-label="Notifications" className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#3157d5]/10">
                  <Bell className="size-[18px]" />
                  <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#f36b5b] ring-2 ring-white" />
                </button>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6">
            <section className="mb-5 flex flex-col gap-4 rounded-[24px] bg-[#111a2c] px-5 py-5 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.75)] sm:flex-row sm:items-end sm:justify-between md:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8aa3ff]">Launch window · 18 days</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Move the work that unlocks the week.</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">A shared operating view for the product team across Chicago, London, and Tokyo.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-semibold tabular-nums">{completed}/{tasks.length}</p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">closed this cycle</p>
                </div>
                <div className="h-10 w-px bg-white/15" />
                <div className="size-12 rounded-full p-1" style={{ background: "conic-gradient(#8aa3ff " + Math.round((completed / Math.max(tasks.length, 1)) * 100) + "%, rgba(255,255,255,.12) 0)" }}>
                  <div className="grid size-full place-items-center rounded-full bg-[#111a2c] text-[10px] font-bold">{Math.round((completed / Math.max(tasks.length, 1)) * 100)}%</div>
                </div>
              </div>
            </section>

            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <Board tasks={tasks} onChange={setTasks} />
              <aside aria-label="Live planning context" className="day-pulse relative grid gap-4 pl-5 sm:grid-cols-3 lg:grid-cols-1">
                <FocusTimer task={activeTask} />
                <WeatherCard />
                <CurrencyCard />
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}`,
  },
  {
    path: "components/Board.tsx",
    language: "tsx",
    fullMatch: "",
    code: `import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Filter, GripVertical, Plus, Search, Sparkles } from "lucide-react";

import type { Status, Task } from "../data/tasks";

const columns: { id: Status; label: string; note: string; color: string }[] = [
  { id: "backlog", label: "Ready", note: "Clear to start", color: "#8b5cf6" },
  { id: "active", label: "In motion", note: "Work in progress", color: "#3157d5" },
  { id: "done", label: "Shipped", note: "Closed this cycle", color: "#18a77b" },
];

const priorityStyles = {
  high: "bg-rose-50 text-rose-700 ring-rose-600/10",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/10",
  low: "bg-slate-100 text-slate-600 ring-slate-500/10",
};

export function Board({ tasks, onChange }: { tasks: Task[]; onChange: (tasks: Task[]) => void }) {
  const [query, setQuery] = useState("");
  const [newTask, setNewTask] = useState("");
  const visibleTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? tasks.filter((task) => (task.title + " " + task.label).toLowerCase().includes(normalized)) : tasks;
  }, [query, tasks]);

  const move = (taskId: number, status: Status) => {
    onChange(tasks.map((task) => (task.id === taskId ? { ...task, status } : task)));
  };

  const addTask = (event: FormEvent) => {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    onChange(tasks.concat({ id: Date.now(), title, label: "New request", priority: "medium", owner: "You", status: "backlog", estimate: "30m" }));
    setNewTask("");
  };

  const drop = (event: DragEvent<HTMLElement>, status: Status) => {
    event.preventDefault();
    const taskId = Number(event.dataTransfer.getData("text/task-id"));
    if (Number.isFinite(taskId)) move(taskId, status);
  };

  return (
    <section aria-labelledby="board-heading" className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.55)] md:p-5">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="board-heading" className="text-lg font-semibold tracking-[-0.02em] text-slate-950">Delivery board</h2>
            <span className="rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10px] font-bold text-[#3157d5]">{tasks.length} work items</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Drag work between stages or use the arrow controls.</p>
        </div>
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1 sm:w-44 sm:flex-none">
            <span className="sr-only">Filter tasks</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input aria-label="Filter tasks" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs outline-none transition focus:border-[#3157d5] focus:bg-white focus:ring-4 focus:ring-[#3157d5]/10" placeholder="Filter tasks" />
          </label>
          <button aria-label="Board filters" className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#3157d5]/10"><Filter className="size-4" /></button>
        </div>
      </div>

      <form onSubmit={addTask} className="my-4 flex gap-2 rounded-2xl bg-[#f7f8fb] p-2">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#3157d5] shadow-sm"><Sparkles className="size-4" /></div>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Add a task</span>
          <input aria-label="Add a task" value={newTask} onChange={(event) => setNewTask(event.target.value)} className="h-9 w-full bg-transparent px-1 text-sm outline-none placeholder:text-slate-400" placeholder="Capture the next outcome…" />
        </label>
        <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#111a2c] px-3 text-xs font-semibold text-white transition hover:bg-[#1d2940] focus:outline-none focus:ring-4 focus:ring-[#3157d5]/20"><Plus className="size-3.5" /> Add</button>
      </form>

      <div className="grid gap-3 lg:grid-cols-3">
        {columns.map((column, columnIndex) => {
          const items = visibleTasks.filter((task) => task.status === column.id);
          return (
            <section
              key={column.id}
              aria-labelledby={column.id + "-heading"}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => drop(event, column.id)}
              className="min-h-[390px] rounded-2xl border border-slate-200/80 bg-[#f7f8fb] p-3 transition hover:border-slate-300"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: column.color }} />
                  <div>
                    <h3 id={column.id + "-heading"} className="text-xs font-bold text-slate-900">{column.label}</h3>
                    <p className="text-[10px] text-slate-400">{column.note}</p>
                  </div>
                </div>
                <span className="grid size-6 place-items-center rounded-lg bg-white text-[10px] font-bold text-slate-500 shadow-sm">{items.length}</span>
              </div>

              <div className="space-y-2.5">
                {items.map((task) => (
                  <article
                    key={task.id}
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData("text/task-id", String(task.id))}
                    className="group rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.55)] transition duration-200 hover:-translate-y-0.5 hover:border-[#3157d5]/30 hover:shadow-[0_16px_32px_-20px_rgba(49,87,213,0.32)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={"rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ring-1 ring-inset " + priorityStyles[task.priority]}>{task.priority}</span>
                      <GripVertical className="size-4 cursor-grab text-slate-300 transition group-hover:text-slate-500" aria-hidden="true" />
                    </div>
                    <h4 className="mt-3 text-[13px] font-semibold leading-5 text-slate-900">{task.title}</h4>
                    <p className="mt-1 text-[10px] font-medium text-slate-400">{task.label}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded-full bg-[#111a2c] text-[8px] font-bold text-white">{task.owner}</span>
                        <span className="text-[10px] font-medium text-slate-400">{task.estimate}</span>
                      </div>
                      <div className="flex gap-1">
                        {columnIndex > 0 ? <button onClick={() => move(task.id, columns[columnIndex - 1].id)} aria-label={"Move " + task.title + " left"} className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3157d5]"><ArrowLeft className="size-3.5" /></button> : null}
                        {columnIndex < columns.length - 1 ? <button onClick={() => move(task.id, columns[columnIndex + 1].id)} aria-label={"Move " + task.title + " right"} className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3157d5]"><ArrowRight className="size-3.5" /></button> : null}
                      </div>
                    </div>
                  </article>
                ))}
                {items.length === 0 ? <div className="grid min-h-28 place-items-center rounded-2xl border border-dashed border-slate-300 px-4 text-center text-xs leading-5 text-slate-400">Drop work here</div> : null}
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

  const reset = () => {
    setRunning(false);
    setSeconds(SESSION_SECONDS);
    endsAt.current = null;
  };

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  const progress = ((SESSION_SECONDS - seconds) / SESSION_SECONDS) * 100;

  return (
    <section aria-labelledby="focus-heading" className="overflow-hidden rounded-[22px] bg-[#3157d5] p-4 text-white shadow-[0_20px_45px_-30px_rgba(49,87,213,0.8)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-white/12"><TimerReset className="size-4" /></span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#cad5ff]">Focus block</p>
            <h2 id="focus-heading" className="text-xs font-semibold">Current priority</h2>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#cad5ff]"><span className={"size-1.5 rounded-full " + (running ? "animate-pulse bg-emerald-300" : "bg-white/40")} />{running ? "Live" : "Ready"}</span>
      </div>
      <p className="mt-4 line-clamp-2 min-h-10 text-sm font-medium leading-5">{task}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="rounded-2xl bg-[#2547ba] px-4 py-3 shadow-inner shadow-black/10">
          <p className="font-mono text-[30px] font-semibold leading-none tracking-[-0.06em] tabular-nums">{minutes}<span className="text-[#9fb3ff]">:</span>{remainder}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggle} aria-label={running ? "Pause focus timer" : "Start focus timer"} className="grid size-11 place-items-center rounded-2xl bg-white text-[#3157d5] shadow-lg shadow-black/10 transition hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#3157d5]">{running ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}</button>
          <button onClick={reset} aria-label="Reset focus timer" className="grid size-11 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"><RotateCcw className="size-4" /></button>
        </div>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-white transition-[width] duration-300" style={{ width: progress + "%" }} /></div>
    </section>
  );
}`,
  },
  {
    path: "components/WeatherCard.tsx",
    language: "tsx",
    fullMatch: "",
    code: `import { useCallback, useEffect, useState } from "react";
import { CloudSun, Droplets, RefreshCw, Wind } from "lucide-react";

import { fetchJsonWithRetry } from "../lib/public-api";

type Weather = { temperature: number; apparent: number; wind: number; code: number; high: number; low: number; unit: string; windUnit: string };
const sampleWeather: Weather = { temperature: 76, apparent: 78, wind: 9, code: 2, high: 82, low: 67, unit: "°F", windUnit: "mph" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function describe(code: number) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Low visibility";
  if (code <= 67) return "Rain nearby";
  if (code <= 77) return "Snow nearby";
  return "Showers possible";
}

export function WeatherCard() {
  const [weather, setWeather] = useState<Weather>(sampleWeather);
  const [state, setState] = useState<"loading" | "live" | "sample">("loading");

  const refresh = useCallback(async () => {
    setState("loading");
    try {
      const data = await fetchJsonWithRetry("https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=1");
      if (!isRecord(data) || !isRecord(data.current) || !isRecord(data.current_units) || !isRecord(data.daily) || !Array.isArray(data.daily.temperature_2m_max) || !Array.isArray(data.daily.temperature_2m_min)) throw new Error("Weather response changed");
      const current = data.current;
      const units = data.current_units;
      const daily = data.daily;
      if (typeof current.temperature_2m !== "number" || typeof current.apparent_temperature !== "number" || typeof current.weather_code !== "number" || typeof current.wind_speed_10m !== "number" || typeof daily.temperature_2m_max[0] !== "number" || typeof daily.temperature_2m_min[0] !== "number") throw new Error("Weather fields are unavailable");
      setWeather({
        temperature: current.temperature_2m,
        apparent: current.apparent_temperature,
        wind: current.wind_speed_10m,
        code: current.weather_code,
        high: daily.temperature_2m_max[0],
        low: daily.temperature_2m_min[0],
        unit: typeof units.temperature_2m === "string" ? units.temperature_2m : "°F",
        windUnit: typeof units.wind_speed_10m === "string" ? units.wind_speed_10m : "mph",
      });
      setState("live");
    } catch {
      setWeather(sampleWeather);
      setState("sample");
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <section aria-labelledby="weather-heading" className="rounded-[22px] border border-[#cfe8f7] bg-[#edf8ff] p-4 shadow-[0_18px_40px_-32px_rgba(14,116,144,0.5)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-white text-[#0e7490] shadow-sm"><CloudSun className="size-4" /></span>
          <div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#0e7490]">Chicago</p><h2 id="weather-heading" className="text-xs font-semibold text-slate-900">Local conditions</h2></div>
        </div>
        <button onClick={() => void refresh()} aria-label="Refresh Chicago weather" className="grid size-8 place-items-center rounded-xl text-[#0e7490] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0e7490]"><RefreshCw className={"size-3.5 " + (state === "loading" ? "animate-spin" : "")} /></button>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div><p className="text-[36px] font-semibold leading-none tracking-[-0.06em] text-slate-950 tabular-nums">{Math.round(weather.temperature)}<span className="ml-1 text-base text-[#0e7490]">{weather.unit}</span></p><p className="mt-2 text-xs font-medium text-slate-600">{describe(weather.code)}</p></div>
        <div className="text-right text-[10px] leading-5 text-slate-500"><p>H {Math.round(weather.high)}° · L {Math.round(weather.low)}°</p><p>Feels like {Math.round(weather.apparent)}°</p></div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-[10px] text-slate-600"><Wind className="size-3.5 text-[#0e7490]" /> {Math.round(weather.wind)} {weather.windUnit}</div>
        <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-[10px] text-slate-600"><Droplets className="size-3.5 text-[#0e7490]" /> Model forecast</div>
      </div>
      <p className="mt-3 text-[9px] text-slate-400">{state === "sample" ? "Sample data · API unavailable" : state === "loading" ? "Refreshing Open-Meteo…" : "Live · Open-Meteo"}</p>
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

function isRateRow(value: unknown): value is RateRow {
  return typeof value === "object" && value !== null && typeof (value as RateRow).date === "string" && typeof (value as RateRow).base === "string" && typeof (value as RateRow).quote === "string" && typeof (value as RateRow).rate === "number";
}

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
      rows.forEach((row) => {
        if ((row.quote === "EUR" || row.quote === "GBP" || row.quote === "JPY") && typeof row.rate === "number") next[row.quote] = row.rate;
      });
      setRates(next);
      setRateDate(rows[0]?.date ?? "Latest");
      setState("live");
    } catch {
      setRates(sampleRates);
      setRateDate("Sample rate");
      setState("sample");
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const converted = useMemo(() => {
    const numericAmount = Number(amount);
    return Number.isFinite(numericAmount) ? numericAmount * rates[quote] : 0;
  }, [amount, quote, rates]);

  return (
    <section aria-labelledby="currency-heading" className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-[#087f5b]"><TrendingUp className="size-4" /></span>
          <div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#087f5b]">Budget lens</p><h2 id="currency-heading" className="text-xs font-semibold text-slate-900">Currency reference</h2></div>
        </div>
        <button onClick={() => void refresh()} aria-label="Refresh exchange rates" className="grid size-8 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087f5b]"><RefreshCw className={"size-3.5 " + (state === "loading" ? "animate-spin" : "")} /></button>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <label><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">From USD</span><input aria-label="Amount in US dollars" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold tabular-nums outline-none transition focus:border-[#087f5b] focus:bg-white focus:ring-4 focus:ring-emerald-500/10" /></label>
        <ArrowRight className="mb-3 size-4 text-slate-300" />
        <label><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">To</span><select value={quote} onChange={(event) => setQuote(event.target.value as Quote)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 text-sm font-semibold outline-none transition focus:border-[#087f5b] focus:bg-white focus:ring-4 focus:ring-emerald-500/10"><option>EUR</option><option>GBP</option><option>JPY</option></select></label>
      </div>

      <div className="mt-3 rounded-2xl bg-[#f4fbf8] px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#087f5b]">Estimated reference value</p>
        <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950 tabular-nums">{new Intl.NumberFormat("en-US", { style: "currency", currency: quote, maximumFractionDigits: quote === "JPY" ? 0 : 2 }).format(converted)}</p>
      </div>
      <p className="mt-3 text-[9px] leading-4 text-slate-400">{state === "sample" ? "Sample data · API unavailable" : state === "loading" ? "Refreshing Frankfurter…" : rateDate + " · Frankfurter reference rates"}</p>
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

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

function isJsonValue(value: unknown): boolean {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value === "object") return Object.values(value).every(isJsonValue);
  return false;
}

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
    if (attempt < MAX_RETRIES) {
      await wait(350 * (attempt + 1));
      return fetchJsonWithRetry(url, attempt + 1);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
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
    path: "styles.css",
    language: "css",
    fullMatch: "",
    code: `:root { color-scheme: light; font-family: "Avenir Next", "Segoe UI", sans-serif; background: #eef2f7; }
* { box-sizing: border-box; }
html { background: #eef2f7; }
body { margin: 0; min-width: 320px; background: #eef2f7; }
button, input, select { font: inherit; }
button { cursor: pointer; }
.day-pulse::before {
  content: "";
  position: absolute;
  inset: 10px auto 10px 5px;
  width: 1px;
  background: linear-gradient(180deg, transparent, #3157d5 18%, #38bdf8 52%, #18a77b 84%, transparent);
  opacity: .45;
}
.day-pulse::after {
  content: "";
  position: absolute;
  left: 2px;
  top: 42%;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 0 2px #3157d5, 0 0 18px 5px rgba(49,87,213,.35);
  animation: day-pulse 3.8s ease-in-out infinite;
}
@keyframes day-pulse { 0%, 100% { transform: translateY(-26px); opacity: .65; } 50% { transform: translateY(26px); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
@media (max-width: 1023px) { .day-pulse::before, .day-pulse::after { display: none; } .day-pulse { padding-left: 0; } }
::selection { background: rgba(49,87,213,.18); }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border: 3px solid transparent; background-clip: padding-box; border-radius: 999px; }`,
  },
];
