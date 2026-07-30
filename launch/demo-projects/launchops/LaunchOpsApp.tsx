import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  ChevronDown,
  CircleHelp,
  CloudCog,
  Code2,
  Database,
  Download,
  File,
  FileCode2,
  Filter,
  Folder,
  Github,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  TerminalSquare,
  Users,
  Webhook,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  DemoController,
  DemoStateBoundary,
  useDemoController,
} from "../shared/demo-state";
import {
  opsActivity,
  opsFiles,
  opsProjects,
  type OpsProject,
  type OpsRole,
  type OpsStatus,
} from "./data";
import "../shared/demo-state.css";
import "./launchops.css";

export type LaunchOpsView = "auth" | "dashboard" | "project" | "verification";
const base = "/launch-demo/launchops";

export function LaunchOpsApp({ view = "dashboard" }: { view?: LaunchOpsView }) {
  const controller = useDemoController();
  return (
    <DemoStateBoundary
      state={controller.state}
      appName="LaunchOps demo"
      emptyTitle="No projects match this view"
      emptyBody="Change the sample filters or restore the deterministic fixture to repopulate the operations workspace."
    >
      <div className="lo-root" data-render-ready="true">
        {view === "auth" ? (
          <AuthView verified={controller.state === "verified"} />
        ) : (
          <LaunchOpsShell
            view={view}
            verified={controller.state === "verified"}
          />
        )}
        <DemoController
          state={controller.state}
          onChange={controller.setDemoState}
          onReset={controller.reset}
          visible={controller.controlsVisible}
        />
      </div>
    </DemoStateBoundary>
  );
}

function OpsLogo() {
  return (
    <a className="lo-logo" href={base}>
      <span>LO</span>
      <strong>LaunchOps</strong>
    </a>
  );
}

function AuthView({ verified }: { verified: boolean }) {
  const [email, setEmail] = useState("drew@sample.launchops.test");
  const [signedIn, setSignedIn] = useState(verified);
  if (signedIn)
    return (
      <main className="lo-auth-success">
        <span>
          <Check />
        </span>
        <h1>Sample session created.</h1>
        <p>You are signed in as the fixture workspace owner.</p>
        <a href={base}>
          Open the control room <ArrowRight size={17} />
        </a>
      </main>
    );
  return (
    <main className="lo-auth">
      <section className="lo-auth-story">
        <OpsLogo />
        <div>
          <span>OPERATIONS WITHOUT GUESSWORK</span>
          <h1>Release decisions with the evidence attached.</h1>
          <p>
            LaunchOps keeps projects, integration health, verification, and
            export status in one inspectable workspace.
          </p>
        </div>
        <small>
          Interactive launch demo. All identities and records are fictional
          sample data.
        </small>
      </section>
      <section className="lo-auth-panel">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSignedIn(true);
          }}
        >
          <span>
            <LockKeyhole size={20} />
          </span>
          <h2>Sign in to the sample workspace</h2>
          <p>
            Use the prefilled fixture identity. No authentication service is
            contacted.
          </p>
          <label>
            Work email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input type="password" defaultValue="fixture-password" required />
          </label>
          <button type="submit">
            Continue to LaunchOps <ArrowRight size={16} />
          </button>
          <div className="lo-auth-separator">
            <span>or use a mocked provider</span>
          </div>
          <button
            className="lo-github-auth"
            type="button"
            onClick={() => setSignedIn(true)}
          >
            <Github size={17} /> Continue with GitHub <small>Mocked</small>
          </button>
        </form>
      </section>
    </main>
  );
}

