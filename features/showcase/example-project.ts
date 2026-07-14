import type { GeneratedFile } from "@/lib/generated-files";

export const EXAMPLE_PROJECT_PROMPT =
  "Build a polished focus dashboard with a daily plan, calm visual hierarchy, and a timer for the active task.";

export const EXAMPLE_PROJECT_PLAN = [
  "Create a responsive single-page productivity dashboard.",
  "Separate task data, timer controls, and summary cards into focused components.",
  "Use accessible controls, strong keyboard focus, and responsive layouts.",
  "Keep all data local so the exported project runs without credentials.",
];

export const EXAMPLE_PROJECT_FILES: GeneratedFile[] = [
  {
    path: "App.tsx",
    language: "tsx",
    fullMatch: "",
    code: `import { FocusTimer } from "./components/FocusTimer";
import { TaskList } from "./components/TaskList";
import { todayTasks } from "./data/tasks";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium text-cyan-300">Tuesday focus</p>
        <div className="mt-2 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Make room for deep work.</h1>
            <p className="mt-3 max-w-xl text-slate-400">A calm plan for the three outcomes that matter today.</p>
          </div>
          <FocusTimer minutes={25} />
        </div>
        <TaskList tasks={todayTasks} />
      </div>
    </main>
  );
}`,
  },
  {
    path: "components/FocusTimer.tsx",
    language: "tsx",
    fullMatch: "",
    code: `import { useEffect, useState } from "react";

export function FocusTimer({ minutes }: { minutes: number }) {
  const [seconds, setSeconds] = useState(minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || seconds === 0) return;
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [running, seconds]);

  const label = String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
  return (
    <button onClick={() => setRunning((value) => !value)} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-mono text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300">
      {running ? "Pause" : "Start"} · {label}
    </button>
  );
}`,
  },
  {
    path: "components/TaskList.tsx",
    language: "tsx",
    fullMatch: "",
    code: `import type { FocusTask } from "../data/tasks";

export function TaskList({ tasks }: { tasks: FocusTask[] }) {
  return (
    <section aria-labelledby="tasks-heading" className="mt-12">
      <h2 id="tasks-heading" className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Today</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {tasks.map((task, index) => (
          <article key={task.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs text-cyan-300">0{index + 1} · {task.duration}</p>
            <h3 className="mt-8 text-xl font-medium">{task.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{task.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}`,
  },
  {
    path: "data/tasks.ts",
    language: "ts",
    fullMatch: "",
    code: `export type FocusTask = { title: string; note: string; duration: string };

export const todayTasks: FocusTask[] = [
  { title: "Shape the launch story", note: "Turn the product promise into six proof-led frames.", duration: "45 min" },
  { title: "Verify the critical path", note: "Run generation, preview, export, and recovery checks.", duration: "30 min" },
  { title: "Write the maker note", note: "Explain why portable source and visible costs matter.", duration: "20 min" },
];`,
  },
];
