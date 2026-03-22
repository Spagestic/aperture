"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export function CompanyTabs({ id }: { id: string }) {
  const segment = useSelectedLayoutSegment();
  const activeTab = segment || "overview";

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "financials", label: "Financials" },
    { value: "earnings", label: "Earnings" },
    { value: "holders", label: "Holders" },
    { value: "historical-data", label: "Historical Data" },
    { value: "analysis", label: "Analysis" },
    { value: "documents", label: "Documents" },
  ];

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList variant={"line"}>
        {tabs.map((tab) => (
          <TabsTrigger asChild key={tab.value} value={tab.value}>
            <Link
              href={
                tab.value === "overview"
                  ? `/company/${id}`
                  : `/company/${id}/${tab.value}`
              }
            >
              {tab.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
