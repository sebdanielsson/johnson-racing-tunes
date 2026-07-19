import { Car, Gamepad2, Users, KeyRound, Clapperboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useData } from "@/data/store";

interface Tile {
  label: string;
  value: number;
  icon: LucideIcon;
}

export function StatTiles() {
  const { stats } = useData();
  const tiles: Tile[] = [
    { label: "Tunes", value: stats.total, icon: Car },
    { label: "Games", value: stats.games, icon: Gamepad2 },
    { label: "Creators", value: stats.creators, icon: Users },
    { label: "Share codes", value: stats.shareCodes, icon: KeyRound },
    { label: "Featured videos", value: stats.videos, icon: Clapperboard },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((t) => (
        <Card
          key={t.label}
          className="hover:border-primary/40 gap-0 overflow-hidden py-0 transition-colors"
        >
          <div className="flex items-center gap-3 p-4">
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
              <t.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl leading-none font-bold tabular-nums">
                {t.value.toLocaleString()}
              </div>
              <div className="text-muted-foreground mt-1 truncate text-xs">{t.label}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
