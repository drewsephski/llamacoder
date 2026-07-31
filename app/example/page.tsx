import { ExampleWorkspace } from "./workspace";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "AI React Prototype Example: Try a Complete Build",
  description:
    "Use the Waypoint prototype, refresh its public APIs, then inspect the generated files, quality checks, and portable React source export.",
  path: "/example",
  keywords: ["AI React app builder example", "AI generated React app"],
});

export default function ExamplePage() {
  return <ExampleWorkspace />;
}
