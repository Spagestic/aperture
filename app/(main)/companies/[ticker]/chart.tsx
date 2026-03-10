"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const chartConfig = {
  price: {
    label: "Price",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const RANGES = ["1W", "1M", "3M", "6M", "1Y", "5Y"];

interface ChartLineInteractiveProps {
  ticker: string;
}

export function ChartLineInteractive({ ticker }: ChartLineInteractiveProps) {
  const [range, setRange] = React.useState("1Y");
  const [chartData, setChartData] = React.useState<{ date: string; price: number }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/candles/${ticker}?range=${range}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.s === "ok") {
          setChartData(
            data.t.map((timestamp: number, i: number) => ({
              date: new Date(timestamp * 1000).toISOString().split("T")[0],
              price: data.c[i],
            }))
          );
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ticker, range]);

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>{ticker} Stock Price</CardTitle>
          <CardDescription>
            Showing close price for {range === "1W" ? "the last week" : `the last ${range}`}
          </CardDescription>
        </div>
        {/* Range Buttons */}
        <div className="flex items-center gap-1 px-6 pb-3 sm:pb-0">
          {RANGES.map((r) => (
            <Button
              key={r}
              variant={range === r ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
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
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="price"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                }
              />
              <Line
                dataKey="price"
                type="monotone"
                stroke="var(--color-price)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}