/* eslint-disable @next/next/no-img-element -- isolated Vite launch demo with local generated assets */
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  Menu,
  MoveUpRight,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  DemoController,
  DemoStateBoundary,
  useDemoController,
} from "../shared/demo-state";
import monolithStair from "./assets/monolith-stair.png";
import stoneCourt from "./assets/stone-court-hero.png";
import tideHouse from "./assets/tide-house.png";
import "../shared/demo-state.css";
import "./cinder-studio.css";

export type CinderView = "home" | "project" | "contact";
const base = "/launch-demo/cinder-studio";
const imageSource = (asset: unknown) =>
  typeof asset === "string" ? asset : (asset as { src: string }).src;
const stoneCourtUrl = imageSource(stoneCourt);
const monolithStairUrl = imageSource(monolithStair);
const tideHouseUrl = imageSource(tideHouse);

const projects = [
  {
    name: "Stone Court",
    type: "Residence and landscape",
    place: "Lake Michigan",
    image: stoneCourtUrl,
    href: `${base}/project/stone-court`,
  },
  {
    name: "Monolith Stair",
    type: "Interior and circulation",
    place: "Chicago",
    image: monolithStairUrl,
    href: `${base}/project/stone-court?image=stair`,
  },
  {
    name: "Tide House",
    type: "Coastal residence",
    place: "North Atlantic",
    image: tideHouseUrl,
    href: `${base}/project/stone-court?image=tide`,
  },
];

