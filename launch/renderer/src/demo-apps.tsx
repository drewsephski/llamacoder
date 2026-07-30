import { useMemo, useState } from "react";

function FieldFlow({ updated }: { updated: boolean }) {
  const [activeJob, setActiveJob] = useState("River North storefront");
  const jobs = [
    ["River North storefront", "Quote ready", "$4,860"],
    ["Oak Park kitchen", "Site visit", "Thursday"],
    ["West Loop office", "New request", "Unassigned"],
  ];

  return (
    <main
      className={`demo-app fieldflow ${updated ? "is-updated" : ""}`}
      data-render-ready="true"
    >
      <aside className="demo-sidebar">
        <div className="demo-wordmark">
          <span>F</span> FieldFlow
        </div>
        <nav>
          <button className="is-active">Overview</button>
          <button>Requests</button>
          <button>Schedule</button>
          <button>Customers</button>
        </nav>
        <div className="demo-user">
          <span>DS</span>
          <div>
            <strong>Dana Sutton</strong>
            <small>Operations</small>
          </div>
        </div>
      </aside>
      <section className="demo-main">
        <header className="demo-header">
          <div>
            <small>Tuesday, August 18</small>
            <h1>Good morning, Dana.</h1>
          </div>
          <button className="demo-primary">New quote</button>
        </header>
        <div className="fieldflow-layout">
          <section className="fieldflow-jobs">
            <div className="section-heading">
              <div>
                <small>Active work</small>
                <h2>Quotes and visits</h2>
              </div>
              <button>View schedule</button>
            </div>
            <div className="job-list">
              {jobs.map(([name, status, detail]) => (
                <button
                  key={name}
                  onClick={() => setActiveJob(name)}
                  className={activeJob === name ? "is-active" : ""}
                >
                  <span className="job-icon">{name.slice(0, 1)}</span>
                  <span>
                    <strong>{name}</strong>
                    <small>{status}</small>
                  </span>
                  <em>{detail}</em>
                </button>
              ))}
            </div>
          </section>
          <aside className="quote-panel">
            <small>{updated ? "READY TO SEND" : "DRAFT QUOTE"}</small>
            <h2>{activeJob}</h2>
            <dl>
              <div>
                <dt>Scope</dt>
                <dd>Lighting retrofit</dd>
              </div>
              <div>
                <dt>Labor</dt>
                <dd>$2,400</dd>
              </div>
              <div>
                <dt>Materials</dt>
                <dd>$2,460</dd>
              </div>
            </dl>
            <div className="quote-total">
              <span>Estimated total</span>
              <strong>$4,860</strong>
            </div>
            <button className="demo-primary">
              {updated ? "Send quote" : "Review quote"}
            </button>
            {updated && (
              <p className="updated-note">
                Availability checked. Thursday morning is open.
              </p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

function LaunchOps() {
  const [filter, setFilter] = useState("All work");
  const activity = useMemo(
    () => [
      ["API rollout", "Ready for release", "Drew"],
      ["Billing webhook", "Needs review", "Mina"],
      ["Mobile navigation", "Verified", "Jon"],
      ["Launch gallery", "In progress", "Drew"],
    ],
    [],
  );

  return (
    <main className="demo-app launchops" data-render-ready="true">
      <aside className="ops-rail">
        <div className="ops-mark">LO</div>
        <button className="is-active">⌂</button>
        <button>◎</button>
        <button>□</button>
        <button>⚙</button>
      </aside>
      <section className="ops-shell">
        <header className="ops-header">
          <div>
            <small>LAUNCHOPS</small>
            <h1>Release control room</h1>
          </div>
          <div className="ops-person">DS</div>
        </header>
        <div className="ops-summary">
          <article>
            <small>Release</small>
            <strong>August launch</strong>
            <span>4 workstreams active</span>
          </article>
          <article>
            <small>Open review</small>
            <strong>2 items</strong>
            <span>Owners assigned</span>
          </article>
          <article>
            <small>Environment</small>
            <strong>Production</strong>
            <span>Monitoring enabled</span>
          </article>
        </div>
        <div className="ops-grid">
          <section className="ops-work">
            <div className="section-heading">
              <div>
                <small>WORKSTREAM</small>
                <h2>Release queue</h2>
              </div>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option>All work</option>
                <option>Needs review</option>
              </select>
            </div>
            <div className="ops-table">
              {activity.map(([name, status, owner]) => (
                <div key={name}>
                  <strong>{name}</strong>
                  <span
                    className={
                      status === "Verified"
                        ? "verified"
                        : status === "Needs review"
                          ? "review"
                          : ""
                    }
                  >
                    {status}
                  </span>
                  <em>{owner}</em>
                </div>
              ))}
            </div>
          </section>
          <aside className="ops-signal">
            <small>NEXT DECISION</small>
            <h2>Approve the API rollout after the final runtime check.</h2>
            <div className="signal-check">
              <span>✓</span>
              <p>
                <strong>Static checks</strong>
                <small>Passed on current source</small>
              </p>
            </div>
            <div className="signal-check pending">
              <span>-</span>
              <p>
                <strong>Runtime check</strong>
                <small>Awaiting production run</small>
              </p>
            </div>
            <button className="demo-primary">Open review</button>
          </aside>
        </div>
      </section>
    </main>
  );
}

export function DemoApp({
  name,
  updated = false,
}: {
  name: "fieldflow" | "launchops";
  updated?: boolean;
}) {
  return name === "fieldflow" ? <FieldFlow updated={updated} /> : <LaunchOps />;
}
