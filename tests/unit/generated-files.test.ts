import { describe, expect, it } from "vitest";
import {
  buildGeneratedFilesQualityReport,
  buildGeneratedFilesRepairPrompt,
  formatGeneratedFileDiagnostics,
  formatGeneratedFilesMarkdown,
  normalizeGeneratedFiles,
  normalizeGeneratedPath,
  readGeneratedFilesStats,
  validateGeneratedFiles,
} from "@/lib/generated-files";
import {
  validateAuthenticatedTasksGeneratedApp,
  validateSelectedApiUsage,
} from "@/lib/generated-api";

describe("generated file diagnostics", () => {
  it("formats validation failures as an actionable repair request", () => {
    expect(
      formatGeneratedFileDiagnostics([
        { path: "App.tsx", message: "Theme control is incomplete." },
        { message: "Missing App.tsx entry file." },
      ]),
    ).toBe(
      [
        "Generated app validation failed. Repair every issue before returning the changed files:",
        "- App.tsx: Theme control is incomplete.",
        "- Missing App.tsx entry file.",
      ].join("\n"),
    );
  });
});

describe("generated file normalization", () => {
  it("normalizes safe paths and rejects traversal/protected modules", () => {
    expect(normalizeGeneratedPath(" src/App.tsx ")).toBe("App.tsx");
    expect(normalizeGeneratedPath("./components/Card.tsx")).toBe(
      "components/Card.tsx",
    );
    expect(normalizeGeneratedPath("../secret.ts")).toBeNull();
    // Interactive chrome may be customized by the model for coherent hover/state styling.
    expect(normalizeGeneratedPath("components/ui/button.tsx")).toBe(
      "components/ui/button.tsx",
    );
    expect(normalizeGeneratedPath("components/ui/badge.tsx")).toBe(
      "components/ui/badge.tsx",
    );
    expect(normalizeGeneratedPath("components/ui/dialog.tsx")).toBeNull();
    expect(normalizeGeneratedPath("@/lib/utils.ts")).toBeNull();
    expect(normalizeGeneratedPath("lib/supabase.ts")).toBeNull();
    expect(normalizeGeneratedPath("squid-runtime/supabase.ts")).toBeNull();
  });

  it("reports protected files stripped during normalization", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "components/ui/dialog.tsx",
        code: "export function Dialog() { return null; }",
      },
      {
        path: "App.tsx",
        code: "export default function App() { return <main />; }",
      },
    ]);

    expect(readGeneratedFilesStats(files)).toEqual({
      protectedPathsBlocked: 1,
    });
    expect(buildGeneratedFilesQualityReport(files)).toMatchObject({
      protectedPathsBlocked: 1,
    });
  });

  it("allows the model to override Button for branded hover styling", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "components/ui/button.tsx",
        code: "export function Button() { return <button type='button'>Go</button>; }",
      },
      {
        path: "App.tsx",
        code: 'import { Button } from "@/components/ui/button";\nexport default function App() { return <Button />; }',
      },
    ]);

    expect(files.map((file) => file.path).sort()).toEqual([
      "App.tsx",
      "components/ui/button.tsx",
    ]);
    expect(readGeneratedFilesStats(files)).toEqual({
      protectedPathsBlocked: 0,
    });
  });

  it("deduplicates by normalized path and rewrites generated alias imports", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "src/App.tsx",
        code: 'import { Widget } from "@/components/Widget";\nexport default Widget;',
      },
      {
        path: "App.tsx",
        code: 'import { Widget } from "@/components/Widget";\nexport default Widget;',
      },
      {
        path: "components/Widget.tsx",
        code: "export function Widget() { return <section />; }",
      },
    ]);

    expect(files).toHaveLength(2);
    expect(files.find((file) => file.path === "App.tsx")?.code).toContain(
      'from "./components/Widget"',
    );
  });

  it("keeps protected shadcn imports while diagnosing unresolved generated imports", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { Button } from "@/components/ui/button";',
          'import { Missing } from "./Missing";',
          "export default function App() { return <Button />; }",
        ].join("\n"),
      },
      {
        path: "components/Card.tsx",
        code: "export function Card() { return <article />; }",
      },
      {
        path: "components/Chart.tsx",
        code: "export function Chart() { return <figure />; }",
      },
    ]);

    expect(files[0].code).toContain('from "@/components/ui/button"');
    expect(validateGeneratedFiles(files)).toEqual([
      {
        path: "App.tsx",
        message:
          'Unresolved internal import "./Missing". Generate the imported file or remove the import.',
      },
    ]);
  });

  it("allows the protected Supabase adapter import without persisting it", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { supabase } from "@/lib/supabase";',
          "export default function App() { return <main>{String(Boolean(supabase))}</main>; }",
        ].join("\n"),
      },
      {
        path: "lib/supabase.ts",
        code: 'export const serviceRoleKey = "should-not-persist";',
      },
    ]);

    expect(files).toHaveLength(1);
    expect(files[0].path).toBe("App.tsx");
    expect(readGeneratedFilesStats(files)).toEqual({
      protectedPathsBlocked: 1,
    });
    expect(validateGeneratedFiles(files)).toEqual([]);
  });

  it("diagnoses generated default and named import/export mismatches", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { Footer } from "./components/Footer";',
          'import Header from "./components/Header";',
          "export default function App() { return <><Header /><Footer /></>; }",
        ].join("\n"),
      },
      {
        path: "components/Footer.tsx",
        code: "export default function Footer() { return <footer />; }",
      },
      {
        path: "components/Header.tsx",
        code: "export function Header() { return <header />; }",
      },
    ]);

    expect(validateGeneratedFiles(files)).toEqual([
      {
        path: "App.tsx",
        message:
          'Named import "Footer" from "./components/Footer" is invalid because components/Footer.tsx does not export "Footer". It has a default export; use import Footer from "./components/Footer" or export "Footer" by name.',
      },
      {
        path: "App.tsx",
        message:
          'Default import "Header" from "./components/Header" is invalid because components/Header.tsx exports "Header" only as a named export. Use import { Header } from "./components/Header" or add a default export.',
      },
    ]);
  });

  it("reports missing App.tsx diagnostics", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "components/Widget.tsx",
        code: "export const Widget = () => null;",
      },
    ]);

    expect(validateGeneratedFiles(files)).toEqual([
      { message: "Missing App.tsx entry file." },
    ]);
  });

  it("allows placeholder links while diagnosing empty event handlers", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'export default function App() { return <a href="#">Start</a>; }',
      },
      {
        path: "components/Actions.tsx",
        code: "export function Actions() { return <button onClick={() => {}}>Save</button>; }",
      },
      {
        path: "types.ts",
        code: "export type Item = { id: string };",
      },
    ]);

    expect(validateGeneratedFiles(files)).toEqual([
      {
        path: "components/Actions.tsx",
        message:
          "Empty event handler. Implement a real visible outcome or remove the inert control.",
      },
    ]);
  });

  it("diagnoses a partial dark-mode toggle that does not own complete theme state", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { useEffect, useState } from "react";',
          "export default function App() {",
          "  const [isDark, setIsDark] = useState(false);",
          "  useEffect(() => {",
          '    if (isDark) document.documentElement.classList.add("dark");',
          '    else document.documentElement.classList.remove("dark");',
          "  }, [isDark]);",
          "  return <button onClick={() => setIsDark(!isDark)}>Theme</button>;",
          "}",
        ].join("\n"),
      },
      {
        path: "components/Panel.tsx",
        code: "export function Panel() { return <section />; }",
      },
      { path: "types.ts", code: "export type Theme = 'light' | 'dark';" },
    ]);

    expect(validateGeneratedFiles(files)).toEqual([
      {
        path: "App.tsx",
        message:
          "Theme control is incomplete. Initialize from a persisted localStorage preference with a prefers-color-scheme fallback, persist changes, and update document.documentElement.style.colorScheme together with the root dark class.",
      },
    ]);
  });

  it("diagnoses a theme button that changes state without activating Tailwind dark variants", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { useState } from "react";',
          "export default function App() {",
          "  const [isDark, setIsDark] = useState(false);",
          '  return <main className="bg-white text-black dark:bg-black dark:text-white">',
          '    <button onClick={() => setIsDark(!isDark)}>{isDark ? "Light" : "Dark"}</button>',
          "  </main>;",
          "}",
        ].join("\n"),
      },
      {
        path: "components/Panel.tsx",
        code: "export function Panel() { return <section />; }",
      },
      { path: "types.ts", code: "export type Theme = 'light' | 'dark';" },
    ]);

    expect(validateGeneratedFiles(files)).toEqual([
      {
        path: "App.tsx",
        message:
          "Theme control is incomplete. Initialize from a persisted localStorage preference with a prefers-color-scheme fallback, persist changes, and update document.documentElement.style.colorScheme together with the root dark class.",
      },
    ]);
  });

  it("accepts a persisted dark-mode toggle with an OS fallback and color scheme", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'const saved = localStorage.getItem("theme");',
          'const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;',
          "const isDark = saved ? saved === 'dark' : systemDark;",
          'document.documentElement.classList.toggle("dark", isDark);',
          'document.documentElement.style.colorScheme = isDark ? "dark" : "light";',
          'localStorage.setItem("theme", isDark ? "dark" : "light");',
          "export default function App() { return <main />; }",
        ].join("\n"),
      },
      {
        path: "components/Panel.tsx",
        code: "export function Panel() { return <section />; }",
      },
      { path: "types.ts", code: "export type Theme = 'light' | 'dark';" },
    ]);

    expect(validateGeneratedFiles(files)).toEqual([]);
  });

  it("formats files as path-tagged markdown and builds actionable repair prompts", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: "export default function App() { return <main />; }",
      },
      { path: "styles.css", code: "main { display: block; }" },
      { path: "data.json", code: '{"ok":true}' },
    ]);
    const markdown = formatGeneratedFilesMarkdown(files);

    expect(markdown).toContain("```tsx{path=App.tsx}");
    expect(markdown).toContain("```css{path=styles.css}");
    expect(markdown).toContain("```json{path=data.json}");

    const repairPrompt = buildGeneratedFilesRepairPrompt("original", files, [
      { path: "App.tsx", message: "bad import" },
    ]);
    expect(repairPrompt).toContain("Diagnostics:");
    expect(repairPrompt).toContain("- App.tsx: bad import");
    expect(repairPrompt).toContain(
      'Use `import { motion } from "framer-motion"`',
    );
    expect(repairPrompt).toContain(
      "Every import style must match the target file's exports",
    );
    expect(repairPrompt).not.toContain('href="#"');
    expect(repairPrompt).toContain(
      "Replace empty event handlers with a real visible state change",
    );
  });

  it("normalizes common Framer Motion codegen mistakes", () => {
    const [file] = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { Motion } from "framer-motion";\nexport default <Motion />;',
      },
    ]);

    expect(file.code).toContain('import { motion } from "framer-motion";');
    expect(file.code).toContain("<motion.div />");
  });

  it("normalizes invalid Select export patterns", () => {
    const [file] = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { Select, SelectItemText } from "@/components/ui/select";\nexport default function App() { return <SelectItemText>System</SelectItemText>; }',
      },
    ]);

    expect(file.code).not.toContain("SelectItemText");
    expect(file.code).toContain(
      'import { Select, SelectItem } from "@/components/ui/select";',
    );
    expect(file.code).toContain("<SelectItem>System</SelectItem>");
  });

  it("adds the platform cn import when generated JSX calls cn", () => {
    const [file] = normalizeGeneratedFiles([
      {
        path: "components/FeatureGrid.tsx",
        code: [
          '"use client";',
          'import { Card } from "@/components/ui/card";',
          "export function FeatureGrid() {",
          '  return <div className={cn("p-3 rounded-lg", "bg-blue-500")} />;',
          "}",
        ].join("\n"),
      },
    ]);

    expect(file.code).toContain('import { cn } from "@/lib/utils";');
    expect(file.code.indexOf('import { cn } from "@/lib/utils";')).toBeLessThan(
      file.code.indexOf('import { Card } from "@/components/ui/card";'),
    );
  });

  it("normalizes clipboard calls to avoid unhandled permission errors", () => {
    const [file] = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'export default async function App() { await navigator.clipboard.writeText("ok"); }',
      },
    ]);

    expect(file.code).toContain(
      'await (navigator?.clipboard?.writeText?.("ok") ?? Promise.resolve()).catch(() => {});',
    );
  });

  it("builds a quality report from file, import, and accessibility diagnostics", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { Header } from "./components/Header";',
          'import { Missing } from "./components/Missing";',
          "export default function App() { return <><Header /><button></button></>; }",
        ].join("\n"),
      },
      {
        path: "components/Header.tsx",
        code: "export function Header() { return <header />; }",
      },
      {
        path: "components/Footer.tsx",
        code: "export function Footer() { return <footer />; }",
      },
    ]);

    const report = buildGeneratedFilesQualityReport(files);

    expect(report.filesGenerated).toBe(3);
    expect(report.importsResolved).toBe(1);
    expect(report.unresolvedImports).toEqual([
      expect.objectContaining({ path: "App.tsx" }),
    ]);
    expect(report.accessibilityWarnings).toEqual([
      expect.objectContaining({
        message: "Button appears to have no visible text or aria-label.",
      }),
    ]);
    expect(report.status).toBe("warning");
  });

  it("recognizes inputs wrapped by labels as accessible", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          "export default function App() {",
          "  return <>",
          '    <label><span>Search</span><input value="" onChange={() => {}} /></label>',
          '    <input value="" onChange={() => {}} />',
          "  </>;",
          "}",
        ].join("\n"),
      },
    ]);

    const report = buildGeneratedFilesQualityReport(files);

    expect(report.accessibilityWarnings).toEqual([
      expect.objectContaining({
        message:
          "Input appears to be missing an accessible name, id, or placeholder.",
      }),
    ]);
  });

  it("blocks unsafe or incomplete browser API clients", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { load } from "./api"; export default function App() { return <button onClick={load}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: 'const apiKey = "super-secret-token-123"; export async function load() { return fetch("https://api.example.com/data", { headers: { Authorization: "Bearer super-secret-token-123" } }); }',
      },
      { path: "types.ts", code: "export type Data = { id: string };" },
    ]);

    const report = buildGeneratedFilesQualityReport(files);
    expect(report.apiIntegration.status).toBe("blocked");
    expect(report.diagnostics.map((item) => item.message)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Hard-coded API credentials"),
        expect.stringContaining("AbortController"),
        expect.stringContaining("runtime"),
      ]),
    );
  });

  it("blocks browser-forbidden request headers", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { load } from "./api"; export default function App() { return <button onClick={load}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: [
          "function isData(value: unknown): value is { id: string } { return typeof value === 'object' && value !== null && 'id' in value; }",
          "export async function load(retry = 0): Promise<unknown> {",
          " const controller = new AbortController();",
          ' const response = await fetch("https://api.example.com", { signal: controller.signal, headers: { "User-Agent": "generated-app" } });',
          " if (!response.ok) throw new Error('bad');",
          " const data: unknown = await response.json(); if (!isData(data)) throw new Error('invalid');",
          " if (retry > 2) throw new Error('retry limit'); return data;",
          "}",
        ].join("\n"),
      },
      { path: "types.ts", code: "export type Data = { id: string };" },
    ]);

    expect(validateGeneratedFiles(files)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("forbidden request headers"),
        }),
      ]),
    );
  });

  it("verifies a defensive public API client", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { load } from "./api"; export default function App() { return <button onClick={load}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: [
          "function isData(value: unknown): value is { id: string } {",
          '  return typeof value === "object" && value !== null && typeof (value as { id?: unknown }).id === "string";',
          "}",
          "export async function load(retry = 0): Promise<{ id: string }> {",
          "  const controller = new AbortController();",
          "  const timeout = setTimeout(() => controller.abort(), 5000);",
          "  try {",
          '    const response = await fetch("https://api.example.com/data", { signal: controller.signal });',
          '    if (!response.ok) throw new Error("Request failed");',
          "    const data: unknown = await response.json();",
          '    if (!isData(data)) throw new Error("Invalid response");',
          "    return data;",
          "  } catch (error) {",
          "    if (retry < 2) return load(retry + 1);",
          "    throw error;",
          "  } finally { clearTimeout(timeout); }",
          "}",
        ].join("\n"),
      },
      { path: "types.ts", code: "export type Data = { id: string };" },
    ]);

    expect(buildGeneratedFilesQualityReport(files).apiIntegration.status).toBe(
      "verified",
    );
  });

  it("requires selected APIs to use their exact provider id and reviewed base URL", () => {
    const validFiles = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { loadRates } from "./api"; export default function App() { return <button onClick={loadRates}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: 'export function loadRates() { return fetch("https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR"); }',
      },
      {
        path: "integrations.ts",
        code: 'export const integrations = [{ providerId: "frankfurter" }];',
      },
    ]);

    expect(validateSelectedApiUsage(validFiles, ["frankfurter"])).toEqual([]);

    const hallucinatedVersion = normalizeGeneratedFiles([
      ...validFiles.filter((file) => file.path !== "api.ts"),
      {
        path: "api.ts",
        code: 'export function loadRates() { return fetch("https://api.frankfurter.dev/v1/convert?from=USD&to=EUR"); }',
      },
    ]);

    expect(
      validateSelectedApiUsage(hallucinatedVersion, ["frankfurter"]),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("outside the reviewed base URL"),
        }),
      ]),
    );
  });

  it("requires selected Supabase apps to import the protected client adapter", () => {
    const validFiles = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { supabase } from "@/lib/supabase"; export default function App() { return <main>{String(Boolean(supabase))}</main>; }',
      },
      {
        path: "integrations.ts",
        code: 'export const integrations = [{ providerId: "supabase" }];',
      },
    ]);
    expect(validateSelectedApiUsage(validFiles, ["supabase"])).toEqual([]);

    const directClientFiles = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { createClient } from "@supabase/supabase-js"; export default function App() { return <main>{String(Boolean(createClient))}</main>; }',
      },
      {
        path: "integrations.ts",
        code: 'export const integrations = [{ providerId: "supabase" }];',
      },
    ]);
    expect(validateSelectedApiUsage(directClientFiles, ["supabase"])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining('"@/lib/supabase"'),
        }),
      ]),
    );
  });

  it("validates the constrained authenticated tasks auth and CRUD surface", async () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { supabase } from "@/lib/supabase";',
          'import { Pencil, LogOut } from "lucide-react";',
          'import { useState } from "react";',
          "async function auth(email: string, password: string) {",
          "  await supabase.auth.signUp({ email, password });",
          "  await supabase.auth.signInWithPassword({ email, password });",
          "  await supabase.auth.getSession();",
          "  const { data } = supabase.auth.onAuthStateChange(() => {});",
          "  data.subscription.unsubscribe();",
          "}",
          "async function createTask(user: { id: string }) {",
          '  await supabase.from("tasks").select("*");',
          '  await supabase.from("tasks").insert({ title: "Task", user_id: user.id });',
          '  await supabase.from("tasks").update({ completed: true, updated_at: new Date().toISOString() }).eq("id", "task-id");',
          '  await supabase.from("tasks").delete().eq("id", "task-id");',
          "}",
          "async function updateTaskTitle(id: string, nextTitle: string) {",
          '  const { error } = await supabase.from("tasks").update({ title: nextTitle, updated_at: new Date().toISOString() }).eq("id", id);',
          "  if (error) throw error;",
          "}",
          "function TaskItem({ task, onSave }: { task: { id: string; title: string }; onSave: (id: string, title: string) => Promise<void> }) {",
          "  const [editing, setEditing] = useState(false);",
          "  const [title, setTitle] = useState(task.title);",
          "  const [loading, setLoading] = useState(false);",
          "  const [error, setError] = useState<string | null>(null);",
          '  async function handleSave() { setLoading(true); setError(null); try { await onSave(task.id, title); setEditing(false); } catch { setError("Could not save title"); } finally { setLoading(false); } }',
          '  return <article>{editing ? <><input aria-label="Task title" value={title} onChange={(event) => setTitle(event.target.value)} /><button onClick={handleSave} disabled={loading}>{loading ? "Saving title" : "Save"}</button><button onClick={() => { setTitle(task.title); setEditing(false); }}>Cancel</button>{error ? <p>{error}</p> : null}</> : <button aria-label={`Edit task ${task.title}`} onClick={() => setEditing(true)}><Pencil /></button>}</article>;',
          "}",
          'export default function App() { const loading = false; const error = null; return <main>{loading ? "Loading" : error ? "Error" : <TaskItem task={{ id: "task-id", title: "Task" }} onSave={updateTaskTitle} />}<button aria-label="Log out" onClick={() => supabase.auth.signOut()}><LogOut /></button></main>; }',
        ].join("\n"),
      },
    ]);
    expect(await validateAuthenticatedTasksGeneratedApp(files)).toEqual([]);

    const incomplete = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { supabase } from "@/lib/supabase"; void supabase;',
      },
    ]);
    expect(await validateAuthenticatedTasksGeneratedApp(incomplete)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: expect.stringContaining("login") }),
        expect.objectContaining({
          message: expect.stringContaining("Load tasks"),
        }),
      ]),
    );
  });

  it("rejects completion-only updates and dead or hidden editing controls", async () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { supabase } from "@/lib/supabase";',
          "async function unusedTitleUpdate(id: string, title: string) {",
          '  await supabase.from("tasks").update({ title }).eq("id", id);',
          "}",
          'function HiddenEditor() { return <div className="hidden"><button onClick={() => {}}>Edit title</button><input aria-label="Task title" value="" onChange={() => {}} /><button onClick={() => unusedTitleUpdate("id", "title")}>Save</button><button onClick={() => {}}>Cancel</button></div>; }',
          "async function auth(email: string, password: string, user: { id: string }) {",
          "  await supabase.auth.signUp({ email, password }); await supabase.auth.signInWithPassword({ email, password }); await supabase.auth.signOut(); await supabase.auth.getSession(); const { data } = supabase.auth.onAuthStateChange(() => {}); data.subscription.unsubscribe();",
          '  await supabase.from("tasks").select("*"); await supabase.from("tasks").insert({ title: "Task", user_id: user.id }); await supabase.from("tasks").update({ completed: true }).eq("id", "id"); await supabase.from("tasks").delete().eq("id", "id");',
          "}",
          'export default function App() { const loading = false; const error = null; const savingTitle = false; return <main>{loading ? "Loading" : error ? "Error" : <HiddenEditor />}<button onClick={() => supabase.auth.signOut()}>Log out</button></main>; }',
        ].join("\n"),
      },
    ]);

    expect(await validateAuthenticatedTasksGeneratedApp(files)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("stays visible at rest"),
        }),
        expect.objectContaining({
          message: expect.stringContaining("Wire the rendered Save action"),
        }),
      ]),
    );
  });

  it("rejects user ownership mutation and inaccessible generated controls", async () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: [
          'import { supabase } from "@/lib/supabase";',
          'import { Pencil, Settings, Search } from "lucide-react";',
          "async function updateTaskTitle(id: string, title: string, userId: string) {",
          '  await supabase.from("tasks").update({ title, user_id: userId }).eq("id", id);',
          "}",
          'function Editor({ onSave }: { onSave: typeof updateTaskTitle }) { const savingTitle = false; return <><button aria-label="Edit title" onClick={() => {}}><Pencil /></button><input aria-label="Task title" value="Task" onChange={() => {}} /><button onClick={() => onSave("id", "title", "user")}>Save</button><button onClick={() => {}}>Cancel</button></>; }',
          'async function auth(email: string, password: string, user: { id: string }) { await supabase.auth.signUp({ email, password }); await supabase.auth.signInWithPassword({ email, password }); await supabase.auth.getSession(); const { data } = supabase.auth.onAuthStateChange(() => {}); data.subscription.unsubscribe(); await supabase.from("tasks").select("*"); await supabase.from("tasks").insert({ title: "Task", user_id: user.id }); await supabase.from("tasks").delete().eq("id", "id"); }',
          'export default function App() { const loading = false; const error = null; return <main>{loading ? "Loading" : error ? "Error" : <Editor onSave={updateTaskTitle} />}<button aria-label="Log out" onClick={() => supabase.auth.signOut()}><Settings /></button><button onClick={() => {}}><Search className="h-5 w-5" /></button></main>; }',
        ].join("\n"),
      },
    ]);

    expect(await validateAuthenticatedTasksGeneratedApp(files)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("Never include user_id"),
        }),
        expect.objectContaining({
          message: expect.stringContaining("settings icon"),
        }),
        expect.objectContaining({
          message: expect.stringContaining("icon-only button"),
        }),
      ]),
    );
  });

  it("rejects mock data when a selected browser API is not called", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: "export default function App() { return <main>1 EUR</main>; }",
      },
      {
        path: "data.ts",
        code: "export const rate = 0.91;",
      },
      {
        path: "integrations.ts",
        code: 'export const integrations = [{ providerId: "frankfurter" }];',
      },
    ]);

    expect(validateSelectedApiUsage(files, ["frankfurter"])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("must be called at runtime"),
        }),
      ]),
    );
  });

  it("requires policy review for a conditional provider", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { load } from "./api"; export default function App() { return <button onClick={load}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: [
          "function isWeather(value: unknown): value is { latitude: number } { return typeof value === 'object' && value !== null && 'latitude' in value; }",
          "export async function load(retry = 0): Promise<unknown> {",
          " const controller = new AbortController();",
          " const timeout = setTimeout(() => controller.abort(), 5000);",
          " try { const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41&longitude=-87', { signal: controller.signal }); if (!response.ok) throw new Error('bad'); const data: unknown = await response.json(); if (!isWeather(data)) throw new Error('invalid'); return data; }",
          " catch (error) { if (retry < 2) return load(retry + 1); throw error; } finally { clearTimeout(timeout); }",
          "}",
        ].join("\n"),
      },
      { path: "types.ts", code: "export type Weather = { latitude: number };" },
    ]);

    const integration = buildGeneratedFilesQualityReport(files).apiIntegration;
    expect(integration.status).toBe("setup_required");
    expect(integration.providers).toEqual([
      expect.objectContaining({
        id: "open-meteo",
        policyStatus: "conditional",
      }),
    ]);
    expect(integration.policyWarnings).toEqual(
      expect.arrayContaining([expect.stringContaining("commercial-use terms")]),
    );
  });

  it("blocks endpoints prohibited by the integration registry", () => {
    const files = normalizeGeneratedFiles([
      {
        path: "App.tsx",
        code: 'import { load } from "./api"; export default function App() { return <button onClick={load}>Load</button>; }',
      },
      {
        path: "api.ts",
        code: [
          "function isPlace(value: unknown): value is object { return typeof value === 'object' && value !== null; }",
          "export async function load(retry = 0): Promise<unknown> {",
          " const controller = new AbortController();",
          " const timeout = setTimeout(() => controller.abort(), 5000);",
          " try { const response = await fetch('https://nominatim.openstreetmap.org/search?q=Chicago&format=json', { signal: controller.signal }); if (!response.ok) throw new Error('bad'); const data: unknown = await response.json(); if (!isPlace(data)) throw new Error('invalid'); return data; }",
          " catch (error) { if (retry < 2) return load(retry + 1); throw error; } finally { clearTimeout(timeout); }",
          "}",
        ].join("\n"),
      },
      { path: "types.ts", code: "export type Place = { name: string };" },
    ]);

    const integration = buildGeneratedFilesQualityReport(files).apiIntegration;
    expect(integration.status).toBe("blocked");
    expect(integration.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining("blocked"),
        }),
      ]),
    );
  });
});
