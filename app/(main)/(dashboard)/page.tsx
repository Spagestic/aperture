import { Suspense } from "react";
import PromptBox from "@/components/prompt-box";
import { DashboardMarketData } from "./components/dashboard-market-data";
import { DashboardSkeleton } from "./components/dashboard-skeleton";

export default function Page() {
  return (
    <>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardMarketData />
      </Suspense>

      <div className="fixed bottom-4 left-4 right-4 z-5 transition-[left,right,width] duration-200 ease-linear md:left-[calc(var(--sidebar-width)+1.5rem)] md:right-6 md:group-data-[state=collapsed]/sidebar-wrapper:left-[calc(var(--sidebar-width-icon)+1.5rem)] xl:right-102 motion-reduce:transition-none">
        <PromptBox />
      </div>
    </>
  );
}
