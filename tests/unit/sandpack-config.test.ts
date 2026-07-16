import { describe, expect, it } from "vitest";

import { getSandpackConfig } from "@/lib/sandpack-config";

describe("getSandpackConfig", () => {
  it("includes only the shadcn files required by generated imports", () => {
    const config = getSandpackConfig([
      {
        path: "App.tsx",
        content: `import { Button } from "@/components/ui/button";

export default function App() {
  return <Button>Launch</Button>;
}`,
      },
    ]);

    expect(config.files["/components/ui/button.tsx"]).toBeDefined();
    expect(config.files["/lib/utils.ts"]).toBeDefined();
    expect(config.files["/components/ui/accordion.tsx"]).toBeUndefined();
    expect(config.files["/public/index.html"]).toBeDefined();
    expect(config.customSetup.dependencies["@radix-ui/react-slot"]).toBe(
      "^1.1.0",
    );
    expect(config.customSetup.dependencies.recharts).toBeUndefined();
  });

  it("does not send unused component-library source to Sandpack", () => {
    const config = getSandpackConfig([
      {
        path: "App.tsx",
        content: "export default function App() { return <main>Hello</main>; }",
      },
    ]);

    expect(
      Object.keys(config.files).filter((path) =>
        path.startsWith("/components/ui/"),
      ),
    ).toEqual([]);
  });
});
