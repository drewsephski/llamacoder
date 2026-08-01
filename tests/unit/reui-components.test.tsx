// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DataGrid, type DataGridColumn } from "@/components/reui/data-grid";
import { Filters } from "@/components/reui/filters";
import { UsageLedger } from "@/features/billing/components/usage-ledger";

type Row = { id: string; name: string; credits: number };

const columns: DataGridColumn<Row>[] = [
  {
    id: "name",
    header: "Name",
    cell: (row) => row.name,
    sortValue: (row) => row.name,
  },
  {
    id: "credits",
    header: "Credits",
    cell: (row) => row.credits,
    sortValue: (row) => row.credits,
  },
];

describe("ReUI app adapters", () => {
  it("sorts data-grid rows from the column header", () => {
    render(
      <DataGrid
        rows={[
          { id: "2", name: "Beta", credits: 2 },
          { id: "1", name: "Alpha", credits: 1 },
        ]}
        columns={columns}
        getRowId={(row) => row.id}
        empty="Empty"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Name/i }));
    const desktopRows = screen.getAllByRole("row").slice(1);
    expect(within(desktopRows[0]!).getByText("Alpha")).toBeInTheDocument();
  });

  it("clears a search and selected filter together", () => {
    const onQueryChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Filters
        query="failed"
        onQueryChange={onQueryChange}
        queryLabel="Search runs"
        value="failed"
        onValueChange={onValueChange}
        options={[
          { label: "All", value: "all" },
          { label: "Failed", value: "failed" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Clear/i }));
    expect(onQueryChange).toHaveBeenCalledWith("");
    expect(onValueChange).toHaveBeenCalledWith("all");
  });

  it("matches usage statuses by their readable label", () => {
    render(
      <UsageLedger
        rows={[
          {
            id: "repair",
            createdAt: "2026-07-31T10:05:00.000Z",
            chatId: "chat-1",
            projectTitle: "Repair project",
            modelId: "model",
            phase: "preview_repair",
            estimatedCredits: 5,
            actualCredits: 0,
            refundedCredits: 0,
            status: "free_repair",
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Search charges" }), {
      target: { value: "Free Repair" },
    });
    expect(screen.getAllByText("Free Repair").length).toBeGreaterThan(0);
    expect(screen.queryByText(/No charges match/i)).not.toBeInTheDocument();
  });
});
