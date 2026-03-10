"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const chartConfig = {
  price: {
    label: "Price",
    color: "#e8572a",
  },
} satisfies ChartConfig;

const RANGES = ["1D", "5D", "1W", "1M", "3M", "6M", "1Y", "5Y"];

interface ChartLineInteractiveProps {
  ticker: string;
}

export function ChartLineInteractive({ ticker }: ChartLineInteractiveProps) {
  const [range, setRange] = React.useState("1D");
  const [chartData, setChartData] = React.useState<
    { date: string; price: number }[]
  >([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/candles/${ticker}?range=${range}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.s === "ok") {
          setChartData(
            data.t.map((timestamp: number, i: number) => ({
              date: new Date(timestamp * 1000).toISOString(),
              price: data.c[i],
            }))
          );
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ticker, range]);

  const getDescription = () => {
    const map: Record<string, string> = {
      "1D": "Showing close price for today",
      "5D": "Showing close price for the last 5 days",
      "1W": "Showing close price for the last week",
      "1M": "Showing close price for the last month",
      "3M": "Showing close price for the last 3 months",
      "6M": "Showing close price for the last 6 months",
      "1Y": "Showing close price for the last year",
      "5Y": "Showing close price for the last 5 years",
    };
    return map[range] ?? "";
  };

  // Determine if price trended up or down for color
  const isPositive =
    chartData.length < 2 ||
    chartData[chartData.length - 1].price >= chartData[0].price;

  const lineColor = isPositive ? "#22c55e" : "#ef4444";
  const gradientId = "priceGradient";

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col items-stretch border-b p-0! pb-4 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1">
          <CardTitle className="text-base">{ticker} Stock Price</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </div>
        {/* Range Buttons */}
        <div className="flex items-center gap-0.5">
          {RANGES.map((r) => (
            <Button
              key={r}
              variant={range === r ? "secondary" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5 rounded-full"
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-0 pt-4">
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart
              data={chartData}
              margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={lineColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Very subtle horizontal grid only */}
              <CartesianGrid
                vertical={false}
                stroke="currentColor"
                strokeOpacity={0.06}
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={40}
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />

              <YAxis
                domain={([dataMin, dataMax]) => {
                  const padding = (dataMax - dataMin) * 0.15 || 1;
                  return [
                    parseFloat((dataMin - padding).toFixed(2)),
                    parseFloat((dataMax + padding).toFixed(2)),
                  ];
                }}
                hide={true}
              />

              <ChartTooltip
                cursor={{
                  stroke: lineColor,
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                content={
                  <ChartTooltipContent
                    className="w-[160px] text-xs"
                    nameKey="price"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    formatter={(value) => [
                      `$${Number(value).toFixed(2)}`,
                      "Price",
                    ]}
                  />
                }
              />

              <Area
                dataKey="price"
                type="natural"
                stroke={lineColor}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: lineColor,
                  stroke: "white",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}