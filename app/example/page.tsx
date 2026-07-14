import type { Metadata } from "next";

import { ExampleWorkspace } from "./workspace";

export const metadata: Metadata = {
  title: "Public example workspace | Squid Agent",
  description:
    "Inspect a complete Squid Agent project—prompt, plan, preview, source, quality checks, and portable export—without signing up.",
};

export default function ExamplePage() {
  return <ExampleWorkspace />;
}
