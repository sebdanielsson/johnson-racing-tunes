import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  SlidersHorizontal,
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
import { games, sortedClasses, tunes, type Tune } from "@/data/tunes";
import { cn } from "@/lib/utils";

const FOCUS_OPTIONS = [
  "Allround",
  "Speed",
  "Handling",
  "Acceleration",
  "Dirt",
  "Cross Country",
];

const classOptions = sortedClasses();

function SortHeader({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {label}
      <ArrowUpDown className="size-3.5 opacity-60" />
    </button>
  );
}

const columns: ColumnDef<Tune>[] = [
  {
    accessorKey: "car",
    header: ({ column }) => (
      <SortHeader
        label="Car"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      />
    ),
    cell: ({ row }) => {
      const t = row.original;
      return (
        <div className="min-w-[180px] max-w-[280px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{t.car}</span>
            {t.isNew && (
              <Badge className="h-4 px-1.5 text-[10px] leading-none">
                NEW
              </Badge>
            )}
          </div>
          {t.info && (
            <p className="mt-0.5 text-xs text-muted-foreground">{t.info}</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "game",
    header: "Game",
    filterFn: (row, id, value) => row.getValue(id) === value,
    cell: ({ row }) => <GameBadge game={row.original.game} />,
  },
  {
    accessorKey: "class",
    header: ({ column }) => (
      <SortHeader
        label="Class"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      />
    ),
    filterFn: (row, id, value) => row.getValue(id) === value,
    sortingFn: (a, b) => a.original.classOrder - b.original.classOrder,
    cell: ({ row }) => (
      <Badge variant="outline" className="font-semibold">
        {row.original.class}
      </Badge>
    ),
  },
  {
    accessorKey: "madeFor",
    header: "Made for",
    filterFn: (row, _id, value) =>
      row.original.madeFor.toLowerCase().includes(String(value).toLowerCase()),
    cell: ({ row }) => {
      const tags = row.original.madeFor
        .split(/[\n/]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (!tags.length)
        return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex max-w-[220px] flex-wrap gap-1">
          {tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: "creators",
    accessorFn: (t) => t.creators.join(", "),
    header: "Creator",
    cell: ({ row }) => (
      <div className="max-w-[160px] text-sm text-muted-foreground">
        {row.original.creators.join(", ") || "—"}
      </div>
    ),
  },
  {
    id: "shareCodes",
    header: "Share code",
    enableSorting: false,
    cell: ({ row }) => {
      const codes = row.original.shareCodes;
      if (!codes.length)
        return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-col items-start gap-1">
          {codes.map((c) => (
            <CopyCode key={c} code={c} />
          ))}
        </div>
      );
    },
  },
  {
    id: "video",
    header: "Video",
    enableSorting: false,
    cell: ({ row }) => {
      const t = row.original;
      if (!t.videoUrl)
        return <span className="text-muted-foreground">—</span>;
      return (
        <a
          href={t.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-[160px] items-center gap-1 text-sm text-primary hover:underline"
          title={t.videoTitle || "Watch on YouTube"}
        >
          <span className="truncate">{t.videoTitle || "Watch"}</span>
          <ExternalLink className="size-3.5 shrink-0" />
        </a>
      );
    },
  },
];

const ALL = "__all__";

export function TunesTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data: tunes,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _id, value) => {
      const q = String(value).toLowerCase();
      const t = row.original;
      return (
        t.car.toLowerCase().includes(q) ||
        t.creators.join(" ").toLowerCase().includes(q) ||
        t.madeFor.toLowerCase().includes(q) ||
        t.info.toLowerCase().includes(q) ||
        t.shareCodes.join(" ").toLowerCase().includes(q) ||
        t.videoTitle.toLowerCase().includes(q)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const gameValue =
    (columnFilters.find((f) => f.id === "game")?.value as string) ?? ALL;
  const classValue =
    (columnFilters.find((f) => f.id === "class")?.value as string) ?? ALL;
  const focusValue =
    (columnFilters.find((f) => f.id === "madeFor")?.value as string) ?? ALL;

  const setFilter = (id: string, value: string) =>
    table
      .getColumn(id)
      ?.setFilterValue(value === ALL ? undefined : value);

  const hasFilters =
    columnFilters.length > 0 || globalFilter.trim().length > 0;

  const filtered = table.getFilteredRowModel().rows.length;
  const pageStart =
    table.getState().pagination.pageIndex *
    table.getState().pagination.pageSize;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search car, creator, code…"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <Select
            value={gameValue}
            onValueChange={(v) => setFilter("game", v)}
          >
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue placeholder="Game" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All games</SelectItem>
              {games.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={classValue}
            onValueChange={(v) => setFilter("class", v)}
          >
            <SelectTrigger size="sm" className="w-[130px]">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All classes</SelectItem>
              {classOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={focusValue}
            onValueChange={(v) => setFilter("madeFor", v)}
          >
            <SelectTrigger size="sm" className="w-[140px]">
              <SelectValue placeholder="Focus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Any focus</SelectItem>
              {FOCUS_OPTIONS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setColumnFilters([]);
                setGlobalFilter("");
              }}
            >
              <X className="size-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">
          {filtered.toLocaleString()}
        </span>{" "}
        {filtered === 1 ? "tune" : "tunes"}
        {hasFilters ? " match your filters" : " in the database"}
      </p>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="px-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="align-top">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("px-3 py-3 align-top")}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No tunes match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground tabular-nums">
          {filtered === 0
            ? "0 results"
            : `Showing ${pageStart + 1}–${Math.min(
                pageStart + table.getState().pagination.pageSize,
                filtered,
              )} of ${filtered.toLocaleString()}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <span className="text-sm tabular-nums">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
