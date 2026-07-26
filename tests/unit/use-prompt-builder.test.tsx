// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePromptBuilder } from "@/features/prompt-builder/hooks/use-prompt-builder";

describe("usePromptBuilder", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the friendly authentication message returned by the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({
        error: "AUTHENTICATION_REQUIRED",
        message: "Sign in to enhance your prompt, then try again.",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePromptBuilder());

    act(() => result.current.setUserPrompt("Build a project dashboard"));
    await act(async () => result.current.enhance());

    expect(result.current.error).toBe(
      "Sign in to enhance your prompt, then try again.",
    );
  });
});
