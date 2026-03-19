import { PromptBox } from "@/components/prompt-box";
import {
  latestFilings,
  marketSummary,
  upcomingEvents,
  watchlist,
} from "./components/data";
import { getDashboardMarketStrip } from "@/lib/providers/yahoo";
import { MarketStripClient } from "./components/market-strip-client";
import { MarketSummary } from "./components/market-summary";
import { LatestFilingsSection } from "./components/filings";
import { UpcomingEventsSection } from "./components/upcoming";
import { WatchlistSection } from "./components/watchlist";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <div className="@container/main flex flex-1 flex-col px-4 pb-40 pt-4 md:px-6 md:pb-44 md:pt-6">
        <Suspense fallback={<MarketStripSkeleton />}>
          <MarketStrip />
        </Suspense>

        {/* Main center panel */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] pt-4">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <MarketSummary items={marketSummary} />
          </div>

          {/* Right rail */}
          <aside className="space-y-4">
            <WatchlistSection watchlist={watchlist} />
            <UpcomingEventsSection upcomingEvents={upcomingEvents} />
            <LatestFilingsSection latestFilings={latestFilings} />
          </aside>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-5 transition-[left,right,width] duration-200 ease-linear md:left-[calc(var(--sidebar-width)+1.5rem)] md:right-6 md:group-data-[state=collapsed]/sidebar-wrapper:left-[calc(var(--sidebar-width-icon)+1.5rem)] xl:right-102 motion-reduce:transition-none">
        <PromptBox />
      </div>
    </>
  );
}

export async function MarketStrip() {
  const marketData = await getDashboardMarketStrip();

  return <MarketStripClient initialData={marketData} />;
}

function MarketStripSkeleton() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
      <div className="flex items-center gap-2">
        {[72, 92, 84, 108, 80, 96].map((width, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-md bg-secondary px-2 py-2"
          >
            <Skeleton
              className="h-3.5 rounded-full"
              style={{ width: `${width * 0.45}px` }}
            />
            <Skeleton
              className="h-3.5 rounded-full"
              style={{ width: `${width * 0.3}px` }}
            />
            <Skeleton
              className="h-3.5 rounded-full"
              style={{ width: `${width * 0.25}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
