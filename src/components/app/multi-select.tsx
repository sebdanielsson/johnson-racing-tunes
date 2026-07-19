import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <Popover onOpenChange={(o) => !o && setQuery("")}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-between gap-1.5",
              selected.length > 0 && "border-primary/50",
              className,
            )}
          />
        }
      >
        <span className="truncate">{label}</span>
        {selected.length > 0 && (
          <span className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums">
            {selected.length}
          </span>
        )}
        <ChevronDown className="size-3.5 opacity-60" />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align={align}>
        {searchable && (
          <div className="relative border-b p-2">
            <Search className="text-muted-foreground absolute top-1/2 left-4 size-3.5 -translate-y-1/2" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="placeholder:text-muted-foreground h-8 w-full rounded-md bg-transparent pr-2 pl-7 text-sm outline-none"
            />
          </div>
        )}
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">No matches</p>
          )}
          {filtered.map((o) => {
            const active = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-input",
                  )}
                >
                  {active && <Check className="size-3" />}
                </span>
                <span className="flex-1 truncate">{o.label ?? o.value}</span>
                {o.count !== undefined && (
                  <span className="text-muted-foreground text-xs tabular-nums">{o.count}</span>
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
              className="text-muted-foreground hover:bg-accent hover:text-foreground w-full rounded-sm px-2 py-1.5 text-left text-xs"
            >
              Clear {selected.length} selected
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
