import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import type { WatchlistItem } from "./data";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

type WatchlistSectionProps = {
  watchlist: WatchlistItem[];
};

function WatchlistRow({ item }: { item: WatchlistItem }) {
  return (
    <Link
      href={`/company/${item.ticker}`}
      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted"
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2a2a2a]">
           <img
            src={`https://logo.clearbit.com/${item.domain}`}
            alt={`${item.company} logo`}
            className="h-full w-full object-cover"
          /> 
        </div>*/}

        <div className="min-w-0">
          <div className="truncate text-sm font-medium leading-tight text-white">
            {item.company}
          </div>
          <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[#9ca3af]">
            {item.ticker}
            {/* · HKEX */}
          </div>
        </div>
      </div>

      <div className="ml-3 shrink-0 text-right">
        <p className="text-sm font-medium leading-tight">{item.price}</p>
        <p
          className={`mt-0.5 text-xs font-medium leading-tight ${
            item.tone === "up" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {item.change}
        </p>
      </div>
    </Link>
  );
}

export function WatchlistSection({ watchlist }: WatchlistSectionProps) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size={"sm"} variant="ghost" className="" asChild>
            <Link href={"#"}>
              Watchlist
              <ChevronRight className="-ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-lg border border-white/10 bg-[#171717] p-0 shadow-none">
        <CardContent className="p-0">
          {watchlist.map((item) => (
            <div key={item.ticker}>
              <WatchlistRow item={item} />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
