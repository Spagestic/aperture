import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChartLineInteractive } from "./chart";
import { DashboardRightRail } from "../../(dashboard)/components/right-rail";
import { latestFilings, upcomingEvents, watchlist } from "../../(dashboard)/components/data";
import { getQuote, getCompanyProfile } from "@/lib/finnhub";
import { AnalysisTab } from "@/components/analysis-tab";
import Financials from "@/components/company/Financials"; // ← add this

interface CompanyPageProps {
  params: { ticker: string };
}

export default async function Page({ params }: CompanyPageProps) {
  const { ticker } = await params;

  let quote, profile;

  try {
    [quote, profile] = await Promise.all([
      getQuote(ticker),
      getCompanyProfile(ticker),
    ]);
  } catch (error) {
    console.error("Failed to fetch company data:", error);
    return (
      <div className="flex items-center justify-center h-full p-10">
        <p className="text-muted-foreground">
          Could not load data for <strong>{ticker}</strong>. Try again later.
        </p>
      </div>
    );
  }

  if (!quote || !profile) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <p className="text-muted-foreground">
          No data found for <strong>{ticker}</strong>.
        </p>
      </div>
    );
  }

  const isPositive = (quote.d ?? 0) >= 0;

  return (
    <div className="@container/main flex flex-1 flex-col px-4 pb-40 pt-4 md:px-6 md:pb-44 md:pt-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left Side */}
        <div className="flex flex-col gap-4">

          {/* Company Header */}
          <div className="flex items-center gap-4">
            {profile.logo && (
              <img src={profile.logo} alt={profile.name} className="w-12 h-12 rounded-lg" />
            )}
            <div>
              <h1 className="text-2xl font-bold">{profile.name ?? ticker}</h1>
              <p className="text-sm text-muted-foreground">
                {ticker} · {profile.exchange}
              </p>
            </div>
          </div>

          {/* Price + Change */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold">${quote.c?.toFixed(2)}</span>
            <Badge variant={isPositive ? "default" : "destructive"}>
              {isPositive ? "▲" : "▼"} {Math.abs(quote.d ?? 0)?.toFixed(2)} ({Math.abs(quote.dp ?? 0)?.toFixed(2)}%)
            </Badge>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex flex-col gap-4">
              {/* Chart */}
              <ChartLineInteractive ticker={ticker} />

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Open", value: `$${quote.o?.toFixed(2)}` },
                  { label: "Prev Close", value: `$${quote.pc?.toFixed(2)}` },
                  { label: "High", value: `$${quote.h?.toFixed(2)}` },
                  { label: "Low", value: `$${quote.l?.toFixed(2)}` },
                  {
                    label: "Market Cap",
                    value: profile.marketCapitalization
                      ? `$${(profile.marketCapitalization / 1000).toFixed(2)}B`
                      : "N/A",
                  },
                  {
                    label: "Employees",
                    value: profile.employeeTotal?.toLocaleString() ?? "N/A",
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="financials">
  <Financials ticker={ticker} />
</TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>Generate and download your detailed reports.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  You have 5 reports ready and available to export.
                </CardContent>
              </Card>
            </TabsContent>

           <TabsContent value="analysis">
  <AnalysisTab
    ticker={ticker}
    price={quote.c ?? 0}
    high={quote.h ?? 0}
    low={quote.l ?? 0}
    open={quote.o ?? 0}
    prevClose={quote.pc ?? 0}
  />
</TabsContent>

          </Tabs>
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