"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import {
  latestFilings as fallbackFilings,
  marketSummary as fallbackSummary,
  upcomingEvents as fallbackEvents,
  watchlist as fallbackWatchlist,
} from "./data";
import { MarketPulseGrid } from "./market-pulse-grid";
import { MarketSummaryCard } from "./market-summary-card";
import { DashboardRightRail } from "./right-rail";
import type { DashboardData } from "@/convex/market";

const FALLBACK_PULSE = [
  {
    title: "S&P Futures",
    price: "$6,743.75",
    percentChange: "-1.34%",
    absoluteChange: "-$91.50",
    tone: "down" as const,
    data: [100, 99.7, 99.2, 98.8, 98.5, 98.2, 98.0, 97.8, 97.7, 97.6],
  },
  {
    title: "NASDAQ Fut.",
    price: "$24,670.25",
    percentChange: "-1.51%",
    absoluteChange: "-$379.25",
    tone: "down" as const,
    data: [100, 99.6, 99.1, 98.7, 98.3, 98.0, 97.7, 97.5, 97.3, 97.1],
  },
  {
    title: "Dow Futures",
    price: "$47,517.00",
    percentChange: "-0.97%",
    absoluteChange: "-$466.00",
    tone: "down" as const,
    data: [100, 99.9, 99.7, 99.5, 99.2, 99.0, 98.8, 98.7, 98.6, 98.5],
  },
  {
    title: "VIX",
    price: "29.49",
    percentChange: "+24.17%",
    absoluteChange: "+5.74",
    tone: "up" as const,
    data: [100, 99.8, 99.7, 99.7, 99.9, 100.2, 100.8, 101.5, 102.7, 124.2],
  },
];

export function DashboardMarketData() {
  const getDashboardData = useAction(api.market.getDashboardData);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDashboardData()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(false);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [getDashboardData]);

  const watchlist = data?.watchlist?.length
    ? data.watchlist
    : fallbackWatchlist;
  const marketPulse = data?.marketPulse?.length
    ? data.marketPulse
    : FALLBACK_PULSE;
  const marketSummary = data?.marketSummary?.length
    ? data.marketSummary
    : fallbackSummary;
  const upcomingEvents = data?.upcomingEvents?.length
    ? data.upcomingEvents
    : fallbackEvents;
  const latestFilings = data?.latestFilings?.length
    ? data.latestFilings
    : fallbackFilings;

  return (
    <>
      <div className="@container/main flex flex-1 flex-col px-4 pb-40 pt-4 md:px-6 md:pb-44 md:pt-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {loading && (
              <p className="text-xs text-muted-foreground">
                Updating market data...
              </p>
            )}
            {error && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Using cached data. Set FINNHUB_API_KEY in Convex for news and
                filings.
              </p>
            )}
            <MarketPulseGrid items={marketPulse} />
            <MarketSummaryCard items={marketSummary} />
          </div>
          <DashboardRightRail
            watchlist={watchlist}
            upcomingEvents={upcomingEvents}
            latestFilings={latestFilings}
          />
        </div>
      </div>
    </>
  );
}
