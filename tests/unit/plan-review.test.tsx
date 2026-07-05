// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlanReview } from "@/components/plan-review";

describe("PlanReview", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("approves a plan by calling the generate-code route", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);
    const onApprove = vi.fn();

    render(
      <PlanReview
        plan="Build a small app"
        chatId="chat_1"
        onApprove={onApprove}
        onReject={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /approve/i }));

    await waitFor(() => expect(onApprove).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/generate-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: "chat_1" }),
    });
  });

  it("shows a retryable error when code generation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "INSUFFICIENT_CREDITS" }),
      }),
    );

    render(
      <PlanReview
        plan="Build a small app"
        chatId="chat_1"
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /approve/i }));

    expect(await screen.findByText("INSUFFICIENT_CREDITS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /approve/i })).toBeEnabled();
  });
});
