import { Suspense } from "react";
import PromptBox from "@/components/prompt-box";
import { DashboardMarketData } from "./components/dashboard-market-data";
import {
  latestFilings,
  marketSummary,
  upcomingEvents,
  watchlist,
} from "./components/data";
import { MarketPulseGrid } from "./components/market-pulse-grid";
import { MarketSummaryCard } from "./components/market-summary-card";
import { DashboardRightRail } from "./components/right-rail";

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

function DashboardFallback() {
  return (
    <div className="@container/main flex flex-1 flex-col px-4 pb-40 pt-4 md:px-6 md:pb-44 md:pt-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <MarketPulseGrid items={FALLBACK_PULSE} />
          <MarketSummaryCard items={marketSummary} />
        </div>
        <DashboardRightRail
          watchlist={watchlist}
          upcomingEvents={upcomingEvents}
          latestFilings={latestFilings}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Suspense fallback={<DashboardFallback />}>
        <DashboardMarketData />
      </Suspense>

      <div className="fixed bottom-4 left-4 right-4 z-5 transition-[left,right,width] duration-200 ease-linear md:left-[calc(var(--sidebar-width)+1.5rem)] md:right-6 md:group-data-[state=collapsed]/sidebar-wrapper:left-[calc(var(--sidebar-width-icon)+1.5rem)] xl:right-102 motion-reduce:transition-none">
        <PromptBox />
      </div>
    </>
  );
}
