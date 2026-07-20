// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GenerationReceipt } from "@/components/generation-receipt";
import { QualityReportPanel } from "@/components/quality-report-panel";
import type { ProjectMessage } from "@/features/projects/contracts";

vi.mock("next-plausible", () => ({
  usePlausible: () => vi.fn(),
}));

const qualityReport = {
  generatedAt: "2026-07-11T00:00:00.000Z",
  filesGenerated: 2,
  sourceFiles: 2,
  importsResolved: 1,
  unresolvedImports: [],
  protectedPathsBlocked: 1,
  accessibilityWarnings: [
    { path: "App.tsx", message: "Image is missing alternative text." },
  ],
  diagnostics: [],
  apiIntegration: {
    status: "not_detected" as const,
    requestsDetected: 0,
    endpoints: [],
    environmentVariables: [],
    providers: [],
    policyWarnings: [],
    issues: [],
  },
  status: "warning" as const,
};

function message(overrides: Partial<ProjectMessage> = {}): ProjectMessage {
  return {
    id: "message_1",
    role: "assistant",
    content: "Built the app",
    files: [
      {
        path: "App.tsx",
        code: "export default function App(){return <main>Ready</main>}",
        language: "tsx",
      },
    ],
    followUpPrompts: null,
    chatId: "chat_1",
    position: 2,
    createdAt: new Date("2026-07-11T00:00:00.000Z"),
    changeSummary: "Built dashboard",
    versionKind: "generation",
    versionLabel: null,
    designScores: null,
    isBookmarked: false,
    generationReceipt: {
      estimatedCredits: 3,
      actualCredits: 2,
      refundedCredits: 1,
      phase: "generation",
      status: "completed",
      exportVerification: null,
    },
    ...overrides,
  };
}

describe("trust surfaces", () => {
  it("discloses static quality coverage and runtime limitations", async () => {
    render(<QualityReportPanel report={qualityReport} exportStatus={null} />);

    await userEvent.click(
      screen.getByRole("button", { name: /open quality report/i }),
    );

    expect(screen.getByText("What Squid did not test")).toBeInTheDocument();
    expect(screen.getByText(/live endpoint availability/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no api integration detected/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/image is missing alternative text/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/export verification: not run/i),
    ).toBeInTheDocument();
  });

  it("shows charge, refund, file changes, and checks in a receipt", async () => {
    render(<GenerationReceipt message={message()} />);

    await userEvent.click(
      screen.getByRole("button", { name: /2 credits charged/i }),
    );

    expect(
      screen.getByText(/estimated 3 · charged 2 · refunded 1/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/1 added · 0 modified · 0 removed/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/files, imports, protected paths/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /usage ledger/i })).toHaveAttribute(
      "href",
      "/dashboard/usage",
    );
  });

  it("labels free repairs without implying a charge", async () => {
    render(
      <GenerationReceipt
        message={message({
          generationReceipt: {
            estimatedCredits: 2,
            actualCredits: 0,
            refundedCredits: 0,
            phase: "preview_repair",
            status: "free_repair",
            exportVerification: null,
          },
        })}
      />,
    );

    expect(
      screen.getByRole("button", { name: /no credits charged/i }),
    ).toBeInTheDocument();
  });
});
