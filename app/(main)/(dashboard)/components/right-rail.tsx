import { CalendarDays, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { ChangePill } from "./change-pill";
import type { FilingItem, UpcomingEvent, WatchlistItem } from "./data";

type DashboardRightRailProps = {
  watchlist: WatchlistItem[];
  upcomingEvents: UpcomingEvent[];
  latestFilings: FilingItem[];
};

export function DashboardRightRail({
  watchlist,
  upcomingEvents,
  latestFilings,
}: DashboardRightRailProps) {
  return (
    <aside className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create watchlist</CardTitle>
          <CardDescription>
            Track your highest-priority companies in one place.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {watchlist.map((item, index) => (
            <div key={item.ticker}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.company}</p>
                  <p className="text-xs text-muted-foreground">{item.ticker}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium">{item.price}</p>
                  <div className="mt-1">
                    <ChangePill tone={item.tone} value={item.change} />
                  </div>
                </div>
              </div>
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
