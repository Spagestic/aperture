import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardRightRail } from "../(dashboard)/components/right-rail";
import {
  latestFilings,
  upcomingEvents,
  watchlist,
} from "../(dashboard)/components/data";
import Link from "next/link";

import { ReactNode } from "react";

interface CompanyLayoutProps {
  children: ReactNode;
  params: { company: string };
}

export default function CompanyLayout({
  children,
  params,
}: CompanyLayoutProps) {
  const { company } = params;
  const tabs = [
    { value: "", label: "Overview" },
    { value: "financials", label: "Financials" },
    { value: "earnings", label: "Earnings" },
    { value: "holders", label: "Holders" },
    { value: "historical-data", label: "Historical Data" },
    { value: "analysis", label: "Analysis" },
  ];
  return (
    <div className="@container/main flex flex-1 flex-col px-4 pb-40 pt-4 md:px-6 md:pb-44 md:pt-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left Side */}
        <div className="w-full">
          <Tabs defaultValue={""} className="w-full">
            <TabsList variant={"line"}>
              {tabs.map((tab) => (
                <TabsTrigger asChild key={tab.value} value={tab.value}>
                  <Link href={`/${company}/${tab.value}`}>{tab.label}</Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="pt-4">{children}</div>
        </div>
        {/* Right Side */}
        <DashboardRightRail
          watchlist={watchlist}
          upcomingEvents={upcomingEvents}
          latestFilings={latestFilings}
        />
      </div>
    </div>
  );
}
