import { useEffect, useMemo, useState } from "react";
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
  points: Array<{ frame: number; x: number; y: number }>;
  clicks: number[];
}) {
  const position = cursorPath(frame, points);
  const clicking = clicks.some((click) => Math.abs(frame - click) <= 2);
  return (
    <div
      className={`launch-gif-cursor ${clicking ? "is-clicking" : ""}`}
      style={{ left: position.x, top: position.y }}
      aria-hidden="true"
    >
      <MousePointer2 />
      <span />
    </div>
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

function ProductHeader({ label }: { label: string }) {
  return (
    <header className="launch-gif-header">
      <BrandLockup />
      <div className="launch-gif-label" data-critical-copy>
        <Sparkles />
        {label}
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
      <div className={active === "Quality" ? "is-active" : ""}>
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

  return (
    <div className="launch-gif-app plan-mode-demo">
      <ProductHeader label="Plan before building" />
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
            <button className={frame >= 27 ? "is-sent" : ""}>
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
                <button className="primary-action">
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
        clicks={[27, 36, 53, 98]}
        points={[
          { frame: 0, x: 1140, y: 670 },
          { frame: 24, x: 1115, y: 214 },
          { frame: 35, x: 535, y: 526 },
          { frame: 52, x: 535, y: 526 },
          { frame: 79, x: 945, y: 650 },
          { frame: 98, x: 1040, y: 658 },
          { frame: 119, x: 1140, y: 670 },
        ]}
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

  return (
    <div className="launch-gif-app screenshot-demo">
      <ProductHeader label="Screenshot to editable React app" />
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
            <div className={`upload-zone ${uploaded ? "has-file" : ""}`}>
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
                <button className={mobile ? "is-active" : ""}>
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
                <div className="generated-browser">
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
        clicks={[22, 34, 81]}
        points={[
          { frame: 0, x: 1135, y: 675 },
          { frame: 21, x: 420, y: 315 },
          { frame: 33, x: 421, y: 594 },
          { frame: 70, x: 1020, y: 600 },
          { frame: 81, x: 1110, y: 111 },
          { frame: 105, x: 1028, y: 560 },
          { frame: 119, x: 1135, y: 675 },
        ]}
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
  const repairing = frame >= 40 && frame < 57;
  const repaired = frame >= 57;
  const exportOpen = frame >= 83;
  const zipVerified = frame >= 98;

  return (
    <div className="launch-gif-app verification-demo">
      <ProductHeader label="Verify, repair, and export" />
      <div className="launch-gif-workspace">
        <Rail active="Quality" />
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
              <span className={`runtime-chip ${repaired ? "is-passed" : ""}`}>
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
              <button className="export-trigger">
                <Download /> Export
              </button>
            </div>
          </section>
          <aside className={`quality-panel ${repaired ? "is-passed" : ""}`}>
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
            <button className="repair-button">
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
              <button className={zipVerified ? "is-complete" : ""}>
                <span>
                  <Download />
                </span>
                <strong>{zipVerified ? "ZIP ready" : "Download ZIP"}</strong>
                <small>Source, setup, and quality report</small>
                {zipVerified && <CheckCircle2 />}
              </button>
              <button>
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
        clicks={[18, 39, 80, 96, 103]}
        points={[
          { frame: 0, x: 1138, y: 674 },
          { frame: 17, x: 120, y: 246 },
          { frame: 38, x: 1060, y: 556 },
          { frame: 65, x: 965, y: 620 },
          { frame: 79, x: 775, y: 700 },
          { frame: 95, x: 472, y: 474 },
          { frame: 103, x: 795, y: 474 },
          { frame: 119, x: 1138, y: 674 },
        ]}
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
