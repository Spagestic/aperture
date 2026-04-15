import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  formatDate,
  formatMoney,
  topOutcome,
  type Market,
  type PolymarketEvent,
} from "@/lib/polymarket-events";
import { marketTitle, normalizeSlug } from "./helpers";

type EventDetailsLayoutProps = {
  event: PolymarketEvent;
  slug: string;
  categories: string[];
  eventMarkets: Market[];
};

export function EventDetailsLayout({
  event,
  slug,
  categories,
  eventMarkets,
}: EventDetailsLayoutProps) {
  const cover = event.image || event.icon;
  const topEventOutcome = eventMarkets[0] ? topOutcome(eventMarkets[0]) : null;
  const liquidity = formatMoney(event.liquidity);
  const volume = formatMoney(event.volume ?? event.volume24hr);
  const openInterest = formatMoney(event.openInterest);
  const tags = event.tags ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm backdrop-blur">
        <div className="aspect-16/8 w-full bg-muted sm:aspect-16/6">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={event.title || "Polymarket event cover"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-end bg-linear-to-br from-primary/35 via-primary/15 to-emerald-400/10 p-6">
              <div className="max-w-3xl space-y-3">
                <Badge variant="secondary" className="w-fit">
                  {event.category || "General"}
                </Badge>
                <p className="text-2xl font-semibold tracking-tight sm:text-4xl">
                  {event.title || "Untitled event"}
                </p>
              </div>
            </div>
          )}
        </div>

        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{event.category || "General"}</Badge>
              {event.active ? <Badge>Active</Badge> : null}
              {event.closed ? <Badge variant="outline">Closed</Badge> : null}
              {event.archived ? (
                <Badge variant="outline">Archived</Badge>
              ) : null}
              {event.featured ? (
                <Badge variant="outline">Featured</Badge>
              ) : null}
              {categories.map((category) => (
                <Badge key={category} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                {event.title || "Untitled event"}
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                {formatDate(event.startDate)} — {formatDate(event.endDate)}
              </p>
              {event.subtitle ? (
                <p className="text-sm text-muted-foreground">
                  {event.subtitle}
                </p>
              ) : null}
            </div>

            {event.description ? (
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {event.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Liquidity" value={liquidity} />
            <Stat label="Volume" value={volume} />
            <Stat label="Open interest" value={openInterest} />
            <Stat label="Markets" value={`${eventMarkets.length}`} />
          </div>

          {topEventOutcome ? (
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Top outcome
              </p>
              <p className="mt-2 text-sm text-foreground">
                {topEventOutcome.name} · {topEventOutcome.probability}
              </p>
            </div>
          ) : null}

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <InfoPanel label="Event ID" value={event.id} />
            <InfoPanel
              label="Slug"
              value={event.slug || slug || normalizeSlug(event.title)}
            />
            <InfoPanel
              label="Resolution source"
              value={event.resolutionSource || "N/A"}
            />
            <InfoPanel
              label="Last updated"
              value={formatDate(event.updatedAt || event.creationDate)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
            <CardDescription>
              Jump back to the source event or inspect the extracted slug.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full" variant="outline">
              <Link
                href={`https://polymarket.com/event/${encodeURIComponent(slug || event.slug || normalizeSlug(event.title))}`}
                target="_blank"
                rel="noreferrer"
              >
                Open Polymarket event
              </Link>
            </Button>
            <div className="rounded-lg border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Parsed slug</p>
              <p className="mt-1 break-all">{slug || event.slug || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Markets</CardTitle>
            <CardDescription>
              The event’s attached markets and their leading outcomes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {eventMarkets.length > 0 ? (
              eventMarkets.map((market, index) => {
                const outcome = topOutcome(market);
                return (
                  <div
                    key={market.id}
                    className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">
                          {marketTitle(market, index)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {market.id}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {outcome ? outcome.probability : "N/A"}
                      </Badge>
                    </div>

                    {outcome ? (
                      <p className="text-sm text-muted-foreground">
                        Leading outcome:{" "}
                        <span className="text-foreground">{outcome.name}</span>
                      </p>
                    ) : null}

                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <Row
                        label="24h volume"
                        value={formatMoney(market.volume24hr)}
                      />
                      <Row
                        label="Liquidity"
                        value={formatMoney(market.liquidity)}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No markets are attached to this event.
              </p>
            )}
          </CardContent>
        </Card>

        {tags.length > 0 ? (
          <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={tag.id || tag.slug || tag.label || index}
                  variant="outline"
                >
                  {tag.label || tag.slug || "Tag"}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

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

function InfoPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 wrap-break-word text-sm leading-relaxed text-foreground">
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background/60 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
