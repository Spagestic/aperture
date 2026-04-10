import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  formatDate,
  formatMoney,
  topOutcome,
  type EventItem,
} from "@/lib/polymarket-events";

export function PolymarketEventCard({ event }: { event: EventItem }) {
  const leadMarket = event.markets?.[0];
  const lead = topOutcome(leadMarket);
  const cover = event.image || event.icon;
  const slug = event.slug || event.id;

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/event/${slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="flex gap-3 p-3 sm:gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-24">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={event.title || "Polymarket event image"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-primary/40 via-primary/20 to-emerald-400/10" />
            )}
          </div>

          <CardHeader className="flex min-w-0 flex-1 flex-row items-start justify-between gap-3 p-0">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="shrink-0">
                  {event.category || "General"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {event.markets?.length ?? 0} markets
                </span>
              </div>

              <h2 className="line-clamp-2 text-base font-semibold leading-snug sm:text-lg">
                {event.title || "Untitled event"}
              </h2>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </p>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {formatMoney(event.volume24hr)} Vol. |{" "}
                {formatMoney(event.liquidity)} Liquidity
              </p>
            </div>
          </CardHeader>
        </div>

        <CardContent className="space-y-4 pb-3 pt-0">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Lead market
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-foreground">
                {leadMarket?.question || "No market data"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Top outcome
              </p>
              <p className="mt-1 text-sm leading-snug text-foreground">
                {lead ? `${lead.name} · ${lead.probability}` : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
