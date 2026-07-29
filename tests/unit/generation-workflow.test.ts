import { describe, expect, it } from "vitest";

import { buildFinalGenerationFiles } from "@/features/generation/server/workflow";

describe("generation workflow finalization", () => {
  it("merges changed files onto the latest historical project snapshot", () => {
    const files = buildFinalGenerationFiles({
      requestMessage: {
        id: "request_1",
        files: {
          kind: "app_edit_request",
          chargeCredits: true,
          sourceMessageId: "assistant_1",
        },
        position: 3,
      },
      messages: [
        {
          id: "assistant_1",
          role: "assistant",
          content: "",
          files: [
            { path: "App.tsx", code: "export default function App() {}" },
            {
              path: "components/Header.tsx",
              code: "export function Header() { return <header />; }",
            },
          ],
          position: 2,
        },
      ],
      generatedText: [
        "Updated the selected header.",
        "```tsx{path=components/Header.tsx}",
        "export function Header() { return <header>Updated</header>; }",
        "```",
      ].join("\n"),
    });

    expect(files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "App.tsx",
          code: "export default function App() {}",
        }),
        expect.objectContaining({
          path: "components/Header.tsx",
          code: expect.stringContaining("Updated"),
        }),
      ]),
    );
  });

  it("uses the server-persisted draft as the base for contract repair", () => {
    const files = buildFinalGenerationFiles({
      requestMessage: {
        id: "repair_1",
        files: {
          kind: "contract_repair",
          chargeCredits: false,
          draftFiles: [
            { path: "App.tsx", code: "export default function App() {}" },
            {
              path: "lib/api.ts",
              code: "export const endpoint = '/api/tasks';",
            },
          ],
        },
        position: 4,
      },
      messages: [],
      generatedText: [
        "```tsx{path=App.tsx}",
        "import { endpoint } from './lib/api';",
        "export default function App() { return <main>{endpoint}</main>; }",
        "```",
      ].join("\n"),
    });

    expect(files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "App.tsx",
          code: expect.stringContaining("endpoint"),
        }),
        expect.objectContaining({
          path: "lib/api.ts",
          code: expect.stringContaining("/api/tasks"),
        }),
      ]),
    );
  });

  it("persists trusted registry files and prevents generated overwrites", () => {
    const files = buildFinalGenerationFiles({
      requestMessage: {
        id: "registry_request_1",
        files: {
          registryFiles: [
            {
              path: "components/ui/animated-beam.tsx",
              code: "export const AnimatedBeam = 'trusted registry source';",
            },
          ],
        },
        position: 2,
      },
      messages: [],
      generatedText: [
        "```tsx{path=App.tsx}",
        "import { AnimatedBeam } from '@/components/ui/animated-beam';",
        "export default function App() { return <main>{AnimatedBeam}</main>; }",
        "```",
        "```tsx{path=components/ui/animated-beam.tsx}",
        "export const AnimatedBeam = 'model overwrite';",
        "```",
      ].join("\n"),
    });

    expect(files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "components/ui/animated-beam.tsx",
          code: expect.stringContaining("trusted registry source"),
        }),
      ]),
    );
  });
});
