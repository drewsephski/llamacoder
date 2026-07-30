import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  DemoController,
  DemoStateBoundary,
  useDemoController,
} from "../shared/demo-state";
import { fieldFlowLeads, fieldFlowServices, type LeadStatus } from "./data";
import "../shared/demo-state.css";
import "./fieldflow.css";

export type FieldFlowView = "home" | "quote" | "dashboard" | "customer";

const fieldFlowBase = "/launch-demo/fieldflow";

export function FieldFlowApp({ view = "home" }: { view?: FieldFlowView }) {
  const controller = useDemoController();
  return (
    <DemoStateBoundary
      state={controller.state}
      appName="FieldFlow demo"
      emptyTitle="No service requests yet"
      emptyBody="New quote requests will appear here with customer details and requested appointment windows."
    >
      <div className="ff-root" data-render-ready="true">
        {view === "home" && <FieldFlowHome demoState={controller.state} />}
        {view === "quote" && (
          <FieldFlowQuote verified={controller.state === "verified"} />
        )}
        {view === "dashboard" && (
          <FieldFlowDashboard verified={controller.state === "verified"} />
        )}
        {view === "customer" && <FieldFlowCustomer />}
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

function FieldFlowBrand() {
  return (
    <a className="ff-brand" href={fieldFlowBase} aria-label="FieldFlow home">
      <span>
        <Sparkles size={17} aria-hidden="true" />
      </span>
      FieldFlow
    </a>
  );
}

function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="ff-marketing-nav">
      <FieldFlowBrand />
      <button
        className="ff-menu-button"
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav
        className={open ? "is-open" : ""}
        aria-label="FieldFlow public navigation"
      >
        <a href="#services">Services</a>
        <a href="#process">How it works</a>
        <a href={`${fieldFlowBase}/dashboard`}>Team sign in</a>
        <a className="ff-nav-cta" href={`${fieldFlowBase}/quote`}>
          Request a quote
        </a>
      </nav>
    </header>
  );
}

