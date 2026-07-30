import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Download,
  FileCode2,
  Github,
  ImagePlus,
  Monitor,
  MousePointer2,
  Play,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
  WandSparkles,
} from "lucide-react";

import { BrandLockup } from "./shared";

export const LAUNCH_GIF_FPS = 12;
export const LAUNCH_GIF_FRAME_COUNT = 120;

export type LaunchGifName =
  | "plan-mode"
  | "screenshot-to-app"
  | "verify-and-export";

declare global {
  interface Window {
    __launchGifSetFrame?: (frame: number) => void;
  }
}

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function progress(frame: number, start: number, end: number) {
  return clamp((frame - start) / Math.max(1, end - start));
}

function mix(start: number, end: number, amount: number) {
  const eased = amount * amount * (3 - 2 * amount);
  return start + (end - start) * eased;
}

type CursorPoint = {
  frame: number;
  x: number;
  y: number;
  target?: string;
  anchorX?: number;
  anchorY?: number;
};

type CursorClick = {
  frame: number;
  target: string;
};

const PLAN_CURSOR_POINTS: CursorPoint[] = [
  { frame: 0, x: 1140, y: 680 },
  { frame: 27, x: 1090, y: 212, target: "plan-send" },
  { frame: 36, x: 380, y: 525, target: "plan-answer-one" },
  { frame: 53, x: 380, y: 525, target: "plan-answer-two" },
  {
    frame: 72,
    x: 820,
    y: 520,
    target: "plan-review",
    anchorX: 0.72,
    anchorY: 0.62,
  },
  { frame: 98, x: 1010, y: 620, target: "plan-approve" },
  { frame: 119, x: 1140, y: 680 },
];

const PLAN_CURSOR_CLICKS: CursorClick[] = [
  { frame: 27, target: "plan-send" },
  { frame: 36, target: "plan-answer-one" },
  { frame: 53, target: "plan-answer-two" },
  { frame: 98, target: "plan-approve" },
];

const SCREENSHOT_CURSOR_POINTS: CursorPoint[] = [
  { frame: 0, x: 1135, y: 680 },
  { frame: 22, x: 290, y: 315, target: "screenshot-upload" },
  { frame: 34, x: 290, y: 590, target: "screenshot-generate" },
  {
    frame: 64,
    x: 1000,
    y: 560,
    target: "screenshot-preview",
    anchorX: 0.76,
    anchorY: 0.7,
  },
  { frame: 81, x: 1180, y: 112, target: "screenshot-mobile" },
  {
    frame: 104,
    x: 1010,
    y: 530,
    target: "screenshot-preview",
    anchorX: 0.72,
    anchorY: 0.58,
  },
  { frame: 119, x: 1135, y: 680 },
];

const SCREENSHOT_CURSOR_CLICKS: CursorClick[] = [
  { frame: 22, target: "screenshot-upload" },
  { frame: 34, target: "screenshot-generate" },
  { frame: 81, target: "screenshot-mobile" },
];

const VERIFY_CURSOR_POINTS: CursorPoint[] = [
  { frame: 0, x: 1138, y: 680 },
  { frame: 18, x: 42, y: 270, target: "nav-quality" },
  { frame: 39, x: 1060, y: 550, target: "verify-repair" },
  {
    frame: 64,
    x: 780,
    y: 112,
    target: "verify-runtime",
  },
  { frame: 80, x: 790, y: 705, target: "verify-export" },
  { frame: 96, x: 470, y: 470, target: "verify-zip" },
  { frame: 103, x: 795, y: 470, target: "verify-github" },
  { frame: 119, x: 1138, y: 680 },
];

const VERIFY_CURSOR_CLICKS: CursorClick[] = [
  { frame: 18, target: "nav-quality" },
  { frame: 39, target: "verify-repair" },
  { frame: 80, target: "verify-export" },
  { frame: 96, target: "verify-zip" },
  { frame: 103, target: "verify-github" },
];

function cursorPath(
  frame: number,
  points: Array<{ frame: number; x: number; y: number }>,
) {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return { x: 1120, y: 650 };
  if (frame <= first.frame) return first;
  if (frame >= last.frame) return last;
  const nextIndex = points.findIndex((point) => point.frame >= frame);
  const next = points[nextIndex];
  const previous = points[nextIndex - 1];
  const amount = progress(frame, previous.frame, next.frame);
  return {
    x: mix(previous.x, next.x, amount),
    y: mix(previous.y, next.y, amount),
  };
}

