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
import { DashboardSkeleton } from "./dashboard-skeleton";
import { MarketSummaryCard } from "./market-summary-card";
import { RightRail } from "./right-rail";
import type { DashboardData } from "@/convex/market";
import { MarketStrip } from "./market-strip";

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
  const marketSummary = data?.marketSummary?.length
    ? data.marketSummary
    : fallbackSummary;
  const upcomingEvents = data?.upcomingEvents?.length
    ? data.upcomingEvents
    : fallbackEvents;
  const latestFilings = data?.latestFilings?.length
    ? data.latestFilings
    : fallbackFilings;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="@container/main flex flex-1 flex-col px-4 pb-40 pt-4 md:px-6 md:pb-44 md:pt-6">
        {/* market strip */}
        <div className="border-b border-border/50 pb-4">
          <MarketStrip />
        </div>
        {/* Main center panel */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] pt-4">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {error && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Using cached data. Set FINNHUB_API_KEY in Convex for news and
                filings.
              </p>
            )}
            <MarketSummaryCard items={marketSummary} />
          </div>
          <RightRail
            watchlist={watchlist}
            upcomingEvents={upcomingEvents}
            latestFilings={latestFilings}
          />
        </div>
      </div>
    </>
  );
}
