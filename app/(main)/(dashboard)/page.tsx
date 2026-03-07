import PromptBox from "@/components/prompt-box";
import {
  latestFilings,
  marketSummary,
  upcomingEvents,
  watchlist,
} from "./components/data";
import { MarketPulseGrid } from "./components/market-pulse-grid";
import { MarketSummaryCard } from "./components/market-summary-card";
import { DashboardRightRail } from "./components/right-rail";

export default function Page() {
  return (
    <>
      <div className="@container/main flex flex-1 flex-col px-4 pb-40 pt-4 md:px-6 md:pb-44 md:pt-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left Side */}
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <MarketPulseGrid />
            <MarketSummaryCard items={marketSummary} />
          </div>
          {/* Right Side */}
          <DashboardRightRail
            watchlist={watchlist}
            upcomingEvents={upcomingEvents}
            latestFilings={latestFilings}
          />
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-5 transition-[left,right,width] duration-200 ease-linear md:left-[calc(var(--sidebar-width)+1.5rem)] md:right-6 md:group-data-[state=collapsed]/sidebar-wrapper:left-[calc(var(--sidebar-width-icon)+1.5rem)] xl:right-102 motion-reduce:transition-none">
        <PromptBox />
      </div>
    </>
  );
}
