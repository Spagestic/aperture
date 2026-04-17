import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDate,
  formatMoney,
  getEvents,
  getEventBySlug,
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

async function resolveEvent(slug: string) {
  const directEvent = await getEventBySlug(slug);
  if (directEvent) {
    return directEvent;
  }

  const events = await getEvents();
  return events.find((item) => eventMatchesSlug(item, slug)) ?? null;
}

function marketCardTitle(market: Market, index: number) {
  return market.question || `Market ${index + 1}`;
}

function formatRate(value?: number | string) {
  const num = Number(value ?? Number.NaN);
  if (Number.isNaN(num)) return "N/A";
  return `${Math.round(num * 100)}%`;
}

function buildAnalyzePrompt(event: EventItem, markets: Market[]) {
  const eventUrl = event.slug
    ? `https://polymarket.com/event/${event.slug}`
    : "N/A";
  const summarizedMarkets = markets.slice(0, 5).map((market, index) => {
    const outcome = topOutcome(market);
    return {
      index: index + 1,
      id: market.id,
      question: marketCardTitle(market, index),
      topOutcome: outcome ? `${outcome.name} (${outcome.probability})` : "N/A",
      volume24h: formatMoney(market.volume24hr),
      liquidity: formatMoney(market.liquidity),
    };
  });

  return [
    `Analyze this Polymarket event and recommend the best markets/sides to invest in:`,
    `Event title: ${event.title || "Untitled event"}`,
    `Event URL: ${eventUrl}`,
    `Category: ${event.category || "General"}`,
    `Start date: ${formatDate(event.startDate)}`,
    `End date: ${formatDate(event.endDate)}`,
    `Event 24h volume: ${formatMoney(event.volume24hr)}`,
    `Event liquidity: ${formatMoney(event.liquidity)}`,
    `Total markets: ${markets.length}`,
    "",
    `Top markets snapshot:`,
    JSON.stringify(summarizedMarkets, null, 2),
  ].join("\n");
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await resolveEvent(slug);

  if (!event) {
    notFound();
  }

  const cover = event.image || event.icon;
  const markets = event.markets ?? [];
  const totalMarkets = markets.length;
  const totalLiquidity = formatMoney(event.liquidity);
  const totalVolume = formatMoney(event.volume24hr);
  const analyzePrompt = buildAnalyzePrompt(event, markets);
  const tags = event.tags ?? [];
  const eventStatus = [
    event.active ? "Active" : null,
    event.closed ? "Closed" : null,
    event.archived ? "Archived" : null,
    event.featured ? "Featured" : null,
    event.restricted ? "Restricted" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full items-center justify-between gap-2">
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/">Back to events</Link>
            </Button>
            <Button asChild className="shrink-0">
              <Link
                href={{
                  pathname: "/chat",
                  query: { prompt: analyzePrompt },
                }}
              >
                Analyze
              </Link>
            </Button>
          </div>
        </div>

        <section className="space-y-6">
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
                    <Badge variant="secondary">
                      {event.category || "General"}
                    </Badge>
                    {eventStatus.map((status) => (
                      <Badge key={status} variant="outline">
                        {status}
                      </Badge>
                    ))}
                    {tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag.id || tag.slug || tag.label}
                        variant="outline"
                      >
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
                      {formatDate(event.startDate)} —{" "}
                      {formatDate(event.endDate)}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 ">
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

          <div className="min-w-0 overflow-x-hidden">
            {markets.length > 0 ? (
              <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                {markets.map((market, index) => {
                  const outcome = topOutcome(market);
                  return (
                    <div
                      key={market.id}
                      className="min-w-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30 p-4"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium leading-snug">
                            {marketCardTitle(market, index)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {market.id}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Badge variant="secondary" className="shrink-0">
                            {outcome ? outcome.probability : "N/A"}
                          </Badge>
                          <Badge variant="outline" className="shrink-0">
                            {outcome ? outcome.name : "N/A"}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                        <SummaryRow
                          label="Volume"
                          value={formatMoney(
                            market.volume ?? market.volume24hr,
                          )}
                        />
                        <SummaryRow
                          label="Liquidity"
                          value={formatMoney(market.liquidity)}
                        />
                        <SummaryRow
                          label="Start date"
                          value={formatDate(market.startDate)}
                        />
                        <SummaryRow
                          label="End date"
                          value={formatDate(market.endDate)}
                        />
                        <SummaryRow
                          label="Last trade"
                          value={formatRate(market.lastTradePrice)}
                        />
                        <SummaryRow
                          label="Best bid / ask"
                          value={`${formatRate(market.bestBid)} / ${formatRate(market.bestAsk)}`}
                        />
                        <SummaryRow
                          label="Spread"
                          value={formatRate(market.spread)}
                        />
                        <SummaryRow
                          label="Status"
                          value={
                            market.active
                              ? market.closed
                                ? "Active · Closed"
                                : "Active"
                              : "Inactive"
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No markets available.
              </p>
            )}
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
      <span className="min-w-0 wrap-break-word text-right font-medium">
        {value}
      </span>
    </div>
  );
}
