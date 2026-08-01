"use client";

import { Search } from "lucide-react";
import { useId } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Autocomplete({
  value,
  onValueChange,
  options,
  label,
  placeholder = label,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  label: string;
  placeholder?: string;
  className?: string;
}) {
  const listId = useId();
  return (
    <label
      className={cn("relative block min-w-0 flex-1", className)}
      data-slot="autocomplete"
    >
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        role="textbox"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        list={listId}
        placeholder={placeholder}
        className="h-9 pl-9"
        aria-label={label}
        autoComplete="off"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </label>
  );
}
