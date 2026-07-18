import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { byClass, byFocus, byGame, topCreators } from "@/lib/aggregations";
import { gameColorVar } from "@/lib/constants";
import { gameShort } from "@/data/tunes";

const gameData = byGame().map((d) => ({
  ...d,
  short: gameShort[d.name] ?? d.name,
  fill: gameColorVar[d.name] ?? "var(--chart-1)",
}));
const classData = byClass();
const creatorData = topCreators(12);
const focusData = byFocus();

const axisTick = {
  fill: "var(--muted-foreground)",
  fontSize: 12,
} as const;

const singleConfig = {
  value: { label: "Tunes", color: "var(--chart-1)" },
} satisfies ChartConfig;

const gameConfig = {
  value: { label: "Tunes" },
} satisfies ChartConfig;

export function OverviewCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Tunes by game — categorical colour per game */}
      <Card>
        <CardHeader>
          <CardTitle>Tunes by game</CardTitle>
          <CardDescription>
            Coverage across the Forza titles in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={gameConfig}
            className="h-[260px] w-full"
          >
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
        </CardContent>
      </Card>

      {/* Tunes by class — single hue, ordered ladder */}
      <Card>
        <CardHeader>
          <CardTitle>Tunes by class</CardTitle>
          <CardDescription>
            Performance-class ladder (D → R), Horizon titles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={singleConfig} className="h-[260px] w-full">
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
        </CardContent>
      </Card>

      {/* Top creators — horizontal single hue */}
      <Card>
        <CardHeader>
          <CardTitle>Top creators</CardTitle>
          <CardDescription>Most tunes in the database</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={singleConfig}
            className="h-[360px] w-full"
          >
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
        </CardContent>
      </Card>

      {/* Tune focus — horizontal single hue */}
      <Card>
        <CardHeader>
          <CardTitle>Tune focus</CardTitle>
          <CardDescription>
            What builds are made for (tunes may span several)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={singleConfig}
            className="h-[360px] w-full"
          >
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
        </CardContent>
      </Card>
    </div>
  );
}
