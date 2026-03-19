import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Star } from "lucide-react";

import { ReactNode } from "react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Button } from "@/components/ui/button";
import { getDemoCompanyFinancialPayload } from "@/lib/financial-dashboard";
import { fetchCompanyFinancials } from "@/lib/company-financials-api";
import CompanyCard from "./company-card";

interface CompanyLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function CompanyLayout({
  children,
  params,
}: CompanyLayoutProps) {
  const { id } = await params;
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const ticker = id.length <= 5 ? id.toUpperCase() : id;

  let payload = getDemoCompanyFinancialPayload(id);
  if (apiKey) {
    try {
      payload = await fetchCompanyFinancials(ticker, apiKey);
    } catch {
      payload = getDemoCompanyFinancialPayload(id);
    }
  }

  const profile = payload.company;

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
      {/* Top Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <CompanyLogo
            domain={profile.logoDomain ?? profile.slug}
            className="h-14 w-14 rounded-md border border-border/50 bg-background object-cover"
          />
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile.ticker} · {profile.exchange}
              {profile.country ? ` · ${profile.country}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Star className="size-4" />
            Following
          </Button>
        </div>
      </div>
      {/* Main Content */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left Side */}
        <div className="w-full">
          <Tabs defaultValue={""} className="w-full">
            <TabsList variant={"line"}>
              {tabs.map((tab) => (
                <TabsTrigger asChild key={tab.value} value={tab.value}>
                  <Link
                    href={
                      tab.value
                        ? `/company/${id}/${tab.value}`
                        : `/company/${id}`
                    }
                  >
                    {tab.label}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="pt-4">{children}</div>
        </div>
        {/* Right Side */}
        <div className="space-y-6">
          <CompanyCard profile={profile} />
        </div>
      </div>
    </div>
  );
}
