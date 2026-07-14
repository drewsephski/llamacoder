import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPrisma: vi.fn(),
  validateProductionEnvironment: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ getPrisma: mocks.getPrisma }));
vi.mock("@/lib/env", () => ({
  validateProductionEnvironment: mocks.validateProductionEnvironment,
}));

import { GET } from "@/app/api/ready/route";

describe("readiness route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateProductionEnvironment.mockReturnValue({
      valid: true,
      errors: [],
    });
  });

  it("checks the required migration and operational table without writes", async () => {
    const queryRaw = vi
      .fn()
      .mockResolvedValueOnce([{ ok: 1 }])
      .mockResolvedValueOnce([
        { migration_name: "20260714100000_add_operational_incidents" },
      ]);
    const incidentFindFirst = vi.fn().mockResolvedValue(null);
    const incidentCreate = vi.fn();
    mocks.getPrisma.mockReturnValue({
      $queryRaw: queryRaw,
      operationalIncident: {
        findFirst: incidentFindFirst,
        create: incidentCreate,
      },
      creditHold: { count: vi.fn().mockResolvedValue(0) },
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "ready",
      checks: {
        database: { ok: true },
        operationalSchema: { ok: true },
        creditHolds: { ok: true },
      },
    });
    expect(incidentFindFirst).toHaveBeenCalledWith({ select: { id: true } });
    expect(incidentCreate).not.toHaveBeenCalled();
  });

  it("reports an unapplied operational migration", async () => {
    const incidentFindFirst = vi.fn();
    mocks.getPrisma.mockReturnValue({
      $queryRaw: vi
        .fn()
        .mockResolvedValueOnce([{ ok: 1 }])
        .mockResolvedValueOnce([]),
      operationalIncident: { findFirst: incidentFindFirst },
      creditHold: { count: vi.fn().mockResolvedValue(0) },
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.checks.operationalSchema).toMatchObject({
      ok: false,
      detail:
        "Migration 20260714100000_add_operational_incidents is not applied",
    });
    expect(incidentFindFirst).not.toHaveBeenCalled();
  });
});
