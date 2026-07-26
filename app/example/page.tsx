import { ExampleWorkspace } from "./workspace";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "AI React App Builder Example: Inspect a Complete Build",
  description:
    "Use Waypoint, refresh its public APIs, then inspect the original prompt, approved plan, generated files, quality checks, and portable source export.",
  path: "/example",
  keywords: ["AI React app builder example", "AI generated React app"],
});

export default function ExamplePage() {
  return <ExampleWorkspace />;
}
