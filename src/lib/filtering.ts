import type { Tune } from "@/data/tunes";
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
  rows: Tune[],
): Tune[] {
  const q = filters.q.trim().toLowerCase();
  let out = rows.filter((t) => {
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

  out = [...out].sort(comparators[filters.sort]);
  if (filters.dir === "desc") out.reverse();
  return out;
}
