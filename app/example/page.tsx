import type { Metadata } from "next";

import { ExampleWorkspace } from "./workspace";

export const metadata: Metadata = {
  title: "Public example workspace | Squid Agent",
  description:
    "Explore Waypoint, an interactive Kanban workspace with a focus timer, live weather, currency reference data, source, quality checks, and portable export.",
};

export default function ExamplePage() {
  return <ExampleWorkspace />;
}
