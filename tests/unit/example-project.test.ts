import { describe, expect, it } from "vitest";

import { EXAMPLE_PROJECT_FILES } from "@/features/showcase/example-project";
import { buildExportBundle } from "@/lib/export-bundle";

describe("public example project", () => {
  it("ships as a warning-free portable source bundle", () => {
    const bundle = buildExportBundle(EXAMPLE_PROJECT_FILES);

    expect(bundle.qualityReport.diagnostics).toEqual([]);
    expect(bundle.qualityReport.accessibilityWarnings).toEqual([]);
    expect(bundle.verificationReport.status).toBe("warning");
    expect(bundle.qualityReport.apiIntegration.status).toBe("setup_required");
    expect(
      EXAMPLE_PROJECT_FILES.some((file) =>
        file.code.includes("api.open-meteo.com/v1/forecast"),
      ),
    ).toBe(true);
    expect(
      EXAMPLE_PROJECT_FILES.some((file) =>
        file.code.includes("api.frankfurter.dev/v2/rates"),
      ),
    ).toBe(true);
    expect(bundle.files.map((file) => file.path)).toEqual(
      expect.arrayContaining([
        "package.json",
        "README.md",
        "squid-quality-report.json",
        "squid-verification-report.json",
      ]),
    );
  });
});