function FieldFlowHome({ demoState }: { demoState: string }) {
  const [service, setService] = useState("Panel upgrade");
  const [slot, setSlot] = useState("Thu 9:00 AM");
  const [submitted, setSubmitted] = useState(demoState === "verified");

  return (
    <main className="ff-site">
      <MarketingNav />
      <section className="ff-hero">
        <div className="ff-hero-copy">
          <span className="ff-kicker">Northline Home Electric</span>
          <h1>Turn a home repair into a booked visit.</h1>
          <p>
            Choose the work, see real availability, and get a clear quote from a
            licensed local crew.
          </p>
          <div className="ff-hero-actions">
            <a className="ff-primary" href={`${fieldFlowBase}/quote`}>
              Start a quote <ArrowRight size={17} />
            </a>
            <a className="ff-secondary" href="tel:+13125550141">
              <Phone size={16} /> (312) 555-0141
            </a>
          </div>
        </div>
        <form
          className="ff-quick-book"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          {submitted ? (
            <div className="ff-confirmation" role="status">
              <span>
                <Check size={24} />
              </span>
              <h2>Thursday at 9:00 AM is held.</h2>
              <p>We sent the next steps to elena.morales@example.test.</p>
              <button type="button" onClick={() => setSubmitted(false)}>
                Start another request
              </button>
            </div>
          ) : (
            <>
              <div className="ff-form-heading">
                <div>
                  <span>Quick availability</span>
                  <h2>Book the first visit</h2>
                </div>
                <ShieldCheck size={22} aria-label="Secure request" />
              </div>
              <label>
                What needs attention?
                <select
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                >
                  <option>Panel upgrade</option>
                  <option>EV charger install</option>
                  <option>Lighting repair</option>
                  <option>Safety inspection</option>
                </select>
              </label>
              <fieldset>
                <legend>Earliest appointment</legend>
                <div className="ff-slot-grid">
                  {["Thu 9:00 AM", "Thu 1:30 PM", "Fri 8:00 AM"].map((time) => (
                    <button
                      type="button"
                      className={slot === time ? "is-selected" : ""}
                      onClick={() => setSlot(time)}
                      key={time}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label>
                Email for confirmation
                <input
                  type="email"
                  defaultValue="elena.morales@example.test"
                  required
                />
              </label>
              <button className="ff-primary ff-submit" type="submit">
                Hold this time <ArrowRight size={17} />
              </button>
              <small>
                Sample booking. No live service or payment is connected.
              </small>
            </>
          )}
        </form>
      </section>
      <section className="ff-proof-strip" aria-label="Service standards">
        <span>
          <Clock3 size={17} /> Same-week availability
        </span>
        <span>
          <CircleDollarSign size={17} /> Quote before work
        </span>
        <span>
          <ShieldCheck size={17} /> Licensed local crew
        </span>
      </section>
      <section className="ff-services" id="services">
        <div className="ff-section-copy">
          <h2>Help for the work that cannot wait.</h2>
          <p>
            Northline handles residential electrical work across Chicago and
            nearby suburbs.
          </p>
        </div>
        <div className="ff-service-grid">
          {fieldFlowServices.map((item, index) => (
            <article key={item.name}>
              <span>
                {index === 0 ? (
                  <Wrench />
                ) : index === 1 ? (
                  <Sparkles />
                ) : (
                  <ShieldCheck />
                )}
              </span>
              <h3>{item.name}</h3>
              <p>{item.body}</p>
              <small>{item.timeframe}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="ff-process" id="process">
        <div>
          <span>Tell us what changed</span>
          <strong>Describe the issue in plain language.</strong>
        </div>
        <ChevronRight />
        <div>
          <span>Pick a real opening</span>
          <strong>Choose a visit that fits your week.</strong>
        </div>
        <ChevronRight />
        <div>
          <span>Approve the work</span>
          <strong>See the quote before the crew starts.</strong>
        </div>
      </section>
    </main>
  );
}

function FieldFlowQuote({ verified }: { verified: boolean }) {
  const [step, setStep] = useState(verified ? 3 : 1);
  const [date, setDate] = useState("2026-08-20");
  const [time, setTime] = useState("09:00");
  return (
    <main className="ff-quote-page">
      <header>
        <FieldFlowBrand />
        <a href={fieldFlowBase}>Back to site</a>
      </header>
      <div className="ff-quote-shell">
        <aside>
          <span>Request progress</span>
          {["Service details", "Appointment", "Confirmation"].map(
            (label, index) => (
              <button
                type="button"
                className={
                  step === index + 1
                    ? "is-active"
                    : step > index + 1
                      ? "is-done"
                      : ""
                }
                onClick={() => setStep(index + 1)}
                key={label}
              >
                <span>
                  {step > index + 1 ? <Check size={14} /> : index + 1}
                </span>
                {label}
              </button>
            ),
          )}
        </aside>
        <section className="ff-quote-step">
          {step === 1 && (
            <>
              <span>Tell us about the work</span>
              <h1>What needs attention?</h1>
              <label>
                Service
                <select defaultValue="Panel upgrade">
                  <option>Panel upgrade</option>
                  <option>EV charger install</option>
                  <option>Lighting repair</option>
                </select>
              </label>
              <label>
                What are you noticing?
                <textarea defaultValue="The office circuit trips when the air conditioner starts." />
              </label>
              <label>
                Service address
                <input defaultValue="1848 W Belle Plaine Ave, Chicago, IL" />
              </label>
              <button
                className="ff-primary"
                type="button"
                onClick={() => setStep(2)}
              >
                Choose a visit <ArrowRight size={17} />
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <span>Choose a visit</span>
              <h1>Pick a time that works.</h1>
              <div className="ff-date-time">
                <label>
                  <CalendarDays size={18} /> Date
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </label>
                <label>
                  <Clock3 size={18} /> Time
                  <select
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                  >
                    <option value="09:00">9:00 AM</option>
                    <option value="13:30">1:30 PM</option>
                  </select>
                </label>
              </div>
              <div className="ff-visit-summary">
                <strong>Thursday, August 20 at 9:00 AM</strong>
                <span>Arrival window: 9:00-9:30 AM</span>
              </div>
              <button
                className="ff-primary"
                type="button"
                onClick={() => setStep(3)}
              >
                Confirm request <ArrowRight size={17} />
              </button>
            </>
          )}
          {step === 3 && (
            <div className="ff-final-confirmation">
              <span>
                <Check size={25} />
              </span>
              <h1>Your visit is confirmed.</h1>
              <p>
                Northline will arrive Thursday, August 20 between 9:00 and 9:30
                AM.
              </p>
              <dl>
                <div>
                  <dt>Request</dt>
                  <dd>FF-1842</dd>
                </div>
                <div>
                  <dt>Service</dt>
                  <dd>Panel upgrade</dd>
                </div>
                <div>
                  <dt>Customer</dt>
                  <dd>Elena Morales</dd>
                </div>
              </dl>
              <a className="ff-primary" href={fieldFlowBase}>
                Return home
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function FieldFlowDashboard({ verified }: { verified: boolean }) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("FF-1842");
  const [statuses, setStatuses] = useState<Record<string, LeadStatus>>({});
  const [quote, setQuote] = useState("4860");
  const leads = useMemo(
    () =>
      fieldFlowLeads.filter((lead) =>
        `${lead.customer} ${lead.service} ${lead.address}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  const active =
    fieldFlowLeads.find((lead) => lead.id === activeId) ?? fieldFlowLeads[0];
  const status =
    statuses[active.id] ?? (verified ? "Scheduled" : active.status);
  return (
    <main className="ff-dashboard">
      <aside className="ff-dashboard-nav">
        <FieldFlowBrand />
        <nav aria-label="FieldFlow team navigation">
          <a className="is-active" href={`${fieldFlowBase}/dashboard`}>
            <LayoutDashboard /> Overview
          </a>
          <a href={`${fieldFlowBase}/dashboard?filter=leads`}>
            <Users /> Leads <span>3</span>
          </a>
          <a href={`${fieldFlowBase}/dashboard?filter=schedule`}>
            <CalendarDays /> Schedule
          </a>
        </nav>
        <a className="ff-team-profile" href={`${fieldFlowBase}/customer`}>
          <span>DS</span>
          <div>
            <strong>Dana Sutton</strong>
            <small>Owner</small>
          </div>
        </a>
      </aside>
      <section className="ff-dashboard-main">
        <header>
          <div>
            <span>Tuesday, August 18</span>
            <h1>Turn requests into scheduled work.</h1>
          </div>
          <a className="ff-primary" href={`${fieldFlowBase}/quote`}>
            New quote
          </a>
        </header>
        <div className="ff-dashboard-metrics">
          <article>
            <span>New leads</span>
            <strong>3</strong>
            <small>2 need a response today</small>
          </article>
          <article>
            <span>Quoted value</span>
            <strong>$7,680</strong>
            <small>Across 2 open quotes</small>
          </article>
          <article>
            <span>Booked visits</span>
            <strong>5</strong>
            <small>Next visit Thursday at 9:00</small>
          </article>
        </div>
        <div className="ff-lead-workspace">
          <section className="ff-lead-list">
            <div className="ff-list-toolbar">
              <div>
                <Search size={16} />
                <input
                  aria-label="Search leads"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search customers or work"
                />
              </div>
              <button type="button">Status</button>
            </div>
            {leads.length ? (
              leads.map((lead) => (
                <button
                  type="button"
                  className={lead.id === active.id ? "is-active" : ""}
                  onClick={() => setActiveId(lead.id)}
                  key={lead.id}
                >
                  <span className="ff-avatar">{lead.initials}</span>
                  <span>
                    <strong>{lead.customer}</strong>
                    <small>{lead.service}</small>
                  </span>
                  <em
                    className={`ff-status ff-status-${(statuses[lead.id] ?? lead.status).toLowerCase()}`}
                  >
                    {statuses[lead.id] ?? lead.status}
                  </em>
                  <span className="ff-lead-value">
                    {lead.quote
                      ? `$${lead.quote.toLocaleString()}`
                      : "No quote"}
                  </span>
                </button>
              ))
            ) : (
              <div className="ff-inline-empty">
                <Search />
                <strong>No matching leads</strong>
                <span>Try a customer name, service, or address.</span>
              </div>
            )}
          </section>
          <aside className="ff-lead-detail">
            <header>
              <span className="ff-avatar">{active.initials}</span>
              <div>
                <span>{active.id}</span>
                <h2>{active.customer}</h2>
                <p>
                  {active.service} at {active.address}
                </p>
              </div>
            </header>
            <div className="ff-detail-contact">
              <a href={`tel:${active.phone}`}>
                <Phone /> {active.phone}
              </a>
              <a href={`mailto:${active.email}`}>{active.email}</a>
            </div>
            <label>
              Status
              <select
                value={status}
                onChange={(event) =>
                  setStatuses((current) => ({
                    ...current,
                    [active.id]: event.target.value as LeadStatus,
                  }))
                }
              >
                <option>New</option>
                <option>Quoted</option>
                <option>Scheduled</option>
                <option>Completed</option>
              </select>
            </label>
            <label>
              Quote amount
              <div className="ff-money-input">
                <span>$</span>
                <input
                  inputMode="decimal"
                  value={quote}
                  onChange={(event) => setQuote(event.target.value)}
                />
              </div>
            </label>
            <label>
              Appointment
              <select defaultValue={verified ? "confirmed" : "hold"}>
                <option value="hold">Thu, Aug 20 at 9:00 AM - held</option>
                <option value="confirmed">
                  Thu, Aug 20 at 9:00 AM - confirmed
                </option>
                <option>Not scheduled</option>
              </select>
            </label>
            <div className="ff-customer-note">
              <span>Customer note</span>
              <p>{active.note}</p>
            </div>
            <a className="ff-primary" href={`${fieldFlowBase}/customer`}>
              Open customer <ArrowRight size={16} />
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}

function FieldFlowCustomer() {
  const lead = fieldFlowLeads[0];
  return (
    <main className="ff-customer-page">
      <header>
        <FieldFlowBrand />
        <a href={`${fieldFlowBase}/dashboard`}>Back to dashboard</a>
      </header>
      <section className="ff-customer-head">
        <div className="ff-avatar">{lead.initials}</div>
        <div>
          <span>{lead.id}</span>
          <h1>{lead.customer}</h1>
          <p>{lead.address}</p>
        </div>
        <button type="button">
          <Phone size={16} /> Call customer
        </button>
      </section>
      <div className="ff-customer-grid">
        <section>
          <h2>Current request</h2>
          <dl>
            <div>
              <dt>Service</dt>
              <dd>{lead.service}</dd>
            </div>
            <div>
              <dt>Quote</dt>
              <dd>$4,860 ready</dd>
            </div>
            <div>
              <dt>Appointment</dt>
              <dd>{lead.appointment}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className="ff-status ff-status-quoted">Quoted</span>
              </dd>
            </div>
          </dl>
        </section>
        <section>
          <h2>Activity</h2>
          <ol>
            <li>
              <span>
                <Check />
              </span>
              <div>
                <strong>Quote prepared</strong>
                <small>Today at 10:24 AM by Dana</small>
              </div>
            </li>
            <li>
              <span>
                <CalendarDays />
              </span>
              <div>
                <strong>Appointment held</strong>
                <small>Today at 9:18 AM</small>
              </div>
            </li>
            <li>
              <span>
                <Users />
              </span>
              <div>
                <strong>Request received</strong>
                <small>Today at 8:42 AM</small>
              </div>
            </li>
          </ol>
        </section>
        <aside>
          <h2>Contact</h2>
          <a href={`tel:${lead.phone}`}>{lead.phone}</a>
          <a href={`mailto:${lead.email}`}>{lead.email}</a>
          <h2>Request note</h2>
          <p>{lead.note}</p>
        </aside>
      </div>
    </main>
  );
}
