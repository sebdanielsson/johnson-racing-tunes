import { useSyncExternalStore } from "react";

export type SortField = "car" | "class" | "game" | "creator";
export type SortDir = "asc" | "desc";
export type ViewMode = "table" | "cards";

// The app opens scoped to the latest game; users can switch or pick "All games".
export const DEFAULT_GAME = "Forza Horizon 6";
// URL sentinel so the (empty games = all) state round-trips and stays shareable.
const ALL_GAMES = "all";

export interface Filters {
  q: string;
  games: string[];
  classes: string[];
  focus: string[];
  creators: string[];
  favOnly: boolean;
  newOnly: boolean;
  hasVideo: boolean;
  hasCode: boolean;
  sinceOnly: boolean;
  sort: SortField;
  dir: SortDir;
  view: ViewMode;
  size: number;
  page: number;
  /** Currently opened tune id (deep-linkable), independent of the filters. */
  tune: string | null;
}

export const DEFAULT_FILTERS: Filters = {
  q: "",
  games: [DEFAULT_GAME],
  classes: [],
  focus: [],
  creators: [],
  favOnly: false,
  newOnly: false,
  hasVideo: false,
  hasCode: false,
  sinceOnly: false,
  sort: "class",
  dir: "asc",
  view: "table",
  size: 25,
  page: 1,
  tune: null,
};

function parseFromUrl(): Filters {
  const f = { ...DEFAULT_FILTERS };
  if (typeof window === "undefined") return f;
  const p = new URLSearchParams(window.location.search);
  // Multi-value filters use repeated keys (?creator=a&creator=b) so values that
  // themselves contain commas (e.g. "GTz Marple, OnlyNaps") round-trip cleanly.
  const list = (k: string) => p.getAll(k).filter(Boolean);
  // game/class/focus values never contain commas, so we can still accept older
  // comma-joined links for those without ambiguity.
  const listCommaCompat = (k: string) =>
    p
      .getAll(k)
      .flatMap((v) => v.split(","))
      .map((s) => s.trim())
      .filter(Boolean);
  const q = p.get("q");
  if (q) f.q = q;
  // No game param → keep the default (latest game). `game=all` → every game.
  if (p.has("game")) {
    const vals = listCommaCompat("game");
    f.games = vals.includes(ALL_GAMES) ? [] : vals;
  }
  f.classes = listCommaCompat("class");
  f.focus = listCommaCompat("focus");
  f.creators = list("creator");
  f.favOnly = p.get("fav") === "1";
  f.newOnly = p.get("new") === "1";
  f.hasVideo = p.get("video") === "1";
  f.hasCode = p.get("code") === "1";
  f.sinceOnly = p.get("since") === "1";
  const sort = p.get("sort");
  if (sort && ["car", "class", "game", "creator"].includes(sort)) f.sort = sort as SortField;
  if (p.get("dir") === "desc") f.dir = "desc";
  if (p.get("view") === "cards") f.view = "cards";
  const size = Number(p.get("size"));
  if ([25, 50, 100].includes(size)) f.size = size;
  const page = Number(p.get("page"));
  if (page > 1) f.page = page;
  const tune = p.get("tune");
  if (tune) f.tune = tune;
  return f;
}

function writeToUrl(f: Filters) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  // Repeated keys per value so commas inside values survive a round-trip.
  // Empty games means the user chose "All games" — record it explicitly so it
  // isn't mistaken for the default (latest game) on reload.
  if (f.games.length === 0) p.set("game", ALL_GAMES);
  else for (const v of f.games) p.append("game", v);
  for (const v of f.classes) p.append("class", v);
  for (const v of f.focus) p.append("focus", v);
  for (const v of f.creators) p.append("creator", v);
  if (f.favOnly) p.set("fav", "1");
  if (f.newOnly) p.set("new", "1");
  if (f.hasVideo) p.set("video", "1");
  if (f.hasCode) p.set("code", "1");
  if (f.sinceOnly) p.set("since", "1");
  if (f.sort !== DEFAULT_FILTERS.sort) p.set("sort", f.sort);
  if (f.dir !== DEFAULT_FILTERS.dir) p.set("dir", f.dir);
  if (f.view !== DEFAULT_FILTERS.view) p.set("view", f.view);
  if (f.size !== DEFAULT_FILTERS.size) p.set("size", String(f.size));
  if (f.page > 1) p.set("page", String(f.page));
  if (f.tune) p.set("tune", f.tune);
  const qs = p.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}

// Shared singleton so the game selector, Browse and Overview all read/write the
// same URL-synced filter state.
let filters = parseFromUrl();
const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function commit(next: Filters) {
  filters = next;
  writeToUrl(filters);
  emit();
}

export const filtersStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return filters;
  },
  /** Merge a patch; any change other than page itself resets to page 1. */
  update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    if (!("page" in patch)) next.page = 1;
    commit(next);
  },
  reset() {
    commit({ ...DEFAULT_FILTERS, view: filters.view });
  },
  /** Open/close a tune without disturbing pagination. */
  setTune(id: string | null) {
    commit({ ...filters, tune: id });
  },
};

export function useFilters() {
  const snapshot = useSyncExternalStore(
    filtersStore.subscribe,
    filtersStore.getSnapshot,
    () => filters,
  );
  return {
    filters: snapshot,
    update: filtersStore.update,
    reset: filtersStore.reset,
    setTune: filtersStore.setTune,
  };
}
