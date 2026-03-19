import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { UpcomingEvent } from "./data";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

type UpcomingEventsSectionProps = {
  upcomingEvents: UpcomingEvent[];
};

function companySlugFromTicker(ticker: string) {
  return ticker.toLowerCase().replace(/\./g, "-");
}

function tickerFromEventTitle(title: string) {
  return title.split(" ")[0];
}

function UpcomingEventRow({ item }: { item: UpcomingEvent }) {
  const ticker = tickerFromEventTitle(item.title);

  return (
    <Link
      href={`/company/${companySlugFromTicker(ticker)}`}
      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium leading-tight text-white">
          {item.title}
        </p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[#9ca3af]">
          {item.meta}
        </p>
      </div>

      <Badge
        variant="outline"
        className="ml-3 shrink-0 rounded-full border-white/10 bg-white/5 text-xs font-medium text-white"
      >
        {item.day}
      </Badge>
    </Link>
  );
}

export function UpcomingEventsSection({
  upcomingEvents,
}: UpcomingEventsSectionProps) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size={"sm"} variant="ghost" className="" asChild>
            <Link href={"#"}>
              Upcoming
              <ChevronRight className="-ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-lg border border-white/10 bg-[#171717] p-0 shadow-none">
        <CardContent className="p-0">
          {upcomingEvents.map((item) => (
            <UpcomingEventRow key={`${item.day}-${item.title}`} item={item} />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
