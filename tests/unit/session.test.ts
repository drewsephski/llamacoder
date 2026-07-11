import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock, headersMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

import { getCurrentSession } from "@/features/auth/server/session";

describe("getCurrentSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves the session from the current request every time", async () => {
    const firstHeaders = new Headers({ cookie: "session=first" });
    const secondHeaders = new Headers({ cookie: "session=second" });
    headersMock
      .mockResolvedValueOnce(firstHeaders)
      .mockResolvedValueOnce(secondHeaders);
    getSessionMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ user: { id: "user_1" } });

    await expect(getCurrentSession()).resolves.toBeNull();
    await expect(getCurrentSession()).resolves.toEqual({
      user: { id: "user_1" },
    });
    expect(getSessionMock).toHaveBeenNthCalledWith(1, {
      headers: firstHeaders,
    });
    expect(getSessionMock).toHaveBeenNthCalledWith(2, {
      headers: secondHeaders,
    });
  });
});
