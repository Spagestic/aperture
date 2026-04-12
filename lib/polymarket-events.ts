export type Market = {
  id: string;
  question?: string;
  outcomes?: string[] | string;
  outcomePrices?: string[] | string;
  volume24hr?: number | string;
  liquidity?: number | string;
};

export type EventItem = {
  id: string;
  title?: string;
  slug?: string;
  category?: string;
  volume24hr?: number | string;
  liquidity?: number | string;
  startDate?: string;
  endDate?: string;
  image?: string;
  icon?: string;
  markets?: Market[];
};

export type TopOutcome = {
  name: string;
  probability: string;
};

function buildGammaEventFeedUrls(offset: number, limit: number): string[] {
  const o = String(Math.max(0, offset));
  const l = String(Math.max(1, limit));
  return [
    `https://gamma-api.polymarket.com/events?active=true&closed=false&archived=false&order=volume_24hr&ascending=false&limit=${l}&offset=${o}`,
    `https://gamma-api.polymarket.com/events?active=true&closed=false&archived=false&order=volume24hr&ascending=false&limit=${l}&offset=${o}`,
    `https://gamma-api.polymarket.com/events?active=true&closed=false&archived=false&limit=${l}&offset=${o}`,
  ];
}

const DEFAULT_EVENTS_LIMIT = 24;

export async function getEventsPage(
  params: { offset: number; limit: number },
  init?: RequestInit,
): Promise<EventItem[]> {
  const { offset, limit } = params;
  const urls = buildGammaEventFeedUrls(offset, limit);

  for (const url of urls) {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
      ...init,
    });

    if (res.ok) {
      return res.json();
    }

    if (res.status !== 422) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch events from Polymarket (${res.status}): ${body || res.statusText}`,
      );
    }
  }

  return [];
}

export async function getEvents(): Promise<EventItem[]> {
  return getEventsPage({ offset: 0, limit: DEFAULT_EVENTS_LIMIT });
}

export function buildEventSearchText(event: EventItem) {
  const marketText = (event.markets ?? [])
    .flatMap((market) => [market.question, market.id])
    .filter(Boolean)
    .join(" ");

  return [event.title, event.category, event.slug, marketText]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function formatMoney(value?: string | number) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: num >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(num);
}

export function formatDate(value?: string) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function parseArray(value?: string[] | string) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function topOutcome(market?: Market): TopOutcome | null {
  if (!market) return null;
  const outcomes = parseArray(market.outcomes);
  const prices = parseArray(market.outcomePrices)
    .map((v) => Number(v))
    .filter((v) => !Number.isNaN(v));

  if (!outcomes.length || !prices.length) return null;

  let bestIndex = 0;
  for (let i = 1; i < Math.min(outcomes.length, prices.length); i++) {
    if (prices[i] > prices[bestIndex]) bestIndex = i;
  }

  return {
    name: outcomes[bestIndex],
    probability: `${Math.round(prices[bestIndex] * 100)}%`,
  };
}
