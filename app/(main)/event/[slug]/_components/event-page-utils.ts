import {
  formatDate,
  formatMoney,
  topOutcome,
  type EventItem,
  type Market,
} from "@/lib/polymarket-events";

export function normalizeSlug(value?: string) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function eventMatchesSlug(event: EventItem, slug: string) {
  const candidates = [event.slug, event.id, event.title];
  return candidates.some((candidate) => normalizeSlug(candidate) === slug);
}

export async function resolveEvent(slug: string) {
  const { getEventBySlug, getEvents } = await import("@/lib/polymarket-events");
  const directEvent = await getEventBySlug(slug);
  if (directEvent) {
    return directEvent;
  }

  const events = await getEvents();
  return events.find((item) => eventMatchesSlug(item, slug)) ?? null;
}

export function marketCardTitle(market: Market, index: number) {
  return market.question || `Market ${index + 1}`;
}

export function formatRate(value?: number | string) {
  const num = Number(value ?? Number.NaN);
  if (Number.isNaN(num)) return "N/A";
  return `${Math.round(num * 100)}%`;
}

export function buildAnalyzePrompt(event: EventItem, markets: Market[]) {
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
