import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildComponentRegistryPromptSection,
  extractComponentRegistryAddresses,
  mergeComponentRegistryFiles,
  resolveComponentRegistryImports,
} from "@/features/generation/server/component-registry";

describe("trusted component registry imports", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("extracts supported addresses only from shadcn add commands", () => {
    expect(
      extractComponentRegistryAddresses(
        "Use `pnpm dlx shadcn add @skiper-ui/skiper39 @magicui/animated-beam` in this app.",
      ),
    ).toEqual(["@skiper-ui/skiper39", "@magicui/animated-beam"]);
    expect(
      extractComponentRegistryAddresses("mention @magicui/orbiting-circles"),
    ).toEqual([]);
  });

  it("resolves, normalizes, and describes a trusted registry item", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              name: "skiper39",
              title: "Skiper 39",
              type: "registry:ui",
              dependencies: ["gsap"],
              files: [
                {
                  path: "/skiper39.tsx",
                  target: "components/ui/skiper-ui//skiper39.tsx",
                  type: "registry:ui",
                  content:
                    'import { gsap } from "gsap"; export function Skiper39() { return <img src="/images/peeps.png" /> }',
                },
              ],
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const imports = await resolveComponentRegistryImports(
      "pnpm dlx shadcn add @skiper-ui/skiper39",
    );

    expect(imports).toHaveLength(1);
    expect(imports[0]).toMatchObject({
      address: "@skiper-ui/skiper39",
      dependencies: ["gsap"],
      exports: ["Skiper39"],
    });
    expect(imports[0].files[0].path).toBe(
      "components/ui/skiper-ui/skiper39.tsx",
    );
    expect(imports[0].files[0].code).toContain(
      "https://skiper-ui.com/images/peeps.png",
    );
    expect(imports[0].warnings[0]).toContain("loaded from");
    expect(buildComponentRegistryPromptSection(imports)).toContain(
      "Available exports: Skiper39",
    );
  });

  it("rejects untrusted registries and unsupported npm dependencies", async () => {
    await expect(
      resolveComponentRegistryImports(
        "pnpm dlx shadcn add @unknown/vendor-component",
      ),
    ).rejects.toMatchObject({
      code: "UNSUPPORTED_REGISTRY",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            name: "server-widget",
            type: "registry:ui",
            dependencies: ["server-only-widget"],
            files: [
              {
                path: "server-widget.tsx",
                content: "export const ServerWidget = () => null",
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(
      resolveComponentRegistryImports(
        "pnpm dlx shadcn add @magicui/server-widget",
      ),
    ).rejects.toMatchObject({
      code: "UNSUPPORTED_DEPENDENCY",
    });
  });

  it("keeps trusted registry source authoritative when files are merged", () => {
    const merged = mergeComponentRegistryFiles(
      [
        {
          path: "components/ui/widget.tsx",
          code: "export const Widget = 'generated'",
          language: "tsx",
        },
      ],
      [
        {
          address: "@magicui/widget",
          title: "Widget",
          homepage: "https://magicui.design",
          dependencies: [],
          exports: ["Widget"],
          warnings: [],
          files: [
            {
              path: "components/ui/widget.tsx",
              code: "export const Widget = 'registry'",
              language: "tsx",
            },
          ],
        },
      ],
    );

    expect(merged[0].code).toContain("registry");
  });
});
