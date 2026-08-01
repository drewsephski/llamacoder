"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/reui/badge";
import { DataGrid, type DataGridColumn } from "@/components/reui/data-grid";
import { Filters } from "@/components/reui/filters";

export type UsageLedgerRow = {
  id: string;
  createdAt: string;
  chatId: string | null;
  projectTitle: string | null;
  modelId: string;
  phase: string;
  estimatedCredits: number;
  actualCredits: number;
  refundedCredits: number;
  status: string;
};

const columns: DataGridColumn<UsageLedgerRow>[] = [
  {
    id: "date",
    header: "Date",
    sortValue: (row) => new Date(row.createdAt).getTime(),
    cell: (row) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
  {
    id: "project",
    header: "Project",
    sortValue: (row) => row.projectTitle ?? "",
    cell: (row) =>
      row.chatId ? (
        <Link
          href={`/chats/${row.chatId}`}
          className="font-medium hover:underline"
        >
          {row.projectTitle ?? "Project"}
        </Link>
      ) : (
        <span className="text-muted-foreground">None</span>
      ),
  },
  {
    id: "model",
    header: "Model",
    sortValue: (row) => row.modelId,
    className: "max-w-[190px] truncate text-muted-foreground",
    cell: (row) => row.modelId,
  },
  {
    id: "phase",
    header: "Phase",
    sortValue: (row) => row.phase,
    cell: (row) => (
      <span className="text-muted-foreground">{formatLabel(row.phase)}</span>
    ),
  },
  {
    id: "estimate",
    header: "Estimate",
    align: "right",
    sortValue: (row) => row.estimatedCredits,
    cell: (row) => <span className="tabular-nums">{row.estimatedCredits}</span>,
  },
  {
    id: "actual",
    header: "Actual",
    align: "right",
    sortValue: (row) => row.actualCredits,
    cell: (row) => (
      <span className="font-medium tabular-nums">{row.actualCredits}</span>
    ),
  },
  {
    id: "refund",
    header: "Refund",
    align: "right",
    sortValue: (row) => row.refundedCredits,
    cell: (row) => <span className="tabular-nums">{row.refundedCredits}</span>,
  },
  {
    id: "status",
    header: "Status",
    sortValue: (row) => row.status,
    cell: (row) => <StatusBadge status={row.status} />,
  },
];

export function UsageLedger({ rows }: { rows: UsageLedgerRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const statuses = useMemo(
    () => Array.from(new Set(rows.map((row) => row.status))).sort(),
    [rows],
  );
  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = status === "all" || row.status === status;
      const matchesQuery =
        !normalized ||
        [row.projectTitle, row.modelId, row.phase, row.status]
          .filter(Boolean)
          .some((value) => {
            const text = value ?? "";
            return (
              text.toLowerCase().includes(normalized) ||
              formatLabel(text).toLowerCase().includes(normalized)
            );
          });
      return matchesStatus && matchesQuery;
    });
  }, [query, rows, status]);

  return (
    <>
      <Filters
        query={query}
        onQueryChange={setQuery}
        queryLabel="Search charges"
        value={status}
        onValueChange={setStatus}
        options={[
          { label: "All statuses", value: "all" },
          ...statuses.map((value) => ({ label: formatLabel(value), value })),
        ]}
      />
      <DataGrid
        rows={filteredRows}
        columns={columns}
        getRowId={(row) => row.id}
        empty={
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No charges match these filters.
          </div>
        }
      />
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "success" || status === "completed"
      ? "success-light"
      : status === "failed"
        ? "destructive-light"
        : status === "free_repair"
          ? "info-light"
          : "secondary";
  return (
    <Badge variant={variant} radius="full">
      {formatLabel(status)}
    </Badge>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatLabel(value: string) {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
