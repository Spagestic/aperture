import Link from "next/link";
import { CalendarDays, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { FilingItem, UpcomingEvent, WatchlistItem } from "./data";

type DashboardRightRailProps = {
  watchlist: WatchlistItem[];
  upcomingEvents: UpcomingEvent[];
  latestFilings: FilingItem[];
};

function companySlugFromTicker(ticker: string) {
  return ticker.toLowerCase().replace(/\./g, "-");
}

export function RightRail({
  watchlist,
  upcomingEvents,
  latestFilings,
}: DashboardRightRailProps) {
  return (
    <aside className="space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-md font-medium">Watchlist</h2>
          <span className="">›</span>
        </div>
      </div>
      <Card className="rounded-lg border border-white/10 bg-[#171717] p-0 shadow-none overflow-hidden">
        <CardContent className="p-0">
          {watchlist.map((item) => (
            <div key={item.ticker}>
              <Link
                href={`/company/${companySlugFromTicker(item.ticker)}`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2a2a2a]">
                    {/* <img
                src={`https://logo.clearbit.com/${item.domain}`}
                alt={`${item.company} logo`}
                className="h-full w-full object-cover"
              /> */}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium leading-tight text-white">
                      {item.company}
                    </div>
                    <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[#9ca3af]">
                      {item.ticker} · NASDAQ
                    </div>
                  </div>
                </div>

                <div className="ml-3 shrink-0 text-right">
                  <p className="text-sm font-medium leading-tight">
                    {item.price}
                  </p>
                  <p
                    className={`mt-0.5 text-xs   font-medium leading-tight ${
                      item.tone === "up" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {item.change}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <CardTitle>Upcoming</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {upcomingEvents.map((item, index) => (
            <div key={`${item.day}-${item.title}`}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.meta}</p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {item.day}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <CardTitle>Latest filings</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {latestFilings.map((item, index) => (
            <div key={`${item.ticker}-${item.type}`}>
              {index > 0 && <Separator className="mb-4" />}
              <div>
                <p className="text-sm font-medium">
                  {item.company}{" "}
                  <span className="text-muted-foreground">· {item.ticker}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.type} · {item.time}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
