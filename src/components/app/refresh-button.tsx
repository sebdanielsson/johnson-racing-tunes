import * as React from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dataStore, useData } from "@/data/store";
import { cn } from "@/lib/utils";

function relativeTime(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function RefreshButton() {
  const { status, lastUpdated, error } = useData();
  const loading = status === "loading";
  // Re-render periodically so the "updated Xm ago" label stays fresh.
  const [, force] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    const id = window.setInterval(force, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const title =
    status === "error"
      ? `Refresh failed: ${error ?? "unknown error"} — click to retry`
      : loading
        ? "Refreshing from the source sheet…"
        : lastUpdated
          ? `Data updated ${relativeTime(lastUpdated)} — refresh from sheet`
          : "Refresh data from the source sheet";

  return (
    <div className="flex items-center gap-1.5">
      {lastUpdated && !loading && status !== "error" && (
        <span className="hidden text-xs text-muted-foreground xl:inline">
          Updated {relativeTime(lastUpdated)}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => dataStore.refresh()}
        disabled={loading}
        aria-label="Refresh data from the source sheet"
        title={title}
      >
        {status === "error" ? (
          <TriangleAlert className="size-4 text-destructive" />
        ) : (
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
        )}
      </Button>
    </div>
  );
}