function DemoCursor({
  frame,
  points,
  clicks,
}: {
  frame: number;
  points: CursorPoint[];
  clicks: CursorClick[];
}) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const activeClick = clicks.find(
    (click) => Math.abs(frame - click.frame) <= 5,
  );
  const clicking = Boolean(
    activeClick && Math.abs(frame - activeClick.frame) <= 2,
  );

  useLayoutEffect(() => {
    const cursor = cursorRef.current;
    const focusElement = focusRef.current;
    const root = cursor?.closest<HTMLElement>(".launch-gif-app");
    if (!cursor || !focusElement || !root) return;
    const rootRect = root.getBoundingClientRect();
    const resolveTarget = (targetName: string) =>
      root.querySelector<HTMLElement>(`[data-cursor-target="${targetName}"]`);
    const resolvedPoints = points.map((point) => {
      if (!point.target) {
        return { frame: point.frame, x: point.x, y: point.y };
      }
      const target = resolveTarget(point.target);
      if (!target) return { frame: point.frame, x: point.x, y: point.y };
      const rect = target.getBoundingClientRect();
      return {
        frame: point.frame,
        x: rect.left - rootRect.left + rect.width * (point.anchorX ?? 0.5),
        y: rect.top - rootRect.top + rect.height * (point.anchorY ?? 0.5),
      };
    });
    const focusTarget = activeClick ? resolveTarget(activeClick.target) : null;
    const focusRect = focusTarget?.getBoundingClientRect();
    const position = cursorPath(frame, resolvedPoints);
    cursor.style.left = `${position.x}px`;
    cursor.style.top = `${position.y}px`;
    if (focusRect && focusTarget) {
      focusElement.style.display = "block";
      focusElement.style.left = `${focusRect.left - rootRect.left - 5}px`;
      focusElement.style.top = `${focusRect.top - rootRect.top - 5}px`;
      focusElement.style.width = `${focusRect.width + 10}px`;
      focusElement.style.height = `${focusRect.height + 10}px`;
      focusElement.style.borderRadius = `${Number.parseFloat(getComputedStyle(focusTarget).borderRadius) + 5}px`;
    } else {
      focusElement.style.display = "none";
    }
  }, [activeClick, frame, points]);

  const fallbackPosition = cursorPath(frame, points);
  return (
    <>
      <div
        ref={focusRef}
        className={`launch-gif-focus ${clicking ? "is-clicking" : ""}`}
        style={{ display: "none" }}
        aria-hidden="true"
      />
      <div
        ref={cursorRef}
        className={`launch-gif-cursor ${clicking ? "is-clicking" : ""}`}
        style={{ left: fallbackPosition.x, top: fallbackPosition.y }}
        data-cursor-target={clicking ? activeClick?.target : undefined}
        aria-hidden="true"
      >
        <MousePointer2 />
        <span />
      </div>
    </>
  );
}

function IntroCover({ frame, label }: { frame: number; label: string }) {
  const introOpacity = 1 - progress(frame, 6, 13);
  const outroOpacity = progress(frame, 108, 117);
  const opacity = Math.max(introOpacity, outroOpacity);
  return (
    <div
      className="launch-gif-cover"
      style={{ opacity, pointerEvents: opacity > 0.01 ? "auto" : "none" }}
    >
      <BrandLockup />
      <div className="launch-gif-cover-mark">
        <Sparkles />
      </div>
      <p data-critical-copy>{label}</p>
      <span>Squid Agent</span>
    </div>
  );
}

function ProductHeader({
  label,
  step,
  stage,
}: {
  label: string;
  step: string;
  stage: string;
}) {
  return (
    <header className="launch-gif-header">
      <BrandLockup />
      <div className="launch-gif-label">
        <Sparkles />
        <span>
          <strong data-critical-copy>{label}</strong>
          <small>
            <b>{step}</b> {stage}
          </small>
        </span>
      </div>
      <div className="launch-gif-project">
        <span>FF</span>
        FieldFlow
        <ChevronDown />
      </div>
    </header>
  );
}

function Rail({ active = "Build" }: { active?: "Build" | "Quality" }) {
  return (
    <aside className="launch-gif-rail" aria-label="Project navigation">
      <div className={active === "Build" ? "is-active" : ""}>
        <WandSparkles /> <span>Build</span>
      </div>
      <div>
        <FileCode2 /> <span>Files</span>
      </div>
      <div
        className={active === "Quality" ? "is-active" : ""}
        data-cursor-target="nav-quality"
      >
        <ShieldCheck /> <span>Quality</span>
      </div>
      <div>
        <Rocket /> <span>Ship</span>
      </div>
    </aside>
  );
}

