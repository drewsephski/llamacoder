import type { Metadata } from "next";

import { ExampleWorkspace } from "./workspace";

export const metadata: Metadata = {
  title: "Interrogate a complete public build | Squid Agent",
  description:
    "Use Waypoint, refresh its public APIs, then inspect the original prompt, approved plan, generated files, quality checks, and portable source export.",
};

export default function ExamplePage() {
  return <ExampleWorkspace />;
}
