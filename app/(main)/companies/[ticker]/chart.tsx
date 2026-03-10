"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  price: {
    label: "Price",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface CandleData {
  s: string;
  c?: number[];
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  v?: number[];
}

interface ChartLineInteractiveProps {
  candles: CandleData;
  ticker: string;
}

export function ChartLineInteractive({ candles, ticker }: ChartLineInteractiveProps) {
  const chartData = React.useMemo(() => {
  if (!candles || candles.s !== "ok" || !candles.t || !candles.c) return [];
  return candles.t.map((timestamp, i) => ({
    date: new Date(timestamp * 1000).toISOString().split("T")[0],
    price: candles.c![i],
  }));
}, [candles]);

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>{ticker} Stock Price</CardTitle>
          <CardDescription>Showing close price for the last 24 hours</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="price"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })
                  }
                />
              }
            />
            <Line dataKey="price" type="monotone" stroke="var(--color-price)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}