import { Layers } from "lucide-react";

import { useData } from "@/data/store";
import { useFilters } from "@/hooks/use-filters";
import { gameColorVar } from "@/lib/constants";
import { gameShort } from "@/data/tunes";
import { cn } from "@/lib/utils";

export function GameSwitcher() {
  const { filterOptions, stats } = useData();
  const { filters, update } = useFilters();
  const active = filters.games.length === 1 ? filters.games[0] : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill
        active={active === null}
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
        "group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all cursor-pointer",
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
          active
            ? "bg-background/60 text-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {count.toLocaleString()}
      </span>
    </button>
  );
}
