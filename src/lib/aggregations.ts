import { sortedClasses, isLetterClass, type Tune } from "@/data/tunes";

export interface Count {
  name: string;
  value: number;
}

/** Tunes grouped by game, in canonical game order. */
export function byGame(rows: Tune[]): Count[] {
  const map = new Map<string, number>();
  const order = new Map(rows.map((t) => [t.game, t.gameOrder]));
  for (const t of rows) map.set(t.game, (map.get(t.game) ?? 0) + 1);
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (order.get(a.name) ?? 0) - (order.get(b.name) ?? 0));
}

/** Tunes grouped by the letter performance class (D → R ladder). */
export function byClass(rows: Tune[]): Count[] {
  const letters = rows.filter((t) => isLetterClass(t.class));
  const map = new Map<string, number>();
  for (const t of letters) map.set(t.class, (map.get(t.class) ?? 0) + 1);
  return sortedClasses(letters).map((name) => ({
    name,
    value: map.get(name) ?? 0,
  }));
}

/** Most prolific creators. */
export function topCreators(rows: Tune[], limit = 12): Count[] {
  const map = new Map<string, number>();
  for (const t of rows)
    for (const c of t.creators) map.set(c, (map.get(c) ?? 0) + 1);
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// Keywords a tune can be "made for" — matched case-insensitively.
const FOCUS_KEYWORDS = [
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

/** Tune focus by tag keyword (a tune may count toward several tags). */
export function byFocus(rows: Tune[]): Count[] {
  const map = new Map<string, number>();
  for (const t of rows) {
    const hay = t.madeFor.toLowerCase();
    for (const kw of FOCUS_KEYWORDS) {
      if (hay.includes(kw.toLowerCase())) map.set(kw, (map.get(kw) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
}
