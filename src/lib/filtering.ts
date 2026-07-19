import type { Tune } from "@/data/tunes";
import type { Filters, SortField } from "@/hooks/use-filters";
import { newSinceIds } from "@/data/seen";

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
  class: (a, b) => a.classOrder - b.classOrder || a.car.localeCompare(b.car),
  car: (a, b) => a.car.localeCompare(b.car) || a.classOrder - b.classOrder,
  game: (a, b) =>
    a.gameOrder - b.gameOrder || a.classOrder - b.classOrder || a.car.localeCompare(b.car),
  creator: (a, b) =>
    (a.creators[0] ?? "").localeCompare(b.creators[0] ?? "") ||
    a.classOrder - b.classOrder ||
    a.car.localeCompare(b.car),
};

/** How many filters are currently set (search, facets, and quick toggles). */
export function activeFilterCount(filters: Filters): number {
  return (
    filters.games.length +
    filters.classes.length +
    filters.focus.length +
    filters.creators.length +
    (filters.sinceOnly ? 1 : 0) +
    (filters.hasVideo ? 1 : 0) +
    (filters.q.trim() ? 1 : 0)
  );
}

export function applyFilters(filters: Filters, rows: Tune[]): Tune[] {
  const q = filters.q.trim().toLowerCase();
  let out = rows.filter((t) => {
    if (q && !matchesQuery(t, q)) return false;
    if (filters.games.length && !filters.games.includes(t.game)) return false;
    if (filters.classes.length && !filters.classes.includes(t.class)) return false;
    if (filters.creators.length && !t.creators.some((c) => filters.creators.includes(c)))
      return false;
    if (filters.focus.length) {
      const hay = t.madeFor.toLowerCase();
      if (!filters.focus.some((f) => hay.includes(f.toLowerCase()))) return false;
    }
    if (filters.sinceOnly && !newSinceIds.has(t.id)) return false;
    if (filters.hasVideo && !t.videoUrl) return false;
    return true;
  });

  out = [...out].sort(comparators[filters.sort]);
  if (filters.dir === "desc") out.reverse();
  return out;
}
