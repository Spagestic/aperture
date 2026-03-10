import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChartLineInteractive } from "./chart";
import { DashboardRightRail } from "../../(dashboard)/components/right-rail";
import { latestFilings, upcomingEvents, watchlist } from "../../(dashboard)/components/data";
import { getCandles, getQuote, getCompanyProfile } from "@/lib/finnhub";

interface CompanyPageProps {
  params: { ticker: string };
}

export default async function Page({ params }: CompanyPageProps) {
  const { ticker } = await params;

  const [quote, profile, candles] = await Promise.all([
    getQuote(ticker),
    getCompanyProfile(ticker),
    getCandles(ticker),
  ]);

  const isPositive = quote.d >= 0;

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
              {isPositive ? "▲" : "▼"} {Math.abs(quote.d)?.toFixed(2)} ({Math.abs(quote.dp)?.toFixed(2)}%)
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
              <ChartLineInteractive candles={candles} ticker={ticker} />

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Open", value: `$${quote.o?.toFixed(2)}` },
                  { label: "Prev Close", value: `$${quote.pc?.toFixed(2)}` },
                  { label: "High", value: `$${quote.h?.toFixed(2)}` },
                  { label: "Low", value: `$${quote.l?.toFixed(2)}` },
                  { label: "Market Cap", value: profile.marketCapitalization ? `$${(profile.marketCapitalization / 1000).toFixed(2)}B` : "N/A" },
                  { label: "Employees", value: profile.employeeTotal?.toLocaleString() ?? "N/A" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="financials">
              <Card>
                <CardHeader>
                  <CardTitle>Financials</CardTitle>
                  <CardDescription>Detailed financials coming soon.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Powered by Mistral OCR pipeline — coming next.
                </CardContent>
              </Card>
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
              <Card>
                <CardHeader>
                  <CardTitle>Analysis</CardTitle>
                  <CardDescription>AI-powered stock analysis.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Mistral AI analysis coming soon.
                </CardContent>
              </Card>
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