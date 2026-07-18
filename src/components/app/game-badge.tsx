import { gameColorVar } from "@/lib/constants";
import { gameShort } from "@/data/tunes";
import { cn } from "@/lib/utils";

interface GameBadgeProps {
  game: string;
  full?: boolean;
  className?: string;
}

/** A colour-coded chip identifying the Forza title, matching the charts. */
export function GameBadge({ game, full = false, className }: GameBadgeProps) {
  const color = gameColorVar[game] ?? "var(--chart-1)";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
      style={{
        borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
      }}
      title={game}
    >
      <span
        className="size-2 shrink-0 rounded-[2px]"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {full ? game : (gameShort[game] ?? game)}
    </span>
  );
}
