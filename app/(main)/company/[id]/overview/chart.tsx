"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "An interactive line chart";

type CandlePoint = {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
};

type ChartLineInteractiveProps = {
  series: Record<PeriodKey, CandlePoint[]>;
};

const periods = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y"] as const;
type PeriodKey = (typeof periods)[number];

const chartConfig = {
  price: {
    label: "Price",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartLineInteractive({ series }: ChartLineInteractiveProps) {
  const [activePeriod, setActivePeriod] = React.useState<PeriodKey>("1Y");
  const data = React.useMemo(
    () => series[activePeriod] ?? [],
    [series, activePeriod],
  );
  const isDaily = activePeriod === "1D";

  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  const absoluteChange = latest && previous ? latest.close - previous.close : 0;
  const percentChange =
    latest && previous && previous.close !== 0
      ? (absoluteChange / previous.close) * 100
      : 0;
  const tone = absoluteChange >= 0 ? "up" : "down";
  const periodLabel = activePeriod === "1D" ? "today" : `last ${activePeriod}`;
  const subtitle = React.useMemo(() => {
    if (!data.length) return "";

    if (isDaily) {
      const latestDate = new Date(data[data.length - 1].date);
      return `At close: ${latestDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      })}`;
    }

    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);
    return `${startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} – ${endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }, [data, isDaily]);
  const displayData = data.length
    ? data
    : [
        {
          date: new Date().toISOString(),
          close: 0,
          open: 0,
          high: 0,
          low: 0,
          volume: 0,
        },
      ];

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b px-6 py-5 sm:flex-row sm:items-center sm:px-8 sm:py-6">
        <div className="flex flex-1 flex-col justify-center gap-2 pb-4 sm:pb-0">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-2xl font-semibold tabular-nums sm:text-4xl">
                {latest?.close?.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                }) ?? "—"}
              </span>
              <span
                className={tone === "up" ? "text-emerald-500" : "text-rose-500"}
              >
                {absoluteChange >= 0 ? "+" : ""}
                {absoluteChange.toFixed(2)} ({percentChange >= 0 ? "+" : ""}
                {percentChange.toFixed(2)}%) {periodLabel}
              </span>
            </CardTitle>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <Tabs
          value={activePeriod}
          onValueChange={(value) => setActivePeriod(value as PeriodKey)}
          className="pb-1 sm:pb-0"
        >
          <TabsList className="grid h-auto grid-cols-7 p-1">
            {periods.map((period) => (
              <TabsTrigger key={period} value={period}>
                {period}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full"
        >
          <LineChart
            accessibilityLayer
            data={displayData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return isDaily
                  ? date.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-36"
                  nameKey="price"
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return isDaily
                      ? date.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                  }}
                />
              }
            />
            <Line
              dataKey="close"
              type="monotone"
              stroke="var(--color-price)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
