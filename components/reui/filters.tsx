"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Autocomplete } from "@/components/reui/autocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterOption = { label: string; value: string };

export function Filters({
  query,
  onQueryChange,
  queryLabel,
  value,
  onValueChange,
  options,
  suggestions = [],
}: {
  query: string;
  onQueryChange: (value: string) => void;
  queryLabel: string;
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  suggestions?: string[];
}) {
  const isFiltered = Boolean(query) || value !== "all";

  return (
    <div
      className="flex flex-col gap-2 border-b border-border bg-muted/15 p-3 sm:flex-row sm:items-center"
      data-slot="filters"
    >
      <Autocomplete
        value={query}
        onValueChange={onQueryChange}
        options={suggestions}
        label={queryLabel}
      />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className="h-9 w-full sm:w-44"
          aria-label="Filter by status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isFiltered ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={() => {
            onQueryChange("");
            onValueChange("all");
          }}
        >
          <X /> Clear
        </Button>
      ) : null}
    </div>
  );
}
