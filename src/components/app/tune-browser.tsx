import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ClipboardCopy,
  ExternalLink,
  LayoutGrid,
  Search,
  Table as TableIcon,
  Video,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyCode } from "@/components/app/copy-code";
import { GameBadge } from "@/components/app/game-badge";
import { MultiSelect } from "@/components/app/multi-select";
import { TuneCard } from "@/components/app/tune-card";

// The detail dialog (and radix-dialog) is only needed once a tune is opened, so
// keep it out of the initial bundle.
const TuneDetail = React.lazy(() =>
  import("@/components/app/tune-detail").then((m) => ({ default: m.TuneDetail })),
);
import { useFilters, type SortField } from "@/hooks/use-filters";
import { activeFilterCount, applyFilters } from "@/lib/filtering";
import { useData } from "@/data/store";
import { computeFilterOptions } from "@/data/derive";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { newSinceIds } from "@/data/seen";
import type { Tune } from "@/data/tunes";
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<SortField, string> = {
  class: "Class",
  car: "Car",
  game: "Game",
  creator: "Creator",
};

// Base UI's Select.Value looks up the trigger label from the root `items` map,
// so mirror the option labels here.
const SORT_ITEMS: Record<string, string> = Object.fromEntries(
  (Object.keys(SORT_LABELS) as SortField[]).map((k) => [k, `Sort: ${SORT_LABELS[k]}`]),
);
const PAGE_SIZE_ITEMS: Record<string, string> = {
  "25": "25",
  "50": "50",
  "100": "100",
};