function LaunchOpsShell({
  view,
  verified,
}: {
  view: Exclude<LaunchOpsView, "auth">;
  verified: boolean;
}) {
  const [role, setRole] = useState<OpsRole>("Owner");
  const [navOpen, setNavOpen] = useState(false);
  const navItems = [
    ["Overview", LayoutDashboard, base, true],
    ["Projects", Boxes, `${base}/project`, true],
    ["Verification", ShieldCheck, `${base}/verification`, true],
    ["Integrations", Webhook, `${base}?panel=integrations`, role !== "Viewer"],
    ["Team", Users, `${base}?panel=team`, role === "Owner"],
  ] as const;
  return (
    <main className="lo-app">
      <aside className={navOpen ? "lo-sidebar is-open" : "lo-sidebar"}>
        <OpsLogo />
        <button
          className="lo-nav-close"
          type="button"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
        >
          <X />
        </button>
        <nav aria-label="LaunchOps workspace navigation">
          {navItems
            .filter((item) => item[3])
            .map(([label, Icon, href]) => (
              <a
                className={
                  (view === "dashboard" && label === "Overview") ||
                  (view === "project" && label === "Projects") ||
                  (view === "verification" && label === "Verification")
                    ? "is-active"
                    : ""
                }
                href={href}
                key={label}
              >
                <Icon />
                {label}
              </a>
            ))}
        </nav>
        <div className="lo-role-card">
          <span>Workspace role</span>
          <select
            aria-label="Workspace role"
            value={role}
            onChange={(event) => setRole(event.target.value as OpsRole)}
          >
            <option>Owner</option>
            <option>Developer</option>
            <option>Viewer</option>
          </select>
          <small>Navigation updates for this sample role.</small>
        </div>
        <a className="lo-profile" href={`${base}/auth`}>
          <span>DS</span>
          <div>
            <strong>Drew Sepeczi</strong>
            <small>Sample workspace</small>
          </div>
        </a>
      </aside>
      <section className="lo-main">
        <header className="lo-topbar">
          <button
            className="lo-nav-open"
            type="button"
            aria-label="Open navigation"
            onClick={() => setNavOpen(true)}
          >
            <Menu />
          </button>
          <div>
            <span>August launch</span>
            <ChevronDown />
          </div>
          <div className="lo-top-actions">
            <button type="button" aria-label="Help">
              <CircleHelp />
            </button>
            <button type="button" aria-label="Settings">
              <Settings />
            </button>
            <span className="lo-sample-label">SAMPLE DATA</span>
          </div>
        </header>
        {view === "dashboard" && <OpsDashboard verified={verified} />}
        {view === "project" && <OpsProjectDetail />}
        {view === "verification" && <OpsVerification verified={verified} />}
      </section>
    </main>
  );
}

