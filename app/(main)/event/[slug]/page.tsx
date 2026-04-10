import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  formatDate,
  formatMoney,
  getEvents,
  parseArray,
  topOutcome,
  type EventItem,
  type Market,
} from "@/lib/polymarket-events";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

function normalizeSlug(value?: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function eventMatchesSlug(event: EventItem, slug: string) {
  const candidates = [event.slug, event.id, event.title];
  return candidates.some((candidate) => normalizeSlug(candidate) === slug);
}

function marketCardTitle(market: Market, index: number) {
  return market.question || `Market ${index + 1}`;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const events = await getEvents();
  const event = events.find((item) => eventMatchesSlug(item, slug));

  if (!event) {
    notFound();
  }

  const cover = event.image || event.icon;
  const markets = event.markets ?? [];
  const primaryMarket = markets[0];
  const leadOutcome = topOutcome(primaryMarket);
  const totalMarkets = markets.length;
  const totalLiquidity = formatMoney(event.liquidity);
  const totalVolume = formatMoney(event.volume24hr);
  const categories = Array.from(
    new Set(parseArray(event.category ? [event.category] : [])),
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/">Back to events</Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            {totalMarkets} market{totalMarkets === 1 ? "" : "s"} · {totalVolume}
            24h volume · {totalLiquidity} liquidity
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <Card className="overflow-hidden border-border/60 bg-card/80 shadow-sm backdrop-blur">
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
                  <div className="max-w-2xl space-y-3">
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
                  <Badge variant="secondary">
                    {event.category || "General"}
                  </Badge>
                  {categories.map((category) => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                    {event.title || "Untitled event"}
                  </h1>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {formatDate(event.startDate)} — {formatDate(event.endDate)}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat label="24h volume" value={totalVolume} />
                  <Stat label="Liquidity" value={totalLiquidity} />
                  <Stat label="Markets" value={`${totalMarkets}`} />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <InfoPanel
                  title="Primary market"
                  body={
                    primaryMarket?.question ||
                    "No market data available for this event."
                  }
                />
                <InfoPanel
                  title="Top outcome"
                  body={
                    leadOutcome
                      ? `${leadOutcome.name} · ${leadOutcome.probability}`
                      : "N/A"
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Event summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  This page surfaces the live Polymarket event detail view for
                  the selected slug. It highlights the key market, summary
                  metrics, and the full list of markets attached to the event.
                </p>
                <div className="grid gap-3 rounded-lg border border-border/60 bg-muted/40 p-4 text-foreground">
                  <SummaryRow label="Event ID" value={event.id} />
                  <SummaryRow
                    label="Slug"
                    value={event.slug || normalizeSlug(event.title)}
                  />
                  <SummaryRow
                    label="Category"
                    value={event.category || "General"}
                  />
                  <SummaryRow
                    label="Start date"
                    value={formatDate(event.startDate)}
                  />
                  <SummaryRow
                    label="End date"
                    value={formatDate(event.endDate)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Markets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {markets.length > 0 ? (
                  markets.map((market, index) => {
                    const outcome = topOutcome(market);
                    return (
                      <div
                        key={market.id}
                        className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium leading-snug">
                              {marketCardTitle(market, index)}
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
                            <span className="text-foreground">
                              {outcome.name}
                            </span>
                          </p>
                        ) : null}

                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                          <SummaryRow
                            label="24h volume"
                            value={formatMoney(market.volume24hr)}
                          />
                          <SummaryRow
                            label="Liquidity"
                            value={formatMoney(market.liquidity)}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No markets available.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
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

function InfoPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{body}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
