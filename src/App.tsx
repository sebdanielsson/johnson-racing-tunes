import { lazy, Suspense } from "react";
import { BarChart3, Loader2, Table as TableIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YoutubeIcon } from "@/components/app/brand-icons";
import { SiteHeader } from "@/components/app/site-header";
import { StatTiles } from "@/components/app/stat-tiles";
import { GameSwitcher } from "@/components/app/game-switcher";
import { TuneBrowser } from "@/components/app/tune-browser";
import { CHANNEL_URL, COMMIT_SHORT, COMMIT_URL, REPO_URL, SHEET_URL } from "@/lib/constants";
import { useData } from "@/data/store";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

// Recharts is heavy — only load the charts when the Overview tab is opened.
const OverviewCharts = lazy(() =>
  import("@/components/app/overview-charts").then((m) => ({
    default: m.OverviewCharts,
  })),
);

function App() {
  const { games } = useData();
  useAutoRefresh();
  return (
    <div className="bg-background min-h-screen">
      <div className="bg-grid pointer-events-none fixed inset-0 -z-10 opacity-60" />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 70%)",
        }}
      />

      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        {/* Hero */}
        <section className="py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border-primary/30 bg-primary/10 text-primary-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
              <span className="relative flex size-1.5">
                <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75" />
                <span className="bg-primary relative inline-flex size-1.5 rounded-full" />
              </span>
              {games.length} Forza titles · community tunes
            </span>
          </div>
          <h2 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Find the perfect Forza tune, <span className="text-primary">in seconds.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base sm:text-lg">
            Every tune share code from Johnson Racing Tunes — searchable, filterable and one tap to
            copy. Curated across Forza Horizon 6, 5, 4, 3 and Motorsport 7.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" render={<a href={CHANNEL_URL} target="_blank" rel="noreferrer" />}>
              <YoutubeIcon className="size-4" />
              Watch the channel
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<a href={SHEET_URL} target="_blank" rel="noreferrer" />}
            >
              View source sheet
            </Button>
          </div>

          <div className="mt-10">
            <StatTiles />
          </div>
        </section>

        {/* Content — view tabs + game selector share one wrapping row.
            The game selector scopes both Browse and Overview. */}
        <Tabs defaultValue="browse" className="gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <TabsList>
              <TabsTrigger value="browse">
                <TableIcon className="size-4" />
                Browse
              </TabsTrigger>
              <TabsTrigger value="overview">
                <BarChart3 className="size-4" />
                Overview
              </TabsTrigger>
            </TabsList>
            <GameSwitcher />
          </div>

          {/* min-w-0: the panel is a flex child (Base UI Tabs), so without this
              the wide table expands the page instead of scrolling in-place. */}
          <TabsContent value="browse" className="min-w-0">
            <TuneBrowser />
          </TabsContent>

          <TabsContent value="overview" className="min-w-0">
            <Suspense
              fallback={
                <div className="text-muted-foreground flex h-[400px] items-center justify-center">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              }
            >
              <OverviewCharts />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-border/70 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm sm:flex-row sm:px-6">
          <p>
            An unofficial fan-made frontend for{" "}
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
              className="text-foreground hover:text-primary font-medium"
            >
              Johnson Racing Tunes
            </a>
            . Data © the respective tune creators.
          </p>
          {COMMIT_SHORT ? (
            <a
              href={COMMIT_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground font-mono text-xs"
              title="View this build's commit on GitHub"
              aria-label={`View build commit ${COMMIT_SHORT} on GitHub`}
            >
              {COMMIT_SHORT}
            </a>
          ) : (
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground text-xs"
            >
              Source
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;