export function TuneBrowser() {
  const { filters, update, reset, setTune } = useFilters();
  const { tunes, filterOptions } = useData();
  const isMobile = useIsMobile();
  // When scoped to a single game, the Game column is redundant.
  const showGameCol = filters.games.length !== 1;

  // Scope the Class/Focus/Creator lists to the selected game so we don't offer
  // options (e.g. Motorsport-only classes) that don't exist in the chosen game.
  const gameOptions = React.useMemo(() => {
    if (!filters.games.length) return filterOptions;
    return computeFilterOptions(tunes.filter((t) => filters.games.includes(t.game)));
  }, [tunes, filters.games, filterOptions]);
  const [copied, setCopied] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // The opened tune is stored in the URL so a tune is directly shareable.
  const active = React.useMemo(
    () => tunes.find((t) => t.id === filters.tune) ?? null,
    [filters.tune, tunes],
  );
  // Mount the lazy detail dialog on first open (or when deep-linked via the
  // URL), then keep it mounted so its open/close transitions still run. Set it
  // synchronously on open so the click doesn't wait a render for the effect.
  const [detailMounted, setDetailMounted] = React.useState(() => filters.tune !== null);
  const setActive = React.useCallback(
    (tune: Tune | null) => {
      if (tune) setDetailMounted(true);
      setTune(tune ? tune.id : null);
    },
    [setTune],
  );

  // "/" focuses search; Escape blurs it while it's focused.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = React.useMemo(() => applyFilters(filters, tunes), [filters, tunes]);

  const totalPages = Math.max(1, Math.ceil(results.length / filters.size));
  const page = Math.min(filters.page, totalPages);
  const start = (page - 1) * filters.size;
  const pageRows = results.slice(start, start + filters.size);

  const filterCount = activeFilterCount(filters);
  const codeCount = results.filter((t) => t.shareCodes.length).length;

  const copyCodes = React.useCallback(async () => {
    const lines = results
      .filter((t) => t.shareCodes.length)
      .map((t) => `${t.car} (${t.class} · ${t.gameCode}): ${t.shareCodes.join(", ")}`);
    if (!lines.length) return;
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
    } catch {
      // clipboard unavailable — ignore
    }
  }, [results]);

  // Reset the "Copied" confirmation after a beat, cancelling cleanly on unmount
  // or a rapid second click so we never touch state after unmount.
  React.useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: search + filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            ref={searchRef}
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search car, creator, code…"
            className="pr-8 pl-9"
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => update({ q: "" })}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MultiSelect
            label="Class"
            options={gameOptions.classes}
            selected={filters.classes}
            onChange={(v) => update({ classes: v })}
          />
          <MultiSelect
            label="Focus"
            options={gameOptions.focus}
            selected={filters.focus}
            onChange={(v) => update({ focus: v })}
          />
          <MultiSelect
            label="Creator"
            options={gameOptions.creators}
            selected={filters.creators}
            onChange={(v) => update({ creators: v })}
            searchable={!isMobile}
          />
          <Toggle
            active={filters.hasVideo}
            onClick={() => update({ hasVideo: !filters.hasVideo })}
            icon={<Video className="size-3.5" />}
          >
            Video
          </Toggle>
          {newSinceIds.size > 0 && (
            <Toggle
              active={filters.sinceOnly}
              onClick={() => update({ sinceOnly: !filters.sinceOnly })}
              icon={<span className="size-2 rounded-full bg-amber-400" aria-hidden="true" />}
            >
              New to you ({newSinceIds.size})
            </Toggle>
          )}
        </div>
      </div>

      {/* Row 2: sort/view controls */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* In the table, headers drive sorting. Cards can't be clicked to
              sort, so they keep a compact sort control. */}
          {filters.view === "cards" && (
            <>
              <Select
                items={SORT_ITEMS}
                value={filters.sort}
                onValueChange={(v) => update({ sort: v as SortField })}
              >
                <SelectTrigger size="sm" className="w-[130px]" aria-label="Sort tunes by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORT_LABELS) as SortField[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      Sort: {SORT_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                title={filters.dir === "asc" ? "Ascending" : "Descending"}
                onClick={() => update({ dir: filters.dir === "asc" ? "desc" : "asc" })}
              >
                {filters.dir === "asc" ? (
                  <ArrowUp className="size-4" />
                ) : (
                  <ArrowDown className="size-4" />
                )}
              </Button>
            </>
          )}
          <div className="flex overflow-hidden rounded-md border">
            <ViewButton
              active={filters.view === "table"}
              onClick={() => update({ view: "table" })}
              title="Table view"
            >
              <TableIcon className="size-4" />
            </ViewButton>
            <ViewButton
              active={filters.view === "cards"}
              onClick={() => update({ view: "cards" })}
              title="Card view"
            >
              <LayoutGrid className="size-4" />
            </ViewButton>
          </div>
        </div>
      </div>

      {/* Result count + reset */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium tabular-nums">
            {results.length.toLocaleString()}
          </span>{" "}
          {results.length === 1 ? "tune" : "tunes"}
          {filterCount > 0 ? " match your filters" : " in the database"}
        </p>
        <div className="flex items-center gap-1">
          {codeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCodes}
              title={`Copy ${codeCount} share code${codeCount === 1 ? "" : "s"}`}
            >
              {copied ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <ClipboardCopy className="size-4" />
              )}
              {copied ? "Copied" : "Copy codes"}
            </Button>
          )}
          {filterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <X className="size-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-20 text-center">
          <Search className="text-muted-foreground size-8" />
          <p className="font-medium">No tunes match your filters</p>
          <p className="text-muted-foreground text-sm">
            Try removing a filter or searching a different car.
          </p>
          <Button variant="outline" size="sm" className="mt-2" onClick={reset}>
            Clear all filters
          </Button>
        </div>
      ) : filters.view === "cards" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageRows.map((t) => (
            <TuneCard key={t.id} tune={t} onOpen={setActive} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortableHead field="class" label="Class" />
                <SortableHead field="car" label="Car" />
                {showGameCol && <SortableHead field="game" label="Game" />}
                <TableHead scope="col" className="px-3">
                  Focus
                </TableHead>
                <SortableHead field="creator" label="Creator" />
                <TableHead scope="col" className="px-3">
                  Share code
                </TableHead>
                <TableHead scope="col" className="px-3">
                  Video
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((t) => (
                <TableRow
                  key={t.id}
                  className="group cursor-pointer align-top"
                  onClick={() => setActive(t)}
                >
                  <TableCell className="px-3 py-3">
                    <Badge variant="outline" className="font-semibold">
                      {t.class}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3 align-middle">
                    <div className="max-w-[280px] min-w-[170px]">
                      <div className="flex items-center gap-2">
                        {newSinceIds.has(t.id) && (
                          <span
                            className="size-2 shrink-0 rounded-full bg-amber-400"
                            title="New since your last visit"
                            aria-label="New since your last visit"
                          />
                        )}
                        <span className="text-foreground group-hover:text-primary font-semibold">
                          {t.car}
                        </span>
                        {t.isNew && (
                          <Badge className="h-4 px-1.5 text-[10px] leading-none">NEW</Badge>
                        )}
                      </div>
                      {t.info && <p className="text-muted-foreground mt-0.5 text-xs">{t.info}</p>}
                    </div>
                  </TableCell>
                  {showGameCol && (
                    <TableCell className="px-3 py-3">
                      <GameBadge game={t.game} />
                    </TableCell>
                  )}
                  <TableCell className="px-3 py-3">
                    {(() => {
                      const tags = t.madeFor
                        .split(/[\n/]/)
                        .map((s) => s.trim())
                        .filter(Boolean);
                      return tags.length ? (
                        <div className="flex max-w-[200px] flex-wrap gap-1">
                          {tags.map((tag, i) => (
                            <span
                              key={`${tag}-${i}`}
                              className="bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    {t.creators.length ? (
                      <div className="text-muted-foreground flex max-w-[160px] flex-col gap-0.5 text-sm">
                        {t.creators.map((c, i) => (
                          <span key={`${c}-${i}`} className="min-w-0 truncate" title={c}>
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    {t.shareCodes.length ? (
                      <div className="flex flex-col items-start gap-1">
                        {t.shareCodes.map((c) => (
                          <CopyCode key={c} code={c} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    {t.videoUrl ? (
                      <a
                        href={t.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-accent inline-flex items-center gap-1 text-sm hover:underline"
                        title={t.videoTitle || "Watch on YouTube"}
                      >
                        <span>{t.videoTitle || "Watch"}</span>
                        <ExternalLink className="size-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {results.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground text-sm tabular-nums">
              {start + 1}–{Math.min(start + filters.size, results.length)} of{" "}
              {results.length.toLocaleString()}
            </p>
            <Select
              items={PAGE_SIZE_ITEMS}
              value={String(filters.size)}
              onValueChange={(v) => update({ size: Number(v) })}
            >
              <SelectTrigger size="sm" className="w-[72px]" aria-label="Tunes per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[25, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => update({ page: page - 1 })}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <span className="text-sm tabular-nums">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => update({ page: page + 1 })}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {detailMounted && (
        <React.Suspense fallback={null}>
          <TuneDetail tune={active} onOpenChange={(o) => !o && setActive(null)} />
        </React.Suspense>
      )}
    </div>
  );
}

function SortableHead({ field, label }: { field: SortField; label: string }) {
  const { filters, update } = useFilters();
  const active = filters.sort === field;
  return (
    <TableHead
      scope="col"
      className="px-3"
      aria-sort={active ? (filters.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() =>
          update({
            sort: field,
            dir: active && filters.dir === "asc" ? "desc" : "asc",
          })
        }
        title={`Sort by ${label.toLowerCase()}`}
        className={cn(
          "group -mx-1 inline-flex items-center gap-1 rounded px-1 py-1 font-medium transition-colors cursor-pointer hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        {active ? (
          filters.dir === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-40 group-hover:opacity-70" />
        )}
      </button>
    </TableHead>
  );
}

function Toggle({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn(!active && "text-muted-foreground")}
    >
      {icon}
      {children}
    </Button>
  );
}

function ViewButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex size-8 items-center justify-center transition-colors cursor-pointer",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