function OpsDashboard({ verified }: { verified: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | OpsStatus>("All");
  const [active, setActive] = useState<OpsProject | null>(
    verified ? opsProjects[0] : null,
  );
  const projects = useMemo(
    () =>
      opsProjects.filter(
        (project) =>
          (status === "All" || project.status === status) &&
          `${project.name} ${project.customer} ${project.owner}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, status],
  );
  return (
    <div className="lo-dashboard-view">
      <section className="lo-page-heading">
        <span>Release control room</span>
        <h1>Know what needs a decision.</h1>
        <p>
          Fixture metrics summarize five sample projects. They are not
          production telemetry.
        </p>
      </section>
      <section className="lo-metrics">
        <article>
          <span>Active projects</span>
          <strong>5</strong>
          <small>Across three environments</small>
        </article>
        <article>
          <span>Open reviews</span>
          <strong>2</strong>
          <small>Both have assigned owners</small>
        </article>
        <article>
          <span>Runtime failures</span>
          <strong>1</strong>
          <small>Sample webhook fixture</small>
        </article>
        <article>
          <span>Export ready</span>
          <strong>3</strong>
          <small>Current sample source</small>
        </article>
      </section>
      <div className="lo-dashboard-grid">
        <section className="lo-projects-panel">
          <header>
            <div>
              <h2>Projects</h2>
              <span>Deterministic database fixture</span>
            </div>
            <a href={`${base}/project`}>
              Open project <ArrowRight />
            </a>
          </header>
          <div className="lo-table-tools">
            <label>
              <Search />
              <input
                aria-label="Search projects"
                placeholder="Search projects, customers, owners"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              <Filter />
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "All" | OpsStatus)
                }
              >
                <option>All</option>
                <option>Healthy</option>
                <option>Review</option>
                <option>Blocked</option>
              </select>
            </label>
          </div>
          <div
            className="lo-project-table"
            role="table"
            aria-label="Sample projects"
          >
            <div className="lo-table-head" role="row">
              <span>Project</span>
              <span>Environment</span>
              <span>Status</span>
              <span>Owner</span>
              <span>Updated</span>
            </div>
            {projects.map((project) => (
              <button
                type="button"
                role="row"
                onClick={() => setActive(project)}
                key={project.id}
              >
                <span>
                  <strong>{project.name}</strong>
                  <small>{project.customer}</small>
                </span>
                <span>{project.environment}</span>
                <span>
                  <em
                    className={`lo-status lo-status-${project.status.toLowerCase()}`}
                  >
                    {project.status}
                  </em>
                </span>
                <span>{project.owner}</span>
                <span>{project.updated}</span>
              </button>
            ))}
          </div>
        </section>
        <aside className="lo-activity">
          <header>
            <h2>Activity</h2>
            <Activity />
          </header>
          {opsActivity.map(([event, project, time, actor]) => (
            <article key={`${event}-${project}`}>
              <span className={event.includes("failed") ? "is-failure" : ""}>
                {event.includes("failed") ? <AlertTriangle /> : <Check />}
              </span>
              <div>
                <strong>{event}</strong>
                <p>{project}</p>
                <small>
                  {time} by {actor}
                </small>
              </div>
            </article>
          ))}
        </aside>
      </div>
      {active && (
        <ProjectDrawer project={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}

function ProjectDrawer({
  project,
  onClose,
}: {
  project: OpsProject;
  onClose: () => void;
}) {
  return (
    <div
      className="lo-drawer-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <aside
        className="lo-project-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${project.name} details`}
      >
        <header>
          <div>
            <span>{project.id}</span>
            <h2>{project.name}</h2>
            <p>{project.customer}</p>
          </div>
          <button
            type="button"
            aria-label="Close project details"
            onClick={onClose}
          >
            <X />
          </button>
        </header>
        <section className="lo-drawer-summary">
          <div>
            <span>Status</span>
            <strong
              className={`lo-status lo-status-${project.status.toLowerCase()}`}
            >
              {project.status}
            </strong>
          </div>
          <div>
            <span>Environment</span>
            <strong>{project.environment}</strong>
          </div>
          <div>
            <span>Requests</span>
            <strong>{project.requests}</strong>
          </div>
        </section>
        <section>
          <h3>Next decision</h3>
          <p>
            Review the sample runtime evidence before approving this rollout.
          </p>
          <a href={`${base}/verification`}>
            Open verification <ArrowRight />
          </a>
        </section>
        <section>
          <h3>Integration state</h3>
          <div className="lo-integration-row">
            <Webhook />
            <div>
              <strong>Billing webhook</strong>
              <span>Mocked integration</span>
            </div>
            <em>Needs review</em>
          </div>
          <div className="lo-integration-row">
            <Database />
            <div>
              <strong>Fixture database</strong>
              <span>Local deterministic records</span>
            </div>
            <em>Connected</em>
          </div>
        </section>
      </aside>
    </div>
  );
}

function OpsProjectDetail() {
  const project = opsProjects[0];
  const [selectedFile, setSelectedFile] = useState("data.ts");
  const sourcePreview =
    selectedFile === "data.ts"
      ? `export const opsProjects: OpsProject[] = [\n  {\n    id: "OP-207",\n    name: "Billing API rollout",\n    status: "Review",\n    requests: "18.4k",\n  },\n];`
      : selectedFile === "LaunchOpsApp.tsx"
        ? `export function LaunchOpsApp({ view = "dashboard" }) {\n  const controller = useDemoController();\n  return <DemoStateBoundary state={controller.state} />;\n}`
        : `Real demo source\nSelected file: ${selectedFile}\nOpen launch/demo-projects/launchops to inspect the full file.`;
  return (
    <div className="lo-project-view">
      <a className="lo-back" href={base}>
        <ArrowLeft /> Back to projects
      </a>
      <section className="lo-project-heading">
        <div>
          <span>{project.id} / Production</span>
          <h1>{project.name}</h1>
          <p>Northstar Books</p>
        </div>
        <div>
          <button type="button">
            <Github /> Sample repository
          </button>
          <a href={`${base}/verification`}>Review evidence</a>
        </div>
      </section>
      <section className="lo-project-overview">
        <article>
          <span>Owner</span>
          <strong>Mina Patel</strong>
          <small>Release engineering</small>
        </article>
        <article>
          <span>Last deployment</span>
          <strong>12 minutes ago</strong>
          <small>Sample commit 7f2d6b1</small>
        </article>
        <article>
          <span>API traffic</span>
          <strong>18.4k requests</strong>
          <small>Fixture window, 24 hours</small>
        </article>
      </section>
      <div className="lo-project-layout">
        <section className="lo-file-browser">
          <header>
            <div>
              <FileCode2 />
              <span>Repository preview</span>
            </div>
            <em>Real demo source tree</em>
          </header>
          <div>
            <nav aria-label="Repository files">
              {opsFiles.map(([path, type]) => (
                <button
                  type="button"
                  className={selectedFile === path ? "is-active" : ""}
                  onClick={() => setSelectedFile(path)}
                  key={path}
                >
                  {type === "folder" ? <Folder /> : <File />}
                  <span>{path}</span>
                </button>
              ))}
            </nav>
            <pre>
              <code>{sourcePreview}</code>
            </pre>
          </div>
        </section>
        <aside className="lo-project-side">
          <section>
            <h2>API integrations</h2>
            <div className="lo-integration-row">
              <Webhook />
              <div>
                <strong>Billing webhook</strong>
                <span>Mocked integration</span>
              </div>
              <em>Review</em>
            </div>
            <div className="lo-integration-row">
              <CloudCog />
              <div>
                <strong>Deployment provider</strong>
                <span>Mocked integration</span>
              </div>
              <em>Ready</em>
            </div>
            <div className="lo-integration-row">
              <Database />
              <div>
                <strong>Postgres fixture</strong>
                <span>Deterministic local data</span>
              </div>
              <em>Connected</em>
            </div>
          </section>
          <section>
            <h2>Recent activity</h2>
            <p>Runtime check completed against the sample handler.</p>
            <small>12 minutes ago by Mina</small>
          </section>
        </aside>
      </div>
    </div>
  );
}

function OpsVerification({ verified }: { verified: boolean }) {
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("tab") ?? "static";
  const [tab, setTab] = useState(initial);
  const records = {
    static: {
      icon: Code2,
      title: "Static verification",
      state: "Passed",
      body: "Imports, route contracts, fixture schema, and protected paths were checked against the current sample source.",
      checks: [
        "42 files inspected",
        "0 unresolved imports",
        "Fixture schema valid",
      ],
    },
    runtime: {
      icon: TerminalSquare,
      title: "Runtime verification",
      state: verified ? "Passed fixture" : "Needs review",
      body: verified
        ? "The deterministic sample request completed in the local capture runtime."
        : "One mocked webhook delivery remains unresolved. Production behavior is not claimed.",
      checks: verified
        ? [
            "Health request returned 200",
            "Webhook fixture acknowledged",
            "No console errors",
          ]
        : [
            "Health fixture passed",
            "Webhook fixture failed",
            "External provider not contacted",
          ],
    },
    export: {
      icon: Download,
      title: "Export readiness",
      state: verified ? "Ready fixture" : "Review",
      body: "The sample repository structure is complete enough for a deterministic export rehearsal.",
      checks: [
        "Source tree included",
        "Environment example included",
        verified ? "Sample archive validated" : "Archive validation not run",
      ],
    },
  } as const;
  const record = records[tab as keyof typeof records] ?? records.static;
  const Icon = record.icon;
  return (
    <div className="lo-verification">
      <section className="lo-page-heading">
        <span>Evidence by state</span>
        <h1>Verification stays specific.</h1>
        <p>
          Every result below is labeled as fixture evidence. It is not
          production telemetry.
        </p>
      </section>
      <nav aria-label="Verification views">
        <button
          className={tab === "static" ? "is-active" : ""}
          onClick={() => setTab("static")}
        >
          <Code2 /> Static
        </button>
        <button
          className={tab === "runtime" ? "is-active" : ""}
          onClick={() => setTab("runtime")}
        >
          <TerminalSquare /> Runtime
        </button>
        <button
          className={tab === "export" ? "is-active" : ""}
          onClick={() => setTab("export")}
        >
          <Download /> Export readiness
        </button>
      </nav>
      <div className="lo-verification-grid">
        <section className="lo-verification-report">
          <header>
            <span>
              <Icon />
            </span>
            <div>
              <small>SAMPLE VERIFICATION RECORD</small>
              <h2>{record.title}</h2>
            </div>
            <em
              className={
                record.state.includes("Passed") ||
                record.state.includes("Ready")
                  ? "is-good"
                  : ""
              }
            >
              {record.state}
            </em>
          </header>
          <p>{record.body}</p>
          <div className="lo-check-list">
            {record.checks.map((check) => (
              <div key={check}>
                <span>
                  {check.includes("failed") || check.includes("not run") ? (
                    <AlertTriangle />
                  ) : (
                    <Check />
                  )}
                </span>
                <strong>{check}</strong>
              </div>
            ))}
          </div>
          <footer>
            <span>Evidence source</span>
            <strong>Local deterministic capture fixture</strong>
          </footer>
        </section>
        <aside>
          <section>
            <h2>Export package</h2>
            <div>
              <FileCode2 />
              <span>
                <strong>47 source files</strong>
                <small>Sample repository</small>
              </span>
            </div>
            <div>
              <KeyRound />
              <span>
                <strong>.env.example</strong>
                <small>No secrets included</small>
              </span>
            </div>
            <div>
              <ShieldCheck />
              <span>
                <strong>verification.json</strong>
                <small>Fixture evidence receipt</small>
              </span>
            </div>
          </section>
          <button type="button">
            <Download /> Prepare sample export
          </button>
        </aside>
      </div>
    </div>
  );
}
