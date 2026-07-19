import { Layers } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData } from "@/data/store";
import { useFilters } from "@/hooks/use-filters";
import { gameColorVar } from "@/lib/constants";
import { gameShort } from "@/data/tunes";
import { cn } from "@/lib/utils";

const ALL = "__all__";

export function GameSwitcher() {
  const { filterOptions, stats } = useData();
  const { filters, update } = useFilters();
  const active = filters.games.length === 1 ? filters.games[0] : null;
  // "All games" only reflects a truly unfiltered state — a multi-game URL
  // (?game=FH5&game=FH4) is a real filter, so no pill is highlighted then.
  const noGameFilter = filters.games.length === 0;

  // Trigger labels for the mobile dropdown (short codes keep it compact).
  const items: Record<string, string> = {
    [ALL]: "All games",
    ...Object.fromEntries(filterOptions.games.map((g) => [g.value, gameShort[g.value] ?? g.value])),
  };
  const value = active ?? ALL;
  const onChange = (v: string | null) => update({ games: v && v !== ALL ? [v] : [] });

  return (
    <>
      {/* Mobile: a compact dropdown pill (scopes both Browse and Overview). */}
      <Select value={value} onValueChange={onChange} items={items}>
        <SelectTrigger size="sm" className="w-auto gap-1.5 sm:hidden" aria-label="Filter by game">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value={ALL}>
            <Layers className="size-3.5 shrink-0 opacity-70" />
            <span>All games</span>
            <span className="text-muted-foreground ml-4 text-xs tabular-nums">
              {stats.total.toLocaleString()}
            </span>
          </SelectItem>
          {filterOptions.games.map((g) => (
            <SelectItem key={g.value} value={g.value}>
              <span
                className="size-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: gameColorVar[g.value] }}
                aria-hidden="true"
              />
              <span>{g.value}</span>
              <span className="text-muted-foreground ml-4 text-xs tabular-nums">
                {g.count.toLocaleString()}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Desktop: the segmented pill row. */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        <Pill
          active={noGameFilter}
          onClick={() => update({ games: [] })}
          label="All games"
          count={stats.total}
        />
        {filterOptions.games.map((g) => (
          <Pill
            key={g.value}
            active={active === g.value}
            onClick={() => update({ games: active === g.value ? [] : [g.value] })}
            label={gameShort[g.value] ?? g.value}
            fullLabel={g.value}
            count={g.count}
            color={gameColorVar[g.value]}
          />
        ))}
      </div>
    </>
  );
}

function Pill({
  active,
  onClick,
  label,
  fullLabel,
  count,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  fullLabel?: string;
  count: number;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={fullLabel ?? label}
      aria-pressed={active}
      className={cn(
        "group inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-all cursor-pointer",
        active
          ? "text-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
      )}
      style={
        active
          ? {
              borderColor: color
                ? `color-mix(in oklab, ${color} 60%, transparent)`
                : "var(--primary)",
              backgroundColor: color
                ? `color-mix(in oklab, ${color} 16%, transparent)`
                : "color-mix(in oklab, var(--primary) 16%, transparent)",
            }
          : undefined
      }
    >
      {color ? (
        <span
          className="size-2.5 shrink-0 rounded-[3px]"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      ) : (
        <Layers className="size-3.5 shrink-0 opacity-70" />
      )}
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 text-xs tabular-nums",
          active ? "bg-background/60 text-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {count.toLocaleString()}
      </span>
    </button>
  );
}
