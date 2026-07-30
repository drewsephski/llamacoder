/* eslint-disable @next/next/no-img-element -- standalone Vite renderer needs lossless local capture pixels */
import {
  ArrowRight,
  Check,
  CircleDollarSign,
  Code2,
  Download,
  Gauge,
  Github,
  Laptop,
  LayoutTemplate,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";

import { formatModelCreditRange } from "@/lib/billing/config";
import { isPlanModeAvailable, MODELS } from "@/lib/constants";

import {
  AssetFrame,
  BrowserImage,
  ScreenshotLabel,
  StageChip,
  StatusMark,
  fileAsset,
} from "./shared";

const screenshot = (filename: string) =>
  fileAsset(`launch/screenshots/${filename}`);

export function GalleryAsset({ index }: { index: number }) {
  switch (index) {
    case 1:
      return <CompleteWorkflow />;
    case 2:
      return <PlanMode />;
    case 3:
      return <ProjectEditing />;
    case 4:
      return <Verification />;
    case 5:
      return <ModelChoice />;
    case 6:
      return <CodeOwnership />;
    case 7:
      return <RealApplications />;
    case 8:
      return <FounderStory />;
    default:
      return <CompleteWorkflow />;
  }
}

function CompleteWorkflow() {
  return (
    <AssetFrame
      label="From rough idea to React app you own"
      className="complete-workflow"
    >
      <section className="asset-heading compact-heading">
        <p className="asset-eyebrow">THE COMPLETE WORKFLOW</p>
        <h1>From rough idea to React app you own</h1>
      </section>

      <div className="complete-grid">
        <div className="complete-left">
          <div className="rough-prompt">
            <MessageSquareText size={22} strokeWidth={1.8} />
            <p>
              Build a field-service app for my team. I only have the rough
              workflow.
            </p>
          </div>
          <div
            className="workflow-line"
            aria-label="Interview, Plan, Build, Verify, Export"
          >
            {["Interview", "Plan", "Build", "Verify", "Export"].map(
              (step, stepIndex) => (
                <div className="workflow-step" key={step}>
                  <span>{stepIndex + 1}</span>
                  <strong>{step}</strong>
                </div>
              ),
            )}
          </div>
          <p className="asset-support">
            Squid keeps the brief, decisions, source, and proof connected from
            start to handoff.
          </p>
        </div>
        <div className="complete-visual">
          <BrowserImage
            src={screenshot("fieldflow-app.png")}
            alt="FieldFlow React application"
            objectPosition="center"
          />
          <ScreenshotLabel>
            <Check size={15} /> Runnable React application
          </ScreenshotLabel>
        </div>
      </div>
    </AssetFrame>
  );
}

function PlanMode() {
  const questions = [
    ["Who needs this first?", "Field team", "Dispatcher", "Both"],
    ["What must persist?", "Quotes", "Schedule", "Customer history"],
    [
      "What is the core flow?",
      "Request to quote",
      "Quote to booking",
      "Full lifecycle",
    ],
  ];

  return (
    <AssetFrame
      label="Squid asks the questions your first prompt misses"
      className="plan-mode-frame"
    >
      <section className="asset-heading narrow-heading">
        <p className="asset-eyebrow">PLAN MODE</p>
        <h1>Squid asks the questions your first prompt misses</h1>
      </section>
      <div className="plan-layout">
        <div className="plan-start">
          <span>ROUGH IDEA</span>
          <p>“Build an app to quote jobs and manage the schedule.”</p>
          <ArrowRight className="plan-arrow" size={25} />
        </div>
        <section className="interview-stack">
          {questions.map(([question, ...options], questionIndex) => (
            <article key={question} className="interview-card">
              <header>
                <span>{questionIndex + 1}</span>
                <strong>{question}</strong>
              </header>
              <div>
                {options.map((option, optionIndex) => (
                  <span
                    className={optionIndex === 1 ? "is-selected" : ""}
                    key={option}
                  >
                    {option}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
        <section className="approved-plan">
          <div className="plan-doc-head">
            <div>
              <span>PRODUCT PLAN</span>
              <h2>FieldFlow</h2>
            </div>
            <ShieldCheck size={24} />
          </div>
          <dl>
            <div>
              <dt>Users</dt>
              <dd>Dispatchers and field teams</dd>
            </div>
            <div>
              <dt>Core flow</dt>
              <dd>Request, quote, approve, schedule</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>Customers, jobs, quotes, availability</dd>
            </div>
            <div>
              <dt>Acceptance</dt>
              <dd>Keyboard-ready and responsive</dd>
            </div>
          </dl>
          <button>
            <Check size={16} /> Approve plan
          </button>
        </section>
      </div>
      <p className="representative-note">
        Representative Plan Mode sequence using the current interview and
        approval contract.
      </p>
    </AssetFrame>
  );
}

function ProjectEditing() {
  return (
    <AssetFrame
      label="Keep building after generation"
      className="iteration-frame"
    >
      <section className="asset-heading compact-heading">
        <p className="asset-eyebrow">PROJECT-AWARE EDITING</p>
        <h1>Keep building after generation</h1>
      </section>
      <div className="iteration-layout">
        <div className="iteration-context">
          <section
            className="project-conversation"
            aria-label="Representative Squid project conversation"
          >
            <header>
              <div>
                <span className="project-dot" />
                <div>
                  <strong>FieldFlow</strong>
                  <span>PROJECT CONTEXT · VERSION 1</span>
                </div>
              </div>
              <span>Saved</span>
            </header>
            <div className="conversation-body">
              <article className="conversation-system">
                <ShieldCheck size={16} />
                <div>
                  <strong>Existing application is in context</strong>
                  <span>Source, plan, and current version are attached.</span>
                </div>
              </article>
              <article className="conversation-message">
                <span>YOU</span>
                <p>
                  Make the quote ready to send and surface the next available
                  appointment.
                </p>
              </article>
              <article className="conversation-response">
                <span>SQUID</span>
                <p>
                  I will update the quote summary and scheduling card while
                  preserving the current customer flow.
                </p>
                <div>
                  <code>QuoteSummary.tsx</code>
                  <code>ScheduleCard.tsx</code>
                </div>
              </article>
            </div>
            <footer>
              <span>Ask Squid to refine this project</span>
              <button aria-label="Submit follow-up request">
                <ArrowRight size={15} />
              </button>
            </footer>
          </section>
          <ScreenshotLabel>
            <MessageSquareText size={15} /> Source-backed representative editor
          </ScreenshotLabel>
        </div>
        <div className="iteration-change">
          <div className="follow-up-card">
            <span>FOCUSED REQUEST</span>
            <p>
              Make the quote ready to send and surface the next available
              appointment.
            </p>
          </div>
          <div className="compare-apps">
            <figure>
              <img
                src={screenshot("fieldflow-app.png")}
                alt="FieldFlow before the focused edit"
              />
              <figcaption>Existing application</figcaption>
            </figure>
            <ArrowRight size={22} />
            <figure className="is-selected">
              <img
                src={screenshot("fieldflow-app-updated.png")}
                alt="FieldFlow after the focused edit"
              />
              <figcaption>Updated quote panel</figcaption>
            </figure>
          </div>
          <div className="checkpoint-row">
            <RotateCcw size={17} />
            <div>
              <strong>Checkpoint ready</strong>
              <span>Review exact changes or restore selected files.</span>
            </div>
            <button>Review changes</button>
          </div>
        </div>
      </div>
    </AssetFrame>
  );
}

function Verification() {
  const states = [
    {
      title: "Static verification",
      status: "passed" as const,
      label: "Passed",
      body: "Files, imports, protected paths, and baseline accessibility.",
    },
    {
      title: "Runtime verification",
      status: "untested" as const,
      label: "Not run",
      body: "Requires the target runtime and real interaction checks.",
    },
    {
      title: "Export verification",
      status: "untested" as const,
      label: "Not run",
      body: "Runs when the source bundle is prepared for download.",
    },
    {
      title: "External integration",
      status: "review" as const,
      label: "Needs setup",
      body: "Credentials and provider behavior remain unresolved.",
    },
  ];
  return (
    <AssetFrame
      label="Know what actually works"
      theme="dark"
      className="verification-frame"
    >
      <section className="asset-heading compact-heading">
        <p className="asset-eyebrow">SEPARATE EVIDENCE, HONEST STATES</p>
        <h1>Know what actually works</h1>
      </section>
      <div className="verification-layout">
        <div className="verification-source">
          <BrowserImage
            src={screenshot("example-quality.png")}
            alt="Squid public example quality report"
            objectPosition="center"
          />
          <ScreenshotLabel>
            <ShieldCheck size={15} /> Source-backed public quality report
          </ScreenshotLabel>
        </div>
        <section className="verification-states">
          {states.map((state) => (
            <article key={state.title}>
              <StatusMark status={state.status} />
              <div>
                <h2>{state.title}</h2>
                <p>{state.body}</p>
              </div>
              <span className={`state-label state-${state.status}`}>
                {state.label}
              </span>
            </article>
          ))}
          <button className="repair-action">
            <Wrench size={17} /> Open repair
          </button>
        </section>
      </div>
    </AssetFrame>
  );
}

function ModelChoice() {
  const modelOptions = MODELS.slice(0, 5);
  const attributes = [
    [Zap, "Speed", "Fast iteration"],
    [Gauge, "Reasoning", "Deeper planning"],
    [Sparkles, "Visual quality", "High-fidelity output"],
    [CircleDollarSign, "Cost", "Visible credit estimate"],
  ] as const;
  return (
    <AssetFrame
      label="Choose speed, reasoning, visual quality, or cost"
      className="model-frame"
    >
      <section className="asset-heading model-heading">
        <p className="asset-eyebrow">MODEL CHOICE WITHOUT THE LOGO WALL</p>
        <h1>Choose speed, reasoning, visual quality, or cost</h1>
      </section>
      <div className="model-layout">
        <section className="model-attributes">
          {attributes.map(([Icon, title, body]) => (
            <article key={title}>
              <Icon size={22} strokeWidth={1.8} />
              <div>
                <strong>{title}</strong>
                <span>{body}</span>
              </div>
            </article>
          ))}
          <div className="plan-compatible">
            <ShieldCheck size={18} />
            <div>
              <strong>Plan Mode stays available</strong>
              <span>
                Interview and approval happen before the selected build begins.
              </span>
            </div>
          </div>
        </section>
        <div className="model-source">
          <BrowserImage
            src={screenshot("model-picker.png")}
            alt="Real Squid homepage with the current model trigger"
            objectPosition="top center"
          />
          <section className="source-model-picker" aria-label="Current models">
            <header>
              <div>
                <span>CHOOSE A MODEL</span>
                <strong>Current Squid options</strong>
              </div>
              <span>Credits</span>
            </header>
            {modelOptions.map((model, modelIndex) => (
              <article
                className={modelIndex === 0 ? "is-current" : ""}
                key={model.value}
              >
                <div>
                  <strong>{model.label}</strong>
                  <span>{model.summary}</span>
                </div>
                <div className="model-option-meta">
                  <span>{formatModelCreditRange(model.value)}</span>
                  <em>
                    {isPlanModeAvailable(model.value)
                      ? "Plan Mode"
                      : "Direct Mode"}
                  </em>
                </div>
              </article>
            ))}
          </section>
          <ScreenshotLabel>
            <CircleDollarSign size={15} /> Real trigger, source-backed catalog
            and estimates
          </ScreenshotLabel>
        </div>
      </div>
    </AssetFrame>
  );
}

function CodeOwnership() {
  return (
    <AssetFrame
      label="Export it. Publish it. Continue anywhere."
      theme="dark"
      className="ownership-frame"
    >
      <section className="asset-heading ownership-heading">
        <p className="asset-eyebrow">PORTABLE SOURCE</p>
        <h1>Export it. Publish it. Continue anywhere.</h1>
      </section>
      <div className="ownership-layout">
        <div className="files-source">
          <BrowserImage
            src={screenshot("example-files.png")}
            alt="Squid source file tree and code view"
            objectPosition="center"
          />
          <ScreenshotLabel>
            <Code2 size={15} /> Inspectable project source
          </ScreenshotLabel>
        </div>
        <section className="handoff-flow">
          <article>
            <span>
              <Download size={20} />
            </span>
            <div>
              <strong>Verify and download ZIP</strong>
              <p>
                Source, scripts, README, quality report, and deploy
                configuration.
              </p>
            </div>
          </article>
          <article>
            <span>
              <Github size={20} />
            </span>
            <div>
              <strong>Publish through GitHub</strong>
              <p>
                Connect a repository, then continue with normal version control.
              </p>
            </div>
          </article>
          <article>
            <span>
              <LayoutTemplate size={20} />
            </span>
            <div>
              <strong>Hand off to deployment</strong>
              <p>
                Use the exported repository with the deployment provider you
                choose.
              </p>
            </div>
          </article>
          <article>
            <span>
              <Laptop size={20} />
            </span>
            <div>
              <strong>Continue in your editor</strong>
              <p>
                The project remains ordinary React code you can run locally.
              </p>
            </div>
          </article>
        </section>
      </div>
    </AssetFrame>
  );
}

function RealApplications() {
  const apps = [
    {
      name: "FieldFlow",
      image: screenshot("fieldflow-app.png"),
      outcome: "Turns site details into a ready-to-schedule quote.",
      provenance: "Reproducible React launch demo",
    },
    {
      name: "LaunchOps",
      image: screenshot("launchops-app.png"),
      outcome:
        "Keeps releases, reviews, and owner actions in one authenticated product concept.",
      provenance: "Reproducible React launch demo",
    },
    {
      name: "Cinder Studio",
      image: fileAsset("public/showcase/cinder-studio.webp"),
      outcome:
        "Turns a screenshot-led direction into a responsive architecture studio site.",
      provenance: "Existing Squid showcase capture",
    },
  ];
  return (
    <AssetFrame
      label="Real applications, not isolated mockups"
      className="applications-frame"
    >
      <section className="asset-heading applications-heading">
        <p className="asset-eyebrow">COMPLETE RESPONSIVE OUTPUTS</p>
        <h1>Real applications, not isolated mockups</h1>
      </section>
      <div className="applications-grid">
        {apps.map((app) => (
          <article key={app.name}>
            <div className="application-image">
              <img src={app.image} alt={`${app.name} application`} />
            </div>
            <div className="application-copy">
              <h2>{app.name}</h2>
              <p>{app.outcome}</p>
              <span>{app.provenance}</span>
            </div>
          </article>
        ))}
      </div>
    </AssetFrame>
  );
}

function FounderStory() {
  return (
    <AssetFrame
      label="Built by one developer for builders"
      theme="dark"
      className="founder-frame"
    >
      <div className="founder-layout">
        <section className="founder-copy">
          <p className="asset-eyebrow">THE MAKER STORY</p>
          <h1>Built by one developer for builders</h1>
          <blockquote>
            “I built Squid because generating the first screen was becoming
            easy, but finishing the product was not.”
          </blockquote>
          <div className="founder-name">
            <strong>Drew Sepeczi</strong>
            <span>Maker of Squid Agent</span>
          </div>
          <div className="founder-stages">
            {["Plan", "Build", "Refine", "Verify", "Export"].map(
              (step, index) => (
                <StageChip label={step} active={index === 4} key={step} />
              ),
            )}
          </div>
        </section>
        <section
          className="founder-product-card"
          aria-label="The product finishing loop"
        >
          <header>
            <span>THE PRODUCT FINISHING LOOP</span>
            <SquidProductMark />
          </header>
          <div className="founder-product-flow">
            <article>
              <span>01</span>
              <div>
                <strong>Start with uncertainty</strong>
                <p>A rough idea, screenshot, or existing site.</p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <strong>Keep decisions attached</strong>
                <p>Interview, plan, approval, and project-aware edits.</p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <strong>Leave with evidence and source</strong>
                <p>Verification states, repair paths, and portable React.</p>
              </div>
            </article>
          </div>
          <footer>
            <Code2 size={17} />
            <span>The first prompt is only the beginning.</span>
          </footer>
        </section>
      </div>
    </AssetFrame>
  );
}

function SquidProductMark() {
  return (
    <span className="founder-product-mark" aria-hidden="true">
      <ShieldCheck size={18} />
    </span>
  );
}
