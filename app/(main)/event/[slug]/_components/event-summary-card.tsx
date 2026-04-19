import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDate,
  formatMoney,
  type EventItem,
} from "@/lib/polymarket-events";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function EventSummaryCard({
  event,
  totalVolume,
  totalLiquidity,
}: {
  event: EventItem;
  totalVolume: string;
  totalLiquidity: string;
}) {
  const cover = event.image || event.icon;
  const tags = event.tags ?? [];
  const eventStatus = [
    event.active ? "Active" : null,
    event.closed ? "Closed" : null,
    event.archived ? "Archived" : null,
    event.featured ? "Featured" : null,
    event.restricted ? "Restricted" : null,
  ].filter(Boolean) as string[];

  return (
    <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
          <Card className="self-start overflow-hidden border-border/60 bg-card/80 p-0 shadow-sm backdrop-blur">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={event.title || "Polymarket event cover"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-end bg-linear-to-br from-primary/35 via-primary/15 to-emerald-400/10 p-5">
                <Badge variant="secondary" className="w-fit">
                  {event.category || "General"}
                </Badge>
              </div>
            )}
          </Card>
          <div className="min-w-0 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{event.category || "General"}</Badge>
              {eventStatus.map((status) => (
                <Badge key={status} variant="outline">
                  {status}
                </Badge>
              ))}
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id || tag.slug || tag.label} variant="outline">
                  {tag.label || tag.slug || "Tag"}
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
                {event.title || "Untitled event"}
              </h1>
              {event.subtitle ? (
                <p className="text-sm text-muted-foreground sm:text-base">
                  {event.subtitle}
                </p>
              ) : null}
              <p className="text-sm text-muted-foreground sm:text-base">
                {formatDate(event.startDate)} — {formatDate(event.endDate)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="24h volume" value={totalVolume} />
              <Stat label="Liquidity" value={totalLiquidity} />
              <Stat
                label="Open interest"
                value={formatMoney(event.openInterest)}
              />
            </div>
          </div>
        </div>
        {event.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {event.description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
