"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DataGridColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
  className?: string;
};

export function DataGrid<T>({
  rows,
  columns,
  getRowId,
  empty,
  className,
}: {
  rows: T[];
  columns: DataGridColumn<T>[];
  getRowId: (row: T) => string;
  empty: ReactNode;
  className?: string;
}) {
  const [sorting, setSorting] = useState<{
    columnId: string;
    direction: "asc" | "desc";
  } | null>(null);

  const visibleRows = useMemo(() => {
    if (!sorting) return rows;
    const column = columns.find(
      (candidate) => candidate.id === sorting.columnId,
    );
    if (!column?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const left = column.sortValue?.(a) ?? "";
      const right = column.sortValue?.(b) ?? "";
      const result =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return sorting.direction === "asc" ? result : -result;
    });
  }, [columns, rows, sorting]);

  if (visibleRows.length === 0) return <>{empty}</>;

  return (
    <div className={cn("overflow-hidden", className)} data-slot="data-grid">
      <div className="divide-y divide-border md:hidden">
        {visibleRows.map((row) => (
          <dl
            key={getRowId(row)}
            className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-sm"
          >
            {columns.map((column, index) => (
              <div
                key={column.id}
                className={cn(
                  "min-w-0",
                  index < 2 && "col-span-1",
                  index >= 2 && "rounded-md bg-muted/30 p-2.5",
                )}
              >
                <dt className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {column.header}
                </dt>
                <dd className="break-words">{column.cell(row)}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
      <div className="hidden overflow-x-auto overscroll-x-contain md:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    "px-4 py-3 font-medium",
                    column.align === "right" && "text-right",
                    column.className,
                  )}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      className={cn(
                        "inline-flex min-h-8 items-center gap-1.5 rounded-md px-1 text-left hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        column.align === "right" && "ml-auto",
                      )}
                      onClick={() =>
                        setSorting((current) => ({
                          columnId: column.id,
                          direction:
                            current?.columnId === column.id &&
                            current.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      {column.header}
                      {sorting?.columnId === column.id ? (
                        sorting.direction === "asc" ? (
                          <ArrowUp />
                        ) : (
                          <ArrowDown />
                        )
                      ) : (
                        <ChevronsUpDown className="opacity-50" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleRows.map((row) => (
              <tr
                key={getRowId(row)}
                className="transition-colors hover:bg-muted/25"
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "px-4 py-3.5 align-middle",
                      column.align === "right" && "text-right",
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
