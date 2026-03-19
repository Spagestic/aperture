"use client";

import Link from "next/link";
import { useId } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FinanceChartCardProps = {
  title: string;
  price: string;
  percentChange: string;
  absoluteChange?: string;
  tone?: "up" | "down" | "neutral";
  data: number[];
  /** Optional ticker used for linking to the [company] route. */
  ticker?: string;
  className?: string;
};

export function FinanceChartCard({
  title,
  price,
  percentChange,
  absoluteChange,
  tone = "down",
  data,
  ticker,
  className,
}: FinanceChartCardProps) {
  const id = useId();
  const chartData = data.map((value, index) => ({ index, value }));
  const baseline = chartData[0]?.value ?? 0;
  const gradientId = `finance-card-${id}`;

  const palette =
    tone === "up"
      ? {
          stroke: "#4ade80",
          fillStart: "rgba(74, 222, 128, 0.20)",
          fillEnd: "rgba(74, 222, 128, 0.01)",
          text: "text-emerald-400",
        }
      : {
          stroke: "#fb7185",
          fillStart: "rgba(251, 113, 133, 0.20)",
          fillEnd: "rgba(251, 113, 133, 0.01)",
          text: "text-rose-400",
        };

  const card = (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-sm pt-4 pb-0",
        className,
      )}
    >
      <CardContent className="p-0">
        <div className="px-4 pt-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-medium leading-none tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-none tabular-nums text-muted-foreground">
                {price}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <div
                className={cn(
                  "flex items-center justify-end gap-1 text-[15px] font-semibold leading-none tabular-nums",
                  palette.text,
                )}
              >
                {tone === "up" ? (
                  <ArrowUpRight className="size-4" />
                ) : (
                  <ArrowDownRight className="size-4" />
                )}
                <span>{percentChange}</span>
              </div>

              {absoluteChange ? (
                <p className="mt-2 text-sm leading-none tabular-nums text-muted-foreground">
                  {absoluteChange}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="h-18 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={palette.fillStart} />
                  <stop offset="100%" stopColor={palette.fillEnd} />
                </linearGradient>
              </defs>

              <ReferenceLine
                y={baseline}
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity={0.28}
                strokeDasharray="3 3"
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke={palette.stroke}
                strokeWidth={2.25}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
                dot={false}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  if (ticker) {
    return (
      <Link href={`/${ticker}`} prefetch={false} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
