import * as React from "react";

export type SortField = "car" | "class" | "game" | "creator";
export type SortDir = "asc" | "desc";
export type ViewMode = "table" | "cards";

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
  games: [],
  classes: [],
  focus: [],
  creators: [],
  favOnly: false,
  newOnly: false,
  hasVideo: false,
  hasCode: false,
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
  const list = (k: string) =>
    p.get(k) ? p.get(k)!.split(",").map(decodeURIComponent).filter(Boolean) : [];
  if (p.get("q")) f.q = p.get("q")!;
  f.games = list("game");
  f.classes = list("class");
  f.focus = list("focus");
  f.creators = list("creator");
  f.favOnly = p.get("fav") === "1";
  f.newOnly = p.get("new") === "1";
  f.hasVideo = p.get("video") === "1";
  f.hasCode = p.get("code") === "1";
  if (["car", "class", "game", "creator"].includes(p.get("sort") ?? ""))
    f.sort = p.get("sort") as SortField;
  if (p.get("dir") === "desc") f.dir = "desc";
  if (p.get("view") === "cards") f.view = "cards";
  const size = Number(p.get("size"));
  if ([25, 50, 100].includes(size)) f.size = size;
  const page = Number(p.get("page"));
  if (page > 1) f.page = page;
  if (p.get("tune")) f.tune = p.get("tune");
  return f;
}

function writeToUrl(f: Filters) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.games.length) p.set("game", f.games.join(","));
  if (f.classes.length) p.set("class", f.classes.join(","));
  if (f.focus.length) p.set("focus", f.focus.join(","));
  if (f.creators.length) p.set("creator", f.creators.join(","));
  if (f.favOnly) p.set("fav", "1");
  if (f.newOnly) p.set("new", "1");
  if (f.hasVideo) p.set("video", "1");
  if (f.hasCode) p.set("code", "1");
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

export function useFilters() {
  const [filters, setFilters] = React.useState<Filters>(parseFromUrl);

  React.useEffect(() => {
    writeToUrl(filters);
  }, [filters]);

  // Patch filters; any change other than page itself resets to page 1.
  const update = React.useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      if (!("page" in patch)) next.page = 1;
      return next;
    });
  }, []);

  const reset = React.useCallback(() => setFilters({ ...DEFAULT_FILTERS }), []);

  return { filters, update, reset, setFilters };
}
