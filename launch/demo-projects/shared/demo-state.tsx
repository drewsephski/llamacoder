import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const demoStates = [
  "default",
  "loading",
  "error",
  "empty",
  "verified",
  "mobile",
] as const;

export type DemoState = (typeof demoStates)[number];

function readDemoState(): DemoState {
  const value = new URLSearchParams(window.location.search).get("demoState");
  return demoStates.includes(value as DemoState)
    ? (value as DemoState)
    : "default";
}

export function useDemoController() {
  const [state, setState] = useState<DemoState>(readDemoState);
  const controlsVisible = useMemo(
    () =>
      new URLSearchParams(window.location.search).get("demoControls") === "1",
    [],
  );

  useEffect(() => {
    const sync = () => setState(readDemoState());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const setDemoState = (next: DemoState) => {
    const url = new URL(window.location.href);
    url.searchParams.set("demoState", next);
    window.history.replaceState({}, "", url);
    setState(next);
  };

  const reset = () => setDemoState("default");

  return { state, setDemoState, reset, controlsVisible };
}

export function DemoController({
  state,
  onChange,
  onReset,
  visible,
}: {
  state: DemoState;
  onChange: (state: DemoState) => void;
  onReset: () => void;
  visible: boolean;
}) {
  return (
    <div
      className={`demo-controller ${visible ? "is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <SlidersHorizontal size={14} aria-hidden="true" />
      <label htmlFor="demo-state-select">Demo state</label>
      <select
        id="demo-state-select"
        value={state}
        onChange={(event) => onChange(event.target.value as DemoState)}
        tabIndex={visible ? 0 : -1}
      >
        {demoStates.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      <button type="button" onClick={onReset} tabIndex={visible ? 0 : -1}>
        <RotateCcw size={13} aria-hidden="true" /> Reset
      </button>
    </div>
  );
}

export function DemoStateBoundary({
  state,
  appName,
  emptyTitle,
  emptyBody,
  children,
}: {
  state: DemoState;
  appName: string;
  emptyTitle: string;
  emptyBody: string;
  children: React.ReactNode;
}) {
  if (state === "loading") {
    return (
      <main
        className="demo-state-page demo-state-loading"
        data-render-ready="true"
      >
        <span>{appName}</span>
        <div className="demo-skeleton demo-skeleton-wide" />
        <div className="demo-skeleton-grid">
          <div className="demo-skeleton" />
          <div className="demo-skeleton" />
          <div className="demo-skeleton" />
        </div>
        <p>Loading the deterministic demo fixture...</p>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main
        className="demo-state-page demo-state-error"
        data-render-ready="true"
      >
        <span>{appName}</span>
        <strong>This sample state could not be loaded.</strong>
        <p>
          The demo intentionally exposes a recoverable failure state. No live
          customer data or external service was contacted.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          Try the fixture again
        </button>
      </main>
    );
  }

  if (state === "empty") {
    return (
      <main
        className="demo-state-page demo-state-empty"
        data-render-ready="true"
      >
        <span>{appName}</span>
        <strong>{emptyTitle}</strong>
        <p>{emptyBody}</p>
        <a href="?demoState=default">Restore sample data</a>
      </main>
    );
  }

  return <>{children}</>;
}
