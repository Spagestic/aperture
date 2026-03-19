import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import type { FilingItem } from "./data";

type LatestFilingsSectionProps = {
  latestFilings: FilingItem[];
};

function companySlugFromTicker(ticker: string) {
  return ticker.toLowerCase().replace(/\./g, "-");
}

function FilingRow({ item }: { item: FilingItem }) {
  return (
    <Link
      href={`/company/${companySlugFromTicker(item.ticker)}`}
      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium leading-tight text-white">
          {item.company}
        </p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[#9ca3af]">
          {item.ticker} · {item.type}
        </p>
      </div>
      <p className="ml-3 shrink-0 text-right text-xs font-medium leading-tight text-[#9ca3af]">
        {item.time}
      </p>
    </Link>
  );
}

export function LatestFilingsSection({
  latestFilings,
}: LatestFilingsSectionProps) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-md font-medium">Latest filings</h2>
          <span>›</span>
        </div>
      </div>

      <Card className="overflow-hidden rounded-lg border border-white/10 bg-[#171717] p-0 shadow-none">
        <CardContent className="p-0">
          {latestFilings.map((item) => (
            <FilingRow key={`${item.ticker}-${item.type}`} item={item} />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
