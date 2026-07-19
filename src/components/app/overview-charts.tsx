import * as React from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { byClass, byFocus, byGame, topCreators } from "@/lib/aggregations";
import { activeFilterCount, applyFilters } from "@/lib/filtering";
import { gameColorVar } from "@/lib/constants";
import { gameShort } from "@/data/tunes";
import { useData } from "@/data/store";
import { useFilters } from "@/hooks/use-filters";

const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 } as const;
const singleConfig = {
  value: { label: "Tunes", color: "var(--chart-1)" },
} satisfies ChartConfig;
const gameConfig = { value: { label: "Tunes" } } satisfies ChartConfig;

export function OverviewCharts() {
  const { tunes } = useData();
  const { filters } = useFilters();

  const results = React.useMemo(() => applyFilters(filters, tunes), [filters, tunes]);
  const filtered = activeFilterCount(filters) > 0;

  const gameData = React.useMemo(
    () =>
      byGame(results).map((d) => ({
        ...d,
        short: gameShort[d.name] ?? d.name,
        fill: gameColorVar[d.name] ?? "var(--chart-1)",
      })),
    [results],
  );
  const classData = React.useMemo(() => byClass(results), [results]);
  const creatorData = React.useMemo(() => topCreators(results, 12), [results]);
  const focusData = React.useMemo(() => byFocus(results), [results]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        {filtered ? (
          <>
            Charts reflect your current filters —{" "}
            <span className="text-foreground font-medium tabular-nums">
              {results.length.toLocaleString()}
            </span>{" "}
            matching {results.length === 1 ? "tune" : "tunes"}.
          </>
        ) : (
          <>Showing all {results.length.toLocaleString()} tunes in the database.</>
        )}
      </p>

      {results.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed py-20 text-center">
          No tunes match your filters — adjust them to see the breakdown.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Tunes by game"
            description="Coverage across the Forza titles"
            data={gameData}
          >
            <ChartContainer config={gameConfig} className="h-[260px] w-full min-w-0">
              <BarChart
                accessibilityLayer
                data={gameData}
                margin={{ top: 24, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="short"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={axisTick}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      labelFormatter={(_, p) => p?.[0]?.payload?.name ?? ""}
                    />
                  }
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={72}>
                  {gameData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    className="fill-foreground"
                    fontSize={12}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard
            title="Tunes by class"
            description="Performance-class ladder (D → R)"
            data={classData}
          >
            <ChartContainer config={singleConfig} className="h-[260px] w-full min-w-0">
              <BarChart
                accessibilityLayer
                data={classData}
                margin={{ top: 24, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={axisTick}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={56}
                >
                  <LabelList
                    dataKey="value"
                    position="top"
                    className="fill-foreground"
                    fontSize={12}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard
            title="Top creators"
            description="Most tunes in the current selection"
            data={creatorData}
          >
            <ChartContainer config={singleConfig} className="h-[360px] w-full min-w-0">
              <BarChart
                accessibilityLayer
                layout="vertical"
                data={creatorData}
                margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={112}
                  tick={axisTick}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={22}
                >
                  <LabelList
                    dataKey="value"
                    position="right"
                    className="fill-foreground"
                    fontSize={12}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard
            title="Tune focus"
            description="What builds are made for (tunes may span several)"
            data={focusData}
          >
            <ChartContainer config={singleConfig} className="h-[360px] w-full min-w-0">
              <BarChart
                accessibilityLayer
                layout="vertical"
                data={focusData}
                margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={104}
                  tick={axisTick}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={22}
                >
                  <LabelList
                    dataKey="value"
                    position="right"
                    className="fill-foreground"
                    fontSize={12}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function ChartCard({
  title,
  description,
  data,
  children,
}: {
  title: string;
  description: string;
  data: unknown[];
  children: React.ReactNode;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length ? (
          children
        ) : (
          <div className="text-muted-foreground flex h-[220px] items-center justify-center text-sm">
            Not enough data for this selection.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
