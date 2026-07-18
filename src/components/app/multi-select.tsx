import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label?: React.ReactNode;
  count?: number;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  searchable?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  searchable = false,
  className,
  align = "start",
}: MultiSelectProps) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.value.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  return (
    <Popover onOpenChange={(o) => !o && setQuery("")}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "justify-between gap-1.5",
            selected.length > 0 && "border-primary/50",
            className,
          )}
        >
          <span className="truncate">{label}</span>
          {selected.length > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">
              {selected.length}
            </span>
          )}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align={align}>
        {searchable && (
          <div className="relative border-b p-2">
            <Search className="absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="h-8 w-full rounded-md bg-transparent pl-7 pr-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        )}
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No matches
            </p>
          )}
          {filtered.map((o) => {
            const active = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input",
                  )}
                >
                  {active && <Check className="size-3" />}
                </span>
                <span className="flex-1 truncate">{o.label ?? o.value}</span>
                {o.count !== undefined && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {o.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selected.length > 0 && (
          <div className="border-t p-1">
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full rounded-sm px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Clear {selected.length} selected
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
