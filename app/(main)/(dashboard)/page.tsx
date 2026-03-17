import {
  latestFilings,
  marketSummary,
  upcomingEvents,
  watchlist,
} from "./components/data";
import { MarketStrip } from "./components/market-strip";
import { MarketSummaryCard } from "./components/market-summary-card";
import { RightRail } from "./components/right-rail";

export default function Page() {
  return (
    <>
      <div className="@container/main flex flex-1 flex-col px-4 pb-40 pt-4 md:px-6 md:pb-44 md:pt-6">
        <div className="border-b border-border/50">
          <MarketStrip />
        </div>
        {/* Main center panel */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] pt-4">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <MarketSummaryCard items={marketSummary} />
          </div>
          {/* Right rail */}
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
