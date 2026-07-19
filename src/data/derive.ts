import { sortedClasses, type Tune } from "@/data/tunes";
import { FOCUS_OPTIONS } from "@/lib/filtering";

export interface CountOption {
  value: string;
  count: number;
}

export interface FilterOptions {
  games: CountOption[];
  classes: CountOption[];
  creators: CountOption[];
  focus: CountOption[];
}

export interface Stats {
  total: number;
  games: number;
  creators: number;
  videos: number;
  shareCodes: number;
}

export interface Derived {
  tunes: Tune[];
  games: string[];
  allCreators: string[];
  stats: Stats;
  filterOptions: FilterOptions;
}

function counted(values: string[]): CountOption[] {
  const map = new Map<string, number>();
  for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
  return [...map.entries()].map(([value, count]) => ({ value, count }));
}

/**
 * Facet options (class/focus/creator/game) for a set of tunes. Passing a subset
 * (e.g. the tunes for the selected game) scopes the filter lists to only what
 * actually exists in that subset.
 */
export function computeFilterOptions(tunes: Tune[]): FilterOptions {
  const gameOrder = new Map(tunes.map((t) => [t.game, t.gameOrder]));
  const classOrder = sortedClasses(tunes);
  return {
    games: counted(tunes.map((t) => t.game)).sort(
      (a, b) => (gameOrder.get(a.value) ?? 0) - (gameOrder.get(b.value) ?? 0),
    ),
    classes: counted(tunes.map((t) => t.class)).sort(
      (a, b) => classOrder.indexOf(a.value) - classOrder.indexOf(b.value),
    ),
    creators: counted(tunes.flatMap((t) => t.creators)).sort(
      (a, b) => b.count - a.count || a.value.localeCompare(b.value),
    ),
    focus: FOCUS_OPTIONS.map((value) => ({
      value,
      count: tunes.filter((t) => t.madeFor.toLowerCase().includes(value.toLowerCase())).length,
    })).filter((o) => o.count > 0),
  };
}

/** Everything the UI needs that depends on the (swappable) dataset. */
export function computeDerived(tunes: Tune[]): Derived {
  const gameOrder = new Map(tunes.map((t) => [t.game, t.gameOrder]));
  const games = [...new Set(tunes.map((t) => t.game))].sort(
    (a, b) => (gameOrder.get(a) ?? 0) - (gameOrder.get(b) ?? 0),
  );
  const allCreators = [...new Set(tunes.flatMap((t) => t.creators))].sort((a, b) =>
    a.localeCompare(b),
  );

  const filterOptions = computeFilterOptions(tunes);

  const stats: Stats = {
    total: tunes.length,
    games: games.length,
    creators: allCreators.length,
    videos: new Set(tunes.filter((t) => t.videoUrl).map((t) => t.videoUrl)).size,
    shareCodes: tunes.reduce((n, t) => n + t.shareCodes.length, 0),
  };

  return { tunes, games, allCreators, stats, filterOptions };
}
