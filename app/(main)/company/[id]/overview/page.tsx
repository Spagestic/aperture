import { ChartLineInteractive } from "./chart";
import { getCandles } from "@/lib/finnhub";

const periods = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y"] as const;

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const results = await Promise.all(
    periods.map(async (period) => ({
      period,
      candles: await getCandles(id, period),
    })),
  );

  const series = Object.fromEntries(
    results.map(({ period, candles }) => {
      const timestamps = candles?.t ?? [];
      const closes = candles?.c ?? [];
      const opens = candles?.o ?? [];
      const highs = candles?.h ?? [];
      const lows = candles?.l ?? [];
      const volumes = candles?.v ?? [];

      return [
        period,
        candles?.s === "ok"
          ? timestamps.map((timestamp, index) => ({
              date: new Date(timestamp * 1000).toISOString(),
              close: closes[index] ?? 0,
              open: opens[index] ?? 0,
              high: highs[index] ?? 0,
              low: lows[index] ?? 0,
              volume: volumes[index] ?? 0,
            }))
          : [],
      ];
    }),
  ) as Record<
    (typeof periods)[number],
    Array<{
      date: string;
      close: number;
      open: number;
      high: number;
      low: number;
      volume: number;
    }>
  >;

  return <ChartLineInteractive series={series} />;
}
