import { tunes, sortedClasses, type Tune } from "@/data/tunes";
import type { Filters, SortField } from "@/hooks/use-filters";

export const FOCUS_OPTIONS = [
  "Allround",
  "Speed",
  "Handling",
  "Acceleration",
  "Dirt",
  "Cross Country",
  "Drift",
  "Snow",
  "Offroad",
  "Rally",
];

function counted(values: string[]): { value: string; count: number }[] {
  const map = new Map<string, number>();
  for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
  return [...map.entries()].map(([value, count]) => ({ value, count }));
}

/** Filter option lists with counts, computed once from the full dataset. */
export const filterOptions = {
  games: (() => {
    const order = new Map(tunes.map((t) => [t.game, t.gameOrder]));
    return counted(tunes.map((t) => t.game)).sort(
      (a, b) => (order.get(a.value) ?? 0) - (order.get(b.value) ?? 0),
    );
  })(),
  classes: (() => {
    const c = counted(tunes.map((t) => t.class));
    const order = sortedClasses();
    return c.sort(
      (a, b) => order.indexOf(a.value) - order.indexOf(b.value),
    );
  })(),
  creators: counted(tunes.flatMap((t) => t.creators)).sort(
    (a, b) => b.count - a.count || a.value.localeCompare(b.value),
  ),
  focus: FOCUS_OPTIONS.map((value) => ({
    value,
    count: tunes.filter((t) =>
      t.madeFor.toLowerCase().includes(value.toLowerCase()),
    ).length,
  })).filter((o) => o.count > 0),
};

function matchesQuery(t: Tune, q: string): boolean {
  return (
    t.car.toLowerCase().includes(q) ||
    t.creators.join(" ").toLowerCase().includes(q) ||
    t.madeFor.toLowerCase().includes(q) ||
    t.info.toLowerCase().includes(q) ||
    t.shareCodes.join(" ").toLowerCase().includes(q) ||
    t.videoTitle.toLowerCase().includes(q)
  );
}

const comparators: Record<SortField, (a: Tune, b: Tune) => number> = {
  car: (a, b) => a.car.localeCompare(b.car),
  class: (a, b) => a.classOrder - b.classOrder || a.car.localeCompare(b.car),
  game: (a, b) => a.gameOrder - b.gameOrder || a.classOrder - b.classOrder,
  creator: (a, b) =>
    (a.creators[0] ?? "").localeCompare(b.creators[0] ?? "") ||
    a.car.localeCompare(b.car),
};

export function applyFilters(
  filters: Filters,
  favorites: Set<string>,
): Tune[] {
  const q = filters.q.trim().toLowerCase();
  let rows = tunes.filter((t) => {
    if (q && !matchesQuery(t, q)) return false;
    if (filters.games.length && !filters.games.includes(t.game)) return false;
    if (filters.classes.length && !filters.classes.includes(t.class))
      return false;
    if (
      filters.creators.length &&
      !t.creators.some((c) => filters.creators.includes(c))
    )
      return false;
    if (filters.focus.length) {
      const hay = t.madeFor.toLowerCase();
      if (!filters.focus.some((f) => hay.includes(f.toLowerCase())))
        return false;
    }
    if (filters.favOnly && !favorites.has(t.id)) return false;
    if (filters.newOnly && !t.isNew) return false;
    if (filters.hasVideo && !t.videoUrl) return false;
    if (filters.hasCode && t.shareCodes.length === 0) return false;
    return true;
  });

  rows = [...rows].sort(comparators[filters.sort]);
  if (filters.dir === "desc") rows.reverse();
  return rows;
}
