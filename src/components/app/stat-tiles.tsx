import { Car, Gamepad2, Users, KeyRound, Clapperboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { stats } from "@/data/tunes";

interface Tile {
  label: string;
  value: number;
  icon: LucideIcon;
}

const tiles: Tile[] = [
  { label: "Tunes", value: stats.total, icon: Car },
  { label: "Games", value: stats.games, icon: Gamepad2 },
  { label: "Creators", value: stats.creators, icon: Users },
  { label: "Share codes", value: stats.shareCodes, icon: KeyRound },
  { label: "Featured videos", value: stats.videos, icon: Clapperboard },
];

export function StatTiles() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((t) => (
        <Card
          key={t.label}
          className="gap-0 overflow-hidden py-0 transition-colors hover:border-primary/40"
        >
          <div className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <t.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold tabular-nums leading-none">
                {t.value.toLocaleString()}
              </div>
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {t.label}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