function PlanModeDemo({ frame }: { frame: number }) {
  const prompt = "A client portal for interior design studios";
  const typedLength = Math.round(prompt.length * progress(frame, 13, 27));
  const firstAnswered = frame >= 39;
  const secondAnswered = frame >= 55;
  const showingPlan = frame >= 62;
  const approved = frame >= 100;
  const guide =
    frame < 29
      ? { step: "01 / 04", stage: "Describe the product" }
      : frame < 58
        ? { step: "02 / 04", stage: "Answer focused questions" }
        : frame < 94
          ? { step: "03 / 04", stage: "Review the structured plan" }
          : { step: "04 / 04", stage: "Approve and start building" };

  return (
    <div className="launch-gif-app plan-mode-demo">
      <ProductHeader label="Plan before building" {...guide} />
      <div className="launch-gif-workspace">
        <Rail />
        <main className="plan-chat">
          <div className="chat-title-row">
            <div>
              <span>NEW PROJECT</span>
              <h1>What should we build?</h1>
            </div>
            <span className="mode-pill">Plan mode</span>
          </div>

          <section className="prompt-card">
            <div className="prompt-avatar">You</div>
            <p data-critical-copy>
              {prompt.slice(0, typedLength)}
              {frame < 27 && <i className="typing-caret" />}
            </p>
            <button
              className={frame >= 27 ? "is-sent" : ""}
              data-cursor-target="plan-send"
            >
              {frame >= 27 ? <Check /> : <ArrowRight />}
            </button>
          </section>

          {!showingPlan ? (
            <section className="interview-card">
              <div className="assistant-row">
                <span className="assistant-mark">S</span>
                <div>
                  <strong>Let’s make the important decisions first.</strong>
                  <small>2 focused questions · about 30 seconds</small>
                </div>
              </div>
              <div className="question-progress">
                <span className="is-complete" />
                <span className={firstAnswered ? "is-complete" : ""} />
                <span className={secondAnswered ? "is-complete" : ""} />
              </div>
              <div className="question-card">
                <span>0{firstAnswered ? 2 : 1}</span>
                <h2 data-critical-copy>
                  {firstAnswered
                    ? "How should clients review a concept?"
                    : "What matters most in the first release?"}
                </h2>
                <div className="answer-grid">
                  {(firstAnswered
                    ? ["Comment in context", "Email feedback", "Live chat"]
                    : ["Project approvals", "Invoices", "Team scheduling"]
                  ).map((answer, index) => {
                    const selected = firstAnswered
                      ? secondAnswered && index === 0
                      : frame >= 36 && index === 0;
                    return (
                      <button
                        key={answer}
                        className={selected ? "is-selected" : ""}
                        data-cursor-target={
                          index === 0
                            ? firstAnswered
                              ? "plan-answer-two"
                              : "plan-answer-one"
                            : undefined
                        }
                      >
                        <span>{selected ? <Check /> : index + 1}</span>
                        {answer}
                        {index === 0 && <em>Recommended</em>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : (
            <section
              className={`plan-review-card ${approved ? "is-approved" : ""}`}
              data-cursor-target="plan-review"
            >
              <div className="plan-review-heading">
                <span>
                  <FileCode2 />
                </span>
                <div>
                  <h2 data-critical-copy>Architecture Plan</h2>
                  <p>Ready to review before code generation</p>
                </div>
                {approved && (
                  <div className="approved-chip">
                    <Check /> Approved
                  </div>
                )}
              </div>
              <div className="plan-sections">
                {[
                  [
                    "01",
                    "Core experience",
                    "Client projects with clear concept approval states.",
                  ],
                  [
                    "02",
                    "Feedback",
                    "Pinned comments directly on each visual direction.",
                  ],
                  [
                    "03",
                    "Responsive UI",
                    "Focused desktop workspace and mobile review queue.",
                  ],
                ].map(([number, title, copy], index) => (
                  <div
                    key={number}
                    style={{
                      opacity: progress(frame, 64 + index * 5, 70 + index * 5),
                    }}
                  >
                    <span>{number}</span>
                    <p>
                      <strong>{title}</strong>
                      <small>{copy}</small>
                    </p>
                    <CheckCircle2 />
                  </div>
                ))}
              </div>
              <div className="plan-actions">
                <button>Edit plan</button>
                <button
                  className="primary-action"
                  data-cursor-target="plan-approve"
                >
                  {approved ? (
                    <>
                      <Check /> Plan approved
                    </>
                  ) : (
                    <>
                      <Check /> Approve &amp; Generate
                    </>
                  )}
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
      <DemoCursor
        frame={frame}
        clicks={PLAN_CURSOR_CLICKS}
        points={PLAN_CURSOR_POINTS}
      />
      <IntroCover frame={frame} label="Plan before building" />
    </div>
  );
}

function ReferencePreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`reference-preview ${compact ? "is-compact" : ""}`}>
      <div className="reference-nav">
        <b>STUDIO NORTH</b>
        <span>Projects &nbsp; About</span>
      </div>
      <div className="reference-hero">
        <span>INTERIORS / CHICAGO</span>
        <strong>
          Spaces with
          <br />
          room to breathe.
        </strong>
        <i>View selected work</i>
      </div>
      <div className="reference-grid">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function ScreenshotToAppDemo({ frame }: { frame: number }) {
  const uploaded = frame >= 24;
  const generating = frame >= 35 && frame < 55;
  const complete = frame >= 55;
  const mobile = frame >= 83;
  const buildProgress = Math.round(progress(frame, 35, 53) * 100);
  const guide =
    frame < 25
      ? { step: "01 / 04", stage: "Add a visual reference" }
      : frame < 55
        ? { step: "02 / 04", stage: "Generate editable React" }
        : frame < 80
          ? { step: "03 / 04", stage: "Inspect the desktop build" }
          : { step: "04 / 04", stage: "Check the responsive layout" };

  return (
    <div className="launch-gif-app screenshot-demo">
      <ProductHeader label="Screenshot to editable React app" {...guide} />
      <div className="launch-gif-workspace">
        <Rail />
        <main className="screenshot-workspace">
          <section className="builder-panel">
            <span className="panel-kicker">VISUAL REFERENCE</span>
            <h1 data-critical-copy>Build from a screenshot</h1>
            <p>
              Squid reads the layout, visual system, and responsive intent—then
              returns editable React code.
            </p>
            <div
              className={`upload-zone ${uploaded ? "has-file" : ""}`}
              data-cursor-target="screenshot-upload"
            >
              {uploaded ? (
                <>
                  <ReferencePreview compact />
                  <div>
                    <strong>studio-reference.png</strong>
                    <small>1440 × 900 · 1.8 MB</small>
                  </div>
                  <CheckCircle2 />
                </>
              ) : (
                <>
                  <span>
                    <ImagePlus />
                  </span>
                  <strong>Drop a screenshot here</strong>
                  <small>PNG, JPG, or WebP</small>
                </>
              )}
            </div>
            <label>Build instruction</label>
            <div className="build-instruction">
              Recreate this as a responsive portfolio with editable projects.
            </div>
            <button
              className={`generate-button ${generating ? "is-generating" : ""}`}
              data-cursor-target="screenshot-generate"
            >
              {generating ? (
                <>
                  <span className="mini-spinner" /> Generating · {buildProgress}
                  %
                </>
              ) : complete ? (
                <>
                  <Check /> Build complete
                </>
              ) : (
                <>
                  <WandSparkles /> Generate application
                </>
              )}
            </button>
            {generating && (
              <div className="generation-steps">
                <span className="is-done">
                  <Check /> Layout mapped
                </span>
                <span className={buildProgress > 55 ? "is-done" : ""}>
                  <Check /> Components created
                </span>
                <span className={buildProgress > 84 ? "is-done" : ""}>
                  <Check /> Responsive pass
                </span>
              </div>
            )}
          </section>
          <section className="preview-panel">
            <div className="preview-toolbar">
              <div>
                <span />
                <span />
                <span />
              </div>
              <span className="preview-address">
                preview.squid.run/studio-north
              </span>
              <div className="device-switcher">
                <button className={!mobile ? "is-active" : ""}>
                  <Monitor /> Desktop
                </button>
                <button
                  className={mobile ? "is-active" : ""}
                  data-cursor-target="screenshot-mobile"
                >
                  <Smartphone /> Mobile
                </button>
              </div>
            </div>
            <div className={`preview-stage ${mobile ? "is-mobile" : ""}`}>
              {!complete ? (
                <div className="preview-empty">
                  {generating ? <span className="large-spinner" /> : <Upload />}
                  <strong>
                    {generating
                      ? "Building your React app"
                      : "Your preview will appear here"}
                  </strong>
                  <small>
                    {generating
                      ? "Creating components and responsive rules"
                      : "Upload a visual reference to begin"}
                  </small>
                </div>
              ) : (
                <div
                  className="generated-browser"
                  data-cursor-target="screenshot-preview"
                >
                  <ReferencePreview />
                  {frame >= 58 && (
                    <span className="editable-badge">
                      <FileCode2 /> 8 editable React files
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
      <DemoCursor
        frame={frame}
        clicks={SCREENSHOT_CURSOR_CLICKS}
        points={SCREENSHOT_CURSOR_POINTS}
      />
      <IntroCover frame={frame} label="Screenshot to editable React app" />
    </div>
  );
}

function MiniAppPreview({ repaired }: { repaired: boolean }) {
  return (
    <div className="mini-app-preview">
      <nav>
        <b>FieldFlow</b>
        <span>Overview&nbsp;&nbsp; Projects&nbsp;&nbsp; Clients</span>
        <i>New project</i>
      </nav>
      <header>
        <small>THIS WEEK</small>
        <strong>Three projects are moving forward.</strong>
      </header>
      <div className="mini-app-grid">
        <article>
          <span>IN REVIEW</span>
          <strong>Lake House</strong>
          <small>Concept approval</small>
        </article>
        <article>
          <span>ACTIVE</span>
          <strong>North Loop</strong>
          <small>Design development</small>
        </article>
        <article>
          <span>READY</span>
          <strong>Stone Court</strong>
          <small>Client handoff</small>
        </article>
      </div>
      <button
        className={repaired ? "is-repaired" : ""}
        aria-label={repaired ? "Open project" : undefined}
      >
        {repaired ? "Open project" : "↗"}
      </button>
    </div>
  );
}

function VerifyAndExportDemo({ frame }: { frame: number }) {
  const qualityOpened = frame >= 20;
  const repairing = frame >= 40 && frame < 57;
  const repaired = frame >= 57;
  const exportOpen = frame >= 83;
  const zipVerified = frame >= 98;
  const guide =
    frame < 20
      ? { step: "01 / 05", stage: "Open verification" }
      : frame < 40
        ? { step: "02 / 05", stage: "Review the detected issue" }
        : frame < 60
          ? { step: "03 / 05", stage: "Repair and re-run checks" }
          : frame < 83
            ? { step: "04 / 05", stage: "Confirm the updated state" }
            : { step: "05 / 05", stage: "Choose an export handoff" };

  return (
    <div className="launch-gif-app verification-demo">
      <ProductHeader label="Verify, repair, and export" {...guide} />
      <div className="launch-gif-workspace">
        <Rail active={qualityOpened ? "Quality" : "Build"} />
        <main className="verification-workspace">
          <section className="verification-preview">
            <div className="preview-toolbar">
              <div>
                <span />
                <span />
                <span />
              </div>
              <span className="preview-address">
                preview.squid.run/fieldflow
              </span>
              <span
                className={`runtime-chip ${repaired ? "is-passed" : ""}`}
                data-cursor-target="verify-runtime"
              >
                {repaired ? <CheckCircle2 /> : <CircleAlert />}
                {repaired ? "Runtime passed" : "1 issue found"}
              </span>
            </div>
            <div className="verify-preview-stage">
              <MiniAppPreview repaired={repaired} />
            </div>
            <div className="preview-footer">
              <span>
                <Monitor /> 1270 × 760
              </span>
              <span>
                <Play /> 6 controls checked
              </span>
              <button
                className="export-trigger"
                data-cursor-target="verify-export"
              >
                <Download /> Export
              </button>
            </div>
          </section>
          <aside
            className={`quality-panel ${repaired ? "is-passed" : ""} ${qualityOpened ? "is-open" : "is-closed"}`}
          >
            {!qualityOpened ? (
              <div className="quality-closed-state">
                <span>
                  <ShieldCheck />
                </span>
                <small>QUALITY</small>
                <h1 data-critical-copy>Open verification</h1>
                <p>Check the rendered app before you export the source.</p>
              </div>
            ) : (
              <>
                <div className="quality-heading">
                  <span>{repaired ? <CheckCircle2 /> : <ShieldCheck />}</span>
                  <div>
                    <small>QUALITY REPORT</small>
                    <h1 data-critical-copy>
                      {repaired ? "Ready to ship" : "One issue needs review"}
                    </h1>
                  </div>
                </div>
                <div className="quality-summary">
                  <div>
                    <strong>12</strong>
                    <small>Files</small>
                  </div>
                  <div>
                    <strong>18</strong>
                    <small>Imports</small>
                  </div>
                  <div>
                    <strong>{repaired ? "0" : "1"}</strong>
                    <small>Issues</small>
                  </div>
                </div>
                <div className={`issue-card ${repaired ? "is-resolved" : ""}`}>
                  <span>{repaired ? <CheckCircle2 /> : <CircleAlert />}</span>
                  <div>
                    <strong>
                      {repaired
                        ? "Accessible name added"
                        : "Missing accessible name"}
                    </strong>
                    <p>
                      {repaired
                        ? "The project link now has a clear label."
                        : "One icon-only project link needs an aria-label."}
                    </p>
                    <code>src/components/ProjectCard.tsx</code>
                  </div>
                </div>
                <button
                  className="repair-button"
                  data-cursor-target="verify-repair"
                >
                  {repairing ? (
                    <>
                      <span className="mini-spinner" /> Repairing issue…
                    </>
                  ) : repaired ? (
                    <>
                      <Check /> Repair complete
                    </>
                  ) : (
                    <>
                      <WandSparkles /> Run repair
                    </>
                  )}
                </button>
                <div className="quality-checks">
                  <span>
                    <Check /> Static checks passed
                  </span>
                  <span>
                    <Check /> No horizontal overflow
                  </span>
                  <span className={repaired ? "is-complete" : ""}>
                    <Check /> Runtime interaction passed
                  </span>
                </div>
              </>
            )}
          </aside>
        </main>
      </div>

      {exportOpen && (
        <div className="export-backdrop">
          <section
            className="export-dialog"
            role="dialog"
            aria-label="Export FieldFlow"
          >
            <div className="export-dialog-heading">
              <div>
                <small>VERIFIED HANDOFF</small>
                <h2 data-critical-copy>Export FieldFlow</h2>
              </div>
              <span>
                <ShieldCheck /> Verified by Squid
              </span>
            </div>
            <p>Take the editable React source wherever you build next.</p>
            <div className="export-options">
              <button
                className={zipVerified ? "is-complete" : ""}
                data-cursor-target="verify-zip"
              >
                <span>
                  <Download />
                </span>
                <strong>{zipVerified ? "ZIP ready" : "Download ZIP"}</strong>
                <small>Source, setup, and quality report</small>
                {zipVerified && <CheckCircle2 />}
              </button>
              <button data-cursor-target="verify-github">
                <span className="github-mark">
                  <Github />
                </span>
                <strong>Publish to GitHub</strong>
                <small>Create a repository from this build</small>
                <ArrowRight />
              </button>
            </div>
            <div className="handoff-note">
              <CheckCircle2 /> Export verification passed · 12 source files · 18
              imports resolved
            </div>
          </section>
        </div>
      )}

      <DemoCursor
        frame={frame}
        clicks={VERIFY_CURSOR_CLICKS}
        points={VERIFY_CURSOR_POINTS}
      />
      <IntroCover frame={frame} label="Verify, repair, and export" />
    </div>
  );
}

export function LaunchGifDemo({ name }: { name: LaunchGifName }) {
  const [frame, setFrame] = useState(() => {
    const requested = Number(
      new URLSearchParams(window.location.search).get("frame") ?? "0",
    );
    return Number.isFinite(requested)
      ? Math.min(LAUNCH_GIF_FRAME_COUNT - 1, Math.max(0, Math.round(requested)))
      : 0;
  });
  useEffect(() => {
    window.__launchGifSetFrame = (nextFrame) =>
      setFrame(
        Math.min(
          LAUNCH_GIF_FRAME_COUNT - 1,
          Math.max(0, Math.round(nextFrame)),
        ),
      );
    return () => {
      delete window.__launchGifSetFrame;
    };
  }, []);

  const content = useMemo(() => {
    if (name === "plan-mode") return <PlanModeDemo frame={frame} />;
    if (name === "screenshot-to-app")
      return <ScreenshotToAppDemo frame={frame} />;
    return <VerifyAndExportDemo frame={frame} />;
  }, [frame, name]);

  return (
    <div
      className="launch-gif-root"
      data-render-ready="true"
      data-gif-frame={frame}
      data-gif-name={name}
    >
      {content}
      <div className="launch-gif-timeline" aria-hidden="true">
        <span
          style={{ width: `${(frame / (LAUNCH_GIF_FRAME_COUNT - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