export function CinderStudioApp({ view = "home" }: { view?: CinderView }) {
  const controller = useDemoController();
  return (
    <DemoStateBoundary
      state={controller.state}
      appName="Cinder Studio demo"
      emptyTitle="No selected work in this sample state"
      emptyBody="Restore the deterministic project set to view Stone Court, Monolith Stair, and Tide House."
    >
      <div className="cs-root" data-render-ready="true">
        {view === "home" && (
          <CinderHome mobileOpen={controller.state === "mobile"} />
        )}
        {view === "project" && <CinderProject />}
        {view === "contact" && (
          <CinderContact verified={controller.state === "verified"} />
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

function CinderWordmark() {
  return (
    <a className="cs-wordmark" href={base}>
      Cinder<span>Studio</span>
    </a>
  );
}

function CinderNav({
  initiallyOpen = false,
  dark = false,
}: {
  initiallyOpen?: boolean;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <header className={`cs-nav ${dark ? "is-dark" : ""}`}>
      <CinderWordmark />
      <nav
        className={open ? "is-open" : ""}
        aria-label="Cinder Studio navigation"
      >
        <a href={`${base}#work`}>Work</a>
        <a href={`${base}#services`}>Services</a>
        <a href={`${base}#studio`}>Studio</a>
        <a href={`${base}/contact`}>Contact</a>
      </nav>
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}

function CinderHome({ mobileOpen }: { mobileOpen: boolean }) {
  return (
    <main className="cs-site">
      <section className="cs-hero">
        <img
          src={stoneCourtUrl}
          alt="Original concrete courtyard pavilion at blue hour"
        />
        <div className="cs-hero-shade" />
        <CinderNav initiallyOpen={mobileOpen} dark />
        <div className="cs-hero-copy">
          <span>Architecture for elemental places</span>
          <h1>We make space for weather, ritual, and quiet.</h1>
          <a href="#work">
            View selected work <ArrowRight />
          </a>
        </div>
        <div className="cs-hero-project">
          <span>Stone Court</span>
          <strong>Residence and landscape</strong>
        </div>
      </section>
      <section className="cs-intro" id="studio">
        <p>
          Cinder Studio designs homes and interiors around material, climate,
          and the daily patterns that give a place meaning.
        </p>
        <div>
          <strong>Chicago / Great Lakes</strong>
          <span>Independent architecture and interiors studio</span>
        </div>
      </section>
      <section className="cs-work" id="work">
        <header>
          <h2>Selected projects</h2>
          <a href={`${base}/project/stone-court`}>
            Open project index <MoveUpRight />
          </a>
        </header>
        <div className="cs-project-grid">
          {projects.map((project, index) => (
            <a
              className={`cs-project cs-project-${index + 1}`}
              href={project.href}
              key={project.name}
            >
              <div>
                <img
                  src={project.image}
                  alt={`${project.name}, original architectural study`}
                />
              </div>
              <footer>
                <span>
                  <strong>{project.name}</strong>
                  <small>{project.type}</small>
                </span>
                <em>{project.place}</em>
              </footer>
            </a>
          ))}
        </div>
      </section>
      <section className="cs-philosophy">
        <div className="cs-material-swatch">
          <span />
          <span />
          <span />
        </div>
        <div>
          <h2>Durable work begins with fewer gestures.</h2>
          <p>
            We tune structure, daylight, and circulation before adding objects.
            The result is specific, calm, and made to age well.
          </p>
          <a href={`${base}/contact`}>
            Discuss a project <ArrowRight />
          </a>
        </div>
      </section>
      <section className="cs-services" id="services">
        <header>
          <h2>Practice</h2>
          <p>
            One studio across architecture, interiors, and the spaces between.
          </p>
        </header>
        <div>
          <article>
            <span>Residential architecture</span>
            <p>
              New homes, additions, and adaptive reuse from concept through
              construction.
            </p>
          </article>
          <article>
            <span>Interior architecture</span>
            <p>
              Material systems, built-in elements, lighting, and detailed
              spatial planning.
            </p>
          </article>
          <article>
            <span>Site and landscape</span>
            <p>
              Outdoor rooms, courtyards, and planting strategies shaped with the
              building.
            </p>
          </article>
          <article>
            <span>Design direction</span>
            <p>
              Focused early studies for clients who need a clear spatial point
              of view.
            </p>
          </article>
        </div>
      </section>
      <section className="cs-team">
        <header>
          <h2>A small, senior studio.</h2>
        </header>
        <div>
          <article>
            <span>Leah Orlov</span>
            <small>Principal / Architecture</small>
            <p>
              Leah leads spatial strategy, client collaboration, and the
              construction process.
            </p>
          </article>
          <article>
            <span>Mateo Ruiz</span>
            <small>Design Director / Interiors</small>
            <p>
              Mateo develops material systems, lighting, and interior
              architecture.
            </p>
          </article>
          <article>
            <span>Nia Calder</span>
            <small>Project Architect</small>
            <p>
              Nia coordinates technical detail, consultants, and project
              delivery.
            </p>
          </article>
        </div>
      </section>
      <footer className="cs-footer">
        <div>
          <h2>Begin with the place.</h2>
          <a href={`${base}/contact`}>
            studio@cinder.example.test <ArrowRight />
          </a>
        </div>
        <div>
          <CinderWordmark />
          <span>
            All projects and identities shown are fictional launch-demo content.
          </span>
        </div>
      </footer>
    </main>
  );
}

function CinderProject() {
  const imageParam = new URLSearchParams(window.location.search).get("image");
  const initial = imageParam === "stair" ? 1 : imageParam === "tide" ? 2 : 0;
  const [active, setActive] = useState(initial);
  const gallery = [stoneCourtUrl, monolithStairUrl, tideHouseUrl];
  const labels = [
    "Courtyard at blue hour",
    "Carved stair and skylight",
    "Coastal material study",
  ];
  const move = (direction: number) =>
    setActive(
      (current) => (current + direction + gallery.length) % gallery.length,
    );
  return (
    <main className="cs-project-page">
      <CinderNav />
      <header className="cs-project-title">
        <a href={base}>
          <ArrowLeft /> Selected work
        </a>
        <div>
          <span>Residence and landscape</span>
          <h1>Stone Court</h1>
          <p>
            A sheltered house that opens to sky, water, and the changing edge of
            the lake.
          </p>
        </div>
        <dl>
          <div>
            <dt>Setting</dt>
            <dd>Great Lakes shore</dd>
          </div>
          <div>
            <dt>Scope</dt>
            <dd>Architecture / interiors / landscape</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Concept study</dd>
          </div>
        </dl>
      </header>
      <section className="cs-project-gallery">
        <img src={gallery[active]} alt={labels[active]} />
        <div className="cs-gallery-controls">
          <span>{labels[active]}</span>
          <div>
            <button
              type="button"
              aria-label="Previous project image"
              onClick={() => move(-1)}
            >
              <ChevronLeft />
            </button>
            <span>
              {active + 1} / {gallery.length}
            </span>
            <button
              type="button"
              aria-label="Next project image"
              onClick={() => move(1)}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>
      <section className="cs-project-story">
        <h2>A room outside, held by structure.</h2>
        <div>
          <p>
            The plan is organized around a protected court. Long concrete beams
            hold the horizon while deep openings edit wind, glare, and privacy.
          </p>
          <p>
            Dark stone floors extend toward the reflecting pool, letting
            interior and landscape read as one measured sequence.
          </p>
        </div>
      </section>
      <section className="cs-project-thumbs" aria-label="Project images">
        {gallery.map((image, index) => (
          <button
            type="button"
            className={active === index ? "is-active" : ""}
            onClick={() => setActive(index)}
            key={labels[index]}
          >
            <img src={image} alt="" />
            <span>{labels[index]}</span>
          </button>
        ))}
      </section>
    </main>
  );
}

function CinderContact({ verified }: { verified: boolean }) {
  const [sent, setSent] = useState(verified);
  return (
    <main className="cs-contact-page">
      <CinderNav />
      <section className="cs-contact-layout">
        <div>
          <span>Start a conversation</span>
          <h1>Tell us what the place needs.</h1>
          <p>
            Share the location, timing, and what feels unresolved. We will reply
            within two business days.
          </p>
          <a href="mailto:studio@cinder.example.test">
            <Mail /> studio@cinder.example.test
          </a>
        </div>
        {sent ? (
          <div className="cs-contact-confirmation" role="status">
            <span>
              <Check />
            </span>
            <h2>Your note is ready for review.</h2>
            <p>
              This demo confirmation is local. No message was sent to an
              external service.
            </p>
            <button type="button" onClick={() => setSent(false)}>
              Write another note
            </button>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
          >
            <label>
              Name
              <input defaultValue="Avery Morgan" required />
            </label>
            <label>
              Email
              <input type="email" defaultValue="avery@example.test" required />
            </label>
            <label>
              Project location
              <input defaultValue="Evanston, Illinois" />
            </label>
            <label>
              What are you considering?
              <textarea
                defaultValue="A compact addition that brings more daylight into a narrow 1920s house."
                required
              />
            </label>
            <button type="submit">
              Send project note <ArrowRight />
            </button>
            <small>
              Fixture form. No external email or CRM integration is connected.
            </small>
          </form>
        )}
      </section>
    </main>
  );
}
